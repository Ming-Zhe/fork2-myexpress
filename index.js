var http = require("http");

var myexpress = function(){
  
  var app = function(req, res, next){
    // if(req.url == "/foo"){
    //   res.statusCode = 404;
    //   res.end();
    // }
    app.handle(req, res, next);
  }

  app.stack = [];
  app.use = function(fn){
  	this.stack.push(fn);
  }

  app.handle = function(req, res, out){
  	var stack = this.stack;
  	var index = 0;

  	function next(err){
      var layer = stack[index++];
      if (!layer){
      	if (out) 
      		return out(err);
      	if (err){
      		
      		res.statusCode = 500;
      		res.setHeader = ('Content-Type', 'text/html');
      		res.end = ('500 - Error');
      	} else {
      		
      		res.statusCode = 404;
      		res.setHeader = ('Content-Type', 'text/html');
      		res.end = ('404 - Not Found');
      	}
      	return;
      }
      try {
      	var arity = layer.length;
      	console.log(index);
      	if (err) {
      		if (arity == 4){

      			layer(err, req, res, next);
      		} else {

      			next(err);
      		}
      	} else if (arity < 4) {

      		layer(req, res, next);
      	} else {

      		next();
      	}
      } catch (e) {

      	next (e);
      }
  	}

  	next();
  	
  }

  app.listen = function(port, done){
    return http.createServer(app).listen(port, done);
  }
  return app;
}

module.exports = myexpress;

















