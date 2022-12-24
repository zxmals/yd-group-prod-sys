// 预定义 待维护账单科目全局搜索关键字，防止分页查询时中途插入关键字影响
item_key_words = ""
// 预定义 已维护产品模糊搜索关键字，防止分页查询时中途插入关键字影响
prod_key_words = ""
// 预定义 已维护产品分类搜索筛选信息，防止分页查询时中途插入关键字影响
ctg_m = null

// 预定义 已维护产品模糊搜索关键字，防止分页查询时中途插入关键字影响
zp_prod_key_words = ""
// 预定义 已维护产品分类搜索筛选信息，防止分页查询时中途插入关键字影响
zp_ctg_m = null

$(document).ready(function(){
	if(document.cookie.split('=')[0]=='session'&&document.cookie.split('=')[1].substring(0,2)=='ey'){
		$('#main-nav-h li[act="login"]').css('display','none')
		$('#main-nav-h li[act="logout"]').css('display','block')
	}else{
		$('#main-nav-h li[act="login"]').css('display','block')
		$('#main-nav-h li[act="logout"]').css('display','none')
	}

	// 加载前台五级分类数据并设置
	swal('加载中……',{button:false})
	$.post('/getctginfo',function(data,status){
		if(status){
			$('#select1 option').remove()
			$('#select2 option').remove()
			$('#select3 option').remove()
			$('#select4 option').remove()
			$('#select5 option').remove()
			ctg1 = '<option data-divider="true">产品费项矩阵一级</option>'
			ctg2 = '<option data-divider="true">产品费项矩阵二级</option>'
			ctg3 = '<option data-divider="true">产品费项矩阵三级</option>'
			ctg4 = '<option data-divider="true">产品费项矩阵四级</option>'
			ctg5 = '<option data-divider="true">产品费项矩阵五级</option>'
			data.forEach(function(e){
				ctg1 += ctg1.indexOf(e['catg_id1'])<0 && e['catg_id2']!=null?'<option catg_id="'+e['catg_id1']+'"  if_zp_prod="'+e['if_zp_prod']+'"  >'+e['catg_name1']+'</option>':""
				ctg2 += ctg2.indexOf(e['catg_id2'])<0 && e['catg_id2']!=null?'<option catg_id="'+e['catg_id2']+'"  if_zp_prod="'+e['if_zp_prod']+'"   parent_id="'+e['parent_id1']+'">'+e['catg_name2']+'</option>':""
				ctg3 += ctg3.indexOf(e['catg_id3'])<0 && e['catg_id3']!=null?'<option catg_id="'+e['catg_id3']+'"  if_zp_prod="'+e['if_zp_prod']+'"   parent_id="'+e['parent_id2']+'">'+e['catg_name3']+'</option>':""
				ctg4 += ctg4.indexOf(e['catg_id4'])<0 && e['catg_id4']!=null?'<option catg_id="'+e['catg_id4']+'"  if_zp_prod="'+e['if_zp_prod']+'"   parent_id="'+e['parent_id3']+'">'+e['catg_name4']+'</option>':""
				ctg5 += ctg5.indexOf(e['catg_id5'])<0 && e['catg_id5']!=null?'<option catg_id="'+e['catg_id5']+'"  if_zp_prod="'+e['if_zp_prod']+'"   biz_code='+e['biz_code']+' parent_id="'+e['parent_id4']+'">'+e['catg_name5']+'</option>':""
			});
			$('#select1').append(ctg1)
			$('#select2').append(ctg2)
			$('#select3').append(ctg3)
			$('#select4').append(ctg4)
			$('#select5').append(ctg5)
			$('.selectpicker').selectpicker('refresh');
		}else{
			swal('加载出错，请重新进入！',{button:false})
		}
		swal.close()
	});

	// select-change-events  分类选择器监听 ，多层级菜单联动,向下联动
	function down_ch_select(id,catgs){
		pid = []
		$('#select'+id+' option').each(function(e){
			if($(this).attr('data-divider')==true){$(this).prop('selected',true)}
			if(catgs.filter((e)=>{return e==$(this).attr('parent_id')}).length==0){
				$(this).prop('disabled',true)				
				$(this).removeAttr('style')
			}else{$(this).prop('disabled',false);$(this).css('background-color','#88c9e7');pid.push($(this).attr('catg_id'))}
			
		});
		return pid
	}

	// select-change-events  分类选择器监听 ，多层级菜单联动,向上联动
	function up_ch_select(id,partents){
		pid = []
		$('#select'+id+' option').each(function(e){
			if($(this).attr('data-divider')==true){$(this).prop('selected',true)}
			if(partents.filter((e)=>{return e==$(this).attr('catg_id')}).length==0){
				$(this).prop('disabled',true)
				$(this).removeAttr('style')
			}else{$(this).prop('disabled',false);$(this).css('background-color','#88c9e7');pid.push($(this).attr('parent_id'))}
		});
		return pid
	}

	// select-change-events  分类选择器监听 ，多层级菜单联动
	function update_selector(selid,catg_id,parent_id){
		if(selid=='select1'){
			pid = []
			pid.push(catg_id)
			pid = down_ch_select(2,pid)
			pid = down_ch_select(3,pid)
			pid = down_ch_select(4,pid)
			pid = down_ch_select(5,pid)						
		}

		if(selid=='select2'){
			// down
			pid = []
			pid.push(catg_id)
			pid = down_ch_select(3,pid)
			pid = down_ch_select(4,pid)
			pid = down_ch_select(5,pid)	
			// up
			pid = []
			pid.push(parent_id)
			pid = up_ch_select(1,pid)						
		}

		if(selid=='select3'){
			// down
			pid = []
			pid.push(catg_id)
			pid = down_ch_select(4,pid)
			pid = down_ch_select(5,pid)	
			// up
			pid = []
			pid.push(parent_id)
			pid = up_ch_select(2,pid)
			pid = up_ch_select(1,pid)							
		}

		if(selid=='select4'){
			// down
			pid = []
			pid.push(catg_id)
			pid = down_ch_select(5,pid)	
			// up
			pid = []
			pid.push(parent_id)
			pid = up_ch_select(3,pid)
			pid = up_ch_select(2,pid)
			pid = up_ch_select(1,pid)						
		}

		if(selid=='select5'){
			// up
			pid = []
			pid.push(parent_id)
			pid = up_ch_select(4,pid)
			pid = up_ch_select(3,pid)
			pid = up_ch_select(2,pid)
			pid = up_ch_select(1,pid)						
		}
		// 专线专区单独设置
		if($('#main-nav-h li[name="zb-prod"]').hasClass('active')){
			$('.selectpicker option[if_zp_prod="0"]').css('display','none')
		}		
		$('.selectpicker').selectpicker('refresh')
	}
	// select-change-events  分类选择器监听
	$('.selectpicker').change(function(){
		catg_id = $(this).find('option:selected').attr('catg_id')
		parent_id = $(this).find('option:selected').attr('parent_id')
		selid =  $(this).attr('id')
		update_selector(selid,catg_id,parent_id)
	});

	// 重置分类选项
	$('#reset-ctg').click(function(){
		$('.selectpicker option[data-divider=true]').prop('selected',true)
		$('.selectpicker option').each(function(e){
			$(this).prop('disabled',false)
			$(this).removeAttr('style')
		});
		// 专线专区单独设置
		if($('#main-nav-h li[name="zb-prod"]').hasClass('active')){
			$('.selectpicker option[if_zp_prod="0"]').css('display','none')
		}		
		$('.selectpicker').selectpicker('refresh')
	});

});

// 查看从属账单科目-科目名称-需重载函数
reload_item_td_info=function(){
	$('#item-info table td').click(function(){
		$(this).popover('show')
	});


}

$('#item-info .modal-footer button[act="export-data"]').click(function(){
	// console.log('--------------------export-item-info------------------------------')
	window.open('/downlowd-item-info-by-offerid?offer_info='+$(this).attr('offer_info')+'&offer_id='+$(this).attr('offer_id'))
});

// 查看从属账单科目信息-需重载函数
reload_item_info_click=function(){
	$('a[data_prod]').click(function(){
		offer_id = $(this).attr('data_prod')
		offer_info = $(this).siblings().eq(0).text()
		$('#item-info .modal-header h4').text(offer_info+'下属账单科目')
		swal('加载中……',{button:false});
		$.post('/get-item-info-by-offerid',{offer_id:offer_id},function(data,status){			
			if(status){
				$('#item-info .modal-body tbody tr').remove()
				data.forEach(function(e){
					ht = '<tr class="info">'
					ht += '<td class="col-md-1">'+e['rn']+'</td>'									
					ht += e['item_name'].length>20 ? '<td class="col-md-8" data-toggle="popover"  title="科目名称"  data-content="'+e['item_name']+'"><a href="#">'+e['item_name'].substr(0,17)+'...</a></td>':'<td class="col-md-8">'+e['item_name']+'</td>'
					ht += '<td class="col-md-3">'+e['item_id']+'</td>'
					$('#item-info .modal-body tbody').append(ht)
				});
				$('#item-info .modal-footer button[act="export-data"]').attr('offer_info',offer_info)
				$('#item-info .modal-footer button[act="export-data"]').attr('offer_id',offer_id)
				reload_item_td_info()
				swal.close()
			}else{
				swal('查询错误！',{button:false})
			}
		});
		$('#item-info').modal('show')
	});

}

// 设置待维护账单科目 html 部分
function append_item_html(item_name,item_id,eff_date,op_date,cur_m_fee,last_m_fee,last2_m_fee){
	var ht=""
	ht = '<div class="list-group" data-search="true"><li  class="list-group-item list-group-item-danger">'
	ht += item_name+"("+item_id+")"
	ht += '<li  class="list-group-item list-group-item-info">上线日期 <span class="glyphicon glyphicon-asterisk"></span>  '
	ht += new Date(Date.parse(eff_date)).toLocaleString().split(' ')[0].replace(/\//g,'-')
	ht += '</li><li  class="list-group-item list-group-item-warning"><span href="#">'
	dates = new Date(op_date)
	ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
	ht += '收入（元）：'
	ht += cur_m_fee!=null?cur_m_fee:""
	ht += ' </span><span class="glyphicon glyphicon-option-vertical"></span><span href="#">'
	dates.setMonth(dates.getMonth()-1)
	ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
	ht += '收入（元）：'
	ht += last_m_fee!=null?last_m_fee:""
	ht += ' </span><span class="glyphicon glyphicon-option-vertical"></span><span href="#">'
	dates.setMonth(dates.getMonth()-1)
	ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
	ht += '收入（元）：'
	ht += last2_m_fee!=null?last2_m_fee:""
	ht += ' </span></li></div>'	
	return ht
}


// 设置已维护产品 html 部分
function append_online_prod_html(offer_id,offer_name,eff_date,catg_name1,catg_name2,catg_name3,catg_name4,catg_name5){
	var ht=""
	ht = '<ul class="list-group" data-search="true"><li  class="list-group-item list-group-item-danger">'
	ht += offer_name+'('+offer_id+')'
	ht += ' <span class="glyphicon glyphicon-book"></span></li><li  class="list-group-item list-group-item-info">上线日期 <span class="glyphicon glyphicon-asterisk"></span>'
	ht += new Date(Date.parse(eff_date)).toLocaleString().split(' ')[0].replace(/\//g,'-')
	ht += '</li><li  class="list-group-item list-group-item-warning">归属层级 <span class="glyphicon glyphicon-asterisk"></span>'
	ht += catg_name1
	ht += catg_name2!=''&&catg_name2!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name2:''
	ht += catg_name3!=''&&catg_name3!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name3:''
	ht += catg_name4!=''&&catg_name4!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name4:''
	ht += catg_name5!=''&&catg_name5!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name5:''
	ht += '</li><a href="#" class="list-group-item list-group-item-info" data_prod="'+offer_id+'" >下属账单科目 <span class="glyphicon glyphicon-new-window"></span></a></ul>'		
	return ht
}


// 设置专线专区 html 部分
function append_zb_prod_html(offer_id,offer_name,eff_date,catg_name1,catg_name2,catg_name3,catg_name4,catg_name5){
	var ht=""
	ht = '<ul class="list-group" data-search="true"><li  class="list-group-item list-group-item-danger">'
	ht += offer_name+'('+offer_id+')'
	ht += ' <span class="glyphicon glyphicon-book"></span></li><li  class="list-group-item list-group-item-info">上线日期 <span class="glyphicon glyphicon-asterisk"></span>'
	ht += new Date(Date.parse(eff_date)).toLocaleString().split(' ')[0].replace(/\//g,'-')
	ht += '</li><li  class="list-group-item list-group-item-warning">归属层级 <span class="glyphicon glyphicon-asterisk"></span>'
	ht += catg_name1
	ht += catg_name2!=''&&catg_name2!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name2:''
	ht += catg_name3!=''&&catg_name3!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name3:''
	ht += catg_name4!=''&&catg_name4!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name4:''
	ht += catg_name5!=''&&catg_name5!=null?'<span class="glyphicon glyphicon-chevron-right"></span>'+catg_name5:''
	ht += '</li><li class="list-group-item list-group-item-info"><a href="#" data_prod="'+offer_id+'" >下属账单科目 <span class="glyphicon glyphicon-new-window"></span></a><span class="glyphicon glyphicon-option-vertical"></span>'
	ht += '<a href="#">产品介绍 <span class="glyphicon glyphicon-new-window"></span></a><span class="glyphicon glyphicon-option-vertical"></span>'
	ht += '<a href="#">产品资费 <span class="glyphicon glyphicon-new-window"></span></a><span class="glyphicon glyphicon-option-vertical"></span>'
	ht += '<a href="#">管理办法 <span class="glyphicon glyphicon-new-window"></span></a><span class="glyphicon glyphicon-option-vertical"></span>'
	ht += '<a href="#">操作流程 <span class="glyphicon glyphicon-new-window"></span></a><span class="glyphicon glyphicon-option-vertical"></span>'
	ht += '<a href="#">近期维护 <span class="glyphicon glyphicon-new-window"></span></a>'
	ht += '</li></ul>'
	return ht
}

// 导航栏其他部分交互
$('#main-nav-h li[name!="log"]').click(function(){
	$('#main-nav-h li[name!="log"]').each(function(e){if($(this).hasClass('active')){$(this).removeClass('active');$(this).find('font').attr('color','white')}});
	$(this).addClass("active")
	$(this).find("font").removeAttr("color")
	$('#reset-ctg').click()                        // 刷新分类管理
	$('#search-all').attr('search-type',$(this).attr('name'))
	$('#search-ctg').attr('search-type',$(this).attr('name'))
	cur_name = $(this).attr('name')
	$('div[data-ts="show-contents"]').each(function(){
		if($(this).attr('data-id')!=cur_name){
			$(this).css('display','none')
		}else{
			if(cur_name=='wait-item'){
				$('#left-nav').css('display','none')
				// 单独处理待维账单科目导航栏
				$('#left-nav-item').css('display','block')
			}else{
				$('#left-nav').css('display','block')
				// 单独处理待维账单科目导航栏
				$('#left-nav-item').css('display','none')
			}
			$(this).css('display','block')
		}
	});
	// 导航栏 点击 待维护账单科目
	if($(this).attr('name')=='wait-item'){
		if($('div[data-id="wait-item"] .container-fluid div').attr('data-search')!='true'){
			swal('加载中……',{button:false});
			$.post('/get-witem-info-cnts',function(data,status){
				var cnts =  $('div[data-id="wait-item"] span').eq(0)
				if(status){
					cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
					row_cnts = data[0]['cnts']
					$.post('/get-witem-info',function(data,status){
						if(status){
							$('div[data-id="wait-item"] .container-fluid div').remove()
							// $('div[data-id="wait-item"] nav').remove()
							data.forEach(function(e){
								ht = append_item_html(e['item_name'],e['item_id'],e['eff_date'],e['op_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee'])
								$('div[data-id="wait-item"] .container-fluid').append(ht)
								// console.log(e)
							});
						}else{
							swal('查询错误！',{button:false})
						}
						
						$('a[hre-type][data-stypes="witem"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
						$('a[hre-type][data-stypes="witem"]').eq(0).attr('cur-page','1')
						$('a[hre-type][data-stypes="witem"]').eq(1).attr('cur-page','1')

						swal.close();
					});
				}else{
					swal('查询错误！',{button:false})
				}
			});
		}
	}

	// 导航栏 点击 已维护产品
	if($(this).attr('name')=='online_prod'){

		if($('div[data-id="online_prod"] .container-fluid ul').attr('data-search')!='true'){
			swal('加载中……',{button:false});
			$.post('/get-online-prod-info-cnts',function(data,status){
				var cnts =  $('div[data-id="online_prod"] span').eq(0)
				if(status){
					cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
					row_cnts = data[0]['cnts']
					$.post('/get-online-prod-info',function(data,status){
						if(status){
							$('div[data-id="online_prod"] .container-fluid ul').remove()
							data.forEach(function(e){
								ht = append_online_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
								$('div[data-id="online_prod"] .container-fluid').append(ht)
							});

							$('a[hre-type][data-stypes="online_prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
							$('a[hre-type][data-stypes="online_prod"]').eq(0).attr('cur-page','1')
							$('a[hre-type][data-stypes="online_prod"]').eq(1).attr('cur-page','1')							
							reload_item_info_click()
							// reload_item_info_click = null
							swal.close()
						}else{
							swal('查询错误！',{button:false})
						}
					});
				}else{
					swal('查询错误！',{button:false})
				}
			});
		}
	}

	// 导航栏 点击 专线专区
	if($(this).attr('name')=='zb-prod'){
		if($('div[data-id="zb-prod"] .container-fluid ul').attr('data-search')!='true'){
			swal('加载中……',{button:false});
			$.post('/get-zb-prod-info-cnts',function(data,status){
				var cnts =  $('div[data-id="zb-prod"] span').eq(0)
				if(status){
					cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
					row_cnts = data[0]['cnts']
					$.post('/get-zb-prod-info',function(data,status){
						if(status){
							$('div[data-id="zb-prod"] .container-fluid ul').remove()
							data.forEach(function(e){
								ht = append_zb_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
								$('div[data-id="zb-prod"] .container-fluid').append(ht)
							});
							$('a[hre-type][data-stypes="zb-prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
							$('a[hre-type][data-stypes="zb-prod"]').eq(0).attr('cur-page','1')
							$('a[hre-type][data-stypes="zb-prod"]').eq(1).attr('cur-page','1')							
							reload_item_info_click()
							swal.close()							
						}else{
							swal('查询错误！',{button:false})
						}
					});
				}else{
					swal('查询错误！',{button:false})
				}
			});

		}
	}

	// 导航栏 点击 已下线或已退出矩阵产品专区
	if($(this).attr('name')=='ald-prod'){}			
});

// 待维护账单科目-全局查询
$('#search-item').click(function(){
	key_words = $(this).parent().prev().val()
	$.post('/search-items-ky-cnts',{keyw:key_words},function(data,status){
		var cnts =  $('div[data-id="wait-item"] span').eq(0)
		if(status){
			swal('加载中……',{button:false});
			cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
			row_cnts = data[0]['cnts']
			$('div[data-id="wait-item"] .container-fluid div').remove()
			$.post('/search-items-ky',{keyw:key_words},function(data,status){
				if(status){
					data.forEach(function(e){
						ht = append_item_html(e['item_name'],e['item_id'],e['eff_date'],e['op_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee'])
						$('div[data-id="wait-item"] .container-fluid').append(ht)
					});
					$('a[hre-type][data-stypes="witem"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
					$('a[hre-type][data-stypes="witem"]').eq(0).attr('cur-page','1')
					$('a[hre-type][data-stypes="witem"]').eq(1).attr('cur-page','1')

					swal.close()
					item_key_words = key_words
				}else{
					swal('查询错误！',{button:false});
				}
			});
		}else{
			swal('查询错误！',{button:false});
		}
	});

});

// 模糊搜索管理
$('#search-all').click(function(){
	s_type = $(this).attr('search-type')
	key_words = $(this).parent().prev().val()

	if(s_type=='main'){swal('请选择专区进行查询',{button:false})}

	// 已维护产品-关键字查询
	if(s_type=='online_prod'){
		$.post('/get-online-prod-info-ky-cnts',{keyw:key_words},function(data,status){
			var cnts =  $('div[data-id="online_prod"] span').eq(0)
			if(status){			
				prod_key_words = key_words
				ctg_m = null
				$('#reset-ctg').click()
				swal('加载中……',{button:false});
				cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
				row_cnts = data[0]['cnts']
				$.post('/get-online-prod-info-ky',{keyw:key_words},function(data,status){
					$('div[data-id="online_prod"] .container-fluid ul').remove()
					data.forEach(function(e){
						ht = append_online_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
						$('div[data-id="online_prod"] .container-fluid').append(ht)
					});
					$('a[hre-type][data-stypes="online_prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
					$('a[hre-type][data-stypes="online_prod"]').eq(0).attr('cur-page','1')
					$('a[hre-type][data-stypes="online_prod"]').eq(1).attr('cur-page','1')					
					reload_item_info_click()
					swal.close()
				});
			}else{
				swal('查询错误！',{button:false});
			}
		});
	}

	// 专线专区-关键字查询
	if(s_type=='zb-prod'){
		$.post('/get-zb-prod-info-ky-cnts',{keyw:key_words},function(data,status){
			var cnts =  $('div[data-id="zb-prod"] span').eq(0)
			if (status) {
				zp_prod_key_words = key_words
				zp_ctg_m = null
				$('#reset-ctg').click()
				swal('加载中……',{button:false});
				cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
				row_cnts = data[0]['cnts']
				$.post('/get-zb-prod-info-ky',{keyw:key_words},function(data,status){
					if(status){
						$('div[data-id="zb-prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_zb_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="zb-prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).attr('cur-page','1')
						$('a[hre-type][data-stypes="zb-prod"]').eq(1).attr('cur-page','1')
						reload_item_info_click()
						swal.close()
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}else{
				swal('查询错误！',{button:false});
			}
		});
	}

	// 已下线产品或已退出矩阵产品专区-关键字查询
	if(s_type=='ald-prod'){}
});

// 分类查询管理
$('#search-ctg').click(function(){
	s_type = $(this).attr('search-type')
	// 已维护产品-分类查询
	all_ctg_m = {}
	all_ctg_m['ctg1'] = $('#select1 option:selected').attr('catg_id')
	all_ctg_m['ctg2'] = $('#select2 option:selected').attr('catg_id')
	all_ctg_m['ctg3'] = $('#select3 option:selected').attr('catg_id')
	all_ctg_m['ctg4'] = $('#select4 option:selected').attr('catg_id')
	all_ctg_m['ctg5'] = $('#select5 option:selected').attr('catg_id')
	if(s_type=='main'){swal('请选择专区进行查询',{button:false})}

	if(s_type=='online_prod'){
		ctg_m = all_ctg_m
		$.post('/get-online-prod-info-ctg-cnts',ctg_m,function(data,status){
			var cnts =  $('div[data-id="online_prod"] span').eq(0)
			if(status){
				$('#search-all').parent().prev().val('')
				prod_key_words = ""				
				swal('加载中……',{button:false});
				cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
				row_cnts = data[0]['cnts']
				$.post('/get-online-prod-info-ctg',ctg_m,function(data,status){
					if(status){
						$('div[data-id="online_prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_online_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="online_prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="online_prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
						$('a[hre-type][data-stypes="online_prod"]').eq(0).attr('cur-page','1')
						$('a[hre-type][data-stypes="online_prod"]').eq(1).attr('cur-page','1')						
						reload_item_info_click()
						swal.close()
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}else{
				swal('查询错误！',{button:false});
			}
		});
	}

	// 专线专区-分类查询
	if(s_type=='zb-prod'){
		zp_ctg_m = all_ctg_m
		$.post('/get-zb-prod-info-ctg-cnts',zp_ctg_m,function(data,status){
			var cnts =  $('div[data-id="zb-prod"] span').eq(0)
			if(status){
				$('#search-all').parent().prev().val('')
				prod_key_words = ""				
				swal('加载中……',{button:false});
				cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
				row_cnts = data[0]['cnts']
				$.post('/get-zb-prod-info-ctg',zp_ctg_m,function(data,status){
					if(status){
						$('div[data-id="zb-prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_zb_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="zb-prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).attr('cur-page','1')
						$('a[hre-type][data-stypes="zb-prod"]').eq(1).attr('cur-page','1')						
						reload_item_info_click()
						swal.close()
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}else{
				swal('查询错误！',{button:false});
			}
		});
	}

	// 已下线产品或已退出矩阵产品专区-分类查询
	if(s_type=='ald-prod'){}	
});

// 下载管理
$('div[data-ts="show-contents"] span').click(function(){
	if($(this).parent().attr('data-id')=='wait-item'&&$(this).find('font').text()=='导出下载'){
		// console.log('--------------------witem-download---------------------------')
		window.open('/download-witem')
	}
	if($(this).parent().attr('data-id')=='online_prod'&&$(this).find('font').text()=='导出下载'){
		// console.log('--------------------online-prod-download---------------------------')
		window.open('/downlowd-online-prod')
	}	
});

// 分页管理
$('a[hre-type="turn-page"]').click(function(){
	var page_type = $(this).attr('data-stypes');

	// 待维护账单科目-分页管理
	if(page_type=="witem"){
		$('#search-item').parent().prev().val(item_key_words)
		// console.log('-------------------page-man-witem--------------------')
		if($(this).attr('act')=='pere'){
			// console.log('-----------------pere---上一页-----------------')
			sum_pages = parseInt($(this).parent().next().children().text().split('\/')[1])
			cur_page = parseInt($(this).attr('cur-page'))
			post_data = {keyw:item_key_words,sum_pages:sum_pages,cur_page:cur_page}
			if($(this).attr('cur-page')>1&&cur_page<=sum_pages){
				swal('加载中……',{button:false});
				$.post('/pere-witem-page',post_data,function(data,status){
					if(status){
						$('div[data-id="wait-item"] .container-fluid div').remove()						
						data.forEach(function(e){
							ht = append_item_html(e['item_name'],e['item_id'],e['eff_date'],e['op_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee'])
							$('div[data-id="wait-item"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="witem"]').eq(0).parent().next().children().text((parseInt(cur_page)-1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="witem"]').eq(0).attr('cur-page',(parseInt(cur_page)-1))
						$('a[hre-type][data-stypes="witem"]').eq(1).attr('cur-page',(parseInt(cur_page)-1))				
						swal.close();
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}
		}else if($(this).attr('act')=='next'){
			// console.log('-----------------next----下一页----------------')
			sum_pages = parseInt($(this).parent().prev().children().text().split('\/')[1])
			cur_page = parseInt($(this).attr('cur-page'))
			post_data = {keyw:item_key_words,sum_pages:sum_pages,cur_page:cur_page}
			if(cur_page<sum_pages){
				swal('加载中……',{button:false});
				$.post('/next-witem-page',post_data,function(data,status){
					if(status){
						$('div[data-id="wait-item"] .container-fluid div').remove()						
						data.forEach(function(e){
							ht = append_item_html(e['item_name'],e['item_id'],e['eff_date'],e['op_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee'])
							$('div[data-id="wait-item"] .container-fluid').append(ht)
							// console.log(e)
						});
						$('a[hre-type][data-stypes="witem"]').eq(0).parent().next().children().text((parseInt(cur_page)+1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="witem"]').eq(0).attr('cur-page',(parseInt(cur_page)+1))
						$('a[hre-type][data-stypes="witem"]').eq(1).attr('cur-page',(parseInt(cur_page)+1))
						swal.close();
					}else{
						swal('查询错误！',{button:false});
					}
				});				
			}
		}
	}

	// 已维护产品-分页管理
	if(page_type=="online_prod"){
		pere_sumpages = $(this).parent().prev().children().text().split('\/')[1]
		next_sumpages = $(this).parent().next().children().text().split('\/')[1]
		sum_pages = pere_sumpages!=null?parseInt(pere_sumpages):parseInt(next_sumpages)
		cur_page = parseInt($(this).attr('cur-page'))
		post_data = {keyw:prod_key_words,sum_pages:sum_pages,cur_page:cur_page}
		Object.assign(post_data,ctg_m)
		if($(this).attr('act')=='pere'){
			// console.log('----------------------------上一页--------------------------------')
			if($(this).attr('cur-page')>1&&cur_page<=sum_pages){
				swal('加载中……',{button:false});
				$.post('/pere-online-prod-page',post_data,function(data,status){
					if(status){
						$('div[data-id="online_prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_online_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="online_prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="online_prod"]').eq(0).parent().next().children().text((parseInt(cur_page)-1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="online_prod"]').eq(0).attr('cur-page',(parseInt(cur_page)-1))
						$('a[hre-type][data-stypes="online_prod"]').eq(1).attr('cur-page',(parseInt(cur_page)-1))							
						reload_item_info_click()
						swal.close()						
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}
		}else if($(this).attr('act')=='next'){
			// console.log('----------------------------下一页--------------------------------')
			if(cur_page<sum_pages){
				swal('加载中……',{button:false});
				$.post('/next-online-prod-page',post_data,function(data,status){
					if(status){
						$('div[data-id="online_prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_online_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="online_prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="online_prod"]').eq(0).parent().next().children().text((parseInt(cur_page)+1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="online_prod"]').eq(0).attr('cur-page',(parseInt(cur_page)+1))
						$('a[hre-type][data-stypes="online_prod"]').eq(1).attr('cur-page',(parseInt(cur_page)+1))	
						
						reload_item_info_click()
						swal.close()						
					}else{
						swal('查询错误！',{button:false});
					}
				});
				swal.close();
			}
		}		
	}

	// 专线产品专区-分页管理
	if(page_type=="zb-prod"){
		pere_sumpages = $(this).parent().prev().children().text().split('\/')[1]
		next_sumpages = $(this).parent().next().children().text().split('\/')[1]
		sum_pages = pere_sumpages!=null?parseInt(pere_sumpages):parseInt(next_sumpages)
		cur_page = parseInt($(this).attr('cur-page'))
		post_data = {keyw:zp_prod_key_words,sum_pages:sum_pages,cur_page:cur_page}
		Object.assign(post_data,zp_ctg_m)
		if($(this).attr('act')=='pere'){
			// console.log('----------------------------上一页--------------------------------')
			if($(this).attr('cur-page')>1&&cur_page<=sum_pages){
				swal('加载中……',{button:false});
				$.post('/pere-zb-prod-page',post_data,function(data,status){
					if(status){
						$('div[data-id="zb-prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_zb_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="zb-prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).parent().next().children().text((parseInt(cur_page)-1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).attr('cur-page',(parseInt(cur_page)-1))
						$('a[hre-type][data-stypes="zb-prod"]').eq(1).attr('cur-page',(parseInt(cur_page)-1))							
						reload_item_info_click()
						swal.close()						
					}else{
						swal('查询错误！',{button:false});
					}
				});
			}
		}else if($(this).attr('act')=='next'){
			// console.log('----------------------------下一页--------------------------------')
			if(cur_page<sum_pages){
				swal('加载中……',{button:false});
				$.post('/next-zb-prod-page',post_data,function(data,status){
					if(status){
						$('div[data-id="zb-prod"] .container-fluid ul').remove()
						data.forEach(function(e){
							ht = append_zb_prod_html(e['offer_id'],e['offer_name'],e['eff_date'],e['catg_name1'],e['catg_name2'],e['catg_name3'],e['catg_name4'],e['catg_name5'])
							$('div[data-id="zb-prod"] .container-fluid').append(ht)
						});
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).parent().next().children().text((parseInt(cur_page)+1)+'/'+sum_pages).end()
						$('a[hre-type][data-stypes="zb-prod"]').eq(0).attr('cur-page',(parseInt(cur_page)+1))
						$('a[hre-type][data-stypes="zb-prod"]').eq(1).attr('cur-page',(parseInt(cur_page)+1))	
						
						reload_item_info_click()
						swal.close()						
					}else{
						swal('查询错误！',{button:false});
					}
				});
				swal.close();
			}
		}
	}

	// 已下线或已退出矩阵产品专区-分页管理
	if(page_type=="ald-prod"){
		sum_pages = parseInt($(this).parent().prev().children().text().split('\/')[1])
		cur_page = parseInt($(this).attr('cur-page'))
		post_data = {keyw:prod_key_words,sum_pages:sum_pages,cur_page:cur_page}
		console.log(post_data)
	}	
});	

// 首页按钮
$('#main-nav-h1').click(function(){
	$('#main-nav-h li[name!="log"]').each(function(e){if($(this).hasClass('active')){$(this).removeClass('active');$(this).find('font').attr('color','white')}});
	$('#search-all').attr('search-type','main')
	$('#search-ctg').attr('search-type','main')
	$('div[data-ts="show-contents"]').each(function(){
		if($(this).attr('data-id')!='main'){
			$(this).css('display','none')
		}else{
			$(this).css('display','block')
		}
	});
	// 单独处理待维账单科目导航栏
	$('#left-nav').css('display','block')
	$('#left-nav-item').css('display','none')
});

// 触发登录
$('#main-nav-h li[act="login"]').click(function(){
	swal("请输入登录账户:", {
		content: "input",
	})
	.then((uname) => {
		swal("请输入密码:", {
			content: {
				element:"input",
				attributes: {
				placeholder: "Type your password",
				type: "password",
				},
			},
		}).then((passwd)=>{
			datas = {userphone:uname,password:passwd}
			return $.post('/login',data=datas,function(data,status){return status=='success'?data:false});
		})
		.then((res)=>{
			if(res){
				swal({icon: "success", button: false,});				
				$(this).css('display','none')
				$(this).next().css('display','block')
				if(JSON.parse(atob(decodeURIComponent(document.cookie.split('=')[1])))['uname']=='admin'){
					window.open('/grp/admin')
				}
			}else{
				swal({icon: "error", button: false,});
			}
		});
	})
	
});	

// 退出登录
$('#main-nav-h li[act="logout"]').click(function(){
	swal({
		title: "确认退出?",
		icon: "warning",
		buttons: true,
		dangerMode: true,		
	})
	.then((out) => {		
		if(out){
			return $.post('/logout',function(data,status){return status=='success'?data:false});			
		} else {
			return false
		}
	})
	.then((res)=>{
		if(res){
			swal("已退出...",{icon: "success",});
			$(this).css('display','none')
			$(this).prev().css('display','block')
		}else{
			swal("没有退出...！");
		}
	})
	
});