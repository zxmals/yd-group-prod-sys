var mysql = require('mysql');
function connection(){

  this.getconnection = function(){
    return mysql.createConnection({
      host     : '10.237.96.215',
      user     : 'grp',
      password : 'cmcc$#21',
      database : 'grp_product'
    });    
  }
}

// var conn = new connection();
// var conns = conn.getconnection()
// conns.connect()
// var  sql = 'SELECT * FROM grp_user';
// conns.query(sql,function (err, result) {
//         if(err){
//           console.log('[SELECT ERROR] - ',err.message);
//           return;
//         }
 
//        console.log('--------------------------SELECT----------------------------');
//        console.log(result[0]);
//        console.log('------------------------------------------------------------\n\n');  
// });
// conns.end();

module.exports = connection
