<?php
namespace wstmart\shop\model;
/**
 * ============================================================================
 * WSTMart多用户商城
 * 版权所有 2016-2066 广州商淘信息科技有限公司，并保留所有权利。
 * 官网地址:http://www.wstmart.net
 * 交流社区:http://bbs.shangtao.net
 * 联系QQ:153289970
 * ----------------------------------------------------------------------------
 * 这不是一个自由软件！未经本公司授权您只能在不用于商业目的的前提下对程序代码进行修改和使用；
 * 不允许对程序代码以任何形式任何目的的再发布。
 * ============================================================================
 * 文章类
 */
use think\Db;
class Reports extends Base{

    /**
     * 获取商品销售排行
     */
    public function getTopSaleGoods($sId=0){
        $startDate=input('startDate');
        $endDate=input('endDate');
        if(empty($startDate)&&empty($endDate)){
            $start=date('Y-m-d 00:00:00',strtotime("-1 months"));
            $end=date('Y-m-d 23:59:59');
        }else{
            $start = date('Y-m-d 00:00:00',strtotime($startDate));
            $end = date('Y-m-d 23:59:59',strtotime($endDate));
        }
        $shopId = ($sId==0)?(int)session('WST_USER.shopId'):$sId;
        $prefix = config('database.prefix');
        $rs = Db::table($prefix.'order_goods')->alias([$prefix.'order_goods'=>'og',$prefix.'orders'=>'o',$prefix.'goods'=>'g'])
            ->join($prefix.'orders','og.orderId=o.orderId')
            ->join($prefix.'goods','og.goodsId=g.goodsId')
            ->order('goodsNum desc')
            ->whereTime('o.createTime','between',[$start,$end])
            ->where('(payType=0 or (payType=1 and isPay=1)) and o.dataFlag=1 and o.shopId='.$shopId)->group('og.goodsId')
            ->field('og.goodsId,g.goodsName,goodsSn,sum(og.goodsNum) goodsNum,g.goodsImg')
            ->paginate(input('limit/d'))->toArray();
        return $rs;
    }
}