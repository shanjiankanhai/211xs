/* 前台菜单 */
insert `wst_home_menus`(`menuId`,`parentId`,`menuName`,`menuUrl`,`menuOtherUrl`,`menuType`,`isShow`,`menuSort`,`dataFlag`,`createTime`,`menuMark`)
value(null,'231','聊天记录','/addon/wstim-shops-index','','1','1','0','1',now(),'');

insert `wst_home_menus`(`menuId`,`parentId`,`menuName`,`menuUrl`,`menuOtherUrl`,`menuType`,`isShow`,`menuSort`,`dataFlag`,`createTime`,`menuMark`)
value(null,'231','客服管理','/addon/wstim-shopservices-index','','1','1','0','1',now(),'');

insert `wst_home_menus`(`menuId`,`parentId`,`menuName`,`menuUrl`,`menuOtherUrl`,`menuType`,`isShow`,`menuSort`,`dataFlag`,`createTime`,`menuMark`)
value(null,'231','客服后台','/addon/wstim-shopchats-index','','1','1','0','1',now(),'');


/* 系统配置表 */
insert into  `wst_sys_configs`(`configId`,`fieldName`,`fieldCode`,`fieldValue`,`fieldType`)
value(null,'客服系统服务器地址','chatServer','','0');

DROP TABLE IF EXISTS `wst_dialogs`;
CREATE TABLE `wst_dialogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '会话id',
  `userId` int(10) unsigned NOT NULL COMMENT '用户id',
  `serviceId` int(10) unsigned NOT NULL COMMENT '客服id',
  `shopId` int(10) unsigned NOT NULL COMMENT '店铺id',
  `createTime` datetime NOT NULL COMMENT '会话创建时间',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `serviceId` (`serviceId`),
  KEY `shopId` (`shopId`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8 COMMENT='会话表';

DROP TABLE IF EXISTS `wst_dialog_contents`;
CREATE TABLE `wst_dialog_contents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `dialogId` int(10) unsigned NOT NULL COMMENT '会话id',
  `type` varchar(10) DEFAULT 'chat' COMMENT 'chat 聊天  message留言',
  `content` text COMMENT '会话内容(序列化后)类似 serialize(array("content"=>"发送内容","from"=>"用户id","serviceId"=>"客服id"))',
  `createTime` datetime NOT NULL COMMENT '会话创建时间',
  `isRead` tinyint(4) NOT NULL DEFAULT '0' COMMENT '消息是否已读 1:已读 0:未读',
  PRIMARY KEY (`id`),
  KEY `dialogId` (`dialogId`)
) ENGINE=InnoDB AUTO_INCREMENT=968 DEFAULT CHARSET=utf8 COMMENT='会话内容表';

DROP TABLE IF EXISTS `wst_shop_services`;
CREATE TABLE `wst_shop_services` (
  `shopId` int(11) NOT NULL COMMENT '店铺id',
  `userId` int(11) NOT NULL COMMENT '用户id',
  `createTime` datetime DEFAULT NULL COMMENT '数据创建时间',
  `dataFlag` tinyint(4) DEFAULT '1' COMMENT '删除标记',
  KEY `shopId` (`shopId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='店铺客服表';