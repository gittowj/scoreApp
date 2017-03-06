var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var gradeDao = require('./gradeDao');

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
	queryByStudent: function (score, next) {
		mqQueries.queries(["select * from score where school = ? and no = ? and name = ? order by id desc limit 1;"], [[score.school, score.no, score.name]], function(err, results){
			if(results.length > 0){
				next(results[0]);
			}else{
				next(null);
			}
		});
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