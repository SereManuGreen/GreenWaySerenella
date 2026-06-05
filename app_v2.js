/**
 * CV Roast & Pitch AI - Main App Controller & State Management
 */

// Set PDF.js worker location
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

const app = {
    // Application State
    state: {
        leads: [], // In our app, 'leads' represents active job applications in the CRM tracker
        activeView: 'dashboard',
        settings: {
            senderName: '',
            senderRole: '',
            senderBio: '',
            cvText: '',
            llmProvider: 'gemini',
            geminiApiKey: '',
            openRouterApiKey: '',
            openRouterModel: 'meta-llama/llama-3-8b-instruct:free',
            openRouterModelCustom: '',
            ollamaUrl: 'http://localhost:11434',
            ollamaModel: 'llama3',
            adzunaAppId: '',
            adzunaAppKey: '',
            userPlan: 'explorer'
        },
        theme: 'dark'
    },

    /**
     * Application Entry Point
     */
    init: function() {
        console.log("Initializing CV Roast & Pitch AI...");
        this.loadSettings();
        this.loadApplications();
        this.setupEventListeners();
        this.applyTheme();
        this.updateHeaderBadge();
        
        // Initialize Autonomous Agent
        if (typeof ui !== 'undefined' && ui.initAgent) {
            ui.initAgent();
        }
        
        // Initial view load
        this.switchView('dashboard');
    },

    /**
     * Load settings from localStorage
     */
    loadSettings: function() {
        const storedSettings = localStorage.getItem('cv_roast_settings');
        if (storedSettings) {
            try {
                this.state.settings = { ...this.state.settings, ...JSON.parse(storedSettings) };
            } catch (e) {
                console.error("Error loading settings:", e);
            }
        }
        
        // Pre-fill settings form fields
        document.getElementById('set-sender-name').value = this.state.settings.senderName || '';
        document.getElementById('set-sender-role').value = this.state.settings.senderRole || '';
        document.getElementById('set-sender-bio').value = this.state.settings.senderBio || '';
        document.getElementById('set-sender-cv').value = this.state.settings.cvText || '';
        document.getElementById('set-llm-provider').value = this.state.settings.llmProvider || 'gemini';
        document.getElementById('set-gemini-key').value = this.state.settings.geminiApiKey || '';
        document.getElementById('set-openrouter-key').value = this.state.settings.openRouterApiKey || '';
        document.getElementById('set-openrouter-model-select').value = this.state.settings.openRouterModel || 'meta-llama/llama-3-8b-instruct:free';
        document.getElementById('set-openrouter-model-custom').value = this.state.settings.openRouterModelCustom || '';
        document.getElementById('set-ollama-url').value = this.state.settings.ollamaUrl || 'http://localhost:11434';
        document.getElementById('set-ollama-model').value = this.state.settings.ollamaModel || 'llama3';
        document.getElementById('set-adzuna-id').value = this.state.settings.adzunaAppId || '';
        document.getElementById('set-adzuna-key').value = this.state.settings.adzunaAppKey || '';

        // Trigger container visibility based on provider selection
        this.toggleProviderSettingsVisibility(this.state.settings.llmProvider || 'gemini');
        this.toggleCustomModelVisibility(this.state.settings.openRouterModel || 'meta-llama/llama-3-8b-instruct:free');

        // Update premium plans UI
        this.updateUserPlanUI(this.state.settings.userPlan || 'explorer');
    },

    toggleProviderSettingsVisibility: function(provider) {
        const geminiContainer = document.getElementById('settings-gemini-container');
        const openrouterContainer = document.getElementById('settings-openrouter-container');
        const ollamaContainer = document.getElementById('settings-ollama-container');

        if (geminiContainer) geminiContainer.style.display = provider === 'gemini' ? 'block' : 'none';
        if (openrouterContainer) openrouterContainer.style.display = provider === 'openrouter' ? 'block' : 'none';
        if (ollamaContainer) ollamaContainer.style.display = provider === 'ollama' ? 'block' : 'none';
    },

    toggleCustomModelVisibility: function(model) {
        const customGroup = document.getElementById('custom-model-input-group');
        if (customGroup) {
            customGroup.style.display = model === 'custom' ? 'block' : 'none';
        }
    },

    /**
     * Save settings to localStorage
     */
    saveSettings: function(settingsObj) {
        this.state.settings = { ...this.state.settings, ...settingsObj };
        localStorage.setItem('cv_roast_settings', JSON.stringify(this.state.settings));
        this.updateHeaderBadge();
        
        // Sync the textarea values if visible
        const roastCVTextarea = document.getElementById('roast-cv-text');
        if (roastCVTextarea && settingsObj.cvText !== undefined) {
            roastCVTextarea.value = settingsObj.cvText;
        }
    },

    /**
     * Load applications list from localStorage (CRM Data)
     */
    loadApplications: function() {
        const storedLeads = localStorage.getItem('cv_roast_applications');
        if (storedLeads) {
            try {
                this.state.leads = JSON.parse(storedLeads);
            } catch (e) {
                console.error("Error loading applications:", e);
                this.state.leads = [];
            }
        } else {
            this.state.leads = [];
            this.saveLeads();
        }
    },

    /**
     * Save applications list to localStorage
     */
    saveLeads: function() {
        localStorage.setItem('cv_roast_applications', JSON.stringify(this.state.leads));
    },

    /**
     * Navigate between views
     */
    switchView: function(viewId) {
        // Deactivate old view
        const currentActiveView = document.querySelector('.app-view.active');
        if (currentActiveView) currentActiveView.classList.remove('active');
        
        const currentActiveNav = document.querySelector('.nav-item.active');
        if (currentActiveNav) currentActiveNav.classList.remove('active');

        // Activate new view
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) targetView.classList.add('active');

        const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (targetNav) targetNav.classList.add('active');

        this.state.activeView = viewId;

        // Perform view-specific renders
        this.renderViewData(viewId);
    },

    /**
     * Refresh view data dynamically when navigated to
     */
    renderViewData: function(viewId) {
        if (viewId === 'dashboard') {
            if (typeof ui !== 'undefined') {
                if (ui.updateCvStatus) ui.updateCvStatus();
                if (ui.initDashboardSearch) ui.initDashboardSearch();
            }
        } else if (viewId === 'crm') {
            ui.renderCRMTable(this.state.leads);
        } else if (viewId === 'roaster') {
            // Fill Roaster CV input with default CV text if empty
            const roastCVTextarea = document.getElementById('roast-cv-text');
            if (roastCVTextarea && roastCVTextarea.value.trim() === '') {
                roastCVTextarea.value = this.state.settings.cvText || '';
                
                // If there's text, show the badge indicating default loaded text
                if (this.state.settings.cvText && this.state.settings.cvText.trim() !== '') {
                    this.showLoadedFileBadge("CV dalle Impostazioni");
                }
            }
        } else if (viewId === 'agent') {
            if (typeof ui !== 'undefined' && ui.syncAgentUI) {
                ui.syncAgentUI();
            }
        }
    },

    /**
     * Show/Hide File uploader badges
     */
    showLoadedFileBadge: function(filename) {
        document.getElementById('cv-dropzone').style.display = 'none';
        document.getElementById('upload-progress-container').style.display = 'none';
        
        const badge = document.getElementById('cv-file-badge');
        badge.style.display = 'flex';
        document.getElementById('cv-file-badge-name').textContent = filename;
    },

    /**
     * Update header status indicator based on API setup
     */
    updateHeaderBadge: function() {
        const badge = document.getElementById('api-status-badge');
        const dot = badge.querySelector('.status-indicator');
        const text = badge.querySelector('.badge-text');
        
        const provider = this.state.settings.llmProvider || 'gemini';
        const hasGemini = this.state.settings.geminiApiKey && this.state.settings.geminiApiKey.trim() !== '';
        const hasOpenRouter = this.state.settings.openRouterApiKey && this.state.settings.openRouterApiKey.trim() !== '';

        if (provider === 'gemini' && hasGemini) {
            dot.className = 'status-indicator emerald';
            text.textContent = 'API Gemini Attiva';
        } else if (provider === 'openrouter' && hasOpenRouter) {
            dot.className = 'status-indicator emerald';
            const modelLabel = this.state.settings.openRouterModel === 'custom' ? 'Custom' : this.state.settings.openRouterModel.split('/').pop().split(':')[0];
            text.textContent = `OpenRouter: ${modelLabel}`;
        } else if (provider === 'ollama') {
            dot.className = 'status-indicator emerald';
            text.textContent = `Ollama: ${this.state.settings.ollamaModel || 'llama3'}`;
        } else {
            dot.className = 'status-indicator yellow';
            text.textContent = 'Modalità Smart Mock';
        }
    },

    /**
     * Toggle Light/Dark mode themes
     */
    applyTheme: function() {
        const storedTheme = localStorage.getItem('cv_roast_theme') || 'dark';
        this.state.theme = storedTheme;
        document.documentElement.setAttribute('data-theme', storedTheme);
        
        const themeBtnIcon = document.querySelector('#theme-toggle span');
        if (themeBtnIcon) {
            themeBtnIcon.textContent = storedTheme === 'light' ? 'dark_mode' : 'light_mode';
        }
    },

    /**
     * Read and parse files (.pdf, .docx, .txt)
     */
    handleFile: async function(file) {
        if (!file) return;
        
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx' && ext !== 'txt') {
            alert('Formato file non supportato! Trascina solo file PDF, DOCX o TXT.');
            return;
        }

        const dropzone = document.getElementById('cv-dropzone');
        const progressContainer = document.getElementById('upload-progress-container');
        const badge = document.getElementById('cv-file-badge');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressPercent = document.getElementById('upload-progress-percent');
        const fileNameLabel = document.getElementById('upload-file-name');

        // Hide other fields & show progress
        dropzone.style.display = 'none';
        badge.style.display = 'none';
        progressContainer.style.display = 'block';
        fileNameLabel.textContent = `Lettura di ${file.name}...`;
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';

        const reader = new FileReader();

        try {
            let extractedText = "";

            if (ext === 'txt') {
                // Animate progress smoothly for short file
                this.animateProgress(300, (p) => {
                    progressBar.style.width = `${p}%`;
                    progressPercent.textContent = `${p}%`;
                });
                
                extractedText = await new Promise((resolve, reject) => {
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = e => reject(e);
                    reader.readAsText(file);
                });
            } 
            else if (ext === 'docx') {
                // Word file parsing
                this.animateProgress(600, (p) => {
                    progressBar.style.width = `${p}%`;
                    progressPercent.textContent = `${p}%`;
                });

                const arrayBuffer = await new Promise((resolve, reject) => {
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = e => reject(e);
                    reader.readAsArrayBuffer(file);
                });

                if (typeof mammoth !== 'undefined') {
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    extractedText = result.value;
                } else {
                    throw new Error("Libreria Mammoth.js non caricata!");
                }
            } 
            else if (ext === 'pdf') {
                // PDF file parsing
                const arrayBuffer = await new Promise((resolve, reject) => {
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = e => reject(e);
                    reader.readAsArrayBuffer(file);
                });

                if (typeof pdfjsLib !== 'undefined') {
                    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                    let text = "";
                    const totalPages = pdf.numPages;
                    
                    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        
                        // Reconstruct lines using y-coordinate grouping
                        const linesMap = {};
                        textContent.items.forEach(item => {
                            if (!item.str || item.str.trim() === "") return;
                            const x = (item.transform && item.transform[4]) ? item.transform[4] : 0;
                            const y = (item.transform && item.transform[5]) ? item.transform[5] : 0;
                            const roundedY = Math.round(y);
                            
                            // Find an existing line within a 4px tolerance
                            let foundY = Object.keys(linesMap).find(existingY => Math.abs(Number(existingY) - roundedY) < 4);
                            if (!foundY) {
                                foundY = roundedY;
                                linesMap[foundY] = [];
                            }
                            linesMap[foundY].push(item);
                        });

                        // Sort y-coordinates descending (top of the page to bottom)
                        const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);

                        let pageText = "";
                        sortedY.forEach(y => {
                            // Sort items in this line from left to right (x-coordinate ascending)
                            const lineItems = linesMap[y].sort((a, b) => {
                                const ax = (a.transform && a.transform[4]) ? a.transform[4] : 0;
                                const bx = (b.transform && b.transform[4]) ? b.transform[4] : 0;
                                return ax - bx;
                            });
                            
                            let lineStr = "";
                            lineItems.forEach((item, idx) => {
                                if (idx > 0) {
                                    const prevItem = lineItems[idx - 1];
                                    const prevX = (prevItem.transform && prevItem.transform[4]) ? prevItem.transform[4] : 0;
                                    const prevXEnd = prevX + (prevItem.width || 0);
                                    const currX = (item.transform && item.transform[4]) ? item.transform[4] : 0;
                                    
                                    // If there is a noticeable gap and no spaces are already present, insert a space
                                    if (currX - prevXEnd > 3 && !lineStr.endsWith(" ") && !item.str.startsWith(" ")) {
                                        lineStr += " ";
                                    }
                                }
                                lineStr += item.str;
                            });
                            pageText += lineStr + "\n";
                        });

                        text += pageText + "\n";
                        
                        // Update progress bar
                        const pct = Math.round((pageNum / totalPages) * 100);
                        progressBar.style.width = `${pct}%`;
                        progressPercent.textContent = `${pct}%`;
                    }
                    extractedText = text;
                } else {
                    throw new Error("Libreria PDF.js non caricata!");
                }
            }

            if (!extractedText || extractedText.trim() === '') {
                throw new Error("Impossibile estrarre del testo da questo documento.");
            }

            // Successfully extracted text
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
                if (badge) badge.style.display = 'flex';
                const badgeName = document.getElementById('cv-file-badge-name');
                if (badgeName) badgeName.textContent = file.name;
                
                const cvTextarea = document.getElementById('roast-cv-text');
                if (cvTextarea) cvTextarea.value = extractedText;
                
                // Save CV text globally and remember the filename
                self.saveSettings({ cvText: extractedText });
                localStorage.setItem('cv_filename', file.name);

                // Update settings view cv field
                const setCvField = document.getElementById('set-sender-cv');
                if (setCvField) setCvField.value = extractedText;

                // Refresh CV status on dashboard and elsewhere
                if (typeof ui !== 'undefined' && ui.updateCvStatus) {
                    ui.updateCvStatus();
                }

                // Show text inspector briefly so they see it worked
                const inspectorContent = document.getElementById('inspector-content');
                const inspectorArrow = document.getElementById('inspector-arrow');
                if (inspectorContent) inspectorContent.style.display = 'block';
                if (inspectorArrow) inspectorArrow.style.transform = 'rotate(180deg)';
            }, 500);

        } catch (error) {
            console.error("File extraction error:", error);
            alert(`Errore nell'estrazione del testo: ${error.message}`);
            this.resetFileUploader();
        }
    },

    /**
     * Organic progress animation helper
     */
    animateProgress: function(duration, callback) {
        let start = 0;
        const interval = 20;
        const step = 100 / (duration / interval);
        const timer = setInterval(() => {
            start += step;
            if (start >= 100) {
                start = 100;
                clearInterval(timer);
            }
            callback(Math.round(start));
        }, interval);
    },

    /**
     * Resets the uploader dropzone and clears text field
     */
    resetFileUploader: function() {
        const fileInput = document.getElementById('cv-file-input');
        if (fileInput) fileInput.value = '';
        const badge = document.getElementById('cv-file-badge');
        if (badge) badge.style.display = 'none';
        const progressContainer = document.getElementById('upload-progress-container');
        if (progressContainer) progressContainer.style.display = 'none';
        const dropzone = document.getElementById('cv-dropzone');
        if (dropzone) dropzone.style.display = 'flex';
        
        const cvTextarea = document.getElementById('roast-cv-text');
        if (cvTextarea) cvTextarea.value = '';

        // Clear CV text globally and remove name
        this.saveSettings({ cvText: '' });
        localStorage.removeItem('cv_filename');

        // Update settings view cv field
        const setCvField = document.getElementById('set-sender-cv');
        if (setCvField) setCvField.value = '';

        // Refresh CV status
        if (typeof ui !== 'undefined' && ui.updateCvStatus) {
            ui.updateCvStatus();
        }
        
        // Hide inspector
        const inspectorContent = document.getElementById('inspector-content');
        const inspectorArrow = document.getElementById('inspector-arrow');
        if (inspectorContent) inspectorContent.style.display = 'none';
        if (inspectorArrow) inspectorArrow.style.transform = 'rotate(0deg)';
    },

    /**
     * Activate Pro/Agency plans for free
     */
    activatePremiumPlan: function(planType) {
        this.saveSettings({ userPlan: planType });
        this.updateUserPlanUI(planType);
        alert(`Upgrade completato con successo! Il piano ${planType === 'pro' ? 'Premium Pro Player' : 'Career Coach Agency'} è stato attivato gratuitamente.`);
    },

    /**
     * Update user plan badge and settings panel view
     */
    updateUserPlanUI: function(plan) {
        const planLabel = document.getElementById('sidebar-user-plan');
        const upgradeBtn = document.getElementById('sidebar-upgrade-btn');
        
        if (!planLabel) return;

        if (plan === 'pro') {
            planLabel.textContent = 'Piano Pro ✨';
            planLabel.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-success))';
            planLabel.style.webkitBackgroundClip = 'text';
            planLabel.style.webkitTextFillColor = 'transparent';
            planLabel.style.fontWeight = 'bold';
            
            if (upgradeBtn) {
                upgradeBtn.innerHTML = '<span class="material-symbols-outlined">verified</span><span>Licenza Attiva (Pro)</span>';
                upgradeBtn.style.background = 'rgba(16, 185, 129, 0.1)';
                upgradeBtn.style.border = '1px solid var(--color-success)';
                upgradeBtn.style.color = 'var(--color-success)';
                upgradeBtn.style.boxShadow = 'none';
                upgradeBtn.onclick = null;
            }

            // Also update settings pricing buttons
            const proBtn = document.getElementById('settings-upgrade-pro-btn');
            if (proBtn) {
                proBtn.textContent = 'Attivo (Pro)';
                proBtn.className = 'btn btn-outline w-full cursor-not-allowed';
                proBtn.disabled = true;
                proBtn.onclick = null;
            }
            const agencyBtn = document.getElementById('settings-upgrade-agency-btn');
            if (agencyBtn) {
                agencyBtn.textContent = 'Attiva Piano Agency (Gratis)';
                agencyBtn.className = 'btn btn-outline w-full';
                agencyBtn.disabled = false;
                agencyBtn.onclick = () => app.activatePremiumPlan('agency');
            }
        } else if (plan === 'agency') {
            planLabel.textContent = 'Career Agency 🚀';
            planLabel.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
            planLabel.style.webkitBackgroundClip = 'text';
            planLabel.style.webkitTextFillColor = 'transparent';
            planLabel.style.fontWeight = 'bold';

            if (upgradeBtn) {
                upgradeBtn.innerHTML = '<span class="material-symbols-outlined">workspace_premium</span><span>Licenza Attiva (Agency)</span>';
                upgradeBtn.style.background = 'rgba(245, 158, 11, 0.1)';
                upgradeBtn.style.border = '1px solid var(--color-warning)';
                upgradeBtn.style.color = 'var(--color-warning)';
                upgradeBtn.style.boxShadow = 'none';
                upgradeBtn.onclick = null;
            }

            // Update settings pricing buttons
            const proBtn = document.getElementById('settings-upgrade-pro-btn');
            if (proBtn) {
                proBtn.textContent = 'Attiva Piano Pro (Gratis)';
                proBtn.className = 'btn btn-primary w-full';
                proBtn.style.backgroundColor = 'var(--color-danger)';
                proBtn.disabled = false;
                proBtn.onclick = () => app.activatePremiumPlan('pro');
            }
            const agencyBtn = document.getElementById('settings-upgrade-agency-btn');
            if (agencyBtn) {
                agencyBtn.textContent = 'Attivo (Agency)';
                agencyBtn.className = 'btn btn-outline w-full cursor-not-allowed';
                agencyBtn.disabled = true;
                agencyBtn.onclick = null;
            }
        } else {
            planLabel.textContent = 'Piano Explorer';
            planLabel.style.background = 'none';
            planLabel.style.webkitTextFillColor = 'inherit';
            planLabel.style.fontWeight = 'normal';

            if (upgradeBtn) {
                upgradeBtn.innerHTML = '<span class="material-symbols-outlined">workspace_premium</span><span>Ottieni Licenza Pro</span>';
                upgradeBtn.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-success))';
                upgradeBtn.style.border = 'none';
                upgradeBtn.style.color = '#fff';
                upgradeBtn.onclick = () => app.switchView('settings');
            }
        }
    },

    /**
     * Wire DOM controls to JS operations
     */
    setupEventListeners: function() {
        const self = this;

        // View Navigation Button Listeners
        document.querySelectorAll('.nav-item').forEach(button => {
            button.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                self.switchView(view);
            });
        });

        // Search Input Listeners (Global + CRM)
        const globalSearch = document.getElementById('global-search-input');
        if (globalSearch) {
            globalSearch.addEventListener('input', function() {
                if (self.state.activeView !== 'crm') {
                    self.switchView('crm');
                }
                const filterInput = document.getElementById('crm-filter-input');
                if (filterInput) {
                    filterInput.value = this.value;
                    ui.renderCRMTable(self.state.leads);
                }
            });
        }

        const crmFilter = document.getElementById('crm-filter-input');
        if (crmFilter) {
            crmFilter.addEventListener('input', function() {
                ui.renderCRMTable(self.state.leads);
            });
        }

        const crmStatusFilter = document.getElementById('crm-filter-status');
        if (crmStatusFilter) {
            crmStatusFilter.addEventListener('change', function() {
                ui.renderCRMTable(self.state.leads);
            });
        }

        // Settings Form Submission
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const senderName = document.getElementById('set-sender-name').value;
                const senderRole = document.getElementById('set-sender-role').value;
                const senderBio = document.getElementById('set-sender-bio').value;
                const cvText = document.getElementById('set-sender-cv').value;
                
                const llmProvider = document.getElementById('set-llm-provider').value;
                const geminiApiKey = document.getElementById('set-gemini-key').value;
                const openRouterApiKey = document.getElementById('set-openrouter-key').value;
                const openRouterModel = document.getElementById('set-openrouter-model-select').value;
                const openRouterModelCustom = document.getElementById('set-openrouter-model-custom').value;
                const ollamaUrl = document.getElementById('set-ollama-url').value;
                const ollamaModel = document.getElementById('set-ollama-model').value;
                const adzunaAppId = document.getElementById('set-adzuna-id').value;
                const adzunaAppKey = document.getElementById('set-adzuna-key').value;

                self.saveSettings({
                    senderName: senderName,
                    senderRole: senderRole,
                    senderBio: senderBio,
                    cvText: cvText,
                    llmProvider: llmProvider,
                    geminiApiKey: geminiApiKey,
                    openRouterApiKey: openRouterApiKey,
                    openRouterModel: openRouterModel,
                    openRouterModelCustom: openRouterModelCustom,
                    ollamaUrl: ollamaUrl,
                    ollamaModel: ollamaModel,
                    adzunaAppId: adzunaAppId,
                    adzunaAppKey: adzunaAppKey
                });

                alert("Impostazioni salvate con successo!");
            });
        }

        // LLM Provider select change listener
        const providerSelect = document.getElementById('set-llm-provider');
        if (providerSelect) {
            providerSelect.addEventListener('change', function() {
                self.toggleProviderSettingsVisibility(this.value);
            });
        }

        // OpenRouter Model select change listener
        const orModelSelect = document.getElementById('set-openrouter-model-select');
        if (orModelSelect) {
            orModelSelect.addEventListener('change', function() {
                self.toggleCustomModelVisibility(this.value);
            });
        }

        // Show/Hide Gemini Key Toggle
        const toggleGeminiKeyBtn = document.getElementById('toggle-gemini-key-visibility');
        if (toggleGeminiKeyBtn) {
            toggleGeminiKeyBtn.addEventListener('click', function() {
                const keyInput = document.getElementById('set-gemini-key');
                const isPassword = keyInput.type === 'password';
                keyInput.type = isPassword ? 'text' : 'password';
                this.querySelector('span').textContent = isPassword ? 'visibility_off' : 'visibility';
            });
        }

        // Show/Hide OpenRouter Key Toggle
        const toggleORKeyBtn = document.getElementById('toggle-openrouter-key-visibility');
        if (toggleORKeyBtn) {
            toggleORKeyBtn.addEventListener('click', function() {
                const keyInput = document.getElementById('set-openrouter-key');
                const isPassword = keyInput.type === 'password';
                keyInput.type = isPassword ? 'text' : 'password';
                this.querySelector('span').textContent = isPassword ? 'visibility_off' : 'visibility';
            });
        }

        // Theme Toggle Click
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                const nextTheme = self.state.theme === 'dark' ? 'light' : 'dark';
                self.state.theme = nextTheme;
                localStorage.setItem('cv_roast_theme', nextTheme);
                self.applyTheme();
            });
        }

        // Recruiter Persona Click selectors
        document.querySelectorAll('.persona-option').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.persona-option').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const radio = this.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;

                // Dynamic updates if a roast is already active
                const resultsContainer = document.getElementById('roast-results-container');
                if (resultsContainer && resultsContainer.style.display === 'grid') {
                    const cvText = document.getElementById('roast-cv-text').value;
                    const persona = radio ? radio.value : 'Il Cinico Milanese';
                    if (cvText && cvText.trim() !== '') {
                        const provider = self.state.settings.llmProvider || 'gemini';
                        const apiKey = provider === 'gemini' ? self.state.settings.geminiApiKey : self.state.settings.openRouterApiKey;
                        if (apiKey && apiKey.trim() !== '') {
                            // Run the standard animated roast for API
                            ui.startCVRoast(cvText, persona);
                        } else {
                            // Instant update for Smart Mock mode
                            const result = api.generateMockRoast(cvText, persona);
                            result.persona = persona;
                            
                            const history = ui.getRoastHistory();
                            history.push(result);
                            localStorage.setItem('cv_roast_history', JSON.stringify(history));
                            
                            ui.renderRoastResults(result);
                        }
                    }
                }
            });
        });

        // CV Roaster Form Submission
        const roasterForm = document.getElementById('cv-roast-form');
        if (roasterForm) {
            roasterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const cvText = document.getElementById('roast-cv-text').value;
                
                const activeOption = document.querySelector('.persona-option.active input[type="radio"]');
                const persona = activeOption ? activeOption.value : 'Il Cinico Milanese';

                ui.startCVRoast(cvText, persona);
            });
        }

        // Pitch Form Submission
        const pitchForm = document.getElementById('pitch-form');
        if (pitchForm) {
            pitchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const companyName = document.getElementById('pitch-company-name').value;
                const companyUrl = document.getElementById('pitch-company-url').value;
                const jobRole = document.getElementById('pitch-job-role').value;
                const tone = document.getElementById('pitch-tone').value;

                ui.startPitchGeneration(companyName, companyUrl, jobRole, tone);
            });
        }

        // Pitch channel tab switching
        document.querySelectorAll('.pitch-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                ui.switchPitchTab(tab);
            });
        });

        // Modal pitch channel tab switching
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                ui.switchModalTab(tab);
            });
        });

        // CRM Clear Database Button
        const clearDbBtn = document.getElementById('clear-database-btn');
        if (clearDbBtn) {
            clearDbBtn.addEventListener('click', function() {
                if (confirm("Sei sicuro di voler cancellare TUTTE le candidature salvate nel tracker? Questa operazione eliminerà lo storico delle tue candidature.")) {
                    self.state.leads = [];
                    self.saveLeads();
                    self.renderViewData(self.state.activeView);
                    alert("Database tracker cancellato!");
                }
            });
        }


        // --- NEW: File Uploader Drag & Drop Events ---
        const dropzone = document.getElementById('cv-dropzone');
        const fileInput = document.getElementById('cv-file-input');

        if (dropzone && fileInput) {
            // Trigger file click when dropzone is clicked
            dropzone.addEventListener('click', () => {
                fileInput.click();
            });

            // Input change event
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    self.handleFile(e.target.files[0]);
                }
            });

            // Dragover event
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            // Dragleave event
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            // Drop event
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    self.handleFile(e.dataTransfer.files[0]);
                }
            });
        }

        // --- NEW: Reset file btn click ---
        const removeFileBtn = document.getElementById('remove-cv-file-btn');
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => {
                self.resetFileUploader();
            });
        }

        // --- CV Builder Button (from Roaster) ---
        const openCVBuilderBtn = document.getElementById('open-cv-builder-btn');
        if (openCVBuilderBtn) {
            openCVBuilderBtn.addEventListener('click', () => {
                // Navigate to CV Builder view and import current roaster content
                if (typeof cvBuilderUI !== 'undefined') {
                    cvBuilderUI.importFromRoaster();
                }
                app.switchView('cv-builder');
            });
        }

        // --- Job Search Button ---
        const openJobSearchBtn = document.getElementById('open-job-search-btn');
        if (openJobSearchBtn) {
            openJobSearchBtn.addEventListener('click', () => {
                app.switchView('dashboard');
            });
        }

        // --- NEW: Toggle Inspector Collapsible ---
        const toggleInspectorBtn = document.getElementById('toggle-inspector-btn');
        const inspectorArrow = document.getElementById('inspector-arrow');
        const inspectorContent = document.getElementById('inspector-content');
        if (toggleInspectorBtn && inspectorContent) {
            toggleInspectorBtn.addEventListener('click', () => {
                const isHidden = inspectorContent.style.display === 'none';
                inspectorContent.style.display = isHidden ? 'block' : 'none';
                inspectorArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }

        // Sync text manually written in textarea
        const roastCVTextarea = document.getElementById('roast-cv-text');
        if (roastCVTextarea) {
            roastCVTextarea.addEventListener('input', function() {
                self.saveSettings({ cvText: this.value });
            });
        }
    }
};

// Initialize app when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
