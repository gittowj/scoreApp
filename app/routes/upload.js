var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var score = require('./score');

// 处理表单及文件上传的中间件
router.use(require('express-formidable')({
  // uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
  keepExtensions: true// 保留后缀
}));



//导入成绩
router.post('/admin/uploadScore', function (req, res, next) {
  var file = req.files.file;
  var tmp_path = file.path;

  var filename = file.name.split('_');

  if(filename.length < 3){
    res.send({ "rtnCode": "-1", "rtnInfo": "文档的名字不对，应为‘学校_班级_成绩标识’" }); 
     return ;
  }
  var school = filename[0];
  var grade = filename[1];
  var title = filename[2].split('.')[0];

  var newName = Date.now() + path.extname(file.name);
  //var new_path = path.resolve("../public/upload/" + newName);
  newName = "excelfile.XLSX";
  var new_path = path.resolve("C:/" + newName);
  fs.rename(tmp_path, new_path, function (err) {
    if (err) {
      res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" }); 
    }else{
      score.importScoreFromFile(new_path, school, grade, title, function(code, err){
        if (code == 0) 
            res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" });
        else
            res.send({ "rtnCode": "0", "rtnInfo": "上传成功" });
      });
      
    }
  });

  //new_path = path.resolve("C:/萍乡四中2016年下学期初三期中考试成绩.xlsx");
});


//导入成绩
router.post('/searchScore', function (req, res, next) {
  var file = req.files.file;
  var tmp_path = file.path;

  var filename = file.name.split('_');

  if(filename.length < 3){
    res.send({ "rtnCode": "-1", "rtnInfo": "文档的名字不对，应为‘学校_班级_成绩标识’" }); 
     return ;
  }
  var school = filename[0];
  var grade = filename[1];
  var title = filename[2].split('.')[0];

  var newName = Date.now() + path.extname(file.name);
  //var new_path = path.resolve("../public/upload/" + newName);
  newName = "excelfile.XLSX";
  var new_path = path.resolve("C:/" + newName);
  fs.rename(tmp_path, new_path, function (err) {
    if (err) {
      res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" }); 
    }else{
      score.importScoreFromFile(new_path, school, grade, title, function(code, err){
        if (code == 0) 
            res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" });
        else
            res.send({ "rtnCode": "0", "rtnInfo": "上传成功" });
      });
      
    }
  });

  //new_path = path.resolve("C:/萍乡四中2016年下学期初三期中考试成绩.xlsx");
});

module.exports = router;
