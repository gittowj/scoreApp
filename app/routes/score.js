var express = require('express');
var xlsx = require('node-xlsx');
var router = express.Router();
var scoreDao = require('../dao/scoreDao');
var studentDao = require('../dao/studentDao');
var gradeDao = require('../dao/gradeDao');
// var pagination = require('pagination');
var async = require('async');

// /* GET users listing. */
// router.get('/score', function(req, res, next) {
//   res.render('admin/score', { title: 'hello world' });
// }); 

function getByStudent(students, student){
  var obj = null;
  for(var i = 0; i < students.length; i++){
    obj = students[i];
    if(obj.no == student.no && obj.school == student.school){
      //students.splice(i, 1);
      return obj;
    }
  }

  return null;
}

function getByGrade(grades, grade){
  var obj = null;
  for(var i = 0; i < grades.length; i++){
    obj = grades[i];
    if(obj.studentId == grade.studentId && obj.class == grade.class){
      //grades.splice(i, 1);
      return obj;
    }
  }

  return null;
}

module.exports = {
  importScoreFromFile : function (filePath, school, grade, next){ 
    var obj = xlsx.parse(filePath);
    var datas = obj[0].data; 
    var students;
    var grades;

    console.log(datas.length);
    var execOptions = ['getStudent', 'getGrade'];
    async.concatSeries(execOptions, function(option,callback) {
      var req = new Object();
      req.query = new Object();
      req.query.school = school;

      if(option == 'getStudent'){
          
          studentDao.queryByStudent(req, function(core, rows){
              if(core == 1){
                students = rows;
              }
              callback(null, 1);
          });
      }else{
        gradeDao.queryByStudent(req, function(core, rows){
            if(core == 1){
              grades = rows;
            }
            callback(null, 1);
        });

      }
    }, function(err, values) {
        bachUpdateStudent();
    });

    

    
    var bachUpdateGrade = function(){
      var reqBatchUpdate = new Object();
      reqBatchUpdate.params = new Object();
      reqBatchUpdate.params.edits = new Array;
      reqBatchUpdate.params.inserts = new Array;

      console.log(datas.length);
      for(var i = 1; i < datas.length; i++){
          var data = datas[i];

          var score = new Object();
          // score.school = school;
          // score.grade = grade;
          // score.no = data[0];
          // score.name = data[1];

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

          var student = new Object();
          student.school = school;
          student.grade = grade;
          student.no = data[0];
          student.name = data[1];

          var OldStudent = getByStudent(students, student);
          if(OldStudent){
            score.studentId = OldStudent.id;
          }else{
            continue;
          }

          var OldGrade = getByGrade(grades, score);
          if(OldGrade){
            score.id = OldGrade.id;
            reqBatchUpdate.params.edits.push(score);
          }else{
            reqBatchUpdate.params.inserts.push(score);
          }
      }

      gradeDao.batchUpdate(reqBatchUpdate, function(err){
        next(1, null);
      });
    }

    var bachUpdateStudent = function(){
      var reqBatchUpdate = new Object();
      reqBatchUpdate.params = new Object();
      reqBatchUpdate.params.edits = new Array;
      reqBatchUpdate.params.inserts = new Array;

       for(var i = 1; i < datas.length; i++){
         var data = datas[i];
         var student = new Object();
          student.school = school;
          student.grade = grade;
          student.no = data[0];
          student.name = data[1];


          var OldStudent = getByStudent(students, student);
          if(OldStudent){
            if(OldStudent.name == student.name){
              continue;
            }
            student.id = (OldStudent.id);
            reqBatchUpdate.params.edits.push(student);
          }else{
            reqBatchUpdate.params.inserts.push(student);
          }
      }


      studentDao.batchUpdate(reqBatchUpdate, function(err){
          var req = new Object();
          req.query = new Object();
          req.query.school = school;
          studentDao.queryByStudent(req, function(core, rows){
              if(core == 1){
                students = rows;
              }
              bachUpdateGrade();
          });
          
      });
    };


    // var req = new Object();
    // req.query = new Object();
    // req.query.school = school;
    // studentDao.queryByStudent(req, function(core, rows){
    //     if(core == 1){
    //       students = rows;
    //     }
    //     bachUpdateStudent();
    // });
    
    // async.concatSeries(execOptions, function(option,callback) {
    //   var req = new Object();
    //   req.query = new Object();
    //   req.query.school = school;

    //   if(option == 'getStudent'){
          
    //       studentDao.queryByStudent(req, function(core, rows){
    //           if(core == 1){
    //             students = rows;
    //           }
    //           callback(null, 1);
    //       });
    //   }else{
    //     gradeDao.queryByStudent(req, function(core, rows){
    //         if(core == 1){
    //           grades = rows;
    //         }
    //         callback(null, 1);
    //     });

    //   }
    // }, function(err, values) {

		// });

    

    // for(var i = 1; i < datas.length & i < 20; i++){
    //     // var data = datas[i];

    //     // var score = new Object();
    //     // score.school = school;
    //     // score.grade = grade;
    //     // score.no = data[0];
    //     // score.name = data[1];

    //     // score.class = data[2];
    //     // score.score = data[3];
    //     // score.gradeOrder = data[4];
    //     // score.classOrder = data[5];

    //     // score.englishScore = data[6];
    //     // score.englishGradeOrder = data[7];
    //     // score.englishClassOrder = data[8];

    //     // score.chineseScore = data[9];
    //     // score.chineseGradeOrder = data[10];
    //     // score.chineseClassOrder = data[11];

    //     // score.mathScore = data[12];
    //     // score.mathGradeOrder = data[13];
    //     // score.mathClassOrder = data[14];

    //     // score.geographyScore = data[15];
    //     // score.geographyGradeOrder = data[16];
    //     // score.geographyClassOrder = data[17];

    //     // score.historyScore = data[18];
    //     // score.historyGradeOrder = data[19];
    //     // score.historyClassOrder = data[20];

    //     // score.politicsScore = data[21];
    //     // score.politicsGradeOrder = data[22];
    //     // score.politicsClassOrder = data[23];


    //     // score.physicsScore = data[24];
    //     // score.physicsGradeOrder = data[25];
    //     // score.physicsClassOrder = data[26];

    //     // score.biologyScore = data[27];
    //     // score.biologyGradeOrder = data[28];
    //     // score.biologyClassOrder = data[29];


    //     // score.chemistryScore = data[30];
    //     // score.chemistryGradeOrder = data[31];
    //     // score.chemistryClassOrder = data[32];

    //     // var student = new Object();
    //     // student.school = school;
    //     // student.grade = grade;
    //     // student.no = data[0];
    //     // student.name = data[1];

    //      var OldStudent = getByStudent(students, score);
    //      if(OldStudent){
    //        student.id = (OldScore.id);
    //        req.params.edits.push(student);
    //      }else{
    //        req.params.inserts.push(student);
    //      }
    // }
      
    //  scoreDao.bachAdd(req, null, next);
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



