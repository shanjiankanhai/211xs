SET FOREIGN_KEY_CHECKS=0;


DROP TABLE IF EXISTS `wst_mobile_btns`;
CREATE TABLE `wst_mobile_btns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `btnName` varchar(255) DEFAULT NULL,
  `btnSrc` tinyint(4) NOT NULL DEFAULT '0',
  `btnUrl` varchar(255) DEFAULT NULL,
  `btnImg` varchar(255) DEFAULT NULL,
  `addonsName` varchar(255) DEFAULT NULL,
  `btnSort` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `btnSrc` (`btnSrc`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

