import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { styles } from '../../ui/Layout.jsx';

export default function CourtCases() {
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);
  const [orderText, setOrderText] = useState('');
  const [hearingAt, setHearingAt] = useState('');
  const [venue, setVenue] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get('/rbac/cases');
    setRows(data.cases || []);
  }

  async function loadOne(id) {
    const { data } = await api.get(`/rbac/cases/${id}`);
    setActive(data.case);
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function addOrder() {
    if (!active?._id || !orderText) return;
    try {
      setMsg('');
      await api.post(`/rbac/cases/${active._id}/orders`, { text: orderText });
      setOrderText('');
      await loadOne(active._id);
      setMsg('Order added');
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    }
  }

  async function addHearing() {
    if (!active?._id || !hearingAt) return;
    try {
      setMsg('');
      await api.post(`/rbac/cases/${active._id}/hearings`, { at: hearingAt, venue, notes: '' });
      setHearingAt('');
      setVenue('');
      await loadOne(active._id);
      setMsg('Hearing scheduled');
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || 'Failed');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Cases</h3>
        {rows.length === 0 ? <div style={styles.small}>No cases</div> : null}
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map(c => (
            <button
              key={c._id}
              style={{ ...styles.btnGhost, textAlign: 'left' }}
              onClick={() => loadOne(c._id)}
            >
              <b>{c.propertyId}</b> • {c.status}
              <div style={styles.small}>{new Date(c.createdAt).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Case detail</h3>
        {msg ? <div style={{ color: msg.includes('Failed') ? '#a11' : '#1a7', marginBottom: 8 }}>{msg}</div> : null}
        {!active ? (
          <div style={styles.small}>Select a case</div>
        ) : (
          <div>
            <div><b>Property:</b> {active.propertyId}</div>
            <div style={styles.small}>Case ID: {active._id}</div>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '12px 0 6px' }}>Orders</h4>
              {(active.orders || []).length === 0 ? <div style={styles.small}>No orders</div> : null}
              <div style={{ display: 'grid', gap: 6 }}>
                {(active.orders || []).map((o, i) => (
                  <div key={i} style={{ border: '1px solid #eee', borderRadius: 10, padding: 10 }}>
                    {o.text}
                    <div style={styles.small}>{new Date(o.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <textarea style={{ ...styles.input, minHeight: 70, marginTop: 8 }} value={orderText} onChange={(e) => setOrderText(e.target.value)} placeholder="Add order text" />
              <button style={{ ...styles.btn, marginTop: 8 }} onClick={addOrder}>Add order</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '12px 0 6px' }}>Hearings</h4>
              {(active.hearings || []).length === 0 ? <div style={styles.small}>No hearings</div> : null}
              <div style={{ display: 'grid', gap: 6 }}>
                {(active.hearings || []).map((h, i) => (
                  <div key={i} style={{ border: '1px solid #eee', borderRadius: 10, padding: 10 }}>
                    <div><b>{new Date(h.at).toLocaleString()}</b></div>
                    {h.venue ? <div style={styles.small}>Venue: {h.venue}</div> : null}
                    {h.notes ? <div style={styles.small}>Notes: {h.notes}</div> : null}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <input style={styles.input} type="datetime-local" value={hearingAt} onChange={(e) => setHearingAt(e.target.value)} />
                <input style={styles.input} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" />
              </div>
              <button style={{ ...styles.btn, marginTop: 8 }} onClick={addHearing}>Schedule hearing</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
