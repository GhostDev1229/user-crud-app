-- Step 1: create database
CREATE DATABASE delta_app;

-- Step 2: switch into it
USE delta_app;

-- Step 3: create table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: insert some data
INSERT INTO users (username, email) 
VALUES ('jinay', 'jinay@example.com'),
       ('ghostdev', 'ghost@example.com');

-- Step 5: check data
SELECT * FROM users;
