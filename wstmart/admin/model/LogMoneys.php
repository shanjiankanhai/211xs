<?php
namespace wstmart\admin\model;
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
 * 资金流水日志业务处理
 */
class LogMoneys extends Base{
	/**
	 * 用户资金列表 
	 */
	public function pageQueryByUser(){
		$key = input('key');
		// 排序
		$sort = input('sort');
		$order = [];
		if($sort!=''){
			$sortArr = explode('.',$sort);
			$order[$sortArr[0]] = $sortArr[1];
		}
		$where[] = ['dataFlag','=',1];
        $where[] = ['loginName','like','%'.$key.'%'];
		return model('users')->where($where)->field('loginName,userId,userName,userMoney,rechargeMoney,lockMoney')->order($order)->paginate(input('limit/d'));
	}
	/**
	 * 商家资金列表 
	 */
	public function pageQueryByShop(){
		$key = input('key');
		$where[] = ['u.dataFlag','=',1];
		$where[] = ['s.dataFlag','=',1];
        $where[] = ['loginName','like','%'.$key.'%'];
		return Db::name('shops')->alias('s')->join('__USERS__ u','s.userId=u.userId','inner')->where($where)->field('loginName,shopId,shopName,shopMoney,s.rechargeMoney,s.lockMoney')->paginate(input('limit/d'));
	}

	/**
	 * 获取用户信息
	 */
	public function getUserInfoByType(){
		$type = (int)input('type',0);
		$id = (int)input('id');
		$data = [];
        if($type==1){
            $data = Db::name('shops')->alias('s')->join('__USERS__ u','s.userId=u.userId','inner')->where('shopId',$id)->field('shopId as userId,shopName as userName,loginName,1 as userType')->find();
        }else{
            $data = model('users')->where('userId',$id)->field('loginName,userId,userName,0 as userType')->find();
        }
        return $data;
	}

    /**
	 * 分页
	 */
	public function pageQuery(){
		$key = input('key');
		$userType = input('type');
		$userId = input('id');
		$startDate = input('startDate');
		$endDate = input('endDate');
		$where = [];
		if($startDate!='')$where[] = ['l.createTime','>=',$startDate." 00:00:00"];
		if($endDate!='')$where[] = [' l.createTime','<=',$endDate." 23:59:59"];
		if($userType!='')$where[] = ['l.targetType','=',$userType];
		if($userId!='')$where[] = ['l.targetId','=',$userId];
		if($key!='')$where[] = ['u.loginName','like','%'.$key.'%'];
		$page = $this->alias('l')
					 ->join('__USERS__ u','l.targetId=u.userId and l.targetType=0 ','left')
					 ->join('__SHOPS__ s','l.targetId=s.shopId and l.targetType=1 ','left')
					 ->where($where)->field('l.*,u.loginName,s.shopName')->order('l.id', 'desc')
					 ->paginate(input('l.limit/d'))->toArray();
		if(count($page['data'])>0){
			foreach ($page['data'] as $key => $v) {
				$page['data'][$key]['loginName'] = ($v['targetType']==1)?$v['shopName']:$v['loginName'];
				$page['data'][$key]['dataSrc'] = WSTLangMoneySrc($v['dataSrc']);
			}
		}
		return $page;
	}

	/**
     * 新增记录
     */
    public function add($log){
          $log['createTime'] = date('Y-m-d H:i:s');
          $this->create($log);
          if($log['moneyType']==1){
              if($log['targetType']==1){
	      	      Db::name('shops')->where(["shopId"=>$log['targetId']])->setInc('shopMoney',$log['money']);
		      }else{
		      	  Db::name('users')->where(["userId"=>$log['targetId']])->setInc('userMoney',$log['money']);
		      }
          }else{
              if($log['targetType']==1){
	      	      Db::name('shops')->where(["shopId"=>$log['targetId']])->setDec('shopMoney',$log['money']);
		      }else{
		      	  Db::name('users')->where(["userId"=>$log['targetId']])->setDec('userMoney',$log['money']);
		      }
          }
      }
}
