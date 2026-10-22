const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Register
const register = async (req, res) => {
  const { username, firstname, email, password } = req.body;
  const userIdentifier = username || firstname;

  if (!userIdentifier || !email || !password) {
    return res.status(400).json({ error: 'Username/firstname, email, and password are required' });
  }

  try {
    // Check if email or username already exists
    const [existing] = await pool.query(
      'SELECT userId FROM users WHERE email = ? OR username = ?',
      [email, userIdentifier]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or Username already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userIdentifier, firstname || userIdentifier, email, hashedPassword, 'user']
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
      username: userIdentifier,
      email,
      role: 'user'
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Login (supports login by username OR email)
const login = async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        firstname: user.firstname || user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        firstname: user.firstname || user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT userId, username, firstname, email, role FROM users WHERE userId = ?',
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { register, login, getMe };
