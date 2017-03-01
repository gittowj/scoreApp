var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');

var $sql = {
	insert: 'INSERT INTO student(id, name, no, school) VALUES(0,?,?)',
	update: 'update student set name=?, no=?, school=$ where id=?',
	delete: 'delete from student where id=?',
	queryById: 'select * from student where id=?',
	queryAll: 'select * from student'
};

// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

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
	add: function (req, res, next) {
		pool.getConnection(function (err, connection) {
			// 获取前台页面传过来的参数
			var param = req.query || req.params;

			// 建立连接，向表中插入值
			connection.query($sql.insert, [param.name, param.no, param.school], function (err, result) {
				if (result) {
					result = {
						code: 200,
						msg: '增加成功'
					};
				}

				// 以json形式，把操作结果返回给前台页面
				jsonWrite(res, result);

				// 释放连接 
				connection.release();
			});
		});
	},
	update : function(param, connection, callback){
		// 建立连接，向表中插入值
			connection.query($sql.update, [param.name, param.no, param.school, param.id], function (err, result) {
				callback();
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
	},
	queryByStudent: function (req, callback) {
		pool.getConnection(function (err, connection) {
			this.queryByStudent(req, connection, callback);
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

			var sql = $sql.queryAll + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " ;";
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
	}
};