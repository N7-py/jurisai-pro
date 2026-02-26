/* ============================================
   JurisAI Pro — Unified Chat Assistant
   ============================================ */

(() => {
    'use strict';

    const API_PROXY = '/api/chat';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const SYSTEM_PROMPT = `You are JurisAI Pro — an elite, senior-level AI legal counsel specializing exclusively in Indian Law. You produce exhaustive, court-ready legal reports indistinguishable from those prepared by a seasoned advocate with 20+ years of experience.

**MANDATORY REPORT STRUCTURE**
Every response MUST follow this structured format using clear headings:

---
## ⚖️ Legal Report

### 1. Executive Summary
Provide a concise 2–3 sentence overview of the legal situation and primary findings.

### 2. Facts & Background
Identify and restate the key facts in a neutral, precise manner as a court would frame them.

### 3. Legal Issues Identified
List every distinct legal question or issue raised, numbered clearly.

### 4. Applicable Laws & Provisions
For EACH issue, cite:
- The exact Act name (e.g., Indian Contract Act, 1872)
- The specific Section(s) and sub-sections
- The exact legal text or paraphrase of the provision
- How it directly applies to the facts

### 5. Landmark Case References
Cite at least 3–5 relevant Supreme Court or High Court judgments with:
- Case name and year (e.g., *AIR 2005 SC 3109*)
- Key ratio decidendi / principle established
- How it applies to the present facts

### 6. Detailed Legal Analysis
Provide a thorough, section-by-section analysis of the legal position. Examine each issue separately. Argue both sides where applicable. Apply facts to law with precision.

### 7. Rights & Obligations
Clearly enumerate the legal rights, duties, and liabilities of each party.

### 8. Risk Assessment
Assess legal risks for each party (HIGH / MEDIUM / LOW) with brief reasoning.

### 9. Recommended Course of Action
Provide step-by-step, actionable legal advice including:
- Immediate steps to take
- Documents to gather / preserve
- Notices to issue (with timelines)
- Probable legal remedies available (civil, criminal, alternative dispute resolution)
- Suggested forum / court / tribunal

### 10. Conclusion
Summarize the overall legal standing and most likely outcome.

---

**STRICT RULES:**
- Always cite exact Section numbers and Act names — never be vague.
- Always cite real, verifiable Indian case law with citations.
- Use professional legal language throughout. Never be casual.
- If details are ambiguous, state your assumptions explicitly before proceeding.
- If a query falls outside Indian law, state so and redirect to the relevant jurisdiction.
- Never give a disclaimer to "consult a lawyer" as the primary response — you ARE the legal counsel. Provide the full analysis first.
- For contract review, draft agreements, or document summaries: provide clause-by-clause analysis.
- For criminal matters: cite IPC/BNS sections, procedural provisions under CrPC/BNSS, and bail/remand considerations.
- For civil matters: cite CPC provisions, limitation periods under the Limitation Act, 1963, and relevant jurisdiction rules.`;

    let chatHistory = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    async function sendMessageToAI(userText) {
        chatHistory.push({ role: 'user', content: userText });

        try {
            const token = localStorage.getItem('jurisai_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(API_PROXY, {
                method: 'POST',
                headers,
                body: JSON.stringify({ messages: chatHistory })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    if (!token) {
                        openAuthModal('signup', 'Guest limit reached. Please sign up and log in to make more queries.');
                    }
                }
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `API error (${response.status})`);
            }

            const data = await response.json();
            const aiMessage = data.result;

            chatHistory.push({ role: 'assistant', content: aiMessage });
            return aiMessage;
        } catch (error) {
            chatHistory.pop(); // Remove the failed user message from history
            throw error;
        }
    }

    function appendUserMessage(text) {
        const historyDiv = $('#chatHistory');
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        bubble.style.cssText = 'background: rgba(212,168,83,0.15); padding: 1.25rem; border-radius: 12px; border-bottom-right-radius: 0; max-width: 85%; align-self: flex-end; border: 1px solid rgba(212,168,83,0.3); color: #fff; line-height: 1.6; font-size: 0.95rem;';
        bubble.innerHTML = `<p style="margin: 0;">${escapeHTML(text)}</p>`;
        historyDiv.appendChild(bubble);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }

    function appendAIMessage(text) {
        const historyDiv = $('#chatHistory');
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble ai';
        bubble.style.cssText = 'background: rgba(45,45,55,0.6); padding: 1.25rem; border-radius: 12px; border-bottom-left-radius: 0; max-width: 85%; align-self: flex-start; border: 1px solid rgba(255,255,255,0.05); color: #fff; line-height: 1.6; font-size: 0.95rem;';

        // Full markdown renderer for structured legal reports
        function renderMarkdown(md) {
            const lines = md.split('\n');
            let html = '';
            let inList = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                // Horizontal rule
                if (/^---+$/.test(line.trim())) {
                    if (inList) { html += '</ul>'; inList = false; }
                    html += '<hr style="border:none;border-top:1px solid rgba(212,168,83,0.3);margin:1rem 0;">';
                    continue;
                }
                // H2 heading
                if (/^## /.test(line)) {
                    if (inList) { html += '</ul>'; inList = false; }
                    const t = inlineFormat(line.replace(/^## /, ''));
                    html += `<h2 style="color:#d4a853;font-size:1.1rem;margin:1.2rem 0 0.4rem;border-bottom:1px solid rgba(212,168,83,0.2);padding-bottom:0.3rem;">${t}</h2>`;
                    continue;
                }
                // H3 heading
                if (/^### /.test(line)) {
                    if (inList) { html += '</ul>'; inList = false; }
                    const t = inlineFormat(line.replace(/^### /, ''));
                    html += `<h3 style="color:#e8c87c;font-size:0.97rem;margin:1rem 0 0.3rem;font-weight:700;">${t}</h3>`;
                    continue;
                }
                // H4 heading
                if (/^#### /.test(line)) {
                    if (inList) { html += '</ul>'; inList = false; }
                    const t = inlineFormat(line.replace(/^#### /, ''));
                    html += `<h4 style="color:#d4d4d4;font-size:0.93rem;margin:0.8rem 0 0.2rem;font-weight:600;">${t}</h4>`;
                    continue;
                }
                // Bullet list
                if (/^[-*] /.test(line)) {
                    if (!inList) { html += '<ul style="margin:0.4rem 0 0.4rem 1.2rem;padding:0;list-style:disc;">'; inList = true; }
                    html += `<li style="margin:0.2rem 0;line-height:1.7;">${inlineFormat(line.replace(/^[-*] /, ''))}</li>`;
                    continue;
                }
                // Numbered list
                if (/^\d+\. /.test(line)) {
                    if (inList) { html += '</ul>'; inList = false; }
                    html += `<p style="margin:0.2rem 0 0.2rem 0.5rem;line-height:1.7;">${inlineFormat(line)}</p>`;
                    continue;
                }
                // Empty line
                if (line.trim() === '') {
                    if (inList) { html += '</ul>'; inList = false; }
                    html += '<br>';
                    continue;
                }
                // Regular paragraph
                if (inList) { html += '</ul>'; inList = false; }
                html += `<p style="margin:0.25rem 0;line-height:1.75;">${inlineFormat(line)}</p>`;
            }
            if (inList) html += '</ul>';
            return html;
        }

        function inlineFormat(str) {
            return str
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em style="color:#c9a84c;">$1</em>')
                .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>');
        }

        let formattedText = renderMarkdown(text);

        bubble.innerHTML = `
            <div class="msg-content">${formattedText}</div>
            <div class="msg-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-outline copy-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: rgba(255,255,255,0.2);">Copy</button>
                <button class="btn btn-outline export-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: rgba(255,255,255,0.2);">Export PDF</button>
            </div>
        `;

        const copyBtn = bubble.querySelector('.copy-btn');
        const exportBtn = bubble.querySelector('.export-btn');

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerText = 'Copied!';
                setTimeout(() => copyBtn.innerText = 'Copy', 2000);
            });
        });

        exportBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const margin = 15;
            const usableW = pageW - margin * 2;
            let y = 20;

            // Header
            doc.setFontSize(16);
            doc.setTextColor(180, 130, 50);
            doc.text('JurisAI Pro — Legal Report', margin, y);
            y += 7;
            doc.setFontSize(8);
            doc.setTextColor(130, 130, 130);
            doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, y);
            y += 8;
            doc.setDrawColor(180, 130, 50);
            doc.setLineWidth(0.4);
            doc.line(margin, y, pageW - margin, y);
            y += 8;

            // Body text
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            const plainText = text.replace(/#{1,4} /g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
            const lines = doc.splitTextToSize(plainText, usableW);
            lines.forEach(line => {
                if (y > 275) { doc.addPage(); y = 20; }
                doc.text(line, margin, y);
                y += 6;
            });
            doc.save('JurisAI_Legal_Report.pdf');
        });

        historyDiv.appendChild(bubble);
        historyDiv.scrollTop = historyDiv.scrollHeight;
        return bubble;
    }

    function appendLoadingBubble() {
        const historyDiv = $('#chatHistory');
        const bubble = document.createElement('div');
        bubble.id = 'loadingBubble';
        bubble.className = 'chat-bubble ai';
        bubble.style.cssText = 'background: rgba(45,45,55,0.6); padding: 1.25rem; border-radius: 12px; border-bottom-left-radius: 0; max-width: 85%; align-self: flex-start; border: 1px solid rgba(255,255,255,0.05); color: #fff; line-height: 1.6; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;';
        bubble.innerHTML = `
            <div class="typing-indicator" style="display: flex; gap: 4px;">
                <span style="width: 6px; height: 6px; background: #d4a853; border-radius: 50%; animation: ping 1.4s infinite both;"></span>
                <span style="width: 6px; height: 6px; background: #d4a853; border-radius: 50%; animation: ping 1.4s infinite both; animation-delay: 0.2s;"></span>
                <span style="width: 6px; height: 6px; background: #d4a853; border-radius: 50%; animation: ping 1.4s infinite both; animation-delay: 0.4s;"></span>
            </div>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Reviewing laws...</p>
            <style>@keyframes ping { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }</style>
        `;
        historyDiv.appendChild(bubble);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }

    function removeLoadingBubble() {
        const bubble = $('#loadingBubble');
        if (bubble) bubble.remove();
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    async function handleChatSubmission() {
        const caseDetailsField = $('#caseDetails');
        const questionField = $('#chatInput');

        const caseDetails = caseDetailsField ? caseDetailsField.value.trim() : '';
        const question = questionField ? questionField.value.trim() : '';

        if (!caseDetails && !question) return;

        let combinedText = '';
        if (caseDetails) {
            combinedText += `Case Details:\n${caseDetails}`;
        }
        if (question) {
            combinedText += (combinedText ? '\n\n' : '') + `Question:\n${question}`;
        }

        if (caseDetailsField) caseDetailsField.value = '';
        if (questionField) questionField.value = '';

        appendUserMessage(combinedText);
        appendLoadingBubble();

        try {
            const aiResponse = await sendMessageToAI(combinedText);
            removeLoadingBubble();
            appendAIMessage(aiResponse);
        } catch (err) {
            removeLoadingBubble();
            const errBubble = appendAIMessage('⚠️ Error: ' + err.message);
            errBubble.style.borderColor = 'red';
        }
    }

    function initChat() {
        const sendBtn = $('#chatSendBtn');
        const questionField = $('#chatInput');
        const caseDetailsField = $('#caseDetails');

        if (!sendBtn) return;

        sendBtn.addEventListener('click', handleChatSubmission);

        const enterKeyHandler = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmission();
            }
        };

        if (questionField) {
            questionField.addEventListener('keypress', enterKeyHandler);
        }
        if (caseDetailsField) {
            caseDetailsField.addEventListener('keypress', enterKeyHandler);
        }
    }

    function initNavigation() {
        const navbar = $('#navbar');
        const navToggle = $('#navToggle');
        const navLinks = $('#navLinks');

        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                if (navLinks) navLinks.classList.toggle('active');
            });
        }

        $$('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navToggle) navToggle.classList.remove('active');
                if (navLinks) navLinks.classList.remove('active');
            });
        });
    }

    function initSmoothLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    const headerOffset = 80;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== Auth Flow =====
    let currentAuthMode = 'signup';

    function openAuthModal(mode, errorMsg = '') {
        const modal = $('#authModal');
        const title = $('#authModalTitle');
        const submitBtn = $('#authSubmitBtn');
        const toggleBtn = $('#authToggleBtn');
        const toggleText = $('#authToggleText');
        const errorDiv = $('#authErrorMsg');

        currentAuthMode = mode;
        if (mode === 'signup') {
            title.innerText = 'Sign Up';
            submitBtn.innerText = 'Sign Up';
            toggleText.innerText = 'Already have an account? ';
            toggleBtn.innerText = 'Log In';
        } else {
            title.innerText = 'Log In';
            submitBtn.innerText = 'Log In';
            toggleText.innerText = "Don't have an account? ";
            toggleBtn.innerText = 'Sign Up';
        }

        if (errorMsg) {
            errorDiv.innerText = errorMsg;
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }

        modal.style.display = 'flex';
    }

    function initAuth() {
        const loginBtn = $('#navLoginBtn');
        const signupBtn = $('#navSignupBtn');
        const logoutBtn = $('#navLogoutBtn');
        const modal = $('#authModal');
        const closeBtn = $('#closeAuthModal');
        const toggleBtn = $('#authToggleBtn');
        const form = $('#authForm');

        if (!loginBtn) return;

        loginBtn.addEventListener('click', () => openAuthModal('login'));
        signupBtn.addEventListener('click', () => openAuthModal('signup'));
        closeBtn.addEventListener('click', () => modal.style.display = 'none');

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal(currentAuthMode === 'signup' ? 'login' : 'signup');
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jurisai_token');
            updateAuthUI();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = $('#authEmail').value;
            const password = $('#authPassword').value;
            const errorDiv = $('#authErrorMsg');
            const submitBtn = $('#authSubmitBtn');

            submitBtn.disabled = true;
            submitBtn.innerText = 'Processing...';
            errorDiv.style.display = 'none';

            try {
                const endpoint = currentAuthMode === 'signup' ? '/api/signup' : '/api/login';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Auth failed');

                localStorage.setItem('jurisai_token', data.token);
                modal.style.display = 'none';
                updateAuthUI();
            } catch (err) {
                errorDiv.innerText = err.message;
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = currentAuthMode === 'signup' ? 'Sign Up' : 'Log In';
            }
        });

        updateAuthUI();
    }

    function updateAuthUI() {
        const token = localStorage.getItem('jurisai_token');
        const loginBtn = $('#navLoginBtn');
        const signupBtn = $('#navSignupBtn');
        const logoutBtn = $('#navLogoutBtn');

        if (!loginBtn) return;

        if (token) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    function init() {
        initNavigation();
        initSmoothLinks();
        initChat();
        initAuth();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
