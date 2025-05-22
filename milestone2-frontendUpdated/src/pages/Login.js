import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // Adjust path if needed
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already authenticated
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (isAuthenticated) {
      navigate('/'); // Redirect to the main page if already authenticated
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    try {
      const response = await api.post('/users/login', { email, password });
      // Store authentication in session storage or localStorage
      localStorage.setItem('token', response.data.token);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('currentUser', response.data.user.email);
      window.dispatchEvent(new Event('storageChange'));
      setSuccessMessage('Login successful!');
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} id='login-form' className="login-box">
        <h2>Login</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className='login-box input'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className='login-box input'
          placeholder='Enter your password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <button className='login-box button' type="submit">Login</button>
      </form>
      <div style={{ marginTop: '1em', textAlign: 'center' }}>
        <span>Don't have an account? <a href="/register">Register here</a></span>
      </div>
    </div>
  );
};

export default Login;
