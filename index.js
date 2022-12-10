var express = require('express'); //导入express框架
var bodyParser = require('body-parser');  // 引入请求体解析包
var cookieParser = require('cookie-parser') // 引入cookie解析包
var util = require('util'); //引入工具包
var path = require('path'); //引入文件路径处理包

var app = express();

// 设置静态文件夹
app.use(express.static(path.join(__dirname,'./html/public')))
// cookie解析
app.use(cookieParser())

// post请求体数据解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 访问主页
app.get('/home', function (req, res) {
  console.log("Cookies: " + util.inspect(req.cookies.session));
  res.sendFile(__dirname+'/html/index.html')
})

// 用户登录-设置cookie，将登录信息使用base64编码写入session，20分钟过期，测试用户 admin/123456
app.post('/login',urlencodedParser,function(req,res){
  if(req.body.username=='admin'&req.body.password=='123456'){
    resp = {
      'uname':req.body.username,
      'login':true
    }
    resp = Buffer.from(JSON.stringify(resp));
    resp = resp.toString('base64');
    res.cookie('session',resp,{maxAge:1000*60*20})
    res.send(true)
  }else{
    res.send(false)
  }
})

// 退出登录 ，注销cookie
app.post('/logout',function(req,res){
    res.cookie('session','',{maxAge:0})
    res.send(true)
})


// 服务启动监听端口:7777
var server = app.listen(7777, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})