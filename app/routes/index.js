var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var scoreDao = require('../dao/scoreDao');
// var wchatPay = require('../public/wxpay/wchatPay');
// var moment = require("moment");



module.exports = function(router){
  /* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { result: null });
});

  /* GET home page. */
router.get('/score', function (req, res, next) {
  if(!req.session.score){ 					
		res.redirect("/");
	}
  res.render('score', { title:'Home', score:  req.session.score});
});


router.post('/searchScore', function(req, res, next){
      var score = new Object();
      score.name = '';
      score.no = '';
      score.school = '';
      if(req.query.score_name){
        score.name = req.query.score_name;
      }
      if(req.body.score_name){
        score.name = req.body.score_name;
      }

      if(req.query.score_no){
        score.no = req.query.score_no;
      }
      if(req.body.score_no){
        score.no = req.body.score_no;
      }

      if(req.query.score_school){
        score.school = req.query.score_school;
      }
      if(req.body.score_school){
        score.school = req.body.score_school;
      }

      
      if(score.school == '' || score.no == '' || score.name == ''){
              var result  = new Object();
              result.code = 0;
              result.message = "请输入学校、学号和姓名";
              res.send(result);
      }else{
              scoreDao.queryByStudent(score, function(rows){
                var result  = new Object();
                if(rows == null || rows.length <= 0){
                    result.code = 0;
                    result.message = "没有找到该考生的成绩"
                    res.send(result); 
                }else{
                  result.code = 1;
                  req.session.score = rows[0];
                  res.send(result);
                }
              });
      }
   
});



// //微信支付
// router.get('/sign', wchatPay.sign());

// router.get('/getcode', function(req, res, next){
//         var obj = new Object();
//         obj.attach = "test";
//         obj.body = "test";
//         obj.nonce_str = "";
//         obj.openid = "";
//         obj.out_trade_no = moment(new Date()).format('YYYYMMDDHHmmss');
//         obj.spbill_create_ip = "120.25.194.53";
//         obj.total_fee = "1";
//         obj.code = "code";

//         var url = "https://5dfdc605.ngrok.io/admin/sign";
//          wchatPay.getOauthUrlForCode(obj, url);
// });

// router.get('/wxpay', function(req, res, next){
//   res.render('admin/index', { title: 'hello world' });
// });
};
