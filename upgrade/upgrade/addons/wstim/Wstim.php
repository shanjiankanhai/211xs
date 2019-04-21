<?php
namespace addons\wstim;	// 注意命名空间规范
use think\addons\Addons;
use think\Db;
use addons\wstim\model\Chats as M;
/**
 * 客服插件
 * @author byron sampson
 */
class Wstim extends Addons	// 需继承think\addons\Addons类
{
    /*
        INSERT INTO `wst_hooks` VALUES (null, 'homeDocumentContact', '在线客服pc版入口', '1', '2018-05-09 15:03:53', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'homeDocumentListener', '在线客服pc版监听', '1', '2018-05-09 15:03:53', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'mobileDocumentContact', '在线客服手机版入口', '1', '2018-05-10 14:54:30', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'mobileDocumentBottomNav', '最近会话列表入口', '1', '2018-05-10 15:10:14', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'wechatDocumentBottomNav', '最近会话列表入口', '1', '2018-05-10 16:33:58', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'wechatDocumentContact', '在线客服微信版入口', '1', '2018-05-10 16:34:29', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'adminDocumentSysConfig', '客服聊天服务器配置', '1', '2018-05-10 17:24:42', 'Wstim');
        INSERT INTO `wst_hooks` VALUES (null, 'adminAfterConfigAddon', '插件配置保存之后', '1', '2018-05-10 17:24:42', 'Wstim');
    */
	// 该插件的基础信息
    public $info = [
        'name' => 'Wstim',	// 插件标识
        'title' => '客服插件',	// 插件名称
        'description' => 'wstmart客服插件',	// 插件简介
        'status' => 0,	// 状态
        'author' => 'WSTMart',
        'version' => '1.0.0'
    ];
    /**
     * 插件启用方法
     * @return bool
     */
    public function enable(){
        $m = new M();
        $flag = $m->toggleShow(1);
        WSTClearHookCache();
        cache('hooks',null);
        return $flag;
    }
    
    /**
     * 插件禁用方法
     * @return bool
     */
    public function disable(){
        $m = new M();
        $flag = $m->toggleShow(0);
        WSTClearHookCache();
        cache('hooks',null);
        return $flag;
    }

    /**
     * 插件设置方法
     * @return bool
     */
    public function saveConfig(){
        WSTClearHookCache();
        cache('hooks',null);
        return true;
    }
    /**
     * 插件安装方法
     * @return bool
     */
    public function install(){
        $m = new M();
        $flag = $m->install();
        WSTClearHookCache();
        cache('hooks',null);
        return $flag;
    }

    /**
     * 插件卸载方法
     * @return bool
     */
    public function uninstall()
    {
        $m = new M();
        $flag = $m->uninstall();
        WSTClearHookCache();
        cache('hooks',null);
        return $flag;
    }
    /**
    * 判断是否为客服【用户登录时调用】
    */
    public function afterUserLogin($param){
        $isService = Db::name('shop_services')
                    ->where(['userId'=>$param['user']['userId'],'dataFlag'=>1])
                    ->find();
        if(!empty($isService)){
            $param['user']['isService'] = 1;
            $param['user']['shopId'] = $isService['shopId'];
            if(!isset($param['isApp']))session('WST_USER',$param['user']);
        }
    }
    /**
    * 保存插件配置文件之后
    */
    public function adminAfterConfigAddon($param){
        $data = Db::name('addons')->where(['addonId'=>$param['addonId']])->find();
        if(strtolower($data['name'])=='wstim'){
            // workerman配置文件写入
            $config = json_decode($data['config'],true);
            // 表前缀
            $config['prefix'] = config('database.prefix');
            $value = var_export($config,true);
            $filePath = WST_ADDON_PATH.'wstim/workerman_config.php';
            file_put_contents($filePath,("<?php \n\r return " . $value . ";"));
        }
    }
    /************************************ admin ************************************/
    /**
     * 客服服务器配置
     */
    public function adminDocumentSysConfig($param)
    {
        $code = "<fieldset class='layui-elem-field layui-field-title' style='margin-top: 20px;'>
                  <legend>客服系统服务器设置</legend>
                  <table class='wst-form wst-box-top'>
                  <tr>
                     <th width='150'>客服系统服务器地址：</th>
                     <td><input type='text' id='chatServer' class='ipt' value='{$param['object']['chatServer']}' maxLength='100'/></td>
                  </tr>
                 </table>
                </fieldset>";
        return $this->display($code);
    }

    /************************************ home ************************************/
    /**
    * 用户端端监听
    */
    public function homeDocumentListener(){
        return $this->fetch('view/home/listener');
    }
    /**
    *  商家端监听
    */
    public function shopDocumentListener(){
        return $this->fetch('view/home/listener');
    }
    /**
    * pc版客服入口
    */
    public function homeDocumentContact($param){
        switch ($param['type']) {
            // 商品详情入口
            case 'goodsDetail':
                $code = "<a style='color:green;' target='_blank'
                    href=\"{:url('/addon/wstim-chats-index',['shopId'=>{$param['shopId']},'goodsId'=>{$param['goodsId']}])}\">
                    <img src='__ROOT__/addons/wstim/view/home/img/custom.png' style='vertical-align: sub;width: 18px;height: 16px;' title='在线客服' alt='在线客服' />
                    在线客服
                  </a>";
                break;
            // 店铺主页入口
            case 'shopHome':
                $code = "<a  target='_blank' title='在线客服'
                        href='{:url('/addon/wstim-chats-index',['shopId'=>{$param['shopId']}])}'>
                      <img src='__ROOT__/addons/wstim/view/home/img/custom.png' style='vertical-align: middle;width: 23px;height: 21px;' alt='在线客服' />
                      </a>";
                break;
            // 店铺客服入口
            case 'shopService':
                $code = '';
                if(session('WST_USER.userId')>0 && session('WST_USER.isService')==1){
                    $code = "<div><a href='{:url('/addon/wstim-shopchats-index')}' target='_blank'>客服后台</a></div>";
                }
            break;
        }
        return $this->display($code);
    }
    /************************************ mobile ************************************/
    public function mobileDocumentContact($param){
        // 隐藏默认qq客服入口
        echo "<script>$('.J_service').hide()</script>";
        switch ($param['type']) {
            // 商品详情入口
            case 'goodsDetail':
                $code = "<a href='{:url('/addon/wstim-chats-moIndex',['shopId'=>{$param['shopId']},'goodsId'=>{$param['goodsId']}])}'>
                            <span class='img qq'></span><span class='word'>客服</span></a>";
                break;
            // 店铺主页入口
            case 'shopHome':
                $code = "<a target='_blank'
                            style='color:#de0202;padding-right:15px;'
                            title='联系客服' href='{:url('/addon/wstim-chats-moIndex',['shopId'=>{$param['shopId']}])}'>联系客服</a>";
                break;
            // 店铺介绍页
            case 'shopIndex':
                $code = "<a  href='{:url('/addon/wstim-chats-moIndex',['shopId'=>{$param['shopId']}])}' 
                            style='width:45.5%;margin-right:15px;' 
                            class='ui-btn-lg shop-home-btn ui-col ui-col-50'>
                        <img src='__MOBILE__/img/icon_kf.png'>联系卖家</a>";
            break;
        }
        return $this->display($code);
    }
    /**
    * 替换底部导航图标(隐藏关注，显示消息列表入口)
    */
    public function mobileDocumentBottomNav(){
        return $this->fetch('view/mobile/chat_list');
    }
    /************************************ wechat ************************************/
    public function wechatDocumentContact($param){
        // 隐藏默认qq客服入口
        echo "<script>$('.J_service').hide();function goToChat(url){if(WST.conf.IS_LOGIN==0){return WST.inLogin(url)};window.location.href= url;}</script>";
        switch ($param['type']) {
            // 商品详情入口
            case 'goodsDetail':
                $url = url('/addon/wstim-chats-wxIndex',['shopId'=>$param['shopId'],'goodsId'=>$param['goodsId']]);
                $code = "<a onclick='goToChat(\"{$url}\")'>
                            <span class='img qq'></span><span class='word'>客服</span></a>";
                break;
            // 店铺主页入口
            case 'shopHome':
                $url = url('/addon/wstim-chats-wxIndex',['shopId'=>$param['shopId']]);
                $code = "<a onclick='goToChat(\"{$url}\")'
                            target='_blank'
                            style='color:#de0202;padding-right:15px;'
                            title='联系客服'>联系客服</a>";
                break;
            // 店铺介绍页
            case 'shopIndex':
                $url = url('/addon/wstim-chats-wxIndex',['shopId'=>$param['shopId']]);
                $code = "<a onclick='goToChat(\"{$url}\")'
                            style='width:45.5%;margin-right:15px;' 
                            class='ui-btn-lg shop-home-btn ui-col ui-col-50'>
                        <img src='__MOBILE__/img/icon_kf.png'>联系卖家</a>";
            break;
        }
        return $this->display($code);
    }
    /**
    * 替换底部导航图标(隐藏关注，显示消息列表入口)
    */
    public function wechatDocumentBottomNav(){
        return $this->fetch('view/wechat/chat_list');
    }











}