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
























