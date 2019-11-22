-- Database: showdown

--
-- Table structure for table `ntbb_teams`
--

CREATE TABLE IF NOT EXISTS `ntbb_teams` (
    `teamid` bigint NOT NULL AUTO_INCREMENT,
    `ownerid` varbinary(255) NOT NULL,
    `teamname` varbinary(255) NOT NULL,
    `format` varbinary(255) NOT NULL,
    `packedteam` text NOT NULL,
    `public` boolean NOT NULL,
    PRIMARY KEY (`teamid`),
    KEY `ownerid` (`ownerid`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
