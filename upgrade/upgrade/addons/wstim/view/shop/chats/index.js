var timer={},onlineList={};
$(function(){
	$.cookie('shopChatPage', true,{path: '/'});
	var _protocol = (window.location.protocol.indexOf('https')!=-1)?'wss://':'ws://';
	ws = new WebSocket(_protocol+server);
	/**
	* 连接服务器
	*/
	ws.onopen = function(){
		var sendData = {type:'login',
						uid:sendId,
						userName:workerName,
						role:'worker',
						shopId:shopId};
		ws.send(JSON.stringify(sendData));
	};
	ws.onmessage = function(e){
	    var _data = JSON.parse(e.data);
	    switch(_data.type){
	    	case 'visit':
	    		var visit = $.cookie('visit');
	    		visit = (visit==undefined)?{}:JSON.parse(visit);
	    		var _goodsInfo = JSON.parse(_data.content);
	    		visit[_data.from] = _goodsInfo;
	    		$.cookie('visit',JSON.stringify(visit));
	    		var _index = '#userId_'+_data.from;
	    		if($(_index).hasClass('current')){
	    			showCurrVisit(_data.from);
	    		}
	    	break;
	    	case 'load':
	    		// 加入聊天列表
	    		loadList(_data.list);
	    	break;
	    	case 'unReadMsg':
	    		// 加载未读留言
	    		loadUnReadList(_data.list);
	    	break;
	    	case 'removeList':
	    		// 移出聊天列表
	    	break;
	    	case 'serviceStatus':
	    		if(_data.data.waitCount!=undefined)$('#waitCount').html(_data.data.waitCount);
	    		if(_data.data.chatCount!=undefined)$('#chatCount').html(_data.data.chatCount);
	    	break;
	    	case 'say':
	    		if(_data.role=='worker'){
		    		if(_data.from==sendId){
			    		// 发送消息给某人
			    		_doSendMsg(_data);
		    		}else{
		    			onlineList[_data.from] = true;
		    			// 接收某人消息
			    		// 1.判断当前是否与改用户聊天
			    		var _index = '#userId_'+_data.from;
			    		if($(_index).hasClass('current')){
			    			// 设置消息已读
			    			setRead(_data.from,$(_index))
			    			// 直接渲染消息
			    			receiveMsg(_data);
			    		}
			    		// 设置未读消息数及内容摘要
			    		setMsgNumAndContent(_data,$(_index));
		    		}
	    		}
	    	break;
	    	case 'conversation':
	    		// 用户在pc端刷新操作
	    		clearInterval(timer[_data.from]);
	    		// 标识用户为在线
	    		setUserOnline(_data.from);
	    		// 接收某人消息
	    		// 1.判断当前是否与改用户聊天
	    		var _index = '#userId_'+_data.from;
	    		if($(_index).hasClass('current')){
	    			// 设置消息已读
	    			setRead(_data.from,$(_index))
	    			// 直接渲染消息
	    			// receiveMsg(_data);
	    		}else{
	    			// 设置未读消息数及内容摘要
	    			setMsgNumAndContent(_data,$(_index),'join');
	    		}
	    	break;
	    	case 'userExit':
	    		// 接收消息者已离线
	    		setUserOffLine(_data.clientUid);
	    	break;
	    	default:
	    	break;
	    }
	};

	ws.onclose = function(evt)
	{
	  console.log('WebSocketClosed!');
	};
	ws.onerror = function(evt)
	{
	  console.log('WebSocketError!');
	};
	// 右侧点击事件
	bindLeftLiClick();
	// 延迟加载
	$('.usersImg').lazyload({ effect: "fadeIn",failurelimit : 10,skip_invisible : false,threshold: 100,placeholder:window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO});//会员默认头像
	$('.shopsImg').lazyload({ effect: "fadeIn",failurelimit : 10,skip_invisible : false,threshold: 100,placeholder:window.conf.RESOURCE_PATH+'/'+window.conf.SHOP_LOGO});//店铺默认头像
});
$(window).on('beforeunload', function(){
	$.cookie('shopChatPage', false,{path: '/'});
	var unReadNum = 0;
	$('li a div em').each(function(k,v){
		var _num = Number($(v).html());
		 	_num = !isNaN(_num)?_num:0;
		unReadNum += _num;
	})
	$.cookie('shopUnReadNum',unReadNum,{path: '/'});
});


// 设置当前浏览商品
var showCurrVisit = function(userId){
	var visit = $.cookie('visit');
	if(visit==undefined)return;
	visit = JSON.parse(visit);
	var goodsInfo = visit[userId];
	if(goodsInfo==undefined)return;
	$('.cv_l img').attr('src',WST.conf.RESOURCE_PATH+"/"+goodsInfo.goodsImg);
	$('.cv_gname').html(goodsInfo.goodsName);
	$('.cv_price').html('￥'+goodsInfo.shopPrice);
	$('.cv_main').attr('href',WST.U('home/goods/detail',{goodsId:goodsInfo.goodsId}));
	$('.curr_visit').css({height:120});
}
// 关闭正在浏览
function closeCurrVisit(){
	$('.curr_visit').css({height:0});
}
var getUserInfo = function(userId){
	var url = WST.U('addon/wstim-shopchats-getUserInfo');
	$.post(url,{userId:userId},function(data){
			/*
				loginName:"vvvvvv"
				rankName:"中级会员"
				userName:"爱谁谁"
				userPhone:"131545665478"
				userPhoto:"http://qzapp.qlogo.cn/qzapp/101436016/123123/100"
				userTotalScore:775
			*/
			var imgSrc= data.userPhoto;
			if(data.userPhoto && data.userPhoto.indexOf('http')==-1){
				imgSrc = window.conf.RESOURCE_PATH+'/'+data.userPhoto;
			}
			$('#imr_upic').attr('src',imgSrc);
			$('#imr_loginName').html(data.loginName);
			$('#imr_qq').html(data.userQQ);
			$('#imr_rankName').html(data.rankName);
			$('#imr_phone').html(data.userPhone);
	});
}
// 将用户设置为在线
function setUserOnline(uid){
	onlineList[uid] = true;
	$('#userId_'+uid).removeClass('off');
	if($('#userId').val()==uid){// 当前聊天用户在线
		$('#logoTitle').parent().removeClass('off')
	}
}
// 将用户设置为离线
function setUserOffLine(uid){
	timer[uid] = setInterval(function(){
		$('#userId_'+uid).addClass('off');
		onlineList[uid] = undefined;
		if($('#userId').val()==uid){// 当前聊天用户离线
			$('#logoTitle').parent().addClass('off')
		}
		clearInterval(timer[uid]);
	},3000)
}
// 右侧点击事件
function bindLeftLiClick(){
	$('.u-lst li').click(function(){
		if(!$(this).hasClass('current')){
			// 当前已选中则不进行任何操作
			$(this).siblings().removeClass('current');
			$(this).addClass('current');
			var _currShopName = $(this).find('.category span').html();
			$('#logoTitle').html(_currShopName);
			var _obj = $('#scrollDiv');
			// 清空当前聊天窗口
			_obj.html('<div class="chat-more" id="clickMore" onclick="clickMore(this)"><p class=""><span class="icon"></span><span class="txt">点击加载更多</span></p></div>');
			// 设置userId
			var _currUserId = $(this).data('uid');
			$('#userId').val(_currUserId);
			// 设置当前对话者名
			$('#loginName').val($(this).data('uname'));
			// 设置为已读
			var unReadCount = $(this).find('em').html();
			if(unReadCount>0)setRead(_currUserId,$(this));
			// 获取聊天记录渲染
			getChatRecord();
			if(!onlineList[_currUserId])$('#logoTitle').parent().addClass('off');
			// 获取用户信息在右侧显示
			getUserInfo(_currUserId);
			// 判断是否需要显示正在浏览
			showCurrVisit(_currUserId);
		}
	});
}
// 点击加载更多聊天记录
function clickMore(obj){
	var p = $(obj).find('p');
	if(!p.hasClass('loading')){
		$(obj).find('.txt').html('点击加载更多聊天记录');
		p.addClass('loading');
	}
	var userId = $('#userId').val();
	var currPage = $('#currPage').val();
	var totalPage = $('#totalPage').val();
	if(parseInt(currPage)+1>totalPage){
		$(obj).find('.txt').html('没有聊天纪录了');
		p.removeClass('loading');
		return;
	}
	var params = {
		userId:userId,
		page:parseInt(currPage)+1,
	};
	var url = WST.U('addon/wstim-shopchats-pagequery');
	$.post(url,params,function(data){
		var loginName = $('#loginName').val();
		$('#currPage').val(data.current_page);
		$('#totalPage').val(data.last_page);
		var rows = data.data;
		var code = [];
		for(var i in rows){
			var _obj = rows[i];
			if(_obj.from==sendId){
				code.push(
					'<div class="chat-txt"><div class="chat-area customer">',
					'<p class="name">'+_obj.userName+'</p>',
					'<div class="dialog"><i class="i_arr"></i><span class="e_tips"></span><table border="0" cellpadding="0" cellspacing="0">',
					'<tbody><tr><td class="lt"></td><td class="tt"></td><td class="rt"></td></tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
					'<div>'+ _obj.content+'</div>',
					'</div></td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
	                  );
			}else{
				code.push(
					'<div class="chat-txt"><div class="chat-area service">',
		            '<p class="name">'+loginName+'</p>',
		            '<div class="dialog"><i class="i_arr"></i>',
		            '<table border="0" cellpadding="0" cellspacing="0"><tbody><tr>',
		            '<td class="lt"></td><td class="tt"></td><td class="rt"></td>',
		            '</tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
		            '<div>'+_obj.content+'</div></div>',
		            '</td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
		                  );
			}
		}
		if(rows.length>0){
			code.unshift('<div class="chat-more" id="clickMore" onclick="clickMore(this)"><p class=""><span class="icon"></span><span class="txt">点击加载更多</span></p></div>');
			$('#scrollDiv').prepend(code.join(''));
			$('#scrollDiv').scrollTop(0); // 滚动到顶部
			$(obj).remove();
		}else{
			$(obj).find('.txt').html('没有聊天纪录了');
			p.removeClass('loading');
		}
	},'json');
}
// 标记为已读
function setRead(userId,obj){
	var url = WST.U('addon/wstim-shopchats-setRead');
	$.post(url,{from:userId,to:sendId},function(data){
		if(data.status==1){
			obj.find('em').html('0').css({display:'none'});
		}
	},'json')
}
// 聊天记录
function getChatRecord(){
	var userId = $('#userId').val();
	var loginName = $('#loginName').val();
	var params = {
		userId:userId
	};
	var url = WST.U('addon/wstim-shopchats-pagequery');
	$.post(
		url,
		params,
		function(data){
			$('#currPage').val(data.current_page);
			$('#totalPage').val(data.last_page);
			var rows = data.data;
			for(var i in rows){
				var _obj = rows[i];
				if(_obj.from!=userId){
					_doSendMsg(_obj);
				}else{
					receiveMsg(_obj);
				}
			}
		},
		'json');
}
// 发送消息
function sendMsg(){
	var content = $.trim($('#text_in').html());
	var to = $('#userId').val();
	if(content=='')return;
	if(parseInt(to)==0)return;
	//解析url
    content = content.replace(/(http|https):\/\/[\S]+/gi, function(url){
        return "<a target='_blank' href="+url+">"+url+"</a>";
    });
    var sendData = {role:'worker',content:content,type:'say',to:to};
    ws.send(JSON.stringify(sendData));
}
function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }

        } catch(e) {
            return false;
        }
    }
}
// 处理链接、图片
function dealContent(msg){
	if(isJSON(msg.content)){
		var _json = JSON.parse(msg.content);
		switch(_json.type){
			case 'goods':
				msg.content = '<a href="'+WST.U('home/goods/detail',{goodsId:_json.goodsId})+'" target="_blank">'+_json.content+'</a>'
			break;
			case 'orders':
				msg.content = '<a href="'+WST.U('home/orders/detail',{id:_json.orderId})+'" target="_blank">'+_json.content+'</a>'
			break;
			case 'image':
				msg.content = '<img style="max-width:300px;" src="'+WST.conf.RESOURCE_PATH+"/"+_json.content+'" />';
			break;
		}
	}
}
function _doSendMsg(msg){
	dealContent(msg);
	var _obj = $('#scrollDiv');
	var _userName = msg.userName || workerName;
	var code = [];
	code.push(
			'<div class="chat-txt"><div class="chat-area customer">',
			'<p class="name">'+_userName+'</p>',
			'<div class="dialog"><i class="i_arr"></i><span class="e_tips"></span><table border="0" cellpadding="0" cellspacing="0">',
			'<tbody><tr><td class="lt"></td><td class="tt"></td><td class="rt"></td></tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
			'<div>'+ msg.content+'</div>',
			'</div></td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
	                  );
	$('#text_in').html('');
	_obj.append(code.join(''));
	_obj.scrollTop(_obj[0].scrollHeight);
}
// 接收消息
function receiveMsg(msg){
	dealContent(msg);
	var userName = $('#loginName').val();
	var _obj = $('#scrollDiv');
	var code = [];
	code.push(
			'<div class="chat-txt"><div class="chat-area service">',
            '<p class="name">'+userName+'</p>',
            '<div class="dialog"><i class="i_arr"></i>',
            '<table border="0" cellpadding="0" cellspacing="0"><tbody><tr>',
            '<td class="lt"></td><td class="tt"></td><td class="rt"></td>',
            '</tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
            '<div>'+msg.content+'</div></div>',
            '</td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
                  );
	_obj.append(code.join(''));
	_obj.scrollTop(_obj[0].scrollHeight);
}
// 设置未读消息数及内容摘要
function setMsgNumAndContent(data,obj,type){
	// 判断当前是否已经存在该会话
	if(obj.length<=0){
		var	_content = ''
		if(data.content && data.content.content){
			_content = replaceContent(data.content.content);
		}
		var code = [];
		var _unread = '<em style="display: none">0</em>';
		if(data.unReadNum>0){
			_unread = '<em style="display: block">'+data.unReadNum+'</em>';
		}
		var imgSrc = data.userPhoto;
		if(data.userPhoto && data.userPhoto.indexOf('http')==-1){
			imgSrc = window.conf.RESOURCE_PATH+data.userPhoto;
		}
		code.push(
			'<li title="'+data.loginName+'" class="no-msg" data-uid="'+data.from+'" id="userId_'+data.from+'" data-uname="'+data.loginName+'">',
			'<a href="javascript:;"><span class="icon icon_1">',
			'<img src="'+imgSrc+'" class="left_img" />',
			'</span><div class="category">',
			'<span>'+data.loginName+'</span>',
			_unread,
			'</div><p class="tips">',
			'<span class="s02">'+(data.createTime?data.createTime:'')+'</span>',
			'<i class="i01"></i>',
			'<span class="s01">'+_content+'</span>',
			'</p></a></li>'
		);
		$('.u-lst').prepend(code.join(''));
		// 绑定点击事件
		bindLeftLiClick();
	}else{
		var _em = obj.find('em');
		// 获取已存在的未读消息数
		var _currUnReadNum = parseInt(_em.html());
			++_currUnReadNum;
		var _content = data.content;
		if(type=='join'){
			// 表示加入会话，场景：一开始为留言状态，之后用户上线
			_currUnReadNum = data.unReadNum;
			_content = data.content.content;
		}
		_em.html(_currUnReadNum);
		if(_currUnReadNum>0)_em.css({display: 'block'});
		obj.find('.s01').html(replaceContent(_content));
		obj.find('.s02').html(data.createTime);

		// 加入队列，修改为在线状态
		obj.removeClass('off');
	}
}
// 加载当前接待的用户列表
function loadList(rows){

	var code = [];
	for(var i in rows){
		var _data = rows[i];
			onlineList[i] = true;// 记录在线用户

		var	_content = ''
		if(_data.content && _data.content.content){
			_content = replaceContent(_data.content.content);
		}
		var _unread = '<em style="display: none">0</em>';
		if(_data.unReadNum>0){
			_unread = '<em style="display: block">'+_data.unReadNum+'</em>';
		}
		var imgSrc = _data.userPhoto;
		if(_data.userPhoto && _data.userPhoto.indexOf('http')==-1){
			imgSrc = window.conf.RESOURCE_PATH+_data.userPhoto;
		}
		code.push(
			'<li title="'+_data.loginName+'" class="no-msg" data-uid="'+i+'" id="userId_'+i+'" data-uname="'+_data.loginName+'">',
			'<a href="javascript:;"><span class="icon icon_1">',
			'<img src="'+imgSrc+'" class="left_img" />',
			'</span><div class="category">',
			'<span>'+_data.loginName+'</span>',
			_unread,
			'</div><p class="tips">',
			'<span class="s02">'+(_data.createTime?_data.createTime:'')+'</span>',
			'<i class="i01"></i>',
			'<span class="s01">'+_content+'</span>',
			'</p></a></li>'
		);
	}
	$('.u-lst').html(code.join(''));
	// 绑定点击事件
	bindLeftLiClick();
}
// 加载未读用户列表
function loadUnReadList(rows){
	var code = [];
	for(var i in rows){
		var _data = rows[i];
		var _className = '';
		if($('#userId_'+i).length<=0){
			_className = 'off';
			var	_content = ''
			if(_data.content && _data.content.content){
				_content = replaceContent(_data.content.content);
			}
			var _unread = '<em style="display: none">0</em>';
			if(_data.unReadNum>0){
				_unread = '<em style="display: block">'+_data.unReadNum+'</em>';
			}
			var imgSrc = _data.userPhoto;
			if(_data.userPhoto){
				if(_data.userPhoto && _data.userPhoto.indexOf('http')==-1){
					imgSrc = window.conf.RESOURCE_PATH+_data.userPhoto;
				}
			}else{
				imgSrc = window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO;
			}
			code.push(
				'<li title="'+_data.loginName+'" class="no-msg '+_className+'" data-uid="'+i+'" id="userId_'+i+'" data-uname="'+_data.loginName+'">',
				'<a href="javascript:;"><span class="icon icon_1">',
				'<img src="'+imgSrc+'" class="left_img" />',
				'</span><div class="category">',
				'<span>'+_data.loginName+'</span>',
				_unread,
				'</div><p class="tips">',
				'<span class="s02">'+(_data.createTime?_data.createTime:'')+'</span>',
				'<i class="i01"></i>',
				'<span class="s01">'+_content+'</span>',
				'</p></a></li>'
			);
		}
	}
	$('.u-lst').append(code.join(''));
	// 绑定点击事件
	bindLeftLiClick();
}



// 图片上传
$(function(){
  WST.upload({
    pick:'#uploadBtn',
    formData: {dir:'users'},
    accept: {extensions: 'gif,jpg,jpeg,png',mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'},
    callback:function(f){
      var json = WST.toJson(f);
      if(json.status==1){
        var to = $('#userId').val();
        if(to<=0)return;// 无接收对象
        var uploadPhotoSrc = json.savePath+json.thumb;
		var content = JSON.stringify({type:"image",content:uploadPhotoSrc});
		var sendData = {role:'worker',content:content,type:'say',to:to};
		ws.send(JSON.stringify(sendData));
      }else{
        alert(json.msg);
      }
      },
      progress:function(rate){
          $('#uploadMsg').show().html('已上传'+rate+"%");
      }
      });
})

// 替换消息中的图片、链接
function replaceContent(content){
	if(isJSON(content)){
		var _json = JSON.parse(content);
		switch(_json.type){
			case 'goods':
				content = '[链接]'
			break;
			case 'orders':
				content = '[链接]'
			break;
			case 'image':
				content = '[图片]';
			break;
		}
	}
	return content.replace(/<a\b[^>]+[^>]*>([\s\S]*?)<\/a>/g,'[链接]').replace(/<img\b.*\/>/g,'[图片]');
}
