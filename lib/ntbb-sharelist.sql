-- Database: showdown

--
-- Table structure for table `ntbb_sharelist`
--

CREATE TABLE IF NOT EXISTS `ntbb_sharelist` (
    `teamid` bigint NOT NULL,
    `userid` varbinary(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
