import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
  },
  sidebar: { width: 260, padding: 20, borderRight: '1px solid #e5e5e5' },
  main: { flex: 1, padding: 20 },
  brand: { fontWeight: 700, fontSize: 18, marginBottom: 12, textDecoration: 'none', color: '#111' },
  nav: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  link: ({ isActive }) => ({
    padding: '10px 12px',
    borderRadius: 10,
    textDecoration: 'none',
    border: '1px solid #e5e5e5',
    background: isActive ? '#111' : '#fff',
    color: isActive ? '#fff' : '#111'
  }),
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  card: { border: '1px solid #e5e5e5', borderRadius: 12, padding: 16, marginBottom: 12 },
  btn: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', background: '#111', color: '#fff', cursor: 'pointer' },
  btnGhost: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', color: '#111', cursor: 'pointer' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5' },
  small: { color: '#666', fontSize: 13 }
};

export default function Layout({ role, title, tabs, children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <Link to="/" style={styles.brand}>BlockEstate</Link>
        <div style={styles.small}>
          Role: <b>{role}</b>
          <br />
          User: <b>{user?.email || '-'}</b>
        </div>

        <nav style={styles.nav}>
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} style={styles.link} end={t.end}>
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            style={styles.btnGhost}
            onClick={() => {
              logout();
              nav(`/login/${role}`);
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topRow}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={styles.small}>API: {window.location.hostname}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

export { styles };
