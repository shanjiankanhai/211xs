SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_recommends`;
CREATE TABLE `wst_recommends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goodsCatId` int(11) NOT NULL DEFAULT '0',
  `dataType` tinyint(4) NOT NULL DEFAULT '0',
  `dataSrc` tinyint(4) DEFAULT '0',
  `dataId` int(11) NOT NULL DEFAULT '0',
  `dataSort` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `goodsCatId` (`goodsCatId`,`dataType`,`dataSrc`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;


INSERT INTO `wst_recommends` VALUES ('1', '0', '0', '0', '48', '0'),
('2', '0', '0', '0', '49', '0'),
('3', '0', '0', '0', '50', '0'),
('4', '0', '0', '0', '55', '0'),
('5', '0', '0', '0', '56', '0'),
('8', '0', '1', '0', '24', '0'),
('9', '0', '1', '0', '28', '0'),
('12', '0', '3', '0', '46', '0'),
('13', '0', '3', '0', '47', '0');