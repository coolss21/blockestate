import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { styles } from '../../ui/Layout.jsx';

export default function RegistrarDisputes() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get('/rbac/disputes/inbox');
    setRows(data.disputes || []);
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function refer(id) {
    try {
      setMsg('');
      await api.post(`/rbac/disputes/${id}/refer`);
      await load();
      setMsg('Referred to court (case created)');
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    }
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Dispute Inbox</h3>
        {msg ? <div style={{ color: msg.includes('Failed') ? '#a11' : '#1a7', marginBottom: 8 }}>{msg}</div> : null}
        {rows.length === 0 ? (
          <div style={styles.small}>No disputes</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map(r => (
              <div key={r._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <b>{r.propertyId}</b> • <span style={{ color: '#555' }}>{r.status}</span>
                <div style={styles.small}>{new Date(r.createdAt).toLocaleString()}</div>
                <div style={styles.small}>Reason: {r.reason}</div>
                {r.status === 'open' ? (
                  <div style={{ marginTop: 8 }}>
                    <button style={styles.btn} onClick={() => refer(r._id)}>Refer to court</button>
                  </div>
                ) : (
                  <div style={styles.small}>Case: {String(r.caseId || 'N/A')}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
