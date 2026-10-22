import { useState, useEffect } from 'react';
import './App.css';
import GuestHome from './GuestHome';
import UserHome from './UserHome';
import AdminHome from './AdminHome';
import Login from './Login';
import Register from './Register';
import { authAPI } from './api';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role === 'admin' ? 'admin' : 'user';
    }
    return 'guest'; // 'guest', 'login', 'register', 'user', 'admin'
  });

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          if (res.data.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('user');
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setCurrentView('guest');
        });
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('guest');
  };

  return (
    <div className="app-wrapper">
      {/* 1. Register View */}
      {currentView === 'register' && (
        <Register
          onNavigateLogin={() => setCurrentView('login')}
          onNavigateGuest={() => setCurrentView('guest')}
        />
      )}

      {/* 2. Login View */}
      {currentView === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateRegister={() => setCurrentView('register')}
          onNavigateGuest={() => setCurrentView('guest')}
        />
      )}

      {/* 3. Guest View (Not logged in) */}
      {currentView === 'guest' && (
        <GuestHome onNavigateLogin={() => setCurrentView('login')} />
      )}

      {/* 4. Logged-in Regular User View */}
      {currentView === 'user' && (
        <UserHome user={user} onLogout={handleLogout} />
      )}

      {/* 5. Logged-in Admin View */}
      {currentView === 'admin' && (
        <AdminHome user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
