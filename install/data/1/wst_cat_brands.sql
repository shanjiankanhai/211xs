SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_cat_brands`;
CREATE TABLE `wst_cat_brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `catId` int(11) DEFAULT NULL,
  `brandId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `catId` (`catId`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;


INSERT INTO `wst_cat_brands` VALUES ('1', '334', '1'),
('8', '49', '2'),
('9', '50', '2'),
('10', '51', '2'),
('11', '52', '2'),
('12', '53', '2'),
('13', '49', '3'),
('14', '50', '3'),
('15', '52', '3'),
('16', '53', '3'),
('17', '334', '4'),
('18', '334', '5'),
('19', '48', '6'),
('20', '47', '7'),
('21', '47', '8'),
('22', '47', '9'),
('23', '47', '10'),
('24', '47', '11'),
('25', '47', '13');
