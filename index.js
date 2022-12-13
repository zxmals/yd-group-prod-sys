var express = require('express'); //导入express框架
var bodyParser = require('body-parser');  // 引入请求体解析包
var cookieParser = require('cookie-parser') // 引入cookie解析包
var connection = require('./db_conn')  //引入数据库连接类
var md5 = require('md5')  //引入MD5包
var date = require("silly-datetime") //引入时间获取模块
var util = require('util'); //引入工具包
var path = require('path'); //引入文件路径处理包

var app = express();

// 设置静态文件夹
app.use(express.static(path.join(__dirname,'./html/public')))

// cookie解析
app.use(cookieParser())

// 创建连接对象
var connects = new connection();

// post请求体数据解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 访问主页
app.get('/home', function (req, resp) {
  // console.log("Cookies: " + util.inspect(req.cookies.session));
  resp.sendFile(__dirname+'/html/index.html')
})

/**
 *  封装数据库数据查询
 * call 回调函数
 **/
function execute_sql(sql,query_param,call){
  conn = connects.getconnection()
  conn.connect()
  // var sql = "select username from grp_user where userphone=? and passwd=?"
  // var query_param = [req.body.userphone,md5(req.body.password)]
  var resu;
  conn.query(sql,query_param,call);
  conn.end()
}

// 用户登录-设置cookie，将登录信息使用base64编码写入session，20分钟过期,admin/admin
app.post('/login',urlencodedParser,function(req,resp){
  var sql = "select username from grp_user where userphone=? and passwd=?"
  var query_param = [req.body.userphone,md5(req.body.password)]
  var call = function(err,res){
    if(err){
      console.log(err.message);
      return;
    }
    if(res.length>0){
      respd = {
        'uname':res[0].username,
        'login':true
      }
      respd = Buffer.from(JSON.stringify(respd));
      respd = respd.toString('base64');
      resp.cookie('session',respd,{maxAge:1000*60*20})
      resp.send(true)
    }else{
      resp.send(false)
    }    
  }
  execute_sql(sql,query_param,call)
})

// 退出登录 ，注销cookie
app.post('/logout',function(req,resp){
    resp.cookie('session','',{maxAge:0})
    resp.send(true)
})

// 获取待维护账单科目信息
app.post('/get-witem-info',function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  execute_sql('select * from witem where op_date=? limit 0,5',[date.format(new Date(),'YYYYMMDD'),],call);
  
})

// 服务启动监听端口:7777
var server = app.listen(7777, function (){
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})



// var b = new Buffer('SmF2YVNjcmlwdA==', 'base64')
// var s = b.toString();