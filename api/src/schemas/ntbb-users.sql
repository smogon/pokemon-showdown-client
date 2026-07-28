-- Database: showdown

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ntbb_users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `ntbb_users` (
  `userid` varbinary(255) NOT NULL,
  `usernum` int(11) NOT NULL AUTO_INCREMENT,
  `username` varbinary(255) NOT NULL,
  `password` varbinary(255) DEFAULT NULL,
  `nonce` varbinary(255) DEFAULT NULL,
  `passwordhash` varbinary(255) DEFAULT NULL,
  `email` varbinary(255) DEFAULT NULL,
  `registertime` bigint(20) NOT NULL,
  `group` int(11) NOT NULL DEFAULT '1',
  `banstate` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(255) NOT NULL DEFAULT '',
  `avatar` int(11) NOT NULL DEFAULT '0',
  `account` varbinary(255) DEFAULT NULL,
  `logintime` bigint(20) NOT NULL DEFAULT '0',
  `loginip` varbinary(255) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `usernum` (`usernum`),
  KEY `ip` (`ip`),
  KEY `loginip` (`loginip`),
  KEY `account` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=7379773 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
