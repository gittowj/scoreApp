var $conf = require('../conf/db');
var $util = require('../util/util');
var async = require('async');
var $common = require('../conf/common');
var crypto = require('crypto');


var $sql = {
	insert: 'INSERT INTO user_account(username, passwd, cname, email, mobilenum, create_time) VALUES(?,?,?,?,?,?)',
	update: 'update user_account set username=?, passwd=?, cname=?, email=?,  mobilenum = ? where id=?',
	delete: 'update user_account set  isDelete = ' + $common.isDelete.is,
	deleteById: 'update user_account set  isDelete = ' + $common.isDelete.is +  '  where id=?',
	queryById: 'select * from user_account where id=?',
	queryAll: 'select * from user_account',
    table_name : 'user_account'
};

var secret = "afdbafdafdafd";
var mqQueries = require('mysql-queries').init($conf.mysql);

function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

function decrypt(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

module.exports = {
	add: function (user, callback) {
        var createTime =  new Date();
		// 建立连接，向表中插入值
		mqQueries.queries([$sql.insert], [[user.username, encrypt(user.passwd, secret), user.cname, user.email, user.mobilenum, createTime]], function (err, result) {
			callback(err);
		});
	},
    edit: function(user, callback){
        // 建立连接，向表中插入值
		mqQueries.queries([$sql.update], [[user.username, encrypt(user.passwd, secret), user.cname, user.email, user.mobilenum, user.id]], function (err, result) {
			callback(err);
		});
    },
	deleteById: function(id, callback){
		mqQueries.queries([$sql.deleteById], [[id]], function (err) {
			if (err) {
				callback(0);
			}else{
				callback(1);
			}
		});
	},
	deleteByIds: function(ids, callback){
		if(ids == null || ids.length == 0){
			return;
		}
		var $sqlDelete = $sql.delete + " where id in (" + ids.join(",") + ")";
		mqQueries.query($sqlDelete, function (err) {
			if(next){
				if (err) {
					callback(0);
				}else{
					callback(1);
				}
				
			}
		});
	},
    getUser: function(user, callback) {
		var sqlWhere = " isDelete =  " + $common.isDelete.no;
		var sqlParam = [];
        if(user.id){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " id != ? ";
			sqlParam.push(user.id);
		}
		if(user.username){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " username = ? ";
			sqlParam.push(user.username);
		}

		if(user.passwd){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " passwd = ? ";
			sqlParam.push(encrypt(user.passwd, secret));
		}

		var sqls = [];
		var params = [];


		sqls.push("select * from " + $sql.table_name + "  where " +  sqlWhere +" limit  1 ");
		params.push(sqlParam);
		mqQueries.queries(sqls, params, function(err, results){
                if(results && results.length > 0 && results[0].length > 0){
                    callback(null, results[0])
                }else{
				    callback(err, null);
                }
		});

	},
	getUserByPage: function(user, pageIndex, pageSize, totalNum, callback) {
		var sqlWhere = " isDelete =  " + $common.isDelete.no;
		var sqlParam = [];
		if(user.username){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " username like ? ";
			sqlParam.push("%" + user.username + "%");
		}

		var sqls = [];
		var params = [];

		// if(pageIndex == 1){
			sqls.push("select count(0) as count_all_result from " + $sql.table_name + " where " + sqlWhere + " ;");
			params.push(sqlParam);
			
		// }

		 

		sqls.push("select * from " + $sql.table_name + "  where " +  sqlWhere +" order by id desc limit " + (pageIndex - 1)*pageSize + " , " + pageSize);
		params.push(sqlParam);
		mqQueries.queries(sqls, params, function(err, results){
				var page = new Object();
				page.page = pageIndex;
				page.size = pageSize;

					var result_rowCount = results[0];
					page.total = result_rowCount[0].count_all_result
					page.rows = new Array();
					results[1].forEach(function(user) {
						user.passwd = decrypt(user.passwd, secret);
						page.rows.push(user);
					});
					//page.rows = results[1];
					page.totalPage = Math.ceil(page.total / page.size);

				callback(err, page);
		});

	}
};