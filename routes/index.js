// var express = require('express');
// var router = express.Router();

/* GET home page.  路由控制器和实现路由功能的函数都放到 index.js 里，app.js 中只有一个总的路由接口。*/
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = function(app) {
	app.get('/', function(req, res ,next) {
		res.render('index', { title: 'Express'});
	})
};
