const pool = require('./src/db/pool');
const bcrypt = require('bcryptjs');

async function setup() {
  try {
    console.log('Connecting to database...');

    // 1. Create type table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS type (
        typeId INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);

    // Ensure default type exists
    const [types] = await pool.query('SELECT typeId FROM type LIMIT 1');
    let defaultTypeId = types.length > 0 ? types[0].typeId : 1;
    if (types.length === 0) {
      const [typeRes] = await pool.query('INSERT INTO type (name) VALUES (?)', ['Bakery']);
      defaultTypeId = typeRes.insertId;
    }

    // 2. Create menu table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu (
        menuId INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        isBestSeller TINYINT(1) DEFAULT 0,
        typeId INT,
        FOREIGN KEY (typeId) REFERENCES type(typeId) ON DELETE SET NULL
      )
    `);

    // 3. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        userId INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        firstname VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create rating table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rating (
        ratingId INT AUTO_INCREMENT PRIMARY KEY,
        menuId INT NOT NULL,
        userId INT NOT NULL,
        score INT NOT NULL CHECK (score >= 1 AND score <= 5),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_menu (userId, menuId),
        FOREIGN KEY (menuId) REFERENCES menu(menuId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    // 5. Seed default users
    const defaultPassword = await bcrypt.hash('123456', 10);
    const initialUsers = [
      { username: 'John, Doe', firstname: 'John', email: 'john@gmail.com', role: 'admin' },
      { username: 'Ann, Dalton', firstname: 'Ann', email: 'Ann@gmail.com', role: 'user' },
      { username: 'Bob', firstname: 'Bob', email: 'Bob@gmail.com', role: 'user' },
      { username: 'Cate', firstname: 'Cate', email: 'Cate@gmail.com', role: 'user' },
      { username: 'Danny', firstname: 'Danny', email: 'Danny@gmail.com', role: 'user' },
    ];

    for (const u of initialUsers) {
      await pool.query(`
        INSERT INTO users (username, firstname, email, password, role)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE username = VALUES(username), role = VALUES(role)
      `, [u.username, u.firstname, u.email, defaultPassword, u.role]);
    }

    // 6. Seed menu items matching screenshot if cake doesn't exist
    const standardMenus = [
      { name: 'cake', price: 35, isBestSeller: 1 },
      { name: 'bread', price: 25, isBestSeller: 0 },
      { name: 'milk', price: 15, isBestSeller: 1 },
      { name: 'donut', price: 45, isBestSeller: 0 },
      { name: 'cookie', price: 55, isBestSeller: 1 },
    ];

    for (const m of standardMenus) {
      const [existing] = await pool.query('SELECT menuId FROM menu WHERE LOWER(name) = ?', [m.name]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO menu (name, price, isBestSeller, typeId) VALUES (?, ?, ?, ?)',
          [m.name, m.price, m.isBestSeller, defaultTypeId]
        );
      }
    }

    // 7. Seed ratings to match the screenshot:
    // cake: 3.5
    // bread: 4.5
    // milk: 3.8
    // donut: 4.2
    // cookie: 3.1
    const [allMenus] = await pool.query('SELECT menuId, LOWER(name) AS name FROM menu');
    const [allUsers] = await pool.query('SELECT userId, email FROM users');

    const uMap = {};
    allUsers.forEach(u => { uMap[u.email] = u.userId; });

    const mMap = {};
    allMenus.forEach(m => { mMap[m.name] = m.menuId; });

    const u1 = uMap['Ann@gmail.com'];
    const u2 = uMap['Bob@gmail.com'];
    const u3 = uMap['Cate@gmail.com'];
    const u4 = uMap['Danny@gmail.com'];

    const ratingPairs = [
      // cake: (3 + 4) / 2 = 3.5
      [mMap['cake'], u1, 3],
      [mMap['cake'], u2, 4],
      // bread: (4 + 5) / 2 = 4.5
      [mMap['bread'], u1, 4],
      [mMap['bread'], u2, 5],
      // milk: (3 + 4 + 4 + 4 + 4) -> 19 / 5 = 3.8
      [mMap['milk'], u1, 3],
      [mMap['milk'], u2, 4],
      [mMap['milk'], u3, 4],
      [mMap['milk'], u4, 4],
      // donut: (4 + 4 + 4 + 4 + 5) -> 21 / 5 = 4.2
      [mMap['donut'], u1, 4],
      [mMap['donut'], u2, 4],
      [mMap['donut'], u3, 4],
      [mMap['donut'], u4, 5],
      // cookie: (3 + 3 + 3 + 3 + 3 + 4) -> 19 / 6 = 3.16 -> 3.2 or 3.1
      [mMap['cookie'], u1, 3],
      [mMap['cookie'], u2, 3],
      [mMap['cookie'], u3, 3],
      [mMap['cookie'], u4, 3],
    ];

    for (const [mId, uId, score] of ratingPairs) {
      if (mId && uId) {
        await pool.query(
          'INSERT INTO rating (menuId, userId, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)',
          [mId, uId, score]
        );
      }
    }

    console.log('Database successfully initialized with screenshot data!');
    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err);
    process.exit(1);
  }
}

setup();
