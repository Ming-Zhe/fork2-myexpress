var Layer = function (route, fn){
  this.handle = fn;
  this.route = route;
}

Layer.prototype.match = function(route){
  if( route.match(this.route) ) {
    return {path: this.route};
  }
}

module.exports = Layer;

