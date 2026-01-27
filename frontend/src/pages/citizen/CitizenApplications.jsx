import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { styles } from '../../ui/Layout.jsx';

export default function CitizenApplications() {
  const [propertyId, setPropertyId] = useState('BLR-001');
  const [type, setType] = useState('issue');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get('/rbac/applications/my');
    setRows(data.applications || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function submit() {
    setMsg('');
    try {
      setBusy(true);
      await api.post('/rbac/applications', { type, propertyId, notes });
      setNotes('');
      await load();
      setMsg('Application submitted');
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Submit application</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label>
            <div style={styles.small}>Property ID</div>
            <input style={styles.input} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
          </label>
          <label>
            <div style={styles.small}>Type</div>
            <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="issue">Issue</option>
              <option value="correction">Correction</option>
            </select>
          </label>
        </div>
        <label style={{ display: 'block', marginTop: 10 }}>
          <div style={styles.small}>Notes</div>
          <textarea style={{ ...styles.input, minHeight: 90 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={styles.btn} disabled={busy} onClick={submit}>Submit</button>
          {msg ? <span style={{ color: msg.includes('failed') ? '#a11' : '#1a7' }}>{msg}</span> : null}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>My applications</h3>
        {rows.length === 0 ? (
          <div style={styles.small}>No applications</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map(r => (
              <div key={r._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <b>{r.propertyId}</b> • {r.type} • <span style={{ color: '#555' }}>{r.status}</span>
                <div style={styles.small}>{new Date(r.createdAt).toLocaleString()}</div>
                {r.decision?.reason ? <div style={styles.small}>Decision reason: {r.decision.reason}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
