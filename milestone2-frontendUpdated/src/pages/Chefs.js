import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cookService } from '../services/cookService';
import '../styles.css';

export default function Chefs() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCooks() {
      try {
        const response = await cookService.getAllCooks();
        setCooks(response.data.cooks);
      } catch (err) {
        setError('Failed to load chefs from backend');
      } finally {
        setLoading(false);
      }
    }
    fetchCooks();
  }, []);

  if (loading) return <div className="chef-profiles"><h2>Loading chefs...</h2></div>;
  if (error) return <div className="chef-profiles"><h2>{error}</h2></div>;

  return (
    <div className="chef-profiles">
      <h1 className="text-3xl font-bold mb-6">Meet Our Chefs</h1>
      <div className="chef-container">
        {cooks.map((chef) => (
          <div
            key={chef._id}
            className="chef-profile"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/chef-menu', { state: { chef } })}
          >
            <img
              src={chef.image}
              alt={chef.name}
              className="chef-photo"
            />
            <h3>{chef.name}</h3>
            <p><em>{chef.location}</em></p>
            <p>Rating: {chef.rating}</p>
            <p>{chef.phone}</p>
            <p>{chef.verified ? 'Verified' : 'Not Verified'}</p>
            <div className="chef-menu" style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {chef.menu.map((dish, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <img src={dish.image} alt={dish.dishName} className="menu-image" />
                  <div>{dish.dishName}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

