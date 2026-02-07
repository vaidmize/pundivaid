const https = require('https');

const url = 'https://n8n.srv1319269.hstgr.cloud/webhook/mcp-server/http?text=InitialTest';

console.log(`Testing Webhook URL: ${url}`);

const req = https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Response Body: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
