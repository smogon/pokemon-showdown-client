CREATE TABLE `ntbb_loginthrottle` (
  `ip` varchar(63) COLLATE utf8mb4_bin NOT NULL,
  `count` int(11) NOT NULL,
  `lastuserid` varchar(63) COLLATE utf8mb4_bin NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`ip`),
  KEY `count` (`count`),
  KEY `time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
