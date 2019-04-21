DROP TABLE IF EXISTS `wst_dialogs`;
DROP TABLE IF EXISTS `wst_dialog_contents`;
DROP TABLE IF EXISTS `wst_shop_services`;
delete from `wst_sys_configs` where fieldCode = 'chatServer';
delete from `wst_home_menus` where menuUrl='/addon/wstim-shops-index';
delete from `wst_home_menus` where menuUrl='/addon/wstim-shopservices-index';
delete from `wst_home_menus` where menuUrl='/addon/wstim-shopchats-index';
	