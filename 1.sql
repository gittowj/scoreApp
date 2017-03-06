--drop table `student`;
CREATE TABLE `student` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `no` varchar(155) DEFAULT NULL,
  `school` varchar(100) DEFAULT NULL,
   isDelete TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
	UNIQUE KEY `no_school` (`no`,`school`)
) ENGINE=MyISAM AUTO_INCREMENT=69495 DEFAULT CHARSET=utf8;


-- DROP TABLE grade;
CREATE TABLE `grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score` decimal(6,2) DEFAULT NULL,
  `classOrder` int(11) DEFAULT NULL,
  `gradeOrder` int(11) DEFAULT NULL,
  `chineseScore` decimal(6,2) DEFAULT NULL,
  `chineseClassOrder` int(11) DEFAULT NULL,
  `chineseGradeOrder` int(11) DEFAULT NULL,
  `mathScore` decimal(6,2) DEFAULT NULL,
  `mathClassOrder` int(11) DEFAULT NULL,
  `mathGradeOrder` int(11) DEFAULT NULL,
  `englishScore` decimal(6,2) DEFAULT NULL,
  `englishClassOrder` int(11) DEFAULT NULL,
  `englishGradeOrder` int(11) DEFAULT NULL,
  `physicsScore` decimal(6,2) DEFAULT NULL,
  `physicsClassOrder` int(11) DEFAULT NULL,
  `physicsGradeOrder` int(11) DEFAULT NULL,

  `chemistryScore` decimal(6,2) DEFAULT NULL,
  `chemistryClassOrder` int(11) DEFAULT NULL,
  `chemistryGradeOrder` int(11) DEFAULT NULL,

  `biologyScore` decimal(6,2) DEFAULT NULL,
  `biologyClassOrder` int(11) DEFAULT NULL,
  `biologyGradeOrder` int(11) DEFAULT NULL,

  `politicsScore` decimal(6,2) DEFAULT NULL,
  `politicsClassOrder` int(11) DEFAULT NULL,
  `politicsGradeOrder` int(11) DEFAULT NULL,

  `historyScore` decimal(6,2) DEFAULT NULL,
  `historyClassOrder` int(11) DEFAULT NULL,
  `historyGradeOrder` int(11) DEFAULT NULL,

  `geographyScore` decimal(6,2) DEFAULT NULL,
  `geographyClassOrder` int(11) DEFAULT NULL,
  `geographyGradeOrder` int(11) DEFAULT NULL,
  `studentId` int(11) NOT NULL DEFAULT '0',
  `class` varchar(100) NOT NULL,
  title varchar(100) not null,
  isDelete TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pn` (`studentId`,`class`)
) ENGINE=MyISAM AUTO_INCREMENT=69497 DEFAULT CHARSET=utf8;

CREATE
VIEW `score`AS
select a.*, b.no, b.name, b.school from grade as a , student as b where a.studentId=b.id and b.isDelete = 0 and a.isDelete = 0;