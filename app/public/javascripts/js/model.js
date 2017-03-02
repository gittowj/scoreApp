//采集模型UI展示
var model = {
		dmPanel : '#dataModelForm',
		//保存需要初始化的指标信息
		cols : [],
		//面板
		panelArr : ['doctor','ganpg','dataModel'],
		//其它项的点击事件
		clickOther : function(id) {
			$.each(model.panelArr, function(i, obj) {
				if(obj === id) $('#'+id+'Panel').css('display', 'block');
				else $('#'+obj+'Panel').css('display', 'none');
			});
			if(id === 'doctor') {
				if($('#doctorIframe').attr('src')==='') {
					$('#doctorIframe').attr('src', webroot+'/doctorAdvice/index.action?uid='+$('#dataModelFormPatientId').val()+'&dgsId='+$('#dataModelDiagnosisId').val());
				}
			} else if(id === 'ganpg') {
				//肝纤维化评估
				//if($('#ganpgIframe').attr('src')==='') {
					$('#ganpgIframe').attr('src', webroot+'/ganGxwhpgb/index.action?uid='+$('#dataModelFormPatientId').val()+'&dgsId='+$('#dataModelDiagnosisId').val());
				//}
			}
		},
		//采集单点击事件
		clickModel : function(dmId) {
			var _dmp = $('#dataModelPanel');
			if(_dmp.css('display')==='block') {
				location = '#dataModel_'+dmId+'_0';
				return;
			}
			$('#doctorPanel').css('display', 'none');
			$.each(model.panelArr, function(i, obj) {
				if(obj === 'dataModel') _dmp.css('display', 'block');
				else $('#'+obj+'Panel').css('display', 'none');
			});
			//_dmp.css('display', 'block');
			//采集单的面板ID
			setTimeout(function() {
				location = '#dataModel_'+dmId+'_0';
			}, 100);
		},
		//根据采集单加载模型
		loadMore : function(dmId, etime, dgsTime) {
			//判断采集单是否存在
			var _dm = $('#dataModel_'+dmId+'_0');
			if(_dm.html()!=undefined && _dm.html()!='') {
				for(var i=1;;i++) {
					_dm = $('#dataModel_'+dmId+'_'+i);
					if(_dm.html() === undefined || _dm.html() === null || _dm.html() === '') {
						_dm = $('#dataModel_'+dmId+'_'+(i-1));
						break;
					}
				}
				if(_dm.html() != '') {
					if(etime!=3) {
						model.clickModel(dmId);
						$.messager.show({ title: '提示', msg: '已经存在该采集单, 该采集单不支持录入多次!' });
						return;
					}
					model.addModel(undefined, _dm.attr('id'), 0);
					model.clickModel(dmId);
					return;
				}
			}
			$.ajax({
		        url: webroot+'/dataModelProperty/findByRelateTreat.action',
		        type: 'post',
		        data: {'dmId':dmId},
		        dataType: 'json',
		        error: function() { $.messager.show({ title: '提示', msg: '加载采集单出错!' }); },
		        success : function(data) {
		        	model.initModel(data, undefined, dgsTime);
		        	if(data != null && data.length>0) {
						$.each(data, function(i, obj) {
							model.clickModel(obj.dmId);
				        	return true;
						});
		        	}
				}
		    });
		},
		//加载模型采集单[diseaseId 诊断ID / dgsId 就诊ID / uid 患者ID / dgsTime 就诊日期]
		load : function(diseaseId, dgsId, uid, dgsTime) {
			$.ajax({
		        url: webroot+'/dataModelProperty/findByRelateTreat.action',
		        type: 'post',
		        data: {'diseaseId':diseaseId, 'dgsId':dgsId, 'uid':uid},
		        dataType: 'json',
		        error: function() { $.messager.show({ title: '提示', msg: '加载采集模型出错!' }); },
		        success : function(data) {
					model.initModel(data, '该诊断没有匹配的采集模型!', dgsTime);
				}
		    });
		},
		initModel : function(data, msg, dgsTime) {
			var _dmForm = $(model.dmPanel);
			if(data != null && data.length>0) {
				$.each(data, function(i, obj) {
					var _index = -1;
					var _length = (obj.dmLogList?obj.dmLogList.length:0);
					var _cont = ['<div id="dataModel_',obj.dmId,'" class="dg_panel">'];
					while(true) {
						var _dmLog = undefined;
						var _suffix = '_'+obj.dmId+'_'+_index;
						var _boolBack = false;
						if(_length>0 && _index>=0) {
							_dmLog = obj.dmLogList[_index];
						} else if(_length===0 && _index>=0) {
							_boolBack = true;
						}
						var _cldCont = [];
						if(_index===-1) {
							_cldCont.push('<div class="hidden">');
						}
						_cldCont.push('<ul class="dgc_panel" id="dataModel',_suffix,'" data-index="',_index,'">');
						_cldCont.push('<li class="hidden">',
								'<input type="hidden" id="dataModel',_suffix,'_dgs_id" name="dataModel',_suffix,'_dgs_id" value="',(_dmLog?_dmLog.id:''),'">',
					            '<input type="hidden" id="dataModel',_suffix,'_isdel" name="dataModel',_suffix,'_isdel" value="0">',
								'</li>');
						_cldCont.push('<li class="dp_title"><span class="dpt_name">',obj.dmName,'：</span>');
						if(_dmLog) {
							if(_dmLog.test_time != undefined && _dmLog.test_time != '')
								dgsTime = Comm.date.formatStr(_dmLog.test_time.time,'yyyy-MM-dd');
							else dgsTime = '';
						}
						_cldCont.push('<span class="dpt_attr"',(obj.testCodeName!=null&&obj.testCodeName.length>0?'':' style="display:none"'),'>',obj.testCodeName,'：<input type="text" name="dataModel',_suffix,'_code" value="',(_dmLog?_dmLog.test_code:''),'"/></span>');
						_cldCont.push('<span class="dpt_attr"',(obj.testTimeName!=null&&obj.testTimeName.length>0?'':' style="display:none"'),'>',obj.testTimeName,'：<input type="text" name="dataModel',_suffix,'_time" value="',dgsTime,'" class="easyui-datebox"/></span>');
						_cldCont.push('</li>');
						//判断是否存在模板
						if(obj.etemplate!=null && obj.etemplate.length>0) {
							var _template = eval(obj.etemplate);
							var _orgid = 'dataModel_'+obj.dmId+'_-1';
							var _newid = 'dataModel'+_suffix;
							//替换ID
							if(_index>-1) {
								_template = _template.replace(new RegExp(_orgid,'g'), _newid);
							}
							_cldCont.push(_template);
							//处理指标输入框
							$.each(obj.colsList, function(j, colsObj) {
								dealCols(_suffix, colsObj, _index, _dmLog);
							});
						} else {
							var _showTitle = template.tableTitle;
							if(!_showTitle) _showTitle = '检验结果';
							_cldCont.push('<li class="dp_cont">',
			      				'<table class="dg_table" rules="rows">',
					      			'<tr>',
					      				'<th>项目名</th>',
					      				'<th>',_showTitle,'</th>',
					      				'<th>单位</th>',
					      				'<th>参考范围</th>',
					      			'</tr>');
							$.each(obj.colsList, function(j, colsObj) {
								dealCols(_suffix, colsObj, _index, _dmLog);

								var _id = 'dataModel'+_suffix+'_colsPanel_'+colsObj.ename;
								//为分隔符
								if(colsObj.type===1) {
									_cldCont.push('<tr><td class="dgt_separator" colspan="4">',colsObj.cname,'</td></tr>');
								} else {
									var _cname = (colsObj.dispCol===1?colsObj.cname:'');
									_cldCont.push('<tr><td class="dgt_title">',_cname,'</td>');
									_cldCont.push('<td><div id="',_id,'"></div></td>');
								    _cldCont.push('<td>',colsObj.unitName,'</td>');
								    _cldCont.push('<td>',colsObj.minValue,'~',colsObj.maxValue,'</td></tr>');
								}
							});
							_cldCont.push('</table></li>');
						}
						//处理上传文件
						var _imgInfo = '';
						var _fids = '';
						if(_index>=0 && _length>0 && _dmLog.fsize>0) {
							_fids = _dmLog.fids;
							$.each(_dmLog.flist, function(i, imgObj) {
								_imgInfo += model.showImg('dataModel'+_suffix, imgObj.fid, imgObj.filename, imgObj.path, 'init');
							});
						}
						_cldCont.push('<li class="dp_operate"><div><a href="javascript:;" onclick="model.upload(\'dataModel',_suffix,'\')">上传病例图片</a></div><div id="dataModel',_suffix,'_img_panel">',_imgInfo,'</div>');
						_cldCont.push('<input type="hidden" id="dataModel',_suffix,'_fids" name="dataModel',_suffix,'_fids" value="',_fids,'"></li>');
						//可以录入多个
						if(obj.etime==='3') {
							var _showOp = '增加记录';
							if(_index!=-1 && _index<(_length - 1)) {
								_showOp = '删除记录';
							}
							_cldCont.push('<li class="dp_operate"><a href="javascript:;" onclick="model.addModel(this, \'dataModel',_suffix,'\')">',_showOp,'</a></li>');
						}
						_cldCont.push('</ul>');
	
						if(_index===-1) {
							_cldCont.push('</div>');
							_dmForm.parent().append(_cldCont.join(''));
						} else {
							_cont.push(_cldCont.join(''));
						}
						//alert(_index+'||'+_length);
						_index ++;
						if(_index>=_length && _length>0) _boolBack = true;
						if(_boolBack) break;
					}
					_cont.push('</div>');
					if(_index)
					_dmForm.append(_cont.join(''));
				});
				model.dealCols();
				$.parser.parse(model.dmPanel);
			} else if(msg) {
				_dmForm.append(msg);
			}
			//处理指标
			function dealCols(_suffix, colsObj, _index, _dmLog) {
				var _id = 'dataModel'+_suffix+'_colsPanel_'+colsObj.ename;
				colsObj['panelid'] = _id;
				colsObj['suffix'] = _suffix;
				colsObj['isValue'] = 0;
				colsObj['index'] = _index;
				//设置值
				if(_dmLog && _index >= 0) {
					colsObj['isValue'] = 1;
					var _key1 = colsObj.ename+'_1';
					var _key2 = colsObj.ename+'_2';
					try {
						colsObj[_key1] = eval('_dmLog.'+_key1);
						colsObj[_key2] = eval('_dmLog.'+_key2);
					} catch (e) {
						alert(['指标:',colsObj.cname,'配置有异常!'].join(''));
					}
				}
				
				//添加到需要加载指标的集合中
				var _co = {};
				for(var key in colsObj) {
					_co[key] = colsObj[key];
				}
				model.cols.push(_co);
			}
		},
		//上传病例图片
		upload : function(_id) {
			model.uploadImgPrefix = _id;
			var _dlgid = Comm.date.getTime();
			//通过弹出窗口的方式打开页面
            Comm.dialog({
            	content: '<iframe src="'+webroot+'/medicalRecords/toupload.action?dialogId='+_dlgid+'" frameborder="0" width="100%" height="100%"></iframe>',
                title: '上传病例图片',
                width: 500,
                height: 200,
                dialogid: _dlgid
            });
		},
		//显示图片
		showImg : function(prefix, fileid, filename, filepath, type, closeId) {
			if(closeId) {
				Comm.dialogClose(closeId);
			}
			var _cont = ['<span style="padding: 10px 5px 0px 5px;display: inline-block;text-align: center;">',
             '<a href="/uploadFile/',filepath,'/',filename,'" target="_blank"><img src="/uploadFile/',filepath,'/suo_img/',filename,'" width="50" height="50" border="0"/></a><br/>',
             '<a href="javascript:;" onclick="model.delImg(this, ',fileid,', \'',prefix,'\')">删除</a></span>'];
			if(type==='init') {
				return _cont.join('');
			}
			$('#'+prefix+'_img_panel').append(_cont.join(''));
			var _fids = $('#'+prefix+'_fids');
			_fids.val(_fids.val()+fileid+',');
		},
		//删除上传的图片
		delImg : function(_this, fileid, imgPrefix) {
			$.ajax({
		        url: webroot+'/uploadFiles/delFile.action',
		        type: 'post',
		        data: {'hpUploadFiles.fid':fileid},
		        dataType: 'json',
		        error: function() { $.messager.show({ title: '提示', msg: '删除图片出错!' }); },
		        success : function(data) {
		        	if(data.code==1) {
						$.messager.show({title: '提示',msg: '删除图片成功！'});
						//获取fids的对象
						var _fids = $('#'+imgPrefix+'_fids');
						_val = (','+_fids.val()).replace(','+fileid+',', ',');
						_fids.val(_val.substring(1));
						$(_this).parent().remove();
					} else {
						$.messager.show({title: '提示',msg: '删除图片失败！'});
					}
		        }
			});
		},
		//新增采集单[type:0代表非采集模型内的添加]
		addModel : function(_this, _id, type) {
			var _cloneObj = $('#'+_id.substring(0, _id.lastIndexOf('_'))+'_-1');
			_id = $('#'+_id);
			if(type===0 || $(_this).html()==='增加记录') {
				var _index = parseInt(_id.attr('data-index'))+1;
				var _cpObj = _cloneObj.clone(true);
				var _pid = _cpObj.attr('id');
				var _nid = _id.parent().attr('id')+'_'+_index;
				//替换ID
				_cpObj.html(_cpObj.html().replace(new RegExp(_pid,'g'), _nid));
				//设置自己的ID和索引
				_cpObj.attr({'id':_nid, 'data-index': _index});
				_id.parent().append(_cpObj);
				//清空上传图片的Panel
				$('#'+_nid+'_img_panel').empty();
				//日期控件
				//_cpObj.find('');$("#"+newfieldsetid+" input[name='doctorAdvice.startDate']").datebox();
				$.parser.parse('#'+_nid);
				if(type!=0)
					$(_this).html('删除记录');
			} else if($(_this).html()==='删除记录') {
				$.messager.confirm('提示', '确认要删除吗?', function (r) {
	                if (r) {
	    				_id.attr('class', 'hidden');
	    				$('#'+_id.attr('id')+'_isdel').val(1);
	                }
	            });
			}
		},
		//处理采集单控件组装
		dealCols : function() {
			$.each(model.cols, function(i, obj) {
				model.createCols(i, obj);
			});
			model.initDm();
			model.cols = [];
			//给控件绑定enter事件进行提交 onclick="edi.clickSaveDataModel()"
		},
		createCols : function(i, obj) {
			//TODO 目前不需要校验
			obj.required = 0;
			
			//alert(obj.panelid + '||' + obj.suffix);
			var _panel = $('#'+obj.panelid);
			var _selname = 'dataModel'+obj.suffix+'_sel_'+obj.ename+'_'+obj.colsId;
			var _inpname = 'dataModel'+obj.suffix+'_inp_'+obj.ename+'_'+obj.colsId;
    		var _value1 = '';
    		var _value2 = '';
    		//有值
    		if(obj.isValue===1) {
    			_value1 = eval('obj.'+obj.ename+'_1');
    			_value2 = eval('obj.'+obj.ename+'_2');
    			if(_value1 === undefined) _value1 = '';
    			if(_value2 === undefined) _value2 = '';
    		}
			//输入类型(inputtype)：1：选择，2：输入，3：选择+输入
			if(obj.inputtype===1 || obj.inputtype===3) {
				//从字典取值
				if(obj.dircode!=null && obj.dircode!='') {
					$.ajax({
				        url: webroot+'/dict/ajaxLoad.action',
				        data: {'dircode':obj.dircode},
				        type: 'post', dataType: 'json',
				        error: function() { $.messager.show({ title: '提示', msg: '加载选择项出错!' }); },
				        success : function(data) {
				        	if(data.length>0) {
				        		var _cont = [];
								var _validate = (obj.required===1?' class="easyui-validatebox" required="true"':'');
					        	//选择类型： 1：单选（下拉），2：单选（radio），4：多选（checkbox），
				        		if(obj.selecttype===1) {
				        			_cont.push('<select name="',_selname,'"',_validate,'><option value="">--请选择--</option>');
					        		$.each(data, function(i, dictObj) {
					        			_cont.push('<option value="',dictObj.name,'" ',(_value1==dictObj.name?'selected="selected"':''),'>',dictObj.value,'</option>');
					        		});
				        			_cont.push('</select> ');
				        		} else if(obj.selecttype===2) {
				        			var _br = (obj.pbway===1?'<br/>':'');
				        			$.each(data, function(i, dictObj) {
					        			_cont.push((i>0?_br:''),'<label><input type="radio" name="',_selname,'"',_validate,' ondblclick="Comm.cancelRadio(this)" value="',dictObj.name,'" ',(_value1==dictObj.name?'checked="checked"':''),'/> ',dictObj.value,'</label> ');
					        		});
				        		} else if(obj.selecttype===4) {
				        			var _br = (obj.pbway===1?'<br/>':'');
				        			$.each(data, function(j, dictObj) {
				        				var _checked = '';
				        				$.each(_value1.split(','), function(k, val1Obj) {
				        					if(val1Obj==dictObj.name) {
				        						_checked = 'checked="checked"';
				        						return false;
				        					}
				        				});
					        			_cont.push((i>0?_br:''),'<label><input type="checkbox"',_validate,' name="',_selname,'" value="',dictObj.name,'" ',_checked,'/> ',dictObj.value,'</label> ');
					        		});
				        		}
				        		_panel.html(_cont.join('')+_panel.html());
								if(obj.index!=-1) $.parser.parse('#'+obj.panelid);
				        	}
				        }
					});
				}
				//从itemlist中取值
				else {
					var _cont = [];
					var _item = obj.itemlist.split(',');
					var _validate = (obj.required===1?' class="easyui-validatebox" required="true"':'');
		        	//选择类型： 1：单选（下拉），2：单选（radio），4：多选（checkbox），
				    if(obj.selecttype===1) {
	        			_cont.push('<select name="',_selname,'"',_validate,'><option value="">--请选择--</option>');
						$.each(_item, function(i, valObj) {
							if(valObj!='') _cont.push('<option value="',valObj,'" ',(_value1==valObj?'selected="selected"':''),'>',valObj,'</option>');
						});
	        			_cont.push('</select> ');
				    } else if(obj.selecttype===2) {
	        			var _br = (obj.pbway===1?'<br/>':'');
	        			$.each(_item, function(i, valObj) {
	        				if(valObj!='') _cont.push((i>0?_br:''),'<label><input type="radio" name="',_selname,'"',_validate,' ondblclick="Comm.cancelRadio(this)" value="',valObj,'" ',(_value1==valObj?'checked="checked"':''),'/> ',valObj,'</label> ');
		        		});
	        		} else if(obj.selecttype===4) {
	        			var _br = (obj.pbway===1?'<br/>':'');
	        			$.each(_item, function(j, valObj) {
	        				var _checked = '';
	        				$.each(_value1.split(','), function(k, val1Obj) {
	        					if(val1Obj==valObj) {
	        						_checked = 'checked="checked"';
	        						return false;
	        					}
	        				});
	        				if(valObj!='') _cont.push((i>0?_br:''),'<label><input type="checkbox" name="',_selname,'"',_validate,' value="',valObj,'" ',_checked,'/> ',valObj,'</label> ');
		        		});
	        		}
	        		_panel.html(_cont.join('')+_panel.html());
					if(obj.index!=-1) $.parser.parse('#'+obj.panelid);
				}
			}
			//为输入或选择+输入
			if(obj.inputtype===2 || obj.inputtype===3) {
				var _cont = [];
				//字段数据类型：科学数字型
				if(obj.datatype==='float(20,3)') {
					var _power = model.parsePower(_value2);
					var _typeValidate = (obj.required===1?' class="easyui-validatebox w_50" required="true"':'class="w_50"');
					_cont.push('<input type="text" id="',_inpname,'_p1" onblur="model.power(\'',_inpname,'_p1\', \'',_inpname,'_p2\')"',_typeValidate,' value="',_power[0],'"/> 10^ <input type="text" id="',_inpname,'_p2" onblur="model.power(\'',_inpname,'_p1\', \'',_inpname,'_p2\')"',_typeValidate,' value="',_power[1],'"/>');
					_cont.push('<input type="hidden" id="',_inpname,'" name="',_inpname,'"',_typeValidate,' value="',_value2,'"/>');
				}
				else if(obj.datatype==='int') {
					var _validate = (obj.required===1?' required="true"':'');
					_cont.push('<input type="text" class="easyui-numberbox" name="',_inpname,'"',_validate,' value="',_value2,'"/>');
				}
				//字段数据类型：日期
				else if(obj.datatype==='date') {
					var _validate = (obj.required===1?' required="true"':'');
					_cont.push('<input type="text" class="easyui-datebox" name="',_inpname,'"',_validate,' value="',_value2,'"/>');
				}
				//字段类型为：长文本
				else if(obj.datatype==='varchar(500)') {
					var _validate = (obj.required===1?' class="easyui-validatebox" required="true"':'');
					_cont.push('<textarea name="',_inpname,'"',_validate,' cols="30" rows="2">',_value2,'</textarea>');
				}
				//字段类型为：长文本
				else if(obj.datatype==='varchar(2000)') {
					var _validate = (obj.required===1?' class="easyui-validatebox" required="true"':'');
					_cont.push('<textarea name="',_inpname,'"',_validate,' cols="30" rows="3">',_value2,'</textarea>');
				}
				//普通文本
				else {
					var _size = obj.maxlength&&obj.maxlength>0&&obj.maxlength!=0?'size="'+obj.maxlength+'"':'';
					var _validate = (obj.required===1?' class="easyui-validatebox" required="true"':'');
					_cont.push('<input type="text" ',_size,' name="',_inpname,'"',_validate,' value="',_value2,'"/>');
				}
				_panel.append(_cont.join(''));
				if(obj.index!=-1) $.parser.parse('#'+obj.panelid);
			}
		},
		//科学数字型计算
		power : function(_id1, _id2) {
			var _num1 = $('#'+_id1).val();
			if(_num1==='') return;
			var _num2 = $('#'+_id2).val();
			if(_num2==='') return;
			var _num = _num1 * Math.pow(10, _num2);
			$('#'+_id1.substring(0, _id1.length - 3)).val(_num);
		},
		//解析科学数字型
		parsePower : function(num, id1, id2) {
			if(num===undefined || num==='') return ['', ''];
			if(typeof(num)!='number') return ['', ''];
			if(num<=0) return ['', ''];
			var _index = 0;
			while(true) {
				if( (num/10+'').indexOf('.')===-1) {
					num = num / 10;
					_index ++;
					if(_index > 1000) break;
				} else {
					break;
				}
			}
			if(id1 && id2) {
				$('#'+id1).val(num);
				$('#'+id2).val(_index);
			} else {
				return [num, _index];
			}
		},
		//初始化样式、事件等
		initDm : function() {
			setTimeout(function() {
				$('.data-readonly').each(function(i, obj) {
					$(obj).find('input').attr('readonly', true).css({'border':'0px'});
				});
				$('.data-fn').each(function(i, obj) {
					if($(obj).attr('data-fn-type')==='change') {
						$(obj).find('input').change(function() {
							eval($(obj).attr('data-fn'));
						});
					} else if($(obj).attr('data-fn-type')==='keyup') {
						$(obj).find('input').keyup(function() {
							eval($(obj).attr('data-fn'));
						});
					} else if($(obj).attr('data-fn-type')==='click') {
						$(obj).find('input').click(function() {
							eval($(obj).attr('data-fn'));
						});
					}
				});
			}, 800);
		}
};