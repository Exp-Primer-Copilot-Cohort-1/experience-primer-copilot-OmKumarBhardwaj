// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { randomBytes } = require('crypto');

// Create express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Create route for getting comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create route for posting comments
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;
    // Get comments array
    const comments = commentsByPostId[req.params.id] || [];
    // Add new comment to array
    comments.push({ id: commentId, content, status: 'pending' });
    // Update comments array
    commentsByPostId[req.params.id] = comments;
    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: { id: commentId, content, postId: req.params.id, status: 'pending' }
    });
    res.status(201).send(comments);
});

// Create route for receiving events from event bus
app.post('/events', async (req, res) => {
    console.log('Received event', req.body.type);
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { id, postId, status, content } = data;
        // Get comments array
        const comments = commentsByPostId[postId];
        // Find comment
        const comment = comments.find(comment => comment.id === id);
        // Update comment
        comment.status = status;
        // Emit event to event bus
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: { id, postId, status, content }
        });
    }
    res.send({});
});

// Listen for requests
app.listen(4001, () => {
    console.log('Listening on port 4001');
});