<?php
namespace wstmart\shop\model;
use wstmart\common\model\Goods as CGoods;
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
 * 商品类
 */
class Goods extends CGoods{
     /**
      *  上架商品列表
      */
	public function saleByPage(){
		$shopId = (int)session('WST_USER.shopId');
		$where = [];
		$where[] = ['shopId',"=",$shopId];
		$where[] = ['goodsStatus',"=",1];
		$where[] = ['dataFlag',"=",1];
		$where[] = ['isSale',"=",1];
		$goodsType = input('goodsType');
		if($goodsType!='')$where[] = ['goodsType',"=",(int)$goodsType];
		$c1Id = (int)input('cat1');
		$c2Id = (int)input('cat2');
		$goodsName = input('goodsName');
		if($goodsName != ''){
			$where[] = ['goodsName','like',"%$goodsName%"];
		}
		if($c2Id!=0 && $c1Id!=0){
			$where[] = ['shopCatId2',"=",$c2Id];
		}else if($c1Id!=0){
			$where[] = ['shopCatId1',"=",$c1Id];
		}
		$shopId = (int)session('WST_USER.shopId');
		$where[] = ['shopId',"=",$shopId];
		$rs = $this->where($where)
			->field('goodsId,goodsName,goodsImg,goodsType,goodsSn,isSale,isBest,isHot,isNew,isRecom,goodsStock,saleNum,shopPrice,isSpec')
			->order('saleTime', 'desc')
			->paginate(input('limit/d'))->toArray();
		foreach ($rs['data'] as $key => $v){
			$rs['data'][$key]['verfiycode'] = WSTShopEncrypt($shopId);
		}
		return $rs;
	}
	/**
	 * 审核中的商品
	 */
    public function auditByPage(){
    	$shopId = (int)session('WST_USER.shopId');
    	$where = [];
        $where[] = ['shopId',"=",$shopId];
        $where[] = ['goodsStatus',"=",0];
        $where[] = ['dataFlag',"=",1];
        $where[] = ['isSale',"=",1];
		$goodsType = input('goodsType');
		if($goodsType!='')$where[] = ['goodsType',"=",(int)$goodsType];
		$c1Id = (int)input('cat1');
		$c2Id = (int)input('cat2');
		$goodsName = input('goodsName');
		if($goodsName != ''){
			$where[] = ['goodsName','like',"%$goodsName%"];
		}
		if($c2Id!=0 && $c1Id!=0){
			$where[] = ['shopCatId2',"=",$c2Id];
		}else if($c1Id!=0){
			$where[] = ['shopCatId1',"=",$c1Id];
		}

		$rs = $this->where($where)
			->field('goodsId,goodsName,goodsImg,goodsType,goodsSn,isSale,isBest,isHot,isNew,isRecom,goodsStock,saleNum,shopPrice,isSpec')
			->order('saleTime', 'desc')
			->paginate(input('limit/d'))->toArray();
        foreach ($rs['data'] as $key => $v){
			$rs['data'][$key]['verfiycode'] =  WSTShopEncrypt($shopId);
		}
		return $rs;
	}
	/**
	 * 仓库中的商品
	 */
    public function storeByPage(){
    	$shopId = (int)session('WST_USER.shopId');
    	$where = [];
    	$where[]=['shopId',"=",$shopId];
		$where[] = ['dataFlag',"=",1];
		$where[] = ['isSale',"=",0];
		$goodsType = input('goodsType');
		if($goodsType!='')$where[] = ['goodsType',"=",(int)$goodsType];
		$c1Id = (int)input('cat1');
		$c2Id = (int)input('cat2');
		$goodsName = input('goodsName');
		if($goodsName != ''){
			$where[] = ['goodsName','like',"%$goodsName%"];
		}
		if($c2Id!=0 && $c1Id!=0){
			$where[] = ['shopCatId2',"=",$c2Id];
		}else if($c1Id!=0){
			$where[] = ['shopCatId1',"=",$c1Id];
		}
		$rs = $this->where($where)
		    ->where('goodsStatus','<>',-1)
			->field('goodsId,goodsName,goodsImg,goodsType,goodsSn,isSale,isBest,isHot,isNew,isRecom,goodsStock,saleNum,shopPrice,isSpec')
			->order('saleTime', 'desc')
			->paginate(input('limit/d'))->toArray();
        foreach ($rs['data'] as $key => $v){
			$rs['data'][$key]['verfiycode'] =  WSTShopEncrypt($shopId);
		}
		return $rs;
	}
	/**
	 * 违规的商品
	 */
	public function illegalByPage(){
		$shopId = (int)session('WST_USER.shopId');
		$where = [];
		$where[] = ['shopId',"=",$shopId];
		$where[] = ['goodsStatus',"=",-1];
		$where[] = ['dataFlag',"=",1];
		$goodsType = input('goodsType');
		if($goodsType!='')$where['goodsType'] = (int)$goodsType;
		$c1Id = (int)input('cat1');
		$c2Id = (int)input('cat2');
		$goodsName = input('goodsName');
		if($goodsName != ''){
			$where[] = ['goodsName','like',"%$goodsName%"];
		}
		if($c2Id!=0 && $c1Id!=0){
			$where[] = ['shopCatId2',"=",$c2Id];
		}else if($c1Id!=0){
			$where[] = ['shopCatId1',"=",$c1Id];
		}

		$rs = $this->where($where)
			->field('goodsId,goodsName,goodsImg,goodsType,goodsSn,isSale,isBest,isHot,isNew,isRecom,illegalRemarks,goodsStock,saleNum,shopPrice,isSpec')
			->order('saleTime', 'desc')
			->paginate(input('limit/d'))->toArray();
		foreach ($rs['data'] as $key => $v){
			$rs['data'][$key]['verfiycode'] = WSTShopEncrypt($shopId);
		}
		return $rs;
	}

	/**
	 * 删除商品
	 */
	public function del(){
	    $id = input('post.id/d');
		$data = [];
		$data['dataFlag'] = -1;
		Db::startTrans();
		try{
		    $result = $this->update($data,['goodsId'=>$id]);
	        if(false !== $result){
	        	WSTUnuseImage('goods','goodsImg',$id);
	        	WSTUnuseImage('goods','gallery',$id);
	        	// 商品描述图片
	        	$desc = $this->where('goodsId',$id)->value('goodsDesc');
				WSTEditorImageRocord(0, $id, $desc,'');
				model('common/carts')->delCartByUpdate($id);
				hook('afterChangeGoodsStatus',['goodsId'=>$id]);
				Db::commit();
				WSTClearAllCache();
	        	//标记删除购物车
	        	return WSTReturn("删除成功", 1);
	        }
		}catch (\Exception $e) {
            Db::rollback();
        }
        return WSTReturn('删除失败',-1);
	}
	/**
	  * 批量删除商品
	  */
	 public function batchDel(){
	 	$shopId = (int)session('WST_USER.shopId');
	   	$ids = input('post.ids/a');
	   	Db::startTrans();
		try{
		   	$rs = $this->where([['goodsId','in',$ids],['shopId','=',$shopId]])->setField('dataFlag',-1);
			if(false !== $rs){
				//标记删除购物车
				foreach ($ids as $v){
					WSTUnuseImage('goods','goodsImg',(int)$v);
	        	    WSTUnuseImage('goods','gallery',(int)$v);
	        	    // 商品描述图片
		        	$desc = $this->where('goodsId',(int)$v)->value('goodsDesc');
					WSTEditorImageRocord(0, (int)$v, $desc,'');
					model('common/carts')->delCartByUpdate((int)$v);
					hook('afterChangeGoodsStatus',['goodsId'=>(int)$v]);
				}
				Db::commit();
				WSTClearAllCache();
	        	return WSTReturn("删除成功", 1);
	        }
		}catch (\Exception $e) {
            Db::rollback();
        }
        return WSTReturn('删除失败',-1);
	 }

	/**
	 * 批量上架商品
	 */
	public function changeSale(){
		$ids = input('post.ids/a');
		$isSale = (int)input('post.isSale',1);
		$shopId = (int)session('WST_USER.shopId');
		//判断商品是否满足上架要求
		if($isSale==1){
			//0.核对店铺状态
	 		$shopRs = model('shops')->find($shopId);
	 		if($shopRs['shopStatus']!=1 || $shopRs['dataFlag']==-1){
	 			return 	WSTReturn('上架商品失败!您的店铺权限不能出售商品，如有疑问请与商城管理员联系。',-3);
	 		}
	 		//直接设置上架 返回受影响条数
	 		$where = [];
	 		$where[] = ['g.goodsId','in',$ids];
	 		$where[] = ['gc.dataFlag','=',1];
	 		$where[] = ['g.shopId','=',$shopId];
	 		$where[] = ['gc.isShow','=',1];
	 		$where[] = ['g.goodsImg','<>',''];
	 		$data = [];
	 		$data['isSale'] = 1;
			if(WSTConf("CONF.isGoodsVerify")==1){
				$data['goodsStatus'] = 0;
			}else{
				$data['goodsStatus'] = 1;
			}
			$rs = $this->alias('g')
				  ->join('__GOODS_CATS__ gc','g.goodsCatId=gc.CatId','inner')
				  ->where($where)->setField($data);
			if($rs!==false){
				//执行钩子事件
				foreach ($ids as $key => $gid) {
					hook('afterChangeGoodsStatus',['goodsId'=>$gid]);
			    }
				$status = ($rs==count($ids))?1:2;
				if($status==1){
					return WSTReturn('商品上架成功', 1,['num'=>$rs]);
				}else{
					return WSTReturn('已成功上架商品'.$rs.'件，请核对未能上架的商品信息是否完整。', 2,['num'=>$rs]);
				}
			}else{
	 			return WSTReturn('上架失败，请核对商品信息是否完整!', -2);
	 		}

		}else{
			$rs = $this->where([['goodsId','in',$ids],['shopId','=',$shopId]])->setField('isSale',0);
			if($rs !== false){
				//执行钩子事件
				foreach ($ids as $key => $gid) {
					hook('afterChangeGoodsStatus',['goodsId'=>$gid]);
			    }
				model('common/carts')->delCartByUpdate($ids);
				return WSTReturn('商品上架成功', 1);
			}else{
				return WSTReturn($this->getError(), -1);
			}
		}
	}
	/**
	* 修改商品状态
	*/
	public function changSaleStatus(){
		$shopId = (int)session('WST_USER.shopId');
		$allowArr = ['isHot','isNew','isBest','isRecom'];
		$is = input('post.is');
		if(!in_array($is,$allowArr))return WSTReturn('非法操作',-1);
		$status = (input('post.status',1)==1)?0:1;
		$id = (int)input('post.id');
		$rs = $this->where(["shopId"=>$shopId,'goodsId'=>$id])->setField($is,$status);
		if($rs!==false){
			return WSTReturn('设置成功',1);
		}else{
			return WSTReturn($this->getError(),-1);
		}
	}
	/**
	 * 批量修改商品状态
	 */
	public function changeGoodsStatus(){
		$shopId = (int)session('WST_USER.shopId');
		//设置为什么 hot new best rec
		$allowArr = ['isHot','isNew','isBest','isRecom'];
		$is = input('post.is');
		if(!in_array($is,$allowArr))return WSTReturn('非法操作',-1);
		//设置哪一个状态
		$status = input('post.status',1);
		$ids = input('post.ids/a');
		$rs = $this->where([['goodsId','in',$ids],['shopId','=',$shopId]])->setField($is, $status);
		if($rs!==false){
			return WSTReturn('设置成功',1);
		}else{
			return WSTReturn($this->getError(),-1);
		}

	}
	/**
	 * 获取商品规格属性
	 */
	public function getSpecAttrs(){
		$goodsType = (int)input('goodsType');
		$goodsCatId = Input('post.goodsCatId/d');
		$goodsCatIds = model('GoodsCats')->getParentIs($goodsCatId);
		$data = [];
		if($goodsType==0){
			$specs = Db::name('spec_cats')->where([['goodsCatId','in',$goodsCatIds],['isShow','=',1],['dataFlag','=',1]])->field('catId,catName,isAllowImg')->order('isAllowImg desc,catSort asc,catId asc')->select();
			$spec0 = null;
			$spec1 = [];
			foreach ($specs as $key => $v){
				if($v['isAllowImg']==1){
					$spec0 = $v;
				}else{
					$spec1[] = $v;
				}
			}
			$data['spec0'] = $spec0;
			$data['spec1'] = $spec1;
		}
		$data['attrs'] = Db::name('attributes')->where([['goodsCatId','in',$goodsCatIds],['isShow','=',1],['dataFlag','=',1]])->field('attrId,attrName,attrType,attrVal')->order('attrSort asc,attrId asc')->select();
	    return WSTReturn("", 1,$data);
	}
	/**
	 * 修改商品库存/价格
	 */
	public function editGoodsBase(){
		$goodsId = (int)Input("goodsId");
		$post = input('post.');
		$data = [];
		if(isset($post['goodsStock'])){
			$data['goodsStock'] = (int)input('post.goodsStock',0);
			if($data['goodsStock']<0)return WSTReturn('操作失败，库存不能为负数');
		}elseif(isset($post['shopPrice'])){
			$data['shopPrice'] = (float)input('post.shopPrice',0);
			if($data['shopPrice']<0.01)return WSTReturn('操作失败，价格必须大于0.01');
		}else{
			return WSTReturn('操作失败',-1);
		}
		$rs = $this->update($data,['goodsId'=>$goodsId,'shopId'=>(int)session('WST_USER.shopId')]);
		if($rs!==false){
			return WSTReturn('操作成功',1);
		}else{
			return WSTReturn('操作失败',-1);
		}
	}
	/**
	 *  预警库存列表
	 */
	public function stockByPage(){
		$where = [];
		$c1Id = (int)input('cat1');
		$c2Id = (int)input('cat2');
		$shopId = (int)session('WST_USER.shopId');
		if($c1Id!=0)$where[] = " shopCatId1=".$c1Id;
		if($c2Id!=0)$where[] = " shopCatId2=".$c2Id;
		$where[] = " g.shopId = ".$shopId;
		$prefix = config('database.prefix');
		$sql1 = 'SELECT g.goodsId,g.goodsName,g.goodsType,g.goodsImg,gs.specStock goodsStock ,gs.warnStock warnStock,g.isSpec,gs.productNo,gs.id,gs.specIds,g.isSale
                    FROM '.$prefix.'goods g inner JOIN '.$prefix.'goods_specs gs ON gs.goodsId=g.goodsId and gs.specStock <= gs.warnStock and gs.warnStock>0
                    WHERE g.dataFlag = 1 and '.implode(' and ',$where);

		$sql2 = 'SELECT g.goodsId,g.goodsName,g.goodsType,g.goodsImg,g.goodsStock,g.warnStock,g.isSpec,g.productNo,0 as id,"" as specIds,g.isSale
                    FROM '.$prefix.'goods g 
                    WHERE g.dataFlag = 1  and isSpec=0 and g.goodsStock<=g.warnStock 
                    and g.warnStock>0 and '.implode(' and ',$where);
		$page = (int)input('post.'.config('paginate.var_page'));
		$page = ($page<=0)?1:$page;
		$pageSize = 20;
		$start = ($page-1)*$pageSize;
		$sql = $sql1." union ".$sql2;
		$sqlNum = 'select count(*) wstNum from ('.$sql.") as c";
		$sql = 'select * from ('.$sql.') as c order by isSale desc limit '.$start.','.$pageSize;
		$rsNum = Db::query($sqlNum);
		$rsdata = Db::query($sql);
		$rs = WSTPager((int)$rsNum[0]['wstNum'],$rsdata,$page,$pageSize);
		if(empty($rs['data']))return $rs;
		$specIds = [];
		foreach ($rs['data'] as $key =>$v){
			$specIds[$key] = explode(':',$v['specIds']);
			$rss = Db::name('spec_items')->alias('si')
			->join('__SPEC_CATS__ sc','sc.catId=si.catId','left')
			->where('si.shopId = '.$shopId.' and si.goodsId = '.$v['goodsId'])
			->where([['si.itemId','in',$specIds[$key]]])
			->field('si.itemId,si.itemName,sc.catId,sc.catName')
			->select();
			$rs['data'][$key]['spec'] = $rss;
		}
		return $rs;
	}
	/**
	 *  预警修改预警库存
	 */
	public function editwarnStock(){
		$id = input('post.id/d');
		$type = input('post.type/d');
		$number = (int)input('post.number');
		$shopId = (int)session('WST_USER.shopId');
		$data = $data2 = [];
		$data['shopId'] =  $data2['shopId'] = $shopId;
		$datat=array('1'=>'specStock','2'=>'warnStock','3'=>'goodsStock','4'=>'warnStock');
		if(!empty($type)){
			$data[$datat[$type]] = $number;
			if($type==1 || $type==2){
				$data['goodsId'] = $goodsId = input('post.goodsId/d');
				$rss = Db::name("goods_specs")->where('id', $id)->update($data);
				//更新商品库存
				$goodsStock = 0;
				if($rss!==false){
					$specStocks = Db::name("goods_specs")->where(['shopId'=>$shopId,'goodsId'=>$goodsId,'dataFlag'=>1])->field('specStock')->select();
					foreach ($specStocks as $key =>$v){
						$goodsStock = $goodsStock+$v['specStock'];
					}
					$data2['goodsStock'] = $goodsStock;
					$rs = $this->update($data2,['goodsId'=>$goodsId]);
				}else{
					return WSTReturn('操作失败',-1);
				}
			}
			if($type==3 || $type==4){
				$rs = $this->update($data,['goodsId'=>$id]);
			}
			if($rs!==false){
				return WSTReturn('操作成功',1);
			}else{
				return WSTReturn('操作失败',-1);
			}
		}
		return WSTReturn('操作失败',-1);
	}
}
