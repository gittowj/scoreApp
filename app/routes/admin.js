var path = require('path');
var xlsx = require('node-xlsx');
var fs = require('fs');
var scoreDao = require('../dao/scoreDao');
var studentDao = require('../dao/studentDao');
var upload = require('../util/upload');
var score = require('./score');

module.exports = function(router){
router.get('/jj', function (req, res, next) {
  res.render('jj', { result: null });
});
  /* GET users listing. */
router.get('/admin', function (req, res, next) {
  res.render('admin/index', { title: 'hello world' });
});

router.get('/admin/score1', function (req, res, next) {
  res.render('admin/score1', { title: 'hello world' });
});

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
};
