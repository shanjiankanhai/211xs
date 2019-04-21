SET FOREIGN_KEY_CHECKS=0;


DROP TABLE IF EXISTS `wst_spec_cats`;
CREATE TABLE `wst_spec_cats` (
  `catId` int(11) NOT NULL AUTO_INCREMENT,
  `goodsCatId` int(11) NOT NULL DEFAULT '0',
  `goodsCatPath` varchar(100) NOT NULL,
  `catName` varchar(255) NOT NULL,
  `isAllowImg` tinyint(4) NOT NULL DEFAULT '0',
  `isShow` tinyint(4) NOT NULL DEFAULT '1',
  `catSort` int(11) DEFAULT '0',
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  PRIMARY KEY (`catId`),
  KEY `shopId` (`goodsCatPath`,`dataFlag`),
  KEY `isShow` (`isShow`,`dataFlag`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;


INSERT INTO `wst_spec_cats` VALUES ('1', '334', '334_', '颜色', '1', '1', '0', '1', '2019-02-23 10:29:01'),('2', '334', '334_', '内存', '0', '1', '0', '1', '2019-02-23 10:29:19');
