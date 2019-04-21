var mmg;
function initGrid(p){
	var laydate = layui.laydate;
    laydate.render({
        elem: '#startDate'
    });
    laydate.render({
        elem: '#endDate'
    });
   var h = WST.pageHeight();
   var cols = [
        {title:'用户', name:'loginName', width: 300},
        {title:'时间', name:'createTime',width: 150},
        {title:'操作', name:'' ,width:110,renderer:function(val,item,rowIndex){
            var html = [];
            html.push("<a class='btn btn-blue' onclick='javascript:view("+item["userId"]+",\""+item['loginName']+"\")'><i class='fa fa-search'></i>查看</a>");
            return html.join('');
        }}
    ];

    mmg = $('.mmg').mmGrid({height: h-83,indexCol: true, cols: cols,method:'POST',nowrap:true,
        url: WST.AU('wstim://shops/getDialogs'), fullWidthRows: true, autoLoad: false,
        plugins: [
            $('#pg').mmPaginator({})
        ]
    });
    loadGrid(p);
}

function loadGrid(p){
    var params = {};
    params = WST.getParams('.s-query');
    p=(p<=1)?1:p;
    params.page=p;
    mmg.load(params);
}

function view(id,uname){
    var tips = WST.load({msg:'正在获取数据，请稍后...'});
	$.post(WST.AU('wstim://dialogcontents/index'),{id:id,uname:uname},function(data,textStatus){
		layer.close(tips);
		WST.open({
		    type: 1,
		    title:['会话详情（'+uname+'）', 'background-color:#e23e3d;color:#fff;'],
		    shade: [0.6, '#000'],
		    border: [0],
		    content: data,
		    area: [(WST.pageWidth()*0.9)+'px', (WST.pageHeight()*0.9)+'0px'],
            offset: '10px',
		    fixed:true,
		});
	});
}

