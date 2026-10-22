import { useState, useEffect } from 'react';
import { menuAPI, ratingAPI } from './api';

const UserHome = ({ user, onLogout }) => {
  const [menus, setMenus] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMenus = async () => {
    try {
      const res = await menuAPI.getAll();
      setMenus(res.data);
    } catch (err) {
      console.error('Failed to fetch menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const res = await ratingAPI.getMyRatings();
      const map = {};
      res.data.forEach((r) => {
        map[r.menuId] = r.score;
      });
      setUserRatings(map);
    } catch (err) {
      console.error('Failed to fetch user ratings:', err);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchUserRatings();

    // Real-time update every 3 seconds
    const interval = setInterval(fetchMenus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRatingChange = async (menuId, score) => {
    try {
      await ratingAPI.rate(menuId, Number(score));
      setUserRatings((prev) => ({ ...prev, [menuId]: Number(score) }));
      await fetchMenus(); // Refresh immediately after rating
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert('Failed to submit rating');
    }
  };

  const displayName = user?.username || user?.firstname || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="main-card">
        {/* Top beige header banner with Username & Logout */}
        <div className="card-header-banner">
          <span className="user-display-name">{displayName}</span>
          <button className="banner-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="card-content">
          <h2 className="content-title">Our menu</h2>

          {loading && menus.length === 0 ? (
            <p>Loading menu...</p>
          ) : (
            <ul className="food-list-ul">
              {menus.map((item) => (
                <li key={item.menuId} className="food-list-li">
                  <div className="food-item-row">
                    <span>
                      {item.name}{' '}
                      <span className="rating-badge">
                        ( ⭐ {Number(item.avgRating).toFixed(1)} )-
                      </span>{' '}
                      {Math.round(item.price)} baht
                      {item.isBestSeller ? <span className="bestseller-icon"> 🏅</span> : ''}
                    </span>

                    {/* Rating dropdown */}
                    <div className="rating-select-container">
                      <label htmlFor={`rating-${item.menuId}`} style={{ marginRight: '4px' }}>
                        Choose rating:
                      </label>
                      <select
                        id={`rating-${item.menuId}`}
                        value={userRatings[item.menuId] || ''}
                        onChange={(e) => handleRatingChange(item.menuId, e.target.value)}
                      >
                        <option value="" disabled>
                          -
                        </option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Real-time notice banner */}
      <div className="realtime-notice-box">
        * Menu show with real-time data update
      </div>
    </div>
  );
};

export default UserHome;
