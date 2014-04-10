var http = require("http");
var Layer = require("./lib/layer");

var myexpress = function(){
  
  var app = function(req, res, next){
    app.handle(req, res, next);
  }

  app.stack = [];
  app.use = function(route, fn){
    if (typeof route != 'string'){
      fn = route;
      route = '/';
    }
    var layer = new Layer(route, fn);
  	this.stack.push(layer);
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
      		// console.log("=============================");
      		res.statusCode = 500;
      		res.setHeader = ('Content-Type', 'text/html');
      		res.end('500 - Error');
      	} else {
      		// console.log("=============================");
      		res.statusCode = 404;
      		res.setHeader = ('Content-Type', 'text/html');
      		res.end('404 - Not Found');
      	}
      	return;
      }
      try {
        if (!layer.match(req.url))
          return next(err);
        else
          req.params = layer.match(req.url).params;
      	var arity = layer.handle.length;
      	// console.log(index);
      	if (err) {
      		if (arity == 4){
      			// console.log("=============================");
      			layer.handle(err, req, res, next);
      		} else {
      			// console.log("=============================");
      			next(err);
      		}
      	} else if (arity < 4) {
      		// console.log("=============================");
      		layer.handle(req, res, next);
      	} else {
      		// console.log("=============================");
      		next();
      	}
      } catch (e) {
      	// console.log("=============================");
      	next (e);
      }
  	}
  	// console.log("=============================");
  	next();
  }

  app.listen = function(port, done){
    return http.createServer(app).listen(port, done);
  }
  return app;
}

module.exports = myexpress;

















