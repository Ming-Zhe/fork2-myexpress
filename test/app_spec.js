var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http");
var express = require("../");


describe("app", function(){
  var app = express();

  describe("create http server", function(){
    it("responds to /foo with 404", function(done) {
      var server = http.createServer(app);
      request(server).get("/foo").expect(404).end(done);
    });
    describe("#listen",function() {
      var port = 7001;
      var server;

  	  before(function(done) {
  	    server = app.listen(port,done);
  	  });

  	  it("should return an http.Server",function() {
  	    expect(server).to.be.instanceof(http.Server);
  	  });
    });
  });
});

describe(".use",function() {
  var app;

  var m1 = function() {};
  var m2 = function() {};

  before(function(){
    app = express();
  });

  it("should be able to add middlewares to stack",function() {
    app.use(m1)
    app.use(m2)
    expect(app.stack).to.deep.equal([m1,m2]);
  });
});

describe("calling middleware stack", function(){
  var app;

  beforeEach(function(){
    app = express();
  })

  it("should be able to call a single middleware", function(done){
    var m1 = function(req, res, next){
      res.end("hello from m1");
    };
    app.use(m1);
    request(app).get("/").expect("hello from m1").end(done);
  });

  it("Should be able to call \'next\' to go to the next middleware", function(done){
    var m1 = function(req, res, next){
      next();
    };

    var m2 = function(req, res, next){
      res.end("hello from m2");
    };

    app.use(m1);
    app.use(m2);

    request(app).get('/').expect("hello from m2").end(done);
  });

  it("Should 404 at the end of middleware chain",function(done) {
    var m1 = function(req,res,next) {
      next();
    };

    var m2 = function(req,res,next) {
      next();
    };

    app.use(m1);
    app.use(m2);
    request(app).get("/").expect(404).end(done);
  });

  it("Should 404 if no middleware is added",function(done) {
    request(app).get("/").expect(404).end(done);
  });
});

describe("Implement Error Handling", function(){
  var app;
  beforeEach(function(){
    app = express();
  });

  it("should return 500 for unhandled error", function(done){
    var m1 = function(req, res, next){
      next (new Error('boom!'));
    }
    // var err = new Error('hahahahahaha!');

    app.use(m1);

    // console.log(err.stack);

    request(app).get("/").expect(500).end(done);
  });

  it("should return 500 for uncaught error", function(done){
    var m1 = function(req, res, next){
      throw new Error("boom!");
    };

    app.use(m1);

    request(app).get("/").expect(500).end(done);
  });

  it("should ignore error handlers when `next` is called without an error",function(done) {
    var m1 = function(req,res,next) {
      next();
    }

    var e1 = function(err,req,res,next) {

    }

    var m2 = function(req,res,next) {
      res.end("m2");
    }

    app.use(m1);
    app.use(e1); 
    app.use(m2);

    request(app).get("/").expect("m2").end(done);
  });

  it("should skip normal middlewares if `next` is called with an error", function(done){
    var m1 = function(req, res, next){
      next(new Error("boom!"));
    };
    var m2 = function(req, res, next){

    };
    var e1 = function(err, req, res, next){
      res.end("e1");
    }

    app.use(m1);
    app.use(m2);
    app.use(e1);

    request(app).get("/").expect("e1").end(done);
  })
});

describe("Implement App Embedding As middleware", function(){
  var app, subapp;
  beforeEach(function(){
    app = express();
    subapp = express();
  })

  it("should pass unhandled request to parent", function(done){
    function m2(req, res, next){
      res.end('m2');
    }

    app.use(subapp);
    app.use(m2);

    request(app).get('/').expect('m2').end(done);
  });

  it("should pass unhandled error to parent", function(done){
    function m1(req, res, next){
      next("m1 error");
    }

    function e1(err, req, res, next){
      res.end(err);
    }

    subapp.use(m1);

    app.use(subapp);
    app.use(e1);

    request(app).get('/').expect("m1 error").end(done);
  });
});

describe("Layer class and the match method", function(){
  var layer, fn;
  beforeEach(function(){
    var Layer = require("../lib/layer");
    fn = function(){};
    layer = new Layer('/foo', fn);
  });

  it("sets layer.handle to be the middleware", function(){
    expect(layer.handle).to.eql(fn);
  });

  it("returns undefined if path doesn't match", function(){
    expect(layer.match("/bar")).to.be.undefined;
  });

  it("returns matched path if layer matches the request path exactly", function(){
    var match = layer.match('/foo');
    expect(match).to.not.be.undefined;
    expect(match).have.property("path", "/foo");
  });
});

describe("app.use should add a Layer to stack", function(){
  var app, Layer;
  beforeEach(function() {
    app = express();
    Layer = require("../lib/layer");
    app.use(function() {});
    app.use("/foo",function() {});
  });

  it("first layer's path should be /", function(){
    layer = app.stack[0];
    expect(layer.match("/foo")).to.have.property("path", "/");
  });

  it("second layer's path should be /foo", function(){
    layer = app.stack[1];
    expect(layer.match("/foo")).to.have.property("path", "/foo");
  });
});

describe("The middlewares called should match request path:", function(){
  var app;
  before(function(){
    app = express();
    app.use("/foo",function(req, res, next){
      res.end("foo");
    });

    app.use("/", function(req, res){
      res.end("root");
    });
  });

  it("returns root for GET /", function(done){
    request(app).get('/').expect("root").end(done);
  });

  it("returns foo for GET /foo", function(done){
    request(app).get('/foo').expect("foo").end(done);
  });

  it("returns foo for GET /foo/bar", function(done){
    request(app).get("/foo/bar").expect("foo").end(done);
  });
});

describe("The error handlers called should match request path:", function(){
  var app;
  before(function(){
    app = express();
    app.use("/foo", function(req, res, next){
      throw "booms";
    });

    app.use("/foo/a", function(err, req, res, next){
      res.end("error handled /foo/a");
    });

    app.use("/foo/b", function(err, req, res, next){
      res.end("error handled /foo/b");
    });
  });

  it("handles error with /foo/a", function(done){
    request(app).get("/foo/a").exprect("error handled /foo/a").end(done);
  });

  it("handles error with /foo/b",function(done) {
    request(app).get("/foo/b").expect("error handled /foo/b").end(done);
  });

  it("returns 500 for /foo",function(done) {
    request(app).get("/foo").expect(500).end(done);
});



































