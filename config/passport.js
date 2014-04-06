var FacebookStrategy = require("passport-facebook").Strategy;

module.exports = function(passport, redis) {

	passport.serializeUser(function(user, done) {
  		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		var userString = "users:" + user.id;
		redis.hgetall(userString, function(err, user) {
			if (err) {
				console.log(err);
			} else {
				done(null, user);
			}
  		});
	});

	passport.use(new FacebookStrategy({
		clientID : '259302307583669',
		clientSecret : 'd34df6f4eaa294550f1c752ddce2e981',
		if (process.env.NODE_ENV === "production") {
			callbackURL : 'http://http://young-springs-6599.herokuapp.com/auth/facebook/callback',
		} else {
			callbackURL : 'http://localhost:8080/auth/facebook/callback',
		}
		profileFields : ['id', 'displayName', 'gender', 'photos', 'link']
	},

	function(token, refreshToken, profile, done) {
		process.nextTick(function() {
			var userString = "users:" + profile.id;
			redis.hgetall(userString, function(err, user) {
				if (err) {
					console.log(err);
				} 

				// User exists, return the user object
				if (!err && user != null) {
					done(null, user);
				} else {
					// User doesn't exist, create a new user in the database
					var newUser = {
						id : profile.id,
						name : profile.displayName,
						gender : profile.gender,
						url : profile.profileUrl,
						photo : profile.photos[0].value 
					};
					redis.hmset(userString, newUser, function(err) {
						if (err) {
							console.log(err);
						} else {
							console.log("Saving new user");
							done(null, newUser);
						}
					});
				}
			});
		});
	}
	));
};