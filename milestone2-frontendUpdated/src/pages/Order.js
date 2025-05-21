// src/pages/Order.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartProvider';
import { chefData } from '../utils/chefData';
import '../styles.css';

export default function OrderPage() {
  const navigate = useNavigate();
  const { orderInfo, setCustomerInfo } = useCart();

  const [formData, setFormData] = useState({ 
    name: orderInfo?.name || '', 
    location: orderInfo?.location || '' 
  });
  const [selectedChefs, setSelectedChefs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Navigate to ChefMenu, passing the full chef object (with .menu)
  const handleChefClick = (chef) => {
    navigate('/chef-menu', { state: { chef } });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      setErrorMessage('Please enter both name and location.');
      return;
    }
    setErrorMessage('');

    // Save customer info to cart context
    setCustomerInfo({
      name: formData.name,
      location: formData.location
    });

    const locationLower = formData.location.trim().toLowerCase();
    // Filter chefs by location using availableIn array
    const filteredChefs = chefData.filter(chef =>
      chef.availableIn && (
        chef.availableIn.includes('all') || 
        chef.availableIn.some(loc => loc.toLowerCase().includes(locationLower))
      )
    );
    setSelectedChefs(filteredChefs);
    if (filteredChefs.length === 0) {
      setErrorMessage('No chefs found for this location. Please try a different area.');
    }
  };

  return (
    <div className="order-form">
      <h1>Place Your Order</h1>
      {errorMessage && <div className="form-error">{errorMessage}</div>}

      {!selectedChefs.length ? (
        <form onSubmit={handleLocationSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Your Location"
            value={formData.location}
            onChange={handleInputChange}
          />
          <button type="submit" className="order-submit">
            Submit
          </button>
        </form>
      ) : (
        <div>
          <h2>Available Chefs and Their Signature Recipes</h2>
          <div className="chef-container">
            {selectedChefs.map(chef => (
              <div
                key={chef._id || chef.id}
                className="chef-profile"
                style={{ cursor: 'pointer' }}
                onClick={() => handleChefClick(chef)}
              >
                <img src={chef.image} alt={chef.name} className="chef-photo" />
                <h3>{chef.name}</h3>
                <ul>
                  {(chef.menu || []).map((dish, idx) => (
                    <li key={idx}>{dish.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
