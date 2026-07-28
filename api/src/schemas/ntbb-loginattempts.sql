CREATE TABLE `ntbb_loginattempts` (
  `count` int(11) NOT NULL,
  `userid` varchar(63) COLLATE utf8mb4_bin NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`userid`),
  KEY `count` (`count`),
  KEY `time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
