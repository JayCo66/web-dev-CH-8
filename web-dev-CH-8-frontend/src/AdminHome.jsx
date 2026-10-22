import { useState, useEffect } from 'react';
import { menuAPI, userAPI } from './api';

const AdminHome = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'user'
  const [menus, setMenus] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New Food form state
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    isBestSeller: 'true',
  });

  const fetchMenus = async () => {
    try {
      const res = await menuAPI.getAll();
      setMenus(res.data);
    } catch (err) {
      console.error('Failed to fetch menus:', err);
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (activeTab === 'user') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await menuAPI.delete(menuId);
      setMenus((prev) => prev.filter((m) => m.menuId !== menuId));
    } catch (err) {
      console.error('Failed to delete menu:', err);
      alert('Failed to delete menu item');
    }
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    if (!newFood.name.trim() || !newFood.price) return;

    try {
      await menuAPI.create({
        name: newFood.name.trim(),
        price: Number(newFood.price),
        isBestSeller: newFood.isBestSeller === 'true',
      });
      setNewFood({ name: '', price: '', isBestSeller: 'true' });
      fetchMenus();
    } catch (err) {
      console.error('Failed to add menu:', err);
      alert('Failed to add menu item');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role');
    }
  };

  const displayName = user?.username || user?.firstname || 'John, Doe';

  return (
    <div className="main-card">
      {/* Top beige header banner with Username & Logout */}
      <div className="card-header-banner">
        <span className="user-display-name">{displayName}</span>
        <button className="banner-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* View Switcher button matching Image 3 */}
      <div className="admin-view-toggle">
        {activeTab === 'menu' ? (
          <button className="view-toggle-btn" onClick={() => setActiveTab('user')}>
            user
          </button>
        ) : (
          <button className="view-toggle-btn" onClick={() => setActiveTab('menu')}>
            menu
          </button>
        )}
      </div>

      {/* Card Content based on activeTab */}
      <div className="card-content">
        {activeTab === 'menu' ? (
          /* ================= MENU MANAGEMENT VIEW ================= */
          <div>
            <h2 className="content-title">Our Menu</h2>

            {loadingMenus ? (
              <p>Loading menus...</p>
            ) : (
              <ul className="food-list-ul">
                {menus.map((item) => (
                  <li key={item.menuId} className="food-list-li">
                    <div className="food-item-row">
                      <span>
                        {item.name} - {Math.round(item.price)} baht
                        {item.isBestSeller ? <span className="bestseller-icon"> 🏅</span> : ''}
                      </span>
                      <button
                        className="del-btn"
                        onClick={() => handleDeleteMenu(item.menuId)}
                      >
                        Del
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* New Food Form */}
            <div className="admin-new-food-section">
              <div className="admin-new-food-title">New Food</div>
              <form onSubmit={handleAddMenu}>
                <div className="admin-form-group">
                  <label htmlFor="food-name">name :</label>
                  <input
                    id="food-name"
                    type="text"
                    value={newFood.name}
                    onChange={(e) =>
                      setNewFood({ ...newFood, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="food-price">price :</label>
                  <input
                    id="food-price"
                    type="number"
                    value={newFood.price}
                    onChange={(e) =>
                      setNewFood({ ...newFood, price: e.target.value })
                    }
                    min="0"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="food-bestseller">Best Seller :</label>
                  <select
                    id="food-bestseller"
                    value={newFood.isBestSeller}
                    onChange={(e) =>
                      setNewFood({ ...newFood, isBestSeller: e.target.value })
                    }
                  >
                    <option value="true">BestSeller</option>
                    <option value="false">Normal</option>
                  </select>
                </div>

                <button type="submit" className="add-menu-btn">
                  Add menu
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ================= USER MANAGEMENT VIEW ================= */
          <div>
            <h2 className="content-title">User</h2>

            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              <ul className="user-list-ul">
                {users.map((u) => {
                  const uName = u.username || u.firstname || 'User';
                  return (
                    <li key={u.userId} className="user-list-li">
                      <div className="user-row">
                        <span className="user-name-email">
                          {uName} {u.email}
                        </span>
                        <select
                          className="user-role-select"
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.userId, e.target.value)
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
