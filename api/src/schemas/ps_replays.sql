--
-- Table structure for table `ps_replays`
--

CREATE TABLE `ps_replays` (
  `id` varbinary(255) NOT NULL DEFAULT '',
  `p1` varchar(45) NOT NULL,
  `p2` varchar(45) NOT NULL,
  `format` varchar(45) NOT NULL,
  `log` mediumtext NOT NULL,
  `inputlog` mediumtext,
  `uploadtime` bigint(20) NOT NULL,
  `views` int(11) NOT NULL DEFAULT '0',
  `p1id` varbinary(45) NOT NULL,
  `p2id` varbinary(45) NOT NULL,
  `formatid` varbinary(45) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT '0',
  `private` tinyint(1) NOT NULL,
  `password` varchar(31) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `p1` (`private`,`p1id`,`uploadtime`),
  KEY `p2` (`private`,`p2id`,`uploadtime`),
  KEY `top` (`private`,`formatid`,`rating`),
  KEY `format` (`private`,`formatid`,`uploadtime`),
  KEY `recent` (`private`,`uploadtime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
