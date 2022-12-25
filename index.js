const express = require('express'); //导入express框架
const bodyParser = require('body-parser');  // 引入请求体解析包
const cookieParser = require('cookie-parser') // 引入cookie解析包
const connection = require('./db_conn')  //引入数据库连接类
const md5 = require('md5')  //引入MD5包
const date = require("silly-datetime") //引入时间获取模块
const util = require('util'); //引入工具包
const path = require('path'); //引入文件路径处理包
const xlsx = require("node-xlsx"); // 引入excel解析生成工具包
const fs = require("fs"); // 引入文件读写模块
const str_random = require("string-random"); // 引入随机生成字符串工具包
const multer  = require('multer');

const app = express();

// 创建连接对象
const connects = new connection();

// post请求体数据解析
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const upload = multer({dest:'./tmp'})

// 设置静态文件夹
app.use('/grp',express.static(path.join(__dirname,'./html/public')))

// cookie解析
app.use(cookieParser())



// 访问主页 + 获取五级分类数据
app.get('/grp/home', function (req, resp) {
  // console.log("Cookies: " + util.inspect(req.cookies.session));
  resp.sendFile(__dirname+'/html/index.html')
  // resp.render("index", {news:[]})
});


// admin login
app.get('/grp/admin', function (req, resp) {
  // console.log("Cookies: " + util.inspect(req.cookies.session),req.cookies.session);  
  if(req.cookies.session!=null){
      sess = Buffer.from(util.inspect(req.cookies.session),'base64')
      sess = JSON.parse(sess)
      var key = fs.readFileSync('./session/'+sess['uname']+'.txt');
      if(key==sess['key']){
        resp.sendFile(__dirname+'/html/admin.html')
      }else{
        resp.sendFile(__dirname+'/html/index.html')
      }
  }else{
    resp.sendFile(__dirname+'/html/index.html')
  }
  // resp.render("index", {news:[]})
});


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
      var key = str_random(33)
      key = md5(key)
      var writerStream = fs.createWriteStream('./session/'+res[0].username+'.txt');
      writerStream.write(key,'UTF8');
      respd = {
        'uname':res[0].username,
        'login':true,
        'key':key
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
});

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

// 导出下载-待维护账单科目明细/不用本地保存，生成字节流直接下载
app.get('/download-witem',function(req,resp){  
  filename = encodeURIComponent('待维护账单科目明细.xlsx')
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  dates = new Date()
  date1 = dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
  dates.setMonth(dates.getMonth()-1)
  date2 = dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
  dates.setMonth(dates.getMonth()-1)
  date3 = dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'  
  data = []
  data.push(['账单科目名称','账单科目编码','上线时间',date1+'收入(元)',date2+'收入(元)',date3+'收入(元)'])  
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    res.forEach(function(e){
      data.push([e['item_name'],e['item_id'],e['eff_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee']]);
    });
    resp.send(xlsx.build([{'name':'sheet1',data:data}]))
  }
  sql = "select * from witem where op_date=? order by (cur_m_fee+last_m_fee+last2_m_fee) desc"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)
});

/**
 * 获取五级分类
 ***/
app.post('/getctginfo',function(req,resp){
  //获取最大日期
  var max_date = ''
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    max_date = new Date(res[0]['op_time']).toLocaleString().split(' ')[0].replace(/\//g,'-')
    call = function(err,res){
      if(err){
        console.log(err.message)
        return
      }
      // console.log(res)
      resp.json(res)
    }
    sql = 
        "select * from ("
            +"select distinct "
            +"a.catg_id catg_id1,a.catg_name catg_name1, "
            +"b.catg_id catg_id2,b.catg_name catg_name2,b.parent_id parent_id1, "
            +"c.catg_id catg_id3,c.catg_name catg_name3,c.parent_id parent_id2, "
            +"d.catg_id catg_id4,d.catg_name catg_name4,d.parent_id parent_id3, "
            +"e.catg_id catg_id5,e.catg_name catg_name5,e.parent_id parent_id4, "
            +"COALESCE(a.biz_code,b.biz_code,c.biz_code,d.biz_code,e.biz_code)biz_code, "
            +"case when (c.catg_name like '%专线%' or d.catg_name like '%专线%' or e.catg_name like '%专线%') then 1 else 0 end if_zp_prod "
            +"from (SELECT catg_id,catg_name,biz_code FROM `ent_product_ctg` where parent_id = '0' and op_time=? and op_date=?) a "
            +"left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=? and op_date=? )b on a.catg_id = b.parent_id "
            +"left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=? and op_date=? )c on b.catg_id = c.parent_id "
            +"left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=? and op_date=? )d on c.catg_id = d.parent_id "
            +"left join (SELECT catg_id,catg_name,parent_id,biz_code FROM `ent_product_ctg` where op_time=? and op_date=? )e on d.catg_id = e.parent_id "
        +")a where biz_code is not null order by catg_id1  asc, if_zp_prod desc,catg_id2  asc, if_zp_prod desc,catg_id3  asc, if_zp_prod desc,catg_id4  asc, if_zp_prod desc,catg_id5  asc, if_zp_prod desc,biz_code asc "
    dates = new Date()
    dates.setDate(dates.getDate()-1)
    execute_sql(sql,[max_date,date.format(dates,'YYYY-MM-DD'),max_date,date.format(dates,'YYYY-MM-DD'),max_date,date.format(dates,'YYYY-MM-DD'),max_date,date.format(dates,'YYYY-MM-DD'),max_date,date.format(dates,'YYYY-MM-DD'),],call)    
  }
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = "select max(op_time)op_time from ent_product_ctg where op_date=? "
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)
});


/**
 * 已维护产品专区
 * 
 ***/

// 获取已维护产品总记录数
app.post('/get-online-prod-info-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  sql = 
  "  select count(1) cnts "+
  "  from product a "+
  "  left join ("+
  "    select * from ent_product_ctg_zx "+
  "  ) b on a.biz_code=b.biz_code "+
  "  where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)  
});


// 获取已维护产品信息
app.post('/get-online-prod-info',function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  sql = 
  "select a.offer_id,a.offer_name,a.eff_date "+
  ",b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
  "from product a "+
  "left join ( "+
  "  select * from ent_product_ctg_zx "+
  ") b on a.biz_code=b.biz_code "+
  "where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
  "order by offer_id "+
  " limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)  
});


// 获取已维护产品信息-关键字查询
app.post('/get-online-prod-info-ky-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  key_word = req.body.keyw
  sql = 
    " select count(1) cnts "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " )a  "+
    " where ( "+
    "      offer_id like '%"+key_word+"%' "+
    " or offer_name like '%"+key_word+"%' "+
    " or catg_name1 like '%"+key_word+"%' "+
    " or catg_name2 like '%"+key_word+"%' "+
    " or catg_name3 like '%"+key_word+"%' "+
    " or catg_name4 like '%"+key_word+"%' "+
    " or catg_name5 like '%"+key_word+"%' "+
    " ) "
    // " order by catg_id1,catg_id2,catg_id3,catg_id4,catg_id5 "+    
    // " limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});


// 获取已维护产品信息-关键字查询
app.post('/get-online-prod-info-ky',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  key_word = req.body.keyw
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " )a  "+
    " where ( "+
    "      offer_id like '%"+key_word+"%' "+
    " or offer_name like '%"+key_word+"%' "+
    " or catg_name1 like '%"+key_word+"%' "+
    " or catg_name2 like '%"+key_word+"%' "+
    " or catg_name3 like '%"+key_word+"%' "+
    " or catg_name4 like '%"+key_word+"%' "+
    " or catg_name5 like '%"+key_word+"%' "+
    " ) "+
    " order by offer_id "+    
    " limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)  
});


// 获取已维护产品总记录数-分类查询
app.post('/get-online-prod-info-ctg-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  ctg_1 = req.body.ctg1
  ctg_2 = req.body.ctg2
  ctg_3 = req.body.ctg3
  ctg_4 = req.body.ctg4
  ctg_5 = req.body.ctg5
  sql = 
    " select count(1)cnts "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
  sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
  sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
  sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
  sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""
  // sql += " order by catg_id1,catg_id2,catg_id3,catg_id4,catg_id5 limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});


// 获取已维护产品信息-分类查询
app.post('/get-online-prod-info-ctg',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  ctg_1 = req.body.ctg1
  ctg_2 = req.body.ctg2
  ctg_3 = req.body.ctg3
  ctg_4 = req.body.ctg4
  ctg_5 = req.body.ctg5
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
  sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
  sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
  sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
  sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""
  sql += " order by offer_id limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});

//已维护产品分页查询-下一页
app.post('/next-online-prod-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var ctg_1 = req.body.ctg1
  var ctg_2 = req.body.ctg2
  var ctg_3 = req.body.ctg3
  var ctg_4 = req.body.ctg4
  var ctg_5 = req.body.ctg5  
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  if(key_words!=''&&key_words!=null){
    sql += " and (offer_id like '%"+key_word+"%' "
    sql += " or offer_name like '%"+key_word+"%' "
    sql += " or catg_name1 like '%"+key_word+"%' "
    sql += " or catg_name2 like '%"+key_word+"%' "
    sql += " or catg_name3 like '%"+key_word+"%' "
    sql += " or catg_name4 like '%"+key_word+"%' "
    sql += " or catg_name5 like '%"+key_word+"%') "
  }else{
    sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
    sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
    sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
    sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
    sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""      
  }
  sql += " order by offer_id limit ?,5"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),(cur_page*5),],call)  
});


//已维护产品分页查询-上一页
app.post('/pere-online-prod-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var ctg_1 = req.body.ctg1
  var ctg_2 = req.body.ctg2
  var ctg_3 = req.body.ctg3
  var ctg_4 = req.body.ctg4
  var ctg_5 = req.body.ctg5  
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  if(key_words!=''&&key_words!=null){
    sql += " and (offer_id like '%"+key_word+"%' "
    sql += " or offer_name like '%"+key_word+"%' "
    sql += " or catg_name1 like '%"+key_word+"%' "
    sql += " or catg_name2 like '%"+key_word+"%' "
    sql += " or catg_name3 like '%"+key_word+"%' "
    sql += " or catg_name4 like '%"+key_word+"%' "
    sql += " or catg_name5 like '%"+key_word+"%') "
  }else{
    sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
    sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
    sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
    sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
    sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""      
  }
  sql += " order by offer_id limit ?,5"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),((cur_page-2)*5),],call)  
});


// 根据产品ID获取下属账单科目明细
app.post('/get-item-info-by-offerid',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  offer_id = req.body.offer_id
  sql = " select  (@rowNum :=  @rowNum + 1)  as rn,a.* from product_item a,(SELECT @rowNum:=0) as rownum where  a.op_date = ? and a.offer_id = ? and item_id != '' "
  dates = new Date()
  dates.setDate(dates.getDate()-1)  
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),offer_id,],call)  
});


// 导出下载-账单科目明细-by-offer_id
app.get('/downlowd-item-info-by-offerid',function(req,resp){
  // console.log(req.query.offer_info,'------------offer_id')
  var offer_info = req.query.offer_info
  var offer_id = req.query.offer_id
  filename = encodeURIComponent(offer_info+'.xlsx')
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  data = []
  data.push(['账单科目名称','账单科目编码'])  
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    res.forEach(function(e){
      data.push([e['item_name'],e['item_id']]);
    });
    resp.send(xlsx.build([{'name':'sheet1',data:data}]))
  }
  sql = "SELECT item_name,item_id FROM `product_item` where offer_id = ? and op_date = ?"
  dates = new Date()
  dates.setDate(dates.getDate()-1)  
  execute_sql(sql,[offer_id,date.format(dates,'YYYY-MM-DD'),],call)
});


// 导出下载-已维护产品专区
app.get('/downlowd-online-prod',function(req,resp){
  filename = encodeURIComponent('已维护产品明细.xlsx')
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  data = []
  data.push(['产品编码','产品名称','上线日期','一级分类','二级分类','三级分类','四级分类','五级分类','四位科目'])  
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    res.forEach(function(e){
      data.push([e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'],e['biz_code']]);
    });
    resp.send(xlsx.build([{'name':'sheet1',data:data}]))
  }
  sql = 
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   order by b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)
});



/**
 * 专线产品专区
 * 
 ***/

// 获取专线产品总记录数
app.post('/get-zb-prod-info-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  sql = 
  "  select count(1) cnts "+
  "  from product a "+
  "  left join ("+
  "    select * from ent_product_ctg_zx "+
  "  ) b on a.biz_code=b.biz_code "+
  "  where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)  
});


// 获取专线产品信息
app.post('/get-zb-prod-info',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  sql = 
  "select a.offer_id,a.offer_name,a.eff_date "+
  ",b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
  "from product a "+
  "left join ( "+
  "  select * from ent_product_ctg_zx "+
  ") b on a.biz_code=b.biz_code "+
  "where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
  " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
  "order by offer_id "+
  " limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)  
});

// 获取专线产品总记录数-模糊查询
app.post('/get-zb-prod-info-ky-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  key_word = req.body.keyw
  sql = 
    " select count(1) cnts "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    " )a  "+
    " where ( "+
    "      offer_id like '%"+key_word+"%' "+
    " or offer_name like '%"+key_word+"%' "+
    " or catg_name1 like '%"+key_word+"%' "+
    " or catg_name2 like '%"+key_word+"%' "+
    " or catg_name3 like '%"+key_word+"%' "+
    " or catg_name4 like '%"+key_word+"%' "+
    " or catg_name5 like '%"+key_word+"%' "+
    " ) "
    // " order by catg_id1,catg_id2,catg_id3,catg_id4,catg_id5 "+    
    // " limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});

// 获取专线产品信息-模糊查询
app.post('/get-zb-prod-info-ky',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  key_word = req.body.keyw
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    " )a  "+
    " where ( "+
    "      offer_id like '%"+key_word+"%' "+
    " or offer_name like '%"+key_word+"%' "+
    " or catg_name1 like '%"+key_word+"%' "+
    " or catg_name2 like '%"+key_word+"%' "+
    " or catg_name3 like '%"+key_word+"%' "+
    " or catg_name4 like '%"+key_word+"%' "+
    " or catg_name5 like '%"+key_word+"%' "+
    " ) "+
    " order by offer_id "+    
    " limit 0,5"    
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});


// 获取专线产品总记录数-分类查询
app.post('/get-zb-prod-info-ctg-cnts',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  ctg_1 = req.body.ctg1
  ctg_2 = req.body.ctg2
  ctg_3 = req.body.ctg3
  ctg_4 = req.body.ctg4
  ctg_5 = req.body.ctg5
  sql = 
    " select count(1)cnts "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    " )a  "+
    " where 1=1 "
  sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
  sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
  sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
  sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
  sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""

  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});


// 获取专线产品信息-分类查询
app.post('/get-zb-prod-info-ctg',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  ctg_1 = req.body.ctg1
  ctg_2 = req.body.ctg2
  ctg_3 = req.body.ctg3
  ctg_4 = req.body.ctg4
  ctg_5 = req.body.ctg5
  sql = 
    " select count(1)cnts "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    " )a  "+
    " where 1=1 "
  sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
  sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
  sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
  sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
  sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""  
  sql += " order by offer_id limit 0,5"
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call) 
});

//专线产品分页查询-下一页
app.post('/next-zb-prod-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var ctg_1 = req.body.ctg1
  var ctg_2 = req.body.ctg2
  var ctg_3 = req.body.ctg3
  var ctg_4 = req.body.ctg4
  var ctg_5 = req.body.ctg5  
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  if(key_words!=''&&key_words!=null){
    sql += " and (offer_id like '%"+key_word+"%' "
    sql += " or offer_name like '%"+key_word+"%' "
    sql += " or catg_name1 like '%"+key_word+"%' "
    sql += " or catg_name2 like '%"+key_word+"%' "
    sql += " or catg_name3 like '%"+key_word+"%' "
    sql += " or catg_name4 like '%"+key_word+"%' "
    sql += " or catg_name5 like '%"+key_word+"%') "
  }else{
    sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
    sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
    sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
    sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
    sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""      
  }
  sql += " order by offer_id limit ?,5"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),(cur_page*5),],call)  
});


//专线产品分页查询-上一页
app.post('/pere-zb-prod-page',urlencodedParser,function(req,resp){
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    resp.json(res)
  }
  var key_words = req.body.keyw
  var ctg_1 = req.body.ctg1
  var ctg_2 = req.body.ctg2
  var ctg_3 = req.body.ctg3
  var ctg_4 = req.body.ctg4
  var ctg_5 = req.body.ctg5  
  var cur_page = parseInt(req.body.cur_page)
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  sql = 
    " select * "+
    " from ( "+
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   ,b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    " and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%')  "+
    "   order by b.catg_id1 "+
    " )a  "+
    " where 1=1 "
  if(key_words!=''&&key_words!=null){
    sql += " and (offer_id like '%"+key_word+"%' "
    sql += " or offer_name like '%"+key_word+"%' "
    sql += " or catg_name1 like '%"+key_word+"%' "
    sql += " or catg_name2 like '%"+key_word+"%' "
    sql += " or catg_name3 like '%"+key_word+"%' "
    sql += " or catg_name4 like '%"+key_word+"%' "
    sql += " or catg_name5 like '%"+key_word+"%') "
  }else{
    sql += ctg_1!=null?" and catg_id1 LIKE '%"+ctg_1+"%'":""
    sql += ctg_2!=null?" and catg_id2 LIKE '%"+ctg_2+"%'":""
    sql += ctg_3!=null?" and catg_id3 LIKE '%"+ctg_3+"%'":""
    sql += ctg_4!=null?" and catg_id4 LIKE '%"+ctg_4+"%'":""
    sql += ctg_5!=null?" and catg_id5 LIKE '%"+ctg_5+"%'":""      
  }
  sql += " order by offer_id limit ?,5"
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),((cur_page-2)*5),],call)  
});


// 导出下载-专线产品专区
app.get('/downlowd-zb-prod',function(req,resp){
  filename = encodeURIComponent('专线产品明细.xlsx')
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  data = []
  data.push(['产品编码','产品名称','上线日期','一级分类','二级分类','三级分类','四级分类','五级分类','四位科目'])  
  var call = function(err,res){
    if(err){
      console.log(err.message)
      return
    }
    res.forEach(function(e){
      data.push([e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'],e['biz_code']]);
    });
    resp.send(xlsx.build([{'name':'sheet1',data:data}]))
  }
  sql = 
    "   select  a.offer_id,a.offer_name,a.eff_date "+
    "   ,b.catg_name1,b.catg_name2,b.catg_name3,b.catg_name4,b.catg_name5,a.biz_code "+
    "   from product a  "+
    "   left join ( "+
    "     select * from ent_product_ctg_zx "+
    "   ) b on a.biz_code=b.biz_code "+
    "   where a.online_stat = 1 and b.catg_id1 is not null and a.op_date = ? "+
    "   and (b.catg_name3 like '%专线%' or b.catg_name4 like '%专线%' or b.catg_name5 like '%专线%') "+
    "   order by b.catg_id1,b.catg_id2,b.catg_id3,b.catg_id4,b.catg_id5 "
  dates = new Date()
  dates.setDate(dates.getDate()-1)
  execute_sql(sql,[date.format(dates,'YYYY-MM-DD'),],call)
});


// 专线专区-文件上传
app.post('/file_upload',upload.fields([{name:'fee'},{name:'desc'},{name:'man'},{name:'op'}]),urlencodedParser,function (req, resp) {
  let file_type = req.files['fee']!=null?'fee':(req.files['desc']!=null?'desc':(req.files['man']!=null?'man':'op'))
  let new_path = req.files['fee']!=null?'upload/zx_product/fee/':(req.files['desc']!=null?'upload/zx_product/desc/':(req.files['man']!=null?'upload/zx_product/man/':'upload/zx_product/op/'))
  req.files[file_type][0].originalname = Buffer.from(req.files[file_type][0].originalname, "latin1").toString("utf8")
  let offer_id = req.body.offer_id
  // console.log(req.body.offer_id,'----------------')
  new_path += offer_id
  if(!fs.existsSync(new_path)){fs.mkdirSync(new_path)} // 产品目录不存在则创建目录  
  let file_name = req.files[file_type][0].originalname
  let tail = file_name.split('.').slice(-1)
  let oldName = req.files[file_type][0].path;
  let newName = new_path+'/'+req.files[file_type][0].originalname;  // 指定文件路径和文件名
  let t_arr = ['doc','docx','xlsx','xls','txt','md']
  let f_li = fs.readdirSync(new_path)

  if(req.cookies.session!=null){
      sess = Buffer.from(util.inspect(req.cookies.session),'base64')
      sess = JSON.parse(sess)
      var key = fs.readFileSync('./session/'+sess['uname']+'.txt');
      if(key==sess['key']){
        if(t_arr.filter(function(e){return e==tail}).length>0&&f_li.filter(function(e){return e==file_name}).length==0){
          // 3. 将上传后的文件重命名
          fs.renameSync(oldName, newName);
          fs.open(new_path+'/log.txt', 'a+', function(err, fd) {
             if (err) {
                 return console.error(err);
             }
             fs.writeFile(fd, sess['uname']+'|新增|'+file_name+'|'+date.format(dates,'YYYY-MM-DD HH:mm:ss')+'\n',  function(err) {
              if(err){
                return console.error(err);
              }
             });
          });          
          // 4. 文件上传成功,返回上传成功后的文件路径
          resp.send("上传成功！请重新进入查看文件列表。");
        }else{
          fs.unlinkSync(oldName)
          resp.send('上传失败！文件类型错误或文件名重复。');
        }
      }else{
        resp.send('请登录后操作！')
      }
  }else{
    resp.send('请登录后操作！')
  }

})

// 专线专区-查看产品介绍
app.post('/get-zb-prod-desc',urlencodedParser,function(req,resp){
  desc_path = 'upload/zx_product/desc/'+req.body.offer_id
  if(!fs.existsSync(desc_path)){
    resp.json('')
  }else{
    f_li = fs.readdirSync(desc_path)
    f_li.forEach(function(e){
      if(e=='log.txt'){
        f_li.splice(f_li.indexOf(e),1)
      }
    })
    resp.json(f_li)
  }
})


// 专线专区-查看产品资费
app.post('/get-zb-prod-fee',urlencodedParser,function(req,resp){
  offer_id = req.body.offer_id
  desc_path = 'upload/zx_product/fee/'+offer_id
  if(!fs.existsSync(desc_path)){
    resp.json('')
  }else{
    f_li = fs.readdirSync(desc_path)
    f_li.forEach(function(e){
      if(e=='log.txt'){
        f_li.splice(f_li.indexOf(e),1)
      }
    })
    resp.json(f_li)
  }
})


// 专线专区-查看产品管理办法
app.post('/get-zb-prod-man',urlencodedParser,function(req,resp){
  offer_id = req.body.offer_id
  desc_path = 'upload/zx_product/man/'+offer_id
  if(!fs.existsSync(desc_path)){
    resp.json('')
  }else{
    f_li = fs.readdirSync(desc_path)
    f_li.forEach(function(e){
      if(e=='log.txt'){
        f_li.splice(f_li.indexOf(e),1)
      }
    })
    resp.json(f_li)
  }
})


// 专线专区-查看产品操作流程
app.post('/get-zb-prod-op',urlencodedParser,function(req,resp){
  offer_id = req.body.offer_id
  desc_path = 'upload/zx_product/op/'+offer_id
  if(!fs.existsSync(desc_path)){
    resp.json('')
  }else{
    f_li = fs.readdirSync(desc_path)
    f_li.forEach(function(e){
      if(e=='log.txt'){
        f_li.splice(f_li.indexOf(e),1)
      }
    })
    resp.json(f_li)
  }
})


// 专线专区-帮助文档下载
app.get('/download-zb-prod-doc',function(req,resp){
  offer_id = req.query.offer_id
  prod_type = req.query.prod_type
  filename = req.query.filename
  dest_path = 'upload/zx_product/'
  dest_path += prod_type=='desc'?'desc/':(prod_type=='fee'?'fee/':(prod_type=='man'?'man/':'op/'))
  dest_path += offer_id
  dest_path += '/'
  dest_path += filename
  filename = encodeURIComponent(filename)
  resp.set({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename='+filename})
  // 创建一个可读流
  readerStream = fs.createReadStream(dest_path);
  // 管道读写操作
  readerStream.pipe(resp);
});


// 专线专区-帮助文档删除
app.post('/remove-zb-prod-doc',urlencodedParser,function(req,resp){
  offer_id = req.body.offer_id
  prod_type = req.body.prod_type
  filename = req.body.filename
  dest_path = 'upload/zx_product/'
  dest_path += prod_type=='desc'?'desc/':(prod_type=='fee'?'fee/':(prod_type=='man'?'man/':'op/'))
  dest_path += offer_id
  dest_path += '/'
  dest_dir = dest_path
  dest_path += filename
  dates = new Date()
  try{
    if(req.cookies.session!=null){
        sess = Buffer.from(util.inspect(req.cookies.session),'base64')
        sess = JSON.parse(sess)
        var key = fs.readFileSync('./session/'+sess['uname']+'.txt');
        if(key==sess['key']){
          fs.unlinkSync(dest_path)
          fs.open(dest_dir+'log.txt', 'a+', function(err, fd) {
             if (err) {
                 return console.error(err);
             }
             fs.writeFile(fd, sess['uname']+'|删除|'+filename+'|'+date.format(dates,'YYYY-MM-DD HH:mm:ss')+'\n',  function(err) {
              if(err){
                return console.error(err);
              }
             });            
          });
          resp.send('已删除!')
        }else{
          resp.send('请登录后操作！')
        }
    }else{
      resp.send('请登录后操作！')
    }
  }catch(err){
    console.error(err);
    resp.send('删除失败!')
  }
});


// 服务启动监听端口:7777
var server = app.listen(7777, function (){
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
});
