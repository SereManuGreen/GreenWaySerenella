/**
 * Serenella - Green Business Lead Funnel Admin Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('leads-table-body');
    const emptyState = document.getElementById('table-empty-state');
    const statTotal = document.getElementById('stat-total-leads');
    const statHot = document.getElementById('stat-hot-leads');
    const statWarm = document.getElementById('stat-warm-leads');
    const statCold = document.getElementById('stat-cold-leads');
    const searchInput = document.getElementById('search-input');
    const filterTemp = document.getElementById('filter-temp');
    const filterInterest = document.getElementById('filter-interest');
    const filterCall = document.getElementById('filter-call');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const webhookUrlInput = document.getElementById('webhook-url-input');
    const btnSaveWebhook = document.getElementById('btn-save-webhook');
    const btnTestWebhook = document.getElementById('btn-test-webhook');
    const panelOverlay = document.getElementById('lead-panel-overlay');
    const panelDetails = document.getElementById('panel-lead-details');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnDeleteLeadPanel = document.getElementById('btn-delete-lead-panel');
    const toast = document.getElementById('alert-toast');
    const toastMessage = document.getElementById('alert-toast-message');
    const tabLeads = document.getElementById('tab-btn-leads');
    const tabEditor = document.getElementById('tab-btn-editor');
    const contentLeads = document.getElementById('tab-content-leads');
    const contentEditor = document.getElementById('tab-content-editor');
    const loginOverlay = document.getElementById('admin-login-overlay');
    const loginForm = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password-input');
    const filterCrmStatus = document.getElementById('filter-crm-status');
    const editProfileImg = document.getElementById('edit-profile-img');
    const editHeroTitle = document.getElementById('edit-hero-title');
    const editHeroDesc = document.getElementById('edit-hero-desc');
    const editCalendarUrl = document.getElementById('edit-calendar-url');
    const editWhatsappNum = document.getElementById('edit-whatsapp-num');
    const editCatalogUrl = document.getElementById('edit-catalog-url');
    const editWebinarUrl = document.getElementById('edit-webinar-url');
    const editGuideName = document.getElementById('edit-guide-name');
    const editFaq1Q = document.getElementById('edit-faq-1-q');
    const editFaq1A = document.getElementById('edit-faq-1-a');
    const editFaq2Q = document.getElementById('edit-faq-2-q');
    const editFaq2A = document.getElementById('edit-faq-2-a');
    const editFaq3Q = document.getElementById('edit-faq-3-q');
    const editFaq3A = document.getElementById('edit-faq-3-a');
    const editFaq4Q = document.getElementById('edit-faq-4-q');
    const editFaq4A = document.getElementById('edit-faq-4-a');
    const btnSaveContent = document.getElementById('btn-save-content');
    const btnGenerateHtml = document.getElementById('btn-generate-html');

    // Dynamic Product Editor DOM bindings
    const productModal = document.getElementById('product-modal-overlay');
    const btnAddProduct = document.getElementById('btn-add-product');
    const btnCloseProductModal = document.getElementById('btn-close-product-modal');
    const btnCancelProduct = document.getElementById('btn-cancel-product');
    const btnSaveProduct = document.getElementById('btn-save-product');
    const productEditForm = document.getElementById('product-edit-form');
    const productEditIndex = document.getElementById('product-edit-index');
    
    const prodEditCategory = document.getElementById('prod-edit-category');
    const prodEditTitle = document.getElementById('prod-edit-title');
    const prodEditTag = document.getElementById('prod-edit-tag');
    const prodEditDesc = document.getElementById('prod-edit-desc');
    const prodEditImg = document.getElementById('prod-edit-img');
    const prodEditFeat1 = document.getElementById('prod-edit-feat1');
    const prodEditFeat2 = document.getElementById('prod-edit-feat2');
    const prodEditUrl = document.getElementById('prod-edit-url');

    // ==========================================
    // LOGIN SECURITY
    // ==========================================
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('serenella_admin_logged_in') === 'true';
        if (isLoggedIn) {
            loginOverlay.classList.add('hidden');
        } else {
            loginOverlay.classList.remove('hidden');
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = passwordInput.value.trim();
        if (pwd === 'serenella2026' || pwd === 'serenella' || pwd === 'admin') {
            sessionStorage.setItem('serenella_admin_logged_in', 'true');
            loginOverlay.classList.add('hidden');
            showToast("Accesso effettuato con successo!", "success");
        } else {
            showToast("Password errata. Riprova.", "danger");
            passwordInput.value = '';
        }
    });

    checkLoginStatus();

    // ==========================================
    // STATE & MOCK SEEDING
    // ==========================================
    let leads = [];
    let selectedLeadId = null;

    const seedMockLeads = [
        { id: 'lead_mock_1', nome: 'Chiara Neri', email: 'chiara.neri@gmail.com', telefono: '347 1234567', whatsapp: 'Sì', eta: '30-45 anni', lavoro: 'Dipendente', interesse: 'voglio parlare direttamente con Serenella', ore_settimana: '10-20 ore', disponibilita_call: 'Sì, voglio prenotarla subito', provenienza: 'Hero Call CTA', data_registrazione: new Date(Date.now() - 1000 * 60 * 30).toISOString(), score: 100, stato: 'Caldo', crm_stato: 'Call Fissata', data_ricontatto: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], note: 'Molto motivata. Attualmente lavora come dipendente ma desidera avviare un\'attività autonoma per maggiore libertà oraria ed economica. Ha fissato la chiamata conoscitiva.' },
        { id: 'lead_mock_2', nome: 'Marco Rossi', email: 'marco.rossi@yahoo.it', telefono: '333 9876543', whatsapp: 'Sì', eta: '30-45 anni', lavoro: 'Autonomo', interesse: 'cerco una seconda entrata', ore_settimana: '5-10 ore', disponibilita_call: 'Sì, ma preferisco essere contattato prima su WhatsApp', provenienza: 'Hero Guide CTA', data_registrazione: new Date(Date.now() - 1000 * 60 * 180).toISOString(), score: 80, stato: 'Caldo', crm_stato: 'Contattato', data_ricontatto: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], note: 'Contattato inizialmente su WhatsApp per inviargli la guida. Riscontro positivo, sta leggendo la risorsa. Ci sentiamo domani sera.' },
        { id: 'lead_mock_3', nome: 'Giuseppe Verde', email: 'g.verde@libero.it', telefono: '338 1122334', whatsapp: 'Sì', eta: '46-60 anni', lavoro: 'Dipendente', interesse: 'cerco una nuova attivita', ore_settimana: '5-10 ore', disponibilita_call: 'Sì, ma preferisco essere contattato prima su WhatsApp', provenienza: 'Benefits CTA', data_registrazione: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), score: 65, stato: 'Medio', crm_stato: 'Nuovo', data_ricontatto: '', note: '' },
        { id: 'lead_mock_4', nome: 'Elena Bianchi', email: 'elena.b@outlook.com', telefono: '329 4455667', whatsapp: 'No', eta: 'Under 30', lavoro: 'Studente', interesse: 'voglio partecipare al webinar', ore_settimana: 'Meno di 5 ore', disponibilita_call: 'No, al momento voglio solo la risorsa gratuita', provenienza: 'Hero Webinar CTA', data_registrazione: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), score: 35, stato: 'Freddo', crm_stato: 'Non Interessato', data_ricontatto: '', note: 'Ha espresso chiaramente di non volere essere contattata. Desidera solo visualizzare il webinar introduttivo. Profilo freddo.' }
    ];

    function loadLeads() {
        const localLeads = localStorage.getItem('serenella_leads');
        if (localLeads) {
            leads = JSON.parse(localLeads);
        } else {
            leads = seedMockLeads;
            localStorage.setItem('serenella_leads', JSON.stringify(leads));
        }
        leads.sort((a, b) => new Date(b.data_registrazione) - new Date(a.data_registrazione));
    }

    // ==========================================
    // RENDERING
    // ==========================================
    function renderDashboard() {
        loadLeads();
        updateStats();
        renderTable();
        loadWebhookSettings();
    }

    function updateStats() {
        statTotal.textContent = leads.length;
        statHot.textContent = leads.filter(l => l.stato === 'Caldo').length;
        statWarm.textContent = leads.filter(l => l.stato === 'Medio').length;
        statCold.textContent = leads.filter(l => l.stato === 'Freddo').length;
    }

    function getStatoLabel(stato) {
        if (stato === 'Caldo') return `<span class="temp-badge temp-hot">🔥 Caldo</span>`;
        if (stato === 'Medio') return `<span class="temp-badge temp-warm">⚡ Medio</span>`;
        return `<span class="temp-badge temp-cold">❄️ Freddo</span>`;
    }

    function getCrmStatoLabel(crmStato) {
        const status = crmStato || 'Nuovo';
        if (status === 'Nuovo') return `<span class="crm-badge crm-badge-new">🔵 Nuovo</span>`;
        if (status === 'Contattato') return `<span class="crm-badge crm-badge-contacted">🟡 Contattato</span>`;
        if (status === 'Call Fissata') return `<span class="crm-badge crm-badge-call">🟢 Call Fissata</span>`;
        if (status === 'Partner Greenway') return `<span class="crm-badge crm-badge-partner">🏆 Partner Greenway</span>`;
        return `<span class="crm-badge crm-badge-lost">🔴 Non Interessato</span>`;
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function renderTable() {
        const query = searchInput.value.toLowerCase().trim();
        const tempVal = filterTemp.value;
        const crmStatusVal = filterCrmStatus.value;
        const interestVal = filterInterest.value;
        const callVal = filterCall.value;
        
        const filteredLeads = leads.filter(lead => {
            const matchQuery = !query || lead.nome.toLowerCase().includes(query) || lead.email.toLowerCase().includes(query) || lead.telefono.includes(query);
            const matchTemp = tempVal === 'all' || lead.stato === tempVal;
            const matchCrmStatus = crmStatusVal === 'all' || (lead.crm_stato || 'Nuovo') === crmStatusVal;
            const matchInterest = interestVal === 'all' || lead.interesse === interestVal;
            const matchCall = callVal === 'all' || lead.disponibilita_call === callVal;
            return matchQuery && matchTemp && matchCrmStatus && matchInterest && matchCall;
        });

        tableBody.innerHTML = '';
        
        if (filteredLeads.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        filteredLeads.forEach(lead => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', lead.id);
            const waBadge = lead.whatsapp === 'Sì' ? `<span style="color:var(--color-success); font-weight:bold;">WA</span>` : `<span style="color:var(--color-text-muted);">No</span>`;
            let readableInterest = lead.interesse;
            if (lead.interesse === 'voglio parlare direttamente con Serenella') readableInterest = '📞 Parla con Serenella';
            if (lead.interesse === 'cerco una seconda entrata') readableInterest = '💰 Seconda entrata';
            if (lead.interesse === 'cerco una nuova attivita') readableInterest = '🚀 Nuova attività';
            if (lead.interesse === 'voglio partecipare al webinar') readableInterest = '🎬 Webinar';
            if (lead.interesse === 'voglio capire meglio i prodotti') readableInterest = '🌿 Prodotti';
            let readableCall = lead.disponibilita_call;
            if (lead.disponibilita_call.includes("subito")) readableCall = '🟢 Sì, Subito';
            if (lead.disponibilita_call.includes("WhatsApp")) readableCall = '💬 Prima WhatsApp';
            if (lead.disponibilita_call.includes("gratuita")) readableCall = '🔴 No Call';

            tr.innerHTML = `
                <td class="lead-score-cell text-center" style="color: ${lead.score >= 70 ? 'var(--color-danger)' : lead.score >= 40 ? 'var(--color-accent-dark)' : 'var(--color-text-muted)'}">${lead.score}</td>
                <td>${getStatoLabel(lead.stato)}</td>
                <td>${getCrmStatoLabel(lead.crm_stato)}</td>
                <td style="font-weight:600;">${lead.nome}</td>
                <td><div style="font-size:0.8rem;">${lead.email}</div><div style="font-size:0.8rem; font-weight:500;">${lead.telefono} (${waBadge})</div></td>
                <td style="font-size:0.85rem;"><div>${lead.eta}</div><div style="color:var(--color-text-muted);">${lead.lavoro}</div></td>
                <td style="font-weight:500; font-size:0.85rem;">${readableInterest}</td>
                <td style="font-size:0.85rem;">${readableCall}</td>
                <td style="font-size:0.8rem; color:var(--color-text-muted);">${formatDate(lead.data_registrazione)}</td>
                <td>
                    <div class="lead-actions">
                        <button class="btn-icon btn-view-lead" title="Visualizza Dettagli" data-id="${lead.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="btn-icon btn-icon-danger btn-delete-lead" title="Elimina Lead" data-id="${lead.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        attachTableEventHandlers();
    }

    function attachTableEventHandlers() {
        tableBody.querySelectorAll('.btn-view-lead').forEach(btn => {
            btn.addEventListener('click', () => openSidePanel(btn.getAttribute('data-id')));
        });
        tableBody.querySelectorAll('.btn-delete-lead').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); deleteLead(btn.getAttribute('data-id')); });
        });
    }

    // ==========================================
    // SIDE PANEL
    // ==========================================
    function openSidePanel(id) {
        selectedLeadId = id;
        const lead = leads.find(l => l.id === id);
        if (!lead) return;
        
        panelOverlay.classList.add('active');
        
        panelDetails.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; background-color:var(--color-bg-base); padding:20px; border-radius:var(--radius-md); border: 1px solid var(--color-border); margin-bottom:25px;">
                <div><span style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;">Stato Profilo</span><div style="margin-top:4px;">${getStatoLabel(lead.stato)}</div></div>
                <div style="text-align:right;"><span style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;">Lead Score</span><div class="info-item-value score" id="panel-display-score">${lead.score}/100</div></div>
            </div>
            <div class="panel-section" style="background-color: rgba(10, 79, 50, 0.03); border: 1px solid var(--color-border); padding: 20px; border-radius: var(--radius-md); margin-bottom: 25px;">
                <div class="panel-section-title" style="color: var(--color-primary); font-weight: 700; margin-bottom: 12px;">Gestione CRM & Follow-up</div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label for="crm-status-select" style="font-size:0.8rem; font-weight:600; color:var(--color-text-muted); display:block; margin-bottom:5px;">Stato Contatto:</label>
                    <select id="crm-status-select" class="form-control" style="font-size:0.85rem; padding:8px; width:100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background-color: #fff;">
                        <option value="Nuovo" ${lead.crm_stato === 'Nuovo' || !lead.crm_stato ? 'selected' : ''}>🔵 Nuovo</option>
                        <option value="Contattato" ${lead.crm_stato === 'Contattato' ? 'selected' : ''}>🟡 Contattato</option>
                        <option value="Call Fissata" ${lead.crm_stato === 'Call Fissata' ? 'selected' : ''}>🟢 Call Fissata</option>
                        <option value="Partner Greenway" ${lead.crm_stato === 'Partner Greenway' ? 'selected' : ''}>🏆 Partner Greenway</option>
                        <option value="Non Interessato" ${lead.crm_stato === 'Non Interessato' ? 'selected' : ''}>🔴 Non Interessato</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label for="crm-followup-date" style="font-size:0.8rem; font-weight:600; color:var(--color-text-muted); display:block; margin-bottom:5px;">Data Ricontatto / Follow-up:</label>
                    <input type="date" id="crm-followup-date" class="form-control" value="${lead.data_ricontatto || ''}" style="font-size:0.85rem; padding:8px; width:100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background-color: #fff;">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label for="crm-notes" style="font-size:0.8rem; font-weight:600; color:var(--color-text-muted); display:block; margin-bottom:5px;">Note & Storico Contatto:</label>
                    <textarea id="crm-notes" class="form-control" rows="4" style="font-size:0.85rem; padding:8px; width:100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background-color: #fff; line-height:1.4;" placeholder="Inserisci note sulla chiamata, obiezioni, accordi...">${lead.note || ''}</textarea>
                </div>
                <button id="btn-save-crm-details" class="btn btn-primary" style="padding:10px 16px; font-size:0.85rem; width:100%; border-radius: var(--radius-sm);">💾 Aggiorna Informazioni CRM</button>
                <button id="btn-gcal-schedule" class="btn btn-secondary" style="padding:10px 16px; font-size:0.85rem; width:100%; border-color:#4285f4; color:#4285f4; background-color:rgba(66, 133, 244, 0.05); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; margin-top: 10px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Pianifica su Google Calendar
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Modifica Punteggio (Override)</div>
                <div style="margin-bottom: 10px;">
                    <label for="score-override-slider" style="font-size:0.85rem; font-weight:500; color:var(--color-text-muted); display:block; margin-bottom:8px;">Modifica il punteggio di qualificazione:</label>
                    <input type="range" id="score-override-slider" min="0" max="100" value="${lead.score}" style="width:100%; accent-color:var(--color-primary); cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; font-weight:600; margin-top:5px;">
                        <span>0 (Freddo)</span>
                        <span id="slider-current-val" style="color:var(--color-primary); font-size:0.9rem;">${lead.score}</span>
                        <span>100 (Caldo)</span>
                    </div>
                </div>
                <button id="btn-save-score-override" class="btn btn-primary" style="padding:8px 16px; font-size:0.8rem; width:100%;">Salva Nuovo Punteggio</button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Informazioni Personali</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-item-label">Nome</span><span class="info-item-value">${lead.nome}</span></div>
                    <div class="info-item"><span class="info-item-label">Fascia d'età</span><span class="info-item-value">${lead.eta}</span></div>
                    <div class="info-item" style="grid-column: span 2;"><span class="info-item-label">Indirizzo Email</span><span class="info-item-value" style="word-break:break-all;">${lead.email}</span></div>
                    <div class="info-item"><span class="info-item-label">Telefono</span><span class="info-item-value">${lead.telefono}</span></div>
                    <div class="info-item"><span class="info-item-label">Contatto Preferito WhatsApp</span><span class="info-item-value">${lead.whatsapp}</span></div>
                </div>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Dettaglio Funnel & Profilazione</div>
                <div class="info-grid">
                    <div class="info-item" style="grid-column: span 2;"><span class="info-item-label">Interesse Principale</span><span class="info-item-value" style="color:var(--color-primary);">${lead.interesse}</span></div>
                    <div class="info-item"><span class="info-item-label">Situazione Lavorativa</span><span class="info-item-value">${lead.lavoro}</span></div>
                    <div class="info-item"><span class="info-item-label">Ore disponibili / settimana</span><span class="info-item-value">${lead.ore_settimana}</span></div>
                    <div class="info-item" style="grid-column: span 2;"><span class="info-item-label">Disponibilità Call</span><span class="info-item-value">${lead.disponibilita_call}</span></div>
                    <div class="info-item"><span class="info-item-label">Provenienza / UTM</span><span class="info-item-value">${lead.provenienza}</span></div>
                    <div class="info-item"><span class="info-item-label">Data Registrazione</span><span class="info-item-value" style="font-size:0.85rem;">${formatDate(lead.data_registrazione)}</span></div>
                </div>
            </div>
        `;

        const slider = document.getElementById('score-override-slider');
        const sliderValDisplay = document.getElementById('slider-current-val');
        slider.addEventListener('input', () => { sliderValDisplay.textContent = slider.value; });
        document.getElementById('btn-save-score-override').addEventListener('click', () => saveScoreOverride(id, parseInt(slider.value)));
        document.getElementById('btn-save-crm-details').addEventListener('click', () => {
            saveCrmDetails(id, document.getElementById('crm-status-select').value, document.getElementById('crm-followup-date').value, document.getElementById('crm-notes').value);
        });
        document.getElementById('btn-gcal-schedule').addEventListener('click', () => scheduleOnGoogleCalendar(lead));
    }

    function closeSidePanel() {
        panelOverlay.classList.remove('active');
        selectedLeadId = null;
    }

    btnClosePanel.addEventListener('click', closeSidePanel);
    panelOverlay.addEventListener('click', (e) => { if (e.target === panelOverlay) closeSidePanel(); });

    function saveScoreOverride(leadId, newScore) {
        const idx = leads.findIndex(l => l.id === leadId);
        if (idx === -1) return;
        leads[idx].score = newScore;
        leads[idx].stato = newScore >= 70 ? 'Caldo' : newScore >= 40 ? 'Medio' : 'Freddo';
        localStorage.setItem('serenella_leads', JSON.stringify(leads));
        renderDashboard();
        openSidePanel(leadId);
    }

    function saveCrmDetails(leadId, crmStatus, followupDate, notes) {
        const idx = leads.findIndex(l => l.id === leadId);
        if (idx === -1) return;
        leads[idx].crm_stato = crmStatus;
        leads[idx].data_ricontatto = followupDate;
        leads[idx].note = notes;
        localStorage.setItem('serenella_leads', JSON.stringify(leads));
        renderDashboard();
        openSidePanel(leadId);
        showToast("Informazioni CRM salvate correttamente!");
    }

    function scheduleOnGoogleCalendar(lead) {
        const eventTitle = encodeURIComponent(`Chiamata Greenway - ${lead.nome}`);
        let details = `Email: ${lead.email}\nTelefono: ${lead.telefono} (WhatsApp: ${lead.whatsapp})\nFascia d'età: ${lead.eta}\nLavoro: ${lead.lavoro}\nInteresse: ${lead.interesse}\nTempo settimanale: ${lead.ore_settimana}\nScore compatibilità: ${lead.score}/100\n`;
        if (lead.note) details += `\nNote CRM:\n${lead.note}`;
        const eventDetails = encodeURIComponent(details);
        const now = new Date();
        const startIso = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(now.getTime() + 1000 * 60 * 30);
        const endIso = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${startIso}/${endIso}&sf=true&output=xml`, '_blank');
    }

    function deleteLead(id) {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;
        if (confirm(`Sei sicuro di voler eliminare definitivamente il lead di "${lead.nome}"? Questa operazione non può essere annullata.`)) {
            leads = leads.filter(l => l.id !== id);
            localStorage.setItem('serenella_leads', JSON.stringify(leads));
            if (selectedLeadId === id) closeSidePanel();
            renderDashboard();
            showToast("Lead eliminato correttamente.", "success");
        }
    }

    btnDeleteLeadPanel.addEventListener('click', () => { if (selectedLeadId) deleteLead(selectedLeadId); });

    // ==========================================
    // WEBHOOK
    // ==========================================
    function loadWebhookSettings() {
        const savedUrl = localStorage.getItem('serenella_webhook_url');
        if (savedUrl) webhookUrlInput.value = savedUrl;
    }

    btnSaveWebhook.addEventListener('click', () => {
        const url = webhookUrlInput.value.trim();
        if (url === '') {
            localStorage.removeItem('serenella_webhook_url');
            showToast("Indirizzo Webhook rimosso.", "success");
        } else {
            try {
                new URL(url);
                localStorage.setItem('serenella_webhook_url', url);
                showToast("URL Webhook salvato correttamente!", "success");
            } catch (err) {
                showToast("Inserisci un URL valido (deve iniziare con http:// o https://).", "danger");
            }
        }
    });

    btnTestWebhook.addEventListener('click', () => {
        const webhookUrl = webhookUrlInput.value.trim();
        if (!webhookUrl) { showToast("Salva prima un URL Webhook valido per effettuare il test.", "danger"); return; }
        const testLead = { id: 'lead_test_webhook', nome: 'Utente Test Webhook', email: 'test.webhook@greenway.it', telefono: '399 9999999', whatsapp: 'Sì', eta: '30-45 anni', lavoro: 'Autonomo', interesse: 'voglio parlare direttamente con Serenella', ore_settimana: '10-20 ore', disponibilita_call: 'Sì, voglio prenotarla subito', provenienza: 'Webhook Manual Test Link', data_registrazione: new Date().toISOString(), score: 95, stato: 'Caldo' };
        showToast("Invio in corso...");
        fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testLead), mode: 'no-cors' })
            .then(() => showToast("Payload inviato al Webhook con successo!", "success"))
            .catch(err => { showToast("Errore durante l'invio del webhook.", "danger"); console.error(err); });
    });

    // ==========================================
    // EXPORT CSV
    // ==========================================
    btnExportCsv.addEventListener('click', () => {
        if (leads.length === 0) { showToast("Nessun lead disponibile per l'esportazione.", "danger"); return; }
        const headers = ['ID Lead', 'Nome', 'Email', 'Telefono', 'WhatsApp Preferito', 'Fascia d\'Età', 'Lavoro', 'Interesse Principale', 'Ore Settimanali Disponibili', 'Disponibilità Call', 'Provenienza UTM', 'Data Registrazione', 'Lead Score', 'Classificazione Temperatura'];
        const csvRows = [headers.join(';')];
        leads.forEach(lead => {
            csvRows.push([lead.id, escapeCsvValue(lead.nome), escapeCsvValue(lead.email), escapeCsvValue(lead.telefono), lead.whatsapp, lead.eta, escapeCsvValue(lead.lavoro), escapeCsvValue(lead.interesse), escapeCsvValue(lead.ore_settimana), escapeCsvValue(lead.disponibilita_call), escapeCsvValue(lead.provenienza), lead.data_registrazione, lead.score, lead.stato].join(';'));
        });
        const csvContent = "\ufeff" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_serenella_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Esportazione CSV completata con successo!");
    });

    function escapeCsvValue(val) {
        if (val === undefined || val === null) return '';
        let str = val.toString().replace(/(\r\n|\n|\r)/gm, " ");
        if (str.includes(';') || str.includes('"') || str.includes("\n")) str = '"' + str.replace(/"/g, '""') + '"';
        return str;
    }

    // ==========================================
    // TOAST
    // ==========================================
    function showToast(message, type = "success") {
        toast.className = `alert-toast ${type} active`;
        toastMessage.textContent = message;
        setTimeout(() => toast.classList.remove('active'), 4000);
    }

    // ==========================================
    // FILTERS & EVENTS
    // ==========================================
    searchInput.addEventListener('input', renderTable);
    filterTemp.addEventListener('change', renderTable);
    filterCrmStatus.addEventListener('change', renderTable);
    filterInterest.addEventListener('change', renderTable);
    filterCall.addEventListener('change', renderTable);

    const guideHeader = document.getElementById('guide-toggle-header');
    const guideContent = document.getElementById('guide-content-body');
    const guideArrow = document.getElementById('guide-arrow-icon');
    if (guideHeader && guideContent) {
        guideHeader.addEventListener('click', () => {
            const isHidden = guideContent.style.display === 'none' || guideContent.style.display === '';
            guideContent.style.display = isHidden ? 'block' : 'none';
            guideArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    // ==========================================
    // TABS
    // ==========================================
    function switchTab(tabName) {
        if (tabName === 'leads') {
            tabLeads.classList.add('active'); tabLeads.style.color = 'var(--color-primary)'; tabLeads.style.borderBottom = '3px solid var(--color-primary)';
            tabEditor.classList.remove('active'); tabEditor.style.color = 'var(--color-text-muted)'; tabEditor.style.borderBottom = 'none';
            contentLeads.style.display = 'block'; contentEditor.style.display = 'none';
        } else {
            tabEditor.classList.add('active'); tabEditor.style.color = 'var(--color-primary)'; tabEditor.style.borderBottom = '3px solid var(--color-primary)';
            tabLeads.classList.remove('active'); tabLeads.style.color = 'var(--color-text-muted)'; tabLeads.style.borderBottom = 'none';
            contentLeads.style.display = 'none'; contentEditor.style.display = 'block';
            loadCurrentContentToForm();
        }
    }

    tabLeads.addEventListener('click', () => switchTab('leads'));
    tabEditor.addEventListener('click', () => switchTab('editor'));

    // ==========================================
    // CONTENT EDITOR
    // ==========================================
    // Dynamic products state
    const defaultProducts = [
        {
            category: "cleaning",
            title: "Green Fiber Home P1 per Vetri",
            tag: "Best Seller",
            desc: "Fibra speciale per vetri, specchi e superfici lucide. Pulisce perfettamente utilizzando solo acqua, eliminando l'uso di detergenti chimici inquinanti.",
            img: "images/green_products.png",
            features: ["Elimina il 90% della chimica", "Niente aloni, garantito oltre 2 anni"],
            url: "https://greenwayglobal.it/"
        },
        {
            category: "beauty",
            title: "Sharme Hair Coconut",
            tag: "Bio certificato",
            desc: "Shampoo solido naturale e biologico per capelli secchi. Idrata in profondità, è ecologico, biodegradabile e completamente privo di plastica.",
            img: "images/green_products.png",
            features: ["Ingredienti 100% biodegradabili", "Zero plastica e packaging riciclabile"],
            url: "https://greenwayglobal.it/"
        },
        {
            category: "wellness",
            title: "Welllab C-Complex",
            tag: "Innovazione",
            desc: "Integratore alimentare a base di Vitamina C attiva arricchito con bioflavonoidi ed estratti vegetali, formulato per rafforzare le difese immunitarie.",
            img: "images/green_products.png",
            features: ["Estratti botanici ad alta efficacia", "Senza coloranti o aromi artificiali"],
            url: "https://greenwayglobal.it/"
        }
    ];

    let currentProductsList = defaultProducts;

    function renderAdminProductsList() {
        const listContainer = document.getElementById('admin-products-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        
        if (currentProductsList.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 25px; background-color: var(--color-bg-base); border: 1px dashed var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-muted); font-size:0.9rem;">
                    Nessun prodotto presente nel catalogo. Clicca su "Aggiungi Nuovo Prodotto" per iniziare!
                </div>
            `;
            return;
        }

        currentProductsList.forEach((prod, index) => {
            const itemRow = document.createElement('div');
            itemRow.style.display = 'flex';
            itemRow.style.alignItems = 'center';
            itemRow.style.justifyContent = 'space-between';
            itemRow.style.backgroundColor = 'var(--color-bg-base)';
            itemRow.style.border = '1px solid var(--color-border)';
            itemRow.style.borderRadius = 'var(--radius-sm)';
            itemRow.style.padding = '12px 18px';
            itemRow.style.gap = '15px';
            
            let catName = 'Pulizia Ecologica';
            if (prod.category === 'beauty') catName = 'Cosmesi Naturale';
            if (prod.category === 'wellness') catName = 'Cura e Benessere';
            
            const tagBadge = prod.tag ? `<span class="temp-badge temp-warm" style="margin-left: 8px; font-size: 0.75rem; padding: 2px 6px; font-weight:600;">${prod.tag}</span>` : '';
            
            itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; flex-grow: 1; min-width: 0;">
                    <div style="width: 45px; height: 45px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); overflow: hidden; background: #fff; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <img src="${prod.img || 'images/green_products.png'}" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div style="min-width: 0; flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; flex-wrap: wrap;">
                            ${prod.title} ${tagBadge}
                        </h4>
                        <div style="font-size: 0.78rem; color: var(--color-text-muted);">
                            <span>Categoria: <strong>${catName}</strong></span>
                            ${prod.url ? ` | <a href="${prod.url}" target="_blank" style="color: var(--color-primary); text-decoration: none;">Vedi scheda shop ↗</a>` : ''}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                    <button type="button" class="btn btn-secondary btn-edit-product" data-index="${index}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;">✏️ Modifica</button>
                    <button type="button" class="btn btn-secondary btn-delete-product" data-index="${index}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); border-color: var(--color-danger); color: var(--color-danger); font-weight: 600; cursor: pointer; background: none;">🗑️ Elimina</button>
                </div>
            `;
            listContainer.appendChild(itemRow);
        });

        // Add listeners
        listContainer.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                openProductModal(idx);
            });
        });

        listContainer.querySelectorAll('.btn-delete-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                deleteProduct(idx);
            });
        });
    }

    function openProductModal(index = null) {
        productEditForm.reset();
        
        if (index !== null && index !== undefined && !isNaN(index)) {
            const prod = currentProductsList[index];
            productEditIndex.value = index;
            prodEditCategory.value = prod.category;
            prodEditTitle.value = prod.title;
            prodEditTag.value = prod.tag || '';
            prodEditDesc.value = prod.desc;
            prodEditImg.value = prod.img || 'images/green_products.png';
            prodEditFeat1.value = prod.features[0] || '';
            prodEditFeat2.value = prod.features[1] || '';
            prodEditUrl.value = prod.url || '';
            document.getElementById('product-modal-title').textContent = "Modifica Prodotto Greenway";
        } else {
            productEditIndex.value = '';
            prodEditImg.value = 'images/green_products.png';
            document.getElementById('product-modal-title').textContent = "Aggiungi Nuovo Prodotto";
        }
        
        productModal.style.display = 'flex';
    }

    function closeProductModal() {
        productModal.style.display = 'none';
    }

    function deleteProduct(index) {
        const prod = currentProductsList[index];
        if (confirm(`Sei sicuro di voler eliminare il prodotto "${prod.title}" dal tuo catalogo?`)) {
            currentProductsList.splice(index, 1);
            renderAdminProductsList();
            showToast("Prodotto eliminato correttamente.");
        }
    }

    function saveProduct() {
        const titleVal = prodEditTitle.value.trim();
        const descVal = prodEditDesc.value.trim();
        const feat1Val = prodEditFeat1.value.trim();
        const feat2Val = prodEditFeat2.value.trim();
        
        if (!titleVal || !descVal || !feat1Val || !feat2Val) {
            showToast("Per favore compila tutti i campi obbligatori del prodotto.", "danger");
            return;
        }

        const productData = {
            category: prodEditCategory.value,
            title: titleVal,
            tag: prodEditTag.value.trim(),
            desc: descVal,
            img: prodEditImg.value.trim() || 'images/green_products.png',
            features: [feat1Val, feat2Val],
            url: prodEditUrl.value.trim()
        };

        const idxVal = productEditIndex.value;
        if (idxVal === '') {
            currentProductsList.push(productData);
            showToast("Nuovo prodotto aggiunto al catalogo!", "success");
        } else {
            const idx = parseInt(idxVal);
            currentProductsList[idx] = productData;
            showToast("Prodotto aggiornato con successo!", "success");
        }
        
        renderAdminProductsList();
        closeProductModal();
    }

    // Modal Event Listeners
    if (btnAddProduct) btnAddProduct.addEventListener('click', () => openProductModal());
    if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
    if (btnCancelProduct) btnCancelProduct.addEventListener('click', closeProductModal);
    if (btnSaveProduct) btnSaveProduct.addEventListener('click', saveProduct);
    
    // Close modal when clicking outside container
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) closeProductModal();
        });
    }

    function loadCurrentContentToForm() {
        const savedContent = localStorage.getItem('serenella_custom_content');
        if (savedContent) {
            const data = JSON.parse(savedContent);
            if (data.heroTitle) editHeroTitle.value = data.heroTitle;
            if (data.heroDesc) editHeroDesc.value = data.heroDesc;
            if (data.profileImg) editProfileImg.value = data.profileImg;
            if (data.calendarUrl) editCalendarUrl.value = data.calendarUrl;
            if (data.whatsappNum) editWhatsappNum.value = data.whatsappNum;
            if (data.catalogUrl) editCatalogUrl.value = data.catalogUrl;
            if (data.webinarUrl) editWebinarUrl.value = data.webinarUrl;
            if (data.guideName) editGuideName.value = data.guideName;
            
            // FAQs
            if (data.faq1Q) editFaq1Q.value = data.faq1Q;
            if (data.faq1A) editFaq1A.value = data.faq1A;
            if (data.faq2Q) editFaq2Q.value = data.faq2Q;
            if (data.faq2A) editFaq2A.value = data.faq2A;
            if (data.faq3Q) editFaq3Q.value = data.faq3Q;
            if (data.faq3A) editFaq3A.value = data.faq3A;
            if (data.faq4Q) editFaq4Q.value = data.faq4Q;
            if (data.faq4A) editFaq4A.value = data.faq4A;

            // Products
            if (data.products && Array.isArray(data.products)) {
                currentProductsList = data.products;
            } else {
                currentProductsList = defaultProducts;
            }
        } else {
            currentProductsList = defaultProducts;
        }
        renderAdminProductsList();
    }

    // ==========================================
    // YOUTUBE URL NORMALIZER  ← FIX PRINCIPALE
    // ==========================================
    function normalizeYouTubeUrl(input) {
        if (!input || input.trim() === '') return '';
        const raw = input.trim();

        // Already embed format — return as-is
        if (raw.includes('youtube.com/embed/')) return raw;

        // Extract 11-char video ID from any YouTube URL format
        const patterns = [
            /youtu\.be\/([A-Za-z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
            /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
            /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = raw.match(pattern);
            if (match && match[1]) {
                return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
            }
        }

        // Not a recognized YouTube URL — return as-is (allow Vimeo etc.)
        return raw;
    }

    // ==========================================
    // SAVE CONTENT  ← AGGIORNATO CON VALIDAZIONE
    // ==========================================
    function saveContentLocally() {
        const rawWebinarUrl = editWebinarUrl.value.trim();
        const normalizedWebinarUrl = normalizeYouTubeUrl(rawWebinarUrl);

        // If URL was converted, update the input field to show the user the normalized value
        if (rawWebinarUrl !== '' && rawWebinarUrl !== normalizedWebinarUrl) {
            editWebinarUrl.value = normalizedWebinarUrl;
            showToast("✅ URL YouTube convertito automaticamente in formato embed!", "success");
        } else if (rawWebinarUrl !== '' && !rawWebinarUrl.includes('youtube.com/embed/') && !rawWebinarUrl.includes('youtu.be/') && !rawWebinarUrl.includes('youtube.com/watch')) {
            // Unrecognized URL — warn but still save
            showToast("⚠️ URL webinar non riconosciuto come YouTube. Verifica il formato.", "danger");
        }

        const content = {
            heroTitle: editHeroTitle.value.trim(),
            heroDesc: editHeroDesc.value.trim(),
            profileImg: editProfileImg.value.trim(),
            calendarUrl: editCalendarUrl.value.trim(),
            whatsappNum: editWhatsappNum.value.trim(),
            catalogUrl: editCatalogUrl.value.trim(),
            webinarUrl: normalizedWebinarUrl,
            guideName: editGuideName.value.trim(),
            faq1Q: editFaq1Q.value.trim(), faq1A: editFaq1A.value.trim(),
            faq2Q: editFaq2Q.value.trim(), faq2A: editFaq2A.value.trim(),
            faq3Q: editFaq3Q.value.trim(), faq3A: editFaq3A.value.trim(),
            faq4Q: editFaq4Q.value.trim(), faq4A: editFaq4A.value.trim(),
            products: currentProductsList
        };

        localStorage.setItem('serenella_custom_content', JSON.stringify(content));
        
        if (rawWebinarUrl === normalizedWebinarUrl || rawWebinarUrl === '') {
            showToast("Modifiche salvate localmente! Apri la landing page per verificare.");
        }
    }

    btnSaveContent.addEventListener('click', saveContentLocally);

    // ==========================================
    // HTML GENERATOR
    // ==========================================
    async function generateAndExportHtml() {
        showToast("Generazione file in corso...", "success");
        try {
            const response = await fetch('index.html');
            if (!response.ok) throw new Error("File non accessibile");
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const hTitle = doc.getElementById('hero-title'); if (hTitle) hTitle.textContent = editHeroTitle.value.trim();
            const hDesc = doc.getElementById('hero-desc'); if (hDesc) hDesc.textContent = editHeroDesc.value.trim();
            const hProfileImg = doc.getElementById('hero-profile-img'); if (hProfileImg) hProfileImg.src = editProfileImg.value.trim();
            const catalogBtn = doc.getElementById('catalog-btn'); if (catalogBtn) catalogBtn.href = editCatalogUrl.value.trim();

            // Dynamic products rendering into the static HTML exported file (for SEO!)
            const productsGrid = doc.getElementById('products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = '';
                currentProductsList.forEach((prod, index) => {
                    const card = doc.createElement('div');
                    card.className = 'product-card';
                    card.setAttribute('data-category', prod.category);
                    card.id = `prod-card-${index + 1}`;
                    
                    const tagHtml = prod.tag && prod.tag.trim() !== '' 
                        ? `<span class="product-tag">${prod.tag}</span>` 
                        : '';
                        
                    const featuresHtml = (prod.features || []).map(feat => {
                        if (!feat || feat.trim() === '') return '';
                        return `
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ${feat}
                            </li>
                        `;
                    }).join('');
                    
                    const urlHtml = prod.url && prod.url.trim() !== '' 
                        ? `
                            <div style="margin-top: 15px;">
                                <a href="${prod.url}" target="_blank" class="btn btn-tertiary" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: 100%; font-size: 0.85rem; padding: 8px 12px; font-weight: 600;">
                                    Acquista / Dettagli
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </a>
                            </div>
                        ` 
                        : '';
                        
                    card.innerHTML = `
                        <div class="product-image">
                            <img src="${prod.img || 'images/green_products.png'}" alt="${prod.title}">
                            ${tagHtml}
                        </div>
                        <div class="product-info">
                            <h3>${prod.title}</h3>
                            <p>${prod.desc}</p>
                            <ul class="product-feature-list">
                                ${featuresHtml}
                            </ul>
                            ${urlHtml}
                        </div>
                    `;
                    productsGrid.appendChild(card);
                });
            }

            const faqGroup = doc.getElementById('faq-accordion-group');
            if (faqGroup && faqGroup.children.length >= 4) {
                const faqData = [{ q: editFaq1Q.value.trim(), a: editFaq1A.value.trim() }, { q: editFaq2Q.value.trim(), a: editFaq2A.value.trim() }, { q: editFaq3Q.value.trim(), a: editFaq3A.value.trim() }, { q: editFaq4Q.value.trim(), a: editFaq4A.value.trim() }];
                faqData.forEach((data, index) => {
                    const item = faqGroup.children[index];
                    if (item) {
                        const questionBtn = item.querySelector('.faq-question');
                        if (questionBtn) questionBtn.innerHTML = data.q + ` <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
                        const answerP = item.querySelector('.faq-answer p');
                        if (answerP) answerP.textContent = data.a;
                    }
                });
            }

            // Use normalized webinar URL in exported HTML too
            const normalizedForExport = normalizeYouTubeUrl(editWebinarUrl.value.trim());

            let configScript = doc.getElementById('serenella-config-script');
            if (!configScript) { configScript = doc.createElement('script'); configScript.id = 'serenella-config-script'; doc.head.insertBefore(configScript, doc.head.firstChild); }
            configScript.textContent = `window.SERENELLA_CONFIG = ${JSON.stringify({
                heroTitle: editHeroTitle.value.trim(), heroDesc: editHeroDesc.value.trim(), profileImg: editProfileImg.value.trim(),
                calendarUrl: editCalendarUrl.value.trim(), whatsappNum: editWhatsappNum.value.trim(), catalogUrl: editCatalogUrl.value.trim(),
                webinarUrl: normalizedForExport, guideName: editGuideName.value.trim(),
                faq1Q: editFaq1Q.value.trim(), faq1A: editFaq1A.value.trim(), faq2Q: editFaq2Q.value.trim(), faq2A: editFaq2A.value.trim(),
                faq3Q: editFaq3Q.value.trim(), faq3A: editFaq3A.value.trim(), faq4Q: editFaq4Q.value.trim(), faq4A: editFaq4A.value.trim(),
                products: currentProductsList
            })};`;

            const updatedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
            const blob = new Blob([updatedHtml], { type: 'text/html;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url); link.setAttribute('download', 'index.html'); link.style.visibility = 'hidden';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            showToast("File index.html aggiornato esportato con successo!", "success");
        } catch (err) {
            console.error("HTML Generation failed: ", err);
            showToast("Errore: apri il pannello con un server locale (es. Live Server) per abilitare l'esportazione.", "danger");
        }
    }

    btnGenerateHtml.addEventListener('click', generateAndExportHtml);

    // ==========================================
    // BOOTSTRAP
    // ==========================================
    renderDashboard();
    loadCurrentContentToForm();
});