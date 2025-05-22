// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

// Import images from src/assets/images
import logo from '../assets/images/logo.png';
import dish1 from '../assets/images/food.jpg';
import dish2 from '../assets/images/ffood.jpg';
import dish3 from '../assets/images/foodd.jpg';

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <img src={logo} alt="Hero" className="hero-image" />
        <h1>Welcome to Nafas</h1>
        <div className="mission-statement">
          <h2>Our Mission</h2>
          <p>
            At Nafas, we bring the authentic flavors of Egyptian cuisine directly from top chefs to your doorstep. 
            Our mission is to connect food lovers with the finest Egyptian culinary masters, 
            delivering not just meals, but an authentic dining experience that celebrates our rich culinary heritage.
          </p>
        </div>
        <Link to="/order" className="order-now">Order Now</Link>
      </section>

      <section className="featured-dishes">
        <h2>Featured Dishes</h2>
        <div className="featured-text">
          <p>Discover our handpicked selection of authentic Egyptian dishes, crafted with passion by our expert chefs.</p>
        </div>
        <div className="dish-grid">
          <div className="dish-card">
            <img src={dish1} alt="Traditional Koshari" />
            <h3>Traditional Koshari</h3>
            <p>Egypt's favorite street food, perfectly layered and seasoned</p>
          </div>
          <div className="dish-card">
            <img src={dish2} alt="Homestyle Molokhia" />
            <h3>Homestyle Molokhia</h3>
            <p>Rich and flavorful, prepared with authentic family recipes</p>
          </div>
          <div className="dish-card">
            <img src={dish3} alt="Grilled Kofta" />
            <h3>Grilled Kofta</h3>
            <p>Perfectly spiced and grilled to perfection</p>
          </div>
        </div>
      </section>

      <section className="why-choose-us">
        <h2>Why Choose Nafas?</h2>
        <div className="features-grid">
          <div className="feature">
            <i className="fas fa-chef-hat"></i>
            <h3>Top Egyptian Chefs</h3>
            <p>Carefully selected professional chefs specializing in authentic Egyptian cuisine</p>
          </div>
          <div className="feature">
            <i className="fas fa-utensils"></i>
            <h3>Authentic Recipes</h3>
            <p>Traditional recipes passed down through generations</p>
          </div>
          <div className="feature">
            <i className="fas fa-truck"></i>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable delivery to your doorstep</p>
          </div>
        </div>
      </section>
    </div>
  );
}
