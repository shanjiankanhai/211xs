var mmg;
$(function(){
    var laydate = layui.laydate;
    laydate.render({
        elem: '#startDate'
    });
    laydate.render({
        elem: '#endDate'
    });
})
function initGrid(page){
	var p = WST.arrayParams('.j-ipt');
	var h = WST.pageHeight();
    var cols = [
            {title:'订单编号', name:'orderNo', width: 50,sortable:true, renderer:function(val,item,rowIndex){
                var h = "";
	            h += "<img class='order-source2' src='"+WST.conf.ROOT+"/wstmart/admin/view/img/order_source_"+item['orderSrc']+".png'>";	
	            h += "<a style='cursor:pointer' onclick='javascript:showDetail("+ item['orderId'] +");'>"+item['orderNo']+"</a>";
	            return h;
            }},
            {title:'收货人', name:'userName', width: 120,sortable:true},
            {title:'店铺', name:'shopName', width: 90,sortable:true},
            {title:'实收金额', name:'realTotalMoney', width: 30,sortable:true, renderer:function(val,item,rowIndex){return '￥'+val;}},
            {title:'支付方式', name:'payType' , width: 30,sortable:true},
            {title:'配送方式', name:'deliverType', width: 30,sortable:true},
            {title:'订单来源', name:'orderCodeTitle', width: 30,sortable:true},
            {title:'下单时间', name:'createTime', width: 100,sortable:true},
            {title:'订单状态', name:'orderStatus', width: 30,sortable:true, renderer:function(val,item,rowIndex){
            	 if(item['orderStatus']==-1 || item['orderStatus']==-3){
                     return "<span class='statu-no'><i class='fa fa-ban'></i> "+item.status+"</span>";
                 }else if(item['orderStatus']==2){
                     return "<span class='statu-yes'><i class='fa fa-check-circle'></i> "+item.status+"</span>";
            	 }else{
            	 	return "<span class='statu-wait'><i class='fa fa-clock-o'></i> "+item.status+"</span>";
            	 }
            }},
            {title:'操作' , width: 30,name:'status', renderer:function(val,item,rowIndex){
            	var h = "";
	            h += "<a class='btn btn-blue' href='javascript:toView(" + item['orderId'] + ")'><i class='fa fa-search'></i>详情</a> ";
	            return h;
            }}
            ];
 
    mmg = $('.mmg').mmGrid({height: (h-84),indexCol: true,indexColWidth:50, cols: cols,method:'POST',nowrap:true,
        url: WST.U('admin/orders/pageQuery',p.join('&')), fullWidthRows: true, autoLoad: false,remoteSort: true,sortName:'createTime',sortStatus:'desc',
        plugins: [
            $('#pg').mmPaginator({})
        ]
    });
    loadGrid(page);
}

function toView(id){
	location.href=WST.U('admin/orders/view','id='+id+'&src=orders&p='+WST_CURR_PAGE);
}
function toBack(p,src){
    if(src=='orders'){
        location.href=WST.U('admin/orders/index','p='+p);
    }else{
        location.href=WST.U('admin/orderrefunds/refund','p='+p);
    }
}
function loadGrid(page){
	var p = WST.getParams('.j-ipt');
    page=(page<=1)?1:page;
    p.page = page;
	mmg.load(p);
}
function toExport(){
	var params = {};
	params = WST.getParams('.j-ipt');
	var box = WST.confirm({content:"您确定要导出订单吗?",yes:function(){
		layer.close(box);
		location.href=WST.U('admin/orders/toExport',params);
    }});
}
function showDetail(id){
    parent.showBox({title:'订单详情',type:2,content:WST.U('admin/orders/view',{id:id,from:1}),area: ['1020px', '500px'],btn:['关闭']});
}
function loadMore(){
    var h = WST.pageHeight();
    if($('#moreItem').hasClass('hide')){
        $('#moreItem').removeClass('hide');
        mmg.resize({height:h-115});
    }else{
        $('#moreItem').addClass('hide');
        mmg.resize({height:h-85});
    }
}
function editOrder(id){
    var w=WST.open({
        type: 1,
        title:"订单修改为已支付",
        content:$('#editOrder'),shade: [0.6, '#000'],
        area: ['400px', '200px'],
        btn: ['确定'],
        yes: function(index, layero){
            var payFrom = $.trim($('#payFrom').val());
            var trade_no = $.trim($('#trade_no').val());
            if(trade_no==''){
                WST.msg("请输入外部流水号", {icon: 5});
                return;
            }
            var ll = WST.msg('数据处理中，请稍候...');
            $.post(WST.U('admin/orders/changePayStatus'),{payFrom:payFrom,trade_no:trade_no,orderId:id},function(data){
                layer.close(w);
                layer.close(ll);
                var json = WST.toAdminJson(data);
                if(json.status>0){
                    WST.msg(json.msg, {icon: 1});
                    location.href=WST.U('admin/orders/view','id='+id);
                }else{
                    WST.msg(json.msg, {icon: 2});
                }
            });
        },
        cancel: function(index, layero){
            console.log(1);
            layer.close(index);
            $('#editOrder').hide();
        }

    });
}