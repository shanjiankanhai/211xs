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
        msg.content = '<a href="'+WST.U('shop/orders/view',{id:_json.orderId})+'" target="_blank">'+_json.content+'</a>'
      break;
      case 'image':
        msg.content = '<img style="max-width:300px;" src="'+WST.conf.RESOURCE_PATH+'/'+_json.content+'" />';
      break;
    }
  }
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
        id:userId,
        page:parseInt(currPage)+1,
    };
    var url = WST.U('addon/wstim-dialogcontents-pagequery');
    $.post(url,params,function(data){
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
                    '<div class="dialog_content_item">',
                      '<div class="send_box">',
                         '<p class="reply_name">'+_obj.userName+'：</p>',
                         '<div class="dcs_content dcs_send">',
                             _obj.content,
                         '</div>',
                         '<span class="msg_send_time">'+_obj.createTime+'</span>',
                      '</div>',
                   '</div>'
                      );
            }else{
                code.push(
                    '<div class="dialog_content_item">',
                      '<div class="reply_box">',
                         '<p class="reply_name">'+_obj.userName+'：</p>',
                         '<div class="dcr_content">',
                           _obj.content,
                         '</div>',
                         '<span class="msg_reply_time">'+_obj.createTime+'</span>',
                      '</div></div>'
                        );
            }
        }
        if(rows.length>0){
            code.unshift('<div class="chat-more tc" id="clickMore" onclick="clickMore(this)"><p class=""><span class="icon"></span><span class="txt">点击加载更多</span></p></div>');
            $('#scrollDiv').prepend(code.join(''));
            $('#scrollDiv').scrollTop(0); // 滚动到顶部
            $(obj).remove();
        }else{
            $(obj).find('.txt').html('没有聊天纪录了');
            p.removeClass('loading');
        }
    },'json');
}