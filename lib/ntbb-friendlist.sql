CREATE TABLE IF NOT EXISTS `ntbb_friendlist` (
	`p1` VARCHAR(255) NOT NULL,
	`p2` VARCHAR(255) NOT NULL,
	`accepted` TINYINT(1) NOT NULL DEFAULT '0',
	PRIMARY KEY (`p1`, `p2`)
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;