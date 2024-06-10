const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat_app'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.post('/api/register', async (req, res) => {
  const { userId, deviceId, name, phone, password, availCoins } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (userId, deviceId, name, phone, password, availCoins) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [userId, deviceId, name, phone, hashedPassword, availCoins], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('User registered');
  });
});

app.post('/api/login', (req, res) => {
  const { userId, password } = req.body;

  const sql = 'SELECT * FROM users WHERE userId = ?';
  db.query(sql, [userId], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('User not found');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid password');

    const token = jwt.sign({ userId: user.userId, isPrime: user.isPrime }, 'your_jwt_secret');
    res.status(200).json({ token });
  });
});

app.post('/api/chatrooms', authenticateToken, (req, res) => {
  const { userId, roomName, maxCapacity } = req.body;

  const sql = 'SELECT isPrime FROM users WHERE userId = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results[0].isPrime !== 1) return res.status(403).send('Only prime members can create chat rooms');

    const roomSql = 'INSERT INTO chatrooms (roomName, maxCapacity, ownerId) VALUES (?, ?, ?)';
    db.query(roomSql, [roomName, maxCapacity, userId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('Chat room created');
    });
  });
});

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
}

app.post('/api/invite', authenticateToken, (req, res) => {
  const { roomId, invitedUserId } = req.body;
  
  const inviteToken = jwt.sign({ roomId, invitedUserId }, 'your_invite_secret', { expiresIn: '1h' });
  res.status(200).json({ inviteToken });
});

app.post('/api/joinroom', authenticateToken, (req, res) => {
  const { inviteToken } = req.body;
  try {
    const invite = jwt.verify(inviteToken, 'your_invite_secret');
    
    const sql = 'SELECT COUNT(*) as count FROM room_members WHERE roomId = ?';
    db.query(sql, [invite.roomId], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results[0].count >= 6) return res.status(403).send('Room is full');

      const insertSql = 'INSERT INTO room_members (roomId, userId) VALUES (?, ?)';
      db.query(insertSql, [invite.roomId, req.user.userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Joined the room');
      });
    });
  } catch (err) {
    res.status(400).send('Invalid invite token');
  }
});

app.get('/api/profile/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  const sql = 'SELECT userId, name, phone, availCoins FROM users WHERE userId = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send('User not found');

    res.status(200).json(result[0]);
  });
});

app.post('/api/friend-requests', authenticateToken, (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.userId;

  const sql = 'INSERT INTO friend_requests (fromUserId, toUserId) VALUES (?, ?)';
  db.query(sql, [fromUserId, toUserId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Friend request sent');
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on('message', ({ roomId, message }) => {
    io.to(roomId).emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server is running on port 3000');
});
