--
-- Table structure for table `ntbb_userstats`
--

DROP TABLE IF EXISTS `ntbb_userstats`;
CREATE TABLE `ntbb_userstats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serverid` varchar(255) NOT NULL,
  `date` bigint(20) NOT NULL,
  `usercount` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serverid` (`serverid`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
