SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_shop_scores`;
CREATE TABLE `wst_shop_scores` (
  `scoreId` int(11) NOT NULL AUTO_INCREMENT,
  `shopId` int(11) NOT NULL,
  `totalScore` int(11) NOT NULL DEFAULT '0',
  `totalUsers` int(11) NOT NULL DEFAULT '0',
  `goodsScore` int(11) NOT NULL DEFAULT '0',
  `goodsUsers` int(11) NOT NULL DEFAULT '0',
  `serviceScore` int(11) NOT NULL DEFAULT '0',
  `serviceUsers` int(11) NOT NULL DEFAULT '0',
  `timeScore` int(11) NOT NULL DEFAULT '0',
  `timeUsers` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`scoreId`),
  UNIQUE KEY `shopId` (`shopId`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;


INSERT INTO `wst_shop_scores` VALUES ('1', '1', '0', '0', '0', '0', '0', '0', '0', '0'),
('2', '2', '5', '0', '5', '0', '5', '0', '0', '0'),
('3', '3', '5', '0', '5', '0', '5', '0', '0', '0'),
('4', '4', '5', '0', '5', '0', '5', '0', '0', '0'),
('5', '5', '5', '0', '5', '0', '5', '0', '0', '0'),
('6', '6', '5', '0', '5', '0', '5', '0', '0', '0'),
('7', '7', '5', '0', '5', '0', '5', '0', '0', '0'),
('8', '8', '5', '0', '5', '0', '5', '0', '0', '0'),
('9', '9', '5', '0', '5', '0', '5', '0', '0', '0'),
('10', '10', '5', '0', '5', '0', '5', '0', '0', '0'),
('11', '11', '5', '0', '5', '0', '5', '0', '0', '0'),
('12', '12', '5', '0', '5', '0', '5', '0', '0', '0');
