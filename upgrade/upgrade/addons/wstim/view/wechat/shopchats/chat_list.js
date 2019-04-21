var timer={},onlineList={},ws,_TabIndex=0,_currShopId=0,_currUserId=0;
var group,workerName,offline = false,userPhoto,shopImg;

$(function(){
	// 客服版、连接服务器
	connectServer();
	// 加载用户版
	userInit();
	userChatList();
	userPhoto = $('#userPhoto').attr('src');
	shopImg = $('#serviceImg').attr('src');
	$('img#serviceImg').error(function(){shopImg=WST.conf.RESOURCE_PATH+"/"+WST.conf.SHOP_LOGO;$(this).attr('src',shopImg);});
	$('img#userPhoto').error(function(){userPhoto=WST.conf.RESOURCE_PATH+"/"+WST.conf.USER_LOGO;$(this).attr('src',userPhoto);});
});
// 处理破图
var dealImgFailLoad = function(_obj,_img){
	$(_obj).error(function(){$(this).attr('src',_img)});
}




// 设置当前浏览商品
var showCurrVisit = function(userId){
	var visit = $.cookie('visit');
	if(visit==undefined)return;
	visit = JSON.parse(visit);
	var goodsInfo = visit[userId];
	if(goodsInfo==undefined)return;

	var url = WST.U('wechat/goods/detail',{goodsId:goodsInfo.goodsId});
	var img = WST.conf.RESOURCE_PATH+"/"+goodsInfo.goodsImg;
	var code = [];
	code.push('<li id="visit_goods" class="J_ChatItem chat-txt chat-info" data-type="skuCard"><div class="customer">');
    code.push('<span class="dialog-box"><span class="J_MsgCont cont">');
    code.push('<ul class="im-list01 im-list04"><li><div class="sub">');
    code.push('<a target="_blank" href="'+url+'">');
    code.push('<div class="pic">');
    code.push('<img src="'+img+'">');
    code.push('</div></a>');
	code.push('<div class="txt">');
    code.push('<a target="_blank" href="'+url+'">');
    code.push('<p class="name">'+goodsInfo.goodsName+'</p>');
    code.push('<p class="bg-2"><span class="price">¥'+goodsInfo.shopPrice+'</span></p>');
    code.push('</a></div></div></li></ul><div class="comon-more">');
    code.push('<a href="javascript:;" class="J_Reelect" onclick="closeCurrVisit()">关闭</a>');
    code.push('</div></span></span></div></li>');
    var _obj = $('#J_ImChatList');
	_obj.append(code.join(''));
	_obj.scrollTop(_obj[0].scrollHeight);
	document.getElementById("visit_goods").addEventListener("transitionend", hideCurrVisit);
}
// 发送正在浏览
var closeCurrVisit = function(){
	$('#visit_goods').css({opacity: 0,visibility:'hidden'});
}
// 移除正在浏览
var hideCurrVisit = function(){
	document.getElementById("visit_goods").removeEventListener("transitionend", hideCurrVisit);
	$('#visit_goods').remove();
}

// 插入会话时间
var insertTime = function(_time){
	if(_time==undefined)return;
	var code = '<div id="connect" class="chat-txt chat-time" ><p class="time">'+_time+'</p></div>';
	$('#J_ImChatList').append(code);
}



// 刷新未读消息数
function _refreshNum(){
	try{
		var sendData = {
	                    uid:sendId,// 用户id
	                    userName:loginName,// 用户名
	                    role:'lisenter',// 角色
	                    shopId:shopId// 所属店铺id
	                    };
		ws.send(JSON.stringify(sendData));
	}catch(e){
		console.log('e```',e);		
	}

}

function connectServer(type){
	var _protocol = (window.location.protocol.indexOf('https')!=-1)?'wss://':'ws://';
	ws = new WebSocket(_protocol+server);
	/**
	* 连接服务器
	*/
	ws.onopen = function(){
		var sendData = {
	                    uid:sendId,// 用户id
	                    userName:loginName,// 用户名
	                    role:'lisenter',// 角色
	                    shopId:shopId// 所属店铺id
	                    };
		ws.send(JSON.stringify(sendData));
		var sendData = {type:'login',
						uid:sendId,
						userName:loginName,
						role:'worker',
						shopId:shopId};
		ws.send(JSON.stringify(sendData));
	};
	ws.onmessage = function(e){
	    var _data = JSON.parse(e.data);
	    if(!!_data.group){
	    	group = _data.group;
        }

	    switch(_data.type){
	    	/***************************** 监听 *********************************/
	    	case 'newMsg':
                if(_data._object=='user'){
                	// 用户未读消息数+1
                	var _cun = Number($('#userUnReadNum').html());
                	$('#userUnReadNum').html(++_cun);
                	// 接收店铺消息
		    		// 1.判断当前是否与改店铺聊天
		    		if(_data.from==_currShopId){
		    			// 设置消息已读
		    			shopFunc.setRead(_data.from);
		    		}
		    		var _index = "#shopId_"+_data.from;
		    		var obj = $(_index);
		    		
		    		var _em = obj.find('.un_read');
					// 获取已存在的未读消息数
					var _currUnReadNum = parseInt(_em.html());
						++_currUnReadNum;
					var _content = _data.content;
					_em.html(_currUnReadNum);
					if(_currUnReadNum>0)_em.css({display: 'block'});
					obj.find('.cl_desc').html(shopFunc.replaceContent(_content));
					obj.find('.fr').html(_data.createTime);

					// 加入队列，修改为在线状态
					obj.removeClass('off');




                }
                if(_data._object=='service'){
                    // 客服未读消息数+1
                    var _sun = Number($('#serviceUnReadNum').html());
                    $('#serviceUnReadNum').html(++_sun);
                }
            break;
            case 'unReadMsgNum':
                $('#userUnReadNum').html(_data.userUnRead);
				$('#serviceUnReadNum').html(_data.serviceUnRead);
            break;


	    	/***************************** 用户 *********************************/
	    	case 'chat':
	        	// 客服接待
	        	var _txt = "客服 "+_data.groupName+" 接待了您";
				var code = '<div id="connect" class="chat-txt chat-time" ><p class="time">'+_txt+'</p></div>';
				workerName = code;
				offline = false
				userFunc.setStatus(true);
				userFunc.disableSendMsg();
				var _obj = $('#J_ImChatList');
				_obj.append(code);
				scrollToEnd();
            break;
            case 'message':
	    		// 触发留言 offline = true;
	    		// disableSendMsg();
	    		userFunc.noServiceOnline();
	    	break;
	    	case 'wait':
	    		// 排队状态
	    		userFunc.disableSendMsg(true);
	    	break;
	    	/***************************** 客服 *********************************/
	    	case 'visit':
	    		var visit = $.cookie('visit');
	    		visit = (visit==undefined)?{}:JSON.parse(visit);
	    		var _goodsInfo = JSON.parse(_data.content);
	    		visit[_data.from] = _goodsInfo;
	    		$.cookie('visit',JSON.stringify(visit));
	    		if(_data.from==_currUserId){
	    			showCurrVisit(_data.from);
	    		}
	    	break;
	    	case 'load':
	    		// 加入聊天列表
	    		shopFunc.loadList(_data.list);
	    	break;
	    	case 'unReadMsg':
	    		// 加载未读留言
	    		shopFunc.loadUnReadList(_data.list);
	    	break;
	    	case 'removeList':
	    		// 移出聊天列表
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
			    		if(_data.from==_currUserId){
			    			// 设置消息已读
			    			shopFunc.setRead(_data.from);
			    			// 直接渲染消息
			    			receiveMsg(_data);
			    		}
			    		var _index = "#userId_"+_data.from;
			    		// 设置未读消息数及内容摘要
			    		shopFunc.setMsgNumAndContent(_data,$(_index));
		    		}
	    		}else{
	    			if(_data.from==sendId){
			    		// 发送消息给某人
			    		_doSendMsg(_data);
		    		}else if(_data.shopId==_currShopId){
		    			// 接收某人消息
		    			receiveMsg(_data);
		    			userFunc.setRead();
		    		}
	    		}
	    	break;
	    	case 'conversation':
	    		// 客服界面
	    		// 用户在pc端刷新操作
	    		clearInterval(timer[_data.from]);
	    		// 标识用户为在线
	    		shopFunc.setUserOnline(_data.from);
	    		// 接收某人消息
	    		// 1.判断当前是否与改用户聊天
	    		if(_data.from==_currUserId){
	    			// 设置消息已读
	    			shopFunc.setRead(_data.from);
		    	}else{
		    		var _index = '#userId_'+_data.from;
	    			// 设置未读消息数及内容摘要
	    			shopFunc.setMsgNumAndContent(_data,$(_index),'join');
	    		}
	    	break;
	    	case 'userExit':
	    		// 接收消息者已离线
	    		shopFunc.setUserOffLine(_data.clientUid);
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
	}
}
//弹框
function dataShow(_obj,title,objectId,_Tab){
	// 每次进来都重置列表页、页数、输入框
	$('#J_ImChatList').html(' ');
	$('#currPage').val(1);
	$('#totalPage').val(1);
	$('#currOrderPage').val(0);
	$('#totalOrderPage').val(1);

	var _photo = $(_obj).find('img').attr('src');

	if(_Tab==0){
		// 以用户身份
		userPhoto = $('#userPhoto').attr('src');
		shopImg = _photo;
	}else{
		// 以客服身份
		userPhoto = _photo;
		shopImg = $('#serviceImg').attr('src');

	}

	_TabIndex = _Tab;
	try{
		if(_Tab==0){
			// 上传图片
    		userFunc.uploadImg();
			_currShopId = objectId;
			// 聊天记录
    		userFunc.getChatRecord();
    		userFunc.setRead(objectId);
			// 用户登录
			var sendData = {type:'login',
							uid:sendId,
							userName:loginName,
							role:'user',
							shopId:objectId,
							group:jQuery.cookie("group")};
			ws.send(JSON.stringify(sendData));
		}else{
    		shopFunc.uploadImg();
			_TabIndex = 1;
			// 隐藏'订单'、'最近浏览'选项
			$('#J_Order').hide();
			$('#J_Recent').hide();
			_currUserId = objectId;
			// 聊天记录
    		shopFunc.getChatRecord();
    		// 设置为已读
    		shopFunc.setRead(objectId);
		}
	}catch(e){
		console.log('发送消息失败~',e);
	}
    jQuery('#cover').attr("onclick","javascript:dataHide();").show();
    jQuery('#frame').animate({"right": 0}, 500);
    jQuery('#boxTitle').find('span').html(title);
    // setTimeout(function(){$('#shopBox').hide();},600)
}
function dataHide(){
	// 确保客服所属店铺
	var sendData = {type:'login',
						uid:sendId,
						userName:loginName,
						role:'worker',
						shopId:shopId};
	ws.send(JSON.stringify(sendData));


	// 刷新未读消息数
	_refreshNum();
	// 显示'订单'、'最近浏览'选项
	$('#J_Order').show();
	$('#J_Recent').show();
	_currShopId = 0;
	_currUserId = 0;
    var dataHeight = $("#frame").css('height');
    var dataWidth = $("#frame").css('width');
    jQuery('#frame').animate({'right': '-'+dataWidth}, 500);
    jQuery('#cover').hide();
}

function userChatList(){
	var url = WST.U('addon/wstim-shopchats-userChatList');
    $.post(url, {}, function(data){
        var json = WST.toJson(data);
        var html = '';
        if(json && json.length>0){
		  $('#empty').hide();
          var gettpl = document.getElementById('userUnReadList').innerHTML;
          laytpl(gettpl).render(json, function(html){
            $('.cl_ul').append(html);
          });
        }else{
	        // $('.cl_ul').html(' ');
	        $('#empty').show();
        }
        loading = false;
        $('#Load').hide();
        //图片懒加载
    });
}
function sendMsg(){
	(_TabIndex==0)?userFunc.sendMsg():shopFunc.sendMsg();
}
/************************************************* 用户 *****************************************************/
function userInit(){
	$('#J_ImChatList').css({height:WST.pageHeight()*0.75+50,overflow:'auto',backgroundColor: 'linen'});
    // 绑定点击事件
    $('#J_Order').click(function(){
    	$('.im-order').html(' ');
    	$('#currOrderPage').val(0);
    	$('#totalOrderPage').val(1);
    	userFunc.dialogShow('order');
    });
	$('#J_Recent').click(function(){
		$('.im-order').html(' ');
		$('#currPage').val(1);
    	$('#totalPage').val(1);
		userFunc.dialogShow('recent');
	});
	$('.im-pop-close').click(function(){
		userFunc.dialogShow('close');
	});
	$('#J_ImChatList').scroll(function(event){  
	    var wScrollY = $('#J_ImChatList').scrollTop(); // 当前滚动条位置    
	    if(wScrollY<=20){
	    	(_TabIndex==0)?userFunc.loadMoreHistory():shopFunc.loadMoreHistory();
	    }
	}); 
}

// 用户界面所需函数
loading=false;
var userFunc = {
	// 标记为已读
	setRead:function(){
		var url = WST.U('addon/wstim-chats-setRead');
		$.post(url,{shopId:_currShopId},function(data){
			$('#shopId_'+_currShopId).find('.un_read').html('0').css({display:'none'});
		},'json')
	},
	// 排队状态
	disableSendMsg:function(flag){
		if(flag){
			$('#Global_Loading').show();
			$('.wait_btn').click(function(){
				$('#Global_Loading').hide();
				ws.close();
			});
		}else{
			$('#Global_Loading').hide();
		}
	},
	// 标记客服在线状态
	setStatus:function(isOnline){
		var _obj = $('.J_WaiterHead');
		isOnline?_obj.removeClass('offline'):_obj.addClass('offline');
	},
	// 当前无客服在线的提示
	noServiceOnline:function(){
		var _txt = "当前无客服在线，您可以留言，我们会尽快回复您。";
		var code = [
			'<li class="J_ChatItem chat-txt chat-tips" data-type="system">',
		    '<div class="system"><span class="dialog-box">',
		    '<span class="J_MsgCont cont">'+_txt+'</span>',
		    '</span></div></li>'
		];
		var _obj = $('#J_ImChatList');
			_obj.append(code.join(''));
			scrollToEnd();
	},
	// 点击发送消息
	sendMsg:function(){
		var content = $.trim($('#J_TextIn').val());
		if(content=='')return;
		offline?userFunc._sendOfflineMsg(content):userFunc._sendMsg(content);
	},
	// 发送消息
	_sendMsg:function(content){
		var sendData = {role:'user',content:content,type:'say',to:group};
		if(group==undefined)sendData.to=_currShopId;
		ws.send(JSON.stringify(sendData));
	},
	// 发送留言
	_sendOfflineMsg:function(content){
		if(_currShopId==0){
			return alert('发送失败，请联系管理员');
		}
		var params = {content:content,type:'message',to:_currShopId};
		var url = WST.U('addon/wstim-chats-sendMsg');
		$.post(url,params,function(data){
			if(data.status==1){
				_doSendMsg(params);
			}else{
				alert('消息发送失败，请重试');
			}
		},'json');
	},
	// 聊天记录
	getChatRecord:function(){
		var params = {receiveId:_currShopId};
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
					if(_obj.from!=sendId){
						receiveMsg(_obj);
					}else{
						_doSendMsg(_obj);
					}
				}
				if(i==last || rows.length==0){
					// 加载完最后一条聊天记录后
					// -----connectServer();
					var _obj = $('#J_ImChatList');
					scrollToEnd();
				}
			},
			'json');
	},
	//  显示遮罩层
	dialogShow:function(type){
		switch(type){
			case 'order':
				// 加载订单列表
				$('#Im_PopUp').show();
				$('.im-box-title').html('请选择您要咨询的订单');
				userFunc.getOrderList();
			break;
			case 'recent':
				// 加载浏览历史
				$('#Im_PopUp').show();
				$('.im-box-title').html('请选择您要咨询的商品');
				userFunc.getHistory();
			break;
			case 'close':
				$('#Im_PopUp').hide();
			break;
		}
	},
	// 我的订单
	getOrderList:function(obj){
		var currPage = $('#currOrderPage').val();
		var totalPage = $('#totalOrderPage').val();
		if(parseInt(currPage)+1>totalPage){
			return;
		}
		var params = {
			shopId:_currShopId,
			page:parseInt(currPage)+1,
		}
		var code = [];
		var url = WST.U('addon/wstim-chats-getOrderList');
		$.post(url,params,function(data){
			$('#currOrderPage').val(data.current_page);
			$('#totalOrderPage').val(data.last_page);
			var _rows = data.data;
			if(_rows.length==0){
				$('.im-order').html('<p class="tc">暂无相关数据</p>');
				return;
			}
	        code.push('<ul class="J_OrderListWrap im-list01 im-list03-pop">');
			for(var i in data.data){
				var _obj = data.data[i];
				code.push(
					'<li class="J_OrderItem" data-oid="'+_obj.orderId+'" data-ono="'+_obj.orderNo+'">',
		                '<p class="bg-1">',
		                    '<strong>订单号：</strong>',
		                    '<span class="s-3">'+_obj.orderNo+'</span><span class="time">'+_obj.createTime+'</span>',
		                '</p>',
		            '<div class="sub">'
				        );
				// 判断订单下的商品数量，若只有一件则显示商品名称，否则仅显示商品图片
				if(_obj.list.length>1){
					var goodsCount = _obj.list.length;
					for(var j=0;j<goodsCount;++j){
						var _gObj = _obj.list[j];
						var _url = WST.U('wechat/goods/detail',{id:_gObj.goodsId});
						var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_gObj.goodsImg;
						var _default_img = WST.conf.RESOURCE_PATH+"/"+WST.conf.GOODS_LOGO;
						code.push(
				            '<div class="pic">',
			                    '<img src="'+_default_img+'" data-echo="'+_imgSrc+'" />',
			                '</div>'
						);
					}
				}else{
					var _gObj = _obj.list[0];
					var _url = WST.U('wechat/goods/detail',{id:_gObj.goodsId});
					var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_gObj.goodsImg;
					var _default_img = WST.conf.RESOURCE_PATH+"/"+WST.conf.GOODS_LOGO;
					code.push(
							'<div class="pic">',
			                    '<img src="'+_default_img+'" data-echo="'+_imgSrc+'" />',
			                '</div>',
			                '<div class="txt">',
			                    '<p class="name">'+_gObj.goodsName+'</p>',
			                    '<p class="bg-2">',
			                        '<span class="price">¥ '+_obj.realTotalMoney+'</span>',
			                        '<span class="state s-5 ">'+_obj.orderStatus+'</span>',
			                    '</p>',
			                '</div>'
						);
				}
				code.push('</div></li>');
			}
			code.push('</ul>');
			// 将代码添加到页面上
			$('.im-order').html(code.join(''));
			// 绑定点击事件
			$('.J_OrderItem').click(function(){
				var orderId = $(this).data('oid');
				var orderNo = $(this).data('ono');
				var content = {type:"orders",orderId:orderId,content:"订单号："+orderNo};
				userFunc._sendMsg(JSON.stringify(content));
				$('#Im_PopUp').hide();
			});
			userFunc.lazyLoadImg();
		},'json');
	},
	// 浏览记录
	getHistory:function(){
		var params = {
			shopId:_currShopId
		}
		var code = [];
		var url = WST.U('addon/wstim-chats-getHistory');
		$.post(url,params,function(data){
			if(data.length==0){
				$('.im-order').html('<p class="tc">暂无相关数据</p>');
				return;
			}
			code.push('<ul class="J_ProductListWrap im-list01  im-list01-pop">');
			for(var i in data){
				var _obj = data[i];
				var _url = WST.U('wechat/goods/detail',{id:_obj.goodsId});
				var _imgSrc = WST.conf.RESOURCE_PATH+"/"+_obj.goodsImg;
				var _default_img = WST.conf.RESOURCE_PATH+"/"+WST.conf.GOODS_LOGO;
				code.push(
						'<li class="J_ProductItem" data-gid="'+_obj.goodsId+'" data-gname="'+_obj.goodsName+'">',
			                '<div class="sub"><div class="pic">',
		                    '<img src="'+_default_img+'" data-echo="'+_imgSrc+'" />',
		                    '</div>',
		                    '<div class="txt"><p class="name">'+_obj.goodsName+'</p>',
		                    '<p class="bg-2"><span class="price">¥ '+_obj.shopPrice+'</span></p>',
		                    '</div></div></li>'
				        );
			}
			code.push('</ul>');
			// 将代码添加到页面上
			$('.im-order').html(code.join(''));
			// 绑定点击`发送`
			$('.J_ProductItem').click(function(){
				var goodsId = $(this).data('gid');
				var goodsName = $(this).data('gname');
				var receiveId = $('#receiveId').val();
				var content = {type:"goods",goodsId:goodsId,content:goodsName};
				userFunc._sendMsg(JSON.stringify(content));
				$('#Im_PopUp').hide();
			})
			userFunc.lazyLoadImg();
		},'json');
	},
	lazyLoadImg:function(){
		 //图片懒加载
		 
	},
	// 图片上传
	uploadImg:function(){
		WST.upload({
	    pick:'#J_Photo',
	    formData: {dir:'users'},
	    accept: {extensions: 'gif,jpg,jpeg,png',mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'},
	    callback:function(f){
	      var json = WST.toJson(f);
	      if(json.status==1){
	        var uploadPhotoSrc = json.savePath+json.thumb;
			var content = {type:"image",content:uploadPhotoSrc};
				content = JSON.stringify(content);
			offline?userFunc._sendOfflineMsg(content):userFunc._sendMsg(content);
	      }else{
	        alert(json.msg);
	      }
	      },
	      progress:function(rate){
	          $('#uploadMsg').show().html('已上传'+rate+"%");
	      }
	      });
	},
	// 加载更多聊天记录
	loadMoreHistory:function(){
		if(loading){
			// 加载中
			return;
		}
		loading = true;
		var receiveId = _currShopId;
		var currPage = $('#currPage').val();
		var totalPage = $('#totalPage').val();
		if(parseInt(currPage)+1>totalPage){
			loading = false;
			return;
		}
		var params = {
			receiveId:receiveId,
			page:parseInt(currPage)+1,
		};
		var url = WST.U('addon/wstim-chats-pagequery');
		$.post(url,params,function(data){
			$('#currPage').val(data.current_page);
			$('#totalPage').val(data.last_page);
			var rows = data.data;
			var code = [];
			for(var i in rows){
				var _obj = rows[i];
				dealContent(_obj);
				if(_obj.from!=sendId){
					code.push(
						'<div id="connect" class="chat-txt chat-time" ><p class="time">'+_obj.createTime+'</p></div>',
						'<li class="J_ChatItem chat-txt" data-rel="history">',
				        '<div class="customer"><span class="dialog-box"><span class="J_MsgCont cont">',
				        '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+_obj.content+'</div>',
				        '</span></span>',
				        '<img src="'+userPhoto+'" class="chat_photo">',
				        '</div></li>'
						);
				}else{
					code.push(
						'<div id="connect" class="chat-txt chat-time" ><p class="time">'+_obj.createTime+'</p></div>',
						'<li class="J_ChatItem chat-txt" data-rel="history">',
			            '<div class="service">',
			            '<img src="'+shopImg+'" class="chat_photo">',
			            '<span class="dialog-box"><span class="J_MsgCont cont">',
			            '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+_obj.content+'</div>',
			            '</span></span></div></li>'
						);
				}
			}
			$('#J_ImChatList').prepend(code.join(''));
			loading = false;
		},'json');
	}
}


/************************************************* 客服 *****************************************************/
// 初始化客服界面所需函数
var shopFunc = {
	// 标记为已读
	setRead:function(userId){
		var obj = $('#userId_'+userId);
		var url = WST.U('addon/wstim-shopchats-setRead');
		$.post(url,{from:userId,to:sendId},function(data){
			if(data.status==1){
				obj.find('.un_read').html('0').css({display:'none'});
			}
		},'json')
	},
	// 加载当前接待的用户列表
	loadList:function(rows){
		var code = [];
		for(var i in rows){
			if($('#userId_'+i).length>0)continue;
			var _data = rows[i];
				onlineList[i] = true;// 记录在线用户
			var	_content = ''
			if(_data.content && _data.content.content){
				_content = shopFunc.replaceContent(_data.content.content);
			}
			var _unread = '<span class="un_read" style="display:none">0</span></div>';
			if(_data.unReadNum>0){
				_unread = '<span class="un_read">'+_data.unReadNum+'</span></div>';
			}
			var imgSrc= _data.userPhoto;
			if(_data.userPhoto!=undefined && _data.userPhoto.indexOf('http')==-1){
				imgSrc = window.conf.RESOURCE_PATH+'/'+_data.userPhoto;
			}
			var default_photo = window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO;
			if(userPhoto.userPhoto=='')imgSrc=default_photo;
			code.push('<li data-uid="'+i+'" id="userId_'+i+'" class="cl_li" onclick="javascript:dataShow(this,\''+_data.loginName+'\','+i+');" >');
			code.push('<a href="#">');
			code.push('<div class="cl_imgbox">');
			code.push('<img class="userImg" src="'+default_photo+'" data-echo="'+imgSrc+'" alt="">');
			code.push(_unread);
			code.push('<div class="cl_infobox"><p class="cl_sname">');
			code.push('<span class="user_name">'+_data.loginName+'</span>');
			code.push('<span class="fr last_time">'+_data.createTime+'</span></p>');
			code.push('<p class="cl_desc">'+_content+'</p>');
			code.push('</div><div class="wst-clear"></div></a></li>');
		}
		$('.cl_ul').prepend(code.join(''));
		dealImgFailLoad('img.userImg',default_photo);
	},
	// 加载未读消息列表
	loadUnReadList:function(_row){
		var code = [];
		for(var i in _row){
			if($('#userId_'+i).length>0)continue;
			var _obj = _row[i];
			var imgSrc= _obj.userPhoto;
			if(_obj.userPhoto!=undefined && _obj.userPhoto.indexOf('http')==-1){
				imgSrc = window.conf.RESOURCE_PATH+'/'+_obj.userPhoto;
			}
			var default_photo = window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO;
			if(_obj.userPhoto=='')imgSrc=default_photo;
				code.push('<li data-uid="'+i+'" id="userId_'+i+'" class="cl_li" onclick="javascript:dataShow(this,\''+_obj.loginName+'\','+i+');">');
				code.push('<a href="#">');
				code.push('<div class="cl_imgbox">');
				code.push('<img class="userImg" src="'+default_photo+'" data-echo="'+imgSrc+'" alt="">');
				code.push('<span class="un_read">'+_obj.unReadNum+'</span></div>');
				code.push('<div class="cl_infobox"><p class="cl_sname">');
				code.push('<span class="user_name">'+_obj.loginName+'</span>');
				code.push('<span class="fr last_time">'+_obj.createTime+'</span></p>');
				code.push('<p class="cl_desc">'+shopFunc.replaceContent(_obj.content.content)+'</p>');
				code.push('</div><div class="wst-clear"></div></a></li>');
		}
		if(code.length>0){
			$('#empty').hide();
			$('.cl_ul').append(code.join(''));
			dealImgFailLoad('img.userImg',default_photo);
		}
	},
	// 将用户设置为在线
	setUserOnline:function(uid){
		onlineList[uid] = true;
		$('#userId_'+uid).removeClass('off');
		if($('#userId').val()==uid){// 当前聊天用户在线
			$('#logoTitle').parent().removeClass('off')
		}
	},
	// 将用户设置为离线
	setUserOffLine:function(uid){
		timer[uid] = setInterval(function(){
			$('#userId_'+uid).addClass('off');
			onlineList[uid] = undefined;
			if($('#userId').val()==uid){// 当前聊天用户离线
				$('#logoTitle').parent().addClass('off')
			}
			clearInterval(timer[uid]);
		},3000)
	},
	// 设置未读消息数及内容摘要
	setMsgNumAndContent:function(data,obj,type){
		// 判断当前是否已经存在该会话
		if(obj.length<=0){
			var	_content = '';
			if(data.content && data.content.content){
				_content = shopFunc.replaceContent(data.content.content);
			}else{
				_content = data.content;
			}
			var code = [];
			var _unread = '<span style="display: none" class="un_read">0</span></div>';
			if(data.unReadNum>0){
				_unread = '<span style="display: none" class="un_read">'+data.unReadNum+'</span></div>';
			}
			var imgSrc= data.userPhoto;
			if(data.userPhoto!=undefined && data.userPhoto.indexOf('http')==-1){
				imgSrc = window.conf.RESOURCE_PATH+'/'+data.userPhoto;
			}
			var default_photo = window.conf.RESOURCE_PATH+'/'+window.conf.USER_LOGO;
			if(data.userPhoto=='')imgSrc=default_photo;
			var _uName = data.userName?data.userName:data.loginName;
			code.push('<li data-uid="'+data.from+'" id="userId_'+data.from+'" class="cl_li" onclick="javascript:dataShow(this,\''+_uName+'\','+data.from+');">');
			code.push('<a href="#">');
			code.push('<div class="cl_imgbox">');
			code.push('<img class="userImg" src="'+default_photo+'" data-echo="'+imgSrc+'" alt="">');
			code.push(_unread);
			code.push('<div class="cl_infobox"><p class="cl_sname">');
			code.push('<span class="user_name">'+_uName+'</span>');
			code.push('<span class="fr last_time">'+data.createTime+'</span></p>');
			code.push('<p class="cl_desc">'+_content+'</p>');
			code.push('</div><div class="wst-clear"></div></a></li>');
			$('#empty').hide();
			$('.cl_ul').prepend(code.join(''));
			dealImgFailLoad('img.userImg',default_photo);
		}else{
			var _em = obj.find('.un_read');
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
			obj.find('.cl_desc').html(shopFunc.replaceContent(_content));
			obj.find('.fr').html(data.createTime);

			// 加入队列，修改为在线状态
			obj.removeClass('off');
		}
	},
	// 替换消息中的图片、链接
	replaceContent:function(content){
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
	},





	// 点击发送消息
	sendMsg:function(){
		var content = $.trim($('#J_TextIn').val());
		if(content=='')return;
		offline?shopFunc._sendOfflineMsg(content):shopFunc._sendMsg(content);
	},
	// 发送消息
	_sendMsg:function(content){
		var sendData = {role:'worker',content:content,type:'say',to:_currUserId};
		if(_currUserId==undefined)return alert('发送失败，请联系管理员');
		ws.send(JSON.stringify(sendData));
	},
	// 发送留言
	_sendOfflineMsg:function(content){
		if(_currUserId==0){
			return alert('发送失败，请联系管理员');
		}
		var params = {content:content,type:'message',shopId:shopId,userId:_currUserId};
		var url = WST.U('addon/wstim-shopchats-sendMsg');
		$.post(url,params,function(data){
			if(data.status==1){
				_doSendMsg(params);
			}else{
				alert('消息发送失败，请重试');
			}
		},'json');
	},
	// 聊天记录
	getChatRecord:function(){
		var params = {userId:_currUserId};
		var url = WST.U('addon/wstim-shopchats-pagequery');
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
					if(_obj.from!=sendId){
						receiveMsg(_obj);
					}else{
						_doSendMsg(_obj);
					}
				}
				if(i==last || rows.length==0){
					// 加载完最后一条聊天记录后
					// -----connectServer();
					var _obj = $('#J_ImChatList');
					scrollToEnd();
				}
				// 显示用户正在浏览
    			showCurrVisit(_currUserId);
			},
			'json');
	},
	// 图片上传
	uploadImg:function(){
		WST.upload({
	    pick:'#J_Photo',
	    formData: {dir:'users'},
	    accept: {extensions: 'gif,jpg,jpeg,png',mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'},
	    callback:function(f){
	      var json = WST.toJson(f);
	      if(json.status==1){
	      	if(_currUserId<=0)return alert('发送失败，请联系管理员');// 无接收对象
	      	var uploadPhotoSrc = json.savePath+json.thumb;
			var content = {type:"image",content:uploadPhotoSrc};
				content = JSON.stringify(content);
				offline?shopFunc._sendOfflineMsg(content):shopFunc._sendMsg(content);
	      }else{
	        alert(json.msg);
	      }
	      },
	      progress:function(rate){
	          $('#uploadMsg').show().html('已上传'+rate+"%");
	      }
	      });
	},
	// 加载更多聊天记录
	loadMoreHistory:function(){
		if(loading){
			// 加载中
			return;
		}
		loading = true;
		var userId = _currUserId;
		var currPage = $('#currPage').val();
		var totalPage = $('#totalPage').val();
		if(parseInt(currPage)+1>totalPage){
			loading = false;
			return;
		}
		var params = {
			userId:userId,
			page:parseInt(currPage)+1,
		};
		var url = WST.U('addon/wstim-shopchats-pagequery');
		$.post(url,params,function(data){
			$('#currPage').val(data.current_page);
			$('#totalPage').val(data.last_page);
			var rows = data.data;
			var code = [];
			for(var i in rows){
				var _obj = rows[i];
				dealContent(_obj);
				if(_obj.from!=sendId){
					code.push(
						'<div id="connect" class="chat-txt chat-time" ><p class="time">'+_obj.createTime+'</p></div>',
						'<li class="J_ChatItem chat-txt" data-rel="history">',
				        '<div class="customer"><span class="dialog-box"><span class="J_MsgCont cont">',
				        '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+_obj.content+'</div>',
				        '</span></span>',
				        '<img src="'+shopImg+'" class="chat_photo">',
				        '</div></li>'
						);
				}else{
					code.push(
						'<div id="connect" class="chat-txt chat-time" ><p class="time">'+_obj.createTime+'</p></div>',
						'<li class="J_ChatItem chat-txt" data-rel="history">',
			            '<div class="service">',
			            '<img src="'+userPhoto+'" class="chat_photo">',
			            '<span class="dialog-box"><span class="J_MsgCont cont">',
			            '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+_obj.content+'</div>',
			            '</span></span></div></li>'
						);
				}
			}
			$('#J_ImChatList').prepend(code.join(''));
			loading = false;
		},'json');
	}
}
/************************************************  commonFunc  **************************************************/
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

// 处理链接、图片######################
dealContent=function(msg){
	if(isJSON(msg.content)){
		var _json = JSON.parse(msg.content);
		switch(_json.type){
			case 'goods':
				msg.content = '<a href="'+WST.U('wechat/goods/detail',{goodsId:_json.goodsId})+'" target="_blank">'+_json.content+'</a>'
			break;
			case 'orders':
				msg.content = '<a href="'+WST.U('wechat/orders/index',{orderId:_json.orderId})+'" target="_blank">'+_json.content+'</a>'
			break;
			case 'image':
				msg.content = '<img style="max-width:100%;" src="'+WST.conf.RESOURCE_PATH+"/"+_json.content+'" />';
			break;
		}
	}
}
// ######################
_doSendMsg=function(msg){
	dealContent(msg);
	var _obj = $('#J_ImChatList');
	var code = [];
	var _photo =(_TabIndex==0)?userPhoto:shopImg;
	code.push(
		'<li class="J_ChatItem chat-txt" data-rel="history">',
        '<div class="customer"><span class="dialog-box"><span class="J_MsgCont cont">',
        '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+msg.content+'</div>',
        '</span></span>',
        '<img src="'+_photo+'" class="chat_photo">',
        '</div></li>'
		);
		
	$('#J_TextIn').val(' ');
	insertTime(msg.createTime);
	_obj.append(code.join(''));
	_obj.scrollTop(_obj[0].scrollHeight);
}
// 接收消息 ######################
receiveMsg=function(msg){
	dealContent(msg);
	var _obj = $('#J_ImChatList');
	var code = [];
	var _photo = (_TabIndex==0)?shopImg:userPhoto; 
	code.push(
			'<li class="J_ChatItem chat-txt" data-rel="history">',
            '<div class="service">',
            '<img src="'+_photo+'" class="chat_photo">',
            '<span class="dialog-box"><span class="J_MsgCont cont">',
            '<div class="J_TextMsgBox text-msg-wrap" style="height:auto;">'+msg.content+'</div>',
            '</span></span></div></li>'
			);
	insertTime(msg.createTime);
	_obj.append(code.join(''));
	_obj.scrollTop(_obj[0].scrollHeight);
}
// 令滚动条滑动到底部####################
scrollToEnd=function(){
	var _obj = $('#J_ImChatList');
	_obj[0].scrollTop = _obj[0].scrollHeight;
}