// Load any libraries that we need
var express = require('express');
var passport = require('passport');
var RedisStore = require('connect-redis')(express);
var redis = require('redis').createClient();
var mailchimpAPI = require('mailchimp-api/mailchimp');
var http = require('http')

var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 8080;
var socket = require('socket.io').listen(server);
socket.set('log level', 1);

/* Mailchimp email subscription service API library */

mc = new mailchimpAPI.Mailchimp('4d80db6ce5a58a042bb93766436596d5-us8')

/* Passport.js authentication library */

require('./config/passport')(passport, redis);

// Configuration

app.configure(function () {
	app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));

    app.use(express.session({ 
    	secret : "ecca0f2e-84de-4b3d-9f5f-f2e2a8df7116",
    	store : new RedisStore({
    		host : 'localhost',
    		port : 6379,
            client: redis
    	})
    }));
    app.use(passport.initialize());
    app.use(passport.session());
});

/* Application route handling */
require('./app/routes.js')(app, passport, redis);

/* Socket.io WebRTC stuff */
require('./app/socket.js')(app, socket);

/* Start listening for requests */
server.listen(port); 
