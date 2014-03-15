var express = require('express');
var app = express();
app.configure(function () {
	app.use(express.compress());
    app.use("/", express.static(__dirname));

    app.use(function(req, res, next){
  		res.status(404).sendfile('404.html');
	});
});
app.listen(process.env.PORT || 4000); //the port you want to use

