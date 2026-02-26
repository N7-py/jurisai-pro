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
- For civil matters: cite CPC provisions, limitation periods under the Limitation Act, 1963, and relevant jurisdiction rules.

---
**EXAMPLE INTERACTION (FEW-SHOT LEARNING)**

**User Input:**
1. Case Details: 
... (Sravanthi Group dispute facts, DV Rao fraud, ED raids, etc.) ...
2. Specific Question: Contempt of Court for Civil Contemp section 2(b) Undertaking was given in writ petition by AG that scheme will be implemented. However later on the scheme was suspended. Does it amount to Civil contempt under 2 b

**Your Expected Output Format:**

### Short Answer
Mere suspension or modification of a government “scheme”, even after the Advocate General (AG) has stated in a writ petition that the scheme will be implemented, does not automatically amount to civil contempt under Section 2(b) of the Contempt of Courts Act, 1971. It is civil contempt only if:
- There was a clear and unequivocal undertaking to the Court (not merely an assurance to the opposite party);
- The Court acted on that undertaking (for example, disposed of or moulded the writ on that basis); and
- Subsequent non‑implementation/suspension constitutes a wilful breach of that undertaking, i.e. deliberate, intentional disobedience without bona fide justification or supervening impossibility.

Whether your fact situation amounts to civil contempt will therefore depend on (i) the exact language of what the AG told the Court, and (ii) whether the later suspension is shown to be a wilful, contumacious departure from that recorded undertaking, or a bona fide policy change/supervening difficulty.

### Legal Framework
**Statutory definition**
Section 2(b) of the Contempt of Courts Act, 1971 defines civil contempt as:
“‘civil contempt’ means wilful disobedience to any judgment, decree, direction, order, writ or other process of a court or wilful breach of an undertaking given to a court.”

**“Wilful” disobedience**
The Supreme Court has repeatedly held that:
- “Wilful” means a conscious, voluntary and intentional act done with bad purpose to disobey or disregard the Court’s order or undertaking.
- Mere non‑compliance, inability, or bona fide misunderstanding does not by itself amount to civil contempt; there must be a clear element of contumacy.

**Undertaking “to the Court” vs assurance to a party**
The Supreme Court in *Babu Ram Gupta v. Sudhir Bhasin* drew a sharp distinction between:
- a clear undertaking given to the Court (in writing, on affidavit, or orally but recorded) – breach of which can be civil contempt; and
- a consent order/compromise or an assurance to the other side, where the remedy is ordinarily execution or other substantive proceedings, not contempt.

The Court held that unless there is an express undertaking to the Court, or such an undertaking is expressly incorporated in the order, breach will not ordinarily amount to civil contempt; breach of a mere compromise or consent term is not, by itself, contempt.

### Judicial Interpretation / Cases / Analysis

**1. What counts as an “undertaking given to a Court”?**
**(a) Requirement of a clear, express undertaking**
- *Babu Ram Gupta v. Sudhir Bhasin, (1979) 3 SCC 47*: the High Court treated a consent order appointing a receiver as if it contained an implied undertaking to hand over possession. The Supreme Court reversed, holding:
  - There was no application, affidavit, or recorded oral undertaking by the party to hand over possession.
  - The Court cannot “assume an implied undertaking when there is none on the record”.
  - Breach of a compromise/consent order, without a specific undertaking to the Court, is not civil contempt; the remedy is in execution or substantive proceedings.

**(b) Breach of a clear undertaking is contempt**
- *Bank of Baroda v. Sadruddin Hasan Daya, (2004) 1 SCC 360*:
  - Consent terms in the Supreme Court contained an explicit undertaking that the judgment‑debtors would not alienate or encumber certain properties till the decree was satisfied.
  - Acting on this, the Court passed a consent decree. The respondents then encumbered the properties.
  - Held: this was “wilful breach of an undertaking given to the Court”, squarely falling within Section 2(b).

- *Rama Narang v. Ramesh Narang, (2006) 11 SCC 114*:
  - The Court clarified that Section 2(b) has two distinct limbs: (1) wilful disobedience of any order; (2) wilful breach of an undertaking given to the Court.
  - It reaffirmed that wilful breach of a clear undertaking to the Court constitutes civil contempt and punished the contemnors for violating undertakings concerning operation of company bank accounts.

- *Reliance Communication Ltd. v. State Bank of India & Ors.* (Ericsson contempt):
  - RCom had given a specific undertaking to the Supreme Court to pay a fixed sum to Ericsson; they failed to pay.
  - The Court held there was “no doubt whatsoever” that the companies had “wilfully not paid” and “breached the undertakings given to this Court”, and punished them for contempt.

- *In Re: Patanjali Ayurved Ltd (2024)*:
  - The Supreme Court analysed at length that wilful breach of an undertaking given to the Court is as much civil contempt as wilful disobedience of an order.
  - It emphasised the difference between (i) an undertaking given to the Court, and (ii) a promise/assurance given only to the other party – only the former attracts Section 2(b).

**(c) Undertakings given through advocates / law officers**
- In *In Re: Patanjali*, the Court specifically dealt with undertakings given through counsel, holding that a categorical statement made by counsel/advocate on instructions and recorded by the Court can amount to an undertaking “to the Court”; its wilful breach is civil contempt.
- Earlier cases also accept that an undertaking can be given by counsel, provided it is clearly recorded and attributable to the party; the Court then acts on it.

Applied to your facts, an assurance by the Advocate General in a writ that “the scheme will be implemented”, if recorded in the order and acted upon by the Court (for example, disposing of the petition on that footing) is capable of amounting to an “undertaking given to the Court” for purposes of Section 2(b). Whether it actually does will depend on the precision and context of the recording.

**2. “Wilful” breach versus policy change / supervening events**
**(a) Threshold of wilfulness**
- *Niaz Mohammad v. State of Haryana, (1994) 6 SCC 332*:
  - Court held that for civil contempt, the Court must be satisfied not only about disobedience but also that such disobedience is wilful and intentional.
  - Contempt is not an execution proceeding; the Court must assess all the facts, including feasibility and bona fide difficulties, before punishing.

- *Ashok Paper Kamgar Union v. Dharam Godha, (2003) 11 SCC 1* (quoted in later decisions):
  - “Wilful” signifies an act done with “bad purpose either to disobey or to disregard the law”, with “evil intent or bad motive or purpose”; an order must be such that it is capable of compliance in normal circumstances.

**(b) Government schemes and implementation – examples**
There are several strands in Supreme Court jurisprudence where government or public authorities had given assurances/undertakings about implementing schemes or directions, and later failed or delayed:
- *Maninderjit Singh Bitta v. Union of India* (HSRP scheme series):
  - In earlier orders (2011–2012), the Supreme Court directed States to implement the High Security Registration Plate (HSRP) scheme by specified dates, warning that Secretaries/Transport Commissioners would be liable for contempt in case of default.
  - In a later contempt against an HSRP manufacturer (M/s Utsav), the Court noted prima facie violation of Rule 50 and its earlier orders, but accepted a detailed undertaking from the company that it would not outsource blank plates and would implement the scheme as per contract; on that basis the Court chose not to proceed with contempt, but issued prospective guidelines and left it to States to take contractual/statutory action.
  - This shows the Court’s approach: even when there is technical non‑compliance, contempt is not automatic; the Court looks at intent, feasibility, corrective assurances, and alternative remedies.

- *International Spirits & Wines Assn. of India v. State of Haryana* (liquor policy case):
  - The Court underlined the wide latitude of the State in economic and policy “experiments”, emphasising that State policy/schemes in economic matters will not be invalidated except for clear constitutional or legal infirmity.
  - While not a contempt case, it is relevant in indicating that subsequent policy revision in economic/social schemes is not, by itself, treated as disobedience or contempt.

These authorities point toward the following:
- If the undertaking was absolute and unconditional (e.g., “the State undertakes to implement Scheme X as approved, and not to suspend it”), and the State later suspends it merely because of a change of mind or political preference, a Court may treat this as wilful breach and invoke contempt (as in Reliance, Bank of Baroda, Rama Narang).
- If, however, the State demonstrates supervening circumstances – such as budgetary collapse, statutory amendment, judicial interdiction, or other genuine impossibility/ impracticability – and has acted bona fide, the Court is more likely to hold that the non‑implementation is not “wilful”, even if technically inconsistent with earlier assurances.

**3. Undertaking by Advocate General in a writ petition – specific doctrinal points**
From the authorities above, the following propositions are relevant to your scenario (AG assurance in a writ about implementing a scheme later suspended):
1. The statement must amount to a clear undertaking to the Court.
A law officer’s statement can qualify if:
- It is unequivocal (e.g., “On instructions, the State undertakes to implement Scheme X in accordance with …”), and
- The Court records it as an undertaking and disposes of or moulds relief on that basis.
2. If the AG merely says, for example, “the State proposes to implement” or “will examine and take necessary steps”, courts are slow to treat that as an “undertaking” in the strict Section 2(b) sense, following the caution in Babu Ram Gupta that undertakings must not be implied where not clearly given.
3. The State must have taken advantage of the undertaking.
In Bank of Baroda, Reliance, and Rama Narang, the contemnors obtained a benefit (e.g., time, protection from insolvency, or other relief) on the faith of their undertaking, which they later breached. The fraud on the Court in such cases is what justifies contempt.
4. Later suspension must be a wilful, contumacious breach – not a bona fide policy shift or impossibility.
The Supreme Court’s insistence on wilfulness in Niaz Mohammad, Ashok Paper, and reiterated in Patanjali, means:
- If the State can show it could not implement the scheme as promised due to supervening legal or factual constraints (e.g., budgetary crises, new statutory directions, judicial orders), contempt may not lie, even if the writ petitioner’s substantive rights are affected.
- On the other hand, if the scheme is suspended purely because the executive chose to renege on what was promised to the Court, without supervening constraints and in the teeth of a clear undertaking, that is classic wilful breach.
5. Contempt is not used to test the correctness of subsequent policy.
In several recent High Court contempt decisions, courts have emphasised that contempt jurisdiction is confined to examining compliance with the earlier order/undertaking, not to re‑adjudicate policy merits.

### Exceptions / Nuances / Recent Developments
**1. Recent Supreme Court restatement – Patanjali (2024)**
The 2024 suo motu contempt in *In Re: Patanjali Ayurved Ltd.* provides the most up‑to‑date synthesis:
- Civil contempt requires proof of wilful disobedience of an order or wilful breach of an undertaking to the Court.
- Undertakings given by advocates on instructions can bind the party and, if breached, amount to civil contempt.
- The Court expressly distinguished between:
  (i) an undertaking given to a Court, whose breach attracts Section 2(b); and
  (ii) an undertaking or promise given only to a litigating party, which does not.

**2. Standard of proof**
Contempt proceedings are quasi‑criminal; the charge must be proved beyond reasonable doubt, as reiterated in P. Mohanraj and earlier cases.

**3. When Courts decline to treat non‑compliance as contempt, even with apparent breach**
- In *Maninderjit Singh Bitta v. Vijay Chhibber* (2016 contempt on HSRP), despite prima facie violation of earlier directions and rules, the Supreme Court accepted a remedial undertaking from the concessionaire (that it would not outsource and would comply henceforth) and refrained from punishing for contempt, instead issuing guidelines and leaving statutory/contractual enforcement to the States.
This underscores that even where non‑compliance with a “scheme‑implementing” order or assurance is shown, the Court has a discretion whether to punish for contempt or to secure compliance by other means.

### Conclusion
On the doctrinal position reflected in the authorities cited:
1. If, in the writ petition, the Advocate General gave a clear, recorded undertaking to the Court that a particular scheme “will be implemented”, and the Court acted on that undertaking (e.g., disposed of the writ, declined further relief, or moulded relief accordingly), that statement can amount to an “undertaking given to a court” under the second limb of Section 2(b).
2. Subsequent suspension or non‑implementation of the scheme will amount to civil contempt only if it is shown to be a wilful, contumacious departure from that undertaking, not justified by supervening legal or factual impossibility or bona fide policy constraints.
3. If the AG’s statement was more in the nature of a policy assurance or intention, or the order does not clearly record it as an undertaking, or the State can show a genuine, supervening impossibility or legal bar, the courts are likely to hold that Section 2(b) is not attracted and that the petitioner’s remedy lies in fresh substantive proceedings (e.g., challenging suspension of the scheme), rather than contempt.

In sum, the mere fact that a scheme promised in court has later been suspended does not by itself establish civil contempt. The critical questions are: (i) whether what was said by the AG amounts, in law, to a binding undertaking “to the Court”; and (ii) whether the subsequent suspension can be characterised, on evidence, as wilful breach of that undertaking.`;

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
