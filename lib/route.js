var methods = require("methods");

function makeRoute(verb, handler){
  var fn = function(req, res, next){
    if(verb === req.method.toLowerCase()){
      handler(req, res, next);
    }else{
      next();
    }
  }

  fn.stack = [];
  fn.use = function(verb, handler){
    fn.stack.push({
      verb : verb.toLowerCase(),
      handler : handler
    });
    return fn;
  }

  return fn;
}

module.exports = makeRoute;
