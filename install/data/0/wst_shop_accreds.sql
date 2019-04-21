SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_shop_accreds`;
CREATE TABLE `wst_shop_accreds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accredId` int(11) NOT NULL DEFAULT '0',
  `shopId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `shopId` (`shopId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
INSERT INTO `wst_shop_accreds` VALUES ('1', '1', '1'),('2', '2', '1');
