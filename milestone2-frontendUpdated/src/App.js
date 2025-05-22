import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chefs from './pages/Chefs';
import ChefDetail from './pages/ChefDetail';
import Login from './pages/Login';
import ChefMenu from './pages/ChefMenu';
import CartPage from './pages/CartPage';
import Register from './pages/Register';
import PurchaseHistory from './pages/PurchaseHistory';
import { CartProvider } from './components/CartProvider';
import './styles.css';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chefs" element={<Chefs />} />
          <Route path="/chefs/:id" element={<ChefDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chef-menu" element={<ChefMenu />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
