// src/pages/ChefMenu.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/CartProvider';
import MenuItem from '../components/MenuItem';
import Cart from '../components/Cart';

export default function ChefMenu() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const chef = state?.chef;
  const { cartItems, addToCart, totalItems, updateQuantity } = useCart();
  const [message, setMessage] = useState('');

  // Safely grab the menu array (or empty array)
  const menuItems = chef?.menu ?? [];

  const handleAddToCart = async (dish) => {
    try {
      console.log('Adding dish to cart:', dish); // Debug log
      console.log('Chef menu:', chef.menu); // Debug log

      // Find the menu item in the chef's menu to get the correct price
      const menuItem = chef.menu.find(item => {
        const itemName = item.dishName || item.name;
        const dishName = dish.dishName || dish.name;
        const matches = itemName === dishName;
        console.log('Comparing menu items:', {
          menuItemName: itemName,
          dishName: dishName,
          matches
        }); // Debug log
        return matches;
      });

      if (!menuItem) {
        console.error('Menu item not found:', {
          dish,
          menuItems: chef.menu
        }); // Debug log
        throw new Error('Menu item not found');
      }

      // Format payload to match backend expectations
      const payload = {
        chefId: chef._id,
        kitchenId: chef._id,
        dishName: menuItem.dishName || menuItem.name,
        price: Number(menuItem.price),
        quantity: 1,
        image: menuItem.image || dish.image,
        description: menuItem.description || dish.description
      };

      console.log('Adding to cart payload:', payload); // Debug log
      const success = await addToCart(payload);

      if (success) {
        setMessage(`Added ${menuItem.dishName || menuItem.name} to cart!`);
      } else {
        setMessage('Failed to add item to cart');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Add to cart error:', error); // Debug log
      setMessage('Failed to add item to cart');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCheckout = (paymentMethod, orderId) => {
    // navigate('/order-confirmation', {
    //   state: { orderId, paymentMethod }
    // });
  };

  if (!chef) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <h2>Chef not found.</h2>
        <button className="order-submit" onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="chef-menu-page">
      <div className="chef-header">
        <h1>{chef.name}'s Menu</h1>
        <p className="chef-specialty">{chef.specialty}</p>
        <Link to="/cart" className="view-cart-button">
          View Cart ({totalItems} items)
        </Link>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {menuItems.length === 0 ? (
        <p>No menu items available for this chef.</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map((dish, i) => (
            <MenuItem
              key={i}
              item={{
                ...dish,
                chefId: chef._id,
                kitchenId: chef._id,
                dishName: dish.dishName || dish.name,
                price: Number(dish.price),
                image: dish.image,
                description: dish.description
              }}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={updateQuantity}
              quantity={cartItems.find(item =>
                (item.chefId === chef._id || item.kitchenId === chef._id) && item.dishName === (dish.dishName || dish.name)
              )?.quantity || 0}
            />
          ))}
        </div>
      )}

      <Cart onCheckout={handleCheckout} />
    </div>
  );
}
