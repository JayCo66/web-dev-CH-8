const pool = require('../db/pool');

// GET all menus with average rating
const getMenus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.menuId, m.name, m.price, m.isBestSeller, m.typeId, t.name AS typeName,
             COALESCE(AVG(r.score), 0) AS avgRating,
             COUNT(r.ratingId) AS ratingCount
      FROM menu m
      LEFT JOIN type t ON m.typeId = t.typeId
      LEFT JOIN rating r ON m.menuId = r.menuId
      GROUP BY m.menuId, m.name, m.price, m.isBestSeller, m.typeId, t.name
    `);

    // Round avgRating to 1 decimal
    const result = rows.map(row => ({
      ...row,
      avgRating: parseFloat(Number(row.avgRating).toFixed(1)),
      isBestSeller: Boolean(row.isBestSeller)
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching menus:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET menu by ID
const getMenuById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT m.menuId, m.name, m.price, m.isBestSeller, m.typeId, t.name AS typeName,
              COALESCE(AVG(r.score), 0) AS avgRating,
              COUNT(r.ratingId) AS ratingCount
       FROM menu m
       LEFT JOIN type t ON m.typeId = t.typeId
       LEFT JOIN rating r ON m.menuId = r.menuId
       WHERE m.menuId = ?
       GROUP BY m.menuId, m.name, m.price, m.isBestSeller, m.typeId, t.name`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json({
      ...rows[0],
      avgRating: parseFloat(Number(rows[0].avgRating).toFixed(1)),
      isBestSeller: Boolean(rows[0].isBestSeller)
    });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// CREATE menu (admin only)
const createMenu = async (req, res) => {
  const { name, price, isBestSeller, typeId } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const bestSellerVal = isBestSeller ? 1 : 0;
    const typeIdVal = typeId !== undefined && typeId !== null && typeId !== '' ? Number(typeId) : null;

    const [result] = await pool.query(
      'INSERT INTO menu (name, price, isBestSeller, typeId) VALUES (?, ?, ?, ?)',
      [name, price, bestSellerVal, typeIdVal]
    );

    res.status(201).json({
      menuId: result.insertId,
      name,
      price: Number(price),
      isBestSeller: Boolean(bestSellerVal),
      typeId: typeIdVal
    });
  } catch (err) {
    console.error('Error creating menu:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE menu (admin only)
const deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM menu WHERE menuId = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json({
      message: 'Menu deleted successfully',
      menuId: Number(id)
    });
  } catch (err) {
    console.error('Error deleting menu:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getMenus, getMenuById, createMenu, deleteMenu };
