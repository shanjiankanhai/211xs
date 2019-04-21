function loadStat(){
    var h = WST.pageHeight();
    var cols = [
        {title:'商品', name:'goodsName', width: 300},
        {title:'商品编号', name:'goodsSn', width: 200},
        {title:'销量', name:'goodsNum', width: 30},
    ];

    mmg = $('.mmg').mmGrid({height: h-85,indexCol: true, cols: cols,method:'POST',
        url: WST.U('shop/reports/getTopSaleGoods'), fullWidthRows: true, autoLoad: true,
        plugins: [
            $('#pg').mmPaginator({})
        ]
    });
}
function loadGrid(){
    mmg.load({startDate:$('#startDate').val(),endDate:$('#endDate').val(),page:1});
}