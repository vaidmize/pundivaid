const https = require('https');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZGYxOWIzNy04NjY5LTRiN2QtOTdjYi03YmI2MmM5MDUxNjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNDcyMTg1LCJleHAiOjE3NzMwMTA4MDB9.4LCGPX6TyixzEpPvJcH7IT7CVmHyjz1zEWS5hTVy03A';
const hostname = 'n8n.srv1319269.hstgr.cloud';
const apiPath = '/api/v1/workflows';

const workflow = {
    "name": "Website Chat V3 (ID Based)",
    "nodes": [
        {
            "parameters": {
                "httpMethod": "GET",
                "path": "", // Empty path to force ID usage
                "responseMode": "responseNode",
                "options": {
                    "allowedOrigins": "*"
                }
            },
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2,
            "position": [0, 0],
            "id": "webhook-node-v3",
            "name": "Webhook"
        },
        {
            "parameters": {
                "values": {
                    "string": [
                        {
                            "name": "text",
                            "value": "={{ $json.query.text }}"
                        }
                    ]
                },
                "keepOnlySet": true
            },
            "type": "n8n-nodes-base.set",
            "typeVersion": 1,
            "position": [220, 0],
            "id": "format-input",
            "name": "Format Input"
        },
        {
            "parameters": {
                "options": {}
            },
            "type": "@n8n/n8n-nodes-langchain.chainLlm",
            "typeVersion": 1,
            "position": [440, 0],
            "id": "chain-llm",
            "name": "Basic LLM Chain"
        },
        {
            "parameters": {
                "modelName": "models/gemini-1.5-pro",
                "options": {}
            },
            "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
            "typeVersion": 1,
            "position": [440, 220],
            "id": "google-gemini-model",
            "name": "Google Gemini Chat Model",
            "credentials": {
                "googlePalmApi": {
                    "id": "MfQeDlaAwqmCZlRa",
                    "name": "Google Gemini(PaLM) Api account"
                }
            }
        },
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": "={\n  \"reply\": \"{{ $json.text }}\"\n}",
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
            "position": [750, 0],
            "id": "respond-to-webhook",
            "name": "Respond to Webhook"
        }
    ],
    "connections": {
        "Webhook": {
            "main": [[{ "node": "Format Input", "type": "main", "index": 0 }]]
        },
        "Format Input": {
            "main": [[{ "node": "Basic LLM Chain", "type": "main", "index": 0 }]]
        },
        "Google Gemini Chat Model": {
            "ai_languageModel": [[{ "node": "Basic LLM Chain", "type": "ai_languageModel", "index": 0 }]]
        },
        "Basic LLM Chain": {
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
    console.log("Creating V3 Workflow (No Custom Path)...");
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
