<?php 
namespace addons\wstim\model;
use think\addons\BaseModel as Base;
use think\Db;
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
 * 会话记录处理
 */
class Dialogs extends Base{
	// 获取会话记录【商家端】
    public function getDialogs(){
    	$shopId = (int)session('WST_USER.shopId');
        $loginName = input('loginName');
        $startDate = input('startDate');
    	$endDate = input('endDate');
    	$where = [];
        if($loginName!='')$where[] = ['u.loginName','like',"%$loginName%"];
        if($startDate!='' && $endDate!=''){
            $where[] = ['d.createTime','between time',[$startDate,$endDate]];
        }elseif($startDate!=''){
            $where[] = ['d.createTime','> time',$startDate];
        }elseif($endDate!=''){
            $where[] = ['d.createTime','<= time',$endDate];
        }
    	$rs = $this->alias('d')
    			   ->field('u.loginName,u.userId,GROUP_CONCAT(d.id) dialogIds')
    			   ->join('__USERS__ u','d.userId=u.userId','inner')
    			   ->where(['d.shopId'=>$shopId])
    			   ->where($where)
    			   ->group('d.userId')
             ->order('d.createTime desc')
				   ->paginate(input('pagesize/d'))
				   ->toArray();
		foreach($rs['data'] as $k=>$v){
			$rs['data'][$k]['createTime'] = Db::name('dialog_contents')
											->whereIn('dialogId',$v['dialogIds'])
											->order('createTime desc')
											->value('createTime');
			unset($rs['data'][$k]['dialogIds']);
		}
		return $rs;
    }
    // 获取会话记录【平台端】
    public function pageQuery(){
        $loginName = input('loginName');
        $shopName = input('shopName');
        $startDate = input('startDate');
        $endDate = input('endDate');
        $where = [];
        if($loginName!=''){
            // 根据用户名查询
            $userIds = Db::name('users')->where([['loginName|userName','like',"%$loginName%"]])->column('userId');
            $where[] = ['userId','in',$userIds];
        }
        if($shopName!=''){
            // 根据商家名查询
            $shopIds = Db::name('shops')->where([['shopName','like',"%$shopName%"]])->column('shopId');
            $where[] = ['shopId','in',$shopIds];
        }
        if($startDate!='' && $endDate!=''){
            $where[] = ['d.createTime','between time',[$startDate,$endDate]];
        }elseif($startDate!=''){
            $where[] = ['d.createTime','> time',$startDate];
        }elseif($endDate!=''){
            $where[] = ['d.createTime','<= time',$endDate];
        }
        $shops = Db::name('shops')->where([['dataflag','=',1],['shopStatus','=',1]])
                                  ->cache(true)
                                  ->column('shopName','shopId');
        /*$rs = $this->field('GROUP_CONCAT(id) dialogIds,userId,shopId')
                   ->whereIn('shopId',array_keys($shops))
                   ->where($where)
                   ->group('shopId,userId')
                   ->paginate(input('pagesize/d'))
                   ->toArray();*/
        $rs = $this->field('GROUP_CONCAT(d.id) dialogIds,d.userId,d.shopId,dc.createTime')
                   ->alias('d')
                   ->join('__DIALOG_CONTENTS__ dc','dc.dialogId = d.id','inner')
                   ->whereIn('d.shopId',array_keys($shops))
                   ->where($where)
                   ->group('d.shopId,d.userId')
                   ->order('d.shopId,dc.createTime desc')
                   ->paginate(input('limit/d'))
                   ->toArray();
        foreach($rs['data'] as $k=>$v){
            $rs['data'][$k]['loginName'] = Db::name('users')
                                            ->where('userId',$v['userId'])
                                            ->value('loginName');
            $rs['data'][$k]['shopName'] = $shops[$v['shopId']];
            unset($rs['data'][$k]['dialogIds']);
        }
        return $rs;
        /*$rs = $this->alias('d')
                   ->field('u.loginName,u.userId,GROUP_CONCAT(d.id) dialogIds')
                   ->join('__USERS__ u','d.userId=u.userId','inner')
                   ->where(['d.shopId'=>$shopId])
                   ->where($where)
                   ->group('d.userId')
                   ->paginate(input('pagesize/d'))
                   ->toArray();
        foreach($rs['data'] as $k=>$v){
            $rs['data'][$k]['createTime'] = Db::name('dialog_contents')
                                            ->whereIn('dialogId',$v['dialogIds'])
                                            ->order('createTime desc')
                                            ->value('createTime');
            unset($rs['data'][$k]['dialogIds']);
        }
        return $rs;*/
    }
}