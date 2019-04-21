SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_cat_shops`;
CREATE TABLE `wst_cat_shops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shopId` int(11) NOT NULL DEFAULT '0',
  `catId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `catId` (`catId`),
  KEY `shopId` (`shopId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

INSERT INTO `wst_cat_shops` VALUES ('13', '1', '47'),
('14', '1', '48'),
('15', '1', '49'),
('16', '1', '50'),
('17', '1', '51'),
('18', '1', '54'),
('19', '1', '334'),
('20', '1', '52'),
('21', '1', '53'),
('22', '1', '55'),
('23', '1', '335'),
('24', '1', '56');
