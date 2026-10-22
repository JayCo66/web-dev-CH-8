import { useState } from 'react';
import { authAPI } from './api';

const Login = ({ onLoginSuccess, onNavigateRegister, onNavigateGuest }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer-text">
          No Account ?{' '}
          <span className="auth-footer-link" onClick={onNavigateRegister}>
            Register Here
          </span>
        </div>

        <span className="auth-back-link" onClick={onNavigateGuest}>
          ← Continue as Guest
        </span>
      </div>
    </div>
  );
};

export default Login;
