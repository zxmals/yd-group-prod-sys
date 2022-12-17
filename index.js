var express = require('express'); //导入express框架
var bodyParser = require('body-parser');  // 引入请求体解析包
var cookieParser = require('cookie-parser') // 引入cookie解析包
var connection = require('./db_conn')  //引入数据库连接类
var md5 = require('md5')  //引入MD5包
var date = require("silly-datetime") //引入时间获取模块
var util = require('util'); //引入工具包
var path = require('path'); //引入文件路径处理包
var xlsx = require("node-xlsx");

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
 *  封装数据库SQL查询
 *  call ： 回调函数
 **/
function execute_sql(sql,query_param,call){
  var conn = connects.getconnection()
  conn.connect()
  // var sql = "select username from grp_user where userphone=? and passwd=?"
  // var query_param = [req.body.userphone,md5(req.body.password)]
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


/**
 * 待维护账单科目专区
 * 数据日期使用前一天，避免同步不及时导致无数据展示
 * 
 ***/

// 获取待维护账单科目信息
app.post('/get-witem-info',function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql('select * from witem where op_date=? order by (cur_m_fee+last_m_fee+last2_m_fee) desc limit 0,5',[date.format(dates,'YYYYMMDD'),],call);
})

// 获取待维护账单科目信息-总记录数
app.post('/get-witem-info-cnts',function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  dates = new Date()
  dates.setDate(dates.getDate()-1)  
  execute_sql("select count(1) cnts from witem where op_date=?",[date.format(dates,'YYYYMMDD'),],call);
});


// 关键字查询-获取待维护账单科目信息-总记录数
app.post('/search-items-ky-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  // var key_words = escape(req.body.keyw)
  var key_words = req.body.keyw
  dates = new Date()
  dates.setDate(dates.getDate()-1)    
  execute_sql("select count(1) cnts from witem where op_date=? and (item_name like '%"+key_words+"%' or item_id like '%"+key_words+"%') ",[date.format(dates,'YYYY-MM-DD'),],call);
});

// 关键字查询-获取待维护账单科目信息
app.post('/search-items-ky',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  // var key_words = escape(req.body.keyw)
  var key_words = req.body.keyw
  dates = new Date()
  dates.setDate(dates.getDate()-1)      
  execute_sql("select * from witem where op_date=? and (item_name like '%"+key_words+"%' or item_id like '%"+key_words+"%') order by (cur_m_fee+last_m_fee+last2_m_fee) desc limit 0,5",[date.format(dates,'YYYY-MM-DD'),],call);
});

// 分页查询-上一页
app.post('/pere-witem-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)   
  sql = "select * from witem where op_date=? and (item_name like '%"+key_words+"%' or item_id like '%"+key_words+"%') order by (cur_m_fee+last_m_fee+last2_m_fee) desc limit ?,?"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),((cur_page-2)*5),5,],call)
});

// 分页查询-下一页
app.post('/next-witem-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = "select * from witem where op_date=? and (item_name like '%"+key_words+"%' or item_id like '%"+key_words+"%') order by (cur_m_fee+last_m_fee+last2_m_fee) desc limit ?,?"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),(cur_page*5),5,],call)
});


app.get('/download-witem',function(req,resp){
  filename = '111.xlsx'
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  var list = [
    {
      name: "sheet",
      data: [
        ["data1", "data2", "data3"],
        ["data1", "data2", "data3"],
        ["data1", "data2", "data3"],
      ],
    },
  ];
  resp.send(xlsx.build(list))
});

// 服务启动监听端口:7777
var server = app.listen(7777, function (){
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})



// var b = new Buffer('SmF2YVNjcmlwdA==', 'base64')
// var s = b.toString();