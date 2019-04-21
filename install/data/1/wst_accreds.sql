SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_accreds`;
CREATE TABLE `wst_accreds` (
  `accredId` int(11) NOT NULL AUTO_INCREMENT,
  `accredName` varchar(50) NOT NULL,
  `accredImg` varchar(150) NOT NULL DEFAULT '0',
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  PRIMARY KEY (`accredId`),
  KEY `dataFlag` (`dataFlag`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of wst_accreds
-- ----------------------------
INSERT INTO `wst_accreds` VALUES ('1', '七天无条件退款', 'upload/accreds/2019-02/5c6f74197968c.png', '1', '2019-02-22 12:01:30'),('2', '消保认证商家', 'upload/accreds/2019-02/5c6f74289d057.png', '1', '2019-02-22 12:01:45');
