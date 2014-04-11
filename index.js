var http = require("http");
var Layer = require("./lib/layer");
var makeRoute = require("./lib/route");
var methods = require("methods");

var myexpress = function(){
  
  var app = function(req, res, next){
    app.handle(req, res, next);
  }

  var isApp = function(middleware){
    if(typeof middleware.handle === "function"){
      return true;
    } else {
      return false;
    }
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
  // app.get = function(route, fn){

  // }

  app.handle = function(req, res, out){
  	var stack = this.stack;
  	var index = 0;
    var superUrl = null;

  	function next(err){
      var layer = stack[index++];
      if (superUrl != null){
            req.url = superUrl;
            superUrl = null;
          }

      if (!layer){
      	if (out) {
          return out(err);
        }
      	if (err){
          res.statusCode = 500;
          res.setHeader = ('Content-Type', 'text/html');
          res.end('500 - Error');
        } else {
          res.statusCode = 404;
          res.setHeader = ('Content-Type', 'text/html');
          res.end('404 - Not Found');
        }
        return;
      }
      
      
      try {
        if (!layer.match(req.url))
          return next(err);
        else{
          req.params = layer.match(req.url).params;
        }
        if(isApp(layer.handle)){
          superUrl = req.url;
          req.url = req.url.substr(layer.route.length);
        }
        // console.log(req.url);

      	var arity = layer.handle.length;
      	// console.log(index);
      	if (err) {
          if (arity == 4){
            layer.handle(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) {
          layer.handle(req, res, next);
        } else {
          next();
        }
      } catch (e) {
        next (e);
      }
    }
    next();
  }

  methods.forEach(function(method){
    app[method] = function(path, fn){
      var handler = makeRoute(method, fn);
      app.use(path, handler, true);
    }
  });

  app.listen = function(port, done){
    return http.createServer(app).listen(port, done);
  }


  return app;
}

module.exports = myexpress;

















