SET FOREIGN_KEY_CHECKS=0;


DROP TABLE IF EXISTS `wst_order_express`;
CREATE TABLE `wst_order_express` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `orderGoodsId` varchar(100) NOT NULL,
  `deliveryTime` datetime DEFAULT NULL,
  `isExpress` tinyint(4) DEFAULT '0' COMMENT '1:需要物流  0:无需物流',
  `expressId` int(11) DEFAULT NULL,
  `expressNo` varchar(20) DEFAULT NULL,
  `createTime` datetime NOT NULL,
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`)
) ENGINE=InnoDB AUTO_INCREMENT=309 DEFAULT CHARSET=utf8;
