/**
 * CV Builder v3 – Advanced Parser, Editor Fields & Template Engine
 * Non-module global script (no ES6 exports)
 */

const cvBuilder = (() => {

    // ─── SKILL TAXONOMY ────────────────────────────────────────────────────────
    const SKILL_TAXONOMY = {
        tech: ["JavaScript","TypeScript","React","Vue","Angular","Next.js","Node.js","Express","Python","Django","Flask","FastAPI","Java","Spring Boot","C#",".NET","C++","Go","Rust","PHP","Laravel","Ruby","Rails","Swift","Kotlin","Flutter","Dart","SQL","PostgreSQL","MySQL","SQLite","MongoDB","Redis","Elasticsearch","Docker","Kubernetes","AWS","Azure","GCP","Terraform","Ansible","CI/CD","GitHub Actions","Jenkins","Git","REST API","GraphQL","HTML","CSS","Sass","Tailwind","Webpack","Vite","Jest","Cypress","Playwright","Linux","Nginx","Figma","Jira","Confluence","Agile","Scrum","Kanban","Machine Learning","TensorFlow","PyTorch","Pandas","NumPy","Spark","Tableau","Power BI","R","MATLAB","Selenium"],
        marketing: ["SEO","SEM","Google Ads","Meta Ads","Facebook Ads","TikTok Ads","LinkedIn Ads","CRM","HubSpot","Salesforce","Mailchimp","ActiveCampaign","Klaviyo","Google Analytics","GA4","Looker Studio","Power BI","Tableau","Content Marketing","Copywriting","Social Media","Growth Hacking","Email Marketing","Conversion Optimization","A/B Testing","Funnel","Lead Generation","UX Writing","Brand Strategy","PR","Influencer Marketing","Affiliate Marketing","Marketing Automation"],
        soft: ["Leadership","Project Management","Team Building","Public Speaking","Negotiation","Strategic Planning","Budget Management","Stakeholder Management","Communication","Mentoring","Data Analysis","Problem Solving","Critical Thinking","Time Management","Adaptability","Creativity","Conflict Resolution","Coaching","Change Management","Decision Making"],
        design: ["Figma","Adobe XD","Sketch","InVision","Photoshop","Illustrator","After Effects","Premiere Pro","UX Research","UI Design","Prototyping","Wireframing","User Testing","Design System","Motion Design","3D Modeling","Blender","Cinema 4D"],
        finance: ["Excel","Financial Modeling","Valuation","DCF","M&A","Private Equity","Venture Capital","Accounting","Tax","Audit","SAP","Oracle","QuickBooks","Bloomberg","Reuters","Risk Management","Compliance","Financial Reporting","IFRS","Budgeting","Forecasting"],
        languages: ["Italiano","Inglese","English","Francese","Français","Spagnolo","Español","Tedesco","Deutsch","Portoghese","Português","Cinese","中文","Giapponese","日本語","Arabo","العربية","Russo","Olandese","Polacco","Turco","Coreano"]
    };

    // ─── I18N ──────────────────────────────────────────────────────────────────
    const I18N = {
        it: { summary:"Profilo Professionale", experience:"Esperienze Lavorative", skills:"Competenze", languages:"Lingue", education:"Formazione", contacts:"Contatti", present:"Presente", templateLabels:{ professional:"Professionale", modern:"Moderno", creative:"Creativo Bold", minimal:"Minimal ATS" }},
        en: { summary:"Professional Summary", experience:"Work Experience", skills:"Skills", languages:"Languages", education:"Education", contacts:"Contact", present:"Present", templateLabels:{ professional:"Professional", modern:"Modern", creative:"Creative Bold", minimal:"Minimal ATS" }},
        fr: { summary:"Profil Professionnel", experience:"Expériences Professionnelles", skills:"Compétences", languages:"Langues", education:"Formation", contacts:"Contact", present:"Présent", templateLabels:{ professional:"Professionnel", modern:"Moderne", creative:"Créatif Bold", minimal:"Minimal ATS" }},
        es: { summary:"Perfil Profesional", experience:"Experiencia Laboral", skills:"Habilidades", languages:"Idiomas", education:"Educación", contacts:"Contacto", present:"Presente", templateLabels:{ professional:"Profesional", modern:"Moderno", creative:"Creativo Bold", minimal:"Minimal ATS" }},
        de: { summary:"Berufliches Profil", experience:"Berufserfahrung", skills:"Fähigkeiten", languages:"Sprachen", education:"Ausbildung", contacts:"Kontakt", present:"Heute", templateLabels:{ professional:"Professionell", modern:"Modern", creative:"Kreativ Bold", minimal:"Minimal ATS" }}
    };

    // ─── ADVANCED CV PARSER ────────────────────────────────────────────────────
    function extractCvData(cvText) {
        if (!cvText || !cvText.trim()) return _emptyData();
        const lines = cvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const lower = cvText.toLowerCase();

        // ── Name detection (first meaningful line, title case or all caps)
        let name = "";
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const l = lines[i];
            if (l.length > 2 && l.length < 60 && !/[@\d:\/\.]{2,}/.test(l)) {
                name = l.replace(/^#+\s*/, "").trim();
                break;
            }
        }
        if (!name) name = lines[0] || "";

        // ── Role/title detection
        let role = "";
        const roleKeywords = /developer|engineer|designer|manager|analyst|consultant|specialist|architect|lead|director|officer|coordinator|executive|marketing|sales|finance|devops|scientist|researcher|founder|freelan|sviluppatore|ingegnere|programmatore|progettista|analista|consulente|specialista|responsabile|direttore|amministratore|coordinatore|esperto|tecnico|grafico/i;
        for (let i = 1; i < Math.min(8, lines.length); i++) {
            const l = lines[i];
            if (roleKeywords.test(l) && l.length < 80) {
                role = l.trim();
                break;
            }
        }

        // ── Contact info
        const emailMatch = cvText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = cvText.match(/(\+?[\d\s\-().]{9,18})/);
        const linkedinMatch = cvText.match(/linkedin\.com\/in\/[\w\-]+/i);
        const githubMatch = cvText.match(/github\.com\/[\w\-]+/i);
        const websiteMatch = cvText.match(/https?:\/\/(?!linkedin|github)[^\s,]+/i);
        
        // ── Location detection
        let location = "";
        const locationPrefixes = /(?:residenza|domicilio|città|citta|indirizzo|location|address|lives in|basato a|base|città di|residente a|residente in|posto|sede)[:\s\n]+([a-zA-Z\s]{2,25})/i;
        const prefixMatch = cvText.match(locationPrefixes);
        if (prefixMatch && prefixMatch[1]) {
            location = prefixMatch[1].trim();
        } else {
            const cities = [
                "Milano", "Roma", "Torino", "Napoli", "Bologna", "Firenze", "Venezia", "Palermo", "Genova", "Bari",
                "Catania", "Verona", "Messina", "Padova", "Trieste", "Brescia", "Parma", "Taranto", "Prato",
                "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia",
                "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania", "Monza", "Siracusa", 
                "Pescara", "Bergamo", "Forlì", "Trento", "Vicenza", "Terni", "Bolzano", "Novara", "Piacenza", "Ancona",
                "Andria", "Udine", "Arezzo", "Cesena", "Lecce", "Pisa", "Lucca", "Siena", "Como", "Varese", "Berlin",
                "London", "Paris", "Madrid", "Barcelona", "Amsterdam", "Vienna", "Zurich", "Munich", "Hamburg",
                "Frankfurt", "New York", "San Francisco", "Remote"
            ];
            for (let city of cities) {
                const rx = new RegExp(`\\b${city}\\b`, "i");
                if (rx.test(cvText)) {
                    location = city;
                    break;
                }
            }
        }

        // ── Skills detection
        const allSkills = [...SKILL_TAXONOMY.tech, ...SKILL_TAXONOMY.marketing, ...SKILL_TAXONOMY.soft, ...SKILL_TAXONOMY.design, ...SKILL_TAXONOMY.finance];
        const skills = allSkills.filter(s => lower.includes(s.toLowerCase()));

        // ── Language detection
        const langs = SKILL_TAXONOMY.languages.filter(l => lower.includes(l.toLowerCase()));
        const langProfiles = [];
        const langProficiency = /\b(italiano|inglese|english|francese|français|spagnolo|español|tedesco|deutsch|portoghese|cinese|giapponese|arabo|russo|olandese)\b[^\n]{0,30}(madre\s?lingua|nativo|fluente|avanzato|b2|c1|c2|ottimo|buono|intermedio|base|a1|a2|b1|elementare|professionale)/gi;
        let lm;
        while ((lm = langProficiency.exec(cvText)) !== null) {
            langProfiles.push({ name: lm[1], level: lm[2] });
        }

        // ── Summary extraction
        let summary = "";
        const summarySection = cvText.match(/(?:sommario|profilo|obiettivo|about\s+me|summary|presentazione|chi\s+sono|professional\s+summary|career\s+objective)[:\s\n]+([\s\S]{20,400}?)(?:\n\n|\n[A-Z]|\nESPERIENZ|\nEDUCAZ|\nSKILL|\nFORMAZ|\nISTRUZ|$)/i);
        if (summarySection) {
            summary = summarySection[1].replace(/\n+/g, " ").trim();
        } else {
            const candidates = lines.filter((l, i) => i > 0 && l.length > 60 && !/^[-•*▪►\d]/.test(l) && !/^[A-Z\s]{5,}$/.test(l));
            if (candidates.length > 0) summary = candidates.slice(0, 2).join(" ");
        }

        // ── Experiences extraction
        const experiences = _extractExperiences(cvText, lines);

        // ── Education extraction
        const education = _extractEducation(cvText, lines);

        // ── Seniority / Years of experience
        const yoeMatch = cvText.match(/(\d+)\+?\s*(?:anni|years?|ans)\s+(?:di\s+)?(?:esperienza|experience|évaluation)/i);
        const yearsOfExp = yoeMatch ? parseInt(yoeMatch[1]) : _estimateYears(experiences);
        const seniority = yearsOfExp >= 8 ? "Senior" : yearsOfExp >= 4 ? "Mid" : yearsOfExp >= 1 ? "Junior" : "";

        return {
            name: name || "Il Tuo Nome",
            role: role || "",
            email: emailMatch ? emailMatch[0] : "",
            phone: phoneMatch ? phoneMatch[0].trim().substring(0, 20) : "",
            linkedin: linkedinMatch ? linkedinMatch[0] : "",
            github: githubMatch ? githubMatch[0] : "",
            website: websiteMatch ? websiteMatch[0] : "",
            location: location || "Italia",
            summary,
            skills: [...new Set(skills)].slice(0, 16),
            languages: langProfiles.length > 0 ? langProfiles : langs.slice(0, 6).map(n => ({ name: n, level: "" })),
            experiences,
            education,
            yearsOfExp,
            seniority
        };
    }

    function _emptyData() {
        return { name:"", role:"", email:"", phone:"", linkedin:"", github:"", website:"", location:"", summary:"", skills:[], languages:[], experiences:[], education:[], yearsOfExp:0, seniority:"" };
    }

    function _extractExperiences(cvText, lines) {
        const exps = [];
        const sectionRx = /(?:esperienz[ae]\s+lavorativ[ae]|work\s+experience|professional\s+experience|employment|career|storia\s+lavorativa|percorso\s+professionale|lavori|esperienze\s+professionali)[:\s\n]+([\s\S]+?)(?:\n\n\n|\nFORMAZ|\nEDUCAZ|\nISTRUZ|\nCOMPETENZ|\nSKILL|\nLINGU|\nCERTIF|PITCH|$)/i;
        const section = cvText.match(sectionRx);
        const source = section ? section[1] : cvText;

        // Date range matching with support for months, various treat characters
        const dateRx = /(?:(?:da|dal|dall['a]|from)\s+)?((?:(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|january|february|march|april|may|june|july|august|september|october|november|december|gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})[\s/\\]?)?\d{4})\s*(?:(?:a|al|all['a]|to|[-–—])\s*)((?:(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|january|february|march|april|may|june|july|august|september|october|november|december|gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})[\s/\\]?)?\d{4}|presente|present|today|ongoing|ora|oggi|attuale|current)/gi;
        const dateMatches = [...source.matchAll(dateRx)];

        if (dateMatches.length > 0) {
            dateMatches.forEach((m, idx) => {
                const start = m.index;
                const end = dateMatches[idx + 1] ? dateMatches[idx + 1].index : source.length;
                const prevEnd = idx > 0 ? dateMatches[idx - 1].index + dateMatches[idx - 1][0].length : 0;
                const blockStart = Math.max(prevEnd, start - 120);
                const block = source.substring(blockStart, end).trim();
                const blockLines = block.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

                let expRole = "";
                let expCompany = "";
                let expBullets = [];
                
                const dateMatchText = m[0];
                const dateStr = `${m[1]} - ${m[2]}`;

                const nonBulletLines = blockLines.filter(l => !/^[-•*▪►]/.test(l) && l.length > 2);
                let titleLine = "";

                const dateLineIdx = blockLines.findIndex(l => l.includes(dateMatchText));
                if (dateLineIdx !== -1) {
                    const cleanLine = blockLines[dateLineIdx].replace(dateMatchText, "").replace(/^[,\s|–\-\(]+|[,\s|–\-\)]+$/g, "").trim();
                    if (cleanLine.length > 3 && !/^[-•*▪►]/.test(cleanLine)) {
                        titleLine = cleanLine;
                    } else if (dateLineIdx > 0) {
                        titleLine = blockLines[dateLineIdx - 1];
                    }
                }

                if (!titleLine && nonBulletLines.length > 0) {
                    titleLine = nonBulletLines[0];
                }

                const roleKeywords = /developer|engineer|designer|manager|analyst|consultant|specialist|architect|lead|director|officer|coordinator|executive|marketing|sales|finance|devops|scientist|researcher|founder|freelan|sviluppatore|ingegnere|programmatore|progettista|analista|consulente|specialista|responsabile|direttore|amministratore|coordinatore|esperto|tecnico|grafico/i;

                if (titleLine) {
                    const separators = [/\s+presso\s+/i, /\s+at\s+/i, /\s*\|\s*/, /\s*–\s*/, /\s*-\s*/, /\s*,\s*/, /\s*@\s*/];
                    let splitSuccess = false;
                    for (let sep of separators) {
                        const parts = titleLine.split(sep);
                        if (parts.length >= 2) {
                            const part1 = parts[0].trim();
                            const part2 = parts[1].trim();
                            if (roleKeywords.test(part1)) {
                                expRole = part1;
                                expCompany = part2;
                            } else if (roleKeywords.test(part2)) {
                                expRole = part2;
                                expCompany = part1;
                            } else {
                                expRole = part1;
                                expCompany = part2;
                            }
                            splitSuccess = true;
                            break;
                        }
                    }
                    if (!splitSuccess) {
                        expRole = titleLine;
                    }
                }

                blockLines.forEach(l => {
                    if (/^[-•*▪►]/.test(l)) {
                        expBullets.push(l.replace(/^[-•*▪►]\s*/, "").trim());
                    } else if (l !== titleLine && l.length > 20 && !l.includes(dateMatchText)) {
                        expBullets.push(l);
                    }
                });

                if (expRole || expCompany) {
                    exps.push({
                        role: expRole,
                        company: expCompany,
                        dates: dateStr,
                        bullets: expBullets.slice(0, 5)
                    });
                }
            });
        }

        if (exps.length === 0) {
            const bullets = lines.filter(l => /^[-•*▪►]/.test(l)).map(l => l.replace(/^[-•*▪►]\s*/, "").trim());
            if (bullets.length > 0) {
                exps.push({ role: "", company: "", dates: "", bullets: bullets.slice(0, 6) });
            }
        }

        return exps.slice(0, 5);
    }

    function _extractEducation(cvText, lines) {
        const edu = [];
        const sectionRx = /(?:formazione|istruzione|education|études|ausbildung|studi|corsi|università)[:\s\n]+([\s\S]+?)(?:\n\n\n|\nESPERIENZ|\nCOMPETENZ|\nSKILL|\nLINGU|\nCERTIF|PITCH|$)/i;
        const section = cvText.match(sectionRx);
        const source = section ? section[1] : "";
        
        if (!source) {
            const eduKeywords = /laurea|diploma|master|bachelor|ph\.d|doctorate|università|university|school|liceo|istituto|corso/i;
            const candidateLines = lines.filter(l => eduKeywords.test(l) && l.length < 120);
            candidateLines.forEach(l => {
                const yearMatch = l.match(/\d{4}/);
                const degree = l.replace(/\d{4}[\s\-–—]*\d{0,4}/g, "").replace(/^[,\s|–\-]+|[,\s|–\-]+$/g, "").trim();
                if (degree.length > 5) {
                    edu.push({ degree, institution: "", year: yearMatch ? yearMatch[0] : "" });
                }
            });
            return edu.slice(0, 4);
        }

        const eduLines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
        eduLines.forEach((l, idx) => {
            const yearMatch = l.match(/\d{4}/);
            const degreeKeywords = /laurea|diploma|master|bachelor|ph\.d|doctorate|corso|certificazione|certified|academy|school/i;
            if (degreeKeywords.test(l) || yearMatch) {
                let degree = l;
                let institution = "";
                let year = yearMatch ? yearMatch[0] : "";
                
                const splitters = [/\s+presso\s+/i, /\s+at\s+/i, /\s*\|\s*/, /\s*–\s*/, /\s*-\s*/, /\s*,\s*/];
                let splitSuccess = false;
                for (let splitter of splitters) {
                    const parts = l.split(splitter);
                    if (parts.length >= 2) {
                        degree = parts[0].replace(/\d{4}/g, "").replace(/^[,\s|–\-]+|[,\s|–\-]+$/g, "").trim();
                        institution = parts[1].replace(/\d{4}/g, "").replace(/^[,\s|–\-]+|[,\s|–\-]+$/g, "").trim();
                        splitSuccess = true;
                        break;
                    }
                }
                
                if (!splitSuccess) {
                    degree = l.replace(/\d{4}/g, "").replace(/^[,\s|–\-]+|[,\s|–\-]+$/g, "").trim();
                    if (eduLines[idx + 1] && eduLines[idx + 1].length < 80 && !eduLines[idx + 1].match(/\d{4}/) && !degreeKeywords.test(eduLines[idx + 1])) {
                        institution = eduLines[idx + 1];
                    }
                }
                
                if (degree.length > 4) {
                    edu.push({ degree, institution, year });
                }
            }
        });
        
        return edu.slice(0, 4);
    }
    function _estimateYears(experiences) {
        let total = 0;
        experiences.forEach(exp => {
            if (!exp.dates) return;
            const m = exp.dates.match(/(\d{4})\s*[-–—]\s*(\d{4}|presente|present|oggi)/i);
            if (m) {
                const start = parseInt(m[1]);
                const end = /\d{4}/.test(m[2]) ? parseInt(m[2]) : new Date().getFullYear();
                total += Math.max(0, end - start);
            }
        });
        return total;
    }

    // ─── SVG ICONS FOR CONTACTS ────────────────────────────────────────────────
    const svgEmail = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const svgPhone = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    const svgLocation = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const svgLinkedin = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
    const svgGithub = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
    const svgWebsite = `<svg style="display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

    // ─── TEMPLATE: PROFESSIONAL ───────────────────────────────────────────────
    function renderProfessional(d, t) {
        const skillsHtml = d.skills.map(s =>
            `<span style="display:inline-block;background:#f1f5f9;color:#334155;border-radius:4px;padding:3.5px 11px;font-size:11.5px;margin:2px 4px 2px 0;font-weight:500;border:1px solid #e2e8f0;font-family:'Inter',sans-serif;">${s}</span>`
        ).join("");
        const langsHtml = d.languages.map(l =>
            `<span style="font-size:13px;color:#374151;">${typeof l === "string" ? l : `${l.name}${l.level ? ` <span style="color:#64748b;font-size:11px;font-weight:normal;">(${l.level})</span>` : ""}`}</span>`
        ).join(" &nbsp;·&nbsp; ");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:3px;">
      <div>
        <strong style="font-size:14.5px;color:#0f172a;font-family:'Inter',sans-serif;">${exp.role || "Ruolo"}</strong>
        <span style="font-size:13px;color:#4f46e5;font-weight:600;margin-left:6px;">| &nbsp;${exp.company || ""}</span>
      </div>
      ${exp.dates ? `<span style="font-size:12px;color:#64748b;white-space:nowrap;font-weight:500;">${exp.dates}</span>` : ""}
    </div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:6px 0 0;padding-left:18px;list-style-type:square;">${exp.bullets.map(b => `<li style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:4.5px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">
    <div>
      <strong style="font-size:13.5px;color:#0f172a;">${e.degree}</strong>
      ${e.institution ? `<span style="font-size:12.5px;color:#4f46e5;font-weight:600;margin-left:6px;">// &nbsp;${e.institution}</span>` : ""}
    </div>
    ${e.year ? `<span style="font-size:11.5px;color:#64748b;font-weight:500;">${e.year}</span>` : ""}
  </div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid #4f46e5;flex-shrink:0;margin-right:20px;box-shadow: 0 4px 12px rgba(79,70,229,0.15);">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Inter',sans-serif;background:#ffffff;max-width:800px;margin:0 auto;padding:48px 56px;color:#1e293b;line-height:1.5;font-size:13.5px;box-sizing:border-box;">
  <div style="border-bottom:3px solid #4f46e5;padding-bottom:22px;margin-bottom:28px;display:flex;align-items:center;">
    ${photoHtml}
    <div style="flex:1;">
      <h1 style="font-size:32px;font-weight:800;margin:0 0 3px;color:#0f172a;letter-spacing:-0.5px;line-height:1.1;">${d.name}</h1>
      ${d.role ? `<p style="font-size:15px;color:#4f46e5;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">${d.role}</p>` : ""}
      <div style="display:flex;gap:18px;flex-wrap:wrap;font-size:11.5px;color:#64748b;align-items:center;line-height:1.6;">
        ${d.email ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgEmail}${d.email}</span>` : ""}
        ${d.phone ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgPhone}${d.phone}</span>` : ""}
        ${d.location ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgLocation}${d.location}</span>` : ""}
        ${d.linkedin ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgLinkedin}${d.linkedin}</span>` : ""}
        ${d.github ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgGithub}${d.github}</span>` : ""}
        ${d.website ? `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${svgWebsite}${d.website}</span>` : ""}
      </div>
    </div>
  </div>
  ${d.summary ? `<div style="margin-bottom:26px;">
    <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px;font-family:'Inter',sans-serif;">${t.summary}</h3>
    <p style="color:#334155;font-size:13.5px;line-height:1.7;margin:0;text-align:justify;">${d.summary}</p>
  </div>` : ""}
  ${d.experiences.length > 0 ? `<div style="margin-bottom:26px;">
    <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:14px;font-family:'Inter',sans-serif;">${t.experience}</h3>
    ${expHtml}
  </div>` : ""}
  ${d.skills.length > 0 ? `<div style="margin-bottom:24px;">
    <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px;font-family:'Inter',sans-serif;">${t.skills}</h3>
    <div style="display:flex;flex-wrap:wrap;gap:4px;">${skillsHtml}</div>
  </div>` : ""}
  ${d.education.length > 0 ? `<div style="margin-bottom:24px;">
    <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:14px;font-family:'Inter',sans-serif;">${t.education}</h3>
    ${eduHtml}
  </div>` : ""}
  ${d.languages.length > 0 ? `<div>
    <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:10px;font-family:'Inter',sans-serif;">${t.languages}</h3>
    <p style="font-size:13px;color:#334155;margin:0;">${langsHtml}</p>
  </div>` : ""}
</div>`;
    }

    // ─── TEMPLATE: MODERN (two column) ────────────────────────────────────────
    function renderModern(d, t) {
        const skillsHtml = d.skills.map(s =>
            `<div style="padding:4.5px 10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:4px;font-size:11.5px;margin-bottom:6px;color:#fff;font-weight:500;text-align:center;font-family:'Inter',sans-serif;">${s}</div>`
        ).join("");
        const langsHtml = d.languages.map(l =>
            `<div style="padding:4.5px 10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:4px;font-size:11.5px;margin-bottom:6px;color:#fff;"><strong>${typeof l === "string" ? l : l.name}</strong>${l.level ? ` <span style="opacity:.65;font-size:9.5px;">(${l.level})</span>` : ""}</div>`
        ).join("");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
      <div>
        <strong style="font-size:14px;color:#0f172a;font-family:'Inter',sans-serif;">${exp.role || ""}</strong>
        <div style="font-size:12.5px;color:#4f46e5;font-weight:600;">${exp.company || ""}</div>
      </div>
      ${exp.dates ? `<span style="font-size:11.5px;color:#64748b;font-weight:500;">${exp.dates}</span>` : ""}
    </div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:8px 0 0;padding-left:16px;list-style-type:circle;">${exp.bullets.map(b => `<li style="font-size:12.5px;color:#374151;line-height:1.6;margin-bottom:4px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:14px;color:#fff;opacity:0.95;">
    <div style="font-size:12.5px;font-weight:700;color:#38bdf8;">${e.degree}</div>
    ${e.institution ? `<div style="font-size:11.5px;opacity:0.85;">${e.institution}</div>` : ""}
    ${e.year ? `<div style="font-size:10.5px;opacity:0.65;margin-top:2px;">${e.year}</div>` : ""}
  </div>`).join("");

        const avatarHtml = d.photo 
            ? `<img src="${d.photo}" style="width:84px;height:84px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 18px;border:3px solid #38bdf8;box-shadow: 0 4px 12px rgba(0,0,0,0.3);">` 
            : `<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin:0 auto 16px;letter-spacing:-1px;border:1px solid rgba(255,255,255,0.2);">
      ${d.name.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase()}
    </div>`;

        return `<div id="cv-print-content" style="font-family:'Inter',sans-serif;display:flex;max-width:800px;margin:0 auto;min-height:750px;box-sizing:border-box;">
  <div style="width:230px;min-width:230px;background:linear-gradient(170deg,#1e293b,#0f172a);padding:36px 20px;color:#fff;flex-shrink:0;box-sizing:border-box;">
    ${avatarHtml}
    <h1 style="font-size:19px;font-weight:800;text-align:center;margin:0 0 4px;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">${d.name}</h1>
    ${d.role ? `<p style="font-size:11.5px;text-align:center;color:#38bdf8;margin:0 0 20px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${d.role}</p>` : ""}
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin-bottom:20px;">
    <div style="font-size:11px;line-height:2.0;color:#cbd5e1;word-break:break-all;">
      ${d.email ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgEmail} ${d.email}</p>` : ""}
      ${d.phone ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgPhone} ${d.phone}</p>` : ""}
      ${d.location ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgLocation} ${d.location}</p>` : ""}
      ${d.linkedin ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgLinkedin} ${d.linkedin}</p>` : ""}
      ${d.github ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgGithub} ${d.github}</p>` : ""}
      ${d.website ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgWebsite} ${d.website}</p>` : ""}
    </div>
    ${d.skills.length > 0 ? `<p style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#38bdf8;margin:26px 0 10px;font-family:'Inter',sans-serif;">${t.skills}</p>${skillsHtml}` : ""}
    ${d.languages.length > 0 ? `<p style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#38bdf8;margin:22px 0 10px;font-family:'Inter',sans-serif;">${t.languages}</p>${langsHtml}` : ""}
    ${d.education.length > 0 ? `<p style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#38bdf8;margin:22px 0 10px;font-family:'Inter',sans-serif;">${t.education}</p>
      ${eduHtml}` : ""}
  </div>
  <div style="flex:1;padding:36px 32px;background:#ffffff;overflow:hidden;box-sizing:border-box;">
    ${d.summary ? `<div style="margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #f1f5f9;">
      <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#0f172a;margin:0 0 10px;border-left:3px solid #4f46e5;padding-left:8px;font-family:'Inter',sans-serif;">${t.summary}</h3>
      <p style="color:#374151;font-size:13.5px;line-height:1.75;margin:0;text-align:justify;">${d.summary}</p>
    </div>` : ""}
    ${d.experiences.length > 0 ? `<div>
      <h3 style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#0f172a;margin:0 0 18px;border-left:3px solid #4f46e5;padding-left:8px;font-family:'Inter',sans-serif;">${t.experience}</h3>
      ${expHtml}
    </div>` : ""}
  </div>
</div>`;
    }

    // ─── TEMPLATE: CREATIVE ───────────────────────────────────────────────────
    function renderCreative(d, t) {
        const skillsHtml = d.skills.map(s =>
            `<span style="display:inline-block;border:1.5px solid rgba(79,70,229,0.3);color:#4f46e5;border-radius:20px;padding:3.5px 12px;font-size:11.5px;margin:3px;font-weight:600;font-family:'Outfit',sans-serif;">${s}</span>`
        ).join("");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:22px;position:relative;padding-left:24px;">
    <div style="position:absolute;left:-4px;top:4px;width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#ec4899);border:2px solid white;z-index:2;"></div>
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
      <div>
        <strong style="font-size:15px;font-weight:800;color:#0f172a;font-family:'Outfit',sans-serif;">${exp.role || ""}</strong>
        <span style="font-size:13px;color:#4f46e5;font-weight:700;margin-left:6px;">@ ${exp.company || ""}</span>
      </div>
      ${exp.dates ? `<span style="font-size:11px;color:#4f46e5;background:rgba(79,70,229,0.06);padding:3px 9px;border-radius:20px;font-weight:700;font-family:'Outfit',sans-serif;">${exp.dates}</span>` : ""}
    </div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="list-style:none;padding:0;margin:6px 0 0;">${exp.bullets.map(b => `<li style="font-size:13px;color:#334155;line-height:1.7;border-left:3px solid #ec4899;padding-left:10px;margin-bottom:6px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;flex-wrap:wrap;">
    <div><div style="font-size:13.5px;font-weight:700;color:#0f172a;">${e.degree}</div>${e.institution?`<div style="font-size:12px;color:#4f46e5;font-weight:600;">${e.institution}</div>`:""}</div>
    ${e.year ? `<span style="font-size:11.5px;color:#94a3b8;font-weight:500;">${e.year}</span>` : ""}
  </div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.45);flex-shrink:0;margin-right:20px;box-shadow:0 4px 14px rgba(0,0,0,0.18);">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Outfit',sans-serif;max-width:800px;margin:0 auto;background:#ffffff;box-sizing:border-box;">
  <div style="background:linear-gradient(130deg,#4f46e5 0%,#7c3aed 50%,#ec4899 100%);padding:40px 48px;color:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;">
        ${photoHtml}
        <div>
          <h1 style="font-size:36px;font-weight:800;margin:0 0 4px;letter-spacing:-1px;color:#ffffff;line-height:1.1;">${d.name}</h1>
          ${d.role ? `<p style="font-size:15px;margin:0;opacity:0.9;font-weight:600;color:#f3e8ff;text-transform:uppercase;letter-spacing:1px;">${d.role}</p>` : ""}
        </div>
      </div>
      <div style="text-align:right;font-size:11.5px;opacity:0.9;line-height:1.8;flex-shrink:0;color:#ffffff;font-family:'Inter',sans-serif;">
        ${d.email ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgEmail}${d.email}</p>` : ""}
        ${d.phone ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgPhone}${d.phone}</p>` : ""}
        ${d.location ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgLocation}${d.location}</p>` : ""}
        ${d.linkedin ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgLinkedin}${d.linkedin}</p>` : ""}
        ${d.github ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgGithub}${d.github}</p>` : ""}
        ${d.website ? `<p style="margin:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;">${svgWebsite}${d.website}</p>` : ""}
      </div>
    </div>
  </div>
  <div style="padding:36px 48px;box-sizing:border-box;">
    ${d.summary ? `<div style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="width:26px;height:26px;background:linear-gradient(135deg,#4f46e5,#ec4899);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:#fff;">⚡</span>
        <h3 style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin:0;">${t.summary}</h3>
      </div>
      <p style="color:#374151;font-size:13.5px;line-height:1.75;margin:0;background:#f8fafc;padding:16px;border-radius:8px;text-align:justify;">${d.summary}</p>
    </div>` : ""}
    ${d.experiences.length > 0 ? `<div style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="width:26px;height:26px;background:linear-gradient(135deg,#4f46e5,#ec4899);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:#fff;">🚀</span>
        <h3 style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin:0;">${t.experience}</h3>
      </div>
      <div style="border-left:2px solid #e2e8f0;margin-left:5px;position:relative;">${expHtml}</div>
    </div>` : ""}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
      ${d.skills.length > 0 ? `<div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="width:26px;height:26px;background:linear-gradient(135deg,#4f46e5,#ec4899);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:#fff;">✨</span>
          <h3 style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin:0;">${t.skills}</h3>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${skillsHtml}</div>
      </div>` : ""}
      <div>
        ${d.education.length > 0 ? `<div style="margin-bottom:22px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="width:26px;height:26px;background:linear-gradient(135deg,#4f46e5,#ec4899);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:#fff;">🎓</span>
            <h3 style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin:0;">${t.education}</h3>
          </div>
          ${eduHtml}
        </div>` : ""}
        ${d.languages.length > 0 ? `<div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="width:26px;height:26px;background:linear-gradient(135deg,#4f46e5,#ec4899);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:#fff;">🌍</span>
            <h3 style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin:0;">${t.languages}</h3>
          </div>
          ${d.languages.map(l => `<div style="font-size:13px;color:#374151;margin-bottom:6px;"><strong>${typeof l==="string"?l:l.name}</strong>${l.level?`<span style="color:#64748b;font-size:11px;margin-left:6px;">(${l.level})</span>`:""}</div>`).join("")}
        </div>` : ""}
      </div>
    </div>
  </div>
</div>`;
    }

    // ─── TEMPLATE: MINIMAL ATS ────────────────────────────────────────────────
    function renderMinimal(d, t) {
        const skillsList = d.skills.join(" · ");
        const langsList = d.languages.map(l => typeof l === "string" ? l : `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;">
      <strong style="font-size:13.5px;color:#111;">${exp.role || ""}${exp.company ? ` – ${exp.company}` : ""}</strong>
      ${exp.dates ? `<span style="font-size:12px;color:#555;">${exp.dates}</span>` : ""}
    </div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:6px 0 0;padding-left:18px;">${exp.bullets.map(b => `<li style="font-size:12.5px;color:#333;line-height:1.6;margin-bottom:3px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:8px;">
    <strong style="font-size:13px;">${e.degree}</strong>${e.institution?` – ${e.institution}`:""}${e.year?` (${e.year})`:""}</div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 12px;border:1px solid #111;">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Arial',sans-serif;max-width:780px;margin:0 auto;padding:36px 48px;color:#111;line-height:1.5;font-size:13px;background:#fff;box-sizing:border-box;">
  <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:20px;">
    ${photoHtml}
    <h1 style="font-size:26px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;color:#000;">${d.name}</h1>
    ${d.role ? `<p style="font-size:13px;font-weight:600;color:#444;margin:4px 0;">${d.role}</p>` : ""}
    <p style="font-size:11.5px;color:#555;margin:6px 0 0;">
      ${[d.email, d.phone, d.location, d.linkedin ? d.linkedin : "", d.github ? d.github : "", d.website ? d.website : ""].filter(Boolean).join(" | ")}
    </p>
  </div>
  ${d.summary ? `<div style="margin-bottom:18px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;color:#000;">${t.summary}</h3>
    <p style="color:#333;font-size:13px;line-height:1.65;margin:0;text-align:justify;">${d.summary}</p>
  </div>` : ""}
  ${d.experiences.length > 0 ? `<div style="margin-bottom:18px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:10px;color:#000;">${t.experience}</h3>
    ${expHtml}
  </div>` : ""}
  ${d.skills.length > 0 ? `<div style="margin-bottom:18px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;color:#000;">${t.skills}</h3>
    <p style="color:#333;margin:0;">${skillsList}</p>
  </div>` : ""}
  ${d.education.length > 0 ? `<div style="margin-bottom:18px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;color:#000;">${t.education}</h3>
    ${eduHtml}
  </div>` : ""}
  ${d.languages.length > 0 ? `<div>
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;color:#000;">${t.languages}</h3>
    <p style="color:#333;margin:0;">${langsList}</p>
  </div>` : ""}
</div>`;
    }

    // ─── TEMPLATE: EXECUTIVE SLATE (Georgia, classic elegant, right dates) ────
    function renderExecutive(d, t) {
        const skillsList = d.skills.join("  •  ");
        const langsHtml = d.languages.map(l => typeof l === "string" ? l : `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">
      <strong style="font-size:14.5px;color:#0f172a;">${exp.role || ""}</strong>
      ${exp.dates ? `<span style="font-size:12px;color:#475569;font-style:italic;">${exp.dates}</span>` : ""}
    </div>
    <div style="font-size:13px;color:#4f46e5;font-weight:600;margin-top:2px;">${exp.company || ""}</div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:8px 0 0;padding-left:18px;list-style-type:circle;">${exp.bullets.map(b => `<li style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:4px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:baseline;">
    <div>
      <strong style="font-size:13.5px;color:#0f172a;">${e.degree}</strong>
      ${e.institution ? `<div style="font-size:12.5px;color:#475569;">${e.institution}</div>` : ""}
    </div>
    ${e.year ? `<span style="font-size:12px;color:#475569;font-style:italic;">${e.year}</span>` : ""}
  </div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 16px;border:1px solid #4f46e5;padding:2px;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,0.1);">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Georgia',serif;max-width:800px;margin:0 auto;padding:48px 56px;color:#334155;line-height:1.6;font-size:13.5px;background:#ffffff;box-sizing:border-box;">
  <div style="text-align:center;margin-bottom:30px;">
    ${photoHtml}
    <h1 style="font-size:32px;font-weight:normal;margin:0 0 6px;color:#0f172a;letter-spacing:0.5px;">${d.name}</h1>
    ${d.role ? `<div style="font-size:14px;color:#4f46e5;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">${d.role}</div>` : ""}
    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-size:11.5px;color:#475569;border-top:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;padding:8px 0;font-family:'Inter',sans-serif;align-items:center;">
      ${d.email ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgEmail} ${d.email}</span>` : ""}
      ${d.phone ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgPhone} ${d.phone}</span>` : ""}
      ${d.location ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgLocation} ${d.location}</span>` : ""}
      ${d.linkedin ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgLinkedin} ${d.linkedin}</span>` : ""}
      ${d.github ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgGithub} ${d.github}</span>` : ""}
      ${d.website ? `<span style="display:inline-flex;align-items:center;gap:4px;">${svgWebsite} ${d.website}</span>` : ""}
    </div>
  </div>
  ${d.summary ? `<div style="margin-bottom:28px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;border-bottom:1px solid #4f46e5;padding-bottom:4px;margin-bottom:12px;font-family:'Inter',sans-serif;">${t.summary}</h3>
    <p style="color:#334155;font-size:13.5px;line-height:1.7;margin:0;font-style:italic;text-align:justify;">"${d.summary}"</p>
  </div>` : ""}
  ${d.experiences.length > 0 ? `<div style="margin-bottom:28px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;border-bottom:1px solid #4f46e5;padding-bottom:4px;margin-bottom:14px;font-family:'Inter',sans-serif;">${t.experience}</h3>
    ${expHtml}
  </div>` : ""}
  ${d.skills.length > 0 ? `<div style="margin-bottom:28px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;border-bottom:1px solid #4f46e5;padding-bottom:4px;margin-bottom:12px;font-family:'Inter',sans-serif;">${t.skills}</h3>
    <p style="color:#334155;line-height:1.7;margin:0;font-size:13px;word-spacing:1px;text-align:justify;">${skillsList}</p>
  </div>` : ""}
  ${d.education.length > 0 ? `<div style="margin-bottom:28px;">
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;border-bottom:1px solid #4f46e5;padding-bottom:4px;margin-bottom:14px;font-family:'Inter',sans-serif;">${t.education}</h3>
    ${eduHtml}
  </div>` : ""}
  ${d.languages.length > 0 ? `<div>
    <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;border-bottom:1px solid #4f46e5;padding-bottom:4px;margin-bottom:10px;font-family:'Inter',sans-serif;">${t.languages}</h3>
    <p style="color:#334155;margin:0;font-size:13px;">${langsHtml}</p>
  </div>` : ""}
</div>`;
    }

    // ─── TEMPLATE: TECH MINIMALIST (Monospace, CLI prompt style, Emerald) ─────
    function renderTechMinimal(d, t) {
        const skillsHtml = d.skills.map(s =>
            `<span style="display:inline-block;background:#e6f4ea;color:#137333;border:1px solid #ceead6;padding:2.5px 8px;font-size:11.5px;margin:2px;border-radius:3px;font-weight:bold;">${s}</span>`
        ).join("");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:18px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">
      <span style="font-weight:bold;color:#0f172a;font-size:13.5px;"># ${exp.role || ""}</span>
      ${exp.dates ? `<span style="font-size:11.5px;color:#10b981;font-weight:600;">[${exp.dates}]</span>` : ""}
    </div>
    <div style="color:#4b5563;font-size:12px;margin:2px 0;">// Company: ${exp.company || ""}</div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:6px 0 0;padding-left:16px;list-style-type:'- ';">${exp.bullets.map(b => `<li style="font-size:12.5px;color:#374151;line-height:1.6;margin-bottom:3px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:10px;">
    <div style="font-weight:bold;color:#0f172a;font-size:13px;">> ${e.degree}</div>
    <div style="font-size:12px;color:#4b5563;padding-left:14px;">// ${e.institution || ""}${e.year ? ` (${e.year})` : ""}</div>
  </div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:68px;height:68px;object-fit:cover;border:2px dashed #10b981;float:right;margin-left:15px;margin-bottom:10px;padding:2px;background:#fff;border-radius:4px;">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Courier New',Courier,monospace;max-width:780px;margin:0 auto;padding:40px;color:#1f2937;line-height:1.5;font-size:13px;background:#ffffff;box-sizing:border-box;">
  <div style="border-bottom:2px dashed #10b981;padding-bottom:20px;margin-bottom:24px;overflow:hidden;">
    ${photoHtml}
    <h1 style="font-size:26px;font-weight:bold;margin:0 0 4px;color:#0f172a;line-height:1.2;">$ cat cv_${d.name.toLowerCase().replace(/[^a-z]/g, '')}.txt</h1>
    ${d.role ? `<div style="font-size:13.5px;color:#10b981;font-weight:bold;margin-bottom:12px;">> Role: ${d.role}</div>` : ""}
    <div style="font-size:12px;color:#4b5563;line-height:1.8;">
      ${d.email ? `email: ${d.email}<br>` : ""}
      ${d.phone ? `phone: ${d.phone}<br>` : ""}
      ${d.location ? `location: ${d.location}<br>` : ""}
      ${d.linkedin ? `linkedin: ${d.linkedin}<br>` : ""}
      ${d.github ? `github: ${d.github}<br>` : ""}
      ${d.website ? `website: ${d.website}<br>` : ""}
    </div>
  </div>
  ${d.summary ? `<div style="margin-bottom:24px;">
    <div style="font-weight:bold;color:#10b981;margin-bottom:8px;">$ head -n 5 profile.md</div>
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;padding-left:14px;border-left:2px solid #ceead6;text-align:justify;">${d.summary}</p>
  </div>` : ""}
  ${d.experiences.length > 0 ? `<div style="margin-bottom:24px;">
    <div style="font-weight:bold;color:#10b981;margin-bottom:10px;">$ grep -A 10 "experience" cv.txt</div>
    <div style="padding-left:14px;">${expHtml}</div>
  </div>` : ""}
  ${d.skills.length > 0 ? `<div style="margin-bottom:24px;">
    <div style="font-weight:bold;color:#10b981;margin-bottom:8px;">$ cat skills.json</div>
    <div style="padding-left:14px;display:flex;flex-wrap:wrap;gap:4px;">${skillsHtml}</div>
  </div>` : ""}
  ${d.education.length > 0 ? `<div style="margin-bottom:24px;">
    <div style="font-weight:bold;color:#10b981;margin-bottom:10px;">$ cat education.txt</div>
    <div style="padding-left:14px;">${eduHtml}</div>
  </div>` : ""}
  ${d.languages.length > 0 ? `<div>
    <div style="font-weight:bold;color:#10b981;margin-bottom:8px;">$ cat languages.txt</div>
    <p style="color:#374151;margin:0;padding-left:14px;">
      ${d.languages.map(l => typeof l === "string" ? l : `${l.name} (${l.level || 'N/A'})`).join(" / ")}
    </p>
  </div>` : ""}
</div>`;
    }

    // ─── TEMPLATE: ACADEMIC (Classical, centered headers, italic subheadings) ─
    function renderAcademic(d, t) {
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:22px;text-align:left;">
    <div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:bold;color:#111;">
      <span>${exp.role || ""}</span>
      ${exp.dates ? `<span style="font-weight:normal;font-style:italic;color:#444;">${exp.dates}</span>` : ""}
    </div>
    <div style="font-style:italic;font-size:12.5px;color:#333;margin:2px 0 6px;">${exp.company || ""}</div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:6px 0 0;padding-left:20px;list-style-type:disc;text-align:justify;">${exp.bullets.map(b => `<li style="font-size:12.5px;color:#222;line-height:1.65;margin-bottom:4px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:bold;">
      <span>${e.degree}</span>
      ${e.year ? `<span style="font-weight:normal;font-style:italic;">${e.year}</span>` : ""}
    </div>
    ${e.institution ? `<div style="font-style:italic;font-size:12.5px;color:#333;">${e.institution}</div>` : ""}
  </div>`).join("");

        const photoHtml = d.photo 
            ? `<img src="${d.photo}" style="width:68px;height:68px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 12px;border:1px solid #111;">` 
            : "";

        return `<div id="cv-print-content" style="font-family:'Georgia','Times New Roman',serif;max-width:780px;margin:0 auto;padding:52px;color:#111;line-height:1.6;font-size:13px;background:#ffffff;box-sizing:border-box;">
  <div style="text-align:center;margin-bottom:26px;">
    ${photoHtml}
    <h1 style="font-size:26px;font-weight:normal;text-transform:uppercase;margin:0 0 8px;letter-spacing:1px;color:#000;">${d.name}</h1>
    ${d.role ? `<div style="font-size:13px;font-style:italic;letter-spacing:1px;text-transform:uppercase;color:#444;margin-bottom:12px;">${d.role}</div>` : ""}
    <div style="font-size:11.5px;color:#333;margin-top:8px;line-height:1.6;font-family:'Inter',sans-serif;align-items:center;">
      ${[d.email, d.phone, d.location, d.linkedin ? d.linkedin : "", d.github ? d.github : "", d.website ? d.website : ""].filter(Boolean).join(" &nbsp;•&nbsp; ")}
    </div>
  </div>
  ${d.summary ? `<div style="margin-bottom:24px;text-align:justify;">
    <h3 style="font-size:13px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:1px;margin:0 0 10px;border-bottom:1px solid #111;padding-bottom:3px;color:#000;">${t.summary}</h3>
    <p style="color:#222;font-size:13px;line-height:1.7;margin:0;text-align:justify;">${d.summary}</p>
  </div>` : ""}
  ${d.experiences.length > 0 ? `<div style="margin-bottom:24px;">
    <h3 style="font-size:13px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:1px;margin:0 0 12px;border-bottom:1px solid #111;padding-bottom:3px;color:#000;">${t.experience}</h3>
    ${expHtml}
  </div>` : ""}
  ${d.education.length > 0 ? `<div style="margin-bottom:24px;">
    <h3 style="font-size:13px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:1px;margin:0 0 12px;border-bottom:1px solid #111;padding-bottom:3px;color:#000;">${t.education}</h3>
    ${eduHtml}
  </div>` : ""}
  ${d.skills.length > 0 ? `<div style="margin-bottom:24px;">
    <h3 style="font-size:13px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:1px;margin:0 0 10px;border-bottom:1px solid #111;padding-bottom:3px;color:#000;">${t.skills}</h3>
    <p style="color:#222;margin:0;font-size:12.5px;text-align:center;line-height:1.7;">${d.skills.join(" &nbsp;•&nbsp; ")}</p>
  </div>` : ""}
  ${d.languages.length > 0 ? `<div>
    <h3 style="font-size:13px;font-weight:bold;text-transform:uppercase;text-align:center;letter-spacing:1px;margin:0 0 10px;border-bottom:1px solid #111;padding-bottom:3px;color:#000;">${t.languages}</h3>
    <p style="color:#222;margin:0;font-size:12.5px;text-align:center;">
      ${d.languages.map(l => typeof l === "string" ? l : `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" &nbsp;·&nbsp; ")}
    </p>
  </div>` : ""}
</div>`;
    }

    // ─── TEMPLATE: ELEGANT GOLD (Cream/Bronze, Outfit font, elegant two-column) 
    function renderElegantGold(d, t) {
        const skillsHtml = d.skills.map(s =>
            `<span style="display:inline-block;background:#fefce8;color:#a16207;border:1px solid #fef08a;border-radius:4px;padding:3.5px 10px;font-size:11.5px;margin:2px 2px 2px 0;font-weight:600;font-family:'Outfit',sans-serif;">${s}</span>`
        ).join("");
        const expHtml = d.experiences.map(exp => `
  <div style="margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;margin-bottom:4px;">
      <strong style="font-size:14.5px;color:#1e293b;font-family:'Outfit',sans-serif;">${exp.role || ""}</strong>
      ${exp.dates ? `<span style="font-size:11.5px;color:#854d0e;font-weight:600;">${exp.dates}</span>` : ""}
    </div>
    <div style="font-size:12.5px;color:#a16207;font-weight:600;margin-top:2px;font-family:'Outfit',sans-serif;">${exp.company || ""}</div>
    ${exp.bullets && exp.bullets.length > 0 ? `<ul style="margin:8px 0 0;padding-left:16px;list-style-type:circle;">${exp.bullets.map(b => `<li style="font-size:12.5px;color:#475569;line-height:1.65;margin-bottom:4.5px;">${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("");
        const eduHtml = d.education.map(e => `
  <div style="margin-bottom:14px;">
    <div style="font-size:13px;font-weight:700;color:#1e293b;font-family:'Outfit',sans-serif;">${e.degree}</div>
    ${e.institution ? `<div style="font-size:11.5px;color:#a16207;font-weight:600;">${e.institution}</div>` : ""}
    ${e.year ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${e.year}</div>` : ""}
  </div>`).join("");

        const avatarHtml = d.photo 
            ? `<img src="${d.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 14px;border:2px solid #a16207;box-shadow:0 4px 10px rgba(161,98,7,0.18);">` 
            : `<div style="width:64px;height:64px;border-radius:50%;background:#fef9c3;color:#854d0e;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 12px;border:2px solid #fef08a;">
        ${d.name.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase()}
      </div>`;

        return `<div id="cv-print-content" style="font-family:'Outfit',sans-serif;display:flex;max-width:800px;margin:0 auto;min-height:750px;box-sizing:border-box;">
  <div style="width:230px;min-width:230px;background:#fcfbf9;padding:36px 20px;border-right:1px solid #e9e8e3;flex-shrink:0;box-sizing:border-box;">
    <div style="text-align:center;margin-bottom:24px;">
      ${avatarHtml}
      <h1 style="font-size:19px;font-weight:800;margin:0;color:#1e293b;font-family:'Outfit',sans-serif;line-height:1.2;">${d.name}</h1>
      ${d.role ? `<p style="font-size:11px;color:#a16207;margin:5px 0 0;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${d.role}</p>` : ""}
    </div>
    <div style="border-top:1px solid #e9e8e3;padding-top:16px;font-size:11.5px;line-height:1.9;color:#475569;">
      ${d.email ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;word-break:break-all;">${svgEmail} ${d.email}</p>` : ""}
      ${d.phone ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgPhone} ${d.phone}</p>` : ""}
      ${d.location ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;">${svgLocation} ${d.location}</p>` : ""}
      ${d.linkedin ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;word-break:break-all;">${svgLinkedin} ${d.linkedin}</p>` : ""}
      ${d.github ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;word-break:break-all;">${svgGithub} ${d.github}</p>` : ""}
      ${d.website ? `<p style="margin:0 0 6px;display:flex;align-items:center;gap:4px;word-break:break-all;">${svgWebsite} ${d.website}</p>` : ""}
    </div>
    ${d.education.length > 0 ? `<p style="font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#a16207;margin:24px 0 10px;font-family:'Outfit',sans-serif;">${t.education}</p>
      ${eduHtml}` : ""}
    ${d.languages.length > 0 ? `<p style="font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#a16207;margin:20px 0 10px;font-family:'Outfit',sans-serif;">${t.languages}</p>
      ${d.languages.map(l => `<div style="font-size:12px;color:#475569;margin-bottom:4px;"><strong>${typeof l==="string"?l:l.name}</strong>${l.level ? `<br><span style="color:#64748b;font-size:10.5px;">${l.level}</span>` : ""}</div>`).join("")}` : ""}
  </div>
  <div style="flex:1;padding:36px 32px;background:#ffffff;overflow:hidden;box-sizing:border-box;">
    ${d.summary ? `<div style="margin-bottom:28px;">
      <h3 style="font-size:11.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#a16207;margin:0 0 10px;font-family:'Outfit',sans-serif;">${t.summary}</h3>
      <p style="color:#334155;font-size:13.5px;line-height:1.75;margin:0;text-align:justify;">${d.summary}</p>
    </div>` : ""}
    ${d.experiences.length > 0 ? `<div style="margin-bottom:28px;">
      <h3 style="font-size:11.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#a16207;margin:0 0 14px;font-family:'Outfit',sans-serif;">${t.experience}</h3>
      ${expHtml}
    </div>` : ""}
    ${d.skills.length > 0 ? `<div>
      <h3 style="font-size:11.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#a16207;margin:0 0 10px;font-family:'Outfit',sans-serif;">${t.skills}</h3>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${skillsHtml}</div>
    </div>` : ""}
  </div>
</div>`;
    }

    // ─── PUBLIC API ────────────────────────────────────────────────────────────
    return {
        extractCvData,
        buildEditorFields,
        SKILL_TAXONOMY,

        templates: {
            professional: { id:"professional", label:"Professionale", render: renderProfessional },
            modern:       { id:"modern",       label:"Moderno",       render: renderModern },
            creative:     { id:"creative",     label:"Creativo Bold", render: renderCreative },
            minimal:      { id:"minimal",      label:"Minimal ATS",   render: renderMinimal },
            executive:    { id:"executive",    label:"Executive Slate", render: renderExecutive },
            tech_minimal: { id:"tech_minimal", label:"Tech Minimalist", render: renderTechMinimal },
            academic:     { id:"academic",     label:"Accademico",    render: renderAcademic },
            elegant_gold: { id:"elegant_gold", label:"Elegant Gold",  render: renderElegantGold }
        },

        getI18n(lang) { return I18N[lang] || I18N.it; },

        /**
         * Build CV HTML from fields data object (from wizard form)
         */
        buildFromFields(fields, templateId, lang) {
            const t = I18N[lang] || I18N.it;
            const tpl = this.templates[templateId] || this.templates.professional;
            return tpl.render(fields, t);
        },

        /**
         * Legacy: build from raw text (fallback for old call sites)
         */
        buildCV(cvText, templateId, lang, optimizedSummary, optimizedBullets) {
            const d = this.extractCvData(cvText);
            if (optimizedSummary) d.summary = optimizedSummary;
            if (optimizedBullets && optimizedBullets.length > 0) {
                if (d.experiences.length > 0) d.experiences[0].bullets = optimizedBullets;
                else d.experiences.push({ role:"", company:"", dates:"", bullets: optimizedBullets });
            }
            return this.buildFromFields(d, templateId, lang);
        }
    };
})();
