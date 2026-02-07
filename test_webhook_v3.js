const https = require('https');

const url = 'https://n8n.srv1319269.hstgr.cloud/webhook/ua9RHnSousQqwp2M?text=TestV3';

console.log(`Testing V3 Webhook URL: ${url}`);

const req = https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Response Body: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
