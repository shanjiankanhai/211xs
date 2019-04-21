SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_shop_styles`;
CREATE TABLE `wst_shop_styles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `styleSys` varchar(255) DEFAULT NULL,
  `styleName` varchar(255) DEFAULT NULL,
  `styleCat` tinyint(4) unsigned DEFAULT '0',
  `stylePath` varchar(255) DEFAULT NULL,
  `screenshot` varchar(255) DEFAULT NULL,
  `isShow` tinyint(4) DEFAULT '1' COMMENT '1:显示  0:隐藏',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;


INSERT INTO `wst_shop_styles` VALUES ('1', 'home', '默认模板', '0', 'shop_home', 'img/shop_home.png', '1'),
('2', 'home', '楼层模板', '0', 'shop_floor', 'img/shop_floor.png', '1');
