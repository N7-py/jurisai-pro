/* ============================================
   JurisAI Pro — Application Logic
   Hugging Face Inference API Integration
   ============================================ */

(() => {
    'use strict';

    // ===== Configuration =====
    const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';

    // ▼▼▼ PASTE YOUR HUGGING FACE TOKEN BELOW ▼▼▼
    const DEFAULT_TOKEN = '';
    // ▲▲▲ Get one free at: https://huggingface.co/settings/tokens ▲▲▲

    const MODELS = {
        summarization: 'facebook/bart-large-cnn',
        ner: 'dslim/bert-large-NER',
        qa: 'deepset/roberta-base-squad2',
        zeroShot: 'MoritzLaurer/deberta-v3-large-zeroshot-v2.0',
        textGen: 'google/flan-t5-base',  // fallback, may not be available
    };

    // Translation model pairs
    const TRANSLATION_MODELS = {
        'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
        'en-de': 'Helsinki-NLP/opus-mt-en-de',
        'en-es': 'Helsinki-NLP/opus-mt-en-es',
        'en-it': 'Helsinki-NLP/opus-mt-en-it',
        'en-pt': 'Helsinki-NLP/opus-mt-en-pt',
        'en-nl': 'Helsinki-NLP/opus-mt-en-nl',
        'en-zh': 'Helsinki-NLP/opus-mt-en-zh',
        'en-ar': 'Helsinki-NLP/opus-mt-en-ar',
        'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
        'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
        'de-en': 'Helsinki-NLP/opus-mt-de-en',
        'es-en': 'Helsinki-NLP/opus-mt-es-en',
        'it-en': 'Helsinki-NLP/opus-mt-it-en',
        'pt-en': 'Helsinki-NLP/opus-mt-tc-big-en-pt',
        'nl-en': 'Helsinki-NLP/opus-mt-nl-en',
        'zh-en': 'Helsinki-NLP/opus-mt-zh-en',
        'ar-en': 'Helsinki-NLP/opus-mt-ar-en',
        'hi-en': 'Helsinki-NLP/opus-mt-hi-en',
    };

    // ===== State =====
    let apiToken = localStorage.getItem('hf_api_token') || DEFAULT_TOKEN;

    // ===== DOM References =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ===== API Helper =====
    async function queryHF(model, payload, retries = 2) {
        if (!apiToken) {
            throw new Error('Please set your Hugging Face API token first (click "API Settings" in the top navigation).');
        }

        const response = await fetch(`${HF_API_BASE}/${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 503 || response.status === 504) {
            if (retries > 0) {
                const isLoading = response.status === 503;
                let waitTime = 20000;
                if (isLoading) {
                    try {
                        const data = await response.json();
                        if (data.estimated_time) waitTime = Math.min(data.estimated_time * 1000, 30000);
                    } catch (e) { }
                }
                await new Promise(r => setTimeout(r, waitTime));
                return queryHF(model, payload, retries - 1);
            }
            throw new Error('Model is currently loading (cold start). Please try again in 20-30 seconds.');
        }

        if (response.status === 401) {
            throw new Error('Invalid or expired API token. Please get a new token from huggingface.co/settings/tokens and update it in Settings.');
        }

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const errMsg = err.error || `API error (${response.status})`;
            // Catch BART tokenizer errors and give a user-friendly message
            if (errMsg.includes('index out of range') || errMsg.includes('IndexError')) {
                throw new Error('The input text is too short for this model. Please provide a longer, more detailed document (at least a full paragraph).');
            }
            throw new Error(errMsg + '. Please try again.');
        }

        return response.json();
    }

    // ===== Result Rendering Helpers =====
    function showLoading(container, message = 'Analyzing with AI...') {
        container.innerHTML = `
            <div class="result-loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="result-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                <span>${message}</span>
            </div>
        `;
    }

    function showResult(container, title, content, copyText) {
        const id = 'copy-' + Date.now();
        container.innerHTML = `
            <div class="result-content">
                <div class="result-content-header">
                    <h4>✦ ${title}</h4>
                    <button class="copy-btn" id="${id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy
                    </button>
                </div>
                ${content}
            </div>
        `;

        document.getElementById(id).addEventListener('click', function () {
            navigator.clipboard.writeText(copyText || container.querySelector('.result-text')?.textContent || '');
            this.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                Copied!
            `;
            this.classList.add('copied');
            setTimeout(() => {
                this.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Copy
                `;
                this.classList.remove('copied');
            }, 2000);
        });
    }

    // ===== Navigation =====
    function initNavigation() {
        const navbar = $('#navbar');
        const navToggle = $('#navToggle');
        const navLinks = $('#navLinks');

        // Scroll effect
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        // Mobile toggle
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile nav on link click
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ===== Settings Modal =====
    function initSettingsModal() {
        const modal = $('#settingsModal');
        const settingsBtn = $('#settingsBtn');
        const closeBtn = $('#modalClose');
        const saveBtn = $('#saveToken');
        const tokenInput = $('#apiToken');
        const tokenStatus = $('#tokenStatus');
        const toggleVis = $('#toggleTokenVis');

        if (!modal || !settingsBtn) return;

        // Load existing token
        if (apiToken) {
            tokenInput.value = apiToken;
            tokenStatus.textContent = '✓ Token saved';
            tokenStatus.className = 'token-status valid';
        }

        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        toggleVis.addEventListener('click', () => {
            tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password';
        });

        saveBtn.addEventListener('click', () => {
            const token = tokenInput.value.trim();
            if (!token) {
                tokenStatus.textContent = '✗ Please enter a valid token';
                tokenStatus.className = 'token-status invalid';
                return;
            }
            apiToken = token;
            localStorage.setItem('hf_api_token', token);
            tokenStatus.textContent = '✓ Token saved successfully';
            tokenStatus.className = 'token-status valid';
            setTimeout(() => modal.classList.remove('active'), 1000);
        });
    }

    // ===== Module Tabs =====
    function initModuleTabs() {
        const tabs = $$('.module-tab');
        const panels = $$('.module-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                $(`#mod-${target}`).classList.add('active');
            });
        });

        // Feature card links
        $$('.feature-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.feature-link')) return;
                const mod = card.dataset.module;
                if (mod) {
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));
                    const targetTab = $(`.module-tab[data-tab="${mod}"]`);
                    if (targetTab) targetTab.classList.add('active');
                    $(`#mod-${mod}`).classList.add('active');
                    $('#modules').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ===== Character Counters =====
    function initCharCounters() {
        const pairs = [
            ['docReviewInput', 'docReviewCount'],
            ['contractInput', 'contractCount'],
            ['researchContext', 'researchCount'],
            ['translationInput', 'translationCount'],
            ['ddInput', 'ddCount'],
            ['draftInput', 'draftCount'],
        ];

        pairs.forEach(([inputId, countId]) => {
            const input = document.getElementById(inputId);
            const count = document.getElementById(countId);
            if (input && count) {
                input.addEventListener('input', () => {
                    count.textContent = `${input.value.length} characters`;
                });
            }
        });
    }

    // ===== Module 1: Document Review =====
    function initDocumentReview() {
        const btn = $('#docReviewBtn');
        const input = $('#docReviewInput');
        const result = $('#docReviewResult');

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) {
                showError(result, 'Please paste your document text above.');
                return;
            }

            if (text.length < 200) {
                showError(result, 'Text is too short for meaningful summarization. Please provide at least a full paragraph (200+ characters).');
                return;
            }

            btn.disabled = true;
            showLoading(result, 'Summarizing document with BART AI...');

            try {
                // BART has a max input of ~1024 tokens, so truncate if needed
                const truncated = text.substring(0, 4000);
                // Set min_length dynamically — must be less than max_length and reasonable for input size
                const minLen = Math.min(30, Math.floor(text.length / 10));
                const data = await queryHF(MODELS.summarization, {
                    inputs: truncated,
                    parameters: {
                        max_length: 300,
                        min_length: minLen,
                        do_sample: false,
                    }
                });

                const summary = data[0]?.summary_text || 'No summary generated.';
                showResult(result, 'Document Summary', `<div class="result-text">${escapeHtml(summary)}</div>`, summary);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ===== Module 2: Contract Extraction =====
    function initContractExtraction() {
        const btn = $('#contractBtn');
        const input = $('#contractInput');
        const result = $('#contractResult');

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) {
                showError(result, 'Please paste your contract text above.');
                return;
            }

            btn.disabled = true;
            showLoading(result, 'Extracting entities with BERT Large NER...');

            try {
                const data = await queryHF(MODELS.ner, { inputs: text });

                if (!Array.isArray(data) || data.length === 0) {
                    showResult(result, 'No Entities Found', '<div class="result-text">No named entities were detected in the provided text. Try providing more detailed contract text with specific names, organizations, and locations.</div>');
                    return;
                }

                // Group entities by type
                const groups = {};
                const entityLabels = {
                    'B-PER': 'PER', 'I-PER': 'PER',
                    'B-ORG': 'ORG', 'I-ORG': 'ORG',
                    'B-LOC': 'LOC', 'I-LOC': 'LOC',
                    'B-MISC': 'MISC', 'I-MISC': 'MISC',
                };

                const groupNames = {
                    'PER': 'Persons',
                    'ORG': 'Organizations',
                    'LOC': 'Locations',
                    'MISC': 'Miscellaneous',
                };

                // Merge sub-word tokens
                const merged = mergeNERTokens(data, entityLabels);

                merged.forEach(entity => {
                    const group = entity.type;
                    if (!groups[group]) groups[group] = new Set();
                    groups[group].add(entity.word);
                });

                let html = '<div class="entity-list">';
                let copyText = '';

                for (const [type, words] of Object.entries(groups)) {
                    const cssClass = type.toLowerCase();
                    html += `<div class="entity-group">
                        <div class="entity-group-label ${cssClass}">${groupNames[type] || type} (${words.size})</div>
                        <div class="entity-tags">`;

                    words.forEach(word => {
                        html += `<span class="entity-tag ${cssClass}">${escapeHtml(word)}</span>`;
                    });

                    html += '</div></div>';
                    copyText += `${groupNames[type] || type}: ${[...words].join(', ')}\n`;
                }

                html += '</div>';
                showResult(result, 'Extracted Entities', html, copyText);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Merge sub-word NER tokens (e.g., "John" + "##son" → "Johnson")
    function mergeNERTokens(tokens, entityLabels) {
        const merged = [];
        let current = null;

        tokens.forEach(token => {
            const type = entityLabels[token.entity_group || token.entity] || null;
            if (!type) return;

            const isBegin = (token.entity_group || token.entity || '').startsWith('B-');
            const word = token.word.replace(/^##/, '');

            if (isBegin || !current || current.type !== type) {
                if (current) merged.push(current);
                current = { type, word: word };
            } else {
                // Continuation token
                if (token.word.startsWith('##')) {
                    current.word += word;
                } else {
                    current.word += ' ' + word;
                }
            }
        });

        if (current) merged.push(current);
        return merged;
    }

    // ===== Module 3: Legal Research (QA) =====
    function initLegalResearch() {
        const btn = $('#researchBtn');
        const context = $('#researchContext');
        const question = $('#researchQuestion');
        const result = $('#researchResult');

        btn.addEventListener('click', async () => {
            const ctx = context.value.trim();
            const q = question.value.trim();

            if (!ctx) {
                showError(result, 'Please paste the legal text you want to research.');
                return;
            }
            if (!q) {
                showError(result, 'Please enter your research question.');
                return;
            }

            btn.disabled = true;
            showLoading(result, 'Searching for answers with RoBERTa AI...');

            try {
                const data = await queryHF(MODELS.qa, {
                    inputs: {
                        question: q,
                        context: ctx.substring(0, 5000),
                    }
                });

                const answer = data.answer || 'No answer found.';
                const score = data.score ? (data.score * 100).toFixed(1) : null;

                let html = `
                    <div class="answer-highlight">
                        <div class="answer-text">${escapeHtml(answer)}</div>
                        ${score ? `<div class="answer-confidence">Confidence: ${score}%</div>` : ''}
                    </div>
                    <div class="result-text" style="font-size:0.85rem; color: var(--text-secondary);">
                        <strong>Question:</strong> ${escapeHtml(q)}
                    </div>
                `;

                showResult(result, 'Research Result', html, answer);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ===== Module 4: Translation =====
    function initTranslation() {
        const btn = $('#translationBtn');
        const input = $('#translationInput');
        const srcLang = $('#sourceLang');
        const tgtLang = $('#targetLang');
        const swapBtn = $('#swapLangs');
        const result = $('#translationResult');

        swapBtn.addEventListener('click', () => {
            const temp = srcLang.value;
            srcLang.value = tgtLang.value;
            tgtLang.value = temp;
        });

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) {
                showError(result, 'Please enter text to translate.');
                return;
            }

            const src = srcLang.value;
            const tgt = tgtLang.value;

            if (src === tgt) {
                showError(result, 'Source and target languages must be different.');
                return;
            }

            const modelKey = `${src}-${tgt}`;
            const model = TRANSLATION_MODELS[modelKey];

            if (!model) {
                showError(result, `Translation from ${src.toUpperCase()} to ${tgt.toUpperCase()} is not yet supported. Try using English as an intermediate language.`);
                return;
            }

            btn.disabled = true;
            showLoading(result, `Translating ${src.toUpperCase()} → ${tgt.toUpperCase()} with Helsinki-NLP...`);

            try {
                const data = await queryHF(model, { inputs: text });
                const translation = data[0]?.translation_text || 'No translation generated.';

                showResult(result, `Translation (${src.toUpperCase()} → ${tgt.toUpperCase()})`,
                    `<div class="result-text">${escapeHtml(translation)}</div>`, translation);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ===== Module 5: Due Diligence (Zero-Shot Classification) =====
    function initDueDiligence() {
        const btn = $('#ddBtn');
        const input = $('#ddInput');
        const categories = $('#ddCategories');
        const result = $('#ddResult');

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) {
                showError(result, 'Please paste the document text for risk analysis.');
                return;
            }

            const cats = categories.value.split(',').map(c => c.trim()).filter(c => c);
            if (cats.length < 2) {
                showError(result, 'Please provide at least 2 risk categories (comma-separated).');
                return;
            }

            btn.disabled = true;
            showLoading(result, 'Classifying risk categories with DeBERTa AI...');

            try {
                const data = await queryHF(MODELS.zeroShot, {
                    inputs: text.substring(0, 3000),
                    parameters: {
                        candidate_labels: cats,
                        multi_label: true,
                    }
                });

                // Handle both array format [{label, score}] (DeBERTa) and object format {labels, scores} (BART)
                let labels, scores;
                if (Array.isArray(data)) {
                    labels = data.map(d => d.label);
                    scores = data.map(d => d.score);
                } else {
                    labels = data.labels || [];
                    scores = data.scores || [];
                }

                let html = '<div class="risk-bars">';
                let copyText = 'Risk Analysis Results:\n\n';

                labels.forEach((label, i) => {
                    const score = scores[i] || 0;
                    const pct = (score * 100).toFixed(1);
                    let level = 'low';
                    if (score > 0.6) level = 'high';
                    else if (score > 0.3) level = 'medium';

                    html += `
                        <div class="risk-bar-item">
                            <div class="risk-bar-header">
                                <span class="risk-bar-label">${escapeHtml(label)}</span>
                                <span class="risk-bar-score">${pct}%</span>
                            </div>
                            <div class="risk-bar-track">
                                <div class="risk-bar-fill ${level}" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    `;
                    copyText += `${label}: ${pct}%\n`;
                });

                html += '</div>';
                showResult(result, 'Risk Classification', html, copyText);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ===== Module 6: Drafting Assistant (Template-based) =====
    function initDrafting() {
        const btn = $('#draftBtn');
        const input = $('#draftInput');
        const draftType = $('#draftType');
        const draftTone = $('#draftTone');
        const result = $('#draftResult');

        // Legal draft templates
        const templates = {
            clause: {
                formal: (topic) => `CLAUSE — ${topic.toUpperCase()}\n\n1. ${topic}. The Parties hereby agree that ${topic.toLowerCase()}. This obligation shall remain in full force and effect during the term of this Agreement and for a period of two (2) years following its termination or expiration.\n\n2. Remedies. Any breach of this clause shall entitle the non-breaching Party to seek injunctive relief, specific performance, and/or monetary damages as permitted under applicable law.\n\n3. Severability. If any provision of this clause is held to be unenforceable, the remaining provisions shall continue in full force and effect.`,
                neutral: (topic) => `CLAUSE — ${topic}\n\nThe Parties agree to the following regarding ${topic.toLowerCase()}:\n\n(a) Each Party shall comply with all applicable requirements related to ${topic.toLowerCase()}.\n(b) This clause shall survive the termination of this Agreement.\n(c) Any disputes arising under this clause shall be resolved in accordance with the dispute resolution provisions of this Agreement.`,
                persuasive: (topic) => `CLAUSE — ${topic}\n\nGiven the critical importance of ${topic.toLowerCase()} to the interests of all Parties, it is essential that the following provisions be strictly observed:\n\n1. All Parties shall take every reasonable measure to ensure full compliance with ${topic.toLowerCase()}.\n2. Failure to comply may result in substantial harm and shall constitute a material breach of this Agreement.\n3. The prevailing Party in any enforcement action shall be entitled to recover reasonable attorneys' fees and costs.`
            },
            letter: {
                formal: (topic) => `[Date]\n\n[Recipient Name]\n[Recipient Address]\n\nRe: ${topic}\n\nDear [Recipient],\n\nI am writing to formally address the matter of ${topic.toLowerCase()}. After careful review of the relevant facts and applicable legal standards, we believe it is necessary to bring the following matters to your attention.\n\n[Detailed legal analysis and position would follow here based on the specific facts of the case.]\n\nWe respectfully request your prompt attention to this matter. Please respond within thirty (30) days of receipt of this letter. Should you have any questions, do not hesitate to contact our office.\n\nSincerely,\n[Attorney Name]\n[Firm Name]`,
                neutral: (topic) => `[Date]\n\nRe: ${topic}\n\nDear [Recipient],\n\nThis letter concerns ${topic.toLowerCase()}. We would like to discuss the following points:\n\n1. [Key fact or concern]\n2. [Applicable legal standard]\n3. [Proposed course of action]\n\nWe welcome the opportunity to discuss this matter at your earliest convenience.\n\nRegards,\n[Name]`,
                persuasive: (topic) => `[Date]\n\nRe: ${topic} — URGENT ATTENTION REQUIRED\n\nDear [Recipient],\n\nWe write regarding the urgent matter of ${topic.toLowerCase()}. The facts clearly demonstrate that immediate action is required. Our client's position is supported by well-established legal precedent, and we are confident that any fair assessment will reach the same conclusion.\n\nWe strongly urge you to address this matter within fourteen (14) days to avoid further legal proceedings.\n\nVery truly yours,\n[Attorney Name]`
            },
            memorandum: {
                formal: (topic) => `LEGAL MEMORANDUM\n\nTO: [Recipient]\nFROM: [Author]\nDATE: [Date]\nRE: ${topic}\n\nI. QUESTION PRESENTED\nWhether ${topic.toLowerCase()} constitutes a valid legal basis for the proposed course of action.\n\nII. BRIEF ANSWER\n[Summarize your conclusion here in one to two sentences.]\n\nIII. STATEMENT OF FACTS\n[Describe the relevant facts objectively.]\n\nIV. DISCUSSION\n[Analyze the applicable legal standards and apply them to the facts. Cite relevant statutes, regulations, and case law.]\n\nV. CONCLUSION\nBased on the foregoing analysis, it is our recommendation that [recommended course of action].`,
                neutral: (topic) => `MEMORANDUM\n\nRE: ${topic}\nDATE: [Date]\n\nSummary:\nThis memorandum addresses ${topic.toLowerCase()} and provides a balanced analysis of the relevant considerations.\n\nAnalysis:\n1. [First consideration]\n2. [Second consideration]\n3. [Third consideration]\n\nRecommendation:\n[Provide a balanced recommendation based on the analysis above.]`,
                persuasive: (topic) => `MEMORANDUM — CONFIDENTIAL\n\nRE: ${topic}\nDATE: [Date]\n\nExecutive Summary:\nOur review strongly supports the position that ${topic.toLowerCase()} warrants immediate action. The evidence and applicable law overwhelmingly favor our client's position.\n\nKey Arguments:\n1. [Strongest argument]\n2. [Supporting precedent]\n3. [Policy considerations]\n\nRecommendation:\nWe strongly recommend proceeding immediately with the proposed course of action.`
            },
            contract: {
                formal: (topic) => `AGREEMENT REGARDING ${topic.toUpperCase()}\n\nThis Agreement ("Agreement") is entered into as of [Date] ("Effective Date"), by and between:\n\nParty A: [Full Legal Name], a [jurisdiction] [entity type], with its principal place of business at [address] ("Party A"); and\n\nParty B: [Full Legal Name], a [jurisdiction] [entity type], with its principal place of business at [address] ("Party B").\n\nWHEREAS, the Parties wish to establish the terms and conditions regarding ${topic.toLowerCase()};\n\nNOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:\n\n1. SCOPE. This Agreement covers ${topic.toLowerCase()} as described herein.\n\n2. TERM. This Agreement shall commence on the Effective Date and continue for a period of [duration].\n\n3. OBLIGATIONS. [Detail the obligations of each Party.]\n\n4. GOVERNING LAW. This Agreement shall be governed by the laws of [jurisdiction].\n\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.`,
                neutral: (topic) => `AGREEMENT — ${topic}\n\nDate: [Date]\nParties: [Party A] and [Party B]\n\n1. Purpose: This Agreement addresses ${topic.toLowerCase()}.\n2. Terms: [Define the key terms and obligations.]\n3. Duration: [Specify the term of agreement.]\n4. Termination: Either party may terminate with [notice period] written notice.\n5. Governing Law: [Applicable jurisdiction].\n\nAgreed by the Parties on the date stated above.`,
                persuasive: (topic) => `AGREEMENT — ${topic}\n\nThis Agreement represents a carefully considered arrangement regarding ${topic.toLowerCase()} that serves the vital interests of both Parties.\n\n1. The Parties recognize the paramount importance of ${topic.toLowerCase()} and commit to the highest standards of performance.\n2. Any breach of this Agreement shall be treated as a material breach subject to immediate remedies.\n3. This Agreement supersedes all prior discussions and constitutes the entire understanding between the Parties.\n\n[Signatures]`
            },
            notice: {
                formal: (topic) => `FORMAL NOTICE\n\nDate: [Date]\nTo: [Recipient]\nFrom: [Sender]\nRe: Notice Regarding ${topic}\n\nPlease be advised that this constitutes formal notice regarding ${topic.toLowerCase()}, pursuant to [applicable statute/contract section].\n\nSpecifically:\n\n1. [State the facts giving rise to this notice.]\n2. [State the legal basis for the notice.]\n3. [State the required action or response expected.]\n\nPlease govern yourself accordingly. Failure to respond within [timeframe] may result in further legal action without additional notice.\n\n[Sender Signature]`,
                neutral: (topic) => `NOTICE\n\nRe: ${topic}\nDate: [Date]\n\nThis is to notify you regarding ${topic.toLowerCase()}.\n\nDetails: [Describe the situation.]\nRequired Action: [State what action you expect.]\nDeadline: [Specify any deadlines.]\n\nPlease feel free to contact us with any questions.`,
                persuasive: (topic) => `NOTICE — IMMEDIATE ATTENTION REQUIRED\n\nRe: ${topic}\nDate: [Date]\n\nYou are hereby put on notice that ${topic.toLowerCase()} requires your immediate attention. The consequences of inaction could be severe and may include [potential consequences].\n\nWe strongly urge you to take appropriate action within [timeframe].\n\nThis notice is sent without prejudice to any and all rights and remedies available to us.`
            }
        };

        btn.addEventListener('click', async () => {
            const prompt = input.value.trim();
            if (!prompt) {
                showError(result, 'Please describe what you want to draft.');
                return;
            }

            const typeVal = draftType.value;
            const typeName = draftType.options[draftType.selectedIndex].text;
            const toneVal = draftTone.value;
            const toneName = draftTone.options[draftTone.selectedIndex].text;

            btn.disabled = true;
            showLoading(result, `Generating ${typeName.toLowerCase()} draft...`);

            try {
                // Use template-based generation
                const templateCategory = templates[typeVal] || templates.clause;
                const templateFn = templateCategory[toneVal] || templateCategory.formal;
                const generated = templateFn(prompt);

                showResult(result, `Generated ${typeName} (${toneName})`,
                    `<div class="result-text" style="white-space: pre-wrap;">${escapeHtml(generated)}</div>
                     <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-secondary); opacity: 0.7;">💡 This is a template-based draft. Customize the bracketed placeholders with your specific details.</div>`,
                    generated);

            } catch (err) {
                showError(result, err.message);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ===== Scroll Reveal Animation =====
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        $$('.feature-card, .audience-card, .module-card').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    // ===== Smooth Scroll for Feature Links =====
    function initSmoothLinks() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                // Handle module-specific links
                if (href.startsWith('#mod-')) {
                    e.preventDefault();
                    const modName = href.replace('#mod-', '');
                    const tab = $(`.module-tab[data-tab="${modName}"]`);
                    if (tab) {
                        tab.click();
                        $('#modules').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ===== Utility =====
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ===== Auto-prompt API settings if no token =====
    function checkTokenOnFirstVisit() {
        if (!apiToken) {
            setTimeout(() => {
                const modal = $('#settingsModal');
                if (modal) modal.classList.add('active');
            }, 2000);
        }
    }

    // ===== Keyboard Shortcuts =====
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close modal
            if (e.key === 'Escape') {
                const modal = $('#settingsModal');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            }
        });
    }

    // ===== Initialize Everything =====
    function init() {
        initNavigation();
        initSettingsModal();
        initModuleTabs();
        initCharCounters();
        initDocumentReview();
        initContractExtraction();
        initLegalResearch();
        initTranslation();
        initDueDiligence();
        initDrafting();
        initScrollReveal();
        initSmoothLinks();
        initKeyboardShortcuts();
        checkTokenOnFirstVisit();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
