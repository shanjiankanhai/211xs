SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_shop_accreds`;
CREATE TABLE `wst_shop_accreds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accredId` int(11) NOT NULL DEFAULT '0',
  `shopId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `shopId` (`shopId`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;

INSERT INTO `wst_shop_accreds` VALUES ('8', '1', '3'),
('9', '2', '3'),
('10', '1', '1'),
('11', '2', '1'),
('12', '1', '2'),
('13', '2', '2'),
('14', '1', '4'),
('15', '2', '4'),
('16', '1', '5'),
('17', '2', '5'),
('18', '1', '6'),
('19', '2', '6'),
('20', '1', '7'),
('21', '2', '7'),
('22', '1', '8'),
('23', '2', '8'),
('24', '1', '9'),
('27', '1', '11'),
('28', '2', '11'),
('29', '1', '10'),
('30', '2', '10'),
('31', '1', '12'),
('32', '2', '12');
