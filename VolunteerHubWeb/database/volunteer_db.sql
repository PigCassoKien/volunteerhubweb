-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: volunteer_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'2025-10-17 21:05:09.226528','Events related to community help and cleanups','Môi Trường',NULL),(2,'2025-10-17 21:05:09.226528','Events related to community help and cleanups','Từ thiện',NULL),(3,'2025-10-17 21:05:09.226528','Events related to community help and cleanups','Giáo dục',NULL),(4,'2025-10-17 21:05:09.226528','Events related to community help and cleanups','Y tế',NULL),(5,'2025-10-17 21:05:09.226528','Events related to community help and cleanups','Cộng đồng',NULL);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `parent_comment_id` bigint DEFAULT NULL,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhvh0e2ybgg16bpu229a5teje7` (`parent_comment_id`),
  KEY `FKs1slvnkuemjsq2kj4h3vhx7i1` (`post_id`),
  KEY `FK8kcum44fvpupyw6f5baccx25c` (`user_id`),
  CONSTRAINT `FK8kcum44fvpupyw6f5baccx25c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKhvh0e2ybgg16bpu229a5teje7` FOREIGN KEY (`parent_comment_id`) REFERENCES `comment` (`id`),
  CONSTRAINT `FKs1slvnkuemjsq2kj4h3vhx7i1` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (3,'This is my comment','2025-10-20 15:20:11.315962',NULL,NULL,2,7),(4,'This is my reply comment','2025-10-20 15:24:22.151538',NULL,3,2,7),(5,'I reply my reply comment','2025-10-20 15:24:35.766526',NULL,4,2,7),(6,'@Kinh Dương Miên Vãi hài vãi','2025-12-05 16:58:36.624775',NULL,3,2,8),(7,'@Minh Kiên Dương Hài cái gì','2025-12-05 19:32:44.392811',NULL,6,2,7),(8,'@Kinh Dương Miên','2025-12-05 19:36:34.938912',NULL,5,2,7),(9,'@Kinh Dương Miên','2025-12-05 19:36:45.807644',NULL,3,2,7),(10,'Hihi','2025-12-05 19:37:06.649105',NULL,NULL,6,7),(11,'@Kinh Dương Miên Vãi chưởng','2025-12-09 10:03:23.790204',NULL,9,2,8),(12,'Hihi','2025-12-09 10:10:24.767446',NULL,11,2,8),(15,'Vãi','2025-12-09 18:03:07.696595',NULL,10,6,8),(23,'Hello','2025-12-17 13:41:22.789476',NULL,6,2,7),(24,'Hello','2025-12-17 13:46:05.870690',NULL,23,2,7),(25,'ko','2025-12-17 14:14:09.080288',NULL,6,2,7),(26,'Hihi','2025-12-19 18:52:43.887287',NULL,NULL,13,10),(27,'Vãi thật','2025-12-19 19:34:14.590682',NULL,NULL,13,7);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` longtext NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `image_file` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `max_participants` int DEFAULT NULL,
  `start_date` datetime(6) NOT NULL,
  `status` enum('APPROVED','CANCELED','COMPLETED','PENDING','REJECTED') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `created_by` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK751x8cp2x1h1fay38u2p5gpkr` (`category_id`),
  KEY `FKmhfub5ph3n5j84ejby5erosc8` (`created_by`),
  CONSTRAINT `FK751x8cp2x1h1fay38u2p5gpkr` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `FKmhfub5ph3n5j84ejby5erosc8` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (4,'2025-10-17 21:05:25.223202','Volunteer to clean the park','2025-11-10 05:00:00.000000','events/1764960477411_park.jpg','Central Park',50,'2025-11-10 02:00:00.000000','APPROVED','Park Cleanup','2025-12-05 18:48:11.146995',1,7),(6,'2025-10-18 17:27:59.248308','Beach Cleanup là hoạt động tình nguyện nhằm thu gom rác thải tại bãi biển, góp phần bảo vệ môi trường biển và hệ sinh thái ven bờ. Người tham gia sẽ cùng nhau dọn dẹp rác nhựa, phân loại rác tái chế, đồng thời lan tỏa ý thức bảo vệ môi trường đến cộng đồng và du khách. Sự kiện không chỉ mang ý nghĩa thiết thực trong việc giảm ô nhiễm mà còn tạo cơ hội để các tình nguyện viên kết nối, rèn luyện tinh thần trách nhiệm xã hội và trải nghiệm hoạt động tập thể ý nghĩa ngoài trời.','2025-12-20 11:00:00.000000','events/1764960465043_beach.jpg','Biển Cửa Lò',50,'2025-12-13 01:00:00.000000','APPROVED','Beach Cleanup','2025-12-18 21:59:41.666924',1,7),(7,'2025-12-05 18:32:04.715453','Ủng hộ lũ lụt cho Bà con miền trung','2025-12-19 18:32:00.000000','events/1764959524655_l__l_t.jpg','Huế',70,'2025-12-12 18:32:00.000000','APPROVED','Ủng hộ lũ lụt Miền Trung','2025-12-09 08:59:39.825232',2,7),(8,'2025-12-09 11:00:28.979445','Dạy học, hỗ trợ cho các em bé, trẻ em nghèo có cơ hội đi học ở vùng núi','2025-12-20 10:59:00.000000','events/1765278028927_d_y_h_c.jpg','Cao Bằng',20,'2025-12-13 10:59:00.000000','APPROVED','Kiến thức đến vùng quê','2025-12-09 11:00:51.396543',3,7),(10,'2025-12-09 20:37:45.430734','Sự kiện hiến máu tình nguyện tại Đại học Quốc Gia Hà Nội, cho các cán bộ giảng viên và sinh viên','2025-12-11 11:00:00.000000','events/1765312665391_unnamed.jpg','Khuôn viên ĐHQGHN',30,'2025-12-10 23:00:00.000000','APPROVED','Hiến máu tình nguyện','2025-12-09 20:38:17.818806',4,7),(11,'2025-12-09 20:50:53.997255','Phát quà, nhu yếu phẩm cho người dân khó khăn.','2025-12-15 20:50:00.000000','events/1765313453941-15.jpg','Khu phố Dubai',45,'2025-12-11 20:50:00.000000','APPROVED','Chia sẻ yêu thương','2025-12-09 20:51:38.691831',5,7),(12,'2025-12-18 20:57:13.673100','Chiến dịch do Đoàn Thanh niên Hà Nội tổ chức nhằm khuyến khích thanh niên tham gia các hoạt động bảo vệ môi trường, xây dựng văn minh đô thị như dọn rác, trồng cây, phân loại rác, làm vườn thanh niên… Tạo cơ hội phát triển kỹ năng lãnh đạo và đóng góp cho cộng đồng.','2025-12-19 11:00:00.000000','events/1766091433566-youth.webp','Khắp Hà Nội',30,'2025-12-19 01:00:00.000000','APPROVED','Vietnam Youth Month – Hoạt động tình nguyện vì cộng đồng','2025-12-18 20:58:12.966113',5,7),(13,'2025-12-18 21:02:32.941581','Chương trình tình nguyện quốc tế kết hợp hỗ trợ cộng đồng tại vùng cao – dạy tiếng Anh và kỹ năng sống cho trẻ em, cải tạo cơ sở vật chất, hỗ trợ nông nghiệp, tổ chức chợ 0 đồng cho người dân. Đây là dịp trải nghiệm văn hóa và hoạt động tình nguyện thực tế.','2025-12-31 11:00:00.000000','events/1766091752924-inter.jpg','Hà Thanh, Hà Giang',50,'2025-12-24 01:00:00.000000','APPROVED',' International Voluntary Workcamp (Trại tình nguyện quốc tế)','2025-12-18 21:02:41.341665',3,7),(14,'2025-12-18 21:04:48.008234','Dự án do Đoàn Thanh niên tổ chức kéo dài suốt mùa hè gồm nhiều hoạt động: dạy học miễn phí, xây sửa nhà, nâng cấp cơ sở vật chất trường học, hỗ trợ kỹ năng sống trẻ em, và nhiều dự án cộng đồng khác.','2025-12-31 11:00:00.000000','events/1766091887991-summer.jpeg','Điện Biên',80,'2025-12-28 01:00:00.000000','APPROVED','Summer Youth Volunteer Campaign','2025-12-18 21:06:33.722616',5,7),(15,'2025-12-18 21:05:50.718711','Chiến dịch trồng cây, xây dựng “hành lang xanh” trong đô thị, loại bỏ rác thải nhựa, tuyên truyền bảo vệ môi trường. Dành cho tình nguyện viên muốn góp sức xây dựng đô thị sạch đẹp và học hỏi kỹ năng tổ chức chiến dịch.','2026-01-03 21:05:00.000000','events/1766091950701-green.png','Hà Nội, TP. Hồ Chí Minh và các khu đô thị lớn',60,'2025-12-31 21:05:00.000000','APPROVED','Green Cities Initiative – Thành phố Xanh (VietnamVolunteer)','2025-12-18 21:06:35.824129',1,7);
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registration`
--

DROP TABLE IF EXISTS `event_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registration` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `completed_at` datetime(6) DEFAULT NULL,
  `registered_at` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','CANCELED','COMPLETED','PENDING','REJECTED') DEFAULT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `about` varchar(2000) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `confirmation` bit(1) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `experience` varchar(2000) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `skills` varchar(2000) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `canceled_at` datetime(6) DEFAULT NULL,
  `cancellation_reason` varchar(2000) DEFAULT NULL,
  `canceled_by_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2ra3ocp6gfw2vbwybbooxxuml` (`event_id`),
  KEY `FKsiqqwnfa1t1rybxsi424kfxh1` (`user_id`),
  KEY `FKrcx63wg6q4pc204gb6tm0qb4p` (`canceled_by_id`),
  CONSTRAINT `FK2ra3ocp6gfw2vbwybbooxxuml` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FKrcx63wg6q4pc204gb6tm0qb4p` FOREIGN KEY (`canceled_by_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKsiqqwnfa1t1rybxsi424kfxh1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registration`
--

LOCK TABLES `event_registration` WRITE;
/*!40000 ALTER TABLE `event_registration` DISABLE KEYS */;
INSERT INTO `event_registration` VALUES (2,'2025-12-18 20:23:56.351671','2025-10-18 16:55:35.246536','COMPLETED',4,8,'I love volunteering.','123 Main St, Hanoi',_binary '','volunteer@example.com','2000-05-15','Community service 2 years','Nguyen Van A','Male','Student','+84901234567','High School ABC','first aid, teamwork',NULL,NULL,NULL,NULL),(4,'2025-12-18 20:23:50.321571','2025-10-18 17:31:56.941293','COMPLETED',4,9,'I love volunteering.','123 Main St, Hanoi',_binary '','volunteer@example.com','2008-05-15','Community service 2 years','Nếu Ngày Ấy','Male','Student','+84901234567','High School ABC','first aid, teamwork',NULL,NULL,NULL,NULL),(6,'2025-12-18 20:23:51.044713','2025-12-05 13:48:02.600944','COMPLETED',4,8,'Tôi là siêu nhân','New York',_binary '','kienduong612@gmail.com','2004-12-06','','Dương Minh Kiên','Male','Siêu nhân','0338156369','','',NULL,NULL,NULL,NULL),(9,NULL,'2025-12-06 07:35:56.359721','APPROVED',6,8,'Sinh viên','123 Main St',_binary '','kienduong612@gmail.com','2004-06-10',NULL,'Minh Kiên Dương','Male','Sinh viên','0123456789',NULL,NULL,NULL,NULL,NULL,NULL),(10,NULL,'2025-12-09 10:52:12.756924','APPROVED',7,9,'Vip','123 Main St',_binary '','duongkien12a3@gmail.com','2004-06-10','Làm nhiều rồi','Nếu Ngày Ấy','Male','Sinh Viên','0123456789','VNU','Tổ chức','2025-12-09 10:52:51.527406',NULL,NULL,NULL),(12,'2025-12-18 20:38:32.369080','2025-12-09 20:44:46.979007','COMPLETED',10,8,'VIP','123 Main St',_binary '','kienduong612@gmail.com','2004-06-10','VIP','Minh Kiên Dương','Male','Sinh viên','0123456789','VNU','Vip','2025-12-09 20:44:58.629331',NULL,NULL,NULL),(13,'2025-12-18 20:24:49.027421','2025-12-09 20:52:30.200281','COMPLETED',11,8,'Tôi rất vip','123 Main St',_binary '','kienduong612@gmail.com','2004-06-10','Tôi vip','Minh Kiên Dương','Male','Sinh viên','0123456789','UET','Tổ chức','2025-12-09 20:59:20.025743',NULL,NULL,NULL),(14,'2025-12-18 20:24:42.139760','2025-12-16 08:47:15.395265','COMPLETED',11,9,'Tôi là bảo vệ 20 năm nay','123 Main St',_binary '','duongkien12a3@gmail.com','2004-06-10','Bảo vệ','Nếu Ngày Ấy','Male','Bảo vệ','0123456789','FPT','Bảo vệ','2025-12-16 08:47:35.492986',NULL,NULL,NULL),(15,'2025-12-18 20:38:28.834938','2025-12-17 13:06:48.455811','COMPLETED',10,9,'FET','123 Main St',_binary '','duongkien12a3@gmail.com','2006-12-12','FET','Nếu Ngày Ấy','Male','Sinh viên','0123456789','FET','','2025-12-17 13:07:08.677142',NULL,NULL,NULL),(16,NULL,'2025-12-18 19:50:41.436457','APPROVED',8,8,'Tôi là sinh viên UET','123 Main St',_binary '','kienduong612@gmail.com','2005-10-06','Có nhiều kinh nghiệm làm tình nguyện','Minh Kiên Dương','Male','Sinh viên','0123456789','UET','sơ cứu, tổ chức','2025-12-18 20:23:28.483970',NULL,NULL,NULL),(17,'2025-12-18 20:26:20.857237','2025-12-18 20:25:58.726157','COMPLETED',11,8,'ad','123 Main St',_binary '','kienduong612@gmail.com','2004-10-06','ad','Minh Kiên Dương','Male','ad','0123456789','ad','ad','2025-12-18 20:26:20.489243','2025-12-18 20:26:20.489243',NULL,7),(20,NULL,'2025-12-18 22:14:32.351692','APPROVED',14,8,'A','123 Main St',_binary '','kienduong612@gmail.com','2004-10-06','A','Minh Kiên Dương','Male','A','0123456789','A','A','2025-12-18 22:14:59.783755',NULL,NULL,NULL),(21,NULL,'2025-12-19 18:34:53.760278','APPROVED',13,10,'Vip','Quỳnh Lưu',_binary '','hieudainhanqt2@gmail.com','2004-10-06','Không có','Trương Đức Hiếu','Male','Lập trình viên','0135695616','UET','Sơ cứu, tổ chức, làm việc nhóm','2025-12-19 18:36:47.145944',NULL,NULL,NULL);
/*!40000 ALTER TABLE `event_registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKe2bvs7p9ahew2m8hfxicdu5hj` (`user_id`,`event_id`),
  KEY `FKc4tvltkr2frx3ngw5rhx6yrl1` (`event_id`),
  CONSTRAINT `FKc4tvltkr2frx3ngw5rhx6yrl1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FKh3f2dg11ibnht4fvnmx60jcif` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (2,'2025-12-06 07:53:33.243896',6,8),(3,'2025-12-09 11:01:50.081208',8,9),(4,'2025-12-09 11:02:01.193361',4,9),(5,'2025-12-18 21:31:39.622968',13,8),(6,'2025-12-18 21:31:41.764050',14,8);
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwt_token`
--

DROP TABLE IF EXISTS `jwt_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwt_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) NOT NULL,
  `revoked` bit(1) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK164jcv4uy5y5ev8w6r38fxd79` (`refresh_token`),
  KEY `FKrma6363nvuvw4npx6xidhqeov` (`user_id`),
  CONSTRAINT `FKrma6363nvuvw4npx6xidhqeov` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_token`
--

LOCK TABLES `jwt_token` WRITE;
/*!40000 ALTER TABLE `jwt_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `jwt_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `related_id` bigint DEFAULT NULL,
  `related_type` enum('COMMENT','EVENT','POST') DEFAULT NULL,
  `type` enum('COMMENT','EVENT_APPROVAL','EVENT_REGISTRATION','EVENT_UPDATE','POST_REACTION') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `actor_id` bigint DEFAULT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKb0yvoep4h4k92ipon31wmdf7e` (`user_id`),
  CONSTRAINT `FKb0yvoep4h4k92ipon31wmdf7e` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=311 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,'A new event has been added!','2025-10-18 17:27:59.262982',_binary '',6,'EVENT','EVENT_UPDATE',8,NULL,NULL),(2,'A new event has been added!','2025-10-18 17:27:59.276683',_binary '',6,'EVENT','EVENT_UPDATE',9,NULL,NULL),(3,'Your post received a like reaction.','2025-10-20 15:58:47.528939',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(4,'Your comment received a love reaction.','2025-10-20 15:59:13.077594',_binary '',4,'COMMENT','POST_REACTION',7,NULL,NULL),(6,'Custom message to approved volunteers','2025-10-23 14:18:43.105127',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(7,'Custom message to approved volunteers','2025-10-23 14:19:04.027905',_binary '',6,'EVENT','EVENT_UPDATE',9,NULL,NULL),(8,'Your post received a haha reaction.','2025-12-05 16:31:12.837333',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(9,'Your post received a sad reaction.','2025-12-05 16:41:44.491637',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(10,'Your post received a haha reaction.','2025-12-05 16:41:45.775307',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(11,'A new event has been added!','2025-12-05 18:32:04.837834',_binary '',7,'EVENT','EVENT_UPDATE',8,NULL,NULL),(12,'A new event has been added!','2025-12-05 18:32:04.851042',_binary '',7,'EVENT','EVENT_UPDATE',9,NULL,NULL),(13,'Your post received a angry reaction.','2025-12-05 19:32:29.337216',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(14,'Your post received a wow reaction.','2025-12-05 19:36:56.211975',_binary '',1,'POST','POST_REACTION',7,NULL,NULL),(15,'Your post received a haha reaction.','2025-12-05 19:43:40.634634',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(16,'Your post received a love reaction.','2025-12-05 19:43:43.389513',_binary '',1,'POST','POST_REACTION',7,NULL,NULL),(17,'Alloooooo','2025-12-05 19:58:57.400386',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(18,'Aloooooo','2025-12-05 20:00:31.404480',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(19,'Alooooo','2025-12-05 20:00:43.232221',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(20,'Hellllooooooo','2025-12-05 20:04:22.716194',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(21,'Thông báo từ ban tổ chức: Park Cleanup\n\nHello','2025-12-05 20:04:40.852402',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(22,'Your post received a like reaction.','2025-12-09 09:34:17.728009',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(23,'Your post received a like reaction.','2025-12-09 09:34:18.929857',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(24,'Your post received a like reaction.','2025-12-09 09:34:19.300663',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(25,'Your post received a like reaction.','2025-12-09 09:34:20.718045',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(26,'Your post received a like reaction.','2025-12-09 09:34:22.712682',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(27,'Your post received a like reaction.','2025-12-09 09:34:24.830148',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(28,'Your post received a haha reaction.','2025-12-09 10:02:18.047707',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(29,'Your post received a haha reaction.','2025-12-09 10:02:24.687778',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(30,'Your post received a love reaction.','2025-12-09 10:02:29.463836',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(31,'Your post received a love reaction.','2025-12-09 10:02:31.987118',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(32,'Your comment received a haha reaction.','2025-12-09 10:02:36.839433',_binary '',8,'COMMENT','POST_REACTION',7,NULL,NULL),(33,'Your comment received a haha reaction.','2025-12-09 10:02:39.186773',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(34,'Your comment received a love reaction.','2025-12-09 10:02:49.845117',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(35,'Your comment received a like reaction.','2025-12-09 10:02:50.798487',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(36,'Your comment received a like reaction.','2025-12-09 10:02:51.240042',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(37,'Your comment received a like reaction.','2025-12-09 10:02:51.667758',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(38,'Your comment received a love reaction.','2025-12-09 10:02:52.646684',_binary '',5,'COMMENT','POST_REACTION',7,NULL,NULL),(39,'Your comment received a love reaction.','2025-12-09 10:03:00.682962',_binary '',7,'COMMENT','POST_REACTION',7,NULL,NULL),(40,'Your post received a wow reaction.','2025-12-09 10:10:38.738045',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(41,'Your post received a wow reaction.','2025-12-09 10:10:40.567793',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(42,'Your post received a love reaction.','2025-12-09 10:10:46.880212',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(43,'Your post received a like reaction.','2025-12-09 10:10:55.778190',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(44,'Your comment received a haha reaction.','2025-12-09 10:11:21.720427',_binary '',12,'COMMENT','POST_REACTION',8,NULL,NULL),(45,'Your comment received a haha reaction.','2025-12-09 10:11:25.342578',_binary '',11,'COMMENT','POST_REACTION',8,NULL,NULL),(46,'Your comment received a love reaction.','2025-12-09 10:11:27.607798',_binary '',9,'COMMENT','POST_REACTION',7,NULL,NULL),(47,'Your comment received a like reaction.','2025-12-09 10:11:31.324422',_binary '',6,'COMMENT','POST_REACTION',8,NULL,NULL),(48,'Your comment received a haha reaction.','2025-12-09 10:12:33.729940',_binary '',3,'COMMENT','POST_REACTION',7,NULL,NULL),(49,'Your comment received a haha reaction.','2025-12-09 10:12:38.602216',_binary '',10,'COMMENT','POST_REACTION',7,NULL,NULL),(50,'Your post received a haha reaction.','2025-12-09 10:16:26.177615',_binary '',7,'POST','POST_REACTION',8,NULL,NULL),(51,'Bạn đã được xác nhận tham gia sự kiện \"Ủng hộ lũ lụt Miền Trung\"','2025-12-09 10:52:49.201250',_binary '',7,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(52,'Bạn đã được xác nhận tham gia sự kiện \"Ủng hộ lũ lụt Miền Trung\"','2025-12-09 10:52:50.750123',_binary '',7,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(53,'Bạn đã được xác nhận tham gia sự kiện \"Ủng hộ lũ lụt Miền Trung\"','2025-12-09 10:52:51.537018',_binary '',7,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(54,'A new event has been added!','2025-12-09 11:00:29.012384',_binary '',8,'EVENT','EVENT_UPDATE',8,NULL,NULL),(55,'A new event has been added!','2025-12-09 11:00:29.019770',_binary '',8,'EVENT','EVENT_UPDATE',9,NULL,NULL),(56,'Your post received a haha reaction.','2025-12-09 14:27:57.185346',_binary '',9,'POST','POST_REACTION',8,NULL,NULL),(57,'Thông báo từ ban tổ chức: Park Cleanup\n\nXin chào tất cả các bạn bruhhhhhh','2025-12-09 15:20:54.308493',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(58,'Thông báo từ ban tổ chức: Park Cleanup\n\nXin chào tất cả các bạn bruhhhhhh','2025-12-09 15:22:40.213339',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(59,'Thông báo từ ban tổ chức: Park Cleanup\n\nXin chào tất cả các bạn bruhhhhhh','2025-12-09 15:23:07.716985',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(60,'Thông báo từ ban tổ chức: Park Cleanup\n\nXin chào tất cả các bạn bruhhhhhh','2025-12-09 15:24:29.947471',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(61,'Thông báo từ ban tổ chức: \nTập lúc 10 giờ ngày mai nhé bruhhhhh','2025-12-09 15:26:54.114616',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(62,'Thông báo từ ban tổ chức: \nTập lúc 10 giờ ngày mai nhé bruhhhhh','2025-12-09 15:26:56.384373',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(63,'Thông báo từ ban tổ chức: \nTập lúc 10 giờ ngày mai nhé bruhhhhh','2025-12-09 15:27:00.505629',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(64,'Thông báo từ ban tổ chức: \nTập lúc 10 giờ ngày mai nhé bruhhhhh','2025-12-09 15:27:01.752417',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(65,'Thông báo từ ban tổ chức: Park Cleanup\nTập trung lúc 10h sáng bruhhhhhhhh','2025-12-09 15:31:25.540771',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(66,'Thông báo từ ban tổ chức: Park Cleanup\nTập trung lúc 10h sáng bruhhhhhhhh','2025-12-09 15:31:27.763573',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(67,'Thông báo từ ban tổ chức: Park Cleanup\nTập trung lúc 10h sáng bruhhhhhhhh','2025-12-09 15:31:28.789043',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(68,'Thông báo từ ban tổ chức: Park Cleanup\nTập trung lúc 10h sáng bruhhhhhhhh','2025-12-09 15:31:30.037351',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(69,'Thông báo từ ban tổ chức: Park Cleanup\nHelllooooooo','2025-12-09 15:36:20.285310',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(70,'Thông báo từ ban tổ chức: Park Cleanup\nHelllooooooo','2025-12-09 15:36:22.841241',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(71,'Thông báo từ ban tổ chức: Park Cleanup\nHelllooooooo','2025-12-09 15:36:23.893923',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(72,'Thông báo từ ban tổ chức: Park Cleanup\nHelllooooooo','2025-12-09 15:36:25.188798',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(73,'Your post received a haha reaction.','2025-12-09 15:44:08.156166',_binary '',9,'POST','POST_REACTION',8,NULL,NULL),(74,'Your post received a wow reaction.','2025-12-09 15:44:10.621038',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(75,'Your post received a sad reaction.','2025-12-09 15:44:12.814310',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(76,'Your post received a love reaction.','2025-12-09 15:44:18.443520',_binary '',6,'POST','POST_REACTION',7,NULL,NULL),(77,'Your post received a like reaction.','2025-12-09 15:44:20.984132',_binary '',2,'POST','POST_REACTION',7,NULL,NULL),(78,'Your post received a like reaction.','2025-12-09 15:44:22.492747',_binary '',1,'POST','POST_REACTION',7,NULL,NULL),(79,'Your comment received a haha reaction.','2025-12-09 16:09:27.351732',_binary '',13,'COMMENT','POST_REACTION',7,NULL,NULL),(80,'Your comment received a haha reaction.','2025-12-09 16:09:28.929028',_binary '',14,'COMMENT','POST_REACTION',7,NULL,NULL),(81,'Your post received a haha reaction.','2025-12-09 16:10:12.370689',_binary '',9,'POST','POST_REACTION',8,NULL,NULL),(82,'Your post received a haha reaction.','2025-12-09 16:10:14.654453',_binary '',9,'POST','POST_REACTION',8,NULL,NULL),(83,'Thông báo từ ban tổ chức: Park Cleanup\nBruhhhhhhh','2025-12-09 16:39:14.329002',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(84,'Thông báo từ ban tổ chức: Park Cleanup\nBruhhhhhhh','2025-12-09 16:39:14.329002',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(85,'Thông báo từ ban tổ chức: Park Cleanup\nBruhhhh','2025-12-09 16:39:51.915998',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(86,'Thông báo từ ban tổ chức: Park Cleanup\nBruhhhh','2025-12-09 16:39:51.915998',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(87,'Thông báo từ ban tổ chức: Park Cleanup\nLên xe anh đèo','2025-12-09 16:50:16.152602',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(88,'Thông báo từ ban tổ chức: Park Cleanup\nLên xe anh đèo','2025-12-09 16:50:16.152602',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(89,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 16:52:08.452637',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(90,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 16:52:08.452637',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(91,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 16:53:13.378038',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(92,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 16:53:13.378038',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(93,'Thông báo từ ban tổ chức: Park Cleanup\nHihihi','2025-12-09 16:56:28.414839',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(94,'Thông báo từ ban tổ chức: Park Cleanup\nHihihi','2025-12-09 16:56:28.414839',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(95,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:01:35.267190',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(96,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:01:35.267190',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(97,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:11:05.678247',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(98,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:11:05.678247',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(99,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:14:12.560087',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(100,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:14:12.560087',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(101,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:17:28.720946',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(102,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:17:28.720946',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(103,'Thông báo từ ban tổ chức: Park Cleanup\n\ntest','2025-12-09 17:21:27.150514',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(104,'Thông báo từ ban tổ chức: Park Cleanup\n\ntest','2025-12-09 17:21:27.150514',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(105,'Thông báo từ ban tổ chức: Park Cleanup\ntests','2025-12-09 17:22:00.855439',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(106,'Thông báo từ ban tổ chức: Park Cleanup\ntests','2025-12-09 17:22:00.855439',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(107,'Thông báo từ ban tổ chức: Park Cleanup\ntest này','2025-12-09 17:28:15.134615',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(108,'Thông báo từ ban tổ chức: Park Cleanup\ntest này','2025-12-09 17:28:19.072371',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(109,'Thông báo từ ban tổ chức: Park Cleanup\ntest này','2025-12-09 17:28:19.345010',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(110,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:29:15.694645',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(111,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:29:18.836357',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(112,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:29:19.029924',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(113,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:31:47.807923',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(114,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:31:50.509416',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(115,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:31:50.763333',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(116,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:34:08.697267',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(117,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:34:11.457404',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(118,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:34:11.708783',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(119,'Thông báo từ ban tổ chức: Park Cleanup\ntest','2025-12-09 17:38:43.080050',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(120,'Thông báo từ ban tổ chức: Park Cleanup\ntest','2025-12-09 17:38:47.359151',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(121,'Thông báo từ ban tổ chức: Park Cleanup\ntest','2025-12-09 17:38:47.659069',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(122,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:39:24.589645',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(123,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:39:27.438994',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(124,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-09 17:39:27.685407',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(125,'Thông báo từ ban tổ chức: Park Cleanup\n\ntest','2025-12-09 17:53:39.106180',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(126,'Thông báo từ ban tổ chức: Park Cleanup\n\ntest','2025-12-09 17:53:43.282569',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(127,'Thông báo từ ban tổ chức: Park Cleanup\n\ntest','2025-12-09 17:53:43.541291',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(128,'Test','2025-12-09 18:01:48.929053',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(129,'Test','2025-12-09 18:01:52.893134',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(130,'Test','2025-12-09 18:01:53.150532',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(131,'Minh Kiên Dương đã bình luận vào bài viết của bạn.','2025-12-09 18:03:07.724465',_binary '',6,'POST','COMMENT',7,8,'Minh Kiên Dương'),(132,'test','2025-12-09 18:21:50.902851',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(133,'test','2025-12-09 18:21:53.766878',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(134,'test','2025-12-09 18:21:54.022099',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(135,'Test thông báo web push','2025-12-09 18:24:30.918607',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(136,'Test thông báo web push','2025-12-09 18:24:33.728252',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(137,'Test thông báo web push','2025-12-09 18:24:34.010605',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(138,'tesst pop notification','2025-12-09 19:17:33.186095',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(139,'tesst pop notification','2025-12-09 19:17:37.125351',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(140,'tesst pop notification','2025-12-09 19:17:37.370305',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(141,'Test','2025-12-09 19:22:59.504966',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(142,'Test','2025-12-09 19:23:03.516481',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(143,'Test','2025-12-09 19:23:03.780476',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(144,'h','2025-12-09 19:28:02.427159',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(145,'h','2025-12-09 19:28:06.703335',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(146,'h','2025-12-09 19:28:06.951319',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(147,'Test','2025-12-09 19:31:26.361654',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(148,'Test','2025-12-09 19:31:33.519095',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(149,'Test','2025-12-09 19:31:34.059756',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(150,'h','2025-12-09 19:35:46.229632',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(151,'h','2025-12-09 19:35:48.419889',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(152,'h','2025-12-09 19:35:48.615897',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(153,'Test','2025-12-09 19:45:19.734482',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(154,'Test','2025-12-09 19:45:23.419989',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(155,'Test','2025-12-09 19:45:23.710800',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(156,'Test','2025-12-09 19:45:49.002396',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(157,'Test','2025-12-09 19:45:51.744817',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(158,'Test','2025-12-09 19:45:52.014153',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(159,'t','2025-12-09 19:49:13.488672',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(160,'t','2025-12-09 19:49:16.276902',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(161,'t','2025-12-09 19:49:16.569132',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(162,'Test','2025-12-09 19:58:10.867721',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(163,'Test','2025-12-09 19:58:15.409787',_binary '',4,'EVENT','EVENT_UPDATE',9,7,'Kinh Dương Miên'),(164,'Test','2025-12-09 19:58:15.667427',_binary '',4,'EVENT','EVENT_UPDATE',8,7,'Kinh Dương Miên'),(165,'Test gửi từ manager (preview)','2025-12-09 20:16:58.912818',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(166,'Test gửi từ manager (preview)','2025-12-09 20:16:59.008857',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(167,'Test gửi từ manager (preview)','2025-12-09 20:16:59.018664',_binary '',4,'EVENT','EVENT_UPDATE',7,NULL,NULL),(168,'test gửi thông báo pop','2025-12-09 20:17:20.109487',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(169,'test gửi thông báo pop','2025-12-09 20:17:20.124246',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(170,'test','2025-12-09 20:19:24.306519',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(171,'test','2025-12-09 20:19:24.324331',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(172,'test','2025-12-09 20:19:24.338158',_binary '',4,'EVENT','EVENT_UPDATE',7,NULL,NULL),(173,'Xin chào các bạn nhé','2025-12-09 20:19:50.762203',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(174,'Xin chào các bạn nhé','2025-12-09 20:19:50.777644',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(175,'Xin chào các bạn nhé','2025-12-09 20:19:50.788480',_binary '',4,'EVENT','EVENT_UPDATE',7,NULL,NULL),(176,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:01.363613',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(177,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:01.392932',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(178,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:01.408439',_binary '',4,'EVENT','EVENT_UPDATE',7,NULL,NULL),(179,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:55.033107',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(180,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:55.304764',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(181,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: \nĐã fix được lỗi pop notifications yehhh','2025-12-09 20:25:55.315665',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(182,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: Đã fix được lỗi pop notifications yehhh','2025-12-09 20:28:33.488893',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(183,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: Đã fix được lỗi pop notifications yehhh','2025-12-09 20:28:33.496704',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(184,'Ban tổ chức sự kiện tình nguyện (Park Cleanup) xin thông báo: Đã fix được lỗi pop notifications yehhh','2025-12-09 20:28:33.502742',_binary '',4,'EVENT','EVENT_UPDATE',7,NULL,NULL),(185,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:32:57.624410',_binary '\0',9,'EVENT','EVENT_UPDATE',1,NULL,NULL),(186,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:32:57.630703',_binary '',9,'EVENT','EVENT_UPDATE',5,NULL,NULL),(187,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:32:57.635885',_binary '',9,'EVENT','EVENT_UPDATE',7,NULL,NULL),(188,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:32:57.644803',_binary '',9,'EVENT','EVENT_UPDATE',8,NULL,NULL),(189,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:32:57.647596',_binary '',9,'EVENT','EVENT_UPDATE',9,NULL,NULL),(190,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:38:22.510050',_binary '\0',10,'EVENT','EVENT_UPDATE',1,NULL,NULL),(191,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:38:22.516207',_binary '',10,'EVENT','EVENT_UPDATE',5,NULL,NULL),(192,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:38:22.522754',_binary '',10,'EVENT','EVENT_UPDATE',7,NULL,NULL),(193,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:38:22.528334',_binary '',10,'EVENT','EVENT_UPDATE',8,NULL,NULL),(194,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:38:22.530997',_binary '',10,'EVENT','EVENT_UPDATE',9,NULL,NULL),(199,'Đăng ký của bạn cho sự kiện \"Hiến máu tình nguyện\" đã được duyệt.','2025-12-09 20:44:58.641768',_binary '',10,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(200,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:51:43.502261',_binary '\0',11,'EVENT','EVENT_UPDATE',1,NULL,NULL),(201,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:51:43.520217',_binary '',11,'EVENT','EVENT_UPDATE',5,NULL,NULL),(202,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:51:43.521731',_binary '',11,'EVENT','EVENT_UPDATE',7,NULL,NULL),(203,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:51:43.533454',_binary '',11,'EVENT','EVENT_UPDATE',8,NULL,NULL),(204,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-09 20:51:43.539493',_binary '',11,'EVENT','EVENT_UPDATE',9,NULL,NULL),(205,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã được duyệt.','2025-12-09 20:59:20.327201',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(206,'Nếu Ngày Ấy đã bình luận vào bài viết của bạn.','2025-12-16 08:45:18.227669',_binary '',9,'POST','COMMENT',8,9,'Nếu Ngày Ấy'),(207,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã được duyệt.','2025-12-16 08:47:35.501986',_binary '',11,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(208,'Minh Kiên Dương đã phản ứng (HAHA) với bài viết của bạn.','2025-12-17 12:06:02.216645',_binary '',6,'POST','POST_REACTION',7,8,'Minh Kiên Dương'),(209,'Minh Kiên Dương đã phản ứng (ANGRY) với bài viết của bạn.','2025-12-17 12:06:06.061107',_binary '',2,'POST','POST_REACTION',7,8,'Minh Kiên Dương'),(210,'Minh Kiên Dương đã phản ứng (ANGRY) với bài viết của bạn.','2025-12-17 12:06:13.458374',_binary '',1,'POST','POST_REACTION',7,8,'Minh Kiên Dương'),(211,'Minh Kiên Dương đã phản ứng (ANGRY) với bài viết của bạn.','2025-12-17 12:06:18.629816',_binary '',2,'POST','POST_REACTION',7,8,'Minh Kiên Dương'),(212,'Thông báo từ ban tổ chức: Park Cleanup\nMai tập hợp tại Vincom','2025-12-17 12:24:53.649344',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(213,'Thông báo từ ban tổ chức: Park Cleanup\nMai tập hợp tại Vincom','2025-12-17 12:24:53.676227',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(214,'Thông báo từ ban tổ chức: Park Cleanup\nXác nhận','2025-12-17 12:26:01.871791',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(215,'Thông báo từ ban tổ chức: Park Cleanup\nXác nhận','2025-12-17 12:26:01.880274',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(216,'Thông báo từ ban tổ chức: Park Cleanup\nHello','2025-12-17 12:26:19.094249',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(217,'Thông báo từ ban tổ chức: Park Cleanup\nHello','2025-12-17 12:26:19.104613',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(218,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:29:44.476351',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(219,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:29:44.485474',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(220,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:31:47.250167',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(221,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:31:47.257210',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(222,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:42:09.796821',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(223,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:42:09.804823',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(224,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:53:46.882085',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(225,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 12:53:47.248489',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(226,'Kinh Dương Miên đã bình luận vào bài viết của bạn.','2025-12-17 12:59:19.905479',_binary '',9,'POST','COMMENT',8,7,'Kinh Dương Miên'),(227,'Kinh Dương Miên đã phản ứng (LOVE) với bài viết của bạn.','2025-12-17 12:59:33.653254',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(228,'Kinh Dương Miên đã phản ứng (LOVE) với bài viết của bạn.','2025-12-17 12:59:34.803146',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(229,'Kinh Dương Miên đã phản ứng (LOVE) với bài viết của bạn.','2025-12-17 12:59:35.243904',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(230,'Kinh Dương Miên đã phản ứng (LIKE) với bài viết của bạn.','2025-12-17 12:59:38.668934',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(231,'Kinh Dương Miên đã phản ứng (LIKE) với bài viết của bạn.','2025-12-17 13:00:25.119559',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(232,'Kinh Dương Miên đã phản ứng (LIKE) với bài viết của bạn.','2025-12-17 13:00:30.761894',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(233,'Kinh Dương Miên đã phản ứng (LOVE) với bài viết của bạn.','2025-12-17 13:00:34.108117',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(234,'Kinh Dương Miên đã phản ứng (LOVE) với bài viết của bạn.','2025-12-17 13:00:38.553944',_binary '',9,'POST','POST_REACTION',8,7,'Kinh Dương Miên'),(235,'Minh Kiên Dương đã bình luận vào bài viết của bạn.','2025-12-17 13:02:16.943442',_binary '',2,'POST','COMMENT',7,8,'Minh Kiên Dương'),(236,'Minh Kiên Dương đã bình luận vào bài viết của bạn.','2025-12-17 13:02:18.503582',_binary '',2,'POST','COMMENT',7,8,'Minh Kiên Dương'),(237,'Minh Kiên Dương đã bình luận vào bài viết của bạn.','2025-12-17 13:02:19.853856',_binary '',2,'POST','COMMENT',7,8,'Minh Kiên Dương'),(238,'Minh Kiên Dương đã bình luận vào bài viết của bạn.','2025-12-17 13:02:20.758786',_binary '',2,'POST','COMMENT',7,8,'Minh Kiên Dương'),(239,'Thông báo từ ban tổ chức: Park Cleanup\nCheckkk','2025-12-17 13:03:09.759756',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(240,'Thông báo từ ban tổ chức: Park Cleanup\nCheckkk','2025-12-17 13:03:10.008909',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(241,'Đăng ký của bạn cho sự kiện \"Hiến máu tình nguyện\" đã được duyệt.','2025-12-17 13:07:08.687234',_binary '',10,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(242,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 13:25:29.820481',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(243,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 13:25:30.107371',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(244,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 13:28:12.446695',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(245,'Thông báo từ ban tổ chức: Park Cleanup\nCheck','2025-12-17 13:28:12.795730',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(246,'Thông báo từ ban tổ chức: Park Cleanup\nHellooooo','2025-12-17 13:28:43.625040',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(247,'Thông báo từ ban tổ chức: Park Cleanup\nHellooooo','2025-12-17 13:28:43.915654',_binary '',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(248,'Thông báo từ ban tổ chức: Park Cleanup\nHey','2025-12-17 13:32:35.616322',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(249,'Thông báo từ ban tổ chức: Park Cleanup\nHey','2025-12-17 13:32:35.625378',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(250,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:36:02.651762',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(251,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:36:02.658182',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(252,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:37:31.592016',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(253,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:37:31.943968',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(254,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:37:46.088548',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(255,'Thông báo từ ban tổ chức: Park Cleanup\nThử','2025-12-17 13:37:46.738207',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(256,'Ai đó đã phản ứng (HAHA) với bình luận của bạn.','2025-12-17 13:41:28.174791',_binary '',6,'COMMENT','POST_REACTION',8,NULL,NULL),(257,'Thông báo từ ban tổ chức: Park Cleanup\nSoạn thêm','2025-12-17 13:44:16.721652',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(258,'Thông báo từ ban tổ chức: Park Cleanup\nSoạn thêm','2025-12-17 13:44:17.060003',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(259,'Ai đó đã phản ứng (HAHA) với bình luận của bạn.','2025-12-17 13:45:22.998990',_binary '',23,'COMMENT','POST_REACTION',7,NULL,NULL),(260,'Kinh Dương Miên đã bình luận vào bình luận của bạn.','2025-12-17 14:14:09.205335',_binary '',6,'COMMENT','COMMENT',8,7,'Kinh Dương Miên'),(261,'Thông báo từ ban tổ chức: Park Cleanup\ntest','2025-12-17 14:14:41.324270',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(262,'Thông báo từ ban tổ chức: Park Cleanup\ntest','2025-12-17 14:14:41.608144',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(263,'Ai đó đã phản ứng (LOVE) với bình luận của bạn.','2025-12-17 14:23:38.484575',_binary '',11,'COMMENT','POST_REACTION',8,NULL,NULL),(264,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-17 14:24:11.415517',_binary '',4,'EVENT','EVENT_UPDATE',8,NULL,NULL),(265,'Thông báo từ ban tổ chức: Park Cleanup','2025-12-17 14:24:11.737490',_binary '\0',4,'EVENT','EVENT_UPDATE',9,NULL,NULL),(267,'Đăng ký của bạn cho sự kiện \"Kiến thức đến vùng quê\" đã được duyệt.','2025-12-18 20:23:28.552659',_binary '',8,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(268,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:50.034889',_binary '',4,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(269,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:50.080795',_binary '\0',4,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(270,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:50.330875',_binary '\0',4,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(271,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:50.874887',_binary '',4,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(272,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:51.052216',_binary '',4,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(273,'Đăng ký của bạn cho sự kiện \"Park Cleanup\" đã hoàn thành.','2025-12-18 20:23:56.359427',_binary '',4,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(274,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:24:41.845692',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(275,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:24:41.888521',_binary '\0',11,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(276,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:24:42.148284',_binary '\0',11,'EVENT','EVENT_REGISTRATION',9,NULL,NULL),(277,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:24:49.037286',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(278,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:26:08.270608',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(279,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã bị huỷ.','2025-12-18 20:26:15.783518',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(280,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:26:16.169290',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(281,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã bị huỷ.','2025-12-18 20:26:20.494523',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(282,'Đăng ký của bạn cho sự kiện \"Chia sẻ yêu thương\" đã hoàn thành.','2025-12-18 20:26:20.863657',_binary '',11,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(283,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 20:58:15.987544',_binary '\0',12,'EVENT','EVENT_UPDATE',1,NULL,NULL),(284,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 20:58:15.994724',_binary '',12,'EVENT','EVENT_UPDATE',5,NULL,NULL),(285,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 20:58:15.999615',_binary '',12,'EVENT','EVENT_UPDATE',7,NULL,NULL),(286,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 20:58:16.004471',_binary '',12,'EVENT','EVENT_UPDATE',8,NULL,NULL),(287,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 20:58:16.009925',_binary '\0',12,'EVENT','EVENT_UPDATE',9,NULL,NULL),(288,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:02:43.068571',_binary '\0',13,'EVENT','EVENT_UPDATE',1,NULL,NULL),(289,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:02:43.073659',_binary '',13,'EVENT','EVENT_UPDATE',5,NULL,NULL),(290,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:02:43.081120',_binary '',13,'EVENT','EVENT_UPDATE',7,NULL,NULL),(291,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:02:43.087078',_binary '',13,'EVENT','EVENT_UPDATE',8,NULL,NULL),(292,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:02:43.091624',_binary '\0',13,'EVENT','EVENT_UPDATE',9,NULL,NULL),(293,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:35.655266',_binary '\0',14,'EVENT','EVENT_UPDATE',1,NULL,NULL),(294,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:35.666497',_binary '',14,'EVENT','EVENT_UPDATE',5,NULL,NULL),(295,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:35.678640',_binary '',14,'EVENT','EVENT_UPDATE',7,NULL,NULL),(296,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:35.687050',_binary '',14,'EVENT','EVENT_UPDATE',8,NULL,NULL),(297,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:35.692583',_binary '\0',14,'EVENT','EVENT_UPDATE',9,NULL,NULL),(298,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:37.526414',_binary '\0',15,'EVENT','EVENT_UPDATE',1,NULL,NULL),(299,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:37.532186',_binary '',15,'EVENT','EVENT_UPDATE',5,NULL,NULL),(300,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:37.537260',_binary '',15,'EVENT','EVENT_UPDATE',7,NULL,NULL),(301,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:37.546885',_binary '',15,'EVENT','EVENT_UPDATE',8,NULL,NULL),(302,'Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!','2025-12-18 21:06:37.551433',_binary '\0',15,'EVENT','EVENT_UPDATE',9,NULL,NULL),(303,'Đăng ký của bạn cho sự kiện \" International Voluntary Workcamp (Trại tình nguyện quốc tế)\" đã được duyệt.','2025-12-18 21:30:52.454991',_binary '',13,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(304,'Đăng ký của bạn cho sự kiện \"Summer Youth Volunteer Campaign\" đã được duyệt.','2025-12-18 22:14:59.797443',_binary '',14,'EVENT','EVENT_REGISTRATION',8,NULL,NULL),(305,'Đăng ký của bạn cho sự kiện \" International Voluntary Workcamp (Trại tình nguyện quốc tế)\" đã được duyệt.','2025-12-19 18:36:47.160536',_binary '',13,'EVENT','EVENT_REGISTRATION',10,NULL,NULL),(306,'Thông báo từ ban tổ chức:  International Voluntary Workcamp (Trại tình nguyện quốc tế)\nChào mọi người','2025-12-19 18:41:02.338299',_binary '',13,'EVENT','EVENT_UPDATE',10,NULL,NULL),(307,'Thông báo từ ban tổ chức:  International Voluntary Workcamp (Trại tình nguyện quốc tế)\nChào','2025-12-19 18:43:19.497349',_binary '',13,'EVENT','EVENT_UPDATE',10,NULL,NULL),(308,'Thông báo từ ban tổ chức:  International Voluntary Workcamp (Trại tình nguyện quốc tế)','2025-12-19 18:46:03.765188',_binary '',13,'EVENT','EVENT_UPDATE',10,NULL,NULL),(309,'Kinh Dương Miên đã phản ứng (HAHA) với bài viết của bạn.','2025-12-19 19:34:03.332399',_binary '',13,'POST','POST_REACTION',10,7,'Kinh Dương Miên'),(310,'Kinh Dương Miên đã bình luận vào bài viết của bạn.','2025-12-19 19:34:14.603706',_binary '',13,'POST','COMMENT',10,7,'Kinh Dương Miên');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `otp_type` enum('REGISTER','RESET_PASSWORD') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `type` enum('REGISTER','RESET_PASSWORD') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdrrkob03otk15fxe9b0bkkp35` (`user_id`),
  CONSTRAINT `FKdrrkob03otk15fxe9b0bkkp35` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `announcement` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3v4llf5c3wukq0k29f522erpe` (`event_id`),
  KEY `FK72mt33dhhs48hf9gcqrq4fxte` (`user_id`),
  CONSTRAINT `FK3v4llf5c3wukq0k29f522erpe` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FK72mt33dhhs48hf9gcqrq4fxte` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,'Updated: Meeting point moved to the community center.','2025-10-18 18:09:25.960929','APPROVED','2025-12-05 19:16:08.898318',4,7,_binary '\0'),(2,'Hello xin chào tất cả các bạn đã tham gia cấy ni.','2025-10-20 14:25:48.471294','APPROVED','2025-10-20 14:25:48.472344',4,7,_binary '\0'),(6,'XIn chào tất cả các bạn nhé','2025-12-05 19:26:17.880114','APPROVED','2025-12-05 19:26:17.880114',4,7,_binary '\0'),(13,'Con heo','2025-12-19 18:37:53.504829','APPROVED',NULL,13,10,_binary '\0');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_media_files`
--

DROP TABLE IF EXISTS `post_media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_media_files` (
  `post_id` bigint NOT NULL,
  `media_files` varchar(255) DEFAULT NULL,
  KEY `FKtrbsmd9yiit0cjsvok9dc0i0r` (`post_id`),
  CONSTRAINT `FKtrbsmd9yiit0cjsvok9dc0i0r` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_media_files`
--

LOCK TABLES `post_media_files` WRITE;
/*!40000 ALTER TABLE `post_media_files` DISABLE KEYS */;
INSERT INTO `post_media_files` VALUES (13,'post/1766169473475_heo.webp');
/*!40000 ALTER TABLE `post_media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscription`
--

DROP TABLE IF EXISTS `push_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auth_key` varchar(5000) NOT NULL,
  `endpoint` varchar(2000) NOT NULL,
  `public_key` varchar(5000) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK59avwrc3dqa9qrr19b9bbvjoy` (`user_id`),
  CONSTRAINT `FK59avwrc3dqa9qrr19b9bbvjoy` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=374 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscription`
--

LOCK TABLES `push_subscription` WRITE;
/*!40000 ALTER TABLE `push_subscription` DISABLE KEYS */;
INSERT INTO `push_subscription` VALUES (369,'_cw5rRGTbki_qa5eG9RYxg','https://fcm.googleapis.com/fcm/send/frholXKMsOI:APA91bGomg0FJxJ-CzAv8X0vat0BXoYWD-FrP1_l-TtxjS_4NeqjDP9wQho-JMm9gYRuq9yUYFg3O064nVhjvflXQ7rAacYfbxWryoWj5Q_h9df8kUtYT1Uhs-Gg7ugcjTk7jh1Mu7h4','BE95-KszZ6LfNqq07IZJdYeAH1GRclbJzZyicN0eAi3GnDE8ls1qp45oBiDMZX5BGPs-RStQ228R7UpwY4d_AuY',10),(370,'TXDo0nGDDJkkGS8FeRWSkw','https://wns2-pn1p.notify.windows.com/w/?token=BQYAAABd2uKFyFFuiq5DqmrsOu%2bHTRT5KwSadRXyIHwOnohfvTeVPKSShN8emk%2fnznXGWHNvbuGyzoKQUpxzILge%2f10pel8BrG2IpxWC3zoLvOQ17rNcXknzOi4et6evEUSrVmFRIXHIEW1qEBZudY2OTwG8Fl4VbRYhyLHDvH1zxZldALAxP5xX41lgwBGMkGJCRvjEfpUk0XuVSnyxD7vT5g5nOZdxo9wTKzJSMZt%2bF0LfmmdBt3N6pmerjOWNeqRQLSzymmfkSnVYISore0WLtAcUqykwcpQ%2fWSkIUeJIs2ErdP70VI4FBM2%2b9sQiGLbrl33o%2fXa1oM%2f5m8Ig%2b6Ag5BKY','BKHSJ9vzpe-8QoOjNvnzFvTlh916WfbvYgkr1nfUrIJHrQD1-eOm4C90sft9zoHuj-NU3VCzk5k4ratHRSkn8Zo',9),(371,'HBzzrrS5CwRs2Vq7Uoxs1w','https://fcm.googleapis.com/fcm/send/eGD5_r6Y2ao:APA91bGubx-V0jvknFQZehQx9xGP-waw4vN-_C9tryI6bgJpqsP1cDwsADqnCnth24HbEcVT6utQYZ0HgHF8QegiaF9DICnFNJpY6qQ3LMus8KydB-cEeG9a04nmnh7pB9S0eL40ZDLX','BE2ascsnXNn7r1FlZQs8yGldXEHhMyWLa7NH4hOi6idrLGanPsghCP9rfXDH0LQr2cnYiwWfbIcp1rn_CRJzlMM',7),(372,'Ot_nM4a9gMcO6rIzh6KtsQ','https://fcm.googleapis.com/fcm/send/dNhD-DwXULk:APA91bFs8P6mykrA4j7YGHw2NXaHlno45vDJKLv0hD5jUFHy72mz2oPiK6BftdzjUgUYdE3KKsJMWUNs0RzVn1UW8HPgpRyfiyTct7PgzuB5eAprUBiV1yQbQgg54cahEECGb3aC_44f','BK-GhFmNpBEMPyhaSQMOvIDPZ2ClscchWlBY3NHaTzMwyYCGl5AQB8r3fPNySA_fo7zymdWyyNbp2HTPeKgJuAg',5),(373,'C2wLJWffeIlTEFsJ7sf0KQ','https://fcm.googleapis.com/fcm/send/d8ptO9dYwhc:APA91bEaUDHBTvQ3hBibDPgxaTEAvqa3cxGxhzL63j8tsQWzuqAejSRQ13765jbATRGCTnDq9hen0t4ATYripKgn1oJVEPbV8uKr4UkpAjtCmtp_2LUsbRJOrqNrtPI4KJwKUxxXwjez','BLg0XemOXy3dRnRdeL3T_8Wed8W-7Kw3UxMVN35eYQDWjrYzjvQ1iLRXxiFHD_e2KA3fEfgTPD3Ae14KbZ8UqZo',5);
/*!40000 ALTER TABLE `push_subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscription_backup`
--

DROP TABLE IF EXISTS `push_subscription_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscription_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `auth_key` varchar(5000) NOT NULL,
  `endpoint` varchar(2000) NOT NULL,
  `public_key` varchar(5000) NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscription_backup`
--

LOCK TABLES `push_subscription_backup` WRITE;
/*!40000 ALTER TABLE `push_subscription_backup` DISABLE KEYS */;
INSERT INTO `push_subscription_backup` VALUES (1,'Cwx3S0hD6eXkj_pq3w3UXOOpuw3d3uFGcJJn4qhY3z0','https://fcm.googleapis.com/fcm/send/abc...','BBaLZ87GwW4SMSoMQ1TYaAVGoqgkZRL-BOjUBdh4Fy0ag_dgXAy1GQff-7Q8RMRC7IHqwGY3d5QjmXZOI11jNGM',5),(2,'Cwx3S0hD6eXkj_pq3w3UXOOpuw3d3uFGcJJn4qhY3z0','https://fcm.googleapis.com/fcm/send/abc...','BBaLZ87GwW4SMSoMQ1TYaAVGoqgkZRL-BOjUBdh4Fy0ag_dgXAy1GQff-7Q8RMRC7IHqwGY3d5QjmXZOI11jNGM',5),(3,'Cwx3S0hD6eXkj_pq3w3UXOOpuw3d3uFGcJJn4qhY3z0','https://fcm.googleapis.com/fcm/send/abc...','BBaLZ87GwW4SMSoMQ1TYaAVGoqgkZRL-BOjUBdh4Fy0ag_dgXAy1GQff-7Q8RMRC7IHqwGY3d5QjmXZOI11jNGM',5),(4,'Cwx3S0hD6eXkj_pq3w3UXOOpuw3d3uFGcJJn4qhY3z0','https://fcm.googleapis.com/fcm/send/abc...','BBaLZ87GwW4SMSoMQ1TYaAVGoqgkZRL-BOjUBdh4Fy0ag_dgXAy1GQff-7Q8RMRC7IHqwGY3d5QjmXZOI11jNGM',9),(5,'0coc84tiBjd4JXjQw3nP_A','https://fcm.googleapis.com/fcm/send/c6PnJzOcOcw:APA91bF0rlXtkqERvY7alp8C3mMFlya_HP4KQ5IF1t3aXYfjMxeDmkRt2ppagvC_-cuBL2bjAxcEaRY7tB4P5IfnEHdha6R7_kVtUnyZqORwk4c_3Yu0X5aRa-05JOKs7MyZQkbdl_UX','BNN9eO9dxyMK6YQAcPIREHOs43WLEGYZzzQ9WZVgIlE8i0PvX2U6M01HNbUWpOpP33Pm16qhEAgmfXxRTp7Xc6s',8),(6,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(7,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(8,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(9,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(10,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(11,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(12,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(13,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(14,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(15,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(16,'-ZxWaS29wIhyEmOhnexYAg','https://fcm.googleapis.com/fcm/send/ffSRigCnhag:APA91bFpC_a-iF0I3z60edzjaqGiTDz5LxG2DjjVyhF8et8hGWBHwWnw77u2op-sDSksF5r58Y7aJt5GX8tVcRvrraLXzhSI1GBegaVuezJqybE4Zsi3aG9gSnSk1NMK1_XIp84cyaa9','BLbXoeQt0mtkvxp_16JyI2wPbComT_Uc8HUovHCxFXWRZW3IsTfBKHEXnHlXR8eOB_jmQEuOV0FJzYFsmNB6iI0',8),(17,'TXDo0nGDDJkkGS8FeRWSkw','https://wns2-pn1p.notify.windows.com/w/?token=BQYAAABd2uKFyFFuiq5DqmrsOu%2bHTRT5KwSadRXyIHwOnohfvTeVPKSShN8emk%2fnznXGWHNvbuGyzoKQUpxzILge%2f10pel8BrG2IpxWC3zoLvOQ17rNcXknzOi4et6evEUSrVmFRIXHIEW1qEBZudY2OTwG8Fl4VbRYhyLHDvH1zxZldALAxP5xX41lgwBGMkGJCRvjEfpUk0XuVSnyxD7vT5g5nOZdxo9wTKzJSMZt%2bF0LfmmdBt3N6pmerjOWNeqRQLSzymmfkSnVYISore0WLtAcUqykwcpQ%2fWSkIUeJIs2ErdP70VI4FBM2%2b9sQiGLbrl33o%2fXa1oM%2f5m8Ig%2b6Ag5BKY','BKHSJ9vzpe-8QoOjNvnzFvTlh916WfbvYgkr1nfUrIJHrQD1-eOm4C90sft9zoHuj-NU3VCzk5k4ratHRSkn8Zo',7),(357,'uGV73mEgmpBNz-fBIFPkDg','https://fcm.googleapis.com/fcm/send/fQColWLR0VA:APA91bF25_opUTB8Fe81X-_ARyrnPr__ioeJCFvHTdY9F03Nvnshfeimv7E2GfnObklf4wKj8jvEnrEHuz0EWKGvufyl4Dok7EAELPrginF8ANcTwTeMLndT3a6-38dba6v5PWPd5Het','BAk28S9rci0O-ULuabMJkFsilCu-rFMlJ4ehjmj2VB85YVhEMTm9I5QYwNj-typmvUvNjx0czjVAMkcbmtrx4og',7),(359,'MGWelzQenRAteoSyPDIrNw','https://fcm.googleapis.com/fcm/send/eUgG19t87SI:APA91bEFLl6fJGjacEYgmGYRpp3FJFF1OLor5VnpFWIk1K0e94U2pivYiOZKv_TkL0f3vdU07At5L0ROCmWh29-2z96CZzIAj2G0JLzaEGwojjrYD7kSflLVPcYKNA8XZtNYMjcV4ygT','BHlkrvywTd89EdIxd8giKccV29m8b6UYYfIcy3EuxByU5f2oT54MCbXO7ZPBCv5nxpPLEJcvxe-XQN7lgi0sCos',7),(360,'ixl5nONDR-OBv_5LvMFkUw','https://fcm.googleapis.com/fcm/send/e4KmYDaA7kk:APA91bHbF4kHkzIUlTq_2TuXtAKDcGtecHol9h0r3zXwZxFPnQ21AdLyitBcLVI2anZr6zoX5DkrGTEvoinsbuwxFqXIsfRKDZ3PsGBazlsbjt_IMsT4dehmZ3C17_bFErZOFBaqPfeY','BDOWqCFoUoJLYtOXhYUYpMFXKyroHMYb0hbEN8pEwM9vXvH1Xbx20sPOof804UXel6bDjGmwvt50fghjVhqOJ5g',7),(361,'i_BRqgf1Cm_BD9nPbk64gw','https://fcm.googleapis.com/fcm/send/evKmc_CjR5U:APA91bHFokijA1_h33XJD1qLbPBATzZj3ss7sQd-sezuSZrUnGVnmlt8DjN7srDOEeL5sewIkoh5n6iIvA6N0viQmXbz4y4ePzTOFjoJFB13tIXvkO9cl9uEtyYuBQDI3b_O5-O0g6NZ','BNukAewqX2qEbwrlTpE9tVHE9nE01mxnNcRp5Z372krbUP_EcQqqjDUJ5TrN6lBVu5kG4Ua6EZd5gzuXhXq5efs',7),(362,'3mkxMnAd5fVSNJlIinXjeg','https://fcm.googleapis.com/fcm/send/cWWd0hc96Zo:APA91bH35yoCCcvuTZs5uRLKb9If8Z8kT4cbFAC05pc6F2HiEqRK19_jVPCiVHtbOt5jMX7Rogsdk1MA9ZGXEL0HCJBseMEXbq32NxOCsQK5j8Pwy7qN48PZEHDp9ln9SNmjG38RGz4G','BBPIoucKiL0uD0DZwfknKeCWLGMgZ4o5Vc6_G483QF5PWVO45sRUM8CPLC2p1zwV35NYotByCzl4dZyns9pCgb0',7),(363,'rS3VQLyWy5uUULz0p16AVQ','https://fcm.googleapis.com/fcm/send/dFCmRm4AH9o:APA91bFa80NaFvD3t3JFrre0xwurrBCCo3OHwjSl3GgHyMYHSbkHosxrWSA0p6um1fpRvO94Dmf819l0rI_O-6AdKICIEIzZ-qLgaKBglWXpAtcKHe7QJHLBet4uCW3jAvRU7jA6EIo_','BJPTGzz2-M1QMBHQZbGLZnNVrStQuG6UZQ-5MffWsdeZkFTNM8l8Z2wP18QtYEiVfPagCVLoO7Jta_dtWCPCui8',7),(364,'8qxZnRF6TQyCfQu5h8yo-Q','https://fcm.googleapis.com/fcm/send/dE1PGslD13A:APA91bHcHSGUlB9gd918u0Np_woSRQKwwBH3dYpsc68HfVvOK_bl4UyO84xoodoyP-ino1hjuVbBSBOSZLTFhSKpotGXqEcJuILSlVXNPgblnmXOyIZEgpFO7APKx9fXzIdGvQR-idoY','BLRPYsJQl1LO8D60j-T9csTjZSPEFXH7uisBs7M632dj_6X3Yl5jdNEPe1F8ofYS6qDvz6Zttkh-qSLccKxo2xE',7),(365,'5CTEDVDE8GEgzkc8hziPYw','https://fcm.googleapis.com/fcm/send/dtY-9-G5GQU:APA91bFGczNWlR0QcSyFMA_IMgykMKZ6rCHw3QptNIHGNdtmmBE4Wp8j25r5EpnSgq3_S9IjAlGV0Mu0U3x2s54aS35l23QLzejyMwZCDFW2ma33xKPDpd6ZK6LbceDrwplBq6MlruFU','BBLb-Lix8NMZg1to4qrr7Qa7c3viq2vi1VPVJngCWP4rAx1ZAyGnQr7B_y_N8ZjowhbjqnE_IBCGkQ_pI2c3Ia8',7),(366,'8W8Z4ev7ZUZ0nJkjtepkcA','https://fcm.googleapis.com/fcm/send/e3TjtljVqB0:APA91bH5XGwOyrGhcYtZnuxTsqGaRrqhPKXM7ToTgf5nk3Qy-GtMHBwG15jneaFH8Nmgrh9LkKhIy1ttWv-5Tt10QwE7sazWa0JoHiGj5e5IVolPm4AUUxGk08KVHLJlGySobOxVX7ea','BIH3p9a1NPQV3tdnew5FTvjr_J-yNdAg585KTJ61Ey_Q-Yow9Yp8stQwUgsDs5_P5x4owB4Ck4GuZLV_YxotQIA',7),(367,'vOA5cjo1HDvSUkCoujVaSw','https://fcm.googleapis.com/fcm/send/c6dwp5vlbAY:APA91bEN8s6quEJ13ep5FNAx04Go4qAQK2Q_cXy7uvR3S79N815ZK8BTs6MtWjqjZgow5g0wGlz751bLbKpcCZHqMGt24masSYBQ4vnIJhsmWn-S5Igjq9kHSACIimCrHCdL16OWBVaA','BKn_odnb-BfzMZ2MYjcSo2ngKuu4d8v8Cs27u8MC4IcqhbLO7QqeUYRUTpQ5bpbvPOpHaqKfi3z16-b5NEB3-vY',7);
/*!40000 ALTER TABLE `push_subscription_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reaction`
--

DROP TABLE IF EXISTS `reaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `reaction_type` enum('ANGRY','HAHA','LIKE','LOVE','SAD','WOW') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment_id` bigint DEFAULT NULL,
  `post_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKq22wutbp9jupnpfls6gb0ksu1` (`user_id`,`comment_id`),
  UNIQUE KEY `UK1cis5eqxvas998b9c742jy4ht` (`user_id`,`post_id`),
  KEY `FKskbqddo2ffvogxr3f22awp2wa` (`comment_id`),
  KEY `FKathfhl7fif9f9mggdjhg7ktdt` (`post_id`),
  CONSTRAINT `FKathfhl7fif9f9mggdjhg7ktdt` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  CONSTRAINT `FKp68qgeq3telx6adl7hssrdxbw` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKskbqddo2ffvogxr3f22awp2wa` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reaction`
--

LOCK TABLES `reaction` WRITE;
/*!40000 ALTER TABLE `reaction` DISABLE KEYS */;
INSERT INTO `reaction` VALUES (1,'2025-10-20 15:58:47.378852','WOW','2025-10-20 16:01:28.003751',NULL,2,7),(7,'2025-12-05 19:32:29.226336','WOW','2025-12-05 19:32:30.249664',NULL,6,7),(8,'2025-12-05 19:36:56.198051','HAHA','2025-12-09 16:09:03.004176',NULL,1,7),(21,'2025-12-09 10:02:36.829776','HAHA',NULL,8,NULL,8),(27,'2025-12-09 10:02:52.639336','LIKE','2025-12-09 10:02:57.385455',5,NULL,8),(28,'2025-12-09 10:03:00.676061','LOVE',NULL,7,NULL,8),(33,'2025-12-09 10:11:21.714012','HAHA',NULL,12,NULL,8),(35,'2025-12-09 10:11:27.599986','LOVE',NULL,9,NULL,8),(36,'2025-12-09 10:11:31.317684','LIKE',NULL,6,NULL,8),(37,'2025-12-09 10:12:33.704122','HAHA',NULL,3,NULL,8),(38,'2025-12-09 10:12:38.591593','HAHA',NULL,10,NULL,8),(44,'2025-12-09 15:44:18.436451','LOVE',NULL,NULL,6,9),(45,'2025-12-09 15:44:20.974339','LIKE',NULL,NULL,2,9),(46,'2025-12-09 15:44:22.484031','LIKE',NULL,NULL,1,9),(54,'2025-12-17 12:06:02.179355','HAHA',NULL,NULL,6,8),(56,'2025-12-17 12:06:13.451906','ANGRY',NULL,NULL,1,8),(57,'2025-12-17 12:06:18.620819','ANGRY',NULL,NULL,2,8),(66,'2025-12-17 13:41:28.163082','LOVE','2025-12-17 14:30:32.325718',6,NULL,7),(67,'2025-12-17 13:45:22.991497','HAHA',NULL,23,NULL,7),(68,'2025-12-17 14:23:38.470900','LOVE',NULL,11,NULL,7),(69,'2025-12-17 14:30:57.328231','LOVE',NULL,12,NULL,7),(70,'2025-12-19 18:52:46.075276','HAHA',NULL,NULL,13,10),(71,'2025-12-19 19:34:03.216878','HAHA',NULL,NULL,13,7);
/*!40000 ALTER TABLE `reaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `avatar_file` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `role` enum('ADMIN','EVENT_MANAGER','VOLUNTEER') DEFAULT NULL,
  `status` enum('ACTIVE','BANNED','INACTIVE') DEFAULT NULL,
  `subscription_id` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `verification_status` enum('UNVERIFIED','VERIFIED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Default Admin Address',NULL,NULL,'admin@gmail.com','Quản Trị Viên Chính',NULL,'$2a$10$w0fM6OYMD07qc2urAjil9uJbMlE62jftbPJDUxKT/Rewms9G/jOMS','0123456789','ADMIN','ACTIVE',NULL,NULL,'VERIFIED'),(5,'123 Main St',NULL,'2025-10-15 15:40:17.601449','22022217@vnu.edu.vn','Dương Minh Kiên',NULL,'$2a$10$lI7UBYa9wG92G4tWUlqyFeSehaWxnH3cIAHDZ32d.KyVNox49H4EC','0338138386','ADMIN','ACTIVE',NULL,'2025-10-16 21:14:03.688966','VERIFIED'),(7,'123 Main St','avatar_bd2b7697-27bb-4efc-a22c-6c5559ab2920.jpg','2025-10-17 17:25:43.933766','kienabc1235@gmail.com','Kinh Dương Miên',NULL,'$2a$10$O/8Kqr7fOm16id.g/R122.s006nplzpvZB8pi917E.vHxftwnldCK','0123456789','EVENT_MANAGER','ACTIVE',NULL,'2025-12-19 19:52:33.504433','VERIFIED'),(8,'123 Main St','avatar_85f1b0db-23aa-4917-bb65-731149e81639.jpg','2025-10-18 15:54:56.139152','kienduong612@gmail.com','Minh Kiên Dương',NULL,'$2a$10$LHFlyg60ue0d9/lkxVfLGeW.cakpQzkwzWtSXNPHwoKd7Dt14We6e','0123456789','VOLUNTEER','ACTIVE',NULL,'2025-12-16 10:01:13.627412','VERIFIED'),(9,'123 Main St',NULL,'2025-10-18 17:03:42.231731','duongkien12a3@gmail.com','Nếu Ngày Ấy',NULL,'$2a$10$StxLCcyJYoGGzMQCwYxQx.LBJms5msnOcWra./7.7g1dwu8sNZDR6','0123456789','VOLUNTEER','ACTIVE',NULL,NULL,'VERIFIED'),(10,'Quỳnh Lưu','avatar_a5eb48c1-dab0-40f1-b22b-03c633cde621.webp','2025-12-19 18:30:04.400948','hieudainhanqt2@gmail.com','Trương Đức Hiếu',NULL,'$2a$10$dVbWIgRI9vEiY1wRPBRO9OczlVzpfb/YleIi74BsFMRBohbA/CSaC','0135695616','VOLUNTEER','ACTIVE',NULL,'2025-12-19 18:32:39.930941','VERIFIED');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'volunteer_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-20  3:02:29
