var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http");

var express = require("./");


var app;
app = express();
app.use("/foo",function(req,res,next) {
  throw "boom!"
});

app.use("/foo/a",function(err,req,res,next) {
  res.end("error handled /foo/a");
});

app.use("/foo/b",function(err,req,res,next) {
  res.end("error handled /foo/b");
});


request(app).get("/foo/a");



