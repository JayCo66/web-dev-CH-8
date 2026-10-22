import { useState, useEffect } from 'react';
import { menuAPI } from './api';

const GuestHome = ({ onNavigateLogin }) => {
  const [menus, setMenus] = useState([]);
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

  useEffect(() => {
    fetchMenus();
    // Real-time update every 3 seconds
    const interval = setInterval(fetchMenus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="main-card">
        {/* Top beige header banner with Login button */}
        <div className="card-header-banner">
          <button className="banner-btn" onClick={onNavigateLogin}>
            Login
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

export default GuestHome;
