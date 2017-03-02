var express = require('express');
var path = require('path');
var xlsx = require('node-xlsx');
var fs = require('fs');
var router = express.Router();
var scoreDao = require('../dao/scoreDao');
var studentDao = require('../dao/studentDao');
var upload = require('../util/upload');
var pagination = require('pagination');
var score = require('./score');
var wchatPay = require('../public/wxpay/wchatPay');
var moment = require("moment");

function getStudentByPage(req, res){
    getByPage(req, function(changePer_page,per_page){
      studentDao.getByPage(changePer_page,per_page, req,function (err, students) {
            if (err) {
              students = [];
            };
            res.render('admin/studentlist', { students:students});
      });
    });
}

function getByPage(req, callback){
  var per_pages = 1;
    if(req.query.page){
      per_pages = req.query.page;
    };
    if(req.body.per_page){
      per_pages = req.body.page;
    }

    var per_page = 20;
    if(req.query.pageCount){
      per_page = req.query.pageCount;
    };
    if(req.body.pageCount){
      per_page = req.body.pageCount;
    }

    var changePer_page = ( per_pages - 1 ) * per_page;
    callback(changePer_page,per_page);
}

module.exports = function(router){
  /* GET users listing. */
router.get('/admin', function (req, res, next) {
  res.render('admin/index', { title: 'hello world' });
});


// 导入学生
router.post('/admin/uploadStudent', function (req, res) {
  res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" }); 
  var file = req.files.file;
  var tmp_path = file.path;
  var newName = Date.now() + path.extname(file.name);
  var new_path = path.resolve("../public/upload/" + newName);
  fs.rename(tmp_path, new_path, function (err) {
    if (err) {
      // res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" }); 
    }
  });
  importStudentFromFile(new_path);
  res.send({ "rtnCode": "0", "rtnInfo": "上传成功" }); 
});

function importStudentFromFile(filePath){ 
  var obj = xlsx.parse(filePath);
  var datas = obj[0].data;
}


router.get('/admin/student', function (req, res, next) {
  res.render('admin/student', { title: '学生管理' });
});

router.post('/admin/getStudentList', function (req, res, next) {
    var page = 1;
    if(req.query.page){
      page = req.query.page;
    };
    if(req.body.page){
      page = req.body.page;
    }

    var rowcount = 20;
    if(req.query.rows){
      rowcount = req.query.rows;
    };
    if(req.body.rows){
      rowcount = req.body.rows;
    }

    var student = new Object();
    if(req.query.student_name){
      student.name = req.query.student_name;
    };
    if(req.body.student_name){
      student.name = req.body.student_name;
    }

    if(req.query.student_no){
      student.no = req.query.student_no;
    };
    if(req.body.student_no){
      student.no = req.body.student_no;
    }

    if(req.query.student_school){
      student.school = req.query.student_school;
    };
    if(req.body.student_school){
      student.school = req.body.student_school;
    }

    studentDao.getStudentByPage(student,page, rowcount, 0,function (err, result) {
          if(err){
            res.send(err);
          }else{
              res.json(result);
          }

         res.end();
    });
});

router.post('/admin/deleteStudent', function (req, res, next) {
   var id = null;
    if(req.query.student_id){
      id = req.query.student_id;
    }else if(req.body.student_id){
      id = req.body.student_id;
    }

    if(id == null){
      res.send({ "rtnCode": "0", "rtnInfo": "删除失败" });
      return;
    }
    studentDao.deleteById(id, function(code){ 
      if(code = 0){
          res.send({ "rtnCode": "0", "rtnInfo": "删除失败" });
      }else{
        res.send({ "rtnCode": "1", "rtnInfo": "删除成功" });
      }
    });
});



router.get('/admin/score', function (req, res, next) {
    res.render('admin/score', { title: '学分管理' });
});

router.post('/admin/getScoreList', function (req, res, next) {
    var page = 1;
    if(req.query.page){
      page = req.query.page;
    };
    if(req.body.page){
      page = req.body.page;
    }

    var rowcount = 20;
    if(req.query.rows){
      rowcount = req.query.rows;
    };
    if(req.body.rows){
      rowcount = req.body.rows;
    }

    var score = new Object();
    if(req.query.score_name){
      score.name = req.query.score_name;
    };
    if(req.body.score_name){
      score.name = req.body.score_name;
    }

    if(req.query.score_no){
      score.no = req.query.score_no;
    };
    if(req.body.score_no){
      score.no = req.body.score_no;
    }

    if(req.query.score_school){
      score.school = req.query.score_school;
    };
    if(req.body.score_school){
      score.school = req.body.score_school;
    }

    scoreDao.getScoreByPage(score,page, rowcount, 0,function (err, result) {
          if(err){
            res.send(err);
          }else{
              res.json(result);
          }

         res.end();
         // res.render('admin/scorelist', { scores:scores});
    });
});




router.post('/admin/deleteScore', function (req, res, next) {
  var id = null;
  if(req.query.score_id){
    id = req.query.score_id;
  }else if(req.body.score_id){
    id = req.body.score_id;
  }

  if(id == null){
     res.send({ "rtnCode": "0", "rtnInfo": "删除失败" });
     return;
  }
  scoreDao.deleteById(id, function(code){ 
    if(code = 0){
         res.send({ "rtnCode": "0", "rtnInfo": "删除失败" });
    }else{
       res.send({ "rtnCode": "1", "rtnInfo": "删除成功" });
    }
  });
});



//导入成绩
router.post('/admin/uploadScore', function (req, res, next) {
  var file = req.files.file;
  var tmp_path = file.path;

  var filename = file.name;
  var school = filename.substring(0, filename.indexOf("("));
  var grade = filename.substring(filename.indexOf("(") + 1, filename.indexOf(")"));

  if(school == "" || grade == ""){
     res.send({ "rtnCode": "-1", "rtnInfo": "文档的名字不对，应为‘学校(班级)’" }); 
     return ;
  }

  var newName = Date.now() + path.extname(file.name);
  //var new_path = path.resolve("../public/upload/" + newName);
  newName = "excelfile.XLSX";
  var new_path = path.resolve("C:/" + newName);
  fs.rename(tmp_path, new_path, function (err) {
    if (err) {
      res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" }); 
    }else{
      score.importScoreFromFile(new_path, school, grade, function(err){
        if (err) 
            res.send({ "rtnCode": "-1", "rtnInfo": "上传失败" });
        else
            res.send({ "rtnCode": "0", "rtnInfo": "上传成功" });
      });
      
    }
  });

  //new_path = path.resolve("C:/萍乡四中2016年下学期初三期中考试成绩.xlsx");
});

router.post('/admin/getScore', function(req, res, next) {
  scoreDao.getCount(req, function(count){
    //req.query.pageCount = count;
    res.send({"pageCount":count});
  });
});

router.post('/admin/getStudent', function(req, res, next) {
  studentDao.getCount(req, function(count){
    //req.query.pageCount = count;
    res.send({"pageCount":count});
  });
});
};
