var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var async = require('async');
var studentDao = require('./studentDao');
var gradeDao = require('./gradeDao');

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

var mqQueries = require('mysql-queries').init($conf.mysql);

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
	getScoreByPage: function(score, pageIndex, pageSize, totalNum, callback) {
		var sqlWhere = " 1=1 ";
		var sqlParam = [];
		if(score.school){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school like ? ";
			sqlParam.push("%" + score.school + "%");
		}

		if(score.no){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no like ? ";
			sqlParam.push("%" + score.no + "%");
		}

		if(score.name){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name like ? "
			sqlParam.push("%" + score.name + "%");
		}

		var sqls = [];
		var params = [];

		// if(pageIndex == 1){
			sqls.push("select count(0) as count_all_result from score where " + sqlWhere + " ;");
			params.push(sqlParam);
			
		// }

		 

		sqls.push("select * from score where " +  sqlWhere +" order by id desc limit " + ((pageIndex - 1)*pageSize + 1) + " , " + pageIndex*pageSize);
		params.push(sqlParam);
		mqQueries.queries(sqls, params, function(err, results){
				var page = new Object();
				page.page = pageIndex;
				page.size = pageSize;

					var result_rowCount = results[0];
					page.total = result_rowCount[0].count_all_result
					page.rows = results[1];
					page.totalPage = Math.ceil(page.total / page.size);

				callback(err, page);
		});

	},
	queryBySchool: function (req, next) {
		// pool.getConnection(function (err, connection) {
		// 	// 获取前台页面传过来的参数
		// 	var param = req.params;

        //     connection.query($sql.query, [param.school], function (err,rows,fields) {
		// 		if (err) {
		// 			next(null);
		// 		}else{
		// 			next(rows);
		// 		}

		// 		// 释放连接 
		// 		connection.release();
		// 	});
		// });
	},
	queryByStudent: function (req, next) {
		// pool.getConnection(function (err, connection) {
		// 	// 获取前台页面传过来的参数
		// 	var param = req.params;

        //     connection.query($sql.queryByStudent, [param.name, param.no], function (err,rows,fields) {
		// 		if (err) {
		// 			next(null);
		// 		}else{
		// 			next(rows);
		// 		}

		// 		// 释放连接 
		// 		connection.release();
		// 	});
		// });
	},
	queryAll: function(req, next){
		mqQueries.query($sql.queryAll,function(err,rows){
			if(err){
				callback(0);
			}else{
				callback(rows[0].count_all_result);
			}
		});
	},
	deleteById: function(id, next){
		gradeDao.deleteById(id, next);
	},
	deleteByIds: function(ids, next){
		gradeDao.deleteById(ids, next);
	}
};