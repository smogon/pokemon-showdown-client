-- Table structure for replay favorites

CREATE TABLE IF NOT EXISTS `ntbb_replay_favorites` (
  `userid` varchar(18) NOT NULL,
  `replayid` varchar(50) NOT NULL,
  `addtime` int(11) NOT NULL,
  PRIMARY KEY (`userid`, `replayid`),
  KEY `userid_index` (`userid`),
  KEY `addtime_index` (`addtime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
