module.exports = function(app, passport) {

	/* Home page */
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/conversation', isLoggedIn, function(req, res) {
		res.render('conversation.ejs');
	});


	/* Facebook authentication */
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email'}));

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/conversation',
			failureRedirect : '/'
		}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	})
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
