import React, { useState } from 'react';
import { styles } from '../../ui/Layout.jsx';

export default function CitizenHome() {
  const [propertyId, setPropertyId] = useState('BLR-001');

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Open public certificate (phone-friendly)</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...styles.input, maxWidth: 240 }} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
          <a
            style={styles.btnGhost}
            href={`/api/public/certificate/${encodeURIComponent(propertyId)}.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Open PDF
          </a>
          <a
            style={styles.btnGhost}
            href={`/api/public/qr/${encodeURIComponent(propertyId)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open QR
          </a>
        </div>
        <div style={{ ...styles.small, marginTop: 8 }}>
          If you share the QR to your phone, it should NOT contain localhost. It will auto-swap to your LAN IP.
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>What works here</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#444' }}>
          <li>Mongo-backed login for citizen role</li>
          <li>Applications (issue/correction) create + track</li>
          <li>Disputes create + track; registrar can refer to court</li>
          <li>Public certificate PDF + QR works across Wi-Fi changes</li>
        </ul>
      </div>
    </div>
  );
}
