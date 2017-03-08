var path = require('path');
var xlsx = require('node-xlsx');
var fs = require('fs');
var scoreDao = require('../dao/scoreDao');
var studentDao = require('../dao/studentDao');
var userDao = require('../dao/userDao');
var chargeDao = require('../dao/chargeDao');
var upload = require('../util/upload');
var score = require('./score');

function checkLogin(req, res){
  if(!req.session.user){ 					
		res.redirect("/admin/login");
    return false;
	}
  return true;
}

module.exports = function(router){
/* GET users listing. */
router.get('/admin', function (req, res, next) {
  if(checkLogin(req, res) == false){
    return;
  }
  res.render('admin/index', { title: 'hello world', user: req.session.user});
});

router.get('/admin/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect("/admin/login");
});

router.get('/admin/student', function (req, res, next) {
  if(checkLogin(req, res) == false){
    return;
  }
  res.render('admin/student', { title: '学生管理' });
});

router.post('/admin/getStudentList', function (req, res, next) {
   if(checkLogin(req, res) == false){
      return;
    }
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
    if(checkLogin(req, res) == false){
      return;
    }
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
  if(checkLogin(req, res) == false){
      return;
    }
    res.render('admin/score', { title: '学分管理' });
});

router.post('/admin/getScoreList', function (req, res, next) {
    if(checkLogin(req, res) == false){
      return;
    }
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
  if(checkLogin(req, res) == false){
    return;
  }
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

router.get('/admin/user', function (req, res, next) {
    if(checkLogin(req, res) == false){
      return;
    }
    res.render('admin/user', { title: '用户管理' });
});

router.post('/admin/userSave', function(req, res, next){
  if(checkLogin(req, res) == false){
    return;
  }
  var user = new Object();
  if(req.query.username){
      user.username = req.query.username;
    };
    if(req.body.username){
      user.username = req.body.username;
    }

    if(req.query.passwd){
      user.passwd = req.query.passwd;
    };
    if(req.body.passwd){
      user.passwd = req.body.passwd;
    }

    if(req.query.cname){
      user.cname = req.query.cname;
    };
    if(req.body.cname){
      user.cname = req.body.cname;
    }


    if(req.query.email){
      user.email = req.query.email;
    };
    if(req.body.email){
      user.email = req.body.email;
    }

    if(req.query.mobilenum){
      user.mobilenum = req.query.mobilenum;
    };
    if(req.body.mobilenum){
      user.mobilenum = req.body.mobilenum;
    }

    if(req.query.id){
      user.id = parseInt(req.query.id);
    };
    if(req.body.id){
      user.id = parseInt(req.body.id);
    }

    if(!user.username || !user.passwd || user.passwd.length > 6){
       res.send({ "rtnCode": "0", "message": "请输入用户名和6位数的密码" });
       return;
    }

    userDao.getUser(user, function(err, row){
        if(row != null){
             res.send({ "rtnCode": "0", "message": "该用户名已经存在" });
        }else{
          if(user.id){
            userDao.edit(user, function(err){
              if(err){
                res.send({ "rtnCode": "0", "message": "修改失败" });
              }else{
                res.send({ "rtnCode": "1", "message": "修改成功" });
              }
            });
          }else{

            userDao.add(user, function(err){
              if(err){
                res.send({ "rtnCode": "0", "message": "新增失败" });
              }else{
                res.send({ "rtnCode": "1", "message": "新增成功" });
              }
            });
          }
        }
    });
    

});

router.post('/admin/deleteUser', function (req, res, next) {
  if(checkLogin(req, res) == false){
    return;
  } 
  var id = null;
  if(req.query.id){
    id = req.query.id;
  }else if(req.body.id){
    id = req.body.id;
  }

  if(id == null){
     res.send({ "rtnCode": "0", "message": "删除失败" });
     return;
  }
  userDao.deleteById(id, function(code){ 
    if(code = 0){
         res.send({ "rtnCode": "0", "message": "删除失败" });
    }else{
       res.send({ "rtnCode": "1", "message": "删除成功" });
    }
  });
});

router.post('/admin/getUserList', function(req, res, next){
  if(checkLogin(req, res) == false){
    return;
  }
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

    var user = new Object();
    if(req.query.user_name){
      user.username = req.query.user_name;
    };
    if(req.body.user_name){
      user.username = req.body.user_name;
    }


    userDao.getUserByPage(user,page, rowcount, 0,function (err, result) {
          if(err){
            res.send(err);
          }else{
              res.json(result);
          }

         res.end();
         // res.render('admin/scorelist', { scores:scores});
    });
});

/* GET users listing. */
router.get('/admin/login', function (req, res, next) {
  res.render('admin/login', { title: '登录' });
});

router.post('/user/checkLogin', function(req, res, next){
    var user = new Object();
    if(req.query.username){
      user.username = req.query.username;
    };
    if(req.body.username){
      user.username = req.body.username;
    }

    if(req.query.passwd){
      user.passwd = req.query.passwd;
    };
    if(req.body.passwd){
      user.passwd = req.body.passwd;
    }

    if(!user.username || !user.passwd){
      res.send({ "code": "0", "message": "请输入用户名和密码" });
      return;
    }

    userDao.getUser(user, function(err, row){
      if(err || row == null){
        res.send({ "code": "0", "message": "用户名或密码错误" });
      }else{
        req.session.user = row[0];
        res.send({ "code": "1", "message": "成功" });
      }
    });
});


router.get('/admin/charge', function (req, res, next) {
  if(checkLogin(req, res) == false){
    return;
  }
  res.render('admin/charge', { title: '收费管理' });
});


router.post('/admin/getChargeList', function(req, res, next){
    if(checkLogin(req, res) == false){
      return;
    }
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

    var charge = new Object();
    if(req.query.charge_school){
      charge.school = req.query.charge_school;
    };
    if(req.body.charge_school){
      charge.school = req.body.charge_school;
    }

    if(req.query.charge_no){
      charge.no = req.query.charge_no;
    };
    if(req.body.charge_no){
      charge.no = req.body.charge_no;
    }

    if(req.query.charge_name){
      charge.name = req.query.charge_name;
    };
    if(req.body.charge_name){
      charge.name = req.body.charge_name;
    }

    if(req.query.charge_type && req.query.charge_type != 0){
      charge.type = req.query.charge_type;
    };
    if(req.body.charge_type && req.body.charge_type != 0){
      charge.type = req.body.charge_type;
    }


    chargeDao.getChargeByPage(charge,page, rowcount, 0,function (err, result) {
          if(err){
            res.send(err);
          }else{
              res.json(result);
          }

         res.end();
         // res.render('admin/scorelist', { scores:scores});
    });
});

};
