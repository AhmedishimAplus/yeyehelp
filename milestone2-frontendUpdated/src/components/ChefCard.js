// src/components/ChefCard.js
import React from 'react'
import { Link } from 'react-router-dom'

export default function ChefCard({ chef }) {
  return (
    <div className="chef-profile">
      <img src={`/images/${chef.photo}`} alt={chef.name} className="chef-photo" />
      <h3>{chef.name}</h3>
      <p>{chef.specialty}</p>
      <Link to={`/chefs/${chef.id}`}>View Profile</Link>
    </div>
  )
}
