// Create web server  

// Import module 
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');

// Create application 
var app = express();

// Set up body-parser 
app.use(bodyParser.urlencoded({ extended: false }));

// Set up cookie-parser 
app.use(cookieParser());

// Set up cookie-session 
app.use(session({secret: 'todotopsecret'}));

// Set up ejs 
app.set('view engine', 'ejs');

// Set up public directory 
app.use(express.static('public'));

// Create array 
var comments = [];

// Use middleware 
app.use(function(req, res, next) {
    if (typeof(req.session.comments) == 'undefined') {
        req.session.comments = [];
    }
    next();
});

// Create route 
app.get('/comment', function(req, res) {
    res.render('comment', {comments: req.session.comments});
});

app.post('/comment', function(req, res) {
    if (req.body.comment != '') {
        req.session.comments.push(req.body.comment);
    }
    res.redirect('/comment');
});

app.get('/delete', function(req, res) {
    req.session.comments = [];
    res.redirect('/comment');
});

// Start server 
app.listen(8080);