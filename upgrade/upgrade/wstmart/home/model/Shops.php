<?php
namespace wstmart\home\model;
use wstmart\common\model\Shops as CShops;
use wstmart\home\validate\Shops as VShop;
use think\Db;
use think\Loader;
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
 * 门店类
 */
class Shops extends CShops{
    /**
     * 店铺街列表
     */
    public function pageQuery($pagesize){
    	$catId = input("get.id/d");
    	$keyword = input("keyword");
        $location = WSTIpLocation();
    	$userId = (int)session('WST_USER.userId');
    	$rs = $this->alias('s');
    	$where = [];
    	$where[] = ['s.dataFlag','=',1];
        $where[] = ['s.shopStatus','=',1];
    	$where[] = ['s.applyStatus','=',2];
    	if($keyword!='')$where[] = ['s.shopName','like','%'.$keyword.'%'];
    	if($catId>0){
    		$rs->join('__CAT_SHOPS__ cs','cs.shopId = s.shopId','left');
    		$where[] = ['cs.catId','=',$catId];
    	}
    	$page = $rs->join('__SHOP_SCORES__ ss','ss.shopId = s.shopId','left')
    	->join('__USERS__ u','u.userId = s.userId','left')
    	->join('__FAVORITES__ f','f.userId = '.$userId.' and f.favoriteType=1 and f.targetId=s.shopId','left')
    	->where($where)
    	->order('distince asc')
    	->field('s.shopId,s.shopImg,s.shopName,s.longitude,s.latitude,s.shopTel,s.shopQQ,s.shopWangWang,s.shopCompany,ss.totalScore,ss.totalUsers,ss.goodsScore,ss.goodsUsers,ss.serviceScore,ss.serviceUsers,ss.timeScore,ss.timeUsers,.u.loginName,u.userName,f.favoriteId,s.areaIdPath')
        ->field("round(6378.138*2*asin(sqrt(pow(sin( (".$location['latitude']."*pi()/180-s.latitude*pi()/180)/2),2)+cos(".$location['latitude']."*pi()/180)*cos(s.latitude*pi()/180)* pow(sin( (".$location['longitude']."*pi()/180-s.longitude*pi()/180)/2),2)))*1000)/1000 as distince")
        ->paginate($pagesize)->toArray();
    	if(empty($page['data']))return $page;
    	$shopIds = [];
    	$areaIds = [];
    	foreach ($page['data'] as $key =>$v){
    		$shopIds[] = $v['shopId'];
    		$tmp = explode('_',$v['areaIdPath']);
    		$areaIds[] = $tmp[1];
    		$page['data'][$key]['areaId'] = $tmp[1];
    		//总评分
    		$page['data'][$key]['totalScore'] = WSTScore($v["totalScore"], $v["totalUsers"]);
    		$page['data'][$key]['goodsScore'] = WSTScore($v['goodsScore'],$v['goodsUsers']);
    		$page['data'][$key]['serviceScore'] = WSTScore($v['serviceScore'],$v['serviceUsers']);
    		$page['data'][$key]['timeScore'] = WSTScore($v['timeScore'],$v['timeUsers']);
    		//商品列表
    		$goods = Db::name('goods')->where(['dataFlag'=> 1,'goodsStatus'=>1,'isSale'=>1,'shopId'=> $v["shopId"]])->field('goodsId,goodsName,shopPrice,goodsImg')->limit(10)->order('saleTime desc')->select();
    		$page['data'][$key]['goods'] = $goods;
    		//店铺商品总数
    		$page['data'][$key]['goodsTotal'] = count($goods);
		}
		$rccredMap = [];
		$goodsCatMap = [];
		$areaMap = [];
		//认证、地址、分类
		if(!empty($shopIds)){
			$rccreds = Db::name('shop_accreds')->alias('sac')->join('__ACCREDS__ a','a.accredId=sac.accredId and a.dataFlag=1','left')
			             ->where([['shopId','in',$shopIds]])->field('sac.shopId,accredName,accredImg')->select();
			foreach ($rccreds as $v){
				$rccredMap[$v['shopId']][] = $v;
			}
			$goodsCats = Db::name('cat_shops')->alias('cs')->join('__GOODS_CATS__ gc','cs.catId=gc.catId and gc.dataFlag=1','left')
			               ->where([['shopId','in',$shopIds]])->field('cs.shopId,gc.catName')->select();
		    foreach ($goodsCats as $v){
				$goodsCatMap[$v['shopId']][] = $v['catName'];
			}
			$areas = Db::name('areas')->alias('a')->join('__AREAS__ a1','a1.areaId=a.parentId','left')
			           ->where([['a.areaId','in',$areaIds]])->field('a.areaId,a.areaName areaName2,a1.areaName areaName1')->select();
		    foreach ($areas as $v){
				$areaMap[$v['areaId']] = $v;
			}         
		}
		foreach ($page['data'] as $key =>$v){
			$page['data'][$key]['accreds'] = (isset($rccredMap[$v['shopId']]))?$rccredMap[$v['shopId']]:[];
			$page['data'][$key]['catshops'] = (isset($goodsCatMap[$v['shopId']]))?implode(',',$goodsCatMap[$v['shopId']]):'';
			$page['data'][$key]['areas']['areaName1'] = (isset($areaMap[$v['areaId']]['areaName1']))?$areaMap[$v['areaId']]['areaName1']:'';
			$page['data'][$key]['areas']['areaName2'] = (isset($areaMap[$v['areaId']]['areaName2']))?$areaMap[$v['areaId']]['areaName2']:'';
		}
    	return $page;
    }
     
    /**
     * 获取店铺信息
     */
	public function getByView($id){
		$shop = $this->alias('s')->join('__BANKS__ b','b.bankId=s.bankId','left')
		             ->where(['s.dataFlag'=>1,'shopId'=>$id])
		             ->field('s.*,b.bankName')->find();
	     $areaIds = [];
        $areaMaps = [];
        $tmp = explode('_',$shop['areaIdPath']);
        foreach ($tmp as $vv){
         	if($vv=='')continue;
         	if(!in_array($vv,$areaIds))$areaIds[] = $vv;
        }
        if(!empty($areaIds)){
	         $areas = Db::name('areas')->where([['areaId','in',$areaIds],['dataFlag','=',1]])->field('areaId,areaName')->select();
	         foreach ($areas as $v){
	         	 $areaMaps[$v['areaId']] = $v['areaName'];
	         }
	         $tmp = explode('_',$shop['areaIdPath']);
	         $areaNames = [];
		     foreach ($tmp as $vv){
	         	 if($vv=='')continue;
	         	 $areaNames[] = $areaMaps[$vv];
	         	 $shop['areaName'] = implode('',$areaNames);
	         }
         }             
		                          
		//获取经营范围
		$goodsCats = Db::name('goods_cats')->where(['parentId'=>0,'isShow'=>1,'dataFlag'=>1])->field('catId,catName')->select();
		$catshops = Db::name('cat_shops')->where('shopId',$id)->select();
		$catshopMaps = [];
		foreach ($goodsCats as $v){
			$catshopMaps[$v['catId']] = $v['catName'];
		}
		$catshopNames = [];
		foreach ($catshops as $key =>$v){
			if(isset($catshopMaps[$v['catId']]))$catshopNames[] = $catshopMaps[$v['catId']];
		}
		$shop['catshopNames'] = implode('、',$catshopNames);
		//获取认证类型
	    $shop['accreds'] =Db::name('shop_accreds')->alias('sac')->join('__ACCREDS__ a','sac.accredId=a.accredId and a.dataFlag=1','inner')
	                    ->where('sac.shopId',$id)->field('accredName,accredImg')->select();
	    //开卡地址
        $areaNames  = model('areas')->getParentNames($shop['bankAreaId']);
        $shop['bankAreaName'] = implode('',$areaNames);
		return $shop;
	}
    /**
     * 获取店铺指定字段
     */
    public function getFieldsById($shopId,$fields){
        return $this->where(['shopId'=>$shopId,'dataFlag'=>1])->field($fields)->find();
    }

    /**
     * 保存入驻资料
     */
    public function saveStep2($data = []){
        $userId = (int)session('WST_USER.userId');
        //判断是否存在入驻申请
        $shops = $this->where('userId',$userId)->find();
        //新增入驻申请
        Db::startTrans();
        try{
            if(empty($shops)){
                $vshop = new VShop();
                $shop = ['userId'=>$userId,'applyStatus'=>0,'applyStep'=>2];
                $this->save($shop);
                WSTAllow($data,implode(',',$vshop->scene['applyStep1']));
                $data['shopId'] = $this->shopId;
                $result = Db::name('shop_extras')->insert($data);
                $shopId = $this->shopId;
                $WST_USER = session('WST_USER');
                $WST_USER['tempShopId'] = $shopId;
                session('WST_USER',$WST_USER);
                Db::commit();
                return WSTReturn('保存成功',1);
            }else{
                if($shops['applyStatus']>=1)return WSTReturn('请勿重复申请入驻');
                if($shops->applyStep<2){
                    $shops->applyStep = 2;
                    $shops->save();
                }
                $vshop = new VShop();
                WSTAllow($data,implode(',',$vshop->scene['applyStep1']));
                $result = Db::name('shop_extras')->where('shopId',$shops['shopId'])->update($data);
                if(false !== $result){
                    Db::commit();
                    return WSTReturn('保存成功',1);
                }else{
                    return WSTReturn('保存失败');
                }
            }
        }catch (\Exception $e) {
            Db::rollback();
            return WSTReturn('保存失败',-1);
        }
    }
    public function saveStep3($data = []){
        /*
            legalCertificateImg
            businessLicenceImg
            bankAccountPermitImg
            organizationCodeImg
        */
        $shopId = (int)session('WST_USER.tempShopId');
        if($shopId==0)return WSTReturn('非法的操作');
        $shops = model('shops')->get($shopId);
        if($shops['applyStatus']>=1)return WSTReturn('请勿重复申请入驻');
        //判断是否存在入驻申请
        $vshop = new VShop();
        WSTAllow($data,implode(',',$vshop->scene['applyStep2']));
        //获取地区
        $areaIds = model('Areas')->getParentIs($data['businessAreaPath0']);
        if(!empty($areaIds))$data['businessAreaPath'] = implode('_',$areaIds)."_";
        $areaIds = model('Areas')->getParentIs($data['areaIdPath0']);
        if(!empty($areaIds))$data['areaIdPath'] = implode('_',$areaIds)."_";
        if($data['isLongbusinessDate']==1)unset($data['businessEndDate']);
        if($data['isLonglegalCertificateDate']==1)unset($data['legalCertificateEndDate']);
        if($data['isLongOrganizationCodeDate']==1)unset($data['organizationCodeEndDate']);
        Db::startTrans();
        try{
            if($shops->applyStep<3){
                $shops->applyStep = 3;
                $shops->save();
            }
            $validate = new VShop;
            if(!$validate->scene('applyStep2')->check($data))return WSTReturn($validate->getError());
            $seModel = model('ShopExtras');
            $seModel->allowField(true)->save($data,['shopId'=>$shopId]);
            $Id = $seModel->where(['shopId'=>$shopId])->value('id');// 获取主键
            //启用上传图片
            WSTUseImages(0, $Id, $data['legalCertificateImg'],'shopextras');
            WSTUseImages(0, $Id, $data['businessLicenceImg'],'shopextras');
            WSTUseImages(0, $Id, $data['bankAccountPermitImg'],'shopextras');
            WSTUseImages(0, $Id, $data['organizationCodeImg'],'shopextras');

            $this->allowField(true)->save($data,['shopId'=>$shopId]);
            Db::commit();
            return WSTReturn('保存成功',1);
        }catch (\Exception $e) {
            Db::rollback();
            return WSTReturn('保存失败',-1);
        }
    }
    public function saveStep4($data = []){
        /*
            taxRegistrationCertificateImg
            taxpayerQualificationImg
        */
        $shopId = (int)session('WST_USER.tempShopId');
        if($shopId==0)return WSTReturn('非法的操作');
        $shops = model('shops')->get($shopId);
        if($shops['applyStatus']>=1)return WSTReturn('请勿重复申请入驻');
        //判断是否存在入驻申请
        $vshop = new VShop();
        WSTAllow($data,implode(',',$vshop->scene['applyStep3']));
        $areaIds = model('Areas')->getParentIs($data['bankAreaId']);
        if(!empty($areaIds))$data['bankAreaIdPath'] = implode('_',$areaIds)."_";
        Db::startTrans();
        try{
            if($shops->applyStep<4){
                $shops->applyStep = 4;
                $shops->save();
            }
            $seModel = model('ShopExtras');
            $seModel->allowField(true)->save($data,['shopId'=>$shopId]);
            $Id = $seModel->where(['shopId'=>$shopId])->value('id');
            //启用上传图片
            WSTUseImages(0, $Id, $data['taxRegistrationCertificateImg'],'shopextras');
            WSTUseImages(0, $Id, $data['taxpayerQualificationImg'],'shopextras');

            $this->allowField(true)->save($data,['shopId'=>$shopId]);
            Db::commit();
            return WSTReturn('保存成功',1);
        }catch (\Exception $e) {
            Db::rollback();
            return WSTReturn('保存失败',-1);
        }
    }
    public function saveStep5($data = []){
        $shopId = (int)session('WST_USER.tempShopId');
        if($shopId==0)return WSTReturn('非法的操作');
        $shops = model('shops')->get($shopId);
        if($shops['applyStatus']>=1)return WSTReturn('请勿重复申请入驻');
        //判断是否存在入驻申请
        $vshop = new VShop();
        $filters = $vshop->scene['applyStep4'];
        $filters[] = 'shopQQ';
        $filters[] = 'shopWangWang';
        WSTAllow($data,implode(',',$filters));
        Db::startTrans();
        try{
            $data['applyStatus'] = 1;
            $data['applyTime'] = date('Y-m-d H:i:s');
            $result = $this->allowField(true)->save($data,['shopId'=>$shopId]);
            // 启用图片
            WSTUseImages(0, $shopId, $data['shopImg'],'shops','shopImg');
            if($shops->applyStep<5){
                $shops->applyStep = 5;
                $shops->save();
            }
            if(false !== $result){
                //经营范围
                $goodsCats = explode(',',$data['goodsCatIds']);
                foreach ($goodsCats as $v){
                    if((int)$v>0)Db::name('cat_shops')->insert(['shopId'=>$shopId,'catId'=>$v]);
                }
                Db::commit();
                return WSTReturn('保存成功',1);
            }else{
                return WSTReturn('保存失败');
            }
        }catch (\Exception $e) {
            Db::rollback();
            return WSTReturn('保存失败',-1);
        }
    }

    /**
     * 获取商家入驻资料
     */
    public function getShopApply(){
        $userId = (int)session('WST_USER.userId');
        $rs = $this->alias('s')->join('__SHOP_EXTRAS__ ss','s.shopId=ss.shopId','inner')
                   ->where('s.userId',$userId)
                   ->find();
        if(!empty($rs)){
            $rs = $rs->toArray();
            $goodscats = Db::name('cat_shops')->where('shopId',$rs['shopId'])->select();
            $rs['catshops'] = [];
            foreach ($goodscats as $v){
                $rs['catshops'][$v['catId']] = true;
            }
            $rs['taxRegistrationCertificateImgVO'] = ($rs['taxRegistrationCertificateImg']!='')?explode(',',$rs['taxRegistrationCertificateImg']):[];
        }else{
            $rs = [];
            $data1 = $this->getEModel('shops');
            $data2 = $this->getEModel('shop_extras');
            $rs = array_merge($data1,$data2);
            $rs['taxRegistrationCertificateImgVO'] = [];
        }
        return $rs;
    }

    /**
     * 判断是否申请入驻过
     */
    public function checkApply(){
        $userId = (int)session('WST_USER.userId');
        $rs = $this->alias('s')->join('__SHOP_USERS__ sur','s.shopId=sur.shopId')->where(['sur.userId'=>$userId])->find();
        if(!empty($rs)){
            $WST_USER = session('WST_USER');
            $WST_USER['tempShopId'] = $rs->shopId;
            session('WST_USER',$WST_USER);
            session('apply_step',$rs['applyStep']);
        }
        return $rs;
    }
    /**
    * 首页店铺街列表
    */
    public function indexShopQuery($num=4){
        $cacheData = cache('PC_SHOP_STREET');
        if(!$cacheData){
            $cacheData = $this->alias('s')
                ->join('__SHOP_CONFIGS__ sc','s.shopId=sc.shopId','inner')
                ->join('__RECOMMENDS__ r','s.shopId=r.dataId')
                ->where(['r.goodsCatId'=>0,'s.shopStatus'=>1,'s.dataFlag'=>1,'r.dataSrc'=>1,'r.dataType'=>0])
                ->field('s.shopId,s.shopName,s.shopAddress,sc.shopStreetImg')->order('r.dataSort asc')->select();
            cache('PC_SHOP_STREET',$cacheData,86400);
        }
        return $cacheData;
    }
}
