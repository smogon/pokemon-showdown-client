--
-- Table structure for table `ntbb_servermodlog`
-- Effectively taken from ntbb_usermodlog, as they serve a similar function.
-- We just happen to use a `type` column to make it easier to narrow searches.

CREATE TABLE `ntbb_servermodlog` (
  `entryid` int(11) NOT NULL AUTO_INCREMENT,
  `serverid` varchar(63) CHARACTER SET latin1 NOT NULL,
  `actorid` varchar(63) CHARACTER SET latin1 NOT NULL,
  `date` int(11) NOT NULL,
  `ip` varchar(63) CHARACTER SET latin1 NOT NULL,
  `type` varchar(63) CHARACTER SET latin1 NOT NULL,
  `note` varchar(1023) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`entryid`),
  KEY `actorid` (`actorid`),
  KEY `ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX server_idx ON `ntbb_servermodlog` (`serverid`, `type`);
CREATE INDEX mixed_search ON `ntbb_servermodlog` (`serverid`, `actorid`, `type`);
