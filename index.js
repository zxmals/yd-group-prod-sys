var express = require('express');
var path = require('path');
var app = express();
 
app.use(express.static(path.join(__dirname,'./html/public')))

app.get('/home', function (req, res) {
  res.sendFile(__dirname+'/html/index.html')
})


var server = app.listen(7777, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})