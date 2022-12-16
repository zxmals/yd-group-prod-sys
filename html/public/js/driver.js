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

// 导航栏其他部分交互
$('#main-nav-h li[name!="log"]').click(function(){
	$('#main-nav-h li[name!="log"]').each(function(e){if($(this).hasClass('active')){$(this).removeClass('active');$(this).find('font').attr('color','white')}});
	$(this).addClass("active")
	$(this).find("font").removeAttr("color")
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

						// lines += '<li><span>1/'+(Math.ceil(row_cnts/5))+'</span></li>'						
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

});

// 待维护账单科目-全局查询
$('#search-item').click(function(){
	key_words = $('#search-item').parent().prev().val()
	$.post('/search-items-ky-cnts',{keyw:key_words},function(data,status){
		var cnts =  $('div[data-id="wait-item"] span').eq(0)
		if(status){
			cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
			row_cnts = data[0]['cnts']
			$('div[data-id="wait-item"] .container-fluid div').remove()
			$.post('/search-items-ky',{keyw:key_words},function(data,status){
				if(status){
					data.forEach(function(e){
						ht = append_item_html(e['item_name'],e['item_id'],e['eff_date'],e['op_date'],e['cur_m_fee'],e['last_m_fee'],e['last2_m_fee'])
						$('div[data-id="wait-item"] .container-fluid').append(ht)
						// console.log(e)
					});
					$('a[hre-type][data-stypes="witem"]').eq(0).parent().next().children().text('1/'+(Math.ceil(row_cnts/5))).end()
					$('a[hre-type][data-stypes="witem"]').eq(0).attr('cur-page','1')
					$('a[hre-type][data-stypes="witem"]').eq(1).attr('cur-page','1')
				}else{
					swal('查询错误！',{button:false});
				}
			});
		}else{
			swal('查询错误！',{button:false});
		}
	});	
});

// 分页管理
$('a[hre-type="turn-page"]').click(function(){
	var page_type = $(this).attr('data-stypes');
	if(page_type=="witem"){
		console.log('-------------------page-man-witem--------------------')
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
			return $.post('/login',data=datas,function(data,status){
				return status=='success'?data:false
			});
		})
		.then((res)=>{
			if(res){
				swal({icon: "success", button: false,});				
				$(this).css('display','none')
				$(this).next().css('display','block')
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