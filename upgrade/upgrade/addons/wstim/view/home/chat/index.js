var ws,client_id,group,workerName,offline = false,_first = true;
$(function(){
	// 获取聊天记录
	getChatRecord();
	// 获取订单列表
	getOrderList();
	// 获取浏览记录
	getHistory();
	// 右侧tab点击事件
	$('.im-item').click(function(){
		$('.im-item').removeClass('current');
		$(this).addClass('current');
		var _currTab = $(this).data('info');
		$('.im-tab-content').removeClass('im-show');
		$('.im-my-'+_currTab).addClass('im-show');
	});
	bindLeftLiClick();
	// 选中当前店铺并移到第一位
	var _shopId = $('#shopId').val();
	if(_shopId>0){
		var _obj = $('#shopId_'+_shopId);
		_obj.addClass('current');
		_obj.prependTo($('.u-lst'));
		setRead(_shopId,_obj);
	}
	if(goodsInfo!=undefined)showCurrVisit(goodsInfo);
	$.cookie('userChatPage', true,{path: '/'});
});

$(window).on('beforeunload', function(){
	$.cookie('userChatPage', false,{path: '/'});
});

var entryShop  = function(){
	var shopId = $('#shopId').val();
	var url = WST.U('home/shops/index',{shopId:shopId});
	window.open(url);
}
// 设置当前浏览商品
var showCurrVisit = function(goodsInfo){
	$('.cv_l img').attr('src',WST.conf.RESOURCE_PATH+"/"+goodsInfo.goodsImg);
	$('.cv_gname').html(goodsInfo.goodsName);
	$('.cv_price').html('￥'+goodsInfo.shopPrice);
	$('.cv_main').attr('href',WST.U('home/goods/detail',{goodsId:goodsInfo.goodsId}));
	$('.im-my-faq').css({height:563});
	$('.im-my-order').css({height:527});
	$('.curr_visit').css({height:120});
}
// 发送正在浏览
function sendCurrVisit(){
	$('.im-my-faq').css({height:683})
	$('.im-my-order').css({height:647})
	$('.curr_visit').css({height:0});
	var content = {type:"goods",goodsId:goodsInfo.goodsId,content:goodsInfo.goodsName};
		content = JSON.stringify(content);
		offline?_sendOfflineMsg(content):_sendMsg(content);
}

// 左侧点击事件
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
			var _currShopId = $(this).data('sid');
			$('#shopId').val(_currShopId);
			// 设置当前对话者名
			$('#shopName').val($(this).data('uname'));
			// 设置为已读【将未读消息数置为0,设置为已读】
			var unReadCount = $(this).find('em').html();
			if(unReadCount>0)setRead(_currShopId,$(this));
			$(this).find('em').html(0).hide();
			// 设置页数
			$('#currPage').val(1);
			$('#totalPage').val(1);
			$('#currOrderPage').val(0);
			$('#totalOrderPage').val(1);

			// 获取聊天记录渲染
			getChatRecord();
			// if(!onlineList[_currShopId])$('#logoTitle').parent().addClass('off');
			// 清空原有订单列表、浏览记录
			$('#o_list').html('');
			$('#h_list').html('');


			// 获取订单列表
			getOrderList();
			// 获取浏览记录
			getHistory();

			var sendData = {type:'login',
						uid:$('#userId').val(),
						userName:loginName,
						role:'user',
						shopId:$('#shopId').val()};
			ws.send(JSON.stringify(sendData));

		}
	});
}
// 标记为已读
function setRead(shopId,obj){
	var url = WST.U('addon/wstim-chats-setRead');
	$.post(url,{shopId:shopId},function(data){
		if(data.status==1){
			obj.find('em').html('0').css({display:'none'});
		}
	},'json')
}


// 检测左侧是否存在最近会话
var checkRecentExists = function(){
	var shopId = $('#shopId').val();
	var obj = $('#shopId_'+shopId);
	if(obj.length<=0){
		var code = [];
		var shopName = $('#shopName').val();
		var shopImg = $('#shopImg').val();
		code.push(
			'<li title="'+shopName+'" class="no-msg current" data-sid="'+shopId+'" id="shopId_'+shopId+'" data-uname="'+shopName+'">',
          	'<a href="javascript:;">',
            '<span class="icon icon_1">',
            '<img src="'+shopImg+'" class="left_img">',
            '</span><div class="category">',
            '<span>'+shopName+'</span>',
            '<em style="display:none">0</em>',
			'</div><p class="tips"><span class="s02"></span><i class="i01"></i><span class="s01"></span></p></a></li>'
		);
		$('.u-lst').append(code.join(''));
	}
}


// 连接服务器
function connectServer(){
	_first = false;
	var _protocol = (window.location.protocol.indexOf('https')!=-1)?'wss://':'ws://';
	ws = new WebSocket(_protocol+server);
	/**
	* 连接服务器
	*/
	ws.onopen = function(){
		var sendData = {type:'login',
						uid:$('#userId').val(),
						userName:loginName,
						role:'user',
						shopId:$('#shopId').val(),
						group:$.cookie("group")};
		ws.send(JSON.stringify(sendData));
	};
	ws.onmessage = function(e){
	    var _data = JSON.parse(e.data);
	    if(!!_data.group){
	    	group = _data.group;
            $.cookie("group", group);
        }
	    switch(_data.type){
	    	case 'init':
	    		console.log('_data```',_data);
	            // 利用jquery发起ajax请求，将client_id发给后端进行uid绑定
	            $.post(WST.U('home/GatewayClient/bindUid'), {client_id:_data.client_id}, function(data){
	            	console.log('绑定ok~',data);
	            }, 'json');
            break;
	        case 'chat':
	        	// 客服接待
	        	var _txt = "客服 "+_data.groupName+" 接待了您";
				var code = '<div id="connect" class="chat-txt chat-time" ><p class="time">'+_txt+'</p></div>';
				workerName = code;
				offline = false
				setStatus(true);
				disableSendMsg();
				var _obj = $('#scrollDiv');
				_obj.append(code);
				_obj[0].scrollTop = _obj[0].scrollHeight;
				// 当前正在浏览的商品
				if(goodsInfo!=undefined){
					var content = JSON.stringify(goodsInfo);
					var sendData = {role:'user',content:content,type:'visit',to:group};
					ws.send(JSON.stringify(sendData));
				}
				checkRecentExists();

            break;
	    	case 'login':
	    		// 登录
	    	break;
	    	case 'say':
	    		if(_data.role=='user'){
		    		if(_data.from==userId){
			    		// 发送消息给某人
			    		_doSendMsg(_data);
		    		}else{
		    			// 接收某人消息
			    		// 1.判断当前是否与改用户聊天
			    		var _index = '#shopId_'+_data.shopId;
			    		if($(_index).hasClass('current')){
			    			// 设置消息已读
			    			setRead(_data.shopId,$(_index));
			    			// 直接渲染消息
			    			receiveMsg(_data);
			    		}
			    		// 设置未读消息数及内容摘要
			    		setMsgNumAndContent(_data,$(_index));
		    		}
	    		}
	    	break;
	    	case 'message':
	    		// 触发留言
	    		offline = true;
	    		disableSendMsg();
	    		noServiceOnline();
	    	break;
	    	case 'noonline':
	    		// 接收消息者已离线
	    	break;
	    	case 'wait':
	    		// 排队状态
	    		disableSendMsg(true);
	    	break;
	    	default:
	    	break;
	    }
	};

	ws.onclose = function(evt)
	{
	  console.log('WebSocketClosed!');
	  // 触发留言
	  offline = true;
	};
	ws.onerror = function(evt)
	{
	  console.log('WebSocketError!');
	  // 触发留言
	  offline = true;
	  disableSendMsg();
	  noServiceOnline();
	};
}
// 设置未读消息数及内容摘要
function setMsgNumAndContent(data,obj,type){
	// 判断当前是否已经存在该会话
	var _em = obj.find('em');
	// 获取已存在的未读消息数
	var _currUnReadNum = parseInt(_em.html());
		++_currUnReadNum;
	var _content = data.content;
	_em.html(_currUnReadNum);
	if(_currUnReadNum>0)_em.css({display: 'block'});
	obj.find('.s01').html(replaceContent(_content));
	obj.find('.s02').html(data.createTime);
	// 加入队列，修改为在线状态
	obj.removeClass('off');
}
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




// 标记客服在线状态
function setStatus(isOnline){
	var _obj = $('#logoTitle').parent();
	isOnline?_obj.removeClass('off'):_obj.addClass('off');
}
// 当前无客服在线的提示
function noServiceOnline(){
	checkRecentExists();
	var _txt = "当前无客服在线，您可以留言，我们会尽快回复您。";
	var code = '<div class="chat-txt chat-time" ><p class="time txt-red">'+_txt+'</p></div>';
	var _obj = $('#scrollDiv');
		_obj.append(code);
		_obj[0].scrollTop = _obj[0].scrollHeight;
}
// 是否关闭发送消息
function disableSendMsg(flag){
	if(flag){
		var code = [];
		code.push(
			'<div class="disable_edit"><div class="wait_txt">',
	            '<span>当前店铺客服接待人数过多，您目前处于排队状态... </span>',
	            '<a class="wait_btn" href="#">不排队了，我要留言</a>',
	       	'</div></div>'
		);
		$('.im-edit-area').html(code.join(''));
		$('.wait_btn').click(function(){
			disableSendMsg();
			ws.close();
		});
	}else{
		var code = [];
		code.push(
			'<div class="im-edit-toolbar">',
	         '<p class="im-icon-out">',
	          '<a href="javascript:;" class="rule" id="ruleBtn"> <i class="im-rule"></i> ',
	            '<span class="im-txt">  </span>',
	          '</a>',
	           '<a href="javascript:;" id="uploadBtn" class="pic" title="贴图" style="position: relative; z-index: 1;overflow:hidden;"> ',
	            '<i class="im-pic"></i> ',
	           '</a> ',
	         '</p> ',
	        '</div>',
	        '<div class="im-edit-ipt-area"> ',
	         '<div id="text_in" class="im-edit-ipt" style="overflow-y: auto; font-weight: normal; font-size: 12px; overflow-x: hidden; word-break: break-all; font-style: normal; outline: none;" contenteditable="plaintext-only" hidefocus="true" tabindex="0"></div> ',
	        '</div> ',
	        '<div class="im-edit-btn-area"> ',
	         '<div class="im-link-area"></div> ',
	         '<div class="im-btn-send-area"> ',

	         '<a href="javascript:;" onclick="sendMsg()"class="im-btn im-btn-send im-btn-end" id="sendMsg"> ',
	          '<span class="im-txt">结束会话</span> <span class="im-btn-l"></span></a> ',

	          '<a href="javascript:;" ',
	             'onclick="sendMsg()"',
	             'class="im-btn im-btn-send" ',
	             'id="sendMsg"> ',
	            '<span class="im-txt">发送</span> <span class="im-btn-l"></span> ',
	          '</a> ',
	          '<div class="im-pop-send-set cbut" style="position: absolute; top: 0; right: -250px;display:none;"> ',
	           '<ul class="im-send-set-list"> ',
	            '<!-- 当前高亮加class current --> ',
	            '<li class="im-item current" id="hotkey1"> <a href="javascript:;" class="im-item-content"> <i class="im-icon-right"></i> <span class="im-txt"></span> </a> </li> ',
	            '<li class="im-item" id="hotkey2"> <a href="javascript:;" class="im-item-content"> <i class="im-icon-right"></i> <span class="im-txt"></span> </a> </li> ',
	           '</ul> ',
	          '</div> ',
	         '</div> ',
	         '<div class="im-edit-tip" id="chat_count">',
	          '还可以输入',
	          '<span class="im-word-num">360</span>字',
	         '</div> ',
	        '</div> '
		);
		$('.im-edit-area').html(code.join(''));
		// 启用上传图片
		uploadImg();
	}
}
// 点击加载更多聊天记录
function clickMore(obj){
	var p = $(obj).find('p');
	if(!p.hasClass('loading')){
		$(obj).find('.txt').html('点击加载更多聊天记录');
		p.addClass('loading');
	}
	var receiveId = $('#shopId').val();
	var currPage = $('#currPage').val();
	var totalPage = $('#totalPage').val();
	if(parseInt(currPage)+1>totalPage){
		$(obj).find('.txt').html('没有聊天纪录了');
		p.removeClass('loading');
		return;
	}
	var params = {
		receiveId:receiveId,
		page:parseInt(currPage)+1,
	};
	var url = WST.U('addon/wstim-chats-pagequery');
	$.post(url,params,function(data){
		var shopName = $('#shopName').val();
		var loginName = $('#loginName').val();
		$('#currPage').val(data.current_page);
		$('#totalPage').val(data.last_page);
		var rows = data.data;
		var code = [];
		for(var i in rows){
			var _obj = rows[i];
			dealContent(_obj);
			if(_obj.from!=userId){
				code.push(
					'<div class="chat-txt"><div class="chat-area service">',
		            '<p class="name">'+shopName+'</p>',
		            '<div class="dialog"><i class="i_arr"></i>',
		            '<table border="0" cellpadding="0" cellspacing="0"><tbody><tr>',
		            '<td class="lt"></td><td class="tt"></td><td class="rt"></td>',
		            '</tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
		            '<div>'+_obj.content+'</div></div>',
		            '</td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
		                  );
			}else{
				code.push(
					'<div class="chat-txt"><div class="chat-area customer">',
					'<p class="name">'+loginName+'</p>',
					'<div class="dialog"><i class="i_arr"></i><span class="e_tips"></span><table border="0" cellpadding="0" cellspacing="0">',
					'<tbody><tr><td class="lt"></td><td class="tt"></td><td class="rt"></td></tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
					'<div>'+ _obj.content+'</div>',
					'</div></td><td class="rm"></td></tr><tr><td class="lb"></td><td class="bm"></td><td class="rb"></td></tr></tbody></table></div></div></div>'
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


// 聊天记录
function getChatRecord(){
	var receiveId = $('#shopId').val();
	var shopName = $('#shopName').val();
	var loginName = $('#loginName').val();
	var params = {
		receiveId:receiveId
	};
	if(receiveId==0)return;
	var url = WST.U('addon/wstim-chats-pagequery');
	$.post(
		url,
		params,
		function(data){
			$('#currPage').val(data.current_page);
			$('#totalPage').val(data.last_page);
			var rows = data.data;
			var last = rows.length-1;
			for(var i in rows){
				var _obj = rows[i];
				if(_obj.from!=userId){
					receiveMsg(_obj);
				}else{
					_doSendMsg(_obj);
				}
			}
			if(i==last || rows.length==0){
				// 加载完最后一条聊天记录后
				if(_first)connectServer();
				var _obj = $('#scrollDiv');
				_obj[0].scrollTop = _obj[0].scrollHeight;
			}
		},
		'json');
}

// 点击发送消息
function sendMsg(){
	var content = $.trim($('#text_in').html());
	if(content=='')return;
	offline?_sendOfflineMsg(content):_sendMsg(content);
}
// 发送留言
function _sendOfflineMsg(content){
	var params = {content:content,type:'message',to:$('#shopId').val()};
	var url = WST.U('addon/wstim-chats-sendMsg');
	$.post(url,params,function(data){
		if(data.status==1){
			_doSendMsg(params);
		}else{
			alert('消息发送失败，请重试');
		}
	},'json');
}
// 发送消息
function _sendMsg(content){
	var sendData = {role:'user',content:content,type:'say',to:group};
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
	var loginName = $('#loginName').val();
	var code = [];
	code.push(
		'<div class="chat-txt">',
	          '<div class="chat-area customer">',
	            '<p class="name">'+loginName+'</p>',
	            '<div class="dialog"><i class="i_arr"></i><span class="e_tips"></span>',
	            '<table border="0" cellpadding="0" cellspacing="0"><tbody><tr><td class="lt">',
	            '</td><td class="tt"></td><td class="rt"></td></tr><tr><td class="lm"></td><td class="mm"><div class="cont">',
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
	var _obj = $('#scrollDiv');
	var code = [];
	code.push(
			'<div class="chat-txt"><div class="chat-area service">',
            '<p class="name">'+msg.userName+'</p>',
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
// 插入时间
function insertTime(){
	var _t = '11:17';
	var code = '<div class="chat-txt chat-time" ><p class="time">'+_t+'</p></div>';
	$('#scrollDiv').append(code);
}
var olistFirst = true;
// 我的订单
function getOrderList(obj){
	var shopId = $('#shopId').val();
	if(shopId==0)return;


	var currPage = $('#currOrderPage').val();
	var totalPage = $('#totalOrderPage').val();
	if(parseInt(currPage)+1>totalPage){
		$(obj).find('.txt').html('已加载所有数据');
		return;
	}
	var params = {
		shopId:shopId,
		page:parseInt(currPage)+1,
	}
	var code = [];
	var url = WST.U('addon/wstim-chats-getOrderList');
	$.post(url,params,function(data){
		$('#currOrderPage').val(data.current_page);
		$('#totalOrderPage').val(data.last_page);
		var _rows = data.data;
		if(olistFirst && _rows.length==0){
			$('#o_list').html('<p class="tc"><i></i>暂无数据</p>');
			$('.comonMore').remove();
			olistFirst = false;
			return;
		}
		for(var i in data.data){
			var _obj = data.data[i];
			code.push(
				'<li><p class="bg-1">',
			        '<strong>订单号：</strong>',
			        '<span class="s-3">'+_obj.orderNo+'</span>',
			        '<span class="order-status">'+_obj.orderStatus+'</span>',
			        '<span class="btn" style="display: inline;">',
			          '<a href="javascript:;" class="btn-1 J_oreder_send" data-oid="'+_obj.orderId+'" data-ono="'+_obj.orderNo+'" >发送</a></span></p>',
			              '<div class="other">',
			                '<div class="sub">'
			        );
			// 判断订单下的商品数量，若只有一件则显示商品名称，否则仅显示商品图片
			if(_obj.list.length>1){
				var goodsCount = _obj.list.length;
				for(var j=0;j<goodsCount;++j){
					var _gObj = _obj.list[j];
					var _url = WST.U('home/goods/detail',{goodsId:_gObj.goodsId});
					var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_gObj.goodsImg;
					code.push(
						'<div class="pic">',
			                '<a href="'+_url+'" target="_blank">',
			                  '<img data-original="'+_imgSrc+'" class="goodsImg" />',
			                '</a>',
			            '</div>'
					);
				}
			}else{
				var _gObj = _obj.list[0];
				var _url = WST.U('home/goods/detail',{goodsId:_gObj.goodsId});
				var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_gObj.goodsImg;
				code.push(
						'<div class="pic">',
			                '<a href="'+_url+'" target="_blank">',
			                  '<img data-original="'+_imgSrc+'" class="goodsImg" />',
			                '</a></div>',
			            '<div class="txt"><p class="name">',
	                    '<a href="'+_url+'" target="_blank">'+_gObj.goodsName+'</a>',
	                    '</p></div>'
					);
			}
			code.push(
		          '</div><p>',
		            '<strong>订单金额：</strong>',
		            '<span class="s-3">'+_obj.realTotalMoney+'</span>',
		            '<span class="time">'+_obj.createTime+'</span>',
		          '</p></div></li>'
			);
		}
		// 将代码添加到页面上
		$('#o_list').append(code.join(''));
		lazyLoadImg();
		// 绑定点击订单`发送`
		$('.J_oreder_send').click(function(){
			var orderId = $(this).data('oid');
			var orderNo = $(this).data('ono');
			var content = {type:"orders",orderId:orderId,content:"订单号："+orderNo};
			content = JSON.stringify(content);
			offline?_sendOfflineMsg(content):_sendMsg(content);
		})
	},'json');
}
// 浏览记录
function getHistory(){
	var params = {
		shopId:$('#shopId').val()
	}
	var code = [];
	var url = WST.U('addon/wstim-chats-getHistory');
	$.post(url,params,function(data){
		for(var i in data){
			var _obj = data[i];
			var _url = WST.U('home/goods/detail',{goodsId:_obj.goodsId});
			var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_obj.goodsImg;
			code.push(
				'<li><div class="other">',
			                '<div class="sub">'
			        );
			code.push(
					'<div class="pic">',
		                '<a href="'+_url+'" target="_blank">',
		                  '<img data-original="'+_imgSrc+'" class="goodsImg" />',
		                '</a></div><div class="txt"><p class="name">',
                    '<a href="'+_url+'" target="_blank">'+_obj.goodsName+'</a></p></div>'
				);
			code.push(
		          '</div><p style="position:relative;">',
		          '<a href="javascript:;" class="btn-1 J_goods_send" data-gid="'+_obj.goodsId+'" data-gname="'+_obj.goodsName+'">发送</a>',
		          '<strong>商品金额：</strong>',
		          '<span class="s-3">'+_obj.shopPrice+'</span>',
		          '<span class="time"></span></p></div></li>'
			);
		}
		// 将代码添加到页面上
		$('#h_list').html(code.join(''));
		// 绑定点击`发送`
		$('.J_goods_send').click(function(){
			var goodsId = $(this).data('gid');
			var goodsName = $(this).data('gname');
			var content = {type:"goods",goodsId:goodsId,content:goodsName};
			content = JSON.stringify(content);
			offline?_sendOfflineMsg(content):_sendMsg(content);
		})
		lazyLoadImg();
	},'json');
}
function lazyLoadImg(){
	$('.goodsImg').lazyload({ effect: "fadeIn",failurelimit : 10,skip_invisible : false,threshold: 100,placeholder:window.conf.RESOURCE_PATH+'/'+window.conf.GOODS_LOGO});//商品默认图片
	$('.usersImg').lazyload({ effect: "fadeIn",failurelimit : 10,skip_invisible : false,threshold: 100,placeholder:window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO});//会员默认头像
}
// 图片上传
function uploadImg(){
	WST.upload({
    pick:'#uploadBtn',
    formData: {dir:'users'},
    accept: {extensions: 'gif,jpg,jpeg,png',mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'},
    callback:function(f){
      var json = WST.toJson(f);
      if(json.status==1){
        var uploadPhotoSrc = json.savePath+json.thumb;
		var content = {type:"image",content:uploadPhotoSrc};
			content = JSON.stringify(content);
		offline?_sendOfflineMsg(content):_sendMsg(content);
      }else{
        alert(json.msg);
      }
      },
      progress:function(rate){
          $('#uploadMsg').show().html('已上传'+rate+"%");
      }
      });
}