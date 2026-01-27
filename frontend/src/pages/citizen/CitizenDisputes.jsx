import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { styles } from '../../ui/Layout.jsx';

export default function CitizenDisputes() {
  const [propertyId, setPropertyId] = useState('BLR-001');
  const [reason, setReason] = useState('');
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get('/rbac/disputes/my');
    setRows(data.disputes || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function submit() {
    setMsg('');
    try {
      setBusy(true);
      await api.post('/rbac/disputes', { propertyId, reason });
      setReason('');
      await load();
      setMsg('Dispute raised');
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Raise dispute</h3>
        <label>
          <div style={styles.small}>Property ID</div>
          <input style={styles.input} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
        </label>
        <label style={{ display: 'block', marginTop: 10 }}>
          <div style={styles.small}>Reason</div>
          <textarea style={{ ...styles.input, minHeight: 90 }} value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={styles.btn} disabled={busy} onClick={submit}>Submit</button>
          {msg ? <span style={{ color: msg.includes('Failed') ? '#a11' : '#1a7' }}>{msg}</span> : null}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>My disputes</h3>
        {rows.length === 0 ? (
          <div style={styles.small}>No disputes</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map(r => (
              <div key={r._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <b>{r.propertyId}</b> • <span style={{ color: '#555' }}>{r.status}</span>
                <div style={styles.small}>{new Date(r.createdAt).toLocaleString()}</div>
                <div style={styles.small}>Reason: {r.reason}</div>
                {r.caseId ? <div style={styles.small}>Case linked: {String(r.caseId)}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
