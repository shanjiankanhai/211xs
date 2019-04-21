SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_attributes`;
CREATE TABLE `wst_attributes` (
  `attrId` int(11) NOT NULL AUTO_INCREMENT,
  `goodsCatId` int(11) NOT NULL DEFAULT '0',
  `goodsCatPath` varchar(100) NOT NULL,
  `attrName` varchar(100) NOT NULL,
  `attrType` tinyint(4) NOT NULL DEFAULT '0',
  `attrVal` text,
  `attrSort` int(11) NOT NULL DEFAULT '0',
  `isShow` tinyint(4) DEFAULT '1',
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  PRIMARY KEY (`attrId`),
  KEY `shopId` (`goodsCatId`,`isShow`,`dataFlag`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;


INSERT INTO `wst_attributes` VALUES ('1', '47', '47_', '规格', '0', '', '0', '1', '1', '2019-02-22 19:29:51'),
('2', '47', '47_', '储藏方式', '1', '冷藏,常温', '0', '1', '1', '2019-02-22 19:30:48'),
('3', '47', '47_', '产地', '1', '广东,四川,云南,湖南,江西,辽宁,黑龙江,湖北,西藏,新疆,内蒙古,安徽', '0', '1', '1', '2019-02-22 19:32:04'),
('4', '351', '334_348_351_', '分辨率', '2', '全高清FHD,高清HD,超高清FHD以上,标清SD', '0', '1', '1', '2019-02-23 10:36:54'),
('5', '351', '334_348_351_', '尺寸', '2', '3.0英寸一下,3.1-4.5英寸,4.6-5.0英寸,5.1-5.5英寸,5.6英寸以上', '0', '1', '1', '2019-02-23 10:37:47'),
('6', '334', '334_', '系统', '2', '安卓,苹果', '0', '1', '1', '2019-02-23 10:38:15'),
('7', '351', '334_348_351_', 'CPU核数', '2', '单核,双核,四核,八核,十核', '0', '1', '1', '2019-02-23 10:39:00'),
('8', '351', '334_348_351_', '运行内存', '1', '2GB,4GB,8GB,16GB,32GB', '0', '1', '1', '2019-02-23 10:39:28'),
('9', '351', '334_348_351_', '机身内存', '1', '16GB,32GB,64GB,128GB', '0', '1', '1', '2019-02-23 10:40:24');
