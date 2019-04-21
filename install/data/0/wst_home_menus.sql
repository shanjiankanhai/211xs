SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_home_menus`;
CREATE TABLE `wst_home_menus` (
  `menuId` int(11) NOT NULL AUTO_INCREMENT,
  `parentId` int(11) NOT NULL DEFAULT '0',
  `menuName` varchar(100) NOT NULL,
  `menuUrl` varchar(100) NOT NULL,
  `menuOtherUrl` text,
  `menuType` tinyint(4) NOT NULL DEFAULT '0',
  `isShow` tinyint(4) DEFAULT '1',
  `menuSort` int(11) NOT NULL DEFAULT '0',
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime DEFAULT NULL,
  `menuMark` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`menuId`),
  KEY `parentId` (`parentId`,`isShow`,`dataFlag`),
  KEY `menuType` (`menuType`)
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8;


INSERT INTO `wst_home_menus` VALUES ('1', '0', '买家中心', 'home/users/index', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('2', '1', '我的订单', '#', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('3', '2', '待付款订单', 'home/orders/waitPay', 'home/orders/waitPayByPage,home/orders/cancellation,home/orders/detail', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('5', '2', '待收货订单', 'home/orders/waitReceive', 'home/orders/waitReceiveByPage,home/orders/cancellation,home/orders/detail,home/orders/receive,home/orders/toReject,home/ordercomplains/complain', '0', '1', '1', '1', '2016-08-14 18:37:18', null),
('6', '2', '待评价订单', 'home/orders/waitAppraise', 'home/orders/waitAppraiseByPage,home/orders/detail,home/orders/orderAppraise,home/ordercomplains/complain', '0', '1', '2', '1', '2016-08-14 18:37:18', null),
('7', '2', '已取消订单', 'home/orders/cancel', 'home/orders/cancelByPage,home/orders/detail', '0', '1', '4', '1', '2016-08-14 18:37:18', null),
('8', '2', '拒收/退款', 'home/orders/abnormal', 'home/orders/abnormalByPage,home/ordercomplains/complain', '0', '1', '5', '1', '2016-08-14 18:37:18', null),
('9', '2', '我的评价', 'home/goodsappraises/myAppraise', 'home/goodsappraises/userAppraise', '0', '1', '6', '1', '2016-08-14 18:37:18', null),
('10', '1', '收藏管理', '#', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('11', '43', '资金管理', '#', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('13', '11', '积分管理', 'home/userscores/index', 'home/userscores/pageQuery', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('14', '1', '帐户设置', '#', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('15', '14', '用户资料', 'home/users/edit', 'home/users/toEdit,home/users/editUserPhoto', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('16', '14', '安全设置', 'home/users/security', 'home/users/editPass,home/users/editEmail,home/users/editPhone', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('17', '14', '用户地址', 'home/useraddress/index', 'home/useraddress/listQuery,home/useraddress/edit,home/useraddress/setDefault,home/useraddress/del', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('19', '1', '客户管理', '#', null, '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('20', '19', '投诉管理', 'home/ordercomplains/index', 'home/ordercomplains/queryUserComplainByPage,home/ordercomplains/getUserComplainDetail', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('22', '0', '卖家中心', 'shop/shops/index', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('23', '22', '交易管理', '#', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('24', '23', '待发货订单', 'shop/orders/waitdelivery', 'shop/orders/waitDeliveryByPage,shop/orders/deliver,shop/orders/view,shop/orders/getMoneyByOrder,shop/orders/orderPrint,shop/orders/view,shop/orders/toExport', '1', '1', '2', '1', '2016-08-14 18:37:18', null),
('25', '23', '投诉订单', 'shop/ordercomplains/shopComplain', 'shop/ordercomplains/queryShopComplainByPage,shop/ordercomplains/getShopComplainDetail,shop/ordercomplains/respond', '1', '1', '5', '1', '2016-08-14 18:37:18', null),
('29', '22', '商品管理', '#', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('30', '29', '商品分类', 'shop/shopcats/index', 'shop/shopcats/batchSaveCats,shop/shopcats/del,shop/shopcats/editName,shop/shopcats/editSort,shop/shopcats/changeCatStatus', '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('31', '29', '新增商品', 'shop/goods/add', null, '1', '1', '1', '1', '2016-08-14 18:37:18', null),
('32', '29', '出售中的商品', 'shop/goods/sale', 'shop/goods/editGoodsBase,shop/goods/saleByPage,shop/goods/edit,shop/goods/del,shop/goods/batchDel,shop/goods/changeGoodsStatus,shop/goods/changeSale,shop/goods/changSaleStatus,shop/goodsvirtuals/stock,shop/goodsvirtuals/stockByPage,shop/goodsvirtuals/edit,shop/goodsvirtuals/add,shop/goodsvirtuals/toadd,shop/goodsvirtuals/toEdit,shop/goodsvirtuals/del', '1', '1', '2', '1', '2016-08-14 18:37:18', null),
('33', '29', '审核中的商品', 'shop/goods/audit', 'shop/goods/editGoodsBase,shop/goods/auditByPage,shop/goods/edit,shop/goods/del,shop/goods/batchDel,shop/goods/changeGoodsStatus,shop/goods/changeSale,shop/goods/changSaleStatus,shop/goodsvirtuals/stock,shop/goodsvirtuals/stockByPage,shop/goodsvirtuals/edit,shop/goodsvirtuals/add,shop/goodsvirtuals/toadd,shop/goodsvirtuals/toEdit,shop/goodsvirtuals/del', '1', '1', '3', '1', '2016-08-14 18:37:18', null),
('34', '29', '仓库中的商品', 'shop/goods/store', 'shop/goods/editGoodsBase,shop/goods/storeByPage,shop/goods/illegalByPage,shop/goods/edit,shop/goods/del,shop/goods/batchDel,shop/goods/changeGoodsStatus,shop/goods/changeSale,shop/goods/changSaleStatus,shop/goodsvirtuals/stock,shop/goodsvirtuals/stockByPage,shop/goodsvirtuals/edit,shop/goodsvirtuals/add,shop/goodsvirtuals/toEdit,shop/goodsvirtuals/toadd,shop/goodsvirtuals/del', '1', '1', '4', '1', '2016-08-14 18:37:18', null),
('35', '29', '评价管理', 'shop/goodsappraises/index', 'shop/goodsappraises/queryByPage,shop/goodsappraises/shopReply', '1', '1', '8', '1', '2016-08-14 18:37:18', null),
('36', '29', '数据导入', 'shop/Imports/index', 'shop/goods/importGoods', '1', '1', '7', '1', '2016-08-14 18:37:18', null),
('38', '22', '店铺设置', '#', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('39', '38', '店铺资料', 'shop/shops/info', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('40', '38', '店铺设置', 'shop/shopconfigs/toShopCfg', null, '1', '1', '0', '1', '2016-08-14 18:37:18', null),
('41', '10', '我关注的商品', 'home/favorites/goods', 'home/favorites/listGoodsQuery,home/favorites/cancel', '0', '1', '0', '1', '2016-08-14 18:37:18', null),
('42', '38', '运费设置', 'shop/Shopfreights/index', 'shop/shopfreights/listProvince,shop/shopfreights/index', '1', '1', '0', '1', '2016-08-24 15:29:21', null),
('43', '0', '资金管理', 'home/users/index', '', '0', '1', '0', '1', '2016-09-18 10:24:47', null),
('44', '23', '已收货订单', 'shop/orders/finished', 'shop/orders/finishedByPage,shop/orders/view,shop/orders/orderPrint,shop/orders/view,shop/orders/toExport', '1', '1', '1', '1', '2016-09-18 10:30:29', null),
('45', '23', '取消/拒收订单', 'shop/orders/failure', 'shop/orders/failureByPage,shop/orders/view,shop/orders/confer,shop/orders/confer,shop/orders/orderPrint,shop/orders/view,shop/orders/toExport', '1', '1', '4', '1', '2016-09-18 10:31:01', null),
('46', '10', '我关注的商家', 'home/favorites/shops', 'home/favorites/listShopQuery,home/favorites/cancel', '0', '1', '2', '1', '2016-09-24 00:09:34', null),
('48', '2', '已完成订单', 'home/orders/finish', 'home/orders/finishByPage,home/orders/detail,home/orders/orderAppraise,home/ordercomplains/complain', '0', '1', '3', '1', '2016-09-22 10:18:16', null),
('49', '19', '用户信息', 'home/messages/index', 'home/messages/queryByList,home/messages/showMsg,home/messages/batchRead,home/messages/del,home/messages/batchDel', '0', '1', '3', '1', '2016-09-22 10:54:49', null),
('53', '23', '已发货订单', 'shop/orders/delivered', 'shop/orders/deliveredByPage,shop/orders/view,shop/orders/orderPrint,shop/orders/view,shop/orders/toExport', '1', '1', '3', '1', '2016-10-10 16:11:39', null),
('54', '29', '库存预警', 'shop/goods/stockWarnByPage', 'shop/goods/changSaleStatus,shop/goodsvirtuals/stock,shop/goodsvirtuals/stockByPage,shop/goodsvirtuals/edit,shop/goodsvirtuals/add,shop/goodsvirtuals/toadd,shop/goodsvirtuals/toEdit,shop/goodsvirtuals/del', '1', '1', '5', '1', '2016-10-11 11:50:56', null),
('55', '23', '待付款订单', 'shop/orders/waituserPay', 'shop/orders/waituserPayByPage,shop/orders/editOrderMoney,shop/orders/view,shop/orders/view,shop/orders/toExport', '1', '1', '1', '1', '2016-10-14 14:58:59', null),
('56', '29', '违规商品', 'shop/goods/illegal', '', '1', '1', '6', '1', '2016-10-14 22:13:33', null),
('57', '0', '运营管理', 'shop/shops/index', '', '1', '1', '1', '1', '2016-11-08 14:33:14', null),
('58', '57', '资金管理', '#', '', '1', '1', '0', '1', '2016-11-08 15:14:33', null),
('59', '58', '订单结算', 'shop/settlements/index', 'shop/settlements/pageQuery,shop/settlements/pageUnSettledQuery,shop/settlements/pageSettledQuery,shop/settlements/settlement', '1', '1', '0', '1', '2016-11-08 15:34:38', null),
('60', '11', '资金流水', 'home/logmoneys/usermoneys', 'home/logmoneys/pageUserQuery', '0', '1', '1', '1', '2016-11-09 23:53:50', null),
('61', '58', '资金流水', 'shop/logmoneys/shopmoneys', 'shop/logmoneys/pageShopQuery', '1', '1', '3', '1', '2016-11-11 10:41:02', null),
('62', '11', '提现管理', 'home/cashdraws/index', 'home/cashdraws/pageQuery,home/cashdraws/toEdit,home/cashdraws/drawMoney,home/cashconfigs/pageQuery,home/cashconfigs/toEdit,home/cashconfigs/add,home/cashconfigs/edit,home/cashconfigs/del', '0', '1', '5', '1', '2016-11-13 15:38:46', null),
('63', '57', '报表统计', '#', '', '1', '1', '1', '1', '2016-11-30 17:12:54', null),
('64', '63', '销售额统计', 'shop/reports/statSales', 'shop/reports/getStatSales', '1', '1', '1', '1', '2016-11-30 17:13:58', null),
('65', '63', '销售订单统计', 'shop/reports/statOrders', 'shop/reports/getStatOrders', '1', '1', '2', '1', '2016-11-30 17:14:40', null),
('66', '63', '商品销售排行', 'shop/reports/topSaleGoods', 'shop/reports/getTopSaleGoods', '1', '1', '0', '1', '2016-11-30 17:20:26', null),
('67', '58', '提现管理', 'shop/cashdraws/shopIndex', 'shop/cashdraws/pageQueryByShop,shop/cashdraws/drawMoneyByShop,shop/cashdraws/toEditByShop', '1', '1', '4', '1', '2017-01-16 23:12:57', null),
('68', '58', '钱包充值', 'shop/logmoneys/torecharge', '', '1', '1', '0', '1', '2017-01-17 16:26:56', null),
('76', '0', '促销管理', 'shop/shops/index', '', '1', '1', '1', '1', '2017-02-15 10:33:31', null),
('77', '76', '促销管理', '#', '', '1', '1', '1', '1', '2017-02-15 15:39:05', null),
('100', '0', '营销活动', 'home/users/index', '', '0', '1', '2', '1', '2017-03-02 13:23:40', null),
('101', '100', '营销活动', 'home/users/index', '', '0', '1', '2', '1', '2017-03-02 13:23:49', null),
('102', '29', '商品咨询', 'shop/goodsconsult/shopReplyConsult', 'shop/goodsconsult/pageQuery,shop/goodsconsult/edit', '1', '1', '9', '1', '2017-06-29 14:48:15', null),
('120', '38', '用户信息', 'shop/messages/shopMessage', 'shop/messages/queryByList,shop/messages/showShopMsg', '1', '1', '4', '1', '2017-01-01 13:35:20', null),
('121', '38', '店铺公告', 'shop/shops/notice', '', '1', '1', '5', '1', '2017-07-13 22:40:56', null),
('122', '19', '购买咨询', 'home/goodsconsult/myconsult', 'home/goodsconsult/myConsultByPage', '0', '1', '4', '1', '2017-08-21 15:35:33', null),
('123', '11', '钱包充值', 'home/logmoneys/toUserRecharge', '', '0', '1', '0', '1', '2017-08-17 16:26:56', null),
('124', '19', '违规举报', 'home/informs/index', 'home/informs/index', '0', '1', '6', '1', '2017-11-28 11:40:02', null),
('231', '22', '帐号管理', '#', '', '1', '1', '4', '1', '2017-12-04 15:45:21', null),
('232', '231', '角色管理', 'shop/shoproles/index', 'shop/shoproles/pageQuery,shop/shoproles/add,shop/shoproles/toAdd,shop/shoproles/edit,shop/shoproles/toEdit,shop/shoproles/del', '1', '1', '2', '1', '2017-12-04 15:49:48', null),
('233', '231', '帐号列表', 'shop/shopusers/index', 'shop/shopusers/pageQuery,shop/shopusers/add,shop/shopusers/toAdd,shop/shopusers/edit,shop/shopusers/toEdit,shop/shopusers/del', '1', '1', '1', '1', '2017-12-04 15:52:35', null),
('234', '231', '安全设置', 'shop/users/security', 'shop/users/editPass,shop/users/editEmail,shop/users/editPhone', '1', '1', '0', '1', null, null),
('235', '231', '用户资料', 'shop/users/edit', 'shop/users/toEdit', '1', '1', '0', '1', null, null),
('236', '38', '风格设置', 'shop/shopstyles/index', '', '1', '1', '0', '1', '2018-12-19 11:11:43', '');
