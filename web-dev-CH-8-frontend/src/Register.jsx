import { useState } from 'react';
import { authAPI } from './api';

const Register = ({ onNavigateLogin, onNavigateGuest }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      alert('Registration successful! Please login.');
      onNavigateLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

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
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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

          <div className="auth-input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer-text">
          Have an Account ?{' '}
          <span className="auth-footer-link" onClick={onNavigateLogin}>
            Login Here
          </span>
        </div>

        <span className="auth-back-link" onClick={onNavigateGuest}>
          ← Back to Menu
        </span>
      </div>
    </div>
  );
};

export default Register;
