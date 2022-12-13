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
		$.post('/get-witem-info',function(data,status){
			if(status){
				console.log(data)
			}
		})
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