/* ============================================
   JurisAI Pro — Backend Proxy Server
   Keeps OpenAI API key hidden from the browser
   ============================================ */

require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ===== Email Verification Setup =====
let transporter = null;
async function initMailer() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log("Custom SMTP Transporter initialized.");
    } else {
        // Fallback to ethereal for testing if no credentials are provided
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log("Mock Ethereal Transporter initialized. Check console for verification links.");
    }
}
initMailer().catch(console.error);

async function sendVerificationEmail(email, token, baseUrl) {
    if (!transporter) return;
    const verifyLink = `${baseUrl}/api/verify-email?token=${token}`;

    const info = await transporter.sendMail({
        from: '"JurisAI Pro" <noreply@jurisai-pro.com>',
        to: email,
        subject: "Verify your email for JurisAI Pro",
        text: `Please verify your email by clicking this link: ${verifyLink}`,
        html: `<p>Welcome to JurisAI Pro!</p><p>Please <a href="${verifyLink}">click here to verify your email</a> and unlock your 10 daily queries.</p>`
    });

    if (!process.env.SMTP_USER) {
        console.log("==================================================");
        console.log("Verification Email URL for %s:", email);
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("==================================================");
    }
}

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'jurisai-super-secret-key';
const DB_FILE = path.join(__dirname, 'database.json');

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));
// Trust proxy if you are behind one (e.g. Render) to get real IPs
app.set('trust proxy', 1);

// Serve static files (index.html, styles.css, app.js)
app.use(express.static(path.join(__dirname, 'public')));

// OpenAI client — initialized on first use to avoid crashing if env var is missing at startup
let _openai = null;
function getOpenAI() {
    if (!_openai) {
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set in environment variables.');
        _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
    return _openai;
}

// ===== Database Setup =====
async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            const initial = { users: [], ips: [] };
            await writeDB(initial);
            return initial;
        }
        throw err;
    }
}

async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ===== Auth Endpoints =====
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const db = await readDB();
        if (db.users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            queries_used: 0,
            exhausted_at: null,
            is_verified: false,
            verification_token: crypto.randomBytes(16).toString('hex')
        };

        db.users.push(newUser);
        await writeDB(db);

        // Send Email
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        sendVerificationEmail(email, newUser.verification_token, baseUrl).catch(console.error);

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, message: 'Signup successful' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const db = await readDB();
        const user = db.users.find(u => u.email === email);
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send("No token provided");

        const db = await readDB();
        const user = db.users.find(u => u.verification_token === token);
        if (!user) return res.status(400).send("Invalid or expired token");

        user.is_verified = true;
        user.verification_token = null; // consume token
        await writeDB(db);

        // Redirect to homepage with a success parameter
        res.redirect('/?verified=true');
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).send("Server error");
    }
});

// ===== Rate Limiting Middleware =====
async function rateLimitMiddleware(req, res, next) {
    try {
        const db = await readDB();
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Authenticated logic
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = db.users.find(u => u.id === decoded.id);

                if (!user) return res.status(401).json({ error: 'Invalid token' });

                const now = Date.now();
                const limit = user.is_verified ? 10 : 2;

                if (user.queries_used >= limit) {
                    if (user.is_verified && user.exhausted_at && (now - user.exhausted_at >= 24 * 60 * 60 * 1000)) {
                        // 24 hours have passed, reset limit
                        user.queries_used = 1;
                        user.exhausted_at = null;
                        await writeDB(db);
                        req.user = user;
                        return next();
                    } else if (!user.is_verified) {
                        return res.status(403).json({ error: 'Please verify your email address to unlock your 10 daily queries. Check your inbox/spam folder.' });
                    } else {
                        return res.status(403).json({ error: 'Limit for the day exhausted. Come back again tomorrow.' });
                    }
                }

                user.queries_used += 1;
                if (user.queries_used >= 10 && user.is_verified) {
                    user.exhausted_at = now;
                }
                await writeDB(db);
                req.user = user;
                return next();
            } catch (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
        } else {
            // Unauthenticated IP logic
            const ip = req.ip || req.connection.remoteAddress;
            let ipRecord = db.ips.find(r => r.ip === ip);

            if (!ipRecord) {
                ipRecord = { ip, queries_used: 0 };
                db.ips.push(ipRecord);
            }

            if (ipRecord.queries_used >= 2) {
                return res.status(403).json({ error: 'Guest limit reached. Please sign up and log in to make more queries.' });
            }

            ipRecord.queries_used += 1;
            await writeDB(db);
            return next();
        }
    } catch (err) {
        console.error('Rate limit error:', err);
        return res.status(500).json({ error: 'Server error checking parameters.' });
    }
}

// ===== Proxy endpoint =====
// Browser calls /api/chat → server checks rate limits → then calls OpenAI
app.post('/api/chat', rateLimitMiddleware, async (req, res) => {
    try {
        if (!OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'Server OPENAI_API_KEY not configured. Set it in .env or Render.'
            });
        }

        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Need an array of messages.' });
        }

        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.15,      // Low temperature → factual, legally precise
            max_tokens: 4000,       // Allow full-length structured legal reports
            top_p: 0.9,             // Focused vocabulary for legal language
            frequency_penalty: 0.2, // Reduce repetitive phrasing
            presence_penalty: 0.1,  // Encourage covering all required sections
        });

        res.json({ result: completion.choices[0].message.content });

    } catch (err) {
        console.error('OpenAI Proxy error:', err.message);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✦ JurisAI Pro server running at http://localhost:${PORT}`);
    console.log(`  OpenAI Token: ${OPENAI_API_KEY ? '✓ configured' : '✗ MISSING — set OPENAI_API_KEY in .env'}`);
});
