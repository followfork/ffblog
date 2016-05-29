// var express = require('express');
// var router = express.Router();

/* GET home page.  路由控制器和实现路由功能的函数都放到 index.js 里，app.js 中只有一个总的路由接口。*/
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = function(app) {
	  app.get('/', function (req, res) {
	    res.render('index', { title: '主页' });
	  });
	  app.get('/reg', function (req, res) {
	    res.render('reg', { title: '注册' });
	  });
	  app.post('/reg', function (req, res) {
	  });
	  app.get('/login', function (req, res) {
	    res.render('login', { title: '登录' });
	  });
	  app.post('/login', function (req, res) {
	  });
	  app.get('/post', function (req, res) {
	    res.render('post', { title: '发表' });
	  });
	  app.post('/post', function (req, res) {
	  });
	  app.get('/logout', function (req, res) {
	  });
};
