// var express = require('express');
// var router = express.Router();

/* GET home page.  路由控制器和实现路由功能的函数都放到 index.js 里，app.js 中只有一个总的路由接口。*/
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
var crypto = require('crypto'),
	User = require('../models/user.js')

module.exports = function(app) {
	  app.get('/', function (req, res) {
	    res.render('index', { 
	    	title: '主页',
	    	user: req.session.user,
	    	success: req.flash('success').toString(),
	    	error: req.flash('error').toString()
	     });
	  });

	  app.get('/reg', function (req, res) {
	    res.render('reg', { 
	    	title: '注册',
	    	user: req.session.user,
	    	success: req.flash('success').toString(),
	    	error: req.flash('error').toString()
	     });
	  });

	  app.post('/reg', function (req, res) {
	  	var name = req.body.name,
	  	 	password = req.body.password,
	  	 	password_re = req.body['password-repeat'];
	  	//  检验密码是否一致
	  	if(password != password_re){
	  		req.flash('error', '密码不一致');
	  		return res.redirect('/reg');
	 	 }
	 	 // 生成md5
	 	var md5 = crypto.createHash('md5'),
	 	 	 password = md5.update(password).digest('hex');
	 	var newUser = new User({
	 		name: name,
	 		password: password,
	 		email: req.body.email
	 	});
	 	//检测 用户信息是否存在
	 	User.get(newUser.name, function (err, user){
	 		if(err){
	 			req.flash('error', err);
	 			return res.redirect('/');
	 		}
	 		if(user){
	 			req.flash('error', '用户已存在');
	 			return res.redirect('/reg');
	 		}
		 	// 不存在 则 新增用户
		 	newUser.save(function (err, user){
		 		if(err){
		 			req.flash('error', err);
		 			return res.redirect('/reg');
		 		}
		 		req.session.user = newUser;
		 		req.flash('success', '注册成功');
		 		res.redirect('/');
		 	})
	    })
	  });

	  app.get('/login', function (req, res) {
	    res.render('login', {
	      title: '登录',
	      user: req.session.user,
	      success: req.flash('success').toString(),
          error: req.flash('error').toString()
	 	});
	  });

	  app.post('/login', function (req, res) {
	  	// 生成md5
	  	var md5 = crypto.createHash('md5'),
	  		password = md5.update(req.body.password).digest('hex');
	  	// 检查用户是否存在
	  	User.get(req.body.name, function (err, user) {
	  		if(!user) {
	  			req.flash('error', '用户不存在');
	  			return res.redirect('/login');
	  		}
	  		if(user.password != password) {
	  			req.flash('error','密码错误');
	  			return res.redirect('/login');
	  		}
	  		req.session.user = user;
	  		req.flash('success', '登录成功');
	  		res.redirect('/');
	  	});
	  });
	  app.get('/post', function (req, res) {
	    res.render('post', { title: '发表' });
	  });
	  app.post('/post', function (req, res) {
	  });

	  app.get('/logout', function (req, res) {
	  	req.session.user = null;
	  	req.flash('success', '登出成功');
	  	res.redirect('/');
	  });
}
