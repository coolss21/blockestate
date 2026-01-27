import React from 'react';
import { Link } from 'react-router-dom';

const card = {
  border: '1px solid #e5e5e5',
  borderRadius: 12,
  padding: 16,
  textDecoration: 'none',
  color: '#111',
  display: 'block'
};

export default function Home() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>BlockEstate</h1>
      <p style={{ color: '#555' }}>Choose a role to log in.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, maxWidth: 900 }}>
        <Link style={card} to="/login/citizen"><b>Citizen</b><br /><span style={{ color: '#666' }}>My properties, apply, disputes</span></Link>
        <Link style={card} to="/login/registrar"><b>Registrar</b><br /><span style={{ color: '#666' }}>Inbox, registry search, issue certificate</span></Link>
        <Link style={card} to="/login/court"><b>Court</b><br /><span style={{ color: '#666' }}>Cases, orders, hearings</span></Link>
        <Link style={card} to="/login/admin"><b>Admin</b><br /><span style={{ color: '#666' }}>Users, roles, office</span></Link>
      </div>

      <div style={{ marginTop: 18, color: '#666', fontSize: 13, maxWidth: 900 }}>
        Tip: Click “Seed demo users” on the login page (requires MongoDB running) then log in with demo credentials.
      </div>
    </div>
  );
}
