import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/users/register', form);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-box">
        <h2>Register</h2>
        <label htmlFor="name">Name</label>
        <input name="name" id="name" type="text" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
        <label htmlFor="email">Email</label>
        <input name="email" id="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
        <label htmlFor="password">Password</label>
        <input name="password" id="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
        <label htmlFor="phone">Phone</label>
        <input name="phone" id="phone" type="text" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />
        <label htmlFor="address">Address</label>
        <input name="address" id="address" type="text" placeholder="Address (optional)" value={form.address} onChange={handleChange} />
        <label htmlFor="role">Role</label>
        <select name="role" id="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="store owner">Store Owner</option>
        </select>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: '1em', textAlign: 'center' }}>
        <span>Already have an account? <a href="/login">Login here</a></span>
      </div>
    </div>
  );
};

export default Register;
