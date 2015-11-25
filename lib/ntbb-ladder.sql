SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `showdown`
--

-- --------------------------------------------------------

--
-- Table structure for table `ntbb_ladder`
--

CREATE TABLE IF NOT EXISTS `ntbb_ladder` (
  `entryid` int(11) NOT NULL AUTO_INCREMENT,
  `formatid` varchar(63) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `userid` varchar(63) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `username` varchar(63) COLLATE utf8mb4_bin NOT NULL,
  `w` int(11) NOT NULL DEFAULT '0',
  `l` int(11) NOT NULL DEFAULT '0',
  `t` int(11) NOT NULL DEFAULT '0',
  `gxe` double NOT NULL DEFAULT '0',
  `r` double NOT NULL DEFAULT '1500',
  `rd` double NOT NULL DEFAULT '350',
  `sigma` double NOT NULL DEFAULT '0.06',
  `rptime` bigint(11) NOT NULL,
  `rpr` double NOT NULL DEFAULT '1500',
  `rprd` double NOT NULL DEFAULT '350',
  `rpsigma` double NOT NULL DEFAULT '0.06',
  `rpdata` mediumtext CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `elo` double NOT NULL DEFAULT '1000',
  `col1` double NOT NULL,
  PRIMARY KEY (`entryid`),
  UNIQUE KEY `userformats` (`userid`,`formatid`),
  KEY `formattoplist` (`formatid`,`elo`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
