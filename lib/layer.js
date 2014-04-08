var p2re = require('path-to-regexp');

var Layer = function (route, fn){
  this.handle = fn;
  this.route = route;
  this.match = function(route){
  	if(route.match(this.route)){
  	  return {path: this.route};
  	}
  }
}

module.exports = Layer;

