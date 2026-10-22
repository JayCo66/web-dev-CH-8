const pool = require('../db/pool');

// GET all users (admin only)
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT userId, username, firstname, email, role, createdAt FROM users ORDER BY userId ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// UPDATE user role (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin"' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE userId = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated',
      userId: Number(id),
      role
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getUsers, updateUserRole };
