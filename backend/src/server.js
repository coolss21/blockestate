import { createApp } from './app.js';
import { PORT, PUBLIC_BASE } from './config/index.js';

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running: ${PUBLIC_BASE}`);
  console.log(`✅ Health: ${PUBLIC_BASE}/api/health`);
});
