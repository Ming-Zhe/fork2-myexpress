var Layer = function (route, fn){
  this.handle = fn;
  this.route = route;
}

var fn = function(){};
var layer = new Layer('/foo', fn);