var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session'); 

var config = require('./conf/config');
var routes = require('./routes/index'); 
var admin = require('./routes/admin');
var upload = require('./routes/upload');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// //app.set('view engine', 'ejs');
// app.set('view engine','html');
// app.engine('.html',require('ejs').__express);//注册html视图引擎

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ limit:'10mb',extended:true}));
app.use(bodyParser.json({limit:'10mb'}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({
    extended: false,
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

// session 中间件
app.use(session({
  resave:false,//添加这行  
  saveUninitialized: true,//添加这行 
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  }
}));



// 设置模板全局常量
app.locals.blog = {
  title: "考试查分系统",
  description: "小系统"
};

// app.use('/', routes);
// //app.use('/admin', admin);
routes(app);
admin(app);
app.use(upload);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

module.exports = app;
