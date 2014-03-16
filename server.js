var express = require('express');
var app = express();
app.configure(function () {
	app.use(function(req, res, next) {
		var extension = req.path.split('.').pop();
		if (extension == "/" || extension == "html") {
			res.setHeader("Content-Type", "application/xhtml+xml");
		}
		next();
 	});
    app.use("/", express.static(__dirname));

    app.use(function(req, res, next){
    	res.setHeader("Content-Type", "application/xhtml+xml");
  		res.status(404).sendfile('404.html');
	});
});
app.listen(process.env.PORT || 4000); //the port you want to use

