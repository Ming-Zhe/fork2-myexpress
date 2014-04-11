var p2re = require('path-to-regexp');

var stripSlash = function (path) {
  var reg = /^.*\/$/;
  if(reg.test(path)){
    path = path.substr(0, path.length-1);
  }
  return path;
}

var Layer = function (route, fn){
  var route = stripSlash(route);
  this.handle = fn;
  this.route = route;
  this.keys = [];
  this.re = p2re(route, this.keys, {end: false});

  this.match = function(route){
    var path = decodeURIComponent(route);
    // console.log(path);
    var m = this.re.exec(path);
    // console.log(m);
    if (!m){
      return undefined;
    }

    var toReturn = {path: m[0],
                    params: {}};

    for(var i = 0; i < this.keys.length; i++){
    // console.log(this.keys[1].name);
    // console.log(this.keys[i].name);
    var param = this.keys[i].name;
    toReturn.params[param] = m[i+1];
    }
    // console.log(toReturn);

    return toReturn;
  }
}

module.exports = Layer;

