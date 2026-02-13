import React from 'react';
import { styles } from '../../ui/Layout.jsx';

export default function RegistrarHome() {
  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Quick links</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#444' }}>
          <li>Review applications and approve/reject</li>
          <li>Review disputes and refer to court</li>
          <li>Issue certificate QR via public endpoint: /api/public/qr/:propertyId</li>
        </ul>
      </div>
    </div>
  );
}
