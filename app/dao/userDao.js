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
	add: function (user, next) {
        var createTime =  new Date();
        user.passwd = encrypt(user.passwd, secret);
		// 建立连接，向表中插入值
		mqQueries.queries([$sql.insert], [[user.username, user.passwd, user.cname, user.email, user.mobilenum, createTime]], function (err, result) {
			next(err);
		});
	},
    edit: function(user, next){
        user.passwd = encrypt(user.passwd, secret);
        // 建立连接，向表中插入值
		mqQueries.queries([$sql.update], [[user.username, user.passwd, user.cname, user.email, user.mobilenum]], function (err, result) {
			nex(err);
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
					page.rows = results[1];
					page.totalPage = Math.ceil(page.total / page.size);

				callback(err, page);
		});

	}
};