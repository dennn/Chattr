// Load any libraries that we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var passport = require('passport');
var RedisStore = require('connect-redis')(express);
var redis = require('redis').createClient();

require('./config/passport')(passport);

// Configuration

app.configure(function () {
/*)	app.use(function(req, res, next) {
		var extension = req.path.split('.').pop();
		if (extension == "/" || extension == "html") {
			res.setHeader("Content-Type", "application/xhtml+xml");
		}
		next();
 	});*/
	app.use(express.cookieParser());
	app.use(express.bodyParser());

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/assets'));

    app.use(express.session({ 
    	secret : "ecca0f2e-84de-4b3d-9f5f-f2e2a8df7116",
    	store : new RedisStore({
    		host : 'localhost',
    		port : 6379,
            client: redis
    	}),
    	cookie : {
    		maxAge : 604800
    	}
    }));
    app.use(passport.initialize());
    app.use(passport.session());
/*    	res.setHeader("Content-Type", "application/xhtml+xml");
  		res.status(404).sendfile('404.html');
	});*/
});

require('./app/routes.js')(app, passport);

app.listen(port); //the port you want to use
