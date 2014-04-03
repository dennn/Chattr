var FacebookStrategy = require("passport-facebook").Strategy;

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
  		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
  		done(null, user);
	});

	passport.use(new FacebookStrategy({
		clientID : '259302307583669',
		clientSecret : 'd34df6f4eaa294550f1c752ddce2e981',
		callbackURL : 'http://localhost:8080/auth/facebook/callback'
	},

	function(token, refreshToken, profile, done) {
		done(null, profile);
	}
	));
};