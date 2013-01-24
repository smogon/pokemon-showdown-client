-- phpMyAdmin SQL Dump
-- version 3.3.10.4
-- http://www.phpmyadmin.net
--
-- Host: mysql.pokemonshowdown.com
-- Generation Time: Jan 23, 2013 at 04:24 PM
-- Server version: 5.1.39
-- PHP Version: 5.3.13

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `pokemonshowdown`
--

-- --------------------------------------------------------

--
-- Table structure for table `ntbb_ladder`
--

CREATE TABLE IF NOT EXISTS `ntbb_ladder` (
  `entryid` int(11) NOT NULL AUTO_INCREMENT,
  `serverid` varchar(255) NOT NULL,
  `formatid` varchar(255) NOT NULL,
  `userid` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
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
  `rpdata` text NOT NULL,
  `acre` double NOT NULL DEFAULT '1000',
  `lacre` double NOT NULL,
  PRIMARY KEY (`entryid`),
  KEY `ladderid` (`formatid`,`userid`,`gxe`),
  KEY `serverid` (`serverid`),
  KEY `acre` (`acre`),
  KEY `lacre` (`lacre`),
  KEY `userid` (`userid`),
  KEY `formatid` (`formatid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=424968 ;
