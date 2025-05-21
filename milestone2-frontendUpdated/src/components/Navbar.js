import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import logo from '../assets/images/logo.png';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storageChange'));
    navigate('/login');
  };

  return (
    <header>
      <Link to="/">
        <img src={logo} alt="Logo" className="logo-large" />
      </Link>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/chefs">Chefs</Link></li>
          <li><Link to="/order">Order</Link></li>
          <li>
            <Link to="/cart" className="cart-link">
              Cart {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          </li>
          {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
          {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
          {isAuthenticated && <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>}
        </ul>
      </nav>
    </header>
  );
}
