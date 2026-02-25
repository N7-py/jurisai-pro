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
        ner: 'dslim/bert-base-NER',
        qa: 'deepset/roberta-base-squad2',
        zeroShot: 'facebook/bart-large-mnli',
        textGen: 'google/flan-t5-base',
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

        if (response.status === 503) {
            const data = await response.json();
            if (data.error && data.error.includes('loading') && retries > 0) {
                const waitTime = data.estimated_time ? Math.min(data.estimated_time * 1000, 30000) : 20000;
                await new Promise(r => setTimeout(r, waitTime));
                return queryHF(model, payload, retries - 1);
            }
            throw new Error('Model is currently loading. Please try again in a few seconds.');
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
            showLoading(result, 'Extracting entities with BERT NER...');

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
            showLoading(result, 'Classifying risk categories with BART MNLI...');

            try {
                const data = await queryHF(MODELS.zeroShot, {
                    inputs: text.substring(0, 3000),
                    parameters: {
                        candidate_labels: cats,
                        multi_label: true,
                    }
                });

                const labels = data.labels || [];
                const scores = data.scores || [];

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

    // ===== Module 6: Drafting Assistant =====
    function initDrafting() {
        const btn = $('#draftBtn');
        const input = $('#draftInput');
        const draftType = $('#draftType');
        const draftTone = $('#draftTone');
        const result = $('#draftResult');

        btn.addEventListener('click', async () => {
            const prompt = input.value.trim();
            if (!prompt) {
                showError(result, 'Please describe what you want to draft.');
                return;
            }

            const type = draftType.options[draftType.selectedIndex].text;
            const tone = draftTone.options[draftTone.selectedIndex].text;

            btn.disabled = true;
            showLoading(result, 'Generating legal draft with FLAN-T5...');

            try {
                const fullPrompt = `Write a ${tone.toLowerCase()} legal ${type.toLowerCase()}. ${prompt}. Use professional legal language with appropriate terms and conditions.`;

                const data = await queryHF(MODELS.textGen, {
                    inputs: fullPrompt,
                    parameters: {
                        max_new_tokens: 512,
                        temperature: 0.7,
                        do_sample: true,
                        top_p: 0.9,
                    }
                });

                const generated = data[0]?.generated_text || 'No text generated. Try a more specific prompt.';

                showResult(result, `Generated ${type}`,
                    `<div class="result-text">${escapeHtml(generated)}</div>`, generated);

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
