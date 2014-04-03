var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http");
var express = require("../");

var app = express();

describe("app", function(){
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
