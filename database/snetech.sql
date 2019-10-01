SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE DATABASE IF NOT EXISTS `school_snetech` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `school_snetech`;

CREATE TABLE IF NOT EXISTS `bericht` (
  `bericht_id` int(255) NOT NULL AUTO_INCREMENT,
  `message_received` int(255) NOT NULL,
  `message_sent` int(255) NOT NULL,
  `gesprek_id` int(255) NOT NULL,
  `tijd_verstuurd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bericht_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `gebruiker` (
  `gebruiker_id` int(255) NOT NULL,
  `gebruikers_naam` int(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `profielfoto` varchar(255) NOT NULL,
  `emailadres` varchar(255) NOT NULL,
  `wachtwoordhash` varchar(255) NOT NULL,
  PRIMARY KEY (`gebruiker_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `gesprek` (
  `gesprek_id` int(255) NOT NULL,
  `gebruiker_id` int(255) NOT NULL,
  `groeps_id` int(255) NOT NULL,
  `gelezen` int(1) NOT NULL,
  PRIMARY KEY (`gesprek_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `groep` (
  `groeps_id` int(255) NOT NULL,
  `groeps_naam` varchar(255) NOT NULL,
  PRIMARY KEY (`groeps_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `key` (
  `gebruiker_id` int(255) NOT NULL,
  `public_key` int(255) NOT NULL,
  `private_key` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
