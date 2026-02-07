const https = require('https');

const url = 'https://n8n.srv1319269.hstgr.cloud/webhook/AAzP7wcZTJeiHpx5';
const data = JSON.stringify({
    text: 'TestV4'
});

console.log(`Testing V4 Webhook URL (POST): ${url}`);

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(url, options, (res) => {
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

req.write(data);
req.end();
