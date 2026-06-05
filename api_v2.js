/**
 * CV Roast & Pitch AI - API Connector & Smart Mock Engine
 */

// Helper to perform fetch with a timeout to prevent forever hangs
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

const api = {
    /**
     * Core Mock Database for CV Roasting and Pitch Generation when no API Key is provided
     */
    mockDatabase: {
        roasts: {
            "Software Developer": {
                "Il Cinico Milanese": {
                    scores: { ats: 45, impact: 30, readability: 60, tone: 20 },
                    roastLines: [
                        "Figa, ma quanti linguaggi hai inserito? JavaScript, Python, C++, Rust... in pratica sai dire 'Hello World' in otto modi diversi ma non hai mai shippato nulla in produzione.",
                        "Scrivi 'problem solver' nel sommario. Che milanesismo banale! Anche la mia lavatrice smart risolve problemi, ma non ci fa una slide di presentazione.",
                        "Vedo zero metriche di business. Hai velocizzato il caricamento? Hai ridotto i costi del cloud? Se non mi porti i KPI, per me stai solo scaldando la sedia in coworking."
                    ],
                    optimizedSummary: "Software Engineer focalizzato sull'ottimizzazione delle performance e sulla scalabilità dei sistemi cloud. Comprovata esperienza nel ridurre la latenza delle API (-35%) e nel coordinare il deployment continuo (CI/CD) per massimizzare la velocità di rilascio delle feature.",
                    optimizedBullets: [
                        "Riprogettato l'architettura delle API backend riducendo i tempi di risposta medi del 30% e ottimizzando l'uso delle risorse server (-15% costi cloud).",
                        "Guidato la migrazione di un'applicazione legacy a React, migliorando il punteggio Web Vitals (LCP) da rosso a verde su oltre 50.000 utenti attivi mensili.",
                        "Automatizzato la pipeline di deployment riducendo i tempi di build da 25 a 6 minuti, azzerando i rilasci falliti in produzione."
                    ],
                    funnyBadge: "CI/CD Sospesa per Caffeina"
                },
                "La HR Passivo-Aggressiva": {
                    scores: { ats: 55, impact: 25, readability: 70, tone: 40 },
                    roastLines: [
                        "Che bello che tu abbia elencato tutte queste tecnologie nel CV! 😊 Significa che hai passato tantissimo tempo a fare tutorial su YouTube invece di lavorare su progetti reali! Adorabile! ✨",
                        "Vedo che hai messo 'lavoro di squadra' come soft skill. È un modo carino per dire che lasci sempre fare i refactoring pesanti ai tuoi colleghi senior? 😉",
                        "La formattazione è molto... creativa! Ricorda un po' i siti web degli anni '90. Sicuramente i nostri bot ATS avranno tanto materiale da masticare e scartare subito!"
                    ],
                    optimizedSummary: "Sviluppatore Web orientato ai risultati con esperienza pratica nella creazione di interfacce utente reattive e architetture dati scalabili. Dedicato alla collaborazione interfunzionale e all'adozione di best practice di sviluppo (test unitari, code review).",
                    optimizedBullets: [
                        "Sviluppato e manutenuto componenti UI riutilizzabili per un e-commerce ad alto traffico, aumentando il tasso di conversione del checkout del 4%.",
                        "Collaborato strettamente con i team di Product Design per tradurre i mockup Figma in codice pixel-perfect, riducendo le discrepanze del 90%.",
                        "Scritto oltre 150 test unitari con Jest coprendo l'85% del codice critico e riducendo del 22% i bug segnalati dagli utenti."
                    ],
                    funnyBadge: "Candidato Simpatico (Da Archiviare) 😊"
                },
                "Il Tech Lead Esaurito": {
                    scores: { ats: 65, impact: 40, readability: 50, tone: 15 },
                    roastLines: [
                        "Ancora con 'appassionato di nuove tecnologie'... A me non serve un appassionato, serve uno che pulisca il debito tecnico senza piangere ogni volta che apre Git.",
                        "Dici di conoscere Docker ma scommetto che copi le configurazioni da StackOverflow e se il container va in loop chiami il sistemista.",
                        "Manca il link al tuo GitHub. Se il tuo codice è un segreto di stato, probabilmente fa così schifo che non vuoi farlo vedere a chi poi deve correggerlo."
                    ],
                    optimizedSummary: "Developer orientato alla pulizia del codice e alla manutenibilità a lungo termine. Esperto in TypeScript, Node.js e nella containerizzazione con Docker. Focalizzato sull'abbattimento del debito tecnico e sulla scrittura di codice documentato e testato.",
                    optimizedBullets: [
                        "Rifattorizzato un modulo monolitico legacy in microservizi TypeScript, azzerando i memory leak e facilitando la manutenzione futura.",
                        "Implementato un sistema di caching distribuito con Redis che ha dimezzato le query al database PostgreSQL durante i picchi di traffico.",
                        "Configurato ambienti Docker standardizzati per l'intero team di sviluppo locale, eliminando il classico problema 'sul mio computer funziona'."
                    ],
                    funnyBadge: "Debito Tecnico Vivente"
                },
                "L'Investitore Silicon Valley": {
                    scores: { ats: 40, impact: 60, readability: 45, tone: 30 },
                    roastLines: [
                        "This looks like a lifestyle CV. Where is the hyper-growth? Where is the scale? I want builders, not maintainers.",
                        "You say you 'write code'. GPT-5 writes code. I need to know: what is your unfair advantage? Are you building the future or just writing wrappers?",
                        "Your resume is too linear. No failed startup? No bold pivot? It lacks the drama of a true 10x developer."
                    ],
                    optimizedSummary: "Growth-focused Software Engineer passionate about building scalable, high-leverage products. Expert at rapid prototyping, AI integration, and shifting code to drive core product-market fit metrics.",
                    optimizedBullets: [
                        "Architected the MVP of an AI-driven automation tool, scaling from 0 to 15,000 active users in 6 weeks with zero server downtime.",
                        "Leveraged LLM integrations to automate internal support workflows, saving the operation 80+ engineering hours per week.",
                        "A/B tested core dashboard funnels, leading to a 30% increase in user retention and a 12% boost in MRR."
                    ],
                    funnyBadge: "Non-scalable Human Resource"
                }
            },
            "Digital Marketer": {
                "Il Cinico Milanese": {
                    scores: { ats: 50, impact: 35, readability: 65, tone: 25 },
                    roastLines: [
                        "Ottimizzazione SEO, Social Media, Growth Hacking... Praticamente fai i post su Instagram con gli hashtag obsoleti e ti senti Steve Jobs.",
                        "Hai scritto 'creatore di sinergie'. Ma cosa vuol dire? A Milano parliamo di fatturato, di ROI. Quanti lead hai portato all'ultimo cliente? Se non me lo scrivi, sei aria fritta.",
                        "Gestione di campagne Ads 'con ottimi risultati'. Definisci 'ottimi'. Se il tuo ROAS è inferiore a 2, hai solo bruciato il budget del cliente per comprare pixel a Zuckerberg."
                    ],
                    optimizedSummary: "Performance Marketer specializzato in acquisizione clienti paid (Meta, Google) ed ottimizzazione dei funnel di conversione. Esperto nell'analizzare metriche di acquisizione (CPA, ROAS, LTV) per massimizzare il ritorno sull'investimento pubblicitario.",
                    optimizedBullets: [
                        "Gestito un budget pubblicitario di €15.000/mese su Meta Ads, riducendo il CPA del 28% e mantenendo un ROAS medio stabile di 3.8.",
                        "Implementato una strategia SEO on-page ed editorial che ha incrementato il traffico organico del 45% in 6 mesi per parole chiave ad alta intenzione d'acquisto.",
                        "A/B testato landing page di acquisizione lead, incrementando il tasso di conversione dal 2.1% al 4.7%."
                    ],
                    funnyBadge: "ROAS Minimo Garantito (Forse)"
                },
                "La HR Passivo-Aggressiva": {
                    scores: { ats: 60, impact: 30, readability: 75, tone: 45 },
                    roastLines: [
                        "Che bello vedere che ti definisci 'Guru della comunicazione'! 😊 Di solito chi lo scrive è perché non ha dati di conversione reali da mostrare nei report! ✨",
                        "Scrivi che crei 'strategie virali'. Dev'essere divertente passare la giornata a ballare su TikTok sperando che un cliente ti noti! Molto coraggioso! 😉",
                        "Questo CV è pieno di grafici colorati ma privo di numeri reali. Sembra una bellissima brochure aziendale, peccato che cerchiamo un marketer, non un pittore!"
                    ],
                    optimizedSummary: "Specialista in Digital Marketing focalizzato sulla pianificazione strategica e sul content design orientato alla lead generation. Esperto nella gestione di community e nel monitoraggio delle metriche di brand awareness ed engagement.",
                    optimizedBullets: [
                        "Sviluppato un piano editoriale multipiattaforma (LinkedIn/Instagram) incrementando l'engagement della community del 120% in un trimestre.",
                        "Coordinato il lancio di campagne email marketing segmentate per oltre 12.000 iscritti, registrando un tasso di apertura medio del 28% (+8% vs media di settore).",
                        "Progettato lead magnet (e-book, webinar) che hanno generato oltre 1.500 contatti qualificati pronti per il team commerciale."
                    ],
                    funnyBadge: "Guru delle Emoji Certificato 😊"
                },
                "Il Tech Lead Esaurito": {
                    scores: { ats: 55, impact: 45, readability: 40, tone: 20 },
                    roastLines: [
                        "Parli di 'Growth Hacking' ma scommetto che non sai configurare un Tag Manager senza spaccare il pixel di tracciamento o far piangere lo sviluppatore.",
                        "Vedo 'competenze di HTML/CSS'. Traduzione: sai cambiare il colore di un testo usando lo style inline su WordPress rovinando tutto il responsive.",
                        "Hanno inventato le conversioni API e tu stai ancora a misurare i 'Mi Piace' sulla pagina Facebook. Aggiorna lo stack di tracciamento per favore."
                    ],
                    optimizedSummary: "Technical Marketer specializzato in tracciamento dati, web analytics e automazione dei funnel. Esperto nella configurazione di Google Tag Manager, Server-Side tracking e integrazione CRM per garantire l'attribuzione corretta delle conversioni.",
                    optimizedBullets: [
                        "Configurato il tracciamento Server-Side tramite Google Tag Manager per aggirare le limitazioni di iOS 14, recuperando l'attribuzione del 18% delle conversioni.",
                        "Progettato flussi di marketing automation complessi su ActiveCampaign, segmentando i clienti in base all'LTV e aumentando le vendite ricorrenti del 15%.",
                        "Ottimizzato gli eventi di conversione e configurato le API di conversione di Meta, riducendo la discrepanza dei dati pubblicitari sotto il 5%."
                    ],
                    funnyBadge: "Pixel Malfunzionante"
                },
                "L'Investitore Silicon Valley": {
                    scores: { ats: 42, impact: 65, readability: 50, tone: 35 },
                    roastLines: [
                        "You talk about organic social media. Organic is dead. Show me how you build a scalable engine of acquisition that can eat market share.",
                        "Your budget management is too small. I need people who can allocate $100k/day efficiently, not micro-budgets for local shops.",
                        "Where is the viral loop? If your product doesn't market itself, you are just throwing dollars at acquisition. Give me product-led growth."
                    ],
                    optimizedSummary: "Performance & Product-Led Growth (PLG) Specialist. Experienced in scaling acquisition funnels, viral loop design, and technical attribution for high-growth venture startups.",
                    optimizedBullets: [
                        "Designed and executed a viral referral loop that reduced customer acquisition cost (CAC) by 40% while doubling weekly signups.",
                        "Scaled monthly ad spend from $5,000 to $85,000 while maintaining a strict LTV/CAC ratio of 4:1.",
                        "Pioneered a product-led onboarding flow that boosted user activation rates by 22% in the first month post-install."
                    ],
                    funnyBadge: "CAC / LTV Optimizer"
                }
            },
            "General": {
                "Il Cinico Milanese": {
                    scores: { ats: 40, impact: 25, readability: 55, tone: 20 },
                    roastLines: [
                        "Sommario generico, obiettivi astratti. Sembra scritto con ChatGPT senza nemmeno rileggere. Un po' di personalità, figa!",
                        "Elenchi mansioni anziché successi. 'Mi occupavo di gestiore i clienti'... sì, ma quanti? Erano felici? Hanno speso di più? Altrimenti sei un costo fisso da tagliare ASAP.",
                        "Impaginazione classica da ufficio statale. Se vedo ancora una barra di avanzamento percentuale per le lingue straniere chiamo direttamente la sicurezza."
                    ],
                    optimizedSummary: "Professionista orientato ai risultati con solida esperienza nella gestione dei progetti, ottimizzazione dei processi interni e coordinamento dei team. Focalizzato sul raggiungimento degli obiettivi di business e sull'efficienza operativa.",
                    optimizedBullets: [
                        "Gestito e portato a termine con successo progetti complessi rispettando tempi e budget prestabiliti, con un tasso di soddisfazione dei clienti del 95%.",
                        "Riorganizzato i flussi di lavoro interni riducendo i tempi di elaborazione delle pratiche del 20% e migliorando la comunicazione tra i reparti.",
                        "Analizzato i costi operativi identificando sprechi ed implementando soluzioni che hanno generato un risparmio del 12% su base annua."
                    ],
                    funnyBadge: "Costo Fisso da Ottimizzare"
                },
                "La HR Passivo-Aggressiva": {
                    scores: { ats: 50, impact: 20, readability: 65, tone: 35 },
                    roastLines: [
                        "Che bello che tu sia 'motivato e voglioso di imparare'! 😊 È la frase perfetta per dire che non sai fare molto e che dovremo pagarti per formarti da zero! Che tenero! ✨",
                        "Questo CV è perfetto... se fossimo nel 2012! Purtroppo il mercato è andato un pochino avanti, ma apprezzo molto la coerenza storica! 😉",
                        "Hai messo 'Microsoft Office' tra le competenze. Wow! Sai scrivere su Word e fare una tabella su Excel! Una vera rarità in questa epoca digitale! 🤭"
                    ],
                    optimizedSummary: "Profilo versatile con solide basi operative e spiccata attitudine all'apprendimento continuo. Pronto ad inserirsi in contesti aziendali dinamici apportando supporto organizzativo e gestionale.",
                    optimizedBullets: [
                        "Coordinato le attività amministrative di ufficio riducendo i tempi di archiviazione grazie all'introduzione di strumenti digitali collaborativi.",
                        "Supportato il management nella preparazione di report commerciali e presentazioni destinate ai partner esterni, curandone accuratezza e visual style.",
                        "Gestito i canali di comunicazione diretta con l'utenza esterna, risolvendo oltre il 90% delle problematiche sollevate al primo contatto."
                    ],
                    funnyBadge: "Voglia di Imparare (A Spese Nostre) 😊"
                },
                "Il Tech Lead Esaurito": {
                    scores: { ats: 60, impact: 35, readability: 45, tone: 15 },
                    roastLines: [
                        "Il tuo CV è una lista infinita di parole chiave messe a caso solo per compiacere i bot delle risorse umane. A me servono fatti, non tag cloud.",
                        "Parli di 'problem solving' ma scommetto che se salta la connessione internet in ufficio rimani a fissare il muro finché qualcuno non riavvia il router.",
                        "Troppi aggettivi e pochi link. Fammi vedere cosa hai fatto davvero, sennò assumo un bot che fa le stesse cose e si lamenta meno."
                    ],
                    optimizedSummary: "Specialista operativo focalizzato sulla risoluzione rapida dei problemi infrastrutturali ed organizzativi. Esperto nell'adozione di metodologie di lavoro tracciabili e nell'automazione di compiti ripetitivi.",
                    optimizedBullets: [
                        "Identificato e risolto colli di bottiglia nei flussi operativi quotidiani, riducendo gli errori manuali del 15% tramite script e automazioni.",
                        "Redatto e aggiornato la documentazione interna dei processi, facilitando l'onboarding di nuovi collaboratori (tempo ridotto del 30%).",
                        "Gestito l'infrastruttura degli strumenti interni (Suite aziendali, ticket system) garantendo un uptime del servizio pari al 99.9%."
                    ],
                    funnyBadge: "Riavviatore di Router Seriale"
                },
                "L'Investitore Silicon Valley": {
                    scores: { ats: 38, impact: 55, readability: 40, tone: 30 },
                    roastLines: [
                        "This resume reads like an employee checklist. I don't invest in employees, I invest in market disruptors. What are you building?",
                        "Your achievements are incremential. A 5% increase here, a 2% saving there... I need order-of-magnitude improvements. Give me a 10x narrative.",
                        "Too many bullet points about duties. Zero bullet points about ownership. In the valley, if you don't own the outcome, you don't exist."
                    ],
                    optimizedSummary: "Entrepreneurial professional focused on operational execution, rapid feedback loops, and value creation. Proven ability to take ownership of projects and scale results in uncertain environments.",
                    optimizedBullets: [
                        "Structured and owned an experimental project division, driving efficiency and launching 3 pilot programs in under 90 days.",
                        "Redesigned the customer support pipeline using automation, increasing agent leverage by 4x and customer rating score to 4.9/5.",
                        "Identified and captured a new operational workflow channel, creating an additional €50k value opportunity from existing assets."
                    ],
                    funnyBadge: "Zero Ownership Employee"
                }
            }
        },
        pitches: {
            "Bold": {
                email: "Oggetto: Proposta shock per [Nome Azienda] (niente pitch noiosi, promesso)\n\nCiao [Recruiter Name],\n\n Vado dritto al punto: ho dato un'occhiata a quello che fate su [Nome Azienda] e penso che stiate facendo un lavoro pazzesco con [Niche/Competenza]. C'è solo una cosa su cui penso che potrei darvi una spinta enorme: [Job Role].\n\nAnalizzando il vostro stack e il mercato attuale, vedo un'opportunità enorme nel velocizzare/migliorare [Target Area] per convertire più utenti o abbattere i tempi di sviluppo.\n\nEcco cosa porto sul tavolo:\n* Esperienza solida proprio in questa nicchia.\n* Un approccio focalizzato esclusivamente sul portare metriche (niente codice fine a se stesso o post social senza ROI).\n* La voglia di sporcarmi le mani fin dal primo giorno senza bisogno di lunghi onboarding.\n\nTi andrebbe di fare una chiamata da 10 minuti martedì prossimo alle 15:00? Se capiamo che non c'è match, ci saremo comunque scambiati due idee utili.\n\nUn saluto,\n[User Name]\n[Portfolio Link]",
                linkedin: "Ciao [Recruiter Name]! Seguo il percorso di [Nome Azienda] e adoro il vostro approccio a [Niche]. Ho elaborato un paio di idee su come potrei aiutarvi a scalare/ottimizzare come [Job Role]. Ci colleghiamo per parlarne brevemente? Un saluto!",
                followup: "Oggetto: R: Proposta shock per [Nome Azienda]\n\nCiao [Recruiter Name],\n\nSo che sei super impegnato a scalare [Nome Azienda], quindi ti scrivo solo per assicurarmi che la mia mail non sia finita nel dimenticatoio dei server.\n\nSe il tema [Job Role] è una priorità in questo trimestre, mi farebbe davvero piacere fare due chiacchiere rapide. Altrimenti, nessun problema e continuerò a fare il tifo per voi da fuori!\n\nBuon lavoro,\n[User Name]"
            },
            "Professional": {
                email: "Oggetto: Candidatura Spontanea per il ruolo di [Job Role] presso [Nome Azienda]\n\nGentile [Recruiter Name],\n\nLe scrivo in quanto seguo con vivo interesse la crescita e il posizionamento sul mercato di [Nome Azienda], di cui apprezzo in particolare l'impegno nei servizi legati a [Niche].\n\nIn qualità di [User Role], ho sviluppato competenze specifiche che ritengo possano portare un valore concreto al vostro team attuale. Nello specifico, mi occupo di ottimizzare [Target Area] e supportare la transizione verso flussi di lavoro più efficienti.\n\nNel corso delle mie passate esperienze ho avuto modo di:\n* Ottimizzare processi operativi riducendo i tempi di gestione.\n* Collaborare in team interfunzionali per raggiungere gli obiettivi di fatturato ed efficienza stabiliti.\n* Implementare soluzioni scalabili basate su dati reali.\n\nSarei molto felice di valutare l'opportunità di inserimento nel vostro organico o semplicemente di svolgere un breve colloquio conoscitivo per illustrarle come le mie competenze possano allinearsi con i vostri obiettivi trimestrali.\n\nAllego il mio CV aggiornato e resto in attesa di un suo cortese riscontro.\n\nCordiali saluti,\n\n[User Name]\n[LinkedIn Profile]",
                linkedin: "Gentile [Recruiter Name], Le scrivo in quanto apprezzo molto il lavoro svolto da [Nome Azienda] nel settore [Niche]. Avendo maturato esperienza come [Job Role], sarei felice di entrare in contatto con Lei per valutare future sinergie professionali. Un cordiale saluto.",
                followup: "Oggetto: R: Candidatura Spontanea per il ruolo di [Job Role] presso [Nome Azienda]\n\nGentile [Recruiter Name],\n\nMi permetto di ricontattarla in merito alla candidatura spontanea inviata qualche giorno fa per il ruolo di [Job Role].\n\nQualora abbiate in programma di potenziare il vostro team o se desidera effettuare una breve chiamata conoscitiva per approfondire il mio profilo, resto a sua completa disposizione.\n\nRingraziando per l'attenzione, Le auguro una buona giornata.\n\nCordiali saluti,\n[User Name]"
            },
            "Creative": {
                email: "Oggetto: Perché la mia tastiera scrive solo di [Nome Azienda] (e come posso aiutarvi)\n\nCiao [Recruiter Name],\n\nLa faccio breve: invece di inviare il solito CV preconfezionato a 100 aziende diverse sperando in un miracolo, ho preferito spendere le ultime ore a studiare ciò che fa [Nome Azienda]. E il risultato mi ha entusiasmato.\n\nIl vostro posizionamento in ambito [Niche] è eccezionale, ma da [Job Role] ho notato che potremmo portare [Target Area] al livello successivo.\n\nImmagina cosa potremmo fare se unissimo il vostro prodotto con:\n* Una strategia focalizzata sulla riduzione dei colli di bottiglia tecnici/operativi.\n* Esperimenti rapidi basati su dati utenti reali.\n* Idee creative che escono dai classici schemi aziendali.\n\nHo preparato tre bozze di idee specifiche per voi. Ti andrebbe di fare un caffè virtuale di 10 minuti per vederle insieme su Zoom?\n\nOffro io (virtualmente)!\n\n[User Name]\n[Portfolio Link]",
                linkedin: "Ciao [Recruiter Name]! Ho analizzato la crescita di [Nome Azienda] e ho elaborato 3 idee flash per ottimizzare [Target Area] nel vostro team. Se ti incuriosisce parlarne davanti a un caffè virtuale su Zoom, colleghiamoci! Un saluto.",
                followup: "Oggetto: R: Perché la mia tastiera scrive solo di [Nome Azienda]\n\nCiao [Recruiter Name],\n\nProbabilmente la mia precedente mail è stata sepolta da una valanga di altre notifiche (totalmente comprensibile!).\n\nLe 3 idee che avevo preparato per ottimizzare [Target Area] presso [Nome Azienda] sono sempre pronte. Se hai 10 minuti liberi questa settimana, mi farebbe davvero piacere farti fare un salto di qualità. Altrimenti ti auguro solo il meglio per i vostri progetti!\n\nUn saluto,\n[User Name]"
            },
            "Problem Solver": {
                email: "Oggetto: Analisi tecnica e proposta operativa per [Nome Azienda] - Ruolo [Job Role]\n\nAll'attenzione di [Recruiter Name],\n\nLe scrivo per proporre una soluzione concreta a una delle sfide operative più comuni nel settore [Niche] per le aziende in crescita come [Nome Azienda]: l'efficienza legata a [Target Area].\n\nAnalizzando le vostre recenti attività esterne, ho notato che l'ottimizzazione del flusso di [Job Role] potrebbe ridurre notevolmente i costi operativi incrementando al contempo le conversioni.\n\nEcco l'approccio orientato alla risoluzione dei problemi che posso implementare per voi:\n1. Audit iniziale del flusso e individuazione delle perdite/colli di bottiglia entro i primi 7 giorni.\n2. Implementazione di soluzioni standardizzate e automazioni per azzerare i passaggi manuali ripetitivi.\n3. Monitoraggio costante dei dati per garantire un ROI positivo sulle ore di lavoro impiegate.\n\nNel mio ruolo precedente ho applicato questo stesso schema ottenendo un risparmio del 20% sui tempi operativi.\n\nSarei felice di condividere questa metodologia con Lei in una chiamata conoscitiva di 15 minuti la prossima settimana.\n\nResto in attesa di un riscontro.\n\nCordiali saluti,\n[User Name]\n[Portfolio Link]",
                linkedin: "Gentile [Recruiter Name], ho elaborato una breve analisi dei potenziali colli di bottiglia operativi in ambito [Target Area] per [Nome Azienda]. Sarei lieto di confrontarmi con Lei per mostrarLe come ho risolto sfide analoghe in passato. Cordiali saluti.",
                followup: "Oggetto: R: Analisi tecnica e proposta operativa per [Nome Azienda]\n\nGentile [Recruiter Name],\n\nMi auguro che la settimana stia procedendo al meglio.\n\nLa ricontatto per sapere se ha avuto modo di leggere la mia analisi tecnica su [Target Area] e se ritiene opportuno pianificare un confronto telefonico di pochi minuti nei prossimi giorni per approfondire il mio inserimento come [Job Role].\n\nUn cordiale saluto,\n[User Name]"
            }
        }
    },

    /**
     * Helper to detect profile category based on CV Text keywords
     * Covers: tech (dev, devops, data), marketing, finance, design, general
     */
    detectCategory: function(cvText) {
        if (!cvText) return "General";
        const text = cvText.toLowerCase();

        // --- Tech / Software / Data / DevOps ---
        const techSignals = [
            "react", "angular", "vue", "javascript", "typescript", "node",
            "python", "django", "flask", "fastapi",
            "java", "spring", "kotlin",
            "go", "golang", "rust", "c++", "c#", ".net",
            "php", "laravel", "ruby", "rails",
            "swift", "flutter", "dart",
            "developer", "sviluppatore", "programmatore", "engineer", "ingegnere",
            "frontend", "backend", "fullstack", "full-stack", "full stack",
            "software", "codice", "codici", "code", "coding",
            "docker", "kubernetes", "k8s", "devops", "ci/cd", "pipeline",
            "aws", "azure", "gcp", "cloud", "terraform", "ansible",
            "sql", "postgresql", "mysql", "mongodb", "redis", "database",
            "api", "rest", "graphql", "microservizi", "microservice",
            "machine learning", "deep learning", "tensorflow", "pytorch", "data scientist",
            "git", "github", "gitlab", "bitbucket",
            "html", "css", "webpack", "vite", "sass"
        ];
        if (techSignals.some(k => text.includes(k))) return "Software Developer";

        // --- Marketing / Growth / Content ---
        const mktSignals = [
            "marketing", "seo", "sem", "social media", "social network",
            "growth", "hacking", "advertising", "adv", "campaign", "campagna",
            "leads", "lead generation", "copywriting", "copywriter",
            "content", "email marketing", "newsletter", "crm",
            "google ads", "meta ads", "facebook ads", "tiktok ads",
            "hubspot", "mailchimp", "klaviyo", "salesforce",
            "brand", "pr ", "influencer", "viral", "community manager",
            "comunicazione", "pubblicit", "digital marketing"
        ];
        if (mktSignals.some(k => text.includes(k))) return "Digital Marketer";

        // --- Finance / Accounting ---
        const finSignals = [
            "finanza", "finance", "accounting", "contabilit", "bilancio",
            "budget", "valuation", "dcf", "private equity", "venture capital",
            "audit", "revisione", "tax", "fiscale", "commercialista",
            "cfo", "controller", "reporting finanziario"
        ];
        if (finSignals.some(k => text.includes(k))) return "Finance";

        // --- Design / UX ---
        const designSignals = [
            "figma", "adobe xd", "sketch", "invision",
            "ux", "ui ", "user experience", "user interface",
            "product design", "designer", "prototyping", "wireframe",
            "illustrator", "photoshop", "after effects", "motion"
        ];
        if (designSignals.some(k => text.includes(k))) return "Design";

        return "General";
    },

    /**
     * Compute dynamic mock scores based on real CV analysis
     */
    computeDynamicScores: function(cvText, category) {
        const text = cvText.toLowerCase();
        const lines = cvText.split(/\n/).filter(l => l.trim());
        const wordCount = cvText.split(/\s+/).length;

        // ATS: presence of key sections and clean formatting
        let ats = 40;
        if (/esperienza|experience|lavoro|work/i.test(text)) ats += 12;
        if (/formazione|education|istruzione|studi/i.test(text)) ats += 8;
        if (/competenze|skills|skill/i.test(text)) ats += 8;
        if (/email|telefono|phone|linkedin/i.test(text)) ats += 6;
        if (wordCount > 200 && wordCount < 900) ats += 8; // right length
        if (wordCount > 900) ats -= 6; // too long
        if (/\d{4}\s*[-–]\s*(\d{4}|presente|presente|present)/i.test(text)) ats += 8; // dates found
        ats = Math.min(94, Math.max(28, ats));

        // Impact: presence of metrics, numbers, percentages, KPIs
        let impact = 15;
        const metricMatches = (cvText.match(/(\d+%|\d+x|€\d+|\$\d+|\d+k|\d+\s*milioni|\d+\s*mila|\+\d+|riduzione|aumento|risparmio|incremento|crescita|ottimizzaz)/gi) || []);
        impact += Math.min(40, metricMatches.length * 6);
        if (/roi|kpi|cpa|roas|revenue|fatturato|conversione|conversion/i.test(text)) impact += 12;
        if (/guidato|gestito|coordinato|lanciato|sviluppato|progettato|designed|led|managed/i.test(text)) impact += 8;
        impact = Math.min(88, Math.max(12, impact));

        // Readability: sentence length, bullet points, structure
        let readability = 45;
        const bulletCount = (cvText.match(/^[-•*▪►]/gm) || []).length;
        if (bulletCount > 3) readability += 10;
        if (bulletCount > 8) readability += 8;
        if (lines.length > 15) readability += 6;
        const avgLineLen = cvText.length / Math.max(1, lines.length);
        if (avgLineLen < 100) readability += 8; // concise lines
        if (avgLineLen > 200) readability -= 10; // too dense
        if (/sommario|profilo|obiettivo|summary|about/i.test(text)) readability += 6;
        readability = Math.min(92, Math.max(30, readability));

        // Tone: professional language, no typos markers, right vocabulary
        let tone = 18;
        const clicheCount = (cvText.match(/motivato|appassionato|dinamico|team player|problem solver|leader|proattivo|flessibile|ottimista/gi) || []).length;
        tone += Math.max(0, 20 - clicheCount * 4);
        if (category === "Software Developer" && /github|gitlab|portfolio|progetto|project/i.test(text)) tone += 14;
        if (category === "Digital Marketer" && /caso studio|case study|risultato|result|campagna|campaign/i.test(text)) tone += 14;
        if (/\b(ho|ho gestito|ho guidato|ho sviluppato|ho coordinato|ho progettato)\b/i.test(text)) tone += 8;
        tone = Math.min(85, Math.max(10, tone));

        return { ats, impact, readability, tone };
    },

    /**
     * Generate CV Roast utilizing the local mock database with dynamic personalization
     */
    generateMockRoast: function(cvText, persona) {
        const category = this.detectCategory(cvText);
        const categoryKey = (category === "Finance" || category === "Design") ? "General" : category;
        const categoryData = this.mockDatabase.roasts[categoryKey] || this.mockDatabase.roasts["General"];
        const roastData = categoryData[persona] || categoryData["Il Cinico Milanese"];

        // Compute DYNAMIC scores based on real CV analysis
        const dynamicScores = this.computeDynamicScores(cvText, category);

        const cvData = (typeof cvBuilder !== 'undefined') ? cvBuilder.extractCvData(cvText) : {
            name: "Candidato",
            role: "Sviluppatore",
            skills: []
        };

        const candidateName = cvData.name && cvData.name !== "Il Tuo Nome" ? cvData.name : "Candidato";
        const candidateRole = cvData.role && cvData.role !== "Professionista" ? cvData.role : (category === "Software Developer" ? "Sviluppatore" : (category === "Digital Marketer" ? "Marketer" : "Collaboratore"));
        
        // Grab top 3 skills or provide defaults
        const skillsList = cvData.skills && cvData.skills.length > 0 ? cvData.skills : ["Office", "Teamwork", "Problem Solving"];
        const skill1 = skillsList[0] || "Competenza1";
        const skill2 = skillsList[1] || "Competenza2";
        const skill3 = skillsList[2] || "Competenza3";
        const skillsStr = skillsList.slice(0, 4).join(", ");

        // Persona-specific dynamic rules
        let dynamicRoastLines = [];
        let dynamicSummary = "";
        let dynamicBullets = [];
        let dynamicBadge = roastData.funnyBadge;

        if (persona === "Il Cinico Milanese") {
            dynamicRoastLines = [
                `Figa, ${candidateName}, ma quante competenze hai messo? ${skillsStr}... in pratica sai dire 'Hello World' o fare un post social, ma non hai mai shippato o deliverato nulla in produzione.`,
                `Ti definisci '${candidateRole}' nel sommario. Che milanesismo banale! Anche la mia lavatrice smart ha un ruolo, ma non ci fa una slide di presentazione.`,
                `Vedo zero KPI e metriche di business per le tue attività con ${skill1} e ${skill2}. Se non porti fatturato o risparmi, per me sei solo un costo fisso da tagliare ASAP.`
            ];
            dynamicSummary = `${candidateRole} orientato all'efficienza operativa e alla massimizzazione del ROI di business. Comprovata esperienza nell'applicazione strategica di ${skill1} e ${skill2} per ridurre i costi infrastrutturali ed incrementare le conversioni commerciali.`;
            dynamicBullets = [
                `Riprogettato il flusso operativo basato su ${skill1} riducendo i colli di bottiglia del 28% e i tempi medi di gestione.`,
                `Guidato il deployment di soluzioni con ${skill2} per ottimizzare l'acquisizione utenti, registrando un +14% di lead qualificati.`,
                `Automatizzato i processi di reportistica con ${skill3} eliminando 8 ore/settimana di inserimento dati manuale.`
            ];
        } 
        else if (persona === "La HR Passivo-Aggressiva") {
            dynamicRoastLines = [
                `Che bello che tu abbia elencato ${skillsStr} nel tuo CV! 😊 Significa che hai passato tantissimo tempo a fare corsi online su YouTube invece di lavorare su progetti reali! Adorabile! ✨`,
                `Vedo che ti proponi come '${candidateRole}'. È un modo carino per dire che lasci sempre fare i compiti pesanti o il debug complesso ai tuoi colleghi senior? 😉`,
                `La formattazione e la descrizione di ${skill1} sono molto... creative! Ricorda i siti web degli anni '90. Sicuramente i nostri bot ATS avranno tanto materiale da masticare e scartare subito! 🥰`
            ];
            dynamicSummary = `Profilo dinamico con solida esperienza operativa nell'implementazione di soluzioni tramite ${skill1} e ${skill2}. Dedicato alla collaborazione interfunzionale e al rispetto degli standard qualitativi aziendali.`;
            dynamicBullets = [
                `Sviluppato e ottimizzato procedure basate su ${skill1}, incrementando del 12% la produttività del team di reparto.`,
                `Collaborato in team interfunzionali per integrare soluzioni con ${skill2}, azzerando i ritardi nelle scadenze di progetto.`,
                `Coperto le attività di validazione e test per i moduli critici legati a ${skill3}, riducendo del 22% le anomalie post-rilascio.`
            ];
        }
        else if (persona === "Il Tech Lead Esaurito") {
            dynamicRoastLines = [
                `Ancora con '${candidateRole}' appassionato di nuove tecnologie... A me non serve un appassionato, serve uno che conosca ${skill1} e pulisca il debito tecnico legato a Git senza piangere ogni volta che apre un file.`,
                `Dici di conoscere bene ${skill2} ma scommetto che copi le configurazioni da StackOverflow e se il sistema va in loop chiami il sistemista o formatti tutto.`,
                `Manca il link a repository di codice reali per le tue attività con ${skill3}. Se il tuo lavoro è un segreto aziendale, probabilmente fa così schifo che non vuoi farlo vedere a chi poi deve correggerlo.`
            ];
            dynamicSummary = `Developer focalizzato sulla scrittura di codice pulito, documentazione tecnica e containerizzazione. Esperto nell'abbattimento del debito tecnico e nel refactoring di moduli critici basati su ${skill1} e ${skill2}.`;
            dynamicBullets = [
                `Rifattorizzato un modulo legacy monolitico basato su ${skill1}, eliminando i leak e dimezzando i tempi di build.`,
                `Configurato e integrato servizi di caching per le pipeline di ${skill2}, riducendo le query ridondanti del 35%.`,
                `Standardizzato l'ambiente locale del team implementando configurazioni Docker per lo stack ${skill3}, azzerando gli errori di configurazione.`
            ];
        }
        else if (persona === "L'Investitore Silicon Valley") {
            dynamicRoastLines = [
                `This resume reads like a standard employee checklist for a ${candidateRole}. Where is the hyper-growth? Where is the scale? I want founders and 10x builders, not maintainers.`,
                `You say you master ${skill1}. GPT-5 masters ${skill1} for free. What is your unfair advantage? Are you leveraging ${skill2} to build the future or just writing wrappers?`,
                `Your career path is too linear. No failed startups? No bold pivots? It lacks the drama of a true disruptor.`
            ];
            dynamicSummary = `Growth-focused builder specialized in leveraging ${skill1} and ${skill2} to scale products, automate workflows, and capture market-share in fast-paced startup environments.`;
            dynamicBullets = [
                `Architected the MVP and scaled the core features of a service leveraging ${skill1}, growing from 0 to 12k users in 6 weeks.`,
                `Automated onboarding and growth loops with ${skill2}, reducing customer acquisition cost (CAC) by 32%.`,
                `Pioneered product-led experiments using ${skill3}, boosting user retention by 18% in the first quarter.`
            ];
        }
        else {
            // Fallback to static mock database data if any unhandled persona
            dynamicRoastLines = roastData.roastLines;
            dynamicSummary = roastData.optimizedSummary;
            dynamicBullets = roastData.optimizedBullets;
        }

        return {
            id: `roast_${Date.now()}`,
            scores: dynamicScores, // computed from real CV analysis
            roastLines: dynamicRoastLines,
            optimizedSummary: dynamicSummary,
            optimizedBullets: dynamicBullets,
            funnyBadge: dynamicBadge,
            dateCreated: new Date().toLocaleDateString('it-IT')
        };

    },

    /**
     * Generate Pitch templates utilizing the local mock database
     */
    generateLocalPitch: function(cvText, companyName, companyUrl, role, tone, senderName) {
        const userName = senderName || "Candidato";
        const profileCat = this.detectCategory(cvText);
        const pitchTemplate = this.mockDatabase.pitches[tone] || this.mockDatabase.pitches["Professional"];
        
        // Define some replacement variables
        const domain = companyUrl ? companyUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.it`;
        const emailTo = `recruiting@${domain}`;
        const recruiterName = "Responsabile Risorse Umane";
        
        let niche = "innovazione tecnologica";
        let targetArea = "flussi di lavoro digitali";
        let userRole = "Professionista qualificato";

        if (profileCat === "Software Developer") {
            niche = "sviluppo software e web";
            targetArea = "lo sviluppo del frontend e l'infrastruttura backend";
            userRole = "Software Engineer";
        } else if (profileCat === "Digital Marketer") {
            niche = "comunicazione e acquisizione clienti online";
            targetArea = "l'acquisizione di leads e le campagne di advertising paid";
            userRole = "Digital Marketer";
        }

        // Helper to perform replacements
        const replaceVariables = (text) => {
            return text
                .replace(/\[Nome Azienda\]/g, companyName)
                .replace(/\[Recruiter Name\]/g, recruiterName)
                .replace(/\[Job Role\]/g, role || userRole)
                .replace(/\[User Role\]/g, userRole)
                .replace(/\[User Name\]/g, userName)
                .replace(/\[Niche\/Competenza\]/g, niche)
                .replace(/\[Niche\]/g, niche)
                .replace(/\[Target Area\]/g, targetArea)
                .replace(/\[Portfolio Link\]/g, "linkedin.com/in/mio-profilo")
                .replace(/\[LinkedIn Profile\]/g, "linkedin.com/in/mio-profilo");
        };

        return {
            id: `pitch_${Date.now()}`,
            companyName: companyName,
            websiteUrl: companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`,
            contactEmail: emailTo,
            role: role || userRole,
            tone: tone,
            emailSubject: replaceVariables(pitchTemplate.email.split('\n\n')[0].replace("Oggetto: ", "")),
            emailBody: replaceVariables(pitchTemplate.email.substring(pitchTemplate.email.indexOf('\n\n') + 2)),
            linkedinMessage: replaceVariables(pitchTemplate.linkedin),
            followupSubject: replaceVariables(pitchTemplate.followup.split('\n\n')[0].replace("Oggetto: ", "")),
            status: "Da Contattare",
            dateCreated: new Date().toLocaleDateString('it-IT')
        };
    },

    /**
     * Connect to the Google Gemini API to generate real CV Roasts
     */
    generateGeminiRoast: async function(apiKey, cvText, persona) {
        const personaMap = {
            "Il Cinico Milanese": "Comportati come 'Il Cinico Milanese': un recruiter snob e caffeina-dipendente che usa milanesismi in inglese (leverage, ASAP, deliverare, coworking), è ossessionato da fatturato e ROI, e demolisce tutto ciò che è banale o senza KPI.",
            "La HR Passivo-Aggressiva": "Comportati come 'La HR Passivo-Aggressiva': dolcissima in apparenza, usa emoji carine (😊✨🥰😉🤭) per nascondere critiche taglienti e condescendenti. Demolisce il CV con gentilezza esagerata.",
            "Il Tech Lead Esaurito": "Comportati come 'Il Tech Lead Esaurito': uno sviluppatore senior esasperato dal codice mal scritto e dalle buzzword vuote. Vuole solo GitHub, Docker, test e commit chiari. Detesta 'problem solver' e 'team player'.",
            "L'Investitore Silicon Valley": "Comportati come 'L'Investitore Silicon Valley': VC ossessionato da crescita esponenziale, metriche (10x, MRR, PLG), pivot e unfair advantage. Parla in inglese/italiano mescolato. Rifiuta tutto ciò che non scala."
        };
        const personaInstructions = personaMap[persona] || personaMap["Il Cinico Milanese"];

        const prompt = `Sei un recruiter AI con questa personalità: ${personaInstructions}

Rispondi sempre in lingua italiana (compresi tutti i testi all'interno del JSON come roastLines, optimizedSummary, optimizedBullets e funnyBadge).

Analizza questo CV e rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick, niente testo prima o dopo):

CV:
"""
${cvText}
"""

JSON da restituire (rispetta ESATTAMENTE questa struttura):
{
  "scores": { "ats": <intero 10-100>, "impact": <intero 10-100>, "readability": <intero 10-100>, "tone": <intero 10-100> },
  "roastLines": ["<critica 1 nello stile della personalità>", "<critica 2>", "<critica 3>"],
  "optimizedSummary": "<sommario professionale riscritto e ottimizzato>",
  "optimizedBullets": ["<bullet ottimizzato 1 con metrica>", "<bullet 2>", "<bullet 3>"],
  "funnyBadge": "<badge ironico nel tono della personalità>"
}`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                scores: {
                    type: "OBJECT",
                    properties: {
                        ats:         { type: "INTEGER" },
                        impact:      { type: "INTEGER" },
                        readability: { type: "INTEGER" },
                        tone:        { type: "INTEGER" }
                    },
                    required: ["ats", "impact", "readability", "tone"]
                },
                roastLines:       { type: "ARRAY",  items: { type: "STRING" } },
                optimizedSummary: { type: "STRING" },
                optimizedBullets: { type: "ARRAY",  items: { type: "STRING" } },
                funnyBadge:       { type: "STRING" }
            },
            required: ["scores", "roastLines", "optimizedSummary", "optimizedBullets", "funnyBadge"]
        };

        // Order: newest/fastest models first, plain-text fallback last
        const attempts = [
            { model: "gemini-2.5-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.5-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-2.0-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.0-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-1.5-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-1.5-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.0-flash-lite",          version: "v1beta", useSchema: true  },
            { model: "gemini-2.5-pro",                 version: "v1beta", useSchema: true  },
            { model: "gemini-1.5-pro",                 version: "v1",     useSchema: true  },
            { model: "gemini-2.5-flash",               version: "v1",     useSchema: false },
            { model: "gemini-2.0-flash",               version: "v1",     useSchema: false }
        ];

        let lastError = null;
        for (const { model, version, useSchema } of attempts) {
            try {
                console.log(`[Roast] ${model} version=${version} schema=${useSchema}`);
                const body = {
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: {
                        parts: [{ text: "Sei un recruiter italiano esperto. Devi analizzare il CV ed elaborare le tue risposte (roastLines, optimizedSummary, optimizedBullets, funnyBadge) esclusivamente in lingua italiana." }]
                    },
                    generationConfig: useSchema
                        ? { responseMimeType: "application/json", responseSchema }
                        : { temperature: 0.5 }
                };

                const res = await fetchWithTimeout(
                    `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
                    12000
                );

                if (res.ok) {
                    const data  = await res.json();
                    const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                    const parsed = JSON.parse(clean);
                    console.log(`✅ Roast OK con ${model}`);
                    return parsed;
                }

                const errData = await res.json().catch(() => ({}));
                const errMsg  = errData.error?.message || `HTTP ${res.status}`;
                lastError = new Error(errMsg);
                console.warn(`[Roast] ${model} → ${errMsg}`);

                if (res.status === 400 || res.status === 401 || res.status === 403) {
                    break;
                }
                continue;

            } catch (err) {
                lastError = err;
                console.warn(`[Roast] Eccezione con ${model}:`, err.message || err);
                if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                    break;
                }
            }
        }
        throw lastError || new Error("Nessun modello Gemini disponibile. Controlla che la API Key sia valida.");
    },

    /**
     * Connect to the Google Gemini API to generate real Pitch campaigns
     */
    generateGeminiPitch: async function(apiKey, cvText, companyName, companyUrl, role, tone, senderName) {
        const toneMap = {
            "Bold":          "Tono 'Sfacciato': audace, informale, provocante il giusto, cattura l'attenzione rompendo gli schemi delle mail tradizionali. Punta a far sorridere e spiccare.",
            "Professional":  "Tono 'Professionale': formale, garbato, focalizzato sulle competenze e sul rispetto dei ruoli, adatto ad aziende corporate o studi professionali.",
            "Creative":      "Tono 'Creativo': originale, narrativo, basato sullo storytelling e sulla dimostrazione immediata che si è studiato il prodotto dell'azienda target.",
            "Problem Solver":"Tono 'Problem Solver': analitico, diretto al punto, centrato sulla risoluzione dei problemi aziendali, riduzione dei costi o aumento delle conversioni, portando esempi di metriche."
        };
        const toneInstructions = toneMap[tone] || toneMap["Professional"];

        const prompt = `Sei un copywriter esperto in cold email per ottenere colloqui di lavoro.
Scrivi tutti i testi (emailSubject, emailBody, linkedinMessage, followupSubject, followupBody) in lingua italiana.

CV del candidato:
"""
${cvText}
"""

Mittente: ${senderName || "Il Candidato"}
Azienda target: ${companyName} (${companyUrl})
Ruolo desiderato: ${role || "Collaboratore"}
Stile: ${toneInstructions}

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick):
{
  "emailSubject": "<oggetto cold email accattivante>",
  "emailBody": "<corpo email con a capo \\n, personalizzata sull'azienda>",
  "linkedinMessage": "<nota LinkedIn MASSIMO 280 caratteri>",
  "followupSubject": "<oggetto follow-up a 5 giorni>",
  "followupBody": "<corpo follow-up breve ed elegante>"
}`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                emailSubject:    { type: "STRING" },
                emailBody:       { type: "STRING" },
                linkedinMessage: { type: "STRING" },
                followupSubject: { type: "STRING" },
                followupBody:    { type: "STRING" }
            },
            required: ["emailSubject", "emailBody", "linkedinMessage", "followupSubject", "followupBody"]
        };

        const attempts = [
            { model: "gemini-2.5-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.5-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-2.0-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.0-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-1.5-flash",               version: "v1",     useSchema: true  },
            { model: "gemini-1.5-flash",               version: "v1beta", useSchema: true  },
            { model: "gemini-2.0-flash-lite",          version: "v1beta", useSchema: true  },
            { model: "gemini-2.5-pro",                 version: "v1beta", useSchema: true  },
            { model: "gemini-1.5-pro",                 version: "v1",     useSchema: true  },
            { model: "gemini-2.5-flash",               version: "v1",     useSchema: false },
            { model: "gemini-2.0-flash",               version: "v1",     useSchema: false }
        ];

        const domain = companyUrl
            ? companyUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
            : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.it`;

        let lastError = null;
        for (const { model, version, useSchema } of attempts) {
            try {
                console.log(`[Pitch] ${model} version=${version} schema=${useSchema}`);
                const body = {
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: {
                        parts: [{ text: "Sei un copywriter italiano esperto. Scrivi le email ed i testi di candidatura esclusivamente in lingua italiana." }]
                    },
                    generationConfig: useSchema
                        ? { responseMimeType: "application/json", responseSchema }
                        : { temperature: 0.6 }
                };

                const res = await fetchWithTimeout(
                    `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
                    12000
                );

                if (res.ok) {
                    const data   = await res.json();
                    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                    const clean  = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                    const parsed = JSON.parse(clean);
                    console.log(`✅ Pitch OK con ${model}`);
                    return {
                        id:             `pitch_${Date.now()}`,
                        companyName,
                        websiteUrl:     companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`,
                        contactEmail:   `recruiting@${domain}`,
                        role,
                        tone,
                        emailSubject:   parsed.emailSubject,
                        emailBody:      parsed.emailBody,
                        linkedinMessage:parsed.linkedinMessage,
                        followupSubject:parsed.followupSubject,
                        followupBody:   parsed.followupBody,
                        status:         "Da Contattare",
                        dateCreated:    new Date().toLocaleDateString('it-IT')
                    };
                }

                const errData = await res.json().catch(() => ({}));
                const errMsg  = errData.error?.message || `HTTP ${res.status}`;
                lastError = new Error(errMsg);
                console.warn(`[Pitch] ${model} → ${errMsg}`);

                if (res.status === 400 || res.status === 401 || res.status === 403) {
                    break;
                }
                continue;

            } catch (err) {
                lastError = err;
                console.warn(`[Pitch] Eccezione con ${model}:`, err.message || err);
                if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                    break;
                }
            }
        }
        throw lastError || new Error("Nessun modello Gemini disponibile. Controlla che la API Key sia valida.");
    },

    /**
     * Connect to OpenRouter to generate real CV Roasts
     * Tries the user-selected model, then falls back through free/affordable models
     */
    generateOpenRouterRoast: async function(apiKey, model, cvText, persona) {
        const personaMap = {
            "Il Cinico Milanese": "Comportati come 'Il Cinico Milanese': un recruiter snob e caffeina-dipendente che usa milanesismi in inglese (leverage, ASAP, deliverare, coworking), è ossessionato da fatturato e ROI, e demolisce tutto ciò che è banale o senza KPI.",
            "La HR Passivo-Aggressiva": "Comportati come 'La HR Passivo-Aggressiva': dolcissima in apparenza, usa emoji carine (😊✨🥰😉🤭) per nascondere critiche taglienti e condescendenti. Demolisce il CV con gentilezza esagerata.",
            "Il Tech Lead Esaurito": "Comportati come 'Il Tech Lead Esaurito': uno sviluppatore senior esasperato dal codice mal scritto e dalle buzzword vuote. Vuole solo GitHub, Docker, test e commit chiari. Detesta 'problem solver' e 'team player'.",
            "L'Investitore Silicon Valley": "Comportati come 'L'Investitore Silicon Valley': VC ossessionato da crescita esponenziale, metriche (10x, MRR, PLG), pivot e unfair advantage. Parla in inglese/italiano mescolato. Rifiuta tutto ciò che non scala."
        };
        const personaInstructions = personaMap[persona] || personaMap["Il Cinico Milanese"];

        const prompt = `Sei un recruiter AI con questa personalità: ${personaInstructions}

Rispondi sempre in lingua italiana (compresi tutti i testi all'interno del JSON come roastLines, optimizedSummary, optimizedBullets e funnyBadge).

Analizza questo CV e rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick, niente testo prima o dopo):

CV:
"""
${cvText}
"""

JSON da restituire (rispetta ESATTAMENTE questa struttura):
{
  "scores": { "ats": <intero 10-100>, "impact": <intero 10-100>, "readability": <intero 10-100>, "tone": <intero 10-100> },
  "roastLines": ["<critica 1 nello stile della personalità>", "<critica 2>", "<critica 3>"],
  "optimizedSummary": "<sommario professionale riscritto e ottimizzato>",
  "optimizedBullets": ["<bullet ottimizzato 1 con metrica>", "<bullet 2>", "<bullet 3>"],
  "funnyBadge": "<badge ironico nel tono della personalità>"
}`;

        // Build model priority list — user choice first, then free fallbacks
        const primaryModel = model && model.trim() ? model.trim() : null;
        const freeModels = [
            "openrouter/free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "deepseek/deepseek-r1:free",
            "google/gemini-2.5-flash:free",
            "qwen/qwen-2.5-coder-32b:free",
            "meta-llama/llama-3.1-8b-instruct:free"
        ];
        const modelsToTry = primaryModel
            ? [primaryModel, ...freeModels.filter(m => m !== primaryModel)]
            : freeModels;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.href || "http://localhost",
            "X-Title": "JobFit AI"
        };

        let lastError = null;
        for (const tryModel of modelsToTry) {
            try {
                console.log(`[OpenRouter Roast] Trying model: ${tryModel}`);
                const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: tryModel,
                        messages: [
                            { role: "system", content: "Sei un recruiter italiano esperto. Rispondi sempre ed esclusivamente in lingua italiana (compresi tutti i campi roastLines, optimizedSummary, optimizedBullets e funnyBadge del JSON)." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.5,
                        max_tokens: 1200
                    })
                }, 12000);

                if (res.ok) {
                    const data = await res.json();
                    const raw = data.choices?.[0]?.message?.content ?? "";
                    // Aggressively strip markdown fences and leading/trailing garbage
                    const clean = raw
                        .replace(/^```json\s*/i, "").replace(/^```\s*/i, "")
                        .replace(/```\s*$/i, "").trim();
                    const jsonStart = clean.indexOf('{');
                    const jsonEnd = clean.lastIndexOf('}');
                    const jsonStr = jsonStart !== -1 && jsonEnd !== -1
                        ? clean.slice(jsonStart, jsonEnd + 1)
                        : clean;
                    const parsed = JSON.parse(jsonStr);

                    // Validate the parsed object has the required structure
                    if (!parsed.scores || !parsed.roastLines || !parsed.optimizedSummary) {
                        throw new Error("Risposta JSON incompleta dal modello " + tryModel);
                    }

                    console.log(`✅ OpenRouter Roast OK con ${tryModel}`);
                    return parsed;
                }

                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${res.status}`;
                lastError = new Error(`${tryModel}: ${errMsg}`);
                console.warn(`[OpenRouter Roast] ${tryModel} → ${errMsg}`);

                if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 402) {
                    break;
                }

            } catch (err) {
                lastError = err;
                console.warn(`[OpenRouter Roast] Eccezione con ${tryModel}:`, err.message || err);
                if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                    break;
                }
            }
        }

        throw lastError || new Error("Nessun modello OpenRouter disponibile. Controlla che la API Key sia valida.");
    },



    /**
     * Connect to OpenRouter to generate real Pitch campaigns
     */
    generateOpenRouterPitch: async function(apiKey, model, cvText, companyName, companyUrl, role, tone, senderName) {
        const toneMap = {
            "Bold":          "Tono 'Sfacciato': audace, informale, provocante il giusto, cattura l'attenzione rompendo gli schemi delle mail tradizionali. Punta a far sorridere e spiccare.",
            "Professional":  "Tono 'Professionale': formale, garbato, focalizzato sulle competenze e sul rispetto dei ruoli, adatto ad aziende corporate o studi professionali.",
            "Creative":      "Tono 'Creativo': originale, narrativo, basato sullo storytelling e sulla dimostrazione immediata che si è studiato il prodotto dell'azienda target.",
            "Problem Solver":"Tono 'Problem Solver': analitico, diretto al punto, centrato sulla risoluzione dei problemi aziendali, riduzione dei costi o aumento delle conversioni, portando esempi di metriche."
        };
        const toneInstructions = toneMap[tone] || toneMap["Professional"];

        const prompt = `Sei un copywriter esperto in cold email per ottenere colloqui di lavoro.
Scrivi tutti i testi (emailSubject, emailBody, linkedinMessage, followupSubject, followupBody) in lingua italiana.

CV del candidato:
"""
${cvText}
"""

Mittente: ${senderName || "Il Candidato"}
Azienda target: ${companyName} (${companyUrl})
Ruolo desiderato: ${role || "Collaboratore"}
Stile: ${toneInstructions}

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick):
{
  "emailSubject": "<oggetto cold email accattivante>",
  "emailBody": "<corpo email con a capo \\n, personalizzata sull'azienda>",
  "linkedinMessage": "<nota LinkedIn MASSIMO 280 caratteri>",
  "followupSubject": "<oggetto follow-up a 5 giorni>",
  "followupBody": "<corpo follow-up breve ed elegante>"
}`;

        const primaryModel = model && model.trim() ? model.trim() : null;
        const freeModels = [
            "openrouter/free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "deepseek/deepseek-r1:free",
            "google/gemini-2.5-flash:free",
            "qwen/qwen-2.5-coder-32b:free",
            "meta-llama/llama-3.1-8b-instruct:free"
        ];
        const modelsToTry = primaryModel
            ? [primaryModel, ...freeModels.filter(m => m !== primaryModel)]
            : freeModels;

        const domain = companyUrl
            ? companyUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
            : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.it`;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.href || "http://localhost",
            "X-Title": "CV Roast & Pitch AI"
        };

        let lastError = null;
        for (const tryModel of modelsToTry) {
            try {
                console.log(`[OpenRouter Pitch] Trying model: ${tryModel}`);
                const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: tryModel,
                        messages: [
                            { role: "system", content: "Sei un copywriter italiano esperto. Scrivi tutte le email, messaggi e follow-up esclusivamente in lingua italiana." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.6
                    })
                }, 12000);

                if (res.ok) {
                    const data = await res.json();
                    const raw = data.choices?.[0]?.message?.content ?? "";
                    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                    const parsed = JSON.parse(clean);
                    console.log(`✅ OpenRouter Pitch OK con ${tryModel}`);
                    return {
                        id:             `pitch_${Date.now()}`,
                        companyName,
                        websiteUrl:     companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`,
                        contactEmail:   `recruiting@${domain}`,
                        role,
                        tone,
                        emailSubject:   parsed.emailSubject,
                        emailBody:      parsed.emailBody,
                        linkedinMessage:parsed.linkedinMessage,
                        followupSubject:parsed.followupSubject,
                        followupBody:   parsed.followupBody,
                        status:         "Da Contattare",
                        dateCreated:    new Date().toLocaleDateString('it-IT')
                    };
                }

                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${res.status}`;
                lastError = new Error(`${tryModel}: ${errMsg}`);
                console.warn(`[OpenRouter Pitch] ${tryModel} → ${errMsg}`);

                if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 402) {
                    break;
                }
            } catch (err) {
                lastError = err;
                console.warn(`[OpenRouter Pitch] Eccezione con ${tryModel}:`, err.message || err);
                if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                    break;
                }
            }
        }
        throw lastError || new Error("Nessun modello OpenRouter disponibile per il Pitch. Controlla che la API Key sia valida.");
    },

    /**
     * AI-Powered Job Matching Evaluator (routes to Gemini, OpenRouter or local fallback)
     */
    evaluateJobMatching: async function(apiKey, provider, model, cvText, jobTitle, jobCompany, jobDesc) {
        const prompt = `Sei un HR manager esperto. Hai il CV del candidato e i dettagli di un'offerta di lavoro reale.
Valuta la coerenza e la compatibilità del candidato per questa posizione.

CV del candidato:
"""
${cvText}
"""

Offerta di Lavoro:
Ruolo: ${jobTitle}
Azienda: ${jobCompany}
Descrizione:
${jobDesc}

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backticks):
{
  "matchScore": <intero tra 10 e 100 che indica la compatibilità>,
  "matchingSkills": ["<skill 1 trovata sia nel CV che nella descrizione>", "<skill 2>", ...],
  "missingSkills": ["<skill critica richiesta ma mancante o debole nel CV>", ...],
  "reasoning": "<breve spiegazione in italiano (max 2-3 frasi) del perché il candidato è adatto o di cosa gli manca per essere ideale>"
}`;

        if (provider === 'gemini' && apiKey && apiKey.trim() !== '') {
            const responseSchema = {
                type: "OBJECT",
                properties: {
                    matchScore: { type: "INTEGER" },
                    matchingSkills: { type: "ARRAY", items: { type: "STRING" } },
                    missingSkills: { type: "ARRAY", items: { type: "STRING" } },
                    reasoning: { type: "STRING" }
                },
                required: ["matchScore", "matchingSkills", "missingSkills", "reasoning"]
            };

            const attempts = [
                { model: "gemini-2.5-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.5-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-2.0-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.0-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-1.5-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-1.5-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.0-flash-lite",          version: "v1beta", useSchema: true  },
                { model: "gemini-2.5-pro",                 version: "v1beta", useSchema: true  },
                { model: "gemini-1.5-pro",                 version: "v1",     useSchema: true  },
                { model: "gemini-2.5-flash",               version: "v1",     useSchema: false },
                { model: "gemini-2.0-flash",               version: "v1",     useSchema: false }
            ];

            let lastError = null;
            for (const { model, version, useSchema } of attempts) {
                try {
                    console.log(`[Match] ${model} version=${version} schema=${useSchema}`);
                    const body = {
                        contents: [{ parts: [{ text: prompt }] }],
                        systemInstruction: {
                            parts: [{ text: "Sei un HR manager italiano esperto. Scrivi le tue valutazioni di matching esclusivamente in lingua italiana." }]
                        },
                        generationConfig: useSchema
                            ? { responseMimeType: "application/json", responseSchema }
                            : { temperature: 0.4 }
                    };

                    const res = await fetchWithTimeout(
                        `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
                        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
                        12000
                    );

                    if (res.ok) {
                        const data = await res.json();
                        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                        const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                        const parsed = JSON.parse(clean);
                        console.log(`✅ Match OK con ${model}`);
                        return parsed;
                    }

                    const errData = await res.json().catch(() => ({}));
                    const errMsg  = errData.error?.message || `HTTP ${res.status}`;
                    lastError = new Error(errMsg);
                    console.warn(`[Match] ${model} → ${errMsg}`);
                    
                    if (res.status === 400 || res.status === 401 || res.status === 403) {
                        break;
                    }
                    continue;

                } catch (err) {
                    lastError = err;
                    console.warn(`[Match] Eccezione con ${model}:`, err.message || err);
                    if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                        break;
                    }
                }
            }
            console.warn("Gemini Match Error (all attempts failed), fallback to mock:", lastError);
        } else if (provider === 'openrouter' && apiKey && apiKey.trim() !== '') {
            const primaryModel = model && model.trim() ? model.trim() : null;
            const freeModels = [
                "openrouter/free",
                "meta-llama/llama-3.3-70b-instruct:free",
                "deepseek/deepseek-r1:free",
                "google/gemini-2.5-flash:free",
                "qwen/qwen-2.5-coder-32b:free",
                "meta-llama/llama-3.1-8b-instruct:free"
            ];
            const modelsToTry = primaryModel
                ? [primaryModel, ...freeModels.filter(m => m !== primaryModel)]
                : freeModels;

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.href || "http://localhost",
                "X-Title": "CV Roast & Pitch AI"
            };

            let lastError = null;
            for (const tryModel of modelsToTry) {
                try {
                    console.log(`[OpenRouter Match] Trying model: ${tryModel}`);
                    const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                            model: tryModel,
                            messages: [
                                { role: "system", content: "Sei un HR manager italiano esperto. Rispondi sempre ed esclusivamente in lingua italiana." },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.4
                        })
                    }, 12000);

                    if (res.ok) {
                        const data = await res.json();
                        const raw = data.choices?.[0]?.message?.content ?? "";
                        const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                        console.log(`✅ OpenRouter Match OK con ${tryModel}`);
                        return JSON.parse(clean);
                    }

                    const errData = await res.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `HTTP ${res.status}`;
                    lastError = new Error(`${tryModel}: ${errMsg}`);
                    console.warn(`[OpenRouter Match] ${tryModel} → ${errMsg}`);

                    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 402) {
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    console.warn(`[OpenRouter Match] Eccezione con ${tryModel}:`, err.message || err);
                    if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                        break;
                    }
                }
            }
            console.warn("OpenRouter Match Error (all attempts failed), fallback to mock:", lastError);
        } else if (provider === 'ollama') {
            try {
                const cleanUrl = (apiKey || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
                const res = await fetchWithTimeout(cleanUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: model || "llama3",
                        messages: [{ role: "user", content: prompt }],
                        stream: false,
                        format: "json"
                    })
                }, 15000);

                if (res.ok) {
                    const data = await res.json();
                    const raw = data.message?.content || "";
                    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                    return JSON.parse(clean);
                }
            } catch (err) {
                console.warn("Ollama Match Error, fallback to mock:", err);
            }
        }

        // Fallback to local mock evaluation
        return this.generateMockJobMatching(cvText, jobTitle, jobDesc);
    },

    /**
     * Local mock evaluator that parses overlapping keywords (works 100% offline)
     */
    generateMockJobMatching: function(cvText, jobTitle, jobDesc) {
        const cvData = (typeof cvBuilder !== 'undefined') ? cvBuilder.extractCvData(cvText) : { skills: [] };
        const cvSkills = cvData.skills || [];
        const descLower = (jobDesc || '').toLowerCase();
        const titleLower = (jobTitle || '').toLowerCase();
        
        // Find matching skills
        const matchingSkills = cvSkills.filter(skill => descLower.includes(skill.toLowerCase()));
        
        // Find missing skills (skills in job description that are NOT in CV)
        const commonJobSkills = ["javascript", "react", "node", "python", "sql", "git", "aws", "docker", "typescript", "marketing", "seo", "salesforce", "excel"];
        const missingSkills = commonJobSkills.filter(skill => descLower.includes(skill) && !cvSkills.some(s => s.toLowerCase() === skill));

        // Compute match score
        let score = 50;
        if (cvData.role && titleLower.includes(cvData.role.toLowerCase())) score += 20;
        score += matchingSkills.length * 5;
        score = Math.min(98, Math.max(25, score));

        // Generate reasoning
        let reasoning = "";
        if (matchingSkills.length > 0) {
            reasoning = `Hai un buon allineamento per questo ruolo grazie alle tue competenze in ${matchingSkills.slice(0, 3).join(", ")}. `;
        } else {
            reasoning = `Il ruolo è interessante ma il tuo CV non menziona competenze chiave richieste direttamente dalla posizione. `;
        }
        if (missingSkills.length > 0) {
            reasoning += `Per massimizzare le possibilità, potresti evidenziare la tua conoscenza di: ${missingSkills.slice(0, 2).join(", ")}.`;
        } else {
            reasoning += `Il tuo profilo copre le richieste principali della descrizione del lavoro.`;
        }

        return {
            matchScore: score,
            matchingSkills: matchingSkills,
            missingSkills: missingSkills.slice(0, 3),
            reasoning: reasoning
        };
    },

    generateOllamaRoast: async function(endpoint, model, cvText, persona) {
        const personaMap = {
            "Il Cinico Milanese": "Comportati come 'Il Cinico Milanese': un recruiter snob e caffeina-dipendente che usa milanesismi in inglese (leverage, ASAP, deliverare, coworking), è ossessionato da fatturato e ROI, e demolisce tutto ciò che è banale o senza KPI.",
            "La HR Passivo-Aggressiva": "Comportati come 'La HR Passivo-Aggressiva': dolcissima in apparenza, usa emoji carine (😊✨🥰😉🤭) per nascondere critiche taglienti e condescendenti. Demolisce il CV con gentilezza esagerata.",
            "Il Tech Lead Esaurito": "Comportati come 'Il Tech Lead Esaurito': uno sviluppatore senior esasperato dal codice mal scritto e dalle buzzword vuote. Vuole solo GitHub, Docker, test e commit chiari. Detesta 'problem solver' e 'team player'.",
            "L'Investitore Silicon Valley": "Comportati come 'L'Investitore Silicon Valley': VC ossessionato da crescita esponenziale, metriche (10x, MRR, PLG), pivot e unfair advantage. Parla in inglese/italiano mescolato. Rifiuta tutto ciò che non scala."
        };
        const personaInstructions = personaMap[persona] || personaMap["Il Cinico Milanese"];

        const prompt = `Sei un recruiter AI con questa personalità: ${personaInstructions}

Rispondi sempre in lingua italiana (compresi tutti i testi all'interno del JSON come roastLines, optimizedSummary, optimizedBullets e funnyBadge).

Analizza questo CV e rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick, niente testo prima o dopo):

CV:
"""
${cvText}
"""

JSON da restituire (rispetta ESATTAMENTE questa struttura):
{
  "scores": { "ats": <intero 10-100>, "impact": <intero 10-100>, "readability": <intero 10-100>, "tone": <intero 10-100> },
  "roastLines": ["<critica 1 nello stile della personalità>", "<critica 2>", "<critica 3>"],
  "optimizedSummary": "<sommario professionale riscritto e ottimizzato>",
  "optimizedBullets": ["<bullet ottimizzato 1 con metrica>", "<bullet 2>", "<bullet 3>"],
  "funnyBadge": "<badge ironico nel tono della personalità>"
}`;

        try {
            const cleanUrl = (endpoint || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
            const res = await fetchWithTimeout(cleanUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: model || "llama3",
                    messages: [{ role: "user", content: prompt }],
                    stream: false,
                    format: "json"
                })
            }, 15000);

            if (res.ok) {
                const data = await res.json();
                const raw = data.message?.content || "";
                const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                return JSON.parse(clean);
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            console.error("Ollama Roast Error:", err);
            throw err;
        }
    },

    generateOllamaPitch: async function(endpoint, model, cvText, companyName, companyUrl, role, tone, senderName) {
        const toneMap = {
            "Bold":          "Tono 'Sfacciato': audace, informale, provocante il giusto, cattura l'attenzione rompendo gli schemi delle mail tradizionali. Punta a far sorridere e spiccare.",
            "Professional":  "Tono 'Professionale': formale, garbato, focalizzato sulle competenze e sul rispetto dei ruoli, adatto ad aziende corporate o studi professionali.",
            "Creative":      "Tono 'Creativo': originale, narrativo, basato sullo storytelling e sulla dimostrazione immediata che si è studiato il prodotto dell'azienda target.",
            "Problem Solver":"Tono 'Problem Solver': analitico, diretto al punto, centrato sulla risoluzione dei problemi aziendali, riduzione dei costi o aumento delle conversioni, portando esempi di metriche."
        };
        const toneInstructions = toneMap[tone] || toneMap["Professional"];

        const prompt = `Sei un copywriter esperto in cold email per ottenere colloqui di lavoro.
Scrivi tutti i testi (emailSubject, emailBody, linkedinMessage, followupSubject, followupBody) in lingua italiana.

CV del candidato:
"""
${cvText}
"""

Mittente: ${senderName || "Il Candidato"}
Azienda target: ${companyName} (${companyUrl})
Ruolo desiderato: ${role || "Collaboratore"}
Stile: ${toneInstructions}

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick):
{
  "emailSubject": "<oggetto cold email accattivante>",
  "emailBody": "<corpo email con a capo \\n, personalizzata sull'azienda>",
  "linkedinMessage": "<nota LinkedIn MASSIMO 280 caratteri>",
  "followupSubject": "<oggetto follow-up a 5 giorni>",
  "followupBody": "<corpo follow-up breve ed elegante>"
}`;

        const domain = companyUrl
            ? companyUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
            : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.it`;

        try {
            const cleanUrl = (endpoint || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
            const res = await fetchWithTimeout(cleanUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: model || "llama3",
                    messages: [{ role: "user", content: prompt }],
                    stream: false,
                    format: "json"
                })
            }, 15000);

            if (res.ok) {
                const data = await res.json();
                const raw = data.message?.content || "";
                const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                const parsed = JSON.parse(clean);
                return {
                    id:             `pitch_${Date.now()}`,
                    companyName,
                    websiteUrl:     companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`,
                    contactEmail:   `recruiting@${domain}`,
                    role,
                    tone,
                    emailSubject:   parsed.emailSubject,
                    emailBody:      parsed.emailBody,
                    linkedinMessage:parsed.linkedinMessage,
                    followupSubject:parsed.followupSubject,
                    followupBody:   parsed.followupBody,
                    status:         "Da Contattare",
                    dateCreated:    new Date().toLocaleDateString('it-IT')
                };
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            console.error("Ollama Pitch Error:", err);
            throw err;
        }
    },

    parseCvWithAi: async function(provider, apiKey, cvText, model) {
        const prompt = `Sei un parser di CV professionale di ultima generazione. Il tuo compito è estrarre TUTTE le informazioni dal testo del CV fornito e restituire un JSON strutturato in italiano che rappresenti una COPIA PERFETTA e fedele del CV. Non omettere alcuna esperienza o informazione importante.

Testo del CV:
"""
${cvText}
"""

Devi rispondere ESCLUSIVAMENTE con un oggetto JSON valido (niente markdown, niente backtick, niente testo prima o dopo).
Usa ESATTAMENTE la struttura seguente:
{
  "name": "<Nome e Cognome del candidato>",
  "role": "<Ruolo professionale principale, es. Software Engineer>",
  "email": "<Email>",
  "phone": "<Telefono>",
  "location": "<Città e/o Paese>",
  "linkedin": "<URL o username LinkedIn>",
  "github": "<URL o username GitHub>",
  "website": "<Sito web personale>",
  "summary": "<Sommario professionale o biografia, se presente>",
  "skills": ["<Skill 1>", "<Skill 2>", ...],
  "languages": [
    { "name": "<Nome lingua>", "level": "<Livello, es. Madrelingua, C1, Fluente>" }
  ],
  "experiences": [
    {
      "role": "<Ruolo svolto>",
      "company": "<Nome azienda o datore di lavoro>",
      "dates": "<Periodo di lavoro, es. Gennaio 2021 - Presente>",
      "bullets": ["<Responsabilità o traguardo 1>", "<Responsabilità o traguardo 2>", ...]
    }
  ],
  "education": [
    {
      "degree": "<Titolo di studio conseguito>",
      "institution": "<Università o istituto>",
      "year": "<Anno di conseguimento o periodo, es. 2020>"
    }
  ]
}`;

        if (provider === 'gemini' && apiKey && apiKey.trim() !== '') {
            const responseSchema = {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    role: { type: "STRING" },
                    email: { type: "STRING" },
                    phone: { type: "STRING" },
                    location: { type: "STRING" },
                    linkedin: { type: "STRING" },
                    github: { type: "STRING" },
                    website: { type: "STRING" },
                    summary: { type: "STRING" },
                    skills: { type: "ARRAY", items: { type: "STRING" } },
                    languages: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                name: { type: "STRING" },
                                level: { type: "STRING" }
                            },
                            required: ["name"]
                        }
                    },
                    experiences: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                role: { type: "STRING" },
                                company: { type: "STRING" },
                                dates: { type: "STRING" },
                                bullets: { type: "ARRAY", items: { type: "STRING" } }
                            },
                            required: ["role", "company"]
                        }
                    },
                    education: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                degree: { type: "STRING" },
                                institution: { type: "STRING" },
                                year: { type: "STRING" }
                            },
                            required: ["degree"]
                        }
                    }
                },
                required: ["name", "role", "email", "experiences", "education"]
            };

            const attempts = [
                { model: "gemini-2.5-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.5-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-2.0-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.0-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-1.5-flash",               version: "v1",     useSchema: true  },
                { model: "gemini-1.5-flash",               version: "v1beta", useSchema: true  },
                { model: "gemini-2.0-flash-lite",          version: "v1beta", useSchema: true  },
                { model: "gemini-2.5-pro",                 version: "v1beta", useSchema: true  },
                { model: "gemini-1.5-pro",                 version: "v1",     useSchema: true  },
                { model: "gemini-2.5-flash",               version: "v1",     useSchema: false },
                { model: "gemini-2.0-flash",               version: "v1",     useSchema: false }
            ];

            let lastError = null;
            for (const { model: tryModel, version, useSchema } of attempts) {
                try {
                    console.log(`[Parse CV] Trying Gemini model: ${tryModel}`);
                    const body = {
                        contents: [{ parts: [{ text: prompt }] }],
                        systemInstruction: {
                            parts: [{ text: "Sei un parser di CV professionale. Estrai ed organizza le informazioni del CV esclusivamente in lingua italiana." }]
                        },
                        generationConfig: useSchema
                            ? { responseMimeType: "application/json", responseSchema }
                            : { temperature: 0.1 }
                    };

                    const res = await fetchWithTimeout(
                        `https://generativelanguage.googleapis.com/${version}/models/${tryModel}:generateContent?key=${apiKey}`,
                        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
                        12000
                    );

                    if (res.ok) {
                        const data = await res.json();
                        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                        const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                        return JSON.parse(clean);
                    }

                    const errData = await res.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `HTTP ${res.status}`;
                    lastError = new Error(errMsg);

                    if (res.status === 400 || res.status === 401 || res.status === 403) {
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                        break;
                    }
                }
            }
            throw lastError || new Error("Impossibile connettersi a Gemini per il parsing.");
        } 
        else if (provider === 'openrouter' && apiKey && apiKey.trim() !== '') {
            const primaryModel = model && model.trim() ? model.trim() : null;
            const freeModels = [
                "openrouter/free",
                "meta-llama/llama-3.3-70b-instruct:free",
                "deepseek/deepseek-r1:free",
                "google/gemini-2.5-flash:free",
                "qwen/qwen-2.5-coder-32b:free",
                "meta-llama/llama-3.1-8b-instruct:free"
            ];
            const modelsToTry = primaryModel
                ? [primaryModel, ...freeModels.filter(m => m !== primaryModel)]
                : freeModels;

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.href || "http://localhost",
                "X-Title": "CV Roast & Pitch AI"
            };

            let lastError = null;
            for (const tryModel of modelsToTry) {
                try {
                    console.log(`[Parse CV] Trying OpenRouter model: ${tryModel}`);
                    const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                            model: tryModel,
                            messages: [
                                { role: "system", content: "Sei un parser di CV professionale. Estrai ed organizza le informazioni del CV esclusivamente in lingua italiana." },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.1
                        })
                    }, 12000);

                    if (res.ok) {
                        const data = await res.json();
                        const raw = data.choices?.[0]?.message?.content ?? "";
                        const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                        const startIdx = clean.indexOf('{');
                        const endIdx = clean.lastIndexOf('}');
                        const jsonStr = (startIdx !== -1 && endIdx !== -1) ? clean.substring(startIdx, endIdx + 1) : clean;
                        return JSON.parse(jsonStr);
                    }

                    const errData = await res.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `HTTP ${res.status}`;
                    lastError = new Error(`${tryModel}: ${errMsg}`);

                    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 402) {
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                        break;
                    }
                }
            }
            throw lastError || new Error("Impossibile connettersi ad OpenRouter per il parsing.");
        } 
        else if (provider === 'ollama') {
            const cleanUrl = (apiKey || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
            const res = await fetchWithTimeout(cleanUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: model || "llama3",
                    messages: [{ role: "user", content: prompt }],
                    stream: false,
                    format: "json"
                })
            }, 15000);

            if (res.ok) {
                const data = await res.json();
                const raw = data.message?.content || "";
                const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
                return JSON.parse(clean);
            }
            throw new Error(`Ollama HTTP ${res.status}`);
        }
        return null;
    }
};

