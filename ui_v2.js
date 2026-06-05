/**
 * CV Roast & Pitch AI - User Interface & Rendering Logic
 */

const ui = {
    // Current application ID being viewed in detail modals
    selectedApplicationId: null,
    // Store temporarily generated pitch data before it is saved to CRM
    tempGeneratedPitch: null,

    /**
     * Renders top dashboard counts and indicators
     */
    renderDashboardStats: function(applications) {
        // Calculate average CV score if there is any roast history
        const roastHistory = this.getRoastHistory();
        let avgCVScore = 0;
        if (roastHistory.length > 0) {
            const sum = roastHistory.reduce((s, r) => s + (r.scores.ats + r.scores.impact + r.scores.readability + r.scores.tone) / 4, 0);
            avgCVScore = Math.round(sum / roastHistory.length);
        }
        document.getElementById('stat-total-leads').textContent = avgCVScore > 0 ? `${avgCVScore}%` : 'N/A';
        
        // Show current persona active
        const lastRoast = roastHistory[roastHistory.length - 1];
        const activePersona = lastRoast ? lastRoast.persona : 'Nessuno';
        document.getElementById('stat-leads-growth').querySelector('span').textContent = `Persona: ${activePersona}`;

        // Number of active applications
        const inProgress = applications.filter(a => a.status !== 'Rifiutato/Ghostato' && a.status !== 'Offerta').length;
        document.getElementById('stat-active-campaigns').textContent = inProgress;

        // Sent pitches
        document.getElementById('stat-emails-sent').textContent = applications.length;
        
        // Calculate Response Rate: Interview/Offers vs Total Applications
        const responseActions = applications.filter(a => a.status === 'Primo Colloquio' || a.status === 'Secondo Colloquio' || a.status === 'Offerta').length;
        const responseRate = applications.length > 0 ? Math.round((responseActions / applications.length) * 100) : 0;
        document.getElementById('stat-conversion-rate').textContent = `${responseRate}%`;
    },

    /**
     * Helper to read roast history from localStorage
     */
    getRoastHistory: function() {
        const stored = localStorage.getItem('cv_roast_history');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) { return []; }
        }
        return [];
    },

    /**
     * Renders recent activities on Dashboard (Recent Applications)
     */
    renderDashboardRecentTable: function(applications) {
        const tbody = document.getElementById('dashboard-recent-tbody');
        tbody.innerHTML = '';

        if (applications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nessuna candidatura registrata. Genera un pitch per iniziare!</td></tr>`;
            return;
        }

        // Show the 5 most recent applications
        const recentApps = [...applications].reverse().slice(0, 5);
        recentApps.forEach(appItem => {
            const tr = document.createElement('tr');
            
            const trClass = appItem.status === 'Offerta' ? 'table-success' : '';
            const statusClass = this.getStatusClass(appItem.status);
            
            tr.innerHTML = `
                <td>
                    <div class="font-semibold">${appItem.companyName}</div>
                    <span class="text-xs text-muted">${appItem.role}</span>
                </td>
                <td><a href="${appItem.websiteUrl}" target="_blank" class="text-purple">${appItem.websiteUrl.replace(/https?:\/\/(www\.)?/, '')}</a></td>
                <td class="font-semibold text-purple">${appItem.tone}</td>
                <td><span class="badge-status ${statusClass}">${appItem.status}</span></td>
                <td>
                    <button class="btn-text" onclick="ui.openApplicationModal('${appItem.id}')">Vedi Pitch</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    /**
     * Maps statuses to CSS classes
     */
    getStatusClass: function(status) {
        switch(status) {
            case 'Da Contattare': return 'new';
            case 'Pitch Inviato': return 'contacted';
            case 'In Trattativa': return 'negotiating';
            case 'Primo Colloquio':
            case 'Secondo Colloquio': return 'negotiating';
            case 'Offerta': return 'won';
            case 'Rifiutato/Ghostato': return 'lost';
            default: return 'new';
        }
    },

    /**
     * Renders a mock pipeline chart representing job application conversion rates
     */
    renderDashboardChart: function(applications) {
        const linePath = document.getElementById('chart-line-path');
        const areaPath = document.getElementById('chart-area-path');
        if (!linePath || !areaPath) return;

        // Visual curve representing conversion funnel steps (CV, Pitches, Replies, Interviews, Offers)
        const baseValues = [100, 80, 45, 30, 15, 8, 2];
        
        if (applications.length > 0) {
            const total = applications.length;
            const replies = applications.filter(a => a.status !== 'Da Contattare' && a.status !== 'Pitch Inviato' && a.status !== 'Rifiutato/Ghostato').length;
            const interviews = applications.filter(a => a.status === 'Primo Colloquio' || a.status === 'Secondo Colloquio' || a.status === 'Offerta').length;
            const offers = applications.filter(a => a.status === 'Offerta').length;
            
            baseValues[0] = 100;
            baseValues[1] = Math.min(100, 80 + total * 2);
            baseValues[2] = Math.round((replies / total) * 100) || 30;
            baseValues[3] = Math.round((interviews / total) * 100) || 15;
            baseValues[4] = Math.round((offers / total) * 100) || 5;
            baseValues[5] = Math.max(2, baseValues[4] + 2);
            baseValues[6] = Math.max(1, baseValues[4]);
        }

        const points = baseValues.map((val, idx) => {
            const x = idx * 83.3; // 500 / 6
            const y = 180 - (val / 100) * 150;
            return { x, y };
        });

        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
        }
        linePath.setAttribute('d', pathD);

        const areaD = `${pathD} L 500 200 L 0 200 Z`;
        areaPath.setAttribute('d', areaD);
    },

    /**
     * Renders the complete table list of the CRM tracker view
     */
    renderCRMTable: function(applications) {
        const tbody = document.getElementById('crm-tbody');
        const emptyState = document.getElementById('crm-empty-state');
        tbody.innerHTML = '';

        const filterQuery = document.getElementById('crm-filter-input').value.toLowerCase();
        const statusFilter = document.getElementById('crm-filter-status').value;

        // Apply filters
        const filteredApps = applications.filter(appItem => {
            const matchesQuery = appItem.companyName.toLowerCase().includes(filterQuery) || 
                                 appItem.role.toLowerCase().includes(filterQuery) || 
                                 appItem.tone.toLowerCase().includes(filterQuery);
            const matchesStatus = statusFilter === 'ALL' || appItem.status === statusFilter;
            return matchesQuery && matchesStatus;
        });

        if (filteredApps.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        filteredApps.forEach(appItem => {
            const tr = document.createElement('tr');
            
            const statusClass = this.getStatusClass(appItem.status);

            tr.innerHTML = `
                <td>
                    <div class="font-semibold">${appItem.companyName}</div>
                    <span class="text-xs text-muted">${appItem.role}</span>
                </td>
                <td>
                    <div class="text-xs font-semibold">${appItem.contactEmail}</div>
                    <a href="${appItem.websiteUrl}" target="_blank" class="text-xs text-purple">${appItem.websiteUrl.replace(/https?:\/\/(www\.)?/, '')}</a>
                </td>
                <td>
                    <div class="lead-scores-row">
                        <span class="score-badge high">Stile: ${appItem.tone}</span>
                    </div>
                </td>
                <td>
                    <select class="form-control text-xs" style="padding: 4px 8px;" onchange="ui.changeStatus('${appItem.id}', this.value)">
                        <option value="Da Contattare" ${appItem.status === 'Da Contattare' ? 'selected' : ''}>Da Contattare</option>
                        <option value="Pitch Inviato" ${appItem.status === 'Pitch Inviato' ? 'selected' : ''}>Pitch Inviato</option>
                        <option value="In Trattativa" ${appItem.status === 'In Trattativa' ? 'selected' : ''}>In Trattativa</option>
                        <option value="Primo Colloquio" ${appItem.status === 'Primo Colloquio' ? 'selected' : ''}>Primo Colloquio</option>
                        <option value="Secondo Colloquio" ${appItem.status === 'Secondo Colloquio' ? 'selected' : ''}>Secondo Colloquio</option>
                        <option value="Offerta" ${appItem.status === 'Offerta' ? 'selected' : ''}>Offerta</option>
                        <option value="Rifiutato/Ghostato" ${appItem.status === 'Rifiutato/Ghostato' ? 'selected' : ''}>Rifiutato/Ghostato</option>
                    </select>
                </td>
                <td class="text-xs text-muted">${appItem.dateCreated}</td>
                <td>
                    <div class="lead-item-actions">
                        <button class="btn-icon" title="Gestisci Pitch & Follow-up" onclick="ui.openApplicationModal('${appItem.id}')">
                            <span class="material-symbols-outlined" style="font-size: 18px;">mail</span>
                        </button>
                        <button class="btn-icon text-red" title="Elimina Candidatura" onclick="ui.deleteApplication('${appItem.id}')">
                            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    /**
     * Triggers simulated scrolling log terminal for CV Roast
     */
    startCVRoast: function(cvText, persona) {
        if (!cvText || cvText.trim() === '') {
            alert('Inserisci il testo del tuo CV per poterlo roastare!');
            return;
        }

        // Setup UI view
        document.getElementById('roast-placeholder').style.display = 'none';
        document.getElementById('roast-results-container').style.display = 'none';
        
        const scanner = document.getElementById('roast-scanner');
        scanner.style.display = 'flex';
        
        const logs = document.getElementById('roast-terminal-logs');
        logs.innerHTML = '';

        // Animation log statements
        const logLines = [
            { text: `> Inizializzazione motore di Roast AI... OK`, delay: 0 },
            { text: `> Caricamento profilo candidato in memoria...`, delay: 400 },
            { text: `> Richiamo modulo di personalità: "${persona}"...`, delay: 800 },
            { text: `> Scansione buzzwords di marketing e aggettivi cliché...`, delay: 1300 },
            { text: `> [ALERT] Trovata frase 'Persona motivata che ama imparare' -> Tasso sarcasmo alzato al 95%.`, delay: 1800, type: 'warn' },
            { text: `> Analisi metriche quantitative e cifre di impatto reale...`, delay: 2400 },
            { text: `> [WARNING] Nessun dato numerico rilevato nel sommario. Rilevato rischio 'Costo Fisso'.`, delay: 2900, type: 'info' },
            { text: `> Simulazione lettura da parte del bot ATS (Application Tracking System)...`, delay: 3500 },
            { text: `> [ATS Verdict] Punteggio di lettura calcolato.`, delay: 4000, type: 'success' },
            { text: `> Richiesta di riscrittura ottimizzata inviata all'AI Engine...`, delay: 4500 },
            { text: `> [AI] Compilazione dei feedback comici in corso...`, delay: 5100, type: 'success' },
            { text: `> Analisi terminata. Generazione report completata.`, delay: 5700 }
        ];

        // Animate printing lines
        logLines.forEach(line => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.className = `terminal-line ${line.type || ''}`;
                p.textContent = line.text;
                logs.appendChild(p);
                logs.scrollTop = logs.scrollHeight;
            }, line.delay);
        });

        // Trigger AI or Mock generation — keep scanner visible until result arrives
        const runRoast = async () => {
            try {
                let result = null;
                const provider = app.state.settings.llmProvider || 'gemini';
                const geminiKey = app.state.settings.geminiApiKey;
                const openRouterKey = app.state.settings.openRouterApiKey;
                
                const hasGemini = provider === 'gemini' && geminiKey && geminiKey.trim() !== '';
                const hasOpenRouter = provider === 'openrouter' && openRouterKey && openRouterKey.trim() !== '';
                const hasOllama = provider === 'ollama';
                
                if (hasGemini) {
                    // For API mode: wait for animation to mostly complete (5s) then call API
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    result = await api.generateGeminiRoast(geminiKey, cvText, persona);
                } else if (hasOpenRouter) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const model = app.state.settings.openRouterModel === 'custom' 
                        ? app.state.settings.openRouterModelCustom 
                        : app.state.settings.openRouterModel;
                    result = await api.generateOpenRouterRoast(openRouterKey, model, cvText, persona);
                } else if (hasOllama) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const url = app.state.settings.ollamaUrl || 'http://localhost:11434';
                    const model = app.state.settings.ollamaModel || 'llama3';
                    result = await api.generateOllamaRoast(url, model, cvText, persona);
                } else {
                    // Small artificial delay so animation completes for mock mode
                    await new Promise(resolve => setTimeout(resolve, 6200));
                    result = api.generateMockRoast(cvText, persona);
                }
                
                // Add persona to results and save to history
                result.persona = persona;
                
                const history = this.getRoastHistory();
                history.push(result);
                localStorage.setItem('cv_roast_history', JSON.stringify(history));
                
                // Keep CV in settings as default
                app.saveSettings({ cvText: cvText });

                // Hide scanner THEN show results (never leaves blank)
                scanner.style.display = 'none';
                ui.renderRoastResults(result);
            } catch (err) {
                console.error(err);
                scanner.style.display = 'none';
                let errMsg = err.message || String(err);
                if (errMsg.includes('Failed to fetch') || errMsg.includes('failed to fetch')) {
                    const provider = app.state.settings.llmProvider || 'gemini';
                    if (provider === 'ollama') {
                        errMsg = "Ollama non raggiungibile. Avvia Ollama in PowerShell: $env:OLLAMA_ORIGINS=\"*\" ; ollama serve";
                    } else {
                        errMsg = "Connessione API non riuscita. Verifica la chiave e la connessione internet.";
                    }
                }

                // Show inline error banner instead of blocking alert
                const banner = document.createElement('div');
                banner.id = 'roast-api-error-banner';
                banner.style.cssText = `
                    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;
                    display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px;
                    color: var(--text-main); line-height: 1.5;
                `;
                banner.innerHTML = `
                    <span class="material-symbols-outlined" style="color:#f87171;font-size:18px;flex-shrink:0;margin-top:2px;">warning</span>
                    <div>
                        <strong style="color:#f87171;">Modalità Smart Mock Attiva</strong><br>
                        <span style="color:var(--text-muted);">${errMsg} — Il roast è stato generato con il motore locale.</span>
                    </div>
                    <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;line-height:1;padding:0;">×</button>
                `;
                const resultsContainer = document.getElementById('roast-results-container');
                if (resultsContainer) {
                    const existing = document.getElementById('roast-api-error-banner');
                    if (existing) existing.remove();
                    resultsContainer.prepend(banner);
                }

                const result = api.generateMockRoast(cvText, persona);
                result.persona = persona;
                
                const history = this.getRoastHistory();
                history.push(result);
                localStorage.setItem('cv_roast_history', JSON.stringify(history));
                
                ui.renderRoastResults(result);
            }
        };

        runRoast();
    },

    /**
     * Renders CV Roast output results to the DOM
     */
    renderRoastResults: function(result) {
        document.getElementById('roast-results-container').style.display = 'grid';

        // Render circular charts & text numbers
        document.getElementById('roast-score-ats').textContent = `${result.scores.ats}%`;
        document.getElementById('roast-score-impact').textContent = `${result.scores.impact}%`;
        document.getElementById('roast-score-read').textContent = `${result.scores.readability}%`;
        document.getElementById('roast-score-tone').textContent = `${result.scores.tone}%`;

        document.getElementById('roast-score-ats-path').setAttribute('stroke-dasharray', `${result.scores.ats}, 100`);
        document.getElementById('roast-score-impact-path').setAttribute('stroke-dasharray', `${result.scores.impact}, 100`);
        document.getElementById('roast-score-read-path').setAttribute('stroke-dasharray', `${result.scores.readability}, 100`);
        document.getElementById('roast-score-tone-path').setAttribute('stroke-dasharray', `${result.scores.tone}, 100`);

        // Render Recruiter Type tag
        document.getElementById('roast-recruiter-label').textContent = result.persona;

        // Render Roast Sarcastic lines
        const roastList = document.getElementById('roast-lines-list');
        roastList.innerHTML = '';
        result.roastLines.forEach((line, idx) => {
            const li = document.createElement('div');
            li.className = 'roast-quote-item' + (idx === 1 || idx === 2 ? ' critical' : '');
            li.textContent = line;
            roastList.appendChild(li);
        });

        // Set stamp badge text and style color
        const stamp = document.getElementById('roast-stamp-badge');
        stamp.textContent = result.funnyBadge;
        
        const avg = (result.scores.ats + result.scores.impact + result.scores.readability + result.scores.tone) / 4;
        const cardShareable = document.querySelector('.roast-card-shareable');
        if (avg >= 60) {
            cardShareable.classList.add('approved');
        } else {
            cardShareable.classList.remove('approved');
        }

        // Render Optimized CV section
        document.getElementById('roast-optimized-summary').textContent = result.optimizedSummary;
        
        const bulletsList = document.getElementById('roast-optimized-bullets');
        bulletsList.innerHTML = '';
        result.optimizedBullets.forEach(bullet => {
            const li = document.createElement('li');
            li.textContent = bullet;
            bulletsList.appendChild(li);
        });

        // Reveal action buttons (CV Builder & Job Search) after roast
        const actionBtns = document.getElementById('cv-action-buttons');
        if (actionBtns) actionBtns.style.display = 'flex';

        // Wire Roast Social Copy Button
        document.getElementById('copy-roast-social-btn').onclick = function() {
            const summaryStr = `Il mio CV è appena stato distrutto da un Recruiter AI (${result.persona})! 💀\n\n🎯 ATS: ${result.scores.ats}%\n💥 Impatto: ${result.scores.impact}%\n👀 Leggibilità: ${result.scores.readability}%\n\nVerdetto: "${result.funnyBadge}"\n\nFatti roastare anche tu con CV Roast & Pitch AI!`;
            navigator.clipboard.writeText(summaryStr).then(() => {
                const btn = document.getElementById('copy-roast-social-btn');
                const prev = btn.innerHTML;
                btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span><span>Copiato!</span>`;
                setTimeout(() => { btn.innerHTML = prev; }, 2000);
            });
        };
    },

    /**
     * Start cold outreach pitch campaign generation for a specific company
     */
    startPitchGeneration: function(companyName, companyUrl, role, tone) {
        if (!companyName || companyName.trim() === '') {
            alert('Inserisci il nome dell\'azienda!');
            return;
        }

        const cvText = app.state.settings.cvText;
        if (!cvText || cvText.trim() === '') {
            alert('Nessun CV caricato nelle Impostazioni o nella scheda CV Roaster. Carica il tuo CV prima di generare un pitch!');
            return;
        }

        // Set UI views
        document.getElementById('pitch-placeholder').style.display = 'none';
        document.getElementById('pitch-results-container').style.display = 'none';
        
        const scanner = document.getElementById('pitch-scanner');
        scanner.style.display = 'flex';
        
        const logs = document.getElementById('pitch-terminal-logs');
        logs.innerHTML = '';

        const logLines = [
            { text: `> Connessione al scraper web per analizzare: ${companyUrl || 'Sito Aziendale'}`, delay: 0 },
            { text: `> Analisi posizionamento e nicchia di mercato...`, delay: 500 },
            { text: `> Rilevata nicchia azienda: determinazione delle sfide di business...`, delay: 1100 },
            { text: `> Recupero dati CV utente dal database locale...`, delay: 1700 },
            { text: `> Calcolo allineamento competenze per il ruolo: "${role || 'Collaboratore'}"...`, delay: 2200 },
            { text: `> Configurazione tono outreach su parametro: "${tone}"...`, delay: 2800 },
            { text: `> [AI Engine] Generazione bozze email personalizzate e messaggi LinkedIn...`, delay: 3300, type: 'success' },
            { text: `> Pitch generati con successo. Creazione anteprima editor...`, delay: 4200, type: 'info' }
        ];

        logLines.forEach(line => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.className = `terminal-line ${line.type || ''}`;
                p.textContent = line.text;
                logs.appendChild(p);
                logs.scrollTop = logs.scrollHeight;
            }, line.delay);
        });

        const runPitch = async () => {
            try {
                let pitchData = null;
                const provider = app.state.settings.llmProvider || 'gemini';
                const geminiKey = app.state.settings.geminiApiKey;
                const openRouterKey = app.state.settings.openRouterApiKey;
                
                const hasGemini = provider === 'gemini' && geminiKey && geminiKey.trim() !== '';
                const hasOpenRouter = provider === 'openrouter' && openRouterKey && openRouterKey.trim() !== '';
                const hasOllama = provider === 'ollama';
                
                if (hasGemini) {
                    // Wait for animation to mostly complete (4s) then call API
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    pitchData = await api.generateGeminiPitch(
                        geminiKey,
                        cvText,
                        companyName,
                        companyUrl,
                        role,
                        tone,
                        app.state.settings.senderName
                    );
                } else if (hasOpenRouter) {
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    const model = app.state.settings.openRouterModel === 'custom' 
                        ? app.state.settings.openRouterModelCustom 
                        : app.state.settings.openRouterModel;
                    pitchData = await api.generateOpenRouterPitch(
                        openRouterKey,
                        model,
                        cvText,
                        companyName,
                        companyUrl,
                        role,
                        tone,
                        app.state.settings.senderName
                    );
                } else if (hasOllama) {
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    const url = app.state.settings.ollamaUrl || 'http://localhost:11434';
                    const model = app.state.settings.ollamaModel || 'llama3';
                    pitchData = await api.generateOllamaPitch(
                        url,
                        model,
                        cvText,
                        companyName,
                        companyUrl,
                        role,
                        tone,
                        app.state.settings.senderName
                    );
                } else {
                    await new Promise(resolve => setTimeout(resolve, 4600));
                    pitchData = api.generateLocalPitch(
                        cvText,
                        companyName,
                        companyUrl,
                        role,
                        tone,
                        app.state.settings.senderName
                    );
                }

                // Store in temp object
                ui.tempGeneratedPitch = pitchData;

                // Hide scanner THEN render results
                scanner.style.display = 'none';
                ui.renderPitchOutput(pitchData);
            } catch (err) {
                console.error(err);
                scanner.style.display = 'none';
                let errMsg = err.message || err;
                if (errMsg.includes('Failed to fetch') || errMsg.includes('failed to fetch')) {
                    const provider = app.state.settings.llmProvider || 'gemini';
                    if (provider === 'ollama') {
                        errMsg += " (Verifica che Ollama sia avviato in PowerShell con la variabile $env:OLLAMA_ORIGINS=\"*\")";
                    } else {
                        errMsg += " (Verifica la connessione internet o che un'estensione AdBlocker non blocchi le chiamate API)";
                    }
                }
                alert(`Errore nella generazione del pitch reale: ${errMsg}. Uso del database offline.`);
                const pitchData = api.generateLocalPitch(
                    cvText,
                    companyName,
                    companyUrl,
                    role,
                    tone,
                    app.state.settings.senderName
                );
                ui.tempGeneratedPitch = pitchData;
                ui.renderPitchOutput(pitchData);
            }
        };

        runPitch();
    },

    /**
     * Render Pitch outputs inside the tabbed box layout
     */
    renderPitchOutput: function(pitchData) {
        document.getElementById('pitch-results-container').style.display = 'block';

        // Set email fields
        document.getElementById('pitch-email-to').textContent = pitchData.contactEmail;
        document.getElementById('pitch-email-subj').value = pitchData.emailSubject;
        document.getElementById('pitch-email-body').value = pitchData.emailBody;

        // Set linkedin note
        document.getElementById('pitch-linkedin-body').textContent = pitchData.linkedinMessage;

        // Set follow up fields
        document.getElementById('pitch-followup-subj').value = pitchData.followupSubject;
        document.getElementById('pitch-followup-body').value = pitchData.followupBody;

        // Switch to email tab by default
        this.switchPitchTab('email');

        // Setup Copy actions
        document.getElementById('copy-pitch-email-btn').onclick = () => {
            const subj = document.getElementById('pitch-email-subj').value;
            const body = document.getElementById('pitch-email-body').value;
            navigator.clipboard.writeText(`Oggetto: ${subj}\n\n${body}`).then(() => this.showBtnSuccess('copy-pitch-email-btn'));
        };

        document.getElementById('copy-pitch-linkedin-btn').onclick = () => {
            const body = document.getElementById('pitch-linkedin-body').textContent;
            navigator.clipboard.writeText(body).then(() => this.showBtnSuccess('copy-pitch-linkedin-btn'));
        };

        document.getElementById('copy-pitch-followup-btn').onclick = () => {
            const subj = document.getElementById('pitch-followup-subj').value;
            const body = document.getElementById('pitch-followup-body').value;
            navigator.clipboard.writeText(`Oggetto: ${subj}\n\n${body}`).then(() => this.showBtnSuccess('copy-pitch-followup-btn'));
        };

        // Wire 1-Click Email send launcher (mailto)
        document.getElementById('send-pitch-email-btn').onclick = () => {
            const to = pitchData.contactEmail;
            const subj = encodeURIComponent(document.getElementById('pitch-email-subj').value);
            const body = encodeURIComponent(document.getElementById('pitch-email-body').value);
            window.open(`mailto:${to}?subject=${subj}&body=${body}`, '_self');
            
            // Auto add to CRM if sent and not saved yet
            this.autoSaveToCRM('Pitch Inviato');
        };

        // Save to CRM Button wire
        const saveBtn = document.getElementById('save-application-btn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span class="material-symbols-outlined">save</span><span>Salva Candidatura nel Tracker</span>`;
        saveBtn.onclick = () => {
            this.autoSaveToCRM('Da Contattare');
        };
    },

    /**
     * Save the temporary generated pitch application into CRM state
     */
    autoSaveToCRM: function(status) {
        if (!ui.tempGeneratedPitch) return;

        // Check if company already registered to avoid duplicates
        const existing = app.state.leads.find(a => a.companyName.toLowerCase() === ui.tempGeneratedPitch.companyName.toLowerCase());
        if (existing) {
            existing.status = status;
            app.saveLeads();
            alert(`Candidatura aggiornata per ${ui.tempGeneratedPitch.companyName} con stato "${status}"!`);
            return;
        }

        const newApp = {
            ...ui.tempGeneratedPitch,
            id: `app_${Date.now()}`,
            status: status
        };

        // Save into global app state leads
        app.state.leads.unshift(newApp);
        app.saveLeads();
        
        // Show success visual state
        const saveBtn = document.getElementById('save-application-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined">check_circle</span><span>Salvata!</span>`;
        
        alert(`Candidatura per ${newApp.companyName} salvata correttamente nel Tracker!`);
    },

    /**
     * Visual toggle between pitch channels (Email, LinkedIn, Follow-up)
     */
    switchPitchTab: function(tabName) {
        // Toggle tab header buttons
        document.querySelectorAll('.pitch-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.pitch-tab-btn[data-tab="${tabName}"]`).classList.add('active');

        // Toggle text boxes
        document.querySelectorAll('.pitch-output-box').forEach(box => {
            box.classList.remove('active');
        });
        document.getElementById(`pitch-output-${tabName}`).classList.add('active');
    },

    /**
     * Visual indicator of successful clipboard copy
     */
    showBtnSuccess: function(btnId) {
        const btn = document.getElementById(btnId);
        const prev = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span><span>Copiato!</span>`;
        setTimeout(() => { btn.innerHTML = prev; }, 1500);
    },

    /**
     * Opens modal displaying full Outreach Pitches for an existing application in the Tracker (CRM)
     */
    openApplicationModal: function(appId) {
        const appItem = app.state.leads.find(a => a.id === appId);
        if (!appItem) return;

        this.selectedApplicationId = appId;

        document.getElementById('modal-view-company').textContent = appItem.companyName;
        document.getElementById('modal-view-role').textContent = `${appItem.role} - Tono: ${appItem.tone}`;

        // Set inputs
        document.getElementById('modal-email-to-lbl').textContent = appItem.contactEmail;
        document.getElementById('modal-email-subj-input').value = appItem.emailSubject;
        document.getElementById('modal-email-body-textarea').value = appItem.emailBody;

        document.getElementById('modal-linkedin-body-textarea').textContent = appItem.linkedinMessage;

        document.getElementById('modal-followup-subj-input').value = appItem.followupSubject;
        document.getElementById('modal-followup-body-textarea').value = appItem.followupBody;

        // Reset visible tab to email
        this.switchModalTab('email');

        // Copy events
        document.getElementById('modal-copy-email-btn').onclick = () => {
            const subj = document.getElementById('modal-email-subj-input').value;
            const body = document.getElementById('modal-email-body-textarea').value;
            navigator.clipboard.writeText(`Oggetto: ${subj}\n\n${body}`).then(() => this.showBtnSuccess('modal-copy-email-btn'));
        };

        document.getElementById('modal-copy-linkedin-btn').onclick = () => {
            const body = document.getElementById('modal-linkedin-body-textarea').textContent;
            navigator.clipboard.writeText(body).then(() => this.showBtnSuccess('modal-copy-linkedin-btn'));
        };

        document.getElementById('modal-copy-followup-btn').onclick = () => {
            const subj = document.getElementById('modal-followup-subj-input').value;
            const body = document.getElementById('modal-followup-body-textarea').value;
            navigator.clipboard.writeText(`Oggetto: ${subj}\n\n${body}`).then(() => this.showBtnSuccess('modal-copy-followup-btn'));
        };

        // Mailto sender
        document.getElementById('modal-send-email-btn').onclick = () => {
            const to = appItem.contactEmail;
            const subj = encodeURIComponent(document.getElementById('modal-email-subj-input').value);
            const body = encodeURIComponent(document.getElementById('modal-email-body-textarea').value);
            window.open(`mailto:${to}?subject=${subj}&body=${body}`, '_self');

            this.changeStatus(appId, 'Pitch Inviato');
            this.closeModal('modal-application-details');
        };

        this.openModal('modal-application-details');
    },

    /**
     * Switch sub-tabs inside details modal
     */
    switchModalTab: function(tabName) {
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.modal-tab-btn[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.modal-pitch-output').forEach(box => {
            box.classList.remove('active');
        });
        document.getElementById(`modal-output-${tabName}`).classList.add('active');
    },

    /**
     * Dropdown selector hook for updating application status
     */
    changeStatus: function(appId, newStatus) {
        const appItem = app.state.leads.find(a => a.id === appId);
        if (appItem) {
            appItem.status = newStatus;
            app.saveLeads();
            app.renderViewData(app.state.activeView);
        }
    },

    /**
     * Action to remove a single application from storage tracker
     */
    deleteApplication: function(appId) {
        if (confirm("Sei sicuro di voler eliminare questa candidatura dal tracker?")) {
            app.state.leads = app.state.leads.filter(a => a.id !== appId);
            app.saveLeads();
            app.renderViewData(app.state.activeView);
        }
    },

    /* Modal Overlay Controllers */
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    },

    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 200);
        }
    },

    /* ─── CV BUILDER MODAL ─────────────────────────────────────────────── */

    // Stores last roast result so CV Builder can access optimized content
    _lastRoastResult: null,

    openCVBuilderModal: function() {
        const cvText = document.getElementById('roast-cv-text').value;
        if (!cvText || cvText.trim() === '') {
            alert('Nessun testo CV trovato. Carica il CV prima di procedere.');
            return;
        }

        // Cache the optimized content from the last roast result
        const optimizedSummary = document.getElementById('roast-optimized-summary')?.textContent?.trim() || '';
        const bulletEls = document.querySelectorAll('#roast-optimized-bullets li');
        const optimizedBullets = Array.from(bulletEls).map(li => li.textContent.trim());

        this._cvBuilderState = {
            cvText,
            optimizedSummary,
            optimizedBullets,
            currentTemplate: 'professional',
            currentLang: 'it'
        };

        this._renderCVPreview();
        this.openModal('modal-cv-builder');
        this._setupCVBuilderListeners();
    },

    _renderCVPreview: function() {
        const state = this._cvBuilderState;
        if (!state || typeof cvBuilder === 'undefined') return;

        const html = cvBuilder.buildCV(
            state.cvText,
            state.currentTemplate,
            state.currentLang,
            state.optimizedSummary,
            state.optimizedBullets
        );

        const preview = document.getElementById('cv-template-preview');
        if (preview) preview.innerHTML = html;
    },

    _setupCVBuilderListeners: function() {
        const self = this;

        // Template buttons
        document.querySelectorAll('.cv-tpl-btn').forEach(btn => {
            btn.onclick = function() {
                document.querySelectorAll('.cv-tpl-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                self._cvBuilderState.currentTemplate = this.getAttribute('data-tpl');
                self._renderCVPreview();
            };
        });

        // Language select
        const langSelect = document.getElementById('cv-lang-select');
        if (langSelect) {
            langSelect.onchange = function() {
                self._cvBuilderState.currentLang = this.value;
                self._renderCVPreview();
            };
        }

        // Print / PDF button
        const printBtn = document.getElementById('cv-print-btn');
        if (printBtn) {
            printBtn.onclick = function() {
                // Create a hidden print root div
                let printRoot = document.getElementById('cv-print-root');
                if (!printRoot) {
                    printRoot = document.createElement('div');
                    printRoot.id = 'cv-print-root';
                    printRoot.style.display = 'none';
                    document.body.appendChild(printRoot);
                }
                const preview = document.getElementById('cv-template-preview');
                printRoot.innerHTML = preview ? preview.innerHTML : '';
                printRoot.style.display = 'block';
                window.print();
                setTimeout(() => { printRoot.style.display = 'none'; }, 1000);
            };
        }

        // Copy plain text button
        const copyBtn = document.getElementById('cv-copy-text-btn');
        if (copyBtn) {
            copyBtn.onclick = function() {
                const preview = document.getElementById('cv-template-preview');
                if (!preview) return;
                const text = preview.innerText || preview.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const prev = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:15px;">check_circle</span><span>Copiato!</span>`;
                    setTimeout(() => { copyBtn.innerHTML = prev; }, 1800);
                });
            };
        }
    },

    /* ─── JOB OFFERS MODAL ─────────────────────────────────────────────── */

    openJobOffersModal: function() {
        const cvText = document.getElementById('roast-cv-text').value;
        this._jobSearchState = {
            cvText,
            keywords: typeof cvBuilder !== 'undefined' ? cvBuilder.extractCvData(cvText).skills : [],
            role: ''
        };

        // Pre-fill role from settings if available
        const role = app?.state?.settings?.senderRole || '';
        const roleInput = document.getElementById('job-search-role');
        if (roleInput && role) roleInput.value = role;

        this.openModal('modal-job-offers');
        this._setupJobSearchListeners();

        // Auto-search immediately
        this._runJobSearch();
    },

    _setupJobSearchListeners: function() {
        const self = this;
            const goBtn = document.getElementById('job-search-go-btn');
        if (goBtn) {
            goBtn.onclick = function() { self._runJobSearch(); };
        }

        const roleInput = document.getElementById('job-search-role');
        if (roleInput) {
            roleInput.onkeydown = function(e) {
                if (e.key === 'Enter') self._runJobSearch();
            };
        }
    },

    _runJobSearch: async function() {
        const grid = document.getElementById('job-offers-grid');
        const loading = document.getElementById('job-offers-loading');
        const roleInput = document.getElementById('job-search-role');
        const langSelect = document.getElementById('job-search-lang');
        const typeSelect = document.getElementById('job-search-type');

        if (!grid) return;

        const role = roleInput ? roleInput.value.trim() : '';
        const lang = langSelect ? langSelect.value : 'it';
        const workplaceType = typeSelect ? typeSelect.value : 'all';
        const keywords = (this._jobSearchState?.keywords || []);

        // Show loading
        if (loading) loading.style.display = 'block';
        grid.innerHTML = '';

        try {
            const offers = await jobSearch.fetchJobOffers(keywords, role, lang, workplaceType);
            if (loading) loading.style.display = 'none';
            this._renderJobCards(offers, grid);
        } catch (err) {
            console.error("Fetch job offers failed, running mock:", err);
            if (loading) loading.style.display = 'none';
            const fallback = jobSearch.getMockOffers(keywords, role, lang, workplaceType);
            this._renderJobCards(fallback.cards, grid);
        }
    },

    _renderJobCards: function(offers, container) {
        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--text-muted);">
                    <span class="material-symbols-outlined" style="font-size:36px;display:block;margin-bottom:12px;">search_off</span>
                    Nessuna offerta trovata. Prova con un ruolo diverso.
                </div>`;
            return;
        }

        const sourceLabel = offers[0]?.source === 'adzuna'
            ? '<span style="font-size:11px;color:var(--color-success);margin-left:8px;">🌐 Live Adzuna API</span>'
            : offers[0]?.source === 'remotive'
            ? '<span style="font-size:11px;color:var(--color-info);margin-left:8px;">🌐 Live Remotive API</span>'
            : '<span style="font-size:11px;color:var(--text-muted);margin-left:8px;">📋 Offerte curate</span>';

        // Update modal subtitle with source info
        const subtitle = document.querySelector('#modal-job-offers .text-xs.text-muted');
        if (subtitle) subtitle.innerHTML = `Risultati basati sulle tue competenze. ${sourceLabel}`;

        container.innerHTML = offers.map(offer => {
            const matchClass = offer.matchScore >= 75 ? 'high' : offer.matchScore >= 50 ? 'medium' : 'low';
            const tagsHtml = (offer.tags || []).map(t => `<span class="job-tag">${t}</span>`).join('');
            const daysAgo = offer.postedDaysAgo === 0 ? 'Oggi' :
                            offer.postedDaysAgo === 1 ? 'Ieri' :
                            `${offer.postedDaysAgo}g fa`;

            const portalLinksHtml = (offer.portalLinks || []).map(p => `
                <a href="${p.url}" target="_blank" rel="noopener noreferrer" 
                   style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#fff;background:${p.color};padding:3px 8px;border-radius:4px;text-decoration:none;font-weight:600;transition:opacity 0.2s;"
                   onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"
                   title="Cerca questo ruolo su ${p.name}">
                    <span>${p.name}</span>
                </a>
            `).join('');

            const matchReasoningHtml = offer.reasoning ? `
            <div class="job-match-reasoning" style="margin-top: 10px; padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; border-left: 3px solid ${offer.matchScore >= 75 ? 'var(--color-success)' : offer.matchScore >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'}; font-size: 12px; line-height: 1.45;">
                <div style="font-weight:600;margin-bottom:4px;color:var(--text-main);display:flex;align-items:center;gap:4px;">
                    <span class="material-symbols-outlined" style="font-size:14px;color:var(--color-primary);">psychology</span>
                    <span>Corrispondenza Candidato AI:</span>
                </div>
                <div style="color:var(--text-muted);">${offer.reasoning}</div>
                ${offer.missingSkills && offer.missingSkills.length > 0 ? `
                <div style="margin-top:6px;font-size:11px;color:#f87171;font-weight:500;">
                    <strong>Competenze mancanti raccomandate:</strong> ${offer.missingSkills.join(', ')}
                </div>` : ''}
            </div>` : '';

            return `
            <div class="job-card" style="display:flex;flex-direction:column;justify-content:space-between;min-height:260px;">
                <div>
                    <div class="job-card-header" style="align-items:flex-start;">
                        <div class="job-card-title" style="font-size:14.5px;line-height:1.3;max-width:80%;">${offer.title}</div>
                        <span class="job-match-badge ${matchClass}" style="flex-shrink:0;">${offer.matchScore}% match</span>
                    </div>
                    <div class="job-card-company" style="margin-top:4px;margin-bottom:8px;">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:2px;">business</span>
                        ${offer.company} · ${offer.location}
                    </div>
                    <div class="job-card-tags" style="margin-bottom:8px;">${tagsHtml}</div>
                    
                    ${matchReasoningHtml}
                </div>
                
                <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border-color);">
                    <div style="margin-bottom:8px;display:flex;flex-direction:column;gap:4px;">
                        <span style="font-size:9.5px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;">Cerca questo ruolo negli aggregatori:</span>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">
                            ${portalLinksHtml}
                        </div>
                    </div>
                    <div class="job-card-footer" style="margin-top:8px;padding-top:0;border:none;">
                        <span class="job-salary" style="font-weight:600;color:var(--color-success);">${offer.salary || 'Contratto reale'}</span>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span class="job-age">${daysAgo}</span>
                            <a href="${offer.url}" target="_blank" rel="noopener noreferrer"
                               class="btn btn-primary" style="padding:5px 12px;font-size:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                                <span class="material-symbols-outlined" style="font-size:14px;">open_in_new</span>
                                <span>Candidati</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // ─── NEW DASHBOARD JOB SEARCH & MATCHING INTEGRATION ────────────────────────

    /**
     * Updates CV Loaded/Empty status panel on Dashboard
     */
    updateCvStatus: function() {
        const cvText = app?.state?.settings?.cvText || '';
        const badge = document.getElementById('dashboard-cv-badge');
        const emptyBox = document.getElementById('dashboard-cv-empty');
        const loadedBox = document.getElementById('dashboard-cv-loaded');
        const skillsContainer = document.getElementById('dashboard-cv-skills');
        const nameLabel = document.getElementById('dashboard-cv-name');

        if (!badge) return; // Guard: page not initialized or current view isn't dashboard

        if (cvText.trim() !== '') {
            badge.className = 'tag';
            badge.style.background = 'var(--color-success-bg)';
            badge.style.color = 'var(--color-success)';
            badge.textContent = 'CV Attivo';

            if (emptyBox) emptyBox.style.display = 'none';
            if (loadedBox) loadedBox.style.display = 'block';

            // Extract skills using cvBuilder
            const cvData = cvBuilder.extractCvData(cvText);
            
            // Set filename display
            if (nameLabel) {
                const storedName = localStorage.getItem('cv_filename') || 'curriculum.pdf';
                nameLabel.textContent = storedName;
            }

            // Render skills as interactive tags
            if (skillsContainer) {
                skillsContainer.innerHTML = (cvData.skills || []).map(s => 
                    `<span class="job-tag" style="background:var(--color-primary-glow);color:var(--color-primary);border-color:rgba(139,92,246,0.3);font-weight:600;cursor:pointer;user-select:none;transition:var(--transition-fast);" onclick="ui.toggleSearchSkill('${s}')" title="Clicca per aggiungere/rimuovere dalla ricerca">${s}</span>`
                ).join('');
            }

            // Render search chips
            this.renderDashboardSearchChips(cvData);
        } else {
            badge.className = 'tag';
            badge.style.background = 'var(--color-danger-bg)';
            badge.style.color = 'var(--color-danger)';
            badge.textContent = 'Nessun CV';

            if (emptyBox) emptyBox.style.display = 'block';
            if (loadedBox) loadedBox.style.display = 'none';

            // Clear search chips
            const container = document.getElementById('dashboard-search-chips');
            if (container) container.innerHTML = '';
        }
    },

    /**
     * Renders recommended search chips under search input on Dashboard
     */
    renderDashboardSearchChips: function(cvData) {
        const container = document.getElementById('dashboard-search-chips');
        if (!container) return;
        container.innerHTML = '';

        if (!cvData) return;

        // Build list of suggestions: CV role first, then first 4 skills
        const suggestions = [];
        if (cvData.role && cvData.role.trim() !== '') {
            suggestions.push({ text: cvData.role.trim(), label: `🔍 ${cvData.role.trim()}` });
        }
        (cvData.skills || []).slice(0, 4).forEach(s => {
            suggestions.push({ text: s, label: `✨ ${s}` });
        });

        if (suggestions.length === 0) return;

        // Add a small label before the chips
        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'Ricerche consigliate: ';
        titleSpan.style.cssText = 'font-size:11px;color:var(--text-muted);display:flex;align-items:center;margin-right:4px;margin-bottom:6px;';
        container.appendChild(titleSpan);

        suggestions.forEach(item => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'dashboard-chip';
            chip.style.cssText = 'background:rgba(99,102,241,0.08);color:var(--color-primary);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:3px 10px;font-size:11.5px;font-weight:500;cursor:pointer;transition:all 0.15s;margin-bottom:6px;margin-right:6px;outline:none;';
            chip.textContent = item.label;
            
            // Hover effect
            chip.onmouseover = () => {
                chip.style.background = 'rgba(99,102,241,0.16)';
                chip.style.borderColor = 'var(--color-primary)';
            };
            chip.onmouseout = () => {
                chip.style.background = 'rgba(99,102,241,0.08)';
                chip.style.borderColor = 'rgba(99,102,241,0.15)';
            };

            chip.onclick = () => {
                const roleInput = document.getElementById('dashboard-search-role');
                if (roleInput) {
                    roleInput.value = item.text;
                    this.runDashboardSearch();
                }
            };
            container.appendChild(chip);
        });
    },

    /**
     * Toggle a skill name inside the search input
     */
    toggleSearchSkill: function(skill) {
        const roleInput = document.getElementById('dashboard-search-role');
        if (!roleInput) return;
        const current = roleInput.value.trim();
        
        if (current.toLowerCase().includes(skill.toLowerCase())) {
            // Remove the skill name
            const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`(?:,\\s*)?\\b${escapedSkill}\\b`, 'gi');
            let updated = current.replace(regex, '').trim();
            if (updated.startsWith(',')) updated = updated.substring(1).trim();
            roleInput.value = updated;
        } else {
            // Append the skill name
            roleInput.value = current ? `${current}, ${skill}` : skill;
        }
    },

    /**
     * Initialize dashboard search fields, buttons, and listeners
     */
    initDashboardSearch: function() {
        const self = this;
        
        // Only run once per session/load
        if (this._dashboardSearchInitialized) {
            // Just sync search input role if empty
            const roleInput = document.getElementById('dashboard-search-role');
            if (roleInput && roleInput.value.trim() === '') {
                roleInput.value = app.state.settings.senderRole || '';
            }
            return;
        }

        const goBtn = document.getElementById('dashboard-search-go-btn');
        if (goBtn) {
            goBtn.onclick = function() { self.runDashboardSearch(); };
        }

        const roleInput = document.getElementById('dashboard-search-role');
        if (roleInput) {
            roleInput.value = app.state.settings.senderRole || '';
            roleInput.onkeydown = function(e) {
                if (e.key === 'Enter') self.runDashboardSearch();
            };
        }

        const removeCvBtn = document.getElementById('dashboard-remove-cv-btn');
        if (removeCvBtn) {
            removeCvBtn.onclick = function() {
                app.resetFileUploader();
            };
        }

        this._dashboardSearchInitialized = true;
    },

    /**
     * Executes the live job search from dashboard
     */
    runDashboardSearch: async function() {
        const listContainer = document.getElementById('dashboard-jobs-list');
        const loading = document.getElementById('dashboard-jobs-loading');
        const roleInput = document.getElementById('dashboard-search-role');
        const typeSelect = document.getElementById('dashboard-search-type');
        const langSelect = document.getElementById('dashboard-search-lang');
        const countBadge = document.getElementById('dashboard-results-count');

        if (!listContainer) return;

        const role = roleInput ? roleInput.value.trim() : '';
        const lang = langSelect ? langSelect.value : 'it';
        const workplaceType = typeSelect ? typeSelect.value : 'all';

        const cvText = app?.state?.settings?.cvText || '';
        const keywords = cvText ? cvBuilder.extractCvData(cvText).skills : [];

        // Clear inspector selection and show placeholder
        const inspectorDetails = document.getElementById('inspector-details');
        const inspectorPlaceholder = document.getElementById('inspector-placeholder');
        if (inspectorDetails) inspectorDetails.style.display = 'none';
        if (inspectorPlaceholder) inspectorPlaceholder.style.display = 'flex';

        // Show loading state
        if (loading) loading.style.display = 'block';
        listContainer.innerHTML = '';
        if (countBadge) countBadge.textContent = 'Ricerca...';

        try {
            const offers = await jobSearch.fetchJobOffers(keywords, role, lang, workplaceType);
            if (loading) loading.style.display = 'none';
            if (countBadge) countBadge.textContent = `${offers.length} Annunci`;
            this.renderDashboardJobCards(offers, listContainer);
        } catch (err) {
            console.error("Job search failed, running mock:", err);
            if (loading) loading.style.display = 'none';
            const fallback = jobSearch.getMockOffers(keywords, role, lang, workplaceType);
            if (countBadge) countBadge.textContent = `${fallback.cards.length} Annunci`;
            this.renderDashboardJobCards(fallback.cards, listContainer);
        }
    },

    /**
     * Renders job cards in the left column
     */
    renderDashboardJobCards: function(offers, container) {
        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 0;color:var(--text-muted);margin:auto;">
                    <span class="material-symbols-outlined" style="font-size:36px;display:block;margin-bottom:12px;">search_off</span>
                    Nessuna offerta trovata.
                </div>`;
            return;
        }

        container.innerHTML = offers.map((offer, idx) => {
            const matchClass = offer.matchScore >= 75 ? 'high' : offer.matchScore >= 50 ? 'medium' : 'low';
            
            // Map location and format workplace tags
            const displayTags = [];
            if (offer.tags && offer.tags[0]) displayTags.push(offer.tags[0]);
            
            // Check if remote or hybrid from location/title
            const lowerTitle = offer.title.toLowerCase();
            const lowerLoc = offer.location.toLowerCase();
            if (lowerTitle.includes('remote') || lowerTitle.includes('remoto') || lowerTitle.includes('smart working') || lowerLoc.includes('remote')) {
                displayTags.push('Remoto 🏠');
            } else if (lowerTitle.includes('hybrid') || lowerTitle.includes('ibrido') || lowerLoc.includes('hybrid') || lowerLoc.includes('ibrido')) {
                displayTags.push('Ibrido 🏢');
            }

            const tagsHtml = displayTags.map(t => `<span class="job-tag">${t}</span>`).join('');
            const daysAgo = offer.postedDaysAgo === 0 ? 'Oggi' :
                            offer.postedDaysAgo === 1 ? 'Ieri' :
                            `${offer.postedDaysAgo}g fa`;

            const offerEscaped = encodeURIComponent(JSON.stringify(offer));

            return `
                <div class="job-card" data-index="${idx}" data-offer="${offerEscaped}" style="cursor:pointer;padding:14px 16px;min-height:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:4px;" onclick="ui.selectDashboardJob(this)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                        <div style="font-family:var(--font-heading);font-size:13.5px;font-weight:700;color:var(--text-main);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:75%;" title="${offer.title}">${offer.title}</div>
                        <span class="job-match-badge ${matchClass}" style="font-size:10px;padding:2px 6px;">${offer.matchScore}% match</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle;">business</span>
                        <span>${offer.company} · ${offer.location}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:11px;">
                        <div style="display:flex;gap:4px;">${tagsHtml}</div>
                        <span style="color:var(--text-muted);font-weight:500;">${daysAgo}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Auto-select the first job to show results immediately
        const firstCard = container.querySelector('.job-card');
        if (firstCard) {
            firstCard.click();
        }
    },

    /**
     * Card click handler: Highlights active card and loads details into inspector
     */
    selectDashboardJob: function(card) {
        // Reset styles for all sibling cards
        const cards = document.querySelectorAll('#dashboard-jobs-list .job-card');
        cards.forEach(c => {
            c.style.borderColor = 'var(--border-color)';
            c.style.boxShadow = 'none';
        });

        // Apply visual active state (glow + border color)
        card.style.borderColor = 'var(--color-primary)';
        card.style.boxShadow = '0 0 12px var(--color-primary-glow)';

        // Parse and inspect the job offer
        try {
            const offer = JSON.parse(decodeURIComponent(card.dataset.offer));
            this.inspectJob(offer);
        } catch (e) {
            console.error("Error parsing offer dataset:", e);
        }
    },

    /**
     * Inspects a job card, filling the right side detail panel and running AI analysis
     */
    inspectJob: function(offer) {
        const detailsPanel = document.getElementById('inspector-details');
        const placeholderPanel = document.getElementById('inspector-placeholder');

        if (!detailsPanel || !placeholderPanel) return;

        // Transition layouts
        placeholderPanel.style.display = 'none';
        detailsPanel.style.display = 'flex';

        // Render job specifics
        document.getElementById('inspect-job-title').textContent = offer.title;
        document.getElementById('inspect-job-company').querySelector('span').textContent = `${offer.company} · ${offer.location}`;
        document.getElementById('inspect-job-description').textContent = offer.description || "Nessun dettaglio aggiuntivo fornito.";

        // Set up Candidate URL
        const applyLink = document.getElementById('inspect-apply-link');
        if (applyLink) {
            applyLink.href = offer.url || '#';
        }

        // Set up Match score badge & progress bar
        const scoreBadge = document.getElementById('inspect-match-badge');
        const scoreText = document.getElementById('inspect-score-text');
        const scoreBar = document.getElementById('inspect-score-bar');

        const score = offer.matchScore || 50;
        const matchClass = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

        if (scoreBadge) {
            scoreBadge.className = `job-match-badge ${matchClass}`;
            scoreBadge.textContent = `${score}% Match`;
        }
        if (scoreText) scoreText.textContent = `${score}%`;
        if (scoreBar) scoreBar.style.width = `${score}%`;

        // Render AI reasoning evaluation block
        const reasoningLabel = document.getElementById('inspect-match-reasoning');
        if (reasoningLabel) {
            reasoningLabel.textContent = offer.reasoning || "Analisi dell'Intelligenza Artificiale non disponibile.";
        }

        // Render skills matched (in green tags)
        const matchedContainer = document.getElementById('inspect-skills-matched');
        if (matchedContainer) {
            // Find matches from CV (approximate)
            const cvText = app?.state?.settings?.cvText || '';
            const cvData = cvText ? cvBuilder.extractCvData(cvText) : { skills: [] };
            const detectedMatches = (cvData.skills || []).filter(s => 
                offer.title.toLowerCase().includes(s.toLowerCase()) || 
                (offer.description && offer.description.toLowerCase().includes(s.toLowerCase())) ||
                (offer.tags && offer.tags.some(t => t.toLowerCase() === s.toLowerCase()))
            );
            
            // Fallback to tags if no direct matches found
            const matchTags = detectedMatches.length > 0 ? detectedMatches : (offer.tags || []).slice(0, 4);

            if (matchTags.length === 0) {
                matchedContainer.innerHTML = `<span style="font-size:11px;color:var(--text-muted);">Nessuna skill rilevata</span>`;
            } else {
                matchedContainer.innerHTML = matchTags.map(s => 
                    `<span class="job-tag" style="background:rgba(16,185,129,0.1);color:var(--color-success);border-color:rgba(16,185,129,0.2);font-weight:600;">${s}</span>`
                ).join('');
            }
        }

        // Render missing skills (in red tags)
        const missingContainer = document.getElementById('inspect-skills-missing');
        if (missingContainer) {
            const missing = offer.missingSkills || [];
            if (missing.length === 0) {
                missingContainer.innerHTML = `<span style="font-size:11px;color:var(--color-success);font-weight:600;">Profilo completo! 🎉</span>`;
            } else {
                missingContainer.innerHTML = missing.map(s => 
                    `<span class="job-tag" style="background:rgba(239,68,68,0.1);color:var(--color-danger);border-color:rgba(239,68,68,0.2);font-weight:600;">${s}</span>`
                ).join('');
            }
        }

        // Render tailored suggestions
        const suggestionsBox = document.getElementById('inspect-tailor-suggestions');
        if (suggestionsBox) {
            const missing = offer.missingSkills || [];
            if (missing.length > 0) {
                suggestionsBox.innerHTML = `Per aumentare la tua compatibilità, considera di inserire nel tuo curriculum o descrivere progetti legati a: <strong>${missing.join(', ')}</strong>. Fai risaltare la tua attinenza con il ruolo di <strong>${offer.title}</strong> nella sezione descrittiva.`;
            } else {
                suggestionsBox.innerHTML = `Il tuo profilo coincide perfettamente con i requisiti del ruolo. Assicurati di menzionare la tua esperienza diretta con le tecnologie indicate nel colloquio.`;
            }
        }

        // Wire Action Buttons
        const pitchBtn = document.getElementById('inspect-pitch-btn');
        if (pitchBtn) {
            pitchBtn.onclick = function() {
                // Pre-fill pitch form
                document.getElementById('pitch-company-name').value = offer.company;
                document.getElementById('pitch-job-role').value = offer.title;
                const companyUrlInput = document.getElementById('pitch-company-url');
                if (companyUrlInput) companyUrlInput.value = offer.url || '';
                
                // Switch to Pitch Generator view
                app.switchView('campaigns');
            };
        }

        const saveBtn = document.getElementById('inspect-save-btn');
        if (saveBtn) {
            saveBtn.onclick = function() {
                // Check if already saved
                const exists = app.state.leads.some(a => a.companyName.toLowerCase() === offer.company.toLowerCase() && a.role.toLowerCase() === offer.title.toLowerCase());
                if (exists) {
                    alert(`Candidatura per ${offer.company} (${offer.title}) già presente nel Tracker.`);
                    return;
                }

                // Add to CRM
                const newLead = {
                    id: "app_" + Date.now(),
                    companyName: offer.company,
                    websiteUrl: offer.url || "https://google.com",
                    contactEmail: "recruiting@" + offer.company.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
                    role: offer.title,
                    tone: "Problem Solver",
                    emailSubject: `Candidatura - ${offer.title} - ${app?.state?.settings?.senderName || 'Candidato'}`,
                    emailBody: `Gentile Team,\n\nVorrei sottoporre la mia candidatura per il ruolo di ${offer.title} presso ${offer.company}.\n\nCordiali saluti,\n${app?.state?.settings?.senderName || 'Candidato'}`,
                    linkedinMessage: `Ciao, ho visto la vostra offerta per ${offer.title} e mi piacerebbe collegarmi!`,
                    followupSubject: `Seguito candidatura: ${offer.title}`,
                    followupBody: `Gentile Team, vorrei fare un breve riscontro sul mio profilo inviato pochi giorni fa.`,
                    status: "Da Contattare",
                    dateCreated: new Date().toLocaleDateString('it-IT')
                };

                app.state.leads.push(newLead);
                app.saveLeads();
                
            };
        }
    },

    // ==========================================
    // AGENTE AUTONOMO JOBSCOUT-AI STATE & LOGIC
    // ==========================================
    agentState: {
        intervalId: null,
        isActive: false,
        logs: [],
        matches: [],
        processedJobUrls: []
    },

    initAgent: function() {
        const startBtn = document.getElementById('agent-start-btn');
        const stopBtn = document.getElementById('agent-stop-btn');
        const clearBtn = document.getElementById('agent-clear-console-btn');

        if (startBtn) {
            startBtn.onclick = () => this.startAgent();
        }
        if (stopBtn) {
            stopBtn.onclick = () => this.stopAgent();
        }
        if (clearBtn) {
            clearBtn.onclick = () => this.clearAgentConsole();
        }

        // Restore active matches count in UI on init if any
        this.updateAgentMatchesCount();
    },

    syncAgentUI: function() {
        const startBtn = document.getElementById('agent-start-btn');
        const stopBtn = document.getElementById('agent-stop-btn');
        const statusIndicator = document.getElementById('agent-status-indicator');

        // Inputs
        const nameInput = document.getElementById('agent-name');
        const roleInput = document.getElementById('agent-role');
        const typeSelect = document.getElementById('agent-type');
        const freqSelect = document.getElementById('agent-frequency');
        const scoreInput = document.getElementById('agent-min-score');
        const actionSelect = document.getElementById('agent-action');

        if (this.agentState.isActive) {
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator emerald';
            }

            // Disable config
            if (nameInput) nameInput.disabled = true;
            if (roleInput) roleInput.disabled = true;
            if (typeSelect) typeSelect.disabled = true;
            if (freqSelect) freqSelect.disabled = true;
            if (scoreInput) scoreInput.disabled = true;
            if (actionSelect) actionSelect.disabled = true;
        } else {
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator yellow';
            }

            // Enable config
            if (nameInput) nameInput.disabled = false;
            if (roleInput) roleInput.disabled = false;
            if (typeSelect) typeSelect.disabled = false;
            if (freqSelect) freqSelect.disabled = false;
            if (scoreInput) scoreInput.disabled = false;
            if (actionSelect) actionSelect.disabled = false;
        }

        this.renderAgentLogs();
        this.renderAgentMatches();
        this.updateAgentMatchesCount();
    },

    logToAgentConsole: function(message, type = 'info') {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const logLine = `[${timeStr}] ${message}`;
        
        let color = '#a7f3d0'; // default emerald light
        if (type === 'success') color = '#34d399'; // bright green
        if (type === 'warn') color = '#fbbf24'; // amber yellow
        if (type === 'error') color = '#f87171'; // soft red

        const htmlLine = `<p style="color: ${color}; margin: 0; padding: 2px 0;">> ${logLine}</p>`;
        this.agentState.logs.push(htmlLine);

        // Keep last 150 lines to prevent overflow memory leak
        if (this.agentState.logs.length > 150) {
            this.agentState.logs.shift();
        }

        // Live append if element is visible
        const consoleEl = document.getElementById('agent-console-logs');
        if (consoleEl) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlLine;
            consoleEl.appendChild(tempDiv.firstChild);
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }
    },

    renderAgentLogs: function() {
        const consoleEl = document.getElementById('agent-console-logs');
        if (!consoleEl) return;

        if (this.agentState.logs.length === 0) {
            consoleEl.innerHTML = `<p style="color: var(--text-muted);">> Agente pronto. Configura i parametri e premi "Avvia Agente" per avviare il monitoraggio autonomo...</p>`;
            return;
        }

        consoleEl.innerHTML = this.agentState.logs.join('');
        consoleEl.scrollTop = consoleEl.scrollHeight;
    },

    clearAgentConsole: function() {
        this.agentState.logs = [];
        this.renderAgentLogs();
    },

    updateAgentMatchesCount: function() {
        const countBadge = document.getElementById('agent-matches-count');
        if (countBadge) {
            countBadge.textContent = `${this.agentState.matches.length} Trovati`;
        }
    },

    startAgent: function() {
        const agentRole = document.getElementById('agent-role')?.value.trim();
        const agentName = document.getElementById('agent-name')?.value.trim() || 'JobScout-AI';
        const agentType = document.getElementById('agent-type')?.value || 'remote';
        const frequency = parseInt(document.getElementById('agent-frequency')?.value) || 15000;
        const minScore = parseInt(document.getElementById('agent-min-score')?.value) || 75;
        const action = document.getElementById('agent-action')?.value || 'crm';

        if (!agentRole) {
            alert("Inserisci un ruolo o delle parole chiave target prima di avviare l'agente!");
            return;
        }

        // Try request notification permission
        if (action === 'notify' && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        this.agentState.isActive = true;
        this.logToAgentConsole(`🤖 Avvio dell'agente '${agentName}'...`, 'success');
        this.logToAgentConsole(`🎯 Ruolo target: ${agentRole}`, 'info');
        this.logToAgentConsole(`⚙️ Modalità: ${agentType} | Match minimo: ${minScore}%`, 'info');
        this.logToAgentConsole(`⏱️ Frequenza scansione: ogni ${frequency / 1000} secondi`, 'info');

        this.syncAgentUI();

        // Run immediately
        this.runAgentScanCycle(agentRole, agentType, minScore, action, frequency);

        // Schedule loop
        this.agentState.intervalId = setInterval(() => {
            this.runAgentScanCycle(agentRole, agentType, minScore, action, frequency);
        }, frequency);
    },

    stopAgent: function() {
        this.agentState.isActive = false;
        if (this.agentState.intervalId) {
            clearInterval(this.agentState.intervalId);
            this.agentState.intervalId = null;
        }
        this.logToAgentConsole("🛑 Agente arrestato dall'utente.", "warn");
        this.syncAgentUI();
    },

    runAgentScanCycle: async function(role, type, minScore, action, frequency) {
        if (!this.agentState.isActive) return;

        this.logToAgentConsole(`🔍 Avvio scansione delle offerte per: ${role}...`, 'info');

        const cvText = app?.state?.settings?.cvText || '';
        const cvData = cvText ? cvBuilder.extractCvData(cvText) : { skills: [] };
        const cvSkills = cvData.skills || [];

        if (!cvText) {
            this.logToAgentConsole("⚠️ Nessun CV impostato nelle Impostazioni. L'agente eseguirà comunque la ricerca con dati generici, ma il calcolo di match AI sarà limitato.", "warn");
        }

        try {
            // Log direct links for LinkedIn, Indeed, Glassdoor if enabled
            const useLinkedin = document.getElementById('agent-plat-linkedin') ? document.getElementById('agent-plat-linkedin').checked : true;
            const useIndeed = document.getElementById('agent-plat-indeed') ? document.getElementById('agent-plat-indeed').checked : true;
            const useGlassdoor = document.getElementById('agent-plat-glassdoor') ? document.getElementById('agent-plat-glassdoor').checked : true;

            if (useLinkedin) {
                const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}`;
                this.logToAgentConsole(`🔗 [LinkedIn] Cerca offerte dirette: <a href="${linkedinUrl}" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: bold;">Clicca qui <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle;">open_in_new</span></a>`, 'success');
            }
            if (useIndeed) {
                const indeedUrl = `https://it.indeed.com/jobs?q=${encodeURIComponent(role)}`;
                this.logToAgentConsole(`🔗 [Indeed] Cerca offerte dirette: <a href="${indeedUrl}" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: bold;">Clicca qui <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle;">open_in_new</span></a>`, 'success');
            }
            if (useGlassdoor) {
                const glassdoorUrl = `https://www.glassdoor.it/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}`;
                this.logToAgentConsole(`🔗 [Glassdoor] Cerca offerte dirette: <a href="${glassdoorUrl}" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: bold;">Clicca qui <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle;">open_in_new</span></a>`, 'success');
            }

            // Fetch jobs
            const offers = await jobSearch.fetchJobOffers(cvSkills, role, 'it', type);
            
            if (!this.agentState.isActive) return; // check if agent was stopped during fetch

            this.logToAgentConsole(`📋 Trovate ${offers.length} offerte di lavoro totali. Inizio filtraggio e calcolo match AI...`, 'info');

            let newMatchesInThisScan = 0;

            for (let offer of offers) {
                if (!this.agentState.isActive) return;

                const jobKey = `${offer.company}_${offer.title}`.toLowerCase();
                
                // Prevent duplicate processing
                if (this.agentState.processedJobUrls.includes(offer.url) || 
                    this.agentState.matches.some(m => `${m.company}_${m.title}`.toLowerCase() === jobKey)) {
                    continue;
                }

                // Add to processed
                this.agentState.processedJobUrls.push(offer.url);

                this.logToAgentConsole(`🧠 Analisi compatibilità per '${offer.title}' presso '${offer.company}'...`, 'info');
                
                const score = offer.matchScore || 50;

                if (score >= minScore) {
                    newMatchesInThisScan++;
                    this.logToAgentConsole(`✅ MATCH RILEVATO! [Score: ${score}%] '${offer.title}' presso '${offer.company}' coincide con le tue competenze!`, 'success');
                    
                    // Add to local matches list
                    this.agentState.matches.unshift(offer);

                    // Add to CRM if selected
                    if (action === 'crm') {
                        const existsInCrm = app.state.leads.some(l => 
                            l.companyName.toLowerCase() === offer.company.toLowerCase() && 
                            l.role.toLowerCase() === offer.title.toLowerCase()
                        );

                        if (!existsInCrm) {
                            const newLead = {
                                id: "app_" + Date.now(),
                                companyName: offer.company,
                                websiteUrl: offer.url || "https://google.com",
                                contactEmail: "recruiting@" + offer.company.toLowerCase().replace(/[^a-z0-9]/g, '') + ".it",
                                role: offer.title,
                                tone: "Problem Solver",
                                emailSubject: `Candidatura - ${offer.title} - ${app?.state?.settings?.senderName || 'Candidato'}`,
                                emailBody: `Gentile Team,\n\nVorrei sottoporre la mia candidatura per il ruolo di ${offer.title} presso ${offer.company}.\n\nCordiali saluti,\n${app?.state?.settings?.senderName || 'Candidato'}`,
                                linkedinMessage: `Ciao, ho visto la vostra offerta per ${offer.title} e mi piacerebbe collegarmi!`,
                                followupSubject: `Seguito candidatura: ${offer.title}`,
                                followupBody: `Gentile Team, vorrei fare un breve riscontro sul mio profilo inviato pochi giorni fa.`,
                                status: "Da Contattare",
                                dateCreated: new Date().toLocaleDateString('it-IT')
                            };

                            app.state.leads.push(newLead);
                            app.saveLeads();
                            this.logToAgentConsole(`💾 Candidatura aggiunta automaticamente nel CRM Tracker!`, 'success');
                        } else {
                            this.logToAgentConsole(`⚠️ Candidatura già presente nel CRM Tracker. Salto inserimento.`, 'info');
                        }
                    } else if (action === 'notify') {
                        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                            new Notification("Nuovo Match Lavoro!", {
                                body: `${offer.company} cerca: ${offer.title} (${score}% Match)`
                            });
                        } else {
                            this.logToAgentConsole(`🔔 NOTIFICA: Nuovo Match Trovato -> ${offer.company} - ${offer.title} (${score}% Match)`, 'success');
                        }
                    }
                } else {
                    this.logToAgentConsole(`❌ Match debole (${score}%). Saltato.`, 'info');
                }
            }

            this.logToAgentConsole(`💤 Scansione periodica completata. Trovati ${newMatchesInThisScan} nuovi match idonei. Prossima scansione tra ${frequency / 1000} secondi.`, 'success');
            
            // Re-render components
            this.renderAgentMatches();
            this.updateAgentMatchesCount();

        } catch (error) {
            this.logToAgentConsole(`⚠️ Errore durante il ciclo di scansione: ${error.message || error}`, 'error');
        }
    },

    renderAgentMatches: function() {
        const matchesContainer = document.getElementById('agent-matches-list');
        if (!matchesContainer) return;

        if (this.agentState.matches.length === 0) {
            matchesContainer.innerHTML = `
                <div style="text-align:center;padding:30px 10px;color:var(--text-muted);margin:auto;">
                    <span class="material-symbols-outlined" style="font-size:36px;margin-bottom:6px;color:var(--border-hover);">smart_toy</span>
                    <p style="font-size:12px;">Nessuna offerta rilevata finora. L'agente mostrerà qui i match idonei trovati durante la scansione.</p>
                </div>
            `;
            return;
        }

        matchesContainer.innerHTML = this.agentState.matches.map(offer => {
            const scoreClass = offer.matchScore >= 75 ? 'high' : offer.matchScore >= 50 ? 'medium' : 'low';
            const tagsHtml = offer.tags.slice(0, 3).map(tag => `<span class="job-tag">${tag}</span>`).join('');
            
            return `
                <div class="job-card" style="padding:12px;background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <h4 style="font-size:13px;font-weight:700;color:var(--text-main);margin:0;">${offer.title}</h4>
                            <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${offer.company} · ${offer.location}</div>
                        </div>
                        <span class="job-match-badge ${scoreClass}" style="font-size:10px;padding:3px 6px;">${offer.matchScore}% Match</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:2px 0;">
                        ${offer.reasoning}
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">${tagsHtml}</div>
                        <a href="${offer.url}" target="_blank" class="btn btn-outline" style="font-size:10px;padding:4px 8px;height:auto;line-height:1;margin:0;">
                            Candidati
                            <span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle;margin-left:2px;">open_in_new</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
};
