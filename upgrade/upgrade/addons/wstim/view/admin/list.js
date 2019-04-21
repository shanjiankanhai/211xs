var mmg;

function initGrid(p){
    var h = WST.pageHeight();
    var cols = [
            {title:'用户名称', name:'loginName', width: 150},
            {title:'商家名称', name:'shopName', width: 100},
            {title:'时间', name:'createTime', width: 30,},
            {title:'操作', name:'' ,width:100, align:'center', renderer: function(val,rowdata,rowIndex){
	            var h = "<a class='btn btn-blue' target='_blank' onclick='viewDetail("+rowdata['userId']+","+rowdata['shopId']+",\""+rowdata['loginName']+"\")'> <i class='fa fa-search'></i>查看</a> ";
	            return h;
            }}
            ];
 
    mmg = $('.mmg').mmGrid({height: h-85,indexCol: true, indexColWidth:50, cols: cols,method:'POST',
        url: WST.AU('wstim://dialogs/pagequery'), fullWidthRows: true, autoLoad: false,
        plugins: [
            $('#pg').mmPaginator({})
        ]
    });
    loadGrid(p);
}
function loadGrid(p){
	var params = WST.getParams('.j-ipt');
    p=(p<=1)?1:p;
    params.page=p;
	mmg.load(params);
}
var viewDetail = function(userId,shopId,uname){
    var tips = layer.load({msg:'正在获取数据，请稍后...'});
    $.post(WST.AU('wstim://dialogcontents/adminIndex'),{id:userId,shopId:shopId,uname:uname},function(data,textStatus){
        layer.close(tips);
        WST.open({
            type: 1,
            title:['会话详情（'+uname+'）', 'background-color:#2cabe2;color:#fff;'],
            shade: [0.6, '#000'],
            border: [0],
            content: data,
            area: [(WST.pageWidth()*0.9)+'px', (WST.pageHeight()*0.9)+'0px'],
            offset: '10px',
            fixed:true,
        });
    });
}