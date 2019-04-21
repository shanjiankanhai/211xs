<?php 
namespace addons\wstim\model;
use think\addons\BaseModel as Base;
use think\Db;
class Chats extends Base{
	/**
	 * 安装
	 */
	public function install(){
		Db::startTrans();
		try{
			$hooks = ["homeDocumentContact","afterUserLogin","homeDocumentListener",
				      "mobileDocumentContact","mobileDocumentBottomNav",
				      "wechatDocumentContact","wechatDocumentBottomNav",
				      "adminDocumentSysConfig",
				      "adminAfterConfigAddon",
					 ];
			$this->bindHoods("Wstim", $hooks);

			//管理员后台
			$rs = Db::name('menus')->insert(["parentId"=>2,
											 "menuName"=>"聊天记录",
											 "menuSort"=>1,
											 "dataFlag"=>1,
											 "isShow"=>1,
											 "menuMark"=>"wstim"]);
			if($rs!==false){
				$datas = [];
				$parentId = Db::name('menus')->getLastInsID();
				$datas[] = ["menuId"=>$parentId,
							"privilegeCode"=>"WSTIM_00",
							"privilegeName"=>"查看聊天记录",
							"isMenuPrivilege"=>1,
							"privilegeUrl"=>"/addon/wstim-dialogs-adminDialogList",
							"otherPrivilegeUrl"=>"/addon/wstim-dialogs-pagequery,/addon/wstim-dialogcontents-adminIndex",
							"dataFlag"=>1,
							"isEnable"=>1];
				Db::name('privileges')->insertAll($datas);
			}
			installSql("wstim");//传入插件名
			Db::commit();
			return true;
		}catch (\Exception $e) {
	 		Db::rollback();
	  		return false;
	   	}
	}
	/**
	 * 卸载
	 */
	public function uninstall(){
		Db::startTrans();
		try{
			$hooks = ["homeDocumentContact","afterUserLogin","homeDocumentListener",
				      "mobileDocumentContact","mobileDocumentBottomNav",
				      "wechatDocumentContact","wechatDocumentBottomNav",
				      "adminDocumentSysConfig",
				      "adminAfterConfigAddon",
					 ];
			$this->unbindHoods("Wstim", $hooks);
			Db::name('menus')->where(["menuMark"=>"wstim"])->delete();
			Db::name('privileges')->where("privilegeCode","like","WSTIM_%")->delete();

			uninstallSql("wstim");//传入插件名
			Db::commit();
			return true;
		}catch (\Exception $e) {
	 		Db::rollback();
	  		return false;
	   	}
	}

	/**
	 * 菜单显示隐藏
	 */
	public function toggleShow($isShow = 1){
		Db::startTrans();
		try{
			Db::name('menus')->where(["menuMark"=>"wstim"])->update(["isShow"=>$isShow]);
			Db::commit();
			return true;
		}catch (\Exception $e) {
	 		Db::rollback();
	  		return false;
	   	}
	}
	/**
	* 获取商品信息
	*/
	public function getGoodsInfo(){
		$goodsId = (int)input('goodsId');
		$shopId = (int)input('shopId');
		return Db::name('goods')->field('goodsId,goodsName,shopPrice,goodsImg')
								->where(['goodsId'=>$goodsId,'shopId'=>$shopId])
								->find();
	}
	/**
    * 获取用户信息
    */
    public function getUserInfo(){
    	$userId = (int)input('userId');
        $m = model('common/users');
        $rs = $m->getFieldsById($userId,['loginName','userName',
        								 'userPhone','userPhoto',
        								 'userTotalScore','userQQ']);
    	$rrs = Db::name('user_ranks')->where(['dataFlag'=>1])
    								 ->where('startScore','<=',$rs['userTotalScore'])
    								 ->where('endScore','>=',$rs['userTotalScore'])
    								 ->field('rankName')
    								 ->find();
	    $rs['rankName'] = $rrs['rankName'];
	    return $rs;
    }
	/**
	* 查询与店铺相关的浏览记录
	*/
	public function getHistory($wap=0){
		$ids = ($wap==1)?cookie("wx_history_goods"):cookie("history_goods");
		if(empty($ids))return [];
	    $where = [];
	    $where['isSale'] = 1;
	    $where['goodsStatus'] = 1; 
	    $where['dataFlag'] = 1; 
	    $where['shopId'] = (int)input('shopId');
	    $orderBy = "field(`goodsId`,".implode(',',$ids).")";
        $goods = Db::name('goods')
                   ->where($where)
                   ->whereIn('goodsId',$ids)
                   ->field('goodsId,goodsName,goodsImg,shopPrice,isSpec')
                   ->orderRaw($orderBy)
                   ->select(); 
        $ids = [];
        foreach($goods as $key =>$v){
        	if($v['isSpec']==1)$ids[] = $v['goodsId'];
        }
        if(!empty($ids)){
        	$specs = [];
        	$rs = Db::name('goods_specs gs ')->where([['goodsId','in',$ids],['dataFlag','=','1']])->order('id asc')->select();
        	foreach ($rs as $key => $v){
        		$specs[$v['goodsId']] = $v;
        	}
        	foreach($goods as $key =>$v){
        		if(isset($specs[$v['goodsId']]))
        		$goods[$key]['specs'] = $specs[$v['goodsId']];
        	}
        }
        return $goods;
	}
	/**
	* 查询与店铺相关的订单列表
	*/
	public function getOrderList(){
		$shopId = (int)input('shopId');
		$userId = (int)session('WST_USER.userId');

		$where = ['o.userId'=>$userId,'o.dataFlag'=>1,'o.shopId'=>$shopId];
		$page = Db::name('orders')->alias('o')
								  ->join('__SHOPS__ s','o.shopId=s.shopId','left')
					              ->where($where)
					              ->field('o.orderId,o.orderNo,o.orderStatus,o.goodsMoney,o.totalMoney,o.realTotalMoney,o.createTime')
						          ->order('o.createTime', 'desc')
						          ->paginate(input('pagesize/d'))->toArray();
	    if(count($page['data'])>0){
	    	 $orderIds = [];
	    	 foreach ($page['data'] as $k=>$v){
	    	 	 $orderIds[] = $v['orderId'];
	    	 	 $page['data'][$k]['orderStatus'] = WSTLangOrderStatus($v['orderStatus']);
	    	 }
	    	 $goods = Db::name('order_goods')->where('orderId','in',$orderIds)->select();
	    	 $goodsMap = [];
	    	 foreach ($goods as $v){
	    	 	 $v['goodsSpecNames'] = str_replace('@@_@@','、',$v['goodsSpecNames']);
	    	 	 $goodsMap[$v['orderId']][] = $v;
	    	 }
	    	 foreach ($page['data'] as $key => $v){
	    	 	 $page['data'][$key]['list'] = $goodsMap[$v['orderId']];
	    	 	 $page['data'][$key]['createTime'] = date('Y-m-d H:i',strtotime($v['createTime']));
	    	 }
	    }
	    return $page;
	}
	/**
	* 查询聊天记录
	*/
	public function pageQuery($receiveId){
		$userId = (int)session('WST_USER.userId');
		// 根据receiveId及店铺id查找dialogId
		$dialogId = Db::name('dialogs')->where(['userId'=>$userId,'shopId'=>$receiveId])
									   ->column('id');
		$rs = Db::name('dialog_contents')->where([['dialogId','in',$dialogId]])
										 ->order('createTime desc')
										 ->paginate(input('pagesize/d'))
										 ->toArray();
		// 反序列化
		foreach($rs['data'] as $k=>$v){
			$content = unserialize($v['content']);
			$rs['data'][$k]['content'] = $content['content'];
			$rs['data'][$k]['from'] = $content['from'];
			$rs['data'][$k]['userName'] = Db::name('users')->where(['userId'=>$content['from']])->value('userName');
		}
		if(!empty($rs['data']))usort($rs['data'], "createTimeAscSort");
		return $rs;
	}
	/**
    * 设置为已读【用户】
    */
    public function setRead(){
    	$userId = (int)session('WST_USER.userId');
    	$shopId = (int)input('shopId');
        $dialogIds = Db::name('dialogs')->where(['userId'=>$userId,'shopId'=>$shopId])->column('id');
        $msgIds = [];
        if(!empty($dialogIds)){
        	$unReadArr = Db::name('dialog_contents')
        				 ->field('content,id')
        				 ->where([['dialogId','in',$dialogIds],['isRead','=','0']])
        				 ->select();
	        foreach($unReadArr as $v){
	          $content = unserialize($v['content']);
	          if($content['from']!=$userId)array_push($msgIds, $v['id']);
	        }
      	}
		if(!empty($msgIds)){
			Db::name('dialog_contents')->where([['id','in',$msgIds]])->setField('isRead',1);
		}
		return WSTReturn('ok',1);
    }
	/******************************************************* 店铺 **********************************************************************/
    public function setReadForService(){
    	// 发送者
        $userId = (int)input('from');
        // 接收者
        $serviceId = (int)session('WST_USER.userId');
        $shopId = Db::name('shop_services')->where("userId={$serviceId}")->value('shopId');
        $dialogIds = Db::name('dialogs')->where(['userId'=>$userId,'shopId'=>$shopId])->column('id');
        $msgIds = [];
        if(!empty($dialogIds)){
        	$unReadArr = Db::name('dialog_contents')
        				 ->field('content,id')
        				 ->where([['dialogId','in',$dialogIds],['isRead','=','0']])
        				 ->select();
	        foreach($unReadArr as $v){
	          $content = unserialize($v['content']);
	          if($content['from']==$userId)array_push($msgIds, $v['id']);
	        }
      	}
		if(!empty($msgIds)){
			Db::name('dialog_contents')->where([['id','in',$msgIds]])->setField('isRead',1);
		}
		return WSTReturn('ok',1);
    }
	/**
	* 查询聊天记录【店铺】
	*/
	public function shopPageQuery($receiveId){
		$userId = (int)session('WST_USER.userId');
		$shopId = Db::name('shop_services')->where("userId={$userId}")->value('shopId');
		// 根据receiveId及店铺id查找dialogId
		$dialogId = Db::name('dialogs')->where(['userId'=>$receiveId,'shopId'=>$shopId])
									   ->column('id');
		$rs = Db::name('dialog_contents')->where([['dialogId','in',$dialogId]])
										 ->order('createTime desc')
										 ->paginate(input('pagesize/d'))
										 ->toArray();
		// 反序列化
		foreach($rs['data'] as $k=>$v){
			$content = unserialize($v['content']);
			$rs['data'][$k]['content'] = $content['content'];
			$rs['data'][$k]['from'] = $content['from'];
			$rs['data'][$k]['userName'] = Db::name('users')->where(['userId'=>$content['from']])->value('userName');
		}
		if(!empty($rs['data']))usort($rs['data'], "createTimeAscSort");
		return $rs;
	}
	/**
	* 查询最近会话
	*/
	public function getRecent(){
		$receiveId = (int)session('WST_USER.userId');
		// 1.获取与用户联系过的所有店铺id
		//	(1).先获取会话id
		$dialogIdArrs = Db::name('dialogs')->where(['userId'=>$receiveId])
										->group('shopId')
										->field('GROUP_CONCAT(id) id,shopId')
										->select();
		//  (2).根据会话id
		// 根据dialogId查询所有未读会话
		$result = [];
		$todayStart = strtotime(date('Y-m-d'));
        $todayEnd = strtotime(date('Y-m-d 23:59:59'));
		foreach($dialogIdArrs as $k=>$v){
			$dialogIds = $v['id'];
			$shopId = $v['shopId'];
			$unReadArr = Db::name('dialog_contents')->field('content,dialogId')
													->where([['dialogId','in',$dialogIds],['isRead','=','0']])
													->select();
			// 统计未读消息数
	        $unReadNum = 0;
	        foreach($unReadArr as $v){
	          $content = unserialize($v['content']);
	          if($content['from']!=$receiveId){// 将用户发送给客服的未读消息排除
		          ++$unReadNum;
	          }
	        }
	        // 取店铺信息及最后一条聊天内容
	        $shopInfo = Db::name('shops')->field('shopName,shopImg,shopId')
	        							 ->find(['shopId'=>$shopId]);
	        $shopInfo['unReadNum'] = $unReadNum;
	        $dialog_content = Db::name('dialog_contents')->field('content,createTime')
	        											 ->where([['dialogId','in',$dialogIds]])
	        											 ->order('createTime','desc')
	        											 ->find();
	        // 处理时间 时间格式：若为今天则显示时:分:秒，否则显示 月:日
			$cTime = strtotime($dialog_content['createTime']);
			$dialog_content['createTime'] = ($todayEnd>=$cTime && $todayStart<$cTime )?date('H:i',$cTime):date('Y-m-d',$cTime);
	        $dialog_content['content'] = unserialize($dialog_content['content']);
	        $_content = htmlspecialchars_decode($dialog_content['content']['content']);
	        $flag = self::is_not_json($_content);
	        if($flag){
	        	$_json = json_decode($_content,true);
	        	switch ($_json['type']) {
	        		case 'image':
	        			$dialog_content['content']['content'] = '[图片]';
	        			break;
	        		case 'goods':
	        			$dialog_content['content']['content'] = '[商品信息]';
	        			break;
	        		case 'orders':
	        			$dialog_content['content']['content'] = '[订单信息]';
	        			break;
	        	}
	        }
	        $result[$k] = array_merge($shopInfo,$dialog_content);
		}
		usort($result, "createTimeDescSort");
		return $result;
	}
	private function is_not_json($str){
	   return is_array(json_decode($str,true));
	}
	/**
	* 获取客服所属店铺id
	*/
	public function getShopId(){
		$userId = (int)session('WST_USER.userId');
		return Db::name('shop_services')->where(['userId'=>$userId])->value('shopId');
	}
	/**
    * 检测是否为客服
    */
    public function isService(){
    	$userId = (int)session('WST_USER.userId');
    	return Db::name('shop_services')->where(['userId'=>$userId,'dataFlag'=>1])->find();
    }
	/******************************************************* 店铺 **********************************************************************/
	/**
	 * 新增留言
	 */
	public function add(){
		$userId = (int)session('WST_USER.userId');
		$data =	input('param.');
		// 数据入库
		$dm = Db::name('dialogs');
		$dialogId = $dm->where(['userId'=>$userId,'shopId'=>$data['to'],'serviceId'=>0])->value('id');
		// 将会话记录写入会话表
		if(empty($dialogId)){
			$_data = [
		    	'userId'=>$userId,
		    	'shopId'=>$data['to'],
		    	'serviceId'=>0,
		    	'createTime'=>date('Y-m-d H:i:s')
		    ];
			$dialogId = Db::name('dialogs')->insert($_data,false,true);
		}
		if($dialogId){
			$dcm = Db::name('dialog_contents');
			// 190118防止双引号被转义成 &quot;
			$data['content'] = strip_tags(htmlspecialchars_decode($data['content']),"");

			$chat_content = serialize(["content"=>$data['content'],"from"=>"{$userId}"]);
			$_data = ['dialogId'=>"$dialogId",
				      'content'=>$chat_content,
				      'createTime'=>date('Y-m-d H:i:s')];
			$rs = $dcm->insert($_data);
			if($rs!==false)return WSTReturn('留言成功',1);
		}
		return WSTReturn('留言失败');
	}
	/**
	* 检测当前客服是否属于该店铺
	*/
	public function checkIsShopService($userId,$shopId){
		return Db::name('shop_services')->where("userId={$userId} AND shopId={$shopId}")->find();
	}
	/**
	 * 新增留言【服务器异常情况】
	 */
	public function sendOffLineMsg(){
		$serviceId = (int)session('WST_USER.userId');
		$data =	input('param.');
		// 数据入库
		$dm = Db::name('dialogs');
		$dialogId = $dm->where(['userId'=>$data['userId'],'shopId'=>$data['shopId'],'serviceId'=>$serviceId])->value('id');
		// 将会话记录写入会话表
		if(empty($dialogId)){
			$_data = [
		    	'userId'=>$data['userId'],
		    	'shopId'=>$data['shopId'],
		    	'serviceId'=>$serviceId,
		    	'createTime'=>date('Y-m-d H:i:s')
		    ];
			$dialogId = $dm->insert($_data,false,true);
		}
		if($dialogId){
			$dcm = Db::name('dialog_contents');
			$chat_content = serialize(["content"=>$data['content'],"from"=>$serviceId,"to"=>"{$data['userId']}"]);
			$_data = ['dialogId'=>"$dialogId",
				      'content'=>"$chat_content",
				      'createTime'=>date('Y-m-d H:i:s')];
			$rs = $dcm->insert($_data);
			if($rs!==false)return WSTReturn('留言成功',1);
		}
		return WSTReturn('留言失败');
	}
	/**
	* 获取商城消息数及摘要
	*/
	public function getSysMsg(){
		$userId = (int)session('WST_USER.userId');
		$rs = Db::name('messages')
		      ->field('*,count(*) as count')
		      ->where(['receiveUserId'=>$userId,
			 		  'dataFlag'=>1])
		      ->order('createTime desc')
		      ->find();
		$rs['count'] = Db::name('messages')
				      ->where(['receiveUserId'=>$userId,
				      		  'msgStatus'=>0,
					 		  'dataFlag'=>1])
				      ->count();
		if(!empty($rs['createTime'])){
			$todayStart = strtotime(date('Y-m-d'));
        	$todayEnd = strtotime(date('Y-m-d 23:59:59'));
        	$cTime = strtotime($rs['createTime']);
			$rs['createTime'] = ($todayEnd>=$cTime && $todayStart<$cTime )?date('H:i',$cTime):date('Y-m-d',$cTime);
		}
		return $rs;
	}


}