// Load any libraries that we need
var express = require('express');
var passport = require('passport');
var RedisStore = require('connect-redis')(express);
var redis = require('redis')
var mailchimpAPI = require('mailchimp-api/mailchimp');
var http = require('http')
var url = require('url')

var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 8080;
var socket = require('socket.io').listen(server);
socket.set('log level', 1);

/* Mailchimp email subscription service API library */

mc = new mailchimpAPI.Mailchimp('4d80db6ce5a58a042bb93766436596d5-us8')

/* Setup Redis */

var redisClient;

if (process.env.NODE_ENV === "production") {
    var redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
    redisClient.auth(redisURL.auth.split(":")[1]);
} else {
    redisClient = redis.createClient(6379, "localhost", {no_ready_check: true});
}

/* Passport.js authentication library */

require('./config/passport')(passport, redisClient);

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
            client: redisClient
    	})
    }));
    app.use(passport.initialize());
    app.use(passport.session());
});

/* Application route handling */
require('./app/routes.js')(app, passport, redisClient);

/* Socket.io WebRTC stuff */
require('./app/socket.js')(app, socket);

/* Start listening for requests */
server.listen(port); 
