var $conf = require('../conf/db');
var $util = require('../util/util');
var $common = require('../conf/common');

var $sql = {
	queryById: 'select * from charge where id=?',
	queryAll: 'select * from charge',
    table_name : 'charge'
};


var mqQueries = require('mysql-queries').init($conf.mysql);

module.exports = {
    getChargeByPage : function(charge, pageIndex, pageSize, totalNum, callback){
        var sqlWhere = " a.studentId = b.id and a.isDelete =  " + $common.isDelete.no + " and b.isDelete = " + $common.isDelete.no;
		var sqlParam = [];
		if(charge.school){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " school like ? ";
			sqlParam.push("%" + charge.school + "%");
		}

		if(charge.no){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " no like ? ";
			sqlParam.push("%" + charge.no + "%");
		}

		if(charge.name){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " name like ? "
			sqlParam.push("%" + charge.name + "%");
		}

        if(charge.type){
			sqlWhere +=  (sqlWhere && sqlWhere != "" ? " and" : "")  +  " type = ? "
			sqlParam.push(charge.type);
		}

		var sqls = [];
		var params = [];

		// if(pageIndex == 1){
			sqls.push("select count(0) as count_all_result from charge a, student b  where " + sqlWhere + " ;");
			params.push(sqlParam);
			
		// }

		 

		sqls.push("select a.*, b.school, b.no, b.name from charge a, student b where " +  sqlWhere +" order by id desc limit " + (pageIndex - 1)*pageSize + " , " + pageSize);
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