var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var async = require('async');
var $common = require('../conf/common');

var $sql = {
	delete: 'update grade set  isDelete = ' + $common.isDelete.is,
	deleteById: 'update grade set  isDelete = ' + $common.isDelete.is +  '  where id=?',
	queryById: 'select * from grade where id=?',
	queryAll: 'select * from grade'
};

// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

var mqQueries = require('mysql-queries').init($conf.mysql);

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if (typeof ret === 'undefined') {
		res.json({
			code: '1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};


module.exports = {
    batchUpdate : function(req, callback){
		var params = req.params;

		var operations = new Array;
		if(params.edits && params.edits.length > 0){
			operations.push('edit');
		}
		if(params.inserts && params.inserts.length > 0){
			operations.push('insert');
		}


		var insert = function(datas, callback){
			// pool.getConnection(function (err, connection) {
			// 	var sql = "INSERT INTO grade(studentId, class, score, classOrder, gradeOrder, chineseScore, chineseClassOrder, chineseGradeOrder, \
			// 			mathScore, mathClassOrder,mathGradeOrder, englishScore, englishClassOrder, englishGradeOrder, physicsScore, physicsClassOrder, physicsGradeOrder, \
			// 			chemistryScore, chemistryClassOrder,chemistryGradeOrder, biologyScore, biologyClassOrder, biologyGradeOrder, politicsScore, politicsClassOrder, \
			// 			politicsGradeOrder, historyScore, historyClassOrder,historyGradeOrder, geographyScore, geographyClassOrder, geographyGradeOrder) \
			// 			VALUES";
			// 	for(var i = 0; i < datas.length; i++){
            //         var score = datas[i];
            //         sql += "("+score.studentId+", '"+score.class+"', "+score.score+","+score.classOrder+","+score.gradeOrder+","+score.chineseScore+","+score.chineseClassOrder+",\
            //         "+score.chineseGradeOrder+","+score.mathScore+","+score.mathClassOrder+","+score.mathGradeOrder+","+score.englishScore+","+score.englishClassOrder+","+score.englishGradeOrder+","+score.physicsScore+","+score.physicsClassOrder+",\
            //         "+score.physicsGradeOrder+","+score.chemistryScore+","+score.chemistryClassOrder+","+score.chemistryGradeOrder+","+score.biologyScore+","+score.biologyClassOrder+","+score.biologyGradeOrder+","+score.politicsScore+","+score.politicsClassOrder+",\
            //         "+score.politicsGradeOrder+","+score.historyScore+","+score.historyClassOrder+","+score.historyGradeOrder+","+score.geographyScore+","+score.geographyClassOrder+","+score.geographyGradeOrder+")";
            //         if(i == datas.length-1){
            //             sql+= ";"
            //         }else{
            //             sql += ","
            //         }
			// 	}


			// 	connection.query(sql,function (err, result) {
			// 		callback(null, err);
			// 		// 释放连接 
			// 		connection.release();
			// 	});
			// });

            var maxUpdateCount = 1000;
			var optionCount = datas.length / maxUpdateCount + 1;

			var indexArray = new Array;
			for(var i = 1; i <= optionCount; i++){
				var obj = new Object;
				obj.startIndex = maxUpdateCount * (i - 1);
				obj.endIndex = maxUpdateCount * i - 1;
				indexArray.push(obj);
			}


			async.concatSeries(indexArray, function(indexObject,batchcallback) {
				var sqls = new Array;
				var sqlParams = new Array;
				for(var i = indexObject.startIndex; i < datas.length & i <= indexObject.endIndex; i++){
					var score = datas[i];
								
					sqls.push("INSERT INTO grade(studentId, class, score, classOrder, gradeOrder, chineseScore, chineseClassOrder, chineseGradeOrder, \
						mathScore, mathClassOrder,mathGradeOrder, englishScore, englishClassOrder, englishGradeOrder, physicsScore, physicsClassOrder, physicsGradeOrder, \
						chemistryScore, chemistryClassOrder,chemistryGradeOrder, biologyScore, biologyClassOrder, biologyGradeOrder, politicsScore, politicsClassOrder, \
						politicsGradeOrder, historyScore, historyClassOrder,historyGradeOrder, geographyScore, geographyClassOrder, geographyGradeOrder) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \
						?, ?, ?, ?, ?, ?, ?, ?, \
						?, ?, ?, ?, ?, ?, ?);");
					sqlParams.push([score.studentId, score.class, score.score, score.classOrder, score.gradeOrder, score.chineseScore, score.chineseClassOrder,
							score.chineseGradeOrder, score.mathScore, score.mathClassOrder, score.mathGradeOrder, score.englishScore, score.englishClassOrder, score.englishGradeOrder, score.physicsScore, score.physicsClassOrder,
							score.physicsGradeOrder, score.chemistryScore, score.chemistryClassOrder, score.chemistryGradeOrder, score.biologyScore, score.biologyClassOrder, score.biologyGradeOrder, score.politicsScore, score.politicsClassOrder,
							score.politicsGradeOrder, score.historyScore, score.historyClassOrder, score.historyGradeOrder, score.geographyScore, score.geographyClassOrder, score.geographyGradeOrder]);
                }
                mqQueries.queries(sqls, sqlParams, function(err, results){

                    batchcallback(null, err);
                });
            }, function(err, values) {
                if(callback){
                    callback(null, err);
                }
            });

		};

		var update = function(datas, callback){

			// var sqls = new Array;
			// var sqlParams = new Array;
			// for(var i = 0; i < datas.length; i++){
			// 	var data = datas[i];
			// 	sqls.push("update student set school = ?, no = ?, name=? where id=? ");
			// 	sqlParams.push([data.school, data.no, data.name, data.id]);
			// }
			

			var maxUpdateCount = 1000;
			var optionCount = datas.length / maxUpdateCount + 1;

			var indexArray = new Array;
			for(var i = 1; i <= optionCount; i++){
				var obj = new Object;
				obj.startIndex = maxUpdateCount * (i - 1);
				obj.endIndex = maxUpdateCount * i - 1;
				indexArray.push(obj);
			}


			async.concatSeries(indexArray, function(indexObject,batchcallback) {
				var sqls = new Array;
				var sqlParams = new Array;
				for(var i = indexObject.startIndex; i < datas.length & i <= indexObject.endIndex; i++){
					var score = datas[i];
					sqls.push("UPDATE grade set score = ?, classOrder = ?, gradeOrder = ?, chineseScore = ?, chineseClassOrder = ?, chineseGradeOrder = ?, \
							mathScore = ?, mathClassOrder = ?,mathGradeOrder = ?, englishScore = ?, englishClassOrder = ?, englishGradeOrder = ?, physicsScore = ?, physicsClassOrder = ?, physicsGradeOrder = ?, \
							chemistryScore = ?, chemistryClassOrder = ?,chemistryGradeOrder = ?, biologyScore = ?, biologyClassOrder = ?, biologyGradeOrder = ?, politicsScore = ?, politicsClassOrder = ?, \
							politicsGradeOrder = ?, historyScore = ?, historyClassOrder = ?,historyGradeOrder = ?, geographyScore = ?, geographyClassOrder = ?, geographyGradeOrder = ? where id = ?;");
					sqlParams.push([score.score, score.classOrder, score.gradeOrder, score.chineseScore,
							score.chineseClassOrder, score.chineseGradeOrder, score.mathScore, score.mathClassOrder,score.mathGradeOrder, 
							score.englishScore, score.englishClassOrder, score.englishGradeOrder, score.physicsScore, score.physicsClassOrder, score.physicsGradeOrder,
							score.chemistryScore, score.chemistryClassOrder,score.chemistryGradeOrder, score.biologyScore, score.biologyClassOrder, score.biologyGradeOrder, score.politicsScore, score.politicsClassOrder, 
							score.politicsGradeOrder, score.historyScore, score.historyClassOrder,score.historyGradeOrder,score.geographyScore, score.geographyClassOrder, score.geographyGradeOrder, score.id]);
                }
                mqQueries.queries(sqls, sqlParams, function(err, results){
                    batchcallback(null, err);
                });
            }, function(err, values) {
                if(callback){
                    callback(null, err);
                }
            });
		};


		async.concatSeries(operations, function(operation,callback) {
			 if(operation == "insert"){
				insert(params.inserts, callback);
			}else if(operation == "edit"){
				update(params.edits, callback);
			}
			
		}, function(err, values) {
				  if(callback){
					callback(err);
				}
		});
	},
	queryByStudent: function (req, callback) {
        var sqlWhere = "";
        if(req.query.school){
            sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school = '" + req.query.school + "'"
        }

        if(req.query.no){
            sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no = '" + req.query.no + "'"
        }

        if(req.query.name){
            sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name = '" + req.query.name + "'"
        }

        if(sqlWhere == ""){
            callback(1, null);
        }


        var sql = $sql.queryAll + " where studentId in (select id from student where " + sqlWhere + " );"
		pool.getConnection(function (err, connection) {
			connection.query(sql,function(err,rows,fields){
		 		if(err){
					callback(0, rows);
				}else{
					callback(1, rows);
				}
				// 释放连接 
				connection.release();
		    });
		});
	},
	deleteById: function(id, next){
		mqQueries.queries([$sql.deleteById], [id], function(err, results){
			if(err){
				next(0);
			}else{
				next(1);
			}
		});
	},
	deleteByIds: function(ids, next){
		if(ids == null || ids.length == 0){
			return;
		}

		var sql = [];
		var param = [];
		for(var i = 0; i < ids.length; i++){
			sql.push($sql.deleteById);;
			param.push(ids[i]);
		}

		mqQueries.queries(sql, param, function(err, results){
			if(err){
				next(0);
			}else{
				next(1);
			}
		});
	}
};