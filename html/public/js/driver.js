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
		if($('div[data-id="wait-item"] div').attr('data-search')!='true'){
			$.post('/get-witem-info-cnts',function(data,status){
				var cnts =  $('div[data-id="wait-item"] span').eq(0)
				if(status){
					cnts.text('共为您搜索到'+data[0]['cnts']+'条记录')
					$.post('/get-witem-info',function(data,status){
						if(status){
							$('div[data-id="wait-item"] div').remove()
							data.forEach(function(e){
								ht = '<div class="list-group" data-search="true"><li  class="list-group-item list-group-item-danger">'
								ht += e['item_name']+"("+e['item_id']+")"
								ht += '<li  class="list-group-item list-group-item-info">上线日期 <span class="glyphicon glyphicon-asterisk"></span>  '
								ht += new Date(Date.parse(e['eff_date'])).toLocaleString().split(' ')[0].replace(/\//g,'-')
								ht += '</li><li  class="list-group-item list-group-item-warning"><span href="#">'
								dates = new Date(e['op_date'])
								ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
								ht += '收入（元）：'
								ht += e['cur_m_fee']!=null?e['cur_m_fee']:""
								ht += ' </span><span class="glyphicon glyphicon-option-vertical"></span><span href="#">'
								dates.setMonth(dates.getMonth()-1)
								ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
								ht += '收入（元）：'
								ht += e['last_m_fee']!=null?e['cur_m_fee']:""
								ht += ' </span><span class="glyphicon glyphicon-option-vertical"></span><span href="#">'
								dates.setMonth(dates.getMonth()-1)
								ht += dates.getFullYear()+'年'+(dates.getMonth()+1)+'月'
								ht += '收入（元）：'
								ht += e['last2_m_fee']!=null?e['cur_m_fee']:""
								ht += ' </span></li></div>'				
								$('div[data-id="wait-item"]').append(ht)
								// console.log(e)
							});
						}else{
							swal('查询错误！')
						}

						lines = '<nav aria-label="">'
						lines += '<ul class="pager">'
						// lines += '<li><a href="/witem-prepage?cur=1">上一页</a></li>'
						lines += '<li><a href="#">上一页</a></li>'
						lines += '<li><span>1/'+(Math.ceil(163/5))+'</span></li>'
						lines += '<li><a href="#" hre-type="turn-page" act="next-page" cur_page="1" >下一页</a></li>'
						lines += '</ul>'
						lines += '</nav>'

						$('div[data-id="wait-item"]').append(lines)						
					});					
				}else{
					swal('查询错误！')
				}
			});
		}
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