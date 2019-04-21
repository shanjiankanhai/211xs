SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_shop_configs`;
CREATE TABLE `wst_shop_configs` (
  `configId` int(11) NOT NULL AUTO_INCREMENT,
  `shopId` int(11) NOT NULL,
  `shopTitle` varchar(255) DEFAULT NULL,
  `shopKeywords` varchar(255) DEFAULT NULL,
  `shopDesc` varchar(255) DEFAULT NULL,
  `shopBanner` varchar(150) DEFAULT NULL,
  `shopAds` text,
  `shopAdsUrl` text,
  `shopServicer` varchar(100) DEFAULT NULL,
  `shopHotWords` varchar(255) DEFAULT NULL,
  `shopStreetImg` varchar(150) DEFAULT '' COMMENT '店铺街背景',
  `shopMoveBanner` varchar(150) DEFAULT NULL,
  `shopHomeTheme` varchar(200) NOT NULL DEFAULT 'shop_home' COMMENT '店铺风格',
  `mobileShopHomeTheme` varchar(200) NOT NULL DEFAULT 'shop_home' COMMENT '手机端店铺风格',
  `wechatShopHomeTheme` varchar(200) NOT NULL DEFAULT 'shop_home' COMMENT '微信端店铺风格',
  PRIMARY KEY (`configId`),
  KEY `shopId` (`shopId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `wst_shop_configs` VALUES ('1', '1', '', 'WSTMart官方自营', '', '', '', '', '', 'wstmart自营,维达纸巾,美食', '', '', 'shop_floor', 'shop_floor', 'shop_floor');
