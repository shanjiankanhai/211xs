SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_images`;
CREATE TABLE `wst_images` (
  `imgId` int(11) NOT NULL AUTO_INCREMENT,
  `fromType` tinyint(4) NOT NULL DEFAULT '0',
  `dataId` int(11) NOT NULL DEFAULT '0',
  `imgPath` varchar(150) NOT NULL,
  `imgSize` int(11) NOT NULL DEFAULT '0',
  `isUse` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  `fromTable` varchar(50) DEFAULT NULL,
  `ownId` int(11) DEFAULT NULL,
  `dataFlag` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`imgId`),
  KEY `isUse` (`isUse`,`fromTable`,`dataFlag`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;


INSERT INTO `wst_images` VALUES ('1', '1', '58', 'upload/sysconfigs/2019-02/5c6f6e57055c5.png', '7124', '1', '2019-02-22 11:36:55', 'sysconfigs', '1', '1'),
('2', '1', '105', 'upload/sysconfigs/2019-02/5c6f6e601b75d.jpg', '40044', '1', '2019-02-22 11:37:04', 'sysconfigs', '1', '1'),
('5', '1', '1', 'upload/staffs/2019-02/5c6f702add5df.png', '2182', '1', '2019-02-22 11:44:42', 'staffs', '1', '1'),
('6', '1', '0', 'upload/shops/2019-02/5c6f735eecb98.png', '2991', '0', '2019-02-22 11:58:22', 'shops', '1', '1'),
('7', '1', '1', 'upload/accreds/2019-02/5c6f74197968c.png', '1199', '1', '2019-02-22 12:01:29', 'accreds', '1', '1'),
('8', '1', '2', 'upload/accreds/2019-02/5c6f74289d057.png', '3229', '1', '2019-02-22 12:01:44', 'accreds', '1', '1'),
('9', '1', '1', 'upload/userranks/2019-02/5c6f75ec26d08.png', '1245', '1', '2019-02-22 12:09:16', 'userranks', '1', '1'),
('10', '1', '2', 'upload/userranks/2019-02/5c6f75ff8b2ee.png', '1232', '1', '2019-02-22 12:09:35', 'userranks', '1', '1'),
('11', '1', '3', 'upload/userranks/2019-02/5c6f760e5f336.png', '1344', '1', '2019-02-22 12:09:50', 'userranks', '1', '1'),
('12', '1', '4', 'upload/userranks/2019-02/5c6f761f97d68.png', '1218', '1', '2019-02-22 12:10:07', 'userranks', '1', '1');
