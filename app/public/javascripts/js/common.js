if(navigator.userAgent.indexOf("MSIE 6.0") > 0) {
	//将easyui的分页的下拉框不显示
	$.fn.pagination.defaults.showPageList = false;
}

var Comm = {
		//跳转到指定地址
		location : function(url) {
			setTimeout(function() {
				location = url;
			}, 100);
		},
		//检查唯一性，返回数据库中存在的记录数
		checkUnique : function(tableName,fieldName,fieldValue) {
		var postData ={};
		postData['tableName'] =  tableName;
		postData['fieldName'] =  fieldName;
		postData['fieldValue'] =  fieldValue;
		var url = '${webroot}/common/isExist.action';
		$.post(url, postData,function(data){
			if( data ) {
				return data;
			} else {
				return -1;
			}
           });
		},
		//日期比较
		dateCompare : function(startdate,enddate){
			var arr=startdate.split("-");    
			var starttime=new Date(arr[0],arr[1],arr[2]);    
			var starttimes=starttime.getTime();   
			  
			var arrs=enddate.split("-");    
			var lktime=new Date(arrs[0],arrs[1],arrs[2]);    
			var lktimes=lktime.getTime();   
			  
			if(starttimes>lktimes){   
				return false;   
			}   
			else{
				return true;   
			}
		},
		//单选按钮双击取消
		cancelRadio : function(_this) {
			$(_this).attr('checked', false);
		},

		//update layout title
		title : function(titles) {	
			if(parent.$('body').layout('panel', 'center') != ''){
			    parent.$('body').layout('panel', 'center').panel({
			    	title: titles.join(' >> '), 
			    	iconCls: 'icon-home', 
			    	headerCls: 'nav-title' 
			    });
			}	 
		},
		//open dialog
		//@param {url: 'xx.html', content: '<p>...</p>',title: 'new dialog', width:300, height:200}
		dialog : function(attr) {
			if(attr.clickBtn) $('#'+attr.clickBtn).linkbutton('disable');
			var _dialogId = undefined;
			if(attr.dialogid) _dialogId = attr.dialogid;
			else _dialogId = 'dialog_'+new Date().valueOf();
			Comm.dialogId = _dialogId;
			//var _dialogId = attr.url;
			$('body').append('<div id="'+_dialogId+'" style="margin-top:0px"></div>');
			var _dialog = $('#'+_dialogId);
			if(attr.url) {
				var _param = '';
				if(attr.url.indexOf('?')!=-1)
					_param = '&dialogId='+_dialogId;
				else
					_param = '?dialogId='+_dialogId;
				if(attr.type==='iframe') {
					attr.content = ['<iframe src="" width="100%" height="100%" scrolling="auto" frameborder="0"></iframe>'].join('');
					openDialog(attr);

					$('#'+_dialogId).find('iframe').attr('src', attr.url+_param);
				} else {
					_dialog.load(attr.url+_param, function() {
						attr.content = _dialog.html();
						openDialog(attr);
					});
				}
			} else {
				openDialog(attr);
			}
			function openDialog(attr) {
				if(navigator.userAgent.indexOf("MSIE 6.0") > 0) {
					//隐藏select
					$('select').each(function(i, obj) {
						if($(obj).css('display')!='none') {
							if(!Comm.dialogHideSelect) {
								Comm.dialogHideSelect = new Array();
							}
							Comm.dialogHideSelect.push(obj);
							$(obj).css('display', 'none');
						}
					});
				}
				var _width = $(document.body).width();
				if(attr.width>_width)
					attr.width = _width;
				var _height = $(document.body).height();
				if(attr.height>_height)
					attr.height = _height;
				
				_dialog.dialog({
					title: attr.title,
					content: attr.content,
					modal: true,
					resizable:true,
					collapsible:true,
					maximizable:true,
				    minimizable:false,
					width: attr.width,
					height: attr.height,
					onClose:attr.closeFn
				});
				$('.panel-tool-close').each(function(i, obj) {
					$(obj).click(function() {
						$(this).parent().parent().parent().remove();
						Comm.dialogCloseSelect();
					});
				});
				if(attr.clickBtn) $('#'+attr.clickBtn).linkbutton('enable');
			}
		},
		//close dialog 是
		dialogClose : function(id) {
			if(id === undefined || id === '') id = Comm.dialogId;
			$('#'+id).dialog('close');
			$('#'+id).remove();
			Comm.dialogCloseSelect();
		},
		dialogCloseSelect : function() {
			if(Comm.dialogHideSelect) {
				//显示隐藏的select
				$.each(Comm.dialogHideSelect, function(i, obj) {
					$(obj).css('display', '');
				});
				Comm.dialogHideSelect = undefined;
			}
		},
		//submit form
		//{id:'',url:'',success:function(){},subbtn:'btn1'}
		form : function(attr) {
			$('#'+attr.id).form({    
				url:attr.url,    
				onSubmit:function(){
					var _isSub = $('#'+attr.id).form('validate');
					if(_isSub && attr.subbtn)
						$('#'+attr.subbtn).linkbutton('disable');
					return _isSub;
				},
				success:function(data){
					if(attr.subbtn)
						$('#'+attr.subbtn).linkbutton({'disabled':false});
					try {
						attr.success(eval('('+data+')'));
					} catch (e) {
						$.messager.alert('提示', '操作失败.');
					}
				}
			});
		}
};

Comm.util = {
		//判断是否为正整数
		isPosInt : function(value) {
			var r = /^\+?[1-9][0-9]*$/;
			return r.test(value);
		}
};

Comm.select = {
		clear : function(id) {
			var objSelect = $("#"+id).get(0);
			var length = objSelect.options.length;
			var fistOption = length>=0?objSelect.options[0]:null;
			objSelect.options.length = 0;
			if(fistOption&&fistOption.value==''){//
				objSelect.options.add(fistOption);
			}
			return length;
		},
		createOption : function(obj){

			var varItem = null;
			if (obj.diccode) {//
				varItem = new Option(obj.dicvalue, obj.diccode);
			} else {
				varItem = new Option(obj.value, obj.name);
			}
			return varItem;
		},
		addDefault : function(id) {
			var infos = [{"diccode":"","dicvalue":"请选择...","dircode":"","id":0,"seqnum":1}];
			EDC.select.add(id,infos);
		},
		addOneOption : function(id, dicvalue,diccode) {
			this.add(id,{"dicvalue":dicvalue,"diccode":diccode});
		},
		add : function(id, infos) {
			var objSelect = $("#"+id).get(0);
			var varItem = null;
			if (jQuery.isArray(infos)) {
				for (var i = 0; i < infos.length; i++) {
					varItem = this.createOption(infos[i]);
					objSelect.options.add(varItem);
				}
			} else {
				varItem = this.createOption(infos);
				objSelect.options.add(varItem);
			}
			return objSelect.options.length;
		},
		exist : function(id, value) {
			var objSelect =$("#"+id).get(0);
			var r = false;
			for (var i = 0; i < objSelect.options.length; i++) {
				if (objSelect.options[i].value == value) {
					r = true;
					break;
				}
			}
			return r;
		},
		del : function(id, value) {
			var objSelect = $("#"+id).get(0);
			if (exist(id, value)) {
				for (var i = 0; i < objSelect.options.length; i++) {
					if (objSelect.options[i].value == value) {
						try {
							objSelect.options.remove(i);/* ie */
						} catch (e) {
							objSelect.options[i].remove();/* ff */
						}
						return 1;
					}
				}
			}
			return 0;
		},
		select : function(id, value) {
			if (this.exist(id, value)) {
				$("#"+id).val(value);
				$("#"+id).trigger('change');
				return true;
			}
			return false;
		},
		getText : function(id, value) {
			var objSelect = $("#"+id).get(0);
			for (var i = 0; i < objSelect.options.length; i++) {
				if (objSelect.options[i].value == value) {
					return objSelect.options[i].text;
				}
			}
			return '';
		},
		dragDown : function(url, sourceid, targetid, para) { //
			$("#"+sourceid).bind('change',function(){
				var postData ={};
				postData[para] = $("#"+sourceid).val();

				$.post(url, postData,function(reStr){
					reStr = $.trim(reStr);
					EDC.select.clear(targetid);

					var jsonArray = jQuery.parseJSON( reStr );
					EDC.select.add(targetid, jsonArray);
					$("#"+targetid).trigger('change');
				});

			});
		},
		init:function(url, targetid,selectedValue,callback){
			var postData ={};
			$.post(url, postData,function(reStr){
				reStr = $.trim(reStr);
				var jsonArray = jQuery.parseJSON( reStr );
				EDC.select.add(targetid, jsonArray);
				EDC.select.select(targetid, selectedValue);
				if(callback) {
					setTimeout(callback,100);
				}
			});
		}
};

//Date的操作方法
Comm.date = {
		//获取当前时间
		getDate : function() { return new Date(); },
		//获取时间戳 [date: 代表传入的日期]
		getTime : function(date) { if(date === undefined) { return Comm.date.getDate().valueOf(); } return date.valueOf(); },
		//根据指定格式获取日期[默认格式为: yyyy-MM-dd HH:mm:ss] [date  : 日期 format: 日期格式]
		formatStr : function(date, format) {
			if(date===undefined || date==='') return '';
			if(typeof(date)==='number') date = new Date(date);
			if(format === undefined) { format = "yyyy-MM-dd HH:mm:ss"; }
			var z = { y:date.getFullYear(), M:date.getMonth() + 1, d:date.getDate(), H:date.getHours(), m:date.getMinutes(), s:date.getSeconds() };
			return format.replace(/(y+|M+|d+|H+|m+|s+)/g, function(v) {
				return ((v.length > 1 ? "0" : "") + eval('z.'+v.slice(-1))).slice(-(v.length>2?v.length:2));
			});
		},
		//将字符串时间转为Date [dateStr : 字符串时间 format  : 字符串格式[目前支持(yyyy-MM-dd HH:mm:ss)] ]
		formatDate : function(dateStr, format) { dateStr = Date.parse(dateStr.replace(/-/g, "/")); var _date = new Date(dateStr); return _date; },
		//比较时间大小[-1: date1 < date2 / 0: date1 = date2 / 1: date1 > date2]
		compareDate : function(date1, date2) {
			var _datetime1 = date1.getTime();
			var _datetime2 = date2.getTime();
			if(_datetime1 < _datetime2) { return -1; }
			else if(_datetime1 === _datetime2) { return 0; }
			else if(_datetime1 > _datetime2) { return 1; }
		},
		//获取指定时间加上指定的月数 [date:日期 month:加上的月数]
		getDateAddMonth : function(date, month) {
			if(date === undefined || date === '') { date = JUtil.date.getDate(); }
			if(month === undefined || month === '') { month = 0; }
			date.setMonth(date.getMonth() + month);
			return _date;
		},
		//获取指定时间加上指定的小时数 [_date:日期 _hour:加上的小时]
		getDateAddHour : function(_date, _hour) {
			if(_date === undefined || _date === '') { _date = dateUtil.getDate(); }
			if(_hour === undefined || _hour === '') { _hour = 0; }
			_date.setHours(_date.getHours() + _hour);
			return _date;
		},
		//获取指定时间加上指定的分钟数 [_date:日期 _min:加上的分钟]
		getDateAddMin : function(_date, _min) {
			if(_date === undefined || _date === '') { _date = dateUtil.getDate(); }
			if(_min === undefined || _min === '') { _min = 0; }
			_date.setMinutes(_date.getMinutes() + _min);
			return _date;
		}
};

//算法
Comm.arith = {
		//计算BMI(sgid:身高控件ID tzid:体重控件ID)
		bmi : function(sgid, tzid, showid) {
			var _tz = $('#'+tzid).val();
			var _sg = $('#'+sgid).val();
			if(_tz === '' || _sg === '') {
				return '';
			}
			var _bmi = (_tz / (_sg * _sg)) * 10000;
			_bmi = _bmi.toFixed(2);
			$('#'+showid).val(_bmi);
			return _bmi;
		}
};

//extend validatebox
$.extend($.fn.validatebox.defaults.rules, {  
	//field1 equal field2
	equalTo: {
		validator:function(value,param){
			return $(param[0]).val() == value;
		},
		message:'Field does not match!'
	},
	// 验证身份证
	idcard : {
		validator : function(value) {
	    	return /^\d{15}(\d{2}[A-Za-z0-9])?$/i.test(value);
		},
		message : '身份证号码格式不正确'
	},
	//验证电话号码
	phone : {
        validator : function(value) {
            return /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}?$/i.test(value);
        },
        message : '电话格式不正确，请输入“区号-电话号码”'
    },
    //验证手机号码
    mobile : {
        validator : function(value) {
            return /^(13|14|15|18)\d{9}$/i.test(value);
        },
        message : '手机号码格式不正确'
    },
    //验证电话和手机
    phoneOrMobile : {
        validator : function(value) {
        	//验证手机
            if(/^(13|14|15|18)\d{9}$/i.test(value)) return true;
            //验证电话
            return /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}?$/i.test(value);
        },
        message : '手机号码或电话号码格式不正确'
    },
    radio: {
            validator: function (value, param) {
                var frm = param[0], groupname = param[1], ok = false;
                $('input[name="' + groupname + '"]', document[frm]).each(function () { //查找表单中所有此名称的radio
                    if (this.checked) { ok = true; return false; }
                });

                return ok;
            },
            message: '需要选择一项！'
    },
    // 请填入数字或者字母
	shuziORzimu : {
		validator : function(value) {
	    	return /^[A-Za-z0-9]*?$/i.test(value);
		},
		message : '请填入数字或者字母'
	}
});