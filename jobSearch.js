/**
 * Job Search – Real Portals + AI-Powered Smart Cards
 *
 * Strategy: instead of calling APIs with fake credentials (which always fail),
 * we build real, live search URLs for LinkedIn Jobs, Indeed Italia, and InfoJobs
 * directly from the candidate's CV keywords. Each card links to a real search
 * that returns actual, up-to-date job listings.
 *
 * Bonus: we also generate a set of contextual "smart suggestion" cards so the
 * user immediately sees personalized results before clicking through.
 */

const jobSearch = (() => {

    // ─── REAL JOB PORTALS ────────────────────────────────────────────────────
    const PORTALS = [
        {
            name: "LinkedIn",
            icon: "linkedin",
            color: "#0A66C2",
            buildUrl: (query, location, workplaceType) => {
                let url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location || 'Italia')}&f_TPR=r604800`;
                if (workplaceType === 'remote') url += '&f_WT=2';
                else if (workplaceType === 'hybrid') url += '&f_WT=3';
                else if (workplaceType === 'onsite') url += '&f_WT=1';
                return url;
            }
        },
        {
            name: "Indeed",
            icon: "indeed",
            color: "#003A9B",
            buildUrl: (query, location, workplaceType) => {
                let loc = location || 'Italia';
                if (workplaceType === 'remote') loc = 'smart working';
                else if (workplaceType === 'hybrid') loc = 'ibrido';
                return `https://it.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(loc)}&fromage=14`;
            }
        },
        {
            name: "InfoJobs",
            icon: "infojobs",
            color: "#6CB52D",
            buildUrl: (query, location, workplaceType) => {
                let prov = '';
                if (workplaceType === 'remote') prov = '&province=smart-working';
                return `https://www.infojobs.it/offerte-lavoro?keyword=${encodeURIComponent(query)}${prov}`;
            }
        },
        {
            name: "Glassdoor",
            icon: "glassdoor",
            color: "#00A562",
            buildUrl: (query, location, workplaceType) => {
                const q = workplaceType === 'remote' ? `${query} remote` : query;
                return `https://www.glassdoor.it/Lavoro/${encodeURIComponent(location || 'italia')}-${encodeURIComponent(q.replace(/\s+/g, '-').toLowerCase())}-offerte-di-lavoro-SRCH_IL.0,6_IN130.htm`;
            }
        },
        {
            name: "Adzuna",
            icon: "adzuna",
            color: "#F05F40",
            buildUrl: (query, location, workplaceType) => {
                const q = workplaceType === 'remote' ? `${query} smart working` : query;
                return `https://www.adzuna.it/search?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(location || 'Italia')}`;
            }
        }
    ];

    // ─── CATEGORY PROFILES ───────────────────────────────────────────────────
    const CATEGORY_PROFILES = {
        "Software Developer": {
            keywords: ["sviluppatore", "software engineer", "developer", "full stack", "backend", "frontend"],
            relatedRoles: ["Junior Developer", "Software Engineer", "Web Developer", "Backend Developer", "Full Stack Developer"],
            salaryRange: "€35k–70k",
        },
        "Digital Marketer": {
            keywords: ["digital marketing", "social media", "seo", "content marketing", "growth hacker"],
            relatedRoles: ["Digital Marketing Specialist", "SEO Specialist", "Social Media Manager", "Performance Marketer"],
            salaryRange: "€28k–55k",
        },
        "Finance": {
            keywords: ["analista finanziario", "controller", "finanza", "bilancio", "contabilità"],
            relatedRoles: ["Financial Analyst", "Controller", "Accountant", "CFO Assistant"],
            salaryRange: "€30k–65k",
        },
        "Design": {
            keywords: ["ux designer", "ui designer", "graphic designer", "product designer", "figma"],
            relatedRoles: ["UX/UI Designer", "Product Designer", "Graphic Designer", "Visual Designer"],
            salaryRange: "€30k–60k",
        },
        "Management": {
            keywords: ["project manager", "product manager", "team leader", "responsabile", "direttore"],
            relatedRoles: ["Project Manager", "Product Manager", "Team Leader", "Operations Manager"],
            salaryRange: "€40k–80k",
        },
        "General": {
            keywords: ["collaboratore", "assistente", "analista", "specialist"],
            relatedRoles: ["Business Analyst", "Operations Specialist", "Project Coordinator", "Consultant"],
            salaryRange: "€25k–50k",
        }
    };

    // ─── SKILL → ROLE CARD TEMPLATES ─────────────────────────────────────────
    const ROLE_CARDS = {
        tech: [
            { title: "Frontend Developer – React & TypeScript",   skills: ["React","TypeScript","CSS"],   companies: ["Satispay","Musixmatch","Casavo"],      salaryRange: "€45k–65k" },
            { title: "Full-Stack Engineer – Node.js & AWS",        skills: ["Node.js","AWS","PostgreSQL"], companies: ["Scalapay","ProntoPro","Subito.it"],    salaryRange: "€50k–75k" },
            { title: "Software Engineer – Python & ML",            skills: ["Python","ML","Docker"],       companies: ["Prima Assicurazioni","Enel X","Zucchetti"], salaryRange: "€40k–65k" },
            { title: "Backend Engineer – Go & Microservices",      skills: ["Go","Kubernetes","gRPC"],     companies: ["Satispay","Scalapay","Casavo"],       salaryRange: "€45k–70k" },
            { title: "DevOps / Cloud Engineer – GCP & Terraform",  skills: ["Terraform","GCP","CI/CD"],   companies: ["ProntoPro","Musixmatch","Enel X"],   salaryRange: "€50k–72k" },
            { title: "Mobile Developer – React Native & Flutter",  skills: ["React Native","Flutter","iOS"], companies: ["Subito.it","Prima Assicurazioni","Zucchetti"], salaryRange: "€42k–62k" },
        ],
        marketing: [
            { title: "Performance Marketing Manager – Meta & Google", skills: ["Meta Ads","Google Ads","ROAS"],      companies: ["Zalando","Trovaprezzi","Wolters Kluwer"], salaryRange: "€40k–58k" },
            { title: "SEO Specialist – Technical & Content SEO",      skills: ["SEO","GA4","Semrush"],              companies: ["Trovaprezzi","TeamSystem","Yoox"],        salaryRange: "€28k–44k" },
            { title: "Growth Hacker – B2B SaaS",                      skills: ["Growth","CRO","HubSpot"],           companies: ["TeamSystem","Wolters Kluwer","Zucchetti"],salaryRange: "€32k–50k" },
            { title: "Email & Marketing Automation Specialist",       skills: ["Klaviyo","Email","Automation"],     companies: ["Yoox","Zalando","Trovaprezzi"],           salaryRange: "€30k–44k" },
            { title: "Digital Marketing Manager – Lead Generation",   skills: ["LinkedIn Ads","SEM","Funnel"],      companies: ["Wolters Kluwer","Accenture","McKinsey"],  salaryRange: "€45k–60k" },
        ],
        general: [
            { title: "Project Manager – Digital Transformation",      skills: ["Agile","Scrum","PMP"],             companies: ["Accenture","McKinsey","Deloitte"],         salaryRange: "€40k–65k" },
            { title: "Business Analyst – Data & Strategy",            skills: ["SQL","Excel","Strategy"],          companies: ["McKinsey","Enel X","Accenture"],           salaryRange: "€45k–75k" },
            { title: "Product Manager – Consumer Apps",               skills: ["Roadmap","OKR","Analytics"],       companies: ["Enel X","Prima","Satispay"],               salaryRange: "€45k–68k" },
            { title: "Customer Success Manager – SaaS",               skills: ["CRM","NPS","Salesforce"],          companies: ["Zucchetti","TeamSystem","HubSpot"],        salaryRange: "€30k–50k" },
            { title: "UX/UI Designer – Product Design",               skills: ["Figma","UX Research","Prototyping"],companies: ["Prima","Musixmatch","Satispay"],          salaryRange: "€35k–58k" },
        ]
    };

    // ─── CATEGORY DETECTOR ───────────────────────────────────────────────────
    function detectCategoryKey(text) {
        const t = (text || '').toLowerCase();
        const techScore    = ["javascript","typescript","react","python","docker","git","developer","node","java","aws","sql","kubernetes","angular","vue","flutter","swift","kotlin"].filter(k => t.includes(k)).length;
        const mktScore     = ["marketing","seo","social","growth","ads","campaign","leads","advertising","copywriting","analytics","funnel","email","roas","cpa","meta","google ads"].filter(k => t.includes(k)).length;
        if (techScore > mktScore && techScore > 0) return "tech";
        if (mktScore > 0) return "marketing";
        return "general";
    }

    // ─── MATCH SCORE ─────────────────────────────────────────────────────────
    function computeMatch(card, keywords) {
        if (!keywords || keywords.length === 0) return Math.round(60 + Math.random() * 30);
        const cardText = (card.title + " " + (card.skills || []).join(" ")).toLowerCase();
        const matches  = keywords.filter(kw => cardText.includes(kw.toLowerCase())).length;
        const base     = Math.min(97, Math.round(45 + (matches / Math.max(keywords.length, 1)) * 50));
        return base + Math.round(Math.random() * 5); // small jitter
    }

    // ─── PICK A RANDOM COMPANY ────────────────────────────────────────────────
    function pickCompany(companies) {
        return companies[Math.floor(Math.random() * companies.length)];
    }

    // ─── BUILD PORTAL SEARCH LINKS ───────────────────────────────────────────
    function buildPortalLinks(query, location, workplaceType) {
        return PORTALS.map(p => ({
            name:  p.name,
            color: p.color,
            url:   p.buildUrl(query, location, workplaceType)
        }));
    }

    // ─── PUBLIC API ──────────────────────────────────────────────────────────
    return {
        /**
         * Main entry: queries live Adzuna or fallback APIs, then uses LLM to match.
         *
         * @param {string[]} keywords      - CV-extracted skill keywords
         * @param {string}   role          - desired job role (from user input)
         * @param {string}   lang          - "it"|"en"
         * @param {string}   workplaceType - "all"|"remote"|"hybrid"|"onsite"
         * @returns {Promise<Array>}       - ranked job offers
         */
        async fetchJobOffers(keywords = [], role = "", lang = "it", workplaceType = "all") {
            const settings = app.state.settings || {};
            const appId = settings.adzunaAppId;
            const appKey = settings.adzunaAppKey;
            
            const hasAdzuna = appId && appId.trim() !== '' && appKey && appKey.trim() !== '';
            
            const query = role || (keywords.slice(0, 2).join(" ")) || "sviluppatore";
            const location = lang === "en" ? "UK" : "Italia";
            
            let rawJobs = [];
            const cat = detectCategoryKey(keywords.join(" ") + " " + query);
            
            // Check checkboxes if they exist in DOM, otherwise default to true
            const useAdzuna = document.getElementById('agent-plat-adzuna') ? document.getElementById('agent-plat-adzuna').checked : true;
            const useRemotive = document.getElementById('agent-plat-remotive') ? document.getElementById('agent-plat-remotive').checked : true;
            const useTheMuse = document.getElementById('agent-plat-themuse') ? document.getElementById('agent-plat-themuse').checked : true;
            const useArbeitnow = document.getElementById('agent-plat-arbeitnow') ? document.getElementById('agent-plat-arbeitnow').checked : true;
            
            // 1. Adzuna API (if enabled and key present)
            if (hasAdzuna && useAdzuna) {
                try {
                    let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${lang === 'en' ? 'gb' : 'it'}/search/1?app_id=${appId.trim()}&app_key=${appKey.trim()}&results_per_page=6&what=${encodeURIComponent(query)}`;
                    if (workplaceType === 'remote') {
                        adzunaUrl += `&what_and=${encodeURIComponent(lang === 'en' ? 'remote' : 'smart working')}`;
                    } else if (workplaceType === 'hybrid') {
                        adzunaUrl += `&what_and=${encodeURIComponent(lang === 'en' ? 'hybrid' : 'ibrido')}`;
                    }
                    
                    const res = await fetch(adzunaUrl);
                    if (res.ok) {
                        const data = await res.json();
                        const mapped = (data.results || []).map(r => {
                            const createdDate = new Date(r.created);
                            const diffDays = Math.ceil(Math.abs(new Date() - createdDate) / (1000 * 60 * 60 * 24));
                            return {
                                title: r.title.replace(/<\/?[^>]+(>|$)/g, ""),
                                company: r.company?.display_name || "Azienda",
                                location: r.location?.display_name || (lang === 'en' ? 'UK' : 'Italia'),
                                salary: r.salary_min ? `€${Math.round(r.salary_min/1000)}k–${Math.round(r.salary_max/1000)}k` : "",
                                description: r.description.replace(/<\/?[^>]+(>|$)/g, ""),
                                url: r.redirect_url,
                                postedDaysAgo: isNaN(diffDays) ? 1 : diffDays,
                                tags: r.category?.label ? [r.category.label] : ["Annuncio"],
                                source: "adzuna"
                            };
                        });
                        rawJobs = [...rawJobs, ...mapped];
                    }
                } catch (e) {
                    console.error("Adzuna API Fetch Error:", e);
                }
            }
            
            // 2. Remotive API (if enabled)
            if (useRemotive && (workplaceType === 'remote' || lang === 'en')) {
                try {
                    const res = await fetch(`https://remotive.com/api/remote-jobs?limit=8&search=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        const mapped = (data.jobs || []).slice(0, 6).map(r => {
                            const pubDate = new Date(r.publication_date);
                            const diffDays = Math.ceil(Math.abs(new Date() - pubDate) / (1000 * 60 * 60 * 24));
                            return {
                                title: r.title,
                                company: r.company_name,
                                location: r.candidate_required_location || "Remote",
                                salary: r.salary || "",
                                description: r.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 300) + "...",
                                url: r.url,
                                postedDaysAgo: isNaN(diffDays) ? 2 : diffDays,
                                tags: r.tags || ["Remote"],
                                source: "remotive"
                            };
                        });
                        rawJobs = [...rawJobs, ...mapped];
                    }
                } catch (e) {
                    console.warn("Remotive API failed:", e);
                }
            }

            // 3. Arbeitnow API (if enabled)
            if (useArbeitnow) {
                try {
                    const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
                    if (res.ok) {
                        const json = await res.json();
                        const q = query.toLowerCase();
                        const filtered = (json.data || []).filter(job => 
                            job.title.toLowerCase().includes(q) || 
                            job.company_name.toLowerCase().includes(q) ||
                            (job.tags && job.tags.some(t => t.toLowerCase().includes(q)))
                        );
                        const mapped = filtered.slice(0, 6).map(job => {
                            const diffDays = Math.ceil(Math.abs(new Date() - new Date(job.created_at * 1000)) / (1000 * 60 * 60 * 24));
                            return {
                                title: job.title,
                                company: job.company_name,
                                location: job.location + (job.remote ? " (Remote)" : ""),
                                salary: "",
                                description: job.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 300) + "...",
                                url: job.url,
                                postedDaysAgo: isNaN(diffDays) ? 1 : diffDays,
                                tags: job.tags || ["Job"],
                                source: "arbeitnow"
                            };
                        });
                        rawJobs = [...rawJobs, ...mapped];
                    }
                } catch (e) {
                    console.warn("Arbeitnow API failed:", e);
                }
            }

            // 4. The Muse API (if enabled)
            if (useTheMuse) {
                try {
                    let museCategory = "";
                    if (cat === "tech") museCategory = "Software Engineering";
                    else if (cat === "marketing") museCategory = "Marketing";
                    else if (cat === "design") museCategory = "Design";
                    else if (cat === "finance") museCategory = "Accounting & Finance";
                    
                    let museUrl = `https://www.themuse.com/api/public/jobs?page=0&descending=true`;
                    if (museCategory) museUrl += `&category=${encodeURIComponent(museCategory)}`;
                    
                    const isRemote = workplaceType === 'remote';
                    if (isRemote) {
                        museUrl += `&location=Flexible%20%2F%20Remote`;
                    } else {
                        museUrl += lang === 'en' ? `&location=United%20Kingdom` : `&location=Italy`;
                    }
                    
                    const res = await fetch(museUrl);
                    if (res.ok) {
                        const json = await res.json();
                        const q = query.toLowerCase();
                        const results = (json.results || []).filter(job => 
                            job.name.toLowerCase().includes(q) || 
                            job.company?.name.toLowerCase().includes(q)
                        );
                        
                        const mapped = results.slice(0, 6).map(job => {
                            const pubDate = new Date(job.publication_date);
                            const diffDays = Math.ceil(Math.abs(new Date() - pubDate) / (1000 * 60 * 60 * 24));
                            return {
                                title: job.name,
                                company: job.company?.name || "Azienda",
                                location: (job.locations || []).map(l => l.name).join(", ") || "Remote",
                                salary: "",
                                description: job.contents.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 300) + "...",
                                url: job.refs?.landing_page || "https://www.themuse.com",
                                postedDaysAgo: isNaN(diffDays) ? 1 : diffDays,
                                tags: (job.categories || []).map(c => c.name) || ["Annuncio"],
                                source: "themuse"
                            };
                        });
                        rawJobs = [...rawJobs, ...mapped];
                    }
                } catch (e) {
                    console.warn("The Muse API failed:", e);
                }
            }

            // Deduplicate rawJobs
            let filteredJobs = [];
            if (rawJobs.length > 0) {
                const seen = new Set();
                filteredJobs = rawJobs.filter(job => {
                    const key = `${job.company}_${job.title}`.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            }
            
            // Ultimate fallback: Curated Local matching cards (dynamic mock)
            if (filteredJobs.length === 0) {
                const mockObj = this.getMockOffers(keywords, role, lang, workplaceType);
                return mockObj.cards;
            }
            
            // Now, run AI matching evaluator for each job (up to 6 top items)
            const jobsToEvaluate = filteredJobs.slice(0, 6);
            
            const cvText = settings.cvText || "";
            const provider = settings.llmProvider || 'gemini';
            const geminiKey = settings.geminiApiKey;
            const openRouterKey = settings.openRouterApiKey;
            const ollamaUrl = settings.ollamaUrl || 'http://localhost:11434';
            
            const hasLlmKey = (provider === 'gemini' && geminiKey && geminiKey.trim() !== '') ||
                              (provider === 'openrouter' && openRouterKey && openRouterKey.trim() !== '') ||
                              (provider === 'ollama');
            
            const llmKey = provider === 'gemini' ? geminiKey : (provider === 'openrouter' ? openRouterKey : ollamaUrl);
            const llmModel = provider === 'gemini' ? '' : (provider === 'openrouter' ? (settings.openRouterModel === 'custom' ? settings.openRouterModelCustom : settings.openRouterModel) : settings.ollamaModel);
            
            const matchedCards = [];
            for (let job of jobsToEvaluate) {
                let matchData = null;
                if (cvText && cvText.trim() !== '') {
                    // If LLM is active, evaluate real match
                    matchData = await api.evaluateJobMatching(
                        llmKey,
                        provider,
                        llmModel,
                        cvText,
                        job.title,
                        job.company,
                        job.description
                    );
                } else {
                    matchData = {
                        matchScore: 60,
                        matchingSkills: job.tags,
                        missingSkills: [],
                        reasoning: "Carica il tuo CV nelle impostazioni per sbloccare l'analisi dettagliata e lo score di matching intelligente."
                    };
                }
                
                matchedCards.push({
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    salary: job.salary,
                    tags: matchData.matchingSkills.length > 0 ? matchData.matchingSkills : job.tags,
                    matchScore: matchData.matchScore,
                    reasoning: matchData.reasoning,
                    missingSkills: matchData.missingSkills || [],
                    url: job.url,
                    postedDaysAgo: job.postedDaysAgo,
                    source: job.source || "web",
                    portalLinks: buildPortalLinks(job.title, job.location, workplaceType)
                });
            }
            
            // Sort by match score descending
            return matchedCards.sort((a, b) => b.matchScore - a.matchScore);
        },

        getMockOffers(keywords = [], role = "", lang = "it", workplaceType = "all") {
            const cat      = detectCategoryKey(keywords.join(" ") + " " + role);
            const catProfile = CATEGORY_PROFILES[
                cat === "tech" ? "Software Developer" :
                cat === "marketing" ? "Digital Marketer" :
                cat === "finance" ? "Finance" :
                cat === "design" ? "Design" : "General"
            ] || CATEGORY_PROFILES["General"];

            // Build dynamic cards from the actual keywords rather than hardcoded templates
            const cards = _generateSmartCards(keywords, role, cat, catProfile, workplaceType, lang);

            // Also build "search all" portal links for the general role
            const globalPortalLinks = buildPortalLinks(
                role || keywords.slice(0, 3).join(" ") || "sviluppatore software",
                lang === "en" ? "United Kingdom" : "Italia",
                workplaceType
            );

            return { cards, globalPortalLinks, category: cat };
        }
    };

    // ─── SMART CARD GENERATOR ────────────────────────────────────────────────
    function _generateSmartCards(keywords, userRole, cat, catProfile, workplaceType, lang) {
        // Determine seniority from keywords
        const combined = (keywords.join(" ") + " " + userRole).toLowerCase();
        const isSenior = /senior|lead|principal|director|head|chief|manager|cto|cpo/i.test(combined);
        const isJunior = /junior|entry|graduate|intern|apprentice|stage/i.test(combined);
        const level = isSenior ? "Senior" : isJunior ? "Junior" : "Mid";

        // Build role variations based on keywords and level
        const roleVariations = _buildRoleVariations(keywords, userRole, cat, level);

        // Build company pool by sector
        const companies = _companiesByCat(cat);

        const location = workplaceType === 'remote'
            ? (lang === 'en' ? 'Remote – Worldwide' : 'Smart Working – Italia')
            : workplaceType === 'hybrid'
            ? (lang === 'en' ? 'Hybrid – UK' : 'Ibrido – Italia')
            : (lang === 'en' ? 'London, UK' : 'Milano, Italia');

        return roleVariations.slice(0, 6).map((rv, i) => {
            const matchScore = computeMatch({ title: rv.title, skills: rv.skills }, keywords);
            const company = companies[i % companies.length];
            const daysAgo = Math.floor(Math.random() * 5);
            return {
                title: rv.title,
                company,
                location,
                salary: rv.salary,
                tags: rv.skills.slice(0, 4),
                matchScore,
                reasoning: _buildReasoning(matchScore, keywords, rv.skills, lang),
                missingSkills: _findMissingSkills(keywords, rv.skills),
                url: lang === 'en' ? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(rv.title)}&location=United+Kingdom`
                                   : `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(rv.title)}&location=Italia`,
                postedDaysAgo: daysAgo,
                source: "curated",
                portalLinks: buildPortalLinks(
                    userRole ? `${userRole} ${rv.skills[0] || ''}` : rv.title,
                    lang === "en" ? "United Kingdom" : "Italia",
                    workplaceType
                )
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
    }

    function _buildRoleVariations(keywords, userRole, cat, level) {
        const kws = keywords.map(k => k.toLowerCase());
        const hasReact = kws.some(k => k.includes('react'));
        const hasVue = kws.some(k => k.includes('vue'));
        const hasAngular = kws.some(k => k.includes('angular'));
        const hasPython = kws.some(k => k.includes('python'));
        const hasNode = kws.some(k => k.includes('node'));
        const hasAWS = kws.some(k => k.includes('aws') || k.includes('cloud'));
        const hasDocker = kws.some(k => k.includes('docker') || k.includes('kubernetes'));
        const hasSEO = kws.some(k => k.includes('seo'));
        const hasAds = kws.some(k => k.includes('ads') || k.includes('meta') || k.includes('google ads'));
        const hasFigma = kws.some(k => k.includes('figma') || k.includes('ux') || k.includes('design'));
        const hasSQL = kws.some(k => k.includes('sql') || k.includes('postgres') || k.includes('mysql'));
        const prefix = level === 'Senior' ? 'Senior ' : level === 'Junior' ? 'Junior ' : '';

        if (userRole && userRole.length > 3) {
            // Use the real role as base and generate variations
            const base = userRole.replace(/^(senior|junior|lead|mid)\s+/i, '');
            const topSkills = keywords.slice(0, 3);
            return [
                { title: `${prefix}${base}`, skills: topSkills.length > 0 ? topSkills : ['Problem Solving'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}${base} – Remote`, skills: [...topSkills, 'Remote Work'].slice(0, 4), salary: _salaryByCat(cat, level) },
                { title: `${base} Specialist`, skills: keywords.slice(0, 4), salary: _salaryByCat(cat, level) },
                { title: `${base} – Startup`, skills: keywords.slice(0, 3), salary: _salaryByCat(cat, level) },
                { title: `${level} ${base}`, skills: [...keywords.slice(0, 2), 'Agile', 'Git'], salary: _salaryByCat(cat, level) },
                { title: `${base} Consultant`, skills: keywords.slice(0, 3), salary: _salaryByCat(cat, level) },
            ];
        }

        if (cat === 'tech') {
            return [
                hasReact ? { title: `${prefix}Frontend Developer – React`, skills: ['React', 'TypeScript', 'CSS', 'Git'], salary: _salaryByCat(cat, level) }
                         : { title: `${prefix}Web Developer`, skills: ['HTML', 'CSS', 'JavaScript', 'Git'], salary: _salaryByCat(cat, level) },
                hasPython ? { title: `${prefix}Python Developer`, skills: ['Python', 'Django', 'SQL', 'Docker'], salary: _salaryByCat(cat, level) }
                           : hasNode ? { title: `${prefix}Backend Developer – Node.js`, skills: ['Node.js', 'REST API', 'PostgreSQL', 'Docker'], salary: _salaryByCat(cat, level) }
                           : { title: `${prefix}Backend Developer`, skills: ['Java', 'Spring Boot', 'SQL', 'Docker'], salary: _salaryByCat(cat, level) },
                hasAWS || hasDocker ? { title: `${prefix}DevOps / Cloud Engineer`, skills: ['AWS', 'Docker', 'CI/CD', 'Terraform'], salary: _salaryByCat(cat, level) }
                                    : { title: `${prefix}Full-Stack Developer`, skills: ['React', 'Node.js', 'SQL', 'Git'], salary: _salaryByCat(cat, level) },
                hasSQL ? { title: `${prefix}Data Engineer`, skills: ['SQL', 'Python', 'Spark', 'AWS'], salary: _salaryByCat(cat, level) }
                        : { title: `${prefix}Software Engineer`, skills: keywords.slice(0, 4), salary: _salaryByCat(cat, level) },
                { title: `${prefix}Tech Lead`, skills: [...keywords.slice(0, 2), 'Agile', 'Leadership'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}Mobile Developer`, skills: hasReact ? ['React Native', 'JavaScript', 'iOS', 'Android'] : ['Flutter', 'Dart', 'iOS', 'Android'], salary: _salaryByCat(cat, level) },
            ];
        }
        if (cat === 'marketing') {
            return [
                hasAds ? { title: `${prefix}Performance Marketing Manager`, skills: ['Meta Ads', 'Google Ads', 'GA4', 'ROAS'], salary: _salaryByCat(cat, level) }
                        : { title: `${prefix}Digital Marketing Specialist`, skills: ['Content Marketing', 'Social Media', 'GA4', 'Copywriting'], salary: _salaryByCat(cat, level) },
                hasSEO ? { title: `${prefix}SEO Specialist`, skills: ['SEO', 'Semrush', 'GA4', 'Content Strategy'], salary: _salaryByCat(cat, level) }
                        : { title: `${prefix}Social Media Manager`, skills: ['Social Media', 'Copywriting', 'Canva', 'Analytics'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}Growth Marketing Manager`, skills: ['Growth Hacking', 'A/B Testing', 'CRO', 'Analytics'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}Email Marketing Specialist`, skills: ['Klaviyo', 'HubSpot', 'Email Marketing', 'Automation'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}Content Strategist`, skills: ['Content Marketing', 'Copywriting', 'SEO', 'Social Media'], salary: _salaryByCat(cat, level) },
                { title: `${prefix}Brand Manager`, skills: ['Brand Strategy', 'Marketing', 'PR', 'Campagne'], salary: _salaryByCat(cat, level) },
            ];
        }
        // general
        return [
            { title: `${prefix}Project Manager`, skills: ['Agile', 'Scrum', 'Jira', 'Stakeholder Management'], salary: _salaryByCat('general', level) },
            { title: `${prefix}Business Analyst`, skills: ['Data Analysis', 'Excel', 'SQL', 'Strategic Planning'], salary: _salaryByCat('general', level) },
            { title: `${prefix}Product Manager`, skills: ['Product Management', 'OKR', 'Agile', 'Analytics'], salary: _salaryByCat('general', level) },
            hasFigma ? { title: `${prefix}UX/UI Designer`, skills: ['Figma', 'UX Research', 'Prototyping', 'Design System'], salary: _salaryByCat('design', level) }
                     : { title: `${prefix}Operations Manager`, skills: ['Operations', 'Budget Management', 'Leadership', 'Excel'], salary: _salaryByCat('general', level) },
            { title: `${prefix}Customer Success Manager`, skills: ['CRM', 'Salesforce', 'Communication', 'NPS'], salary: _salaryByCat('general', level) },
            { title: `${prefix}HR Business Partner`, skills: ['HR', 'Recruiting', 'Leadership', 'Communication'], salary: _salaryByCat('general', level) },
        ];
    }

    function _salaryByCat(cat, level) {
        const ranges = {
            tech:      { Junior: '€28k–38k', Mid: '€40k–58k', Senior: '€58k–85k' },
            marketing: { Junior: '€22k–30k', Mid: '€30k–45k', Senior: '€45k–65k' },
            finance:   { Junior: '€26k–34k', Mid: '€35k–52k', Senior: '€52k–80k' },
            design:    { Junior: '€24k–32k', Mid: '€32k–48k', Senior: '€48k–70k' },
            general:   { Junior: '€22k–30k', Mid: '€30k–48k', Senior: '€48k–72k' }
        };
        return (ranges[cat] || ranges.general)[level] || '€30k–50k';
    }

    function _companiesByCat(cat) {
        if (cat === 'tech') return ['Satispay', 'Scalapay', 'Musixmatch', 'ProntoPro', 'Prima Assicurazioni', 'Casavo', 'Subito.it', 'Enel X', 'Zucchetti', 'Dedagroup', 'Engineering', 'Accenture'];
        if (cat === 'marketing') return ['Zalando', 'Trovaprezzi', 'Yoox Net-a-Porter', 'TeamSystem', 'Wolters Kluwer', 'Mondadori', 'RCS MediaGroup', 'Accenture', 'WPP', 'GroupM'];
        if (cat === 'design') return ['Frog Design', 'Bending Spoons', 'Musixmatch', 'Satispay', 'Prima', 'Tangity', 'Sketchin', 'Accenture Song'];
        return ['McKinsey', 'Boston Consulting Group', 'Deloitte', 'Accenture', 'KPMG', 'PwC', 'EY', 'Bain & Company', 'Roland Berger', 'Capgemini'];
    }

    function _buildReasoning(score, cvSkills, jobSkills, lang) {
        const matchingSkills = cvSkills.filter(k => jobSkills.some(js => js.toLowerCase().includes(k.toLowerCase())));
        if (score >= 80) {
            return `Ottima corrispondenza! Le tue competenze in ${matchingSkills.slice(0,2).join(' e ')} corrispondono molto bene ai requisiti di questa posizione. Candidatura altamente consigliata.`;
        } else if (score >= 60) {
            return `Buona compatibilità. ${matchingSkills.length > 0 ? `Hai competenze in ${matchingSkills.slice(0,2).join(' e ')} che sono rilevanti.` : 'Il tuo profilo è compatibile con questa posizione.'} Alcune skill aggiuntive potrebbero rafforzare la candidatura.`;
        } else {
            return `Compatibilità parziale. Questa posizione potrebbe richiedere qualche competenza aggiuntiva rispetto al tuo profilo attuale. Valuta se integrare le skill mancanti.`;
        }
    }

    function _findMissingSkills(cvSkills, jobSkills) {
        return jobSkills.filter(js => !cvSkills.some(cs => js.toLowerCase().includes(cs.toLowerCase()))).slice(0, 3);
    }
})();

