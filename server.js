/* ============================================
   JurisAI Pro — Backend Proxy Server
   Keeps HF API token hidden from the browser
   ============================================ */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HF_API_TOKEN = process.env.HF_API_TOKEN;

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Serve static files (index.html, styles.css, app.js)
app.use(express.static(path.join(__dirname, 'public')));

// ===== Proxy endpoint =====
// Browser calls /api/hf/:model → server calls HF with the secret token
app.post('/api/hf/*', async (req, res) => {
    try {
        if (!HF_API_TOKEN || HF_API_TOKEN === 'hf_your_token_here') {
            return res.status(500).json({
                error: 'Server HF_API_TOKEN not configured. Set it in .env or Render environment variables.'
            });
        }

        // Extract model path from URL (everything after /api/hf/)
        const modelPath = req.params[0];
        if (!modelPath) {
            return res.status(400).json({ error: 'No model specified.' });
        }

        // Allowlist of permitted models for security
        const ALLOWED_MODELS = [
            'facebook/bart-large-cnn',
            'dslim/bert-base-NER',
            'deepset/roberta-base-squad2',
            'facebook/bart-large-mnli',
            'google/flan-t5-base',
        ];
        // Also allow any Helsinki-NLP translation model
        const isAllowed = ALLOWED_MODELS.includes(modelPath) || modelPath.startsWith('Helsinki-NLP/');

        if (!isAllowed) {
            return res.status(403).json({ error: 'Model not permitted.' });
        }

        // Forward request to Hugging Face
        const hfUrl = `https://router.huggingface.co/hf-inference/models/${modelPath}`;

        const hfResponse = await fetch(hfUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await hfResponse.json();

        if (!hfResponse.ok) {
            return res.status(hfResponse.status).json(data);
        }

        res.json(data);

    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✦ JurisAI Pro server running at http://localhost:${PORT}`);
    console.log(`  HF Token: ${HF_API_TOKEN ? '✓ configured' : '✗ MISSING — set HF_API_TOKEN in .env'}`);
});
