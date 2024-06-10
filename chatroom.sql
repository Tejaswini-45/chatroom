CREATE DATABASE chatroomapp;

USE chatroomapp;

CREATE TABLE users (
  userId VARCHAR(50) PRIMARY KEY,
  deviceId VARCHAR(50),
  name VARCHAR(100),
  phone VARCHAR(20),
  password VARCHAR(255),
  availCoins INT,
  isPrime BOOLEAN DEFAULT FALSE,
  joinedRooms INT DEFAULT 0
);

CREATE TABLE chatrooms (
  roomId INT AUTO_INCREMENT PRIMARY KEY,
  roomName VARCHAR(100),
  maxCapacity INT,
  ownerId VARCHAR(50),
  FOREIGN KEY (ownerId) REFERENCES users(userId)
);

CREATE TABLE room_members (
  roomId INT,
  userId VARCHAR(50),
  FOREIGN KEY (roomId) REFERENCES chatrooms(roomId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE messages (
  messageId INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT,
  userId VARCHAR(50),
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES chatrooms(roomId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE friend_requests (
  requestId INT AUTO_INCREMENT PRIMARY KEY,
  fromUserId VARCHAR(50),
  toUserId VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fromUserId) REFERENCES users(userId),
  FOREIGN KEY (toUserId) REFERENCES users(userId)
);
