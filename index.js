var http = require("http");

var myexpress = function(){
	var express = function(req, res){
		res.statusCode = 404;
		res.end();
	}
	express.listen = function(port, done){
		return http.createServer(express).listen(port, done);
	}
	return express;
}

module.exports = myexpress;