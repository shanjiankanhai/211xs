<?php
namespace wstmart\home\controller;
use wstmart\common\model\Orders as OM;
use wstmart\common\model\Users as UM;
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
 * 余额控制器
 */
class Wallets extends Base{
	/**
	 * 生成支付代码
	 */
	function getWalletsUrl(){
		$orderNo = input('orderNo');
		$isBatch = (int)input('isBatch');
		$base64 = new \org\Base64();
        $key = WSTBase64url($base64->encrypt($orderNo."_".$isBatch, "WSTMart"),true);
        $data = [];
        $data['status'] = 1;
        $data['url'] = url('home/wallets/payment','key='.$key,'html',true);
		return $data;
	}
	
	/**
	 * 跳去支付页面
	 */
	public function payment(){
		if((int)session('WST_USER.userId')==0){
			$this->assign('message',"对不起，您尚未登录，请先登录!");
            return $this->fetch('error_msg');
		}
		$userId = (int)session('WST_USER.userId');
		$m = new UM();
		$user = $m->getFieldsById($userId,["payPwd"]);
		$this->assign('hasPayPwd',($user['payPwd']!="")?1:0);
		$key = input('key');
		$this->assign('paykey',$key);
        $key = WSTBase64url($key,false);
        $base64 = new \org\Base64();
        $key = $base64->decrypt($key,"WSTMart");
        $key = explode('_',$key);
        $data = [];
        $data['orderNo'] = $key[0];
        $data['isBatch'] = (int)$key[1];
        $data['userId'] = $userId;
		$m = new OM();
		$rs = $m->getOrderPayInfo($data);
		if(empty($rs)){
			$this->assign('message',"您的订单已支付，请勿重复支付~");
            return $this->fetch('error_msg');
		}else{
			$this->assign('needPay',$rs['needPay']);
			//获取用户钱包
			$user = model('users')->getFieldsById($data['userId'],'userMoney');
			$this->assign('userMoney',$user['userMoney']);
	        return $this->fetch('order_pay_wallets');
	    }
	}

	/**
	 * 钱包支付
	 */
	public function payByWallet(){
		$m = new OM();
        return $m->payByWallet();
	}

}
