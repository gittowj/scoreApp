var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var scoreDao = require('../dao/scoreDao');

var wchatPay = require('../public/wxpay/wchatPay');
var moment = require("moment");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { result: null });
});

router.post('/searchScore', function(req, res, next){
 if(req.query.no == null || req.query.name == '' || req.query.name == null || req.query.name == '' ){
        var result  = new Object();
        result.code = 0;
        result.message = "请输入学号和姓名";
        res.render('score', { "result": result });
 }else{
        var query = new Object();
        var params = new Object();
        params.no = req.query.no;
        params.name = req.query.name;
        query.params = params;

        scoreDao.queryByStudent(query, function(rows){
          var result  = new Object();
          if(rows == null || rows.length <= 0){
              result.code = 0;
              result.message = "没有找到该考生的成绩"
          }else{
            result.code = 1;
            result.message = null;
            result.obj = rows[0];
          }

          //res.send({ "result": result }); 
          res.render('score', { "result": result });
        });
 }
   
});


/* GET import excel test. */
router.get('/importExcel', function (req, res, next) {
  var filename = './public/test.xlsx';
  console.error(filename);
  // read from a file  
  var obj = xlsx.parse(filename);
  console.log(JSON.stringify(obj));
  res.send('import successfully!');
});

router.get('/up', function (req, res) {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload" multiple="multiple"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
  );
});


router.post('/upload', function (req, res) {
  console.log(" ########## POST /upload ####### ");
  var fileTypeError = false;
  var target_path = path.resolve('./public/upload');
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.uploadDir = target_path;
  var fields = [];
  var files = [];
  form.on('field', function (field, value) {
    fields.push([field, value]);
  });
  form.on('file', function (field, file) {
    console.log('upload file: ' + file.name);
    //判断文件类型是否是xlsx  
    if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      fileTypeError = true;
    }
    files.push([field, file]);
  });

  form.on('end', function () {

    //遍历上传文件  
    var fileName = '';
    var obj = '';
    var folder_exists = fs.existsSync(target_path);
    if (folder_exists) {
      var dirList = fs.readdirSync(target_path);
      dirList.forEach(function (item) {
        if (!fs.statSync(target_path + '/' + item).isDirectory()) {
          console.log('parse item:' + target_path + '/' + item);
          fileName = target_path + '/' + item;
          if (!fileTypeError) {
            //解析excel  
            obj = xlsx.parse(fileName);
            console.log(JSON.stringify(obj));
            //insert into DB  
            //todo  
            res.send({ "rtnCode": "0", "rtnInfo": "成功导入数据" });
          } else {
            res.send({ "rtnCode": "1", "rtnInfo": "文件格式不正确" });
          }
          //delete file  
          fs.unlinkSync(fileName);

        }
      });
    } else {
      res.send({ "rtnCode": "1", "rtnInfo": "系统错误" });
    }
  });

  form.on('error', function (err) {
    res.send({ "rtnCode": "1", "rtnInfo": "上传出错" });
  });

  form.on('aborted', function () {
    res.send({ "rtnCode": "1", "rtnInfo": "放弃上传" });
  });

  form.parse(req);
});


//微信支付
router.get('/sign', wchatPay.sign());

router.get('/getcode', function(req, res, next){
        var obj = new Object();
        obj.attach = "test";
        obj.body = "test";
        obj.nonce_str = "";
        obj.openid = "";
        obj.out_trade_no = moment(new Date()).format('YYYYMMDDHHmmss');
        obj.spbill_create_ip = "120.25.194.53";
        obj.total_fee = "1";
        obj.code = "code";

        var url = "https://5dfdc605.ngrok.io/admin/sign";
         wchatPay.getOauthUrlForCode(obj, url);
});

router.get('/wxpay', function(req, res, next){
  res.render('admin/index', { title: 'hello world' });
});

module.exports = router;
