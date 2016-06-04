// var express = require('express');
// var router = express.Router();

/* GET home page.  路由控制器和实现路由功能的函数都放到 index.js 里，app.js 中只有一个总的路由接口。*/
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
var crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	Comment = require('../models/comment.js');
var multer  = require('multer');
var upload = multer();
var storage = multer.diskStorage({
			    destination: function (req, file, cb){
			        cb(null, './public/images')
			    },
			    filename: function (req, file, cb){
			        cb(null, file.originalname)
			    }
			});
var upload = multer({
    storage: storage
});

module.exports = function(app) {
	  app.get('/', function (req, res) {
	  	// 判断是否为第 一页
	    var page = parseInt(req.query.p) || 1;
	    // 查询并返回第 page 页的 10 篇文章
	  	Post.getTen(null, page, function (err, posts, total){
	  		if(err) {
	  			posts = [];
	  		}
	  		res.render('index', { 
		    	title: '主页',
		    	user: req.session.user,
		    	posts: posts,
		    	page: page,
		    	isFirstPage: (page - 1) == 0,
		    	isLastPage: ((page - 1) * 10 + posts.length) == total,
		    	success: req.flash('success').toString(),
		    	error: req.flash('error').toString()
	     });
	  	})
	  });

	  app.get('/reg', checkNotLogin);
	  app.get('/reg', function (req, res) {
	    res.render('reg', { 
	    	title: '注册',
	    	user: req.session.user,
	    	success: req.flash('success').toString(),
	    	error: req.flash('error').toString()
	     });
	  });

	  app.post('/reg', checkNotLogin);
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

	  app.get('/login', checkNotLogin);
	  app.get('/login', function (req, res) {
	    res.render('login', {
	      title: '登录',
	      user: req.session.user,
	      success: req.flash('success').toString(),
          error: req.flash('error').toString()
	 	});
	  });

	  app.post('/login', checkNotLogin);
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

	  app.get('/post', checkLogin);
	  app.get('/post', function (req, res) {
	    res.render('post', {
	      title: '发表',
	      user: req.session.user,
	      success: req.flash('success').toString(),
          error: req.flash('error').toString()
	  	});
	  });

	  app.post('/post', checkLogin);
	  app.post('/post', function (req, res) {
	  	var currentUser = req.session.user,
	  		post = new Post(currentUser.name, req.body.title, req.body.post);
	  	post.save(function (err) {
	  		if(err) {
	  			req.flash('error',err);
	  			return res.redirect('/');
	  		}
	  		req.flash('success', '发布成功');
	  		res.redirect('/');
	  	})
	  });

	  app.get('/logout', checkLogin);
	  app.get('/logout', function (req, res) {
	  	req.session.user = null;
	  	req.flash('success', '登出成功');
	  	res.redirect('/');
	  });

	  app.get('/upload', checkLogin);
	  app.get('/upload', function (req, res) {
		  res.render('upload', {
		    title: '文件上传',
		    user: req.session.user,
		    success: req.flash('success').toString(),
		    error: req.flash('error').toString()
		  });
	  });

	  app.post('/upload', checkLogin);
	  app.post('/upload', upload.array('field1', 5), function (req, res) {
		    req.flash('success', '文件上传成功!');
		    res.redirect('/upload');
	  });

	  // 用户文章列表
	  app.get('/u/:name', function (req, res) {
	  	  var page = parseInt(req.query.p, 10) || 1;
		  //检查用户是否存在
		  User.get(req.params.name, function (err, user) {
		    if (!user) {
		      req.flash('error', '用户不存在!'); 
		      return res.redirect('/');//用户不存在则跳转到主页
		    }
		    //查询并返回该用户的所有文章
		    Post.getTen(user.name, page, function (err, posts, total) {
		      if (err) {
		        req.flash('error', err); 
		        return res.redirect('/');
		      } 
		      res.render('user', {
		        title: user.name,
		        posts: posts,
		        user : req.session.user,
		        page: page,
		        isFirstPage: (page - 1) == 0,
		        isLastPage: ((page - 1) * 10 + posts.length) == total,
		        success : req.flash('success').toString(),
		        error : req.flash('error').toString()
		      });
		    });
		  }); 
		});

	  //  文章页面
	  app.get('/u/:name/:day/:title', function (req, res) {
		  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
		    if (err) {
		      req.flash('error', err); 
		      return res.redirect('/');
		    }
		    res.render('article', {
		      title: req.params.title,
		      post: post,
		      user: req.session.user,
		      success: req.flash('success').toString(),
		      error: req.flash('error').toString()
		    });
		  });
		});

	  //  编辑文章
	  app.get('/edit/:name/:day/:title', checkLogin);
		app.get('/edit/:name/:day/:title', function (req, res) {
		  var currentUser = req.session.user;
		  Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
		    if (err) {
		      req.flash('error', err); 
		      return res.redirect('back');
		    }
		    res.render('edit', {
		      title: '编辑',
		      post: post,
		      user: req.session.user,
		      success: req.flash('success').toString(),
		      error: req.flash('error').toString()
		    });
		  });
		});

		// 更新文章
		app.post('/edit/:name/:day/:title', checkLogin);
			app.post('/edit/:name/:day/:title', function (req, res) {
			  var currentUser = req.session.user;
			  Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
			    var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
			    if (err) {
			      req.flash('error', err); 
			      return res.redirect(url);//出错！返回文章页
			    }
			    req.flash('success', '修改成功!');
			    res.redirect(url);//成功！返回文章页
			});
		});

	    //  删除文章
	    app.get('/remove/:name/:day/:title', checkLogin);
		app.get('/remove/:name/:day/:title', function (req, res) {
		  var currentUser = req.session.user;
		  Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
		    if (err) {
		      req.flash('error', err); 
		      return res.redirect('back');
		    }
		    req.flash('success', '删除成功!');
		    res.redirect('/');
		  });
		});

		// 评论
		app.post('/u/:name/:day/:title', function (req, res) {
		  var date = new Date(),
		      time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
		             date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		  var comment = {
		      name: req.body.name,
		      email: req.body.email,
		      website: req.body.website,
		      time: time,
		      content: req.body.content
		  };
		  var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
		  newComment.save(function (err) {
		    if (err) {
		      req.flash('error', err); 
		      return res.redirect('back');
		    }
		    req.flash('success', '留言成功!');
		    res.redirect('back');
		  });
		});


	  function checkLogin(req, res, next) {
	  	if(!req.session.user) {
	  		req.flash('error', '未登录');
	  		res.redirect('/login');
	  	}
	  	next();
	  }

	  function checkNotLogin(req, res, next) {
	    if (req.session.user) {
	      req.flash('error', '已登录!'); 
	      res.redirect('back');
	    }
	    next();
	  }
}
