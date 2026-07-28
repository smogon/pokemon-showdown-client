--
-- Table structure for table `ntbb_usermodlog`
--

CREATE TABLE `ntbb_usermodlog` (
  `entryid` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(63) CHARACTER SET latin1 NOT NULL,
  `actorid` varchar(63) CHARACTER SET latin1 NOT NULL,
  `date` int(11) NOT NULL,
  `ip` varchar(63) CHARACTER SET latin1 NOT NULL,
  `entry` varchar(1023) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`entryid`),
  KEY `userid` (`userid`),
  KEY `actorid` (`actorid`),
  KEY `ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
