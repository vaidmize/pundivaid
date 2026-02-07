const https = require('https');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZGYxOWIzNy04NjY5LTRiN2QtOTdjYi03YmI2MmM5MDUxNjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNDcyMTg1LCJleHAiOjE3NzMwMTA4MDB9.4LCGPX6TyixzEpPvJcH7IT7CVmHyjz1zEWS5hTVy03A';
const hostname = 'n8n.srv1319269.hstgr.cloud';
const apiPath = '/api/v1/workflows';

const workflow = {
    "name": "Website Chat V4 (POST)",
    "nodes": [
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "", // Default ID based
                "responseMode": "responseNode",
                "options": {
                    "allowedOrigins": "*"
                }
            },
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2,
            "position": [0, 0],
            "id": "webhook-node-v4",
            "name": "Webhook"
        },
        // Simple echo for now to test connectivity
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": "={\n  \"reply\": \"Connection Successful\"\n}",
                "options": {
                    "responseHeaders": {
                        "entries": [
                            {
                                "name": "Access-Control-Allow-Origin",
                                "value": "*"
                            }
                        ]
                    }
                }
            },
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1,
            "position": [440, 0],
            "id": "respond-to-webhook",
            "name": "Respond to Webhook"
        }
    ],
    "connections": {
        "Webhook": {
            "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
        }
    },
    "settings": {}
};

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: hostname,
            path: path,
            method: method,
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        });

        req.on('error', (e) => reject(e));

        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log("Creating V4 Workflow (POST)...");
    try {
        const createRes = await makeRequest('POST', apiPath, JSON.stringify(workflow));
        console.log(`Creation Status: ${createRes.statusCode}`);
        const responseBody = JSON.parse(createRes.body);

        if (createRes.statusCode === 200) {
            console.log("ID:", responseBody.id);
            console.log("Activating...");
            const activateRes = await makeRequest('POST', `${apiPath}/${responseBody.id}/activate`, JSON.stringify({ active: true }));
            console.log(`Activation Status: ${activateRes.statusCode}`);
            console.log(`Test URL: https://${hostname}/webhook/${responseBody.id}`);
        } else {
            console.error("Failed:", createRes.body);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
