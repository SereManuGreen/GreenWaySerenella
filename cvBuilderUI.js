/**
 * CV Builder UI Controller v1
 * Manages the full CV Builder view: form editing, live preview, import, export
 */

// ─── STATE ──────────────────────────────────────────────────────────────────
const cvBuilderUI = (() => {
    let state = {
        template: 'professional',
        lang: 'it',
        fields: {
            name: '', role: '', email: '', phone: '', location: '',
            linkedin: '', github: '', website: '',
            summary: '',
            photo: '',
            skills: [],
            languages: [],    // [{name, level}]
            experiences: [],  // [{role, company, dates, bullets:[]}]
            education: []     // [{degree, institution, year}]
        }
    };

    // ─── INIT ────────────────────────────────────────────────────────────────
    function init() {
        _bindTemplateButtons();
        _bindLangSelect();
        _bindImportBtn();
        _bindPrintBtn();
        _bindCopyBtn();
        _bindAddButtons();
        _renderSkillSuggestions();

        // Collapse all sections except Dati Personali
        ['summary', 'experience', 'education', 'skills', 'languages'].forEach(id => {
            const body = document.getElementById(`cvb-body-${id}`);
            const chev = document.getElementById(`cvb-chev-${id}`);
            if (body) body.style.display = 'none';
            if (chev) chev.style.transform = 'rotate(-90deg)';
        });

        // Also handle old modal's open-cv-builder-btn if it exists on the page
        const oldBtn = document.getElementById('open-cv-builder-btn');
        if (oldBtn) {
            oldBtn.addEventListener('click', () => {
                // Import from roaster and navigate to CV Builder view
                importFromRoaster();
                if (typeof app !== 'undefined') app.switchView('cv-builder');
            });
        }
    }

    // ─── TEMPLATE BUTTONS ────────────────────────────────────────────────────
    function _bindTemplateButtons() {
        document.querySelectorAll('.cvb-tpl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cvb-tpl-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.template = btn.getAttribute('data-tpl');
                const labelMap = { 
                    professional: 'Professionale', 
                    modern: 'Moderno', 
                    creative: 'Creativo Bold', 
                    minimal: 'Minimal ATS',
                    executive: 'Executive Slate',
                    tech_minimal: 'Tech Minimalist',
                    academic: 'Accademico',
                    elegant_gold: 'Elegant Gold'
                };
                const lbl = document.getElementById('cvb-preview-label');
                if (lbl) lbl.textContent = `Template: ${labelMap[state.template] || state.template}`;
                refreshPreview();
            });
        });
    }

    // ─── LANG SELECT ─────────────────────────────────────────────────────────
    function _bindLangSelect() {
        const sel = document.getElementById('cvb-lang-select');
        if (sel) {
            sel.addEventListener('change', () => {
                state.lang = sel.value;
                refreshPreview();
            });
        }
    }

    // ─── IMPORT FROM ROASTER ─────────────────────────────────────────────────
    function _bindImportBtn() {
        const btn = document.getElementById('cvb-import-btn');
        if (btn) btn.addEventListener('click', importFromRoaster);
    }

    async function importFromRoaster() {
        // Try to get text from roast textarea or app settings
        let cvText = '';
        const roastTA = document.getElementById('roast-cv-text');
        if (roastTA && roastTA.value.trim()) {
            cvText = roastTA.value.trim();
        } else if (typeof app !== 'undefined' && app.state && app.state.settings && app.state.settings.cvText) {
            cvText = app.state.settings.cvText;
        }

        if (!cvText) {
            _showToast('Nessun CV trovato. Carica prima il CV nella sezione CV Roaster AI.', 'warning');
            return;
        }

        // Check if there is an active API provider configuration
        let parsed = null;
        const importBtn = document.getElementById('cvb-import-btn');
        const originalHtml = importBtn ? importBtn.innerHTML : '';
        
        if (typeof app !== 'undefined' && app.state && app.state.settings) {
            const provider = app.state.settings.llmProvider || 'gemini';
            const apiKey = provider === 'gemini' ? app.state.settings.geminiApiKey : app.state.settings.openRouterApiKey;
            const openRouterModel = app.state.settings.openRouterModelCustom || app.state.settings.openRouterModel;
            const ollamaUrl = app.state.settings.ollamaUrl;
            const ollamaModel = app.state.settings.ollamaModel;

            const hasKey = (provider === 'gemini' && apiKey && apiKey.trim() !== '') || 
                           (provider === 'openrouter' && apiKey && apiKey.trim() !== '') ||
                           (provider === 'ollama');

            if (hasKey) {
                if (importBtn) {
                    importBtn.disabled = true;
                    importBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px;display:inline-block;animation:spin 1s linear infinite;">sync</span> AI Parsing...`;
                }
                _showToast('Analisi del CV con Intelligenza Artificiale in corso per una copia perfetta...', 'info');

                try {
                    const modelParam = provider === 'ollama' ? ollamaModel : (provider === 'openrouter' ? openRouterModel : '');
                    const endpointParam = provider === 'ollama' ? ollamaUrl : apiKey;
                    parsed = await api.parseCvWithAi(provider, endpointParam, cvText, modelParam);
                } catch (err) {
                    console.error("AI parsing failed, falling back to local regex:", err);
                    _showToast('Errore nel parsing AI, uso del parser locale di fallback.', 'warning');
                } finally {
                    if (importBtn) {
                        importBtn.disabled = false;
                        importBtn.innerHTML = originalHtml;
                    }
                }
            }
        }

        // Fallback to local regex-based parser if AI was not run or failed
        if (!parsed) {
            parsed = cvBuilder.buildEditorFields(cvText);
        }

        // Try to inject AI-optimized summary if available
        const optimizedSummary = document.getElementById('roast-optimized-summary')?.textContent?.trim();
        if (optimizedSummary && optimizedSummary.length > 20 && !optimizedSummary.includes('Caricamento')) {
            parsed.summary = optimizedSummary;
        }

        // Try to get optimized bullets from roaster
        const bulletEls = document.querySelectorAll('#roast-optimized-bullets li');
        if (bulletEls.length > 0) {
            const bullets = Array.from(bulletEls).map(li => li.textContent.trim()).filter(t => t.length > 5);
            if (bullets.length > 0 && parsed.experiences && parsed.experiences.length > 0) {
                parsed.experiences[0].bullets = bullets;
            } else if (bullets.length > 0) {
                if (!parsed.experiences) parsed.experiences = [];
                parsed.experiences.push({ role: parsed.role || '', company: '', dates: '', bullets });
            }
        }

        populateFromData(parsed);
        refreshPreview();
        _showToast('CV importato con successo! Modifica i campi e la preview si aggiornerà in tempo reale.', 'success');
    }

    // ─── POPULATE FORM FROM DATA OBJECT ─────────────────────────────────────
    function populateFromData(data) {
        state.fields = { ...state.fields, ...data };

        // Update photo preview DOM based on state
        const img = document.getElementById('cvb-photo-preview');
        const placeholder = document.getElementById('cvb-photo-placeholder');
        const removeBtn = document.getElementById('cvb-photo-remove-btn');
        if (state.fields.photo) {
            if (img) {
                img.src = state.fields.photo;
                img.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'inline-block';
        } else {
            if (img) {
                img.src = '';
                img.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'block';
            if (removeBtn) removeBtn.style.display = 'none';
        }

        // Personal info
        _setVal('cvb-name', data.name);
        _setVal('cvb-role', data.role);
        _setVal('cvb-email', data.email);
        _setVal('cvb-phone', data.phone);
        _setVal('cvb-location', data.location);
        _setVal('cvb-linkedin', data.linkedin);
        _setVal('cvb-github', data.github || data.website || '');
        _setVal('cvb-summary', data.summary);

        // Skills
        state.fields.skills = data.skills ? [...data.skills] : [];
        _renderSkillTags();

        // Experiences
        state.fields.experiences = data.experiences ? [...data.experiences] : [];
        _renderExperiencesList();

        // Education
        state.fields.education = data.education ? [...data.education] : [];
        _renderEducationList();

        // Languages
        state.fields.languages = data.languages
            ? data.languages.map(l => typeof l === 'string' ? { name: l, level: '' } : l)
            : [];
        _renderLanguagesList();

        refreshPreview();
    }

    // ─── COLLECT FIELDS FROM FORM ────────────────────────────────────────────
    function collectFields() {
        state.fields.name = _getVal('cvb-name');
        state.fields.role = _getVal('cvb-role');
        state.fields.email = _getVal('cvb-email');
        state.fields.phone = _getVal('cvb-phone');
        state.fields.location = _getVal('cvb-location');
        state.fields.linkedin = _getVal('cvb-linkedin');
        state.fields.github = _getVal('cvb-github');
        state.fields.summary = _getVal('cvb-summary');

        // Skills
        const skillTags = document.querySelectorAll('#cvb-skills-tags span');
        state.fields.skills = Array.from(skillTags).map(tag => {
            return tag.childNodes[0]?.textContent?.trim() || '';
        }).filter(Boolean);

        // Experiences
        const expItems = document.querySelectorAll('.cvb-exp-item');
        state.fields.experiences = Array.from(expItems).map(el => {
            const role = el.querySelector('.cvb-exp-role')?.value || '';
            const company = el.querySelector('.cvb-exp-company')?.value || '';
            const dates = el.querySelector('.cvb-exp-dates')?.value || '';
            const bulletsRaw = el.querySelector('.cvb-exp-bullets')?.value || '';
            const bullets = bulletsRaw.split('\n').map(b => b.replace(/^[-•*]\s*/, '').trim()).filter(b => b.length > 3);
            return { role, company, dates, bullets };
        });

        // Education
        const eduItems = document.querySelectorAll('.cvb-edu-item');
        state.fields.education = Array.from(eduItems).map(el => {
            return {
                degree: el.querySelector('.cvb-edu-degree')?.value || '',
                institution: el.querySelector('.cvb-edu-inst')?.value || '',
                year: el.querySelector('.cvb-edu-year')?.value || ''
            };
        });

        // Languages
        const langItems = document.querySelectorAll('.cvb-lang-item');
        state.fields.languages = Array.from(langItems).map(el => {
            return {
                name: el.querySelector('.cvb-lang-name')?.value || '',
                level: el.querySelector('.cvb-lang-level')?.value || ''
            };
        }).filter(l => l.name.trim() !== '');
    }

    // ─── REFRESH PREVIEW ─────────────────────────────────────────────────────
    function refreshPreview() {
        collectFields();
        const html = cvBuilder.buildFromFields(state.fields, state.template, state.lang);
        const area = document.getElementById('cvb-preview-area');
        if (area) area.innerHTML = html;
    }

    // ─── EXPERIENCE RENDERING ────────────────────────────────────────────────
    function _renderExperiencesList() {
        const container = document.getElementById('cvb-experiences-list');
        if (!container) return;
        container.innerHTML = '';
        state.fields.experiences.forEach((exp, i) => {
            container.appendChild(_createExpEl(exp, i));
        });
    }

    function _createExpEl(exp, i) {
        const div = document.createElement('div');
        div.className = 'cvb-exp-item';
        div.style.cssText = 'background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;position:relative;';
        div.innerHTML = `
            <button type="button" onclick="cvbRemoveExp(this)" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;padding:2px;color:var(--color-danger);display:flex;">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
            </button>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Ruolo</label>
                    <input type="text" class="form-control cvb-exp-role" value="${_esc(exp.role)}" placeholder="es. Frontend Developer" oninput="cvbUpdate()" style="font-size:12.5px;">
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Azienda</label>
                    <input type="text" class="form-control cvb-exp-company" value="${_esc(exp.company)}" placeholder="es. Acme Srl" oninput="cvbUpdate()" style="font-size:12.5px;">
                </div>
            </div>
            <div class="form-group" style="margin:0 0 8px;">
                <label style="font-size:11px;">Periodo (es. 2022 - 2024)</label>
                <input type="text" class="form-control cvb-exp-dates" value="${_esc(exp.dates)}" placeholder="2021 - 2023" oninput="cvbUpdate()" style="font-size:12.5px;">
            </div>
            <div class="form-group" style="margin:0;">
                <label style="font-size:11px;">Attività & Risultati (una per riga, usa - per i punti elenco)</label>
                <textarea class="form-control cvb-exp-bullets" rows="4" placeholder="- Ho guidato lo sviluppo di una feature X incrementando le conversioni del 20%&#10;- Ho ridotto il tempo di caricamento del 35%..." oninput="cvbUpdate()" style="font-size:12px;resize:vertical;">${_esc((exp.bullets || []).map(b => `- ${b}`).join('\n'))}</textarea>
            </div>`;
        return div;
    }

    // ─── EDUCATION RENDERING ─────────────────────────────────────────────────
    function _renderEducationList() {
        const container = document.getElementById('cvb-education-list');
        if (!container) return;
        container.innerHTML = '';
        state.fields.education.forEach((edu, i) => {
            container.appendChild(_createEduEl(edu, i));
        });
    }

    function _createEduEl(edu, i) {
        const div = document.createElement('div');
        div.className = 'cvb-edu-item';
        div.style.cssText = 'background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;position:relative;';
        div.innerHTML = `
            <button type="button" onclick="cvbRemoveEdu(this)" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;padding:2px;color:var(--color-danger);display:flex;">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
            </button>
            <div class="form-group" style="margin:0 0 8px;">
                <label style="font-size:11px;">Titolo di Studio</label>
                <input type="text" class="form-control cvb-edu-degree" value="${_esc(edu.degree)}" placeholder="es. Laurea Magistrale in Informatica" oninput="cvbUpdate()" style="font-size:12.5px;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 80px;gap:8px;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Istituto</label>
                    <input type="text" class="form-control cvb-edu-inst" value="${_esc(edu.institution)}" placeholder="es. Politecnico di Milano" oninput="cvbUpdate()" style="font-size:12.5px;">
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Anno</label>
                    <input type="text" class="form-control cvb-edu-year" value="${_esc(edu.year)}" placeholder="2020" oninput="cvbUpdate()" style="font-size:12.5px;">
                </div>
            </div>`;
        return div;
    }

    // ─── LANGUAGE RENDERING ─────────────────────────────────────────────────
    function _renderLanguagesList() {
        const container = document.getElementById('cvb-languages-list');
        if (!container) return;
        container.innerHTML = '';
        state.fields.languages.forEach((lang, i) => {
            container.appendChild(_createLangEl(lang, i));
        });
    }

    function _createLangEl(lang, i) {
        const div = document.createElement('div');
        div.className = 'cvb-lang-item';
        div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;';
        div.innerHTML = `
            <div class="form-group" style="margin:0;">
                <label style="font-size:11px;">Lingua</label>
                <input type="text" class="form-control cvb-lang-name" value="${_esc(lang.name)}" placeholder="es. Inglese" oninput="cvbUpdate()" style="font-size:12.5px;">
            </div>
            <div class="form-group" style="margin:0;">
                <label style="font-size:11px;">Livello</label>
                <select class="form-control cvb-lang-level" onchange="cvbUpdate()" style="font-size:12px;padding:6px 10px;">
                    <option value="" ${!lang.level?'selected':''}>Seleziona...</option>
                    <option value="Madrelingua" ${lang.level==='Madrelingua'?'selected':''}>Madrelingua</option>
                    <option value="C2 – Fluente" ${lang.level==='C2 – Fluente'?'selected':''}>C2 – Fluente</option>
                    <option value="C1 – Avanzato" ${lang.level==='C1 – Avanzato'?'selected':''}>C1 – Avanzato</option>
                    <option value="B2 – Intermedio alto" ${lang.level==='B2 – Intermedio alto'?'selected':''}>B2 – Intermedio alto</option>
                    <option value="B1 – Intermedio" ${lang.level==='B1 – Intermedio'?'selected':''}>B1 – Intermedio</option>
                    <option value="A2 – Elementare" ${lang.level==='A2 – Elementare'?'selected':''}>A2 – Elementare</option>
                    <option value="A1 – Base" ${lang.level==='A1 – Base'?'selected':''}>A1 – Base</option>
                </select>
            </div>
            <button type="button" onclick="cvbRemoveLang(this)" style="background:none;border:none;cursor:pointer;padding:6px;color:var(--color-danger);display:flex;margin-bottom:2px;">
                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
            </button>`;
        return div;
    }

    // ─── SKILL TAGS ──────────────────────────────────────────────────────────
    function _renderSkillTags() {
        const container = document.getElementById('cvb-skills-tags');
        if (!container) return;
        container.innerHTML = '';
        state.fields.skills.forEach((skill) => {
            const tag = document.createElement('span');
            tag.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:rgba(99,102,241,0.12);color:var(--color-primary);border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:3px 10px;font-size:12px;font-weight:500;cursor:default;';
            tag.innerHTML = `${_esc(skill)}<button type="button" onclick="cvbRemoveSkill(this)" style="background:none;border:none;cursor:pointer;padding:0;margin:0;display:flex;color:inherit;opacity:.6;"><span class="material-symbols-outlined" style="font-size:14px;">close</span></button>`;
            container.appendChild(tag);
        });
    }

    function _renderSkillSuggestions() {
        const container = document.getElementById('cvb-skill-suggestions');
        if (!container) return;
        const suggestions = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Figma', 'SEO', 'Google Ads', 'Agile', 'Leadership', 'Excel', 'Tableau', 'HubSpot', 'Git', 'REST API', 'PostgreSQL', 'MongoDB', 'CI/CD', 'Next.js', 'Vue.js'];
        container.innerHTML = '';
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:12px;padding:2px 10px;font-size:11.5px;color:var(--text-muted);cursor:pointer;transition:all .15s;';
            btn.textContent = `+ ${s}`;
            btn.onmouseover = () => { btn.style.borderColor = 'var(--color-primary)'; btn.style.color = 'var(--color-primary)'; };
            btn.onmouseout = () => { btn.style.borderColor = 'var(--border-color)'; btn.style.color = 'var(--text-muted)'; };
            btn.onclick = () => {
                if (!state.fields.skills.includes(s)) {
                    state.fields.skills.push(s);
                    _renderSkillTags();
                    refreshPreview();
                }
            };
            container.appendChild(btn);
        });
    }

    // ─── ADD BUTTONS ─────────────────────────────────────────────────────────
    function _bindAddButtons() {
        document.getElementById('cvb-add-exp-btn')?.addEventListener('click', () => {
            state.fields.experiences.push({ role: '', company: '', dates: '', bullets: [] });
            _renderExperiencesList();
        });
        document.getElementById('cvb-add-edu-btn')?.addEventListener('click', () => {
            state.fields.education.push({ degree: '', institution: '', year: '' });
            _renderEducationList();
        });
        document.getElementById('cvb-add-lang-btn')?.addEventListener('click', () => {
            state.fields.languages.push({ name: '', level: '' });
            _renderLanguagesList();
        });
    }

    // ─── PRINT / PDF ────────────────────────────────────────────────────────
    function _bindPrintBtn() {
        document.getElementById('cvb-print-btn')?.addEventListener('click', () => {
            refreshPreview();
            let printRoot = document.getElementById('cv-print-root');
            if (!printRoot) {
                printRoot = document.createElement('div');
                printRoot.id = 'cv-print-root';
                printRoot.style.display = 'none';
                document.body.appendChild(printRoot);
            }
            const preview = document.getElementById('cvb-preview-area');
            printRoot.innerHTML = preview ? preview.innerHTML : '';
            printRoot.style.display = 'block';
            window.print();
            setTimeout(() => { printRoot.style.display = 'none'; }, 1000);
        });
    }

    // ─── COPY TEXT ───────────────────────────────────────────────────────────
    function _bindCopyBtn() {
        document.getElementById('cvb-copy-text-btn')?.addEventListener('click', () => {
            const preview = document.getElementById('cvb-preview-area');
            if (!preview) return;
            const text = preview.innerText || preview.textContent;
            navigator.clipboard.writeText(text).then(() => {
                _showToast('Testo del CV copiato negli appunti!', 'success');
            });
        });
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────
    function _setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    }
    function _getVal(id) {
        return document.getElementById(id)?.value?.trim() || '';
    }
    function _esc(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function _showToast(msg, type = 'success') {
        const t = document.createElement('div');
        const bg = type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6366f1';
        t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);transform:translateY(100px);transition:transform 0.3s ease;max-width:360px;line-height:1.4;`;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; });
        setTimeout(() => { t.style.transform = 'translateY(100px)'; setTimeout(() => t.remove(), 300); }, 3500);
    }

    return { 
        init, 
        importFromRoaster, 
        refreshPreview, 
        populateFromData, 
        _showToast,
        setPhoto(val) { state.fields.photo = val; }
    };
})();

// ─── GLOBAL FUNCTIONS (called by inline HTML event handlers) ────────────────
function cvbUpdate() { cvBuilderUI.refreshPreview(); }
function cvbToggleSection(id) {
    const body = document.getElementById(`cvb-body-${id}`);
    const chev = document.getElementById(`cvb-chev-${id}`);
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : '';
    if (chev) chev.style.transform = isOpen ? 'rotate(-90deg)' : '';
}
function cvbRemoveExp(btn) {
    btn.closest('.cvb-exp-item')?.remove();
    cvBuilderUI.refreshPreview();
}
function cvbRemoveEdu(btn) {
    btn.closest('.cvb-edu-item')?.remove();
    cvBuilderUI.refreshPreview();
}
function cvbRemoveLang(btn) {
    btn.closest('.cvb-lang-item')?.remove();
    cvBuilderUI.refreshPreview();
}
function cvbRemoveSkill(btn) {
    btn.closest('span')?.remove();
    cvBuilderUI.refreshPreview();
}
function cvbAddSkillOnEnter(e) {
    if (e.key === 'Enter') { e.preventDefault(); cvbAddSkillFromInput(); }
}
function cvbAddSkillFromInput() {
    const input = document.getElementById('cvb-skill-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    const container = document.getElementById('cvb-skills-tags');
    if (!container) return;
    // Check for duplicates
    const existing = Array.from(container.querySelectorAll('span')).map(s => s.childNodes[0]?.textContent?.trim());
    if (existing.includes(val)) { input.value = ''; return; }
    // Add tag
    const tag = document.createElement('span');
    tag.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:rgba(99,102,241,0.12);color:var(--color-primary);border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:3px 10px;font-size:12px;font-weight:500;cursor:default;';
    tag.innerHTML = `${val}<button type="button" onclick="cvbRemoveSkill(this)" style="background:none;border:none;cursor:pointer;padding:0;margin:0;display:flex;color:inherit;opacity:.6;"><span class="material-symbols-outlined" style="font-size:14px;">close</span></button>`;
    container.appendChild(tag);
    input.value = '';
    cvBuilderUI.refreshPreview();
}

// ─── PHOTO HANDLERS ─────────────────────────────────────────────────────────
function cvbHandlePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (max 2MB to keep local storage clean and avoid memory errors)
    if (file.size > 2 * 1024 * 1024) {
        alert("La foto è troppo grande! Seleziona un'immagine inferiore a 2MB.");
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        
        // Save to state
        cvBuilderUI.setPhoto(base64);

        // Update UI preview
        const img = document.getElementById('cvb-photo-preview');
        const placeholder = document.getElementById('cvb-photo-placeholder');
        const removeBtn = document.getElementById('cvb-photo-remove-btn');
        if (img) {
            img.src = base64;
            img.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-block';
        
        cvBuilderUI.refreshPreview();
    };
    reader.readAsDataURL(file);
}

function cvbRemovePhoto() {
    cvBuilderUI.setPhoto('');
    const img = document.getElementById('cvb-photo-preview');
    const placeholder = document.getElementById('cvb-photo-placeholder');
    const removeBtn = document.getElementById('cvb-photo-remove-btn');
    const input = document.getElementById('cvb-photo-input');
    if (img) {
        img.src = '';
        img.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
    if (input) input.value = '';

    cvBuilderUI.refreshPreview();
}

// ─── AUTO-INIT ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cvBuilderUI.init();
});
