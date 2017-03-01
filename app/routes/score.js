var express = require('express');
var xlsx = require('node-xlsx');
var router = express.Router();
var scoreDao = require('../dao/scoreDao');
// var pagination = require('pagination');

// /* GET users listing. */
// router.get('/score', function(req, res, next) {
//   res.render('admin/score', { title: 'hello world' });
// }); 

function getByScore(scores, scroe){
  var obj = null;
  for(var i = 0; i < scores.length; i++){
    obj = scores[i];
    if(obj.no == scroe.no && obj.name == scroe.name){
      scores.splice(i, 1);
      return obj;
    }
  }

  return null;
}

module.exports = {
  importScoreFromFile : function (filePath, school, grade, next){ 
    var obj = xlsx.parse(filePath);
    var datas = obj[0].data; 
    var req = new Object();
    req.params = new Array();

    for(var i = 1; i < datas.length & i < 20; i++){
        var data = datas[i];

        var score = new Object();
        score.school = school;
        score.grade = grade;
        score.no = data[0];
        score.name = data[1];

        score.class = data[2];
        score.score = data[3];
        score.gradeOrder = data[4];
        score.classOrder = data[5];

        score.englishScore = data[6];
        score.englishGradeOrder = data[7];
        score.englishClassOrder = data[8];

        score.chineseScore = data[9];
        score.chineseGradeOrder = data[10];
        score.chineseClassOrder = data[11];

        score.mathScore = data[12];
        score.mathGradeOrder = data[13];
        score.mathClassOrder = data[14];

        score.geographyScore = data[15];
        score.geographyGradeOrder = data[16];
        score.geographyClassOrder = data[17];

        score.historyScore = data[18];
        score.historyGradeOrder = data[19];
        score.historyClassOrder = data[20];

        score.politicsScore = data[21];
        score.politicsGradeOrder = data[22];
        score.politicsClassOrder = data[23];


        score.physicsScore = data[24];
        score.physicsGradeOrder = data[25];
        score.physicsClassOrder = data[26];

        score.biologyScore = data[27];
        score.biologyGradeOrder = data[28];
        score.biologyClassOrder = data[29];


        score.chemistryScore = data[30];
        score.chemistryGradeOrder = data[31];
        score.chemistryClassOrder = data[32];

        req.params[i-1] = score;
    }
      
     scoreDao.bachAdd(req, null, next);
  },
  getCount: function(req, res, next){
    scoreDao.getCount(req, function (count_err, count_result) {
        if (count_err) {
          count_result = 1;
        };
        count_all_result = count_result[0].count_all_result;
        total_rows = count_all_result ;
        next(total_rows);
      });
  }

}



