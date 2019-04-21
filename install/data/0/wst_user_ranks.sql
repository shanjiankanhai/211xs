SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wst_user_ranks`;
CREATE TABLE `wst_user_ranks` (
  `rankId` int(11) NOT NULL AUTO_INCREMENT,
  `rankName` varchar(20) NOT NULL,
  `startScore` int(11) NOT NULL DEFAULT '0',
  `endScore` int(11) NOT NULL DEFAULT '0',
  `userrankImg` varchar(150) DEFAULT NULL,
  `dataFlag` tinyint(4) NOT NULL DEFAULT '1',
  `createTime` datetime NOT NULL,
  PRIMARY KEY (`rankId`),
  KEY `startScore` (`startScore`,`endScore`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;


INSERT INTO `wst_user_ranks` VALUES ('1', '初级会员', '0', '500', 'upload/userranks/2019-02/5c6f75ec26d08.png', '1', '2019-02-22 12:09:25'),
('2', '中级会员', '501', '1000', 'upload/userranks/2019-02/5c6f75ff8b2ee.png', '1', '2019-02-22 12:09:43'),
('3', '高级会员', '1001', '3000', 'upload/userranks/2019-02/5c6f760e5f336.png', '1', '2019-02-22 12:09:56'),
('4', '钻石会员', '3001', '100000', 'upload/userranks/2019-02/5c6f761f97d68.png', '1', '2019-02-22 12:10:14');
