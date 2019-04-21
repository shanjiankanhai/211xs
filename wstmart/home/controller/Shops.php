<?php
namespace wstmart\home\controller;
use think\Db;
use wstmart\home\model\Goods;
use wstmart\common\model\GoodsCats;
use wstmart\home\validate\Shops as Validate;
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
 * 门店控制器
 */

class Shops extends Base{
    protected $beforeActionList = [
          'checkAuth'=>['only'=>'join,joinstep1,joinstep2,savestep2,joinstep3,savestep3,joinstep4,savestep4,joinstep5,savestep5,joinsuccess']
    ];
    
    /**
     * 店铺街
     */
    public function shopStreet(){
    	$g = new GoodsCats();
    	$goodsCats = $g->listQuery(0);
    	$this->assign('goodscats',$goodsCats);
    	//店铺街列表
    	$s = model('shops');
    	$pagesize = 10;
    	$selectedId = input("get.id/d");
    	$this->assign('selectedId',$selectedId);
    	$list = $s->pageQuery($pagesize);
    	$this->assign('list',$list);
    	$this->assign('keyword',input('keyword'));
    	$this->assign('keytype',1);
    	return $this->fetch('shop_street');
    }
    /**
     * 店铺详情
     */
    public function index(){
    	$shopId = (int)input("param.shopId/d");
        hook("homeBeforeGoShopHome",["shopId"=>$shopId,"params"=>input()]);
    	$s = model('shops');
    	$data['shop'] = $s->getShopInfo($shopId);
    	if(empty($data['shop']))return $this->fetch('error_lost');
    	$g = model('goods');
    	$data['list'] = $g->shopGoods($shopId);
    	$this->assign('data',$data);
        $this->assign('msort',(int)input("param.msort",0));//筛选条件
        $this->assign('mdesc',(int)input("param.mdesc",1));//升降序
        $this->assign('sprice',input("param.sprice"));//价格范围
        $this->assign('eprice',input("param.eprice"));
        $this->assign('ct1',(int)input("param.ct1",0));//一级分类
        $this->assign('ct2',(int)input("param.ct2",0));//二级分类
    	return $this->fetch($data['shop']["shopHomeTheme"]);
    }
    
    /**
     * 店铺分类
     */
    public function goods(){
    	$s = model('shops');
    	$shopId = (int)input("param.shopId/d");
    	$data['shop'] = $s->getShopInfo($shopId);
    	$ct1 = input("param.ct1/d",0);
    	$ct2 = input("param.ct2/d",0);
    	$goodsName = input("param.goodsName");
    	if(empty($data['shop']))return $this->fetch('error_lost');
    	$g = model('goods');
    	$data['list'] = $g->shopGoods($shopId);
    	$this->assign('msort',input("param.msort/d",0));//筛选条件
    	$this->assign('mdesc',input("param.mdesc/d",1));//升降序
    	$this->assign('sprice',input("param.sprice"));//价格范围
    	$this->assign('eprice',input("param.eprice"));
    	$this->assign('ct1',$ct1);//一级分类
    	$this->assign('ct2',$ct2);//二级分类
    	$this->assign('goodsName',urldecode($goodsName));//搜索
    	$this->assign('data',$data);
    	return $this->fetch('shop_goods_list');
    }

    /**
     * 跳去商家入驻
     */
    public function join(){
        $rs = model('shops')->checkApply();
        $this->assign('isApply',(!empty($rs) && $rs['applyStatus']>=1)?1:0);
        $this->assign('applyStep',empty($rs)?1:$rs['applyStep']);
        $articles = model('Articles')->getArticlesByCat(53);
        // 防止不存在入驻文章时报错
        if(!isset($articles['105']))$articles['105']['articleContent'] = '无相关说明,请咨询商城客服~';
        if(!isset($articles['106']))$articles['106']['articleContent'] = '无相关说明,请咨询商城客服~';
        if(!isset($articles['107']))$articles['107']['articleContent'] = '无相关说明,请咨询商城客服~';
        if(!isset($articles['108']))$articles['108']['articleContent'] = '无相关说明,请咨询商城客服~';
        $this->assign('artiles',$articles);
        return $this->fetch('shop_join');
    }

    public function joinStep1(){
        session('apply_step',1);
        $rs = model('shops')->checkApply();
        $articles = model('Articles')->getArticlesByCat(53);
        // 防止不存在入驻文章时报错
        if(!isset($articles['109']))$articles['109']['articleContent'] = '无相关说明,请咨询商城客服~';
        $this->assign('artiles',$articles);
        return $this->fetch('shop_join_step1');
    }
    public function joinStep2(){
        $step = (int)session('apply_step');
        if($step<1){
            $this->redirect(Url('home/shops/joinStep1'));
            exit();
        }
        session('apply_step',2);
        $apply = model('shops')->getShopApply();
        $this->assign('apply',$apply);
        return $this->fetch('shop_join_step2');
    }
    public function saveStep2(){
        $step = (int)session('apply_step');
        if($step<2){
            return WSTReturn('请勿跳过申请步骤');
        }
        $data = input('post.');
        $validate = new Validate;
        if(!$validate->check($data,[],'applyStep1')){
            return WSTReturn($validate->getError());
        }else{
            return model('shops')->saveStep2($data);
        }
    }
    public function joinStep3(){
        $step = (int)session('apply_step');
        if($step<2){
            $this->redirect(Url('home/shops/joinStep1'));
            exit();
        }
        session('apply_step',3);
        $areas = model('Areas')->listQuery();
        $this->assign('areaList',$areas);
        $apply = model('shops')->getShopApply();
        $this->assign('apply',$apply);
        return $this->fetch('shop_join_step3');
    }
    public function saveStep3(){
        $step = (int)session('apply_step');
        if($step<3){
            return WSTReturn('请勿跳过申请步骤');
        }
        $data = input('post.');
        $validate = new Validate;
        if(!$validate->check($data,[],'applyStep2')){
            return WSTReturn($validate->getError());
        }else{
            return model('shops')->saveStep3($data);
        }
    }
    public function joinStep4(){
        $step = (int)session('apply_step');
        if($step<3){
            $this->redirect(Url('home/shops/joinStep4'));
            exit();
        }
        session('apply_step',4);
        $areas = model('Areas')->listQuery();
        $this->assign('areaList',$areas);
        $banks = model('banks')->listQuery();
        $this->assign('bankList',$banks);
        $apply = model('shops')->getShopApply();
        $this->assign('apply',$apply);
        return $this->fetch('shop_join_step4');
    }
    public function saveStep4(){
        $step = (int)session('apply_step');
        if($step<4){
            return WSTReturn('请勿跳过申请步骤');
        }
        $data = input('post.');
        $validate = new Validate;
        if(!$validate->check($data,[],'applyStep3')){
            return WSTReturn($validate->getError());
        }else{
            return model('shops')->saveStep4($data);
        }
    }
    public function joinStep5(){
        $step = (int)session('apply_step');
        if($step<4){
            $this->redirect(Url('home/shops/joinStep1'));
            exit();
        }
        session('apply_step',5);
        $goodsCatList = model('goodsCats')->listQuery(0);
        $this->assign('goodsCatList',$goodsCatList);
        $apply = model('shops')->getShopApply();
        $this->assign('apply',$apply);
        return $this->fetch('shop_join_step5');
    }
    public function saveStep5(){
        $step = (int)session('apply_step');
        if($step<5){
            return WSTReturn('请勿跳过申请步骤');
        }
        $data = input('post.');
        $validate = new Validate;
        if(!$validate->check($data,[],'applyStep4')){
            return WSTReturn($validate->getError());
        }else{
            return model('shops')->saveStep5($data);
        }
    }
    public function joinSuccess(){
        $step = (int)session('apply_step');
        if($step<5){
            $this->redirect(Url('home/shops/joinStep1'));
        }
        session('apply_step',5);
        $apply = model('shops')->getShopApply();
        $this->assign('apply',$apply);
        return $this->fetch('shop_join_success');
    }
    /**
     * 入驻进度查询
     */
    public function checkapplystatus(){
        $apply = model('shops')->getShopApply();
        if(empty($apply)){
            $this->redirect(Url('home/shops/joinStep1'));
            exit();
        }else{
            if($apply['applyStatus']==0){
                session('apply_step',$apply['applyStep']);
                $this->redirect(Url('home/shops/joinStep'.$apply['applyStep']));
                exit();
            }else{
                $this->assign('apply',$apply);
                return $this->fetch('shop_join_success');
            }
        }
    }
}
