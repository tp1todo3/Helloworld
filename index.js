var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');

var io = require('socket.io')(http);
var mongoose = require('mongoose');
var users = {};
mongoose.Promise = require('bluebird');
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/chaimaTetrisDb');

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// if our user.js file is at app/models/user.js
var User1 = require('./public/models/user');


var User = function()
{
	this.nickname = '';
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', function(req, res, next) {
    console.log('I received a GET request');

    User1.find().exec(function(err, data) {
        console.log('aaa');
        if(err) {
            return next(err);
        }
        res.json(data);
    });
});
app.post('/api', function(req, res, next) {

    var chris = new User1({
        username: req.body.nickname
    });

    chris.save(function(err, data) {
        if(err) {
            return next(err);
        }
        console.log('User saved successfully!');
        res.status(201).json(data);
    });
});

app.get('/',function(req,res)
{
	res.sendFile(__dirname+'/index.html');
});

app.get('*', function(req, res) {
	res.sendFile(__dirname+'/index.html');
});


io.on('connection',function(socket)
{
	socket.on('user entered',function(nickname)
	{
		var user = new User();
		user.nickname = nickname;
		users[user.nickname] = user;
		console.log('User: '+user.nickname+' entered.');
	});
	socket.on('tetrimino', function(tetrimino)
	{
    io.emit('tetrimino', tetrimino);
		console.log('tetrimino generated');
  });
});

http.listen(3000,function()
{
	console.log('listen on : 3000');
});
