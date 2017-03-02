var $conf = require('../conf/db');
var $util = require('../util/util');
var async = require('async');
var $common = require('../conf/common');


var $sql = {
	insert: 'INSERT INTO student(id, name, no, school) VALUES(0,?,?)',
	update: 'update student set name=?, no=?, school=$ where id=?',
	delete: 'update student set  isDelete = ' + $common.isDelete.is,
	deleteById: 'update student set  isDelete = ' + $common.isDelete.is +  '  where id=?',
	queryById: 'select * from student where id=?',
	queryAll: 'select * from student'
};

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
	add: function (req, res, next) {
		// 获取前台页面传过来的参数
		var param = req.query || req.params;

		// 建立连接，向表中插入值
		mqQueries.queries([$sql.insert], [[param.name, param.no, param.school]], function (err, result) {
			if (result) {
				result = {
					code: 200,
					msg: '增加成功'
				};
			}

			// 以json形式，把操作结果返回给前台页面
			jsonWrite(res, result);
		});
	},
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
			var sql = "INSERT INTO student(school, no, name) VALUES ";
			for(var i = 0; i < datas.length; i++){
				var data = datas[i];
				sql += "('"+data.school+"', '"+data.no+"', '"+data.name+"')";
				if(i == datas.length-1){
					sql+= ";"
				}else{
					sql += ","
				}
			}

			mqQueries.query(sql,function (err, result) {
				callback(null, err);
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
					var data = datas[i];
					sqls.push("update student set school = ?, no = ?, name=? where id=? ");
					sqlParams.push([data.school, data.no, data.name, data.id]);
				}
				mqQueries.queries(sqls, sqlParams, function(err, results){
					// if(!!err) {
					// 	console.log(err);
					// } 
					// else {
					// 	//If not error, the "results" is the results of the SQLs as array.
					// 	console.log(results);
					// }
					batchcallback(null, err);
				});
				// pool.getConnection(function (err, connection) {
				// 	var sql = "";
				// 	var i;
				// 	var optionedCount = 0;


				// 	for(var i = indexObject.startIndex; i < datas.length & i <= indexObject.endIndex; i++){
				// 		var data = datas[i];
				// 		sql += " \ update student set school = '" + data.school + "', no = '" + data.no + "', name='" + data.name + "' where id=" + data.id + "; " ;
				// 	}

				// 	console.log(sql);


				// 	connection.query(sql,function (err, result) {
				// 		batchcallback(null, err);
				// 		// 释放连接 
				// 		connection.release();
				// 	});
				// });
				}, function(err, values) {
					if(callback){
						callback(null, err);
					}
				});
		};


		async.concatSeries(operations, function(operation,callback) {
			if(operation == "edit"){
				update(params.edits, callback);
			}else if(operation == "insert"){
				insert(params.inserts, callback);
			}
			
		}, function(err, values) {
				  if(callback){
					callback(err);
				}
		});
	},
	deleteById: function(id, next){
		mqQueries.queries([$sql.deleteById], [[id]], function (err) {
			if (err) {
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
		var $sqlDelete = $sql.delete + " where id in (" + ids.join(",") + ")";
		mqQueries.query($sqlDelete, function (err) {
			if(next){
				if (err) {
					next(0);
				}else{
					next(1);
				}
				
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

		var sql = $sql.queryAll + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " ;";
		mqQueries.query(sql,function(err,rows,fields){
			if(err){
				callback(0, rows);
			}else{
				callback(1, rows);
			}
		});
	},
	getStudentByPage: function(student, pageIndex, pageSize, totalNum, callback) {
		var sqlWhere = " isDelete =  " + $common.isDelete.no;
		var sqlParam = [];
		if(student.school){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school like ? ";
			sqlParam.push("%" + student.school + "%");
		}

		if(student.no){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no like ? ";
			sqlParam.push("%" + student.no + "%");
		}

		if(student.name){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name like ? "
			sqlParam.push("%" + student.name + "%");
		}

		var sqls = [];
		var params = [];

		// if(pageIndex == 1){
			sqls.push("select count(0) as count_all_result from student where " + sqlWhere + " ;");
			params.push(sqlParam);
			
		// }

		 

		sqls.push("select * from student where " +  sqlWhere +" order by id desc limit " + ((pageIndex - 1)*pageSize + 1) + " , " + pageIndex*pageSize);
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
	getByPage: function(changePer_page,per_page, req,callback) {

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

		var sql ="select * from student " + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " order by id desc limit "+changePer_page+" ,"+per_page;
		mqQueries.query(sql, function(err, rows){
			if(callback){
				callback(err,rows);
			}
		});
	},
	getCount: function(req, callback) {
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

		var sql ="select count(0) as count_all_result from student " + (sqlWhere && sqlWhere != ""? " where " + sqlWhere : "") + " ;";
		mqQueries.query(sql,function(err,rows){
			if(err){
				callback(0);
			}else{
				callback(rows[0].count_all_result);
			}
		});
	},
};