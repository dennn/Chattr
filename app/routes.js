module.exports = function(app, passport, client) {

	// Output valid XHTML5
	app.use(function(req, res, next) {
		var extension = req.path.split('.').pop();
		if (extension == "/" || extension == "html") {
			res.setHeader("Content-Type", "application/xhtml+xml");
		}
		next();
 	});

	// Home page 
	app.get('/', function(req, res) {
		res.render('index.ejs', {
			loggedIn : req.isAuthenticated()
		});
	});

	// New conversation page
	app.get('/conversation', isLoggedIn, function(req, res) {
		res.redirect('/conversation/' + randomValueHex(6));
	});

	// Conversation with a chat room id
	app.get('/conversation/:id', isLoggedIn, function(req, res) {
		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		res.render('conversation.ejs', {
			username : req.user.name,
			userID : req.user.id,
			newRoom : req.params.id,
			url : fullUrl 
		});
	});

	// Facebook authentication
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email'}));

	// Facebook callback
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/conversation',
			failureRedirect : '/'
		}));

	// User wants to log out
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	})

	// User wishes to subscribe to the email newsletter
	app.get('/email', function(req, res) {
		var emailAddress = req.query.email;

		mc.lists.subscribe({id : 'ab9b5fafa6', email: {email: emailAddress}}, function(data) {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({ success : true }));
		},
		function(error) {
			console.log(error);
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({ success : false }));
		});
	})

	// User is using a browser that doesn't have WebRTC
	app.get('/no-web-rtc', function(req, res) {
		res.render('no-web-rtc.ejs');
	})

	// Get information about a user
	app.get('/user/:id', isLoggedIn, function(req, res) {
		client.HGETALL(("users:" + req.params.id), function(err, obj) {
			if (err) {
				console.log(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(obj));
			}
		});
	});

	// Catch all route that returns a 404 page
	app.use(function(req, res) {
		res.setHeader("Content-Type", "application/xhtml+xml");
  		res.status(404);
  		res.render('404.ejs');
	});	
};

var crypto = require('crypto');

// Generate a random room ID
function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

// A function to make sure the user is logged in
function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
