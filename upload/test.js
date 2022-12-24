const fs = require("fs"); // 引入文件读写模块


path = 'zx_product/desc/1231231'

if(!fs.existsSync(path)){
	fs.mkdirSync(path)
}
console.log(fs.readdirSync('zx_product/desc'))