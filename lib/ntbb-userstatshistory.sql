--
-- Table structure for table `ntbb_userstatshistory`
--

CREATE TABLE `ntbb_userstatshistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` bigint(20) NOT NULL,
  `usercount` int(11) NOT NULL,
  `programid` enum('showdown','po') NOT NULL DEFAULT 'showdown',
  PRIMARY KEY (`id`),
  KEY `date` (`date`),
  KEY `usercount` (`usercount`),
  KEY `programid` (`programid`),
  KEY `maxusers` (`programid`,`usercount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
