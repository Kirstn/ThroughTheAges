// dependencies
var fs = require('fs');
var http = require('http');
var express = require('express');
var routes = require('./routes/routes');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// global config
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

app.set('port', process.env.PORT || 1337);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.favicon());
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// env config
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//score config
var Score = require('./models/score');

//mongoose
mongoose.connect("mongodb://localhost/usersDB");

// routes
require('./routes/routes')(app);

//socket.io
var playerCount = 0;
var id = 0;


io.on("connection", function(socket) {
    playerCount++;
    id++;

    setTimeout(function () {
        socket.emit('connected', { playerId: id });
        io.emit('count', { playerCount: playerCount });
    }, 1500);

    //listening for disconnect
    socket.on('disconnect', function(){
        playerCount--;
       io.emit('count', {playerCount: playerCount });
    });

    //listening for update
    socket.on('update', function (data) {
        socket.broadcast.emit('updated', data);
    });

    socket.on('nextLevel', function (data){
       socket.broadcast.emit('nLevel', data);
    });

    //listening for chat message
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    //listening for scores
    socket.on("score", function (score) {
        // we received a score from the browser
        var s = new Score({
            username: score.username,
            level: score.level,
            score: score.score
        });

        s.save(function(err, data){
            if(err) console.log(err);
        });
    });
});

// run server
server.listen(app.get('port'), function(){
    console.log(("Express server listening on port " + app.get('port')))
});
