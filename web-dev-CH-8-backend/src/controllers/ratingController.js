const pool = require('../db/pool');

// Rate a menu item (user only) - upsert
const rateMenu = async (req, res) => {
  const { menuId } = req.params;
  const { score } = req.body;
  const userId = req.user.userId;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ error: 'Score must be between 1 and 5' });
  }

  try {
    // Check if menu exists
    const [menu] = await pool.query('SELECT menuId FROM menu WHERE menuId = ?', [menuId]);
    if (menu.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Upsert rating (INSERT or UPDATE if exists)
    await pool.query(
      `INSERT INTO rating (menuId, userId, score) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [menuId, userId, score]
    );

    // Get updated average
    const [avgResult] = await pool.query(
      'SELECT COALESCE(AVG(score), 0) AS avgRating, COUNT(*) AS ratingCount FROM rating WHERE menuId = ?',
      [menuId]
    );

    res.json({
      message: 'Rating submitted',
      menuId: Number(menuId),
      userId,
      score: Number(score),
      avgRating: parseFloat(Number(avgResult[0].avgRating).toFixed(1)),
      ratingCount: avgResult[0].ratingCount
    });
  } catch (err) {
    console.error('Error rating menu:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get user's ratings
const getUserRatings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      'SELECT ratingId, menuId, score FROM rating WHERE userId = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user ratings:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { rateMenu, getUserRatings };
