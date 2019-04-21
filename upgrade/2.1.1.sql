update wst_sys_configs set fieldValue='2.1.1_190220' where fieldCode='wstVersion';
update wst_sys_configs set fieldValue='0242a33df90886db08d2841c6d44a985' where fieldCode='wstMd5';

alter table `wst_articles` add column articleDesc varchar(500) comment '文章描述';

/**新增广告位**/
insert into wst_ad_positions(positionType,positionName,positionWidth,positionHeight,positionCode,apSort) values('1', '首页分层2F顶部广告', '1200', '110', 'ads-2-1', '99'),
('1', '首页分层4F顶部广告', '1200', '110', 'ads-4-1', '99'),
('1', '首页分层6F顶部广告', '1200', '110', 'ads-6-1', '99'),
('1', '首页分层8F顶部广告', '1200', '110', 'ads-8-1', '99'),
('1', '首页分层9F顶部广告', '1200', '110', 'ads-9-1', '99'),
('1', '首页分层10F顶部广告', '1200', '110', 'ads-10-1', '99');

insert into wst_ad_positions(positionType,positionName,positionWidth,positionHeight,positionCode,apSort) values('1', '2F楼层左侧背景图', '1200', '110', 'index-floor-left-2', '99'),
('1', '4F楼层左侧背景图', '240', '560', 'index-floor-left-4', '99'),
('1', '6F楼层左侧背景图', '240', '560', 'index-floor-left-6', '99'),
('1', '8F楼层左侧背景图', '240', '560', 'index-floor-left-8', '99'),
('1', '9F楼层左侧背景图', '240', '560', 'index-floor-left-9', '99'),
('1', '10F楼层左侧背景图', '240', '560', 'index-floor-left-10', '99');

update wst_ad_positions set positionWidth = 1200 WHERE positionCode in('ads-1-1','ads-3-1','ads-5-1','ads-7-1');
update wst_ad_positions set positionWidth = 240, positionHeight = 560 WHERE positionCode in('index-floor-left-1','index-floor-left-3','index-floor-left-5','index-floor-left-7');
update wst_ad_positions set positionName='爱上团购替换广告' where positionCode='rbnh-left-ads';