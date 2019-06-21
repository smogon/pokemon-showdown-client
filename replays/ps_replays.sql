-- Database: ps_replays
-- Generation Time: 2019-06-21 16:25:02.7010

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
  PRIMARY KEY (`id`),
  KEY `p1` (`private`,`p1id`,`uploadtime`),
  KEY `p2` (`private`,`p2id`,`uploadtime`),
  KEY `top` (`private`,`formatid`,`rating`),
  KEY `format` (`private`,`formatid`,`uploadtime`),
  KEY `recent` (`private`,`uploadtime`)
) ENGINE=TokuDB DEFAULT CHARSET=utf8mb4;
