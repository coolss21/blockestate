// test-connectivity.js
import http from 'http';

const PORT = 8081; // The port we think it is running on

console.log(`Testing connectivity to http://127.0.0.1:${PORT}...`);

const req = http.get(`http://127.0.0.1:${PORT}/api/auth/me`, (res) => {
    console.log(`✅ Server is reachable! Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', data.substring(0, 100)); // Print start of response
    });
}).on('error', (err) => {
    console.error(`❌ Connection failed: ${err.message}`);
    console.error('Possible reasons:');
    console.error('1. Backend server is NOT running.');
    console.error(`2. Backend is running on a different port (not ${PORT}).`);
    console.error('3. Firewall blocking connection.');
});
