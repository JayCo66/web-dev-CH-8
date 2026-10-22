-- CH-8 Database Schema
-- Run this script in your MySQL to create the required tables

USE myshop;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rating table for menu ratings by users
CREATE TABLE IF NOT EXISTS rating (
  ratingId INT AUTO_INCREMENT PRIMARY KEY,
  menuId INT NOT NULL,
  userId INT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_menu (userId, menuId),
  FOREIGN KEY (menuId) REFERENCES menu(menuId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);
