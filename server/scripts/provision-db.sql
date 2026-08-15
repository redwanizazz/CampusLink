-- Provision CampusLink database + user in an existing MySQL instance.
-- Run once: mysql -u root -p < server/scripts/provision-db.sql

CREATE DATABASE IF NOT EXISTS campuslink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'campus_user'@'localhost'
  IDENTIFIED BY 'campus_password';

GRANT ALL PRIVILEGES ON campuslink.* TO 'campus_user'@'localhost';

FLUSH PRIVILEGES;

SELECT 'CampusLink DB + user provisioned' AS status;
