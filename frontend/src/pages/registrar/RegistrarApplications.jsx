import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { styles } from '../../ui/Layout.jsx';

export default function RegistrarApplications() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get('/rbac/applications/inbox');
    setRows(data.applications || []);
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function decide(id, decision) {
    try {
      setMsg('');
      await api.post(`/rbac/applications/${id}/decide`, { decision, reason: '' });
      await load();
      setMsg(`${decision} saved`);
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    }
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Application Inbox</h3>
        {msg ? <div style={{ color: msg.includes('Failed') ? '#a11' : '#1a7', marginBottom: 8 }}>{msg}</div> : null}
        {rows.length === 0 ? (
          <div style={styles.small}>No applications</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map(r => (
              <div key={r._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <b>{r.propertyId}</b> • {r.type} • <span style={{ color: '#555' }}>{r.status}</span>
                <div style={styles.small}>{new Date(r.createdAt).toLocaleString()}</div>
                {r.notes ? <div style={styles.small}>Notes: {r.notes}</div> : null}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button style={styles.btn} onClick={() => decide(r._id, 'approved')}>Approve</button>
                  <button style={styles.btnGhost} onClick={() => decide(r._id, 'rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
