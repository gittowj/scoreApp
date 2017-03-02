//患者管理
var template = {
		//table结果显示
		tableTitle:'检验结果'
};

//基本信息(670)
//录入模板：template.jbxx.enter();
//显示模板：/WEB-INF/view/model/hzgl/jbxx.jsp
template.jbxx = {
		//录入模板
		enter : function() {
			return ['<li class="dp_cont"><table rules="rows" class="dg_table">			<tbody>				<tr>					<th>						项目名					</th>					<th>						检验结果					</th>					<th>						单位					</th>				</tr>				<tr>					<td class="dgt_title">						床号					</td>					<td>						<span id="dataModel_670_-1_colsPanel_ch"></span>					</td>					<td></td>				</tr>				<tr>					<td class="dgt_title">						身高					</td>					<td>						<span id="dataModel_670_-1_colsPanel_sg" class="data-fn" data-fn-type="keyup" data-fn="template.jbxx.calcBmi()"></span>					</td>					<td align="center">						cm					</td>				</tr>				<tr>					<td class="dgt_title">						体重					</td>					<td>						<span id="dataModel_670_-1_colsPanel_tz" class="data-fn" data-fn-type="keyup" data-fn="template.jbxx.calcBmi()"></span>					</td>					<td align="center">						kg					</td>				</tr>				<tr>					<td class="dgt_title">						BMI					</td>					<td>						<span id="dataModel_670_-1_colsPanel_bmi" class="data-readonly"></span>					</td>					<td align="center">						Kg/㎡					</td>				</tr>				<tr>					<td class="dgt_title">						职业					</td>					<td>						<span id="dataModel_670_-1_colsPanel_zy"></span>					</td>					<td></td>				</tr>				<tr>					<td class="dgt_title">						糖尿病教育					</td>					<td>						<span id="dataModel_670_-1_colsPanel_tnbjy"></span>					</td>					<td></td>				</tr>				<tr>					<td class="dgt_title">						入院日期					</td>					<td>						<span id="dataModel_670_-1_colsPanel_ryrq"></span>					</td>					<td></td>				</tr>				<tr>					<td class="dgt_title">						出院日期					</td>					<td>						<span id="dataModel_670_-1_colsPanel_cyrq"></span>					</td>					<td></td>				</tr>			</tbody>		</table></li>'].join('');
		},
		//计算BMI
		calcBmi : function() {
			var sg=$("input[name='dataModel_670_0_inp_sg_11763']").val();
			var tz=$("input[name='dataModel_670_0_inp_tz_11764']").val();
			var theValue="";
			if(sg!="" && tz!=""){
				if(!isNaN(sg) && !isNaN(tz)){
					theValue = tz/((sg/100)*(sg/100));
				}
			}
			if(theValue!=""){
				theValue=theValue.toFixed(2);
			}
			$("input[name='dataModel_670_0_inp_bmi_11765']").val(theValue);
		}
};

//糖尿病足风险筛查结果(673)
//录入模板：template.tnbzfxscjg.enter();
//显示模板：/WEB-INF/view/model/hzgl/tnbzfxscjg.jsp
template.tnbzfxscjg = {
		//录入模板
		enter : function() {
			return ['<li class="dp_cont"><table rules="rows" class="dg_table">			<tbody>				<tr>					<th>						项目名					</th>					<th colspan="3">						检验结果					</th>				</tr>				<tr>					<td class="dgt_title" width="15%">						感觉神经病变					</td>					<td width="18%">						尼龙丝检查：<span id="dataModel_673_-1_colsPanel_nlsjc" class="data-fn" data-fn-type="click" data-fn="template.tnbzfxscjg.calVPT()"></span>					</td>					<td width="25%">						VPT：<span id="dataModel_673_-1_colsPanel_gjsjbbvpt" class="data-fn" data-fn-type="keyup" data-fn="template.tnbzfxscjg.calVPT()"></span>伏特					</td>					<td width="20%">						<span id="dataModel_673_-1_colsPanel_gjsjbbw" class="data-readonly"></span>					</td>				</tr>				<tr>					<td class="dgt_title">						下肢血管病变					</td>					<td>						ABI：<span id="dataModel_673_-1_colsPanel_abi1" class="data-fn" data-fn-type="keyup" data-fn="template.tnbzfxscjg.calABI()"></span>					</td>					<td>						CAVI：<span id="dataModel_673_-1_colsPanel_vavi1"></span>					</td>					<td>						<span id="dataModel_673_-1_colsPanel_xzxgbbw" class="data-readonly"></span>					</td>				</tr>				<tr>					<td class="dgt_title">						足部畸形					</td>					<td colspan="3">						<span id="dataModel_673_-1_colsPanel_zbjx"></span>					</td>				</tr>				<tr>					<td class="dgt_title">						溃疡史					</td colspan="3">					<td>						<span id="dataModel_673_-1_colsPanel_kys"></span>					</td>				</tr>				<tr>					<td class="dgt_title">						截肢史					</td>					<td colspan="3">						<span id="dataModel_673_-1_colsPanel_jzs"></span>					</td>				</tr>				<tr>					<td class="dgt_title">						糖尿病足危险度分级					</td>					<td colspan="3">						<span id="dataModel_673_-1_colsPanel_tnbzwxdfj"></span>					</td>				</tr>			</tbody>		</table></li>'].join('');
		},
		//计算是否有感觉神经病变
		calVPT : function(){
			var theAttr = $("input[name='dataModel_673_0_sel_nlsjc_11993']:checked").val();
			var theValue = $("input[name='dataModel_673_0_inp_gjsjbbvpt_11782']").val();
			var theReslut = "";
			if(theAttr==='阳性'){
				theReslut="有感觉神经病变";
			}else{
				if(theAttr && theValue!=""){
					if(!isNaN(theValue)){
						if(theAttr==='阴性' && theValue>25){
							theReslut="有感觉神经病变";
						}else{
							theReslut="无感觉神经病变";
						}
					}
				}
			}
			$("input[name='dataModel_673_0_inp_gjsjbbw_11780']").val(theReslut);
		},
		//计算是否有下肢血管病变
		calABI : function(){
			var theValue = $("input[name='dataModel_673_0_inp_abi1_11787']").val();
			var theReslut = "";
			if(theValue!=""){
				if(!isNaN(theValue)){
					if(theValue<0.9){
						theReslut="有下肢血管病变";
					}else{
						theReslut="无下肢血管病变";
					}
				}
			}
			$("input[name='dataModel_673_0_inp_xzxgbbw_11785']").val(theReslut);
		}
};

