var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var async = require('async');
var studentDao = require('./studentDao');

var $sql = {
	insert: "INSERT INTO grade(studentId, grade, score, classOrder, gradeOrder, chineseScore, chineseClassOrder, chineseGradeOrder, \
    mathScore, mathClassOrder,mathGradeOrder, englishScore, englishClassOrder, englishGradeOrder, physicsScore, physicsClassOrder, physicsGradeOrder, \
    chemistryScore, chemistryClassOrder,chemistryGradeOrder, biologyScore, biologyClassOrder, biologyGradeOrder, politicsScore, politicsClassOrder, \
    politicsGradeOrder, historyScore, historyClassOrder,historyGradeOrder, geographyScore, geographyClassOrder, geographyGradeOrder) \
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	delete: 'delete from grade', 
	deleteById: delete + ' where id=?',
	queryById: 'select * from score where id=?',
    queryByStudent: 'select * from score where name = ? and no = ?',
	queryAll: 'select * from score'
};


// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if (typeof ret === 'undefined') {
		res.send({
			code: '0',
			msg: '操作失败'
		});
	} else {
		res.send(ret);
	}
};

module.exports = {
	add: function (req, res, next) {
		pool.getConnection(function (err, connection) {
			// 获取前台页面传过来的参数
			var param = req.params;
		});
	},
		
	bachAdd: function (req, res, next) {
		pool.getConnection(function (err, connection) {
			// 获取前台页面传过来的参数
			var params = req.params;
			var insertGrade = function(score, connection, callback){
				var sql = "select id from grade where studentId = ? and grade = ? and class = ?;"
				connection.query("select id from grade where studentId = ? and grade = ? and class = ?;", [score.studentId, score.grade, score.class], function(err, result){
					var param = null;
					if(result[0] && result[0].id){
						//console.log("grade=" + result[0].id);
						score.id = result[0].id;
						sql = "UPDATE grade set score = ?, classOrder = ?, gradeOrder = ?, chineseScore = ?, chineseClassOrder = ?, chineseGradeOrder = ?, \
							mathScore = ?, mathClassOrder = ?,mathGradeOrder = ?, englishScore = ?, englishClassOrder = ?, englishGradeOrder = ?, physicsScore = ?, physicsClassOrder = ?, physicsGradeOrder = ?, \
							chemistryScore = ?, chemistryClassOrder = ?,chemistryGradeOrder = ?, biologyScore = ?, biologyClassOrder = ?, biologyGradeOrder = ?, politicsScore = ?, politicsClassOrder = ?, \
							politicsGradeOrder = ?, historyScore = ?, historyClassOrder = ?,historyGradeOrder = ?, geographyScore = ?, geographyClassOrder = ?, geographyGradeOrder = ? where id = ?;";

						param =  [score.score, score.classOrder, score.gradeOrder, score.chineseScore,
							score.chineseClassOrder, score.chineseGradeOrder, score.mathScore, score.mathClassOrder,score.mathGradeOrder, 
							score.englishScore, score.englishClassOrder, score.englishGradeOrder, score.physicsScore, score.physicsClassOrder, score.physicsGradeOrder,
							score.chemistryScore, score.chemistryClassOrder,score.chemistryGradeOrder, score.biologyScore, score.biologyClassOrder, score.biologyGradeOrder, score.politicsScore, score.politicsClassOrder, 
							score.politicsGradeOrder, score.historyScore, score.historyClassOrder,score.historyGradeOrder,score.geographyScore, score.geographyClassOrder, score.geographyGradeOrder, score.id];
					}else{
						sql = "INSERT INTO grade(studentId, grade, class, score, classOrder, gradeOrder, chineseScore, chineseClassOrder, chineseGradeOrder, \
						mathScore, mathClassOrder,mathGradeOrder, englishScore, englishClassOrder, englishGradeOrder, physicsScore, physicsClassOrder, physicsGradeOrder, \
						chemistryScore, chemistryClassOrder,chemistryGradeOrder, biologyScore, biologyClassOrder, biologyGradeOrder, politicsScore, politicsClassOrder, \
						politicsGradeOrder, historyScore, historyClassOrder,historyGradeOrder, geographyScore, geographyClassOrder, geographyGradeOrder) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \
						?, ?, ?, ?, ?, ?, ?, ?, \
						?, ?, ?, ?, ?, ?, ?);";

						param =  [score.studentId, score.grade, score.class, score.score, score.classOrder, score.gradeOrder, score.chineseScore, score.chineseClassOrder,
							score.chineseGradeOrder, score.mathScore, score.mathClassOrder, score.mathGradeOrder, score.englishScore, score.englishClassOrder, score.englishGradeOrder, score.physicsScore, score.physicsClassOrder,
							score.physicsGradeOrder, score.chemistryScore, score.chemistryClassOrder, score.chemistryGradeOrder, score.biologyScore, score.biologyClassOrder, score.biologyGradeOrder, score.politicsScore, score.politicsClassOrder,
							score.politicsGradeOrder, score.historyScore, score.historyClassOrder, score.historyGradeOrder, score.geographyScore, score.geographyClassOrder, score.geographyGradeOrder];
								
					}

				
					connection.query(sql, param ,function (err, result) {
						var result = new Object();
						if(err){
							result.code = 0;
							result.err = err;
							
							return;
						}else{
							result.code = 1;
						}
						callback(null, result);
						
					});
				});
			};


			var schools = new Array();
			var getStudents = function(school, no, callback){
				var getByStudent = function(){
					var students = schools[param.school]
					var id = 0;
					for(var i = 0; i < students.length; i++){
						obj = students[i];
						if(obj.no == no){
							id = obj.id;

							break;
						}
					}

					callback(id);
				}
				if(schools[param.school] == null){
					var studentReq = new Object();
					studentReq.query.school = param.school;
					studentDao.queryByStudent(studentReq, function(core, rows){
						schools[param.school] = rows;
						getByStudent();
					});
				}else{
					getByStudent();
				}
			}
			async.concatSeries(params, function(param,callback) {
				getStudents(param.school, param.no, function(id){
					if(id == 0){
						var studentsql =  "INSERT INTO student(name, no, school) VALUES (?, ?, ?)";
						connection.query(studentsql, [param.name, param.no, param.school], function (err, result) {
							if(err){
								var result = new Object();
								result.code = 0;
								result.err = err;
								callback(null, result);
								return;
							}

							param.studentId = result.insertId;
							insertGrade(param, connection, callback);						

						});
					}else{
						studentDao.update(param)
					}
				});


					

				connection.query("select id from student where no = ? and school = ?", [param.no, param.school], function(err, result){
					if(result[0] && result[0].id){
						//console.log("ddd=" + result[0].id);
						param.studentId = result[0].id;
						insertGrade(param, connection, callback);
					}else{
						var studentsql =  "INSERT INTO student(name, no, school) VALUES (?, ?, ?)";
						connection.query(studentsql, [param.name, param.no, param.school], function (err, result) {
							if(err){
								var result = new Object();
								result.code = 0;
								result.err = err;
								callback(null, result);
								return;
							}

							param.studentId = result.insertId;
							insertGrade(param, connection, callback);						

						});
					}
				});

				
			}, function(err, values) {
				  if(next){
					next(err);
				}
				// 释放连接 
				connection.release();
			});
		});
	},
	getByPage: function(changePer_page,per_page, req,callback) {
		pool.getConnection(function (err, connection) {
			if(changePer_page==''){
				changePer_page=0;
			};

			var sqlWhere = "";
			if(req.query.school){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school like '%" + req.query.school + "%'"
			}

			if(req.query.no){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no like '%" + req.query.no + "%'"
			}

			if(req.query.name){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name like '%" + req.query.name + "%'"
			}

			var sql ="select * from score " + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " order by id desc limit "+changePer_page+" ,"+per_page;
			connection.query(sql,function(err,rows,fields){
				if(callback){
		 			callback(err,rows);
				}
				// 释放连接 
				connection.release();
		    });
		});
	},
	getCount: function(req, callback) {
		pool.getConnection(function (err, connection) {
			var sqlWhere = "";
			if(req.query.school){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school like '%" + req.query.school + "%'"
			}

			if(req.query.no){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no like '%" + req.query.no + "%'"
			}

			if(req.query.name){
				sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name like '%" + req.query.name + "%'"
			}

			var sql ="select count(0) as count_all_result from score " + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " ;";
			connection.query(sql,function(err,rows,fields){
		 		if(err){
					callback(0);
				}else{
					callback(rows[0].count_all_result);
				}
				// 释放连接 
				connection.release();
		    });
		});
	},
	queryBySchool: function (req, next) {
		pool.getConnection(function (err, connection) {
			// 获取前台页面传过来的参数
			var param = req.params;

            connection.query($sql.query, [param.school], function (err,rows,fields) {
				if (err) {
					next(null);
				}else{
					next(rows);
				}

				// 释放连接 
				connection.release();
			});
		});
	},
	queryByStudent: function (req, next) {
		pool.getConnection(function (err, connection) {
			// 获取前台页面传过来的参数
			var param = req.params;

            connection.query($sql.queryByStudent, [param.name, param.no], function (err,rows,fields) {
				if (err) {
					next(null);
				}else{
					next(rows);
				}

				// 释放连接 
				connection.release();
			});
		});
	},
	queryAll: function(req, next){
		pool.getConnection(function (err, connection) {
			
            connection.query($sql.queryAll, function (err,rows,fields) {
				next(err, rows);
				// 释放连接 
				connection.release();
			});
		});
	},
	deleteById: function(id, next){
		pool.getConnection(function (err, connection) {
			
			connection.query($sql.deleteById, [id], function (err) {
				if (err) {
					next(0);
				}else{
					next(1);
				}
				
				// 释放连接 
				connection.release();
			});
		});
	},
	deleteByIds: function(ids, next){
		if(ids == null || ids.length == 0){
			return;
		}

		pool.getConnection(function (err, connection) {
			var $sqlDelete = $sql.delete + " where id in (" + ids.join(",") + ")";
			connection.query($sqlDelete, function (err) {
				if(next){
					if (err) {
						next(0);
					}else{
						next(1);
					}
					
				}
				
				// 释放连接 
				connection.release();
			});
		});
	}
};