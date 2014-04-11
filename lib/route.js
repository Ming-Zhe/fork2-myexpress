function makeRoute(verb, handler){
  var fn = function(req, res, next){
    if(verb === req.method){
      handler(req, res, next);
    }else{
      next();
    }
  }
  return fn;
}

module.exports = makeRoute;