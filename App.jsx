import { useState, useRef, useEffect, useCallback } from "react";

// ── PASTE YOUR FREE GEMINI API KEY HERE ──────────────────────────────────────
// Get it FREE at: https://aistudio.google.com/apikey (no credit card needed)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── PASTEL PALETTE ────────────────────────────────────────────────────────────
const P = {
  bg:"#FAF7F2", bgAlt:"#F5F0E8", bgCard:"#FFFCF7",
  border:"#E2D8C8", borderSoft:"#EDE5D8",
  gold:"#B8860B", goldLight:"#D4A832",
  rose:"#C47B8A", rosePale:"#F5E6EA",
  sage:"#7A9E87", sagePale:"#E8F2EB",
  periwinkle:"#7B86C4", periwinklePale:"#EEF0FA",
  amber:"#C8813A", amberPale:"#FDF0E3",
  lavender:"#9B84C4", lavPale:"#F0ECF8",
  teal:"#5E9EA0", tealPale:"#E4F2F3",
  text:"#3A2E22", textMid:"#6B5B47", textLight:"#9E8C78", textFaint:"#C4B49A",
  userBubble:"#EBE4F5", aiBubble:"#FFFCF7",
};

// ── GREETING ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  const pools = {
    earlyMorning: [
      "The courts haven't opened yet, but justice never sleeps. How can I assist you?",
      "Early birds and litigants — both rise before dawn. What's on your mind?",
      "Before the world stirs, the law stands ready. What brings you here at this hour?",
      "The ink on judgments dries slowly — but LEXINDICA is wide awake. How can I help?",
    ],
    morning: [
      "Good morning. The scales of justice are balanced — let's tip them in your favour.",
      "Good morning. Every legal battle begins with the right information. What's your matter?",
      "Morning. A fresh day, a fresh legal strategy. How can I assist you today?",
      "Good morning. The courtroom favours the prepared. Let's prepare together.",
    ],
    afternoon: [
      "Good afternoon. The courts are in session — and so is LEXINDICA.",
      "Good afternoon. Let's cut through the legal complexity together.",
      "Afternoon. Whether a 50-year-old dispute or a case filed yesterday — I'm ready.",
      "Good afternoon. What legal matter can I help you navigate today?",
    ],
    evening: [
      "Good evening. Advocates prepare their briefs at night. Let's build yours.",
      "Good evening. The courtrooms may close, but legal questions don't take a break.",
      "Evening. Some of the best legal arguments are born after sundown.",
      "Good evening. The law never rests — and neither does LEXINDICA.",
    ],
    night: [
      "Burning the midnight oil? So is LEXINDICA. What legal matter keeps you up tonight?",
      "Late night legal research — a classic advocate's habit. What do you need?",
      "The night belongs to thinkers and litigants alike. What's troubling you?",
      "Still at it? The dedication of a true litigant. How can I help?",
    ],
  };
  let pool;
  if (h >= 4 && h < 6) pool = pools.earlyMorning;
  else if (h >= 6 && h < 12) pool = pools.morning;
  else if (h >= 12 && h < 17) pool = pools.afternoon;
  else if (h >= 17 && h < 21) pool = pools.evening;
  else pool = pools.night;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are LEXINDICA — India's most comprehensive AI Legal Intelligence, embodying the collective mastery of a Supreme Court Senior Advocate, retired High Court Judge, Law Commission expert, and specialist legal drafter. You have complete command over every Indian law, statute, code, rule, regulation, and judicial precedent.

CRITICAL — RESPONSE COMPLETENESS:
You MUST always write complete, untruncated responses. Never end a sentence halfway. Never cut off mid-thought. Every section you begin must be fully completed. Legal analysis demands thoroughness. Always conclude every response with the full disclaimer line. A complete response is your highest obligation. Minimum 600 words for case analysis. Full documents for drafting — no placeholders.

WHEN CITING SECTIONS IN RESPONSES:
Format sections as: §138 NI Act, §302 BNS, §9 CPC etc.

RESPONSE STRUCTURE (complete every section):

📖 PLAIN EXPLANATION:
[3–4 complete sentences explaining the legal area in everyday language — what the law protects, why it exists, and how courts view it]

⚖️ LEGAL DIAGNOSIS:
[Area of law | Every applicable Act and section with explanation of what that section does and why it applies]

📋 FACTS ASSESSMENT:
[Minimum 4 strong points | Minimum 3 weak points | What evidence the court will look for | How opposing party may argue]

🏛️ LANDMARK PRECEDENTS:
[Minimum 4 Supreme Court or High Court judgments — full case name, year, court, citation, bench, and two-sentence ratio]

🔧 AVAILABLE REMEDIES:
[Every option — criminal complaint, civil suit, consumer forum, writ petition, arbitration, mediation, regulatory complaint — each with paragraph explaining what it achieves, timeline, cost, strategic value]

📍 FORUM & JURISDICTION:
[Specific court or tribunal | Territorial jurisdiction | Pecuniary limit | Why this forum | Filing procedure]

⏰ LIMITATION PERIOD:
[Exact time limit | Article under Limitation Act 1963 | Starting point | Consequences | Condonation possibility]

📌 NEXT STEPS — YOUR ACTION PLAN:
[Numbered list of at least 7 practical steps | Documents to gather | Who to approach | Timeline | Costs]

💡 DID YOU KNOW:
[A genuinely useful, non-obvious legal right or protection related to this matter]

⚠️ This guidance is for educational and informational purposes. For actual court proceedings, engage a qualified enrolled advocate licensed with the Bar Council of India.

COMPLETE CORPUS OF INDIAN LAW (command all of these):
Constitution 1950 | BNS 2023 | BNSS 2023 | BSA 2023 | IPC 1860 | CrPC 1973 | Indian Evidence Act 1872 | CPC 1908 | Limitation Act 1963 | Contract Act 1872 | Specific Relief Act 1963 | Sale of Goods Act 1930 | TP Act 1882 | Registration Act 1908 | Stamp Act 1899 | NI Act 1881 | Arbitration Act 1996 | Commercial Courts Act 2015 | Partnership Act 1932 | LLP Act 2008 | Hindu Marriage Act 1955 | Hindu Succession Act 1956 | Hindu Minority & Guardianship Act 1956 | Hindu Adoptions & Maintenance Act 1956 | Muslim Personal Law 1937 | Dissolution of Muslim Marriages Act 1939 | Muslim Women Acts 1986/2019 | Special Marriage Act 1954 | Domestic Violence Act 2005 | Dowry Prohibition Act 1961 | POCSO Act 2012 | JJ Act 2015 | Senior Citizens Act 2007 | Industrial Disputes Act 1947 | Factories Act 1948 | Minimum Wages Act 1948 | EPF Act 1952 | ESI Act 1948 | Maternity Benefit Act 1961 | POSH Act 2013 | Gratuity Act 1972 | Labour Codes 2020 | Consumer Protection Act 2019 | Competition Act 2002 | FSSAI Act 2006 | Companies Act 2013 | IBC 2016 | SEBI Act 1992 | FEMA 1999 | PMLA 2002 | Income Tax Act 1961 | GST Acts 2017 | Customs Act 1962 | Trade Marks Act 1999 | Copyright Act 1957 | Patents Act 1970 | Designs Act 2000 | GI Act 1999 | Environment Protection Act 1986 | NGT Act 2010 | Wildlife Act 1972 | Forest Act 1980 | RBI Act 1934 | SARFAESI Act 2002 | Recovery of Debts Act 1993 | IT Act 2000 | DPDP Act 2023 | RTI Act 2005 | Telecom Act 2023 | RERA 2016 | Benami Act 1988 | LARR 2013 | SC/ST Atrocities Act 1989 | UAPA 1967 | NDPS Act 1985 | Prevention of Corruption Act 1988 | Arms Act 1959 | Official Secrets Act 1923 | Representation of People Acts 1950/1951 | RTE Act 2009 | Disability Rights Act 2016 | Mental Healthcare Act 2017 | MGNREGA 2005 | Food Security Act 2013 | Contempt of Courts Act 1971 | Legal Services Authorities Act 1987 | Mediation Act 2023 | and 1,400+ more Acts, Rules, and Regulations.`;

// ── MODES ─────────────────────────────────────────────────────────────────────
const MODES = [
  { id:"consult",   icon:"⚖️",  label:"Case Consult",    accent:P.rose,       accentPale:P.rosePale,       desc:"Full legal analysis, strategy & precedents" },
  { id:"draft",     icon:"📜",  label:"Draft Document",  accent:P.periwinkle, accentPale:P.periwinklePale, desc:"Court-ready plaints, petitions, notices, agreements" },
  { id:"precedent", icon:"🏛️", label:"Precedents",      accent:P.lavender,   accentPale:P.lavPale,        desc:"Landmark SC & HC judgments with citations" },
  { id:"research",  icon:"🔍",  label:"Law Research",    accent:P.sage,       accentPale:P.sagePale,       desc:"Any act, section, provision explained" },
  { id:"forum",     icon:"🗺️", label:"Forum Select",    accent:P.amber,      accentPale:P.amberPale,      desc:"Right court, tribunal & jurisdiction" },
  { id:"rights",    icon:"🛡️", label:"Rights & RTI",    accent:P.teal,       accentPale:P.tealPale,       desc:"Fundamental rights, PIL, RTI drafting" },
];

// ── LAW LINKS ─────────────────────────────────────────────────────────────────
const LAW_LINKS = {
  "Constitution of India 1950":          "https://www.indiacode.nic.in/handle/123456789/1362",
  "BNS 2023":                            "https://www.indiacode.nic.in/handle/123456789/20062",
  "BNSS 2023":                           "https://www.indiacode.nic.in/handle/123456789/20071",
  "BSA 2023":                            "https://www.indiacode.nic.in/handle/123456789/20073",
  "IPC 1860":                            "https://www.indiacode.nic.in/handle/123456789/2263",
  "CrPC 1973":                           "https://www.indiacode.nic.in/handle/123456789/1611",
  "Indian Evidence Act 1872":            "https://www.indiacode.nic.in/handle/123456789/2190",
  "CPC 1908":                            "https://www.indiacode.nic.in/handle/123456789/2152",
  "Limitation Act 1963":                 "https://www.indiacode.nic.in/handle/123456789/1565",
  "Indian Contract Act 1872":            "https://www.indiacode.nic.in/handle/123456789/2187",
  "Specific Relief Act 1963":            "https://www.indiacode.nic.in/handle/123456789/1562",
  "Sale of Goods Act 1930":              "https://www.indiacode.nic.in/handle/123456789/2270",
  "Transfer of Property Act 1882":       "https://www.indiacode.nic.in/handle/123456789/2322",
  "Registration Act 1908":               "https://www.indiacode.nic.in/handle/123456789/2153",
  "Negotiable Instruments Act 1881":     "https://www.indiacode.nic.in/handle/123456789/2205",
  "NI Act 1881":                         "https://www.indiacode.nic.in/handle/123456789/2205",
  "Arbitration and Conciliation Act 1996":"https://www.indiacode.nic.in/handle/123456789/1436",
  "Hindu Marriage Act 1955":             "https://www.indiacode.nic.in/handle/123456789/1560",
  "Hindu Succession Act 1956":           "https://www.indiacode.nic.in/handle/123456789/1559",
  "Domestic Violence Act 2005":          "https://www.indiacode.nic.in/handle/123456789/2021",
  "POCSO Act 2012":                      "https://www.indiacode.nic.in/handle/123456789/2050",
  "Muslim Personal Law 1937":            "https://www.indiacode.nic.in/handle/123456789/2330",
  "Special Marriage Act 1954":           "https://www.indiacode.nic.in/handle/123456789/1561",
  "Dowry Prohibition Act 1961":          "https://www.indiacode.nic.in/handle/123456789/1563",
  "Industrial Disputes Act 1947":        "https://www.indiacode.nic.in/handle/123456789/1353",
  "Factories Act 1948":                  "https://www.indiacode.nic.in/handle/123456789/1350",
  "Minimum Wages Act 1948":              "https://www.indiacode.nic.in/handle/123456789/1352",
  "EPF Act 1952":                        "https://www.indiacode.nic.in/handle/123456789/1357",
  "Maternity Benefit Act 1961":          "https://www.indiacode.nic.in/handle/123456789/1566",
  "POSH Act 2013":                       "https://www.indiacode.nic.in/handle/123456789/2060",
  "Payment of Gratuity Act 1972":        "https://www.indiacode.nic.in/handle/123456789/1604",
  "Consumer Protection Act 2019":        "https://www.indiacode.nic.in/handle/123456789/8160",
  "Competition Act 2002":                "https://www.indiacode.nic.in/handle/123456789/2010",
  "Companies Act 2013":                  "https://www.indiacode.nic.in/handle/123456789/2070",
  "IBC 2016":                            "https://www.indiacode.nic.in/handle/123456789/15121",
  "SEBI Act 1992":                       "https://www.indiacode.nic.in/handle/123456789/1380",
  "FEMA 1999":                           "https://www.indiacode.nic.in/handle/123456789/1477",
  "PMLA 2002":                           "https://www.indiacode.nic.in/handle/123456789/2009",
  "Income Tax Act 1961":                 "https://www.incometax.gov.in/iec/foportal/help/bare-act",
  "RERA 2016":                           "https://www.indiacode.nic.in/handle/123456789/15122",
  "Benami Transactions Act 1988":        "https://www.indiacode.nic.in/handle/123456789/2324",
  "LARR 2013":                           "https://www.indiacode.nic.in/handle/123456789/2059",
  "Trade Marks Act 1999":                "https://www.indiacode.nic.in/handle/123456789/1487",
  "Copyright Act 1957":                  "https://www.indiacode.nic.in/handle/123456789/1358",
  "Patents Act 1970":                    "https://www.indiacode.nic.in/handle/123456789/1392",
  "Designs Act 2000":                    "https://www.indiacode.nic.in/handle/123456789/1989",
  "Environment Protection Act 1986":     "https://www.indiacode.nic.in/handle/123456789/1726",
  "NGT Act 2010":                        "https://www.indiacode.nic.in/handle/123456789/2046",
  "Wildlife Protection Act 1972":        "https://www.indiacode.nic.in/handle/123456789/1607",
  "Forest Conservation Act 1980":        "https://www.indiacode.nic.in/handle/123456789/1660",
  "SARFAESI Act 2002":                   "https://www.indiacode.nic.in/handle/123456789/2007",
  "IT Act 2000":                         "https://www.indiacode.nic.in/handle/123456789/1999",
  "RTI Act 2005":                        "https://www.indiacode.nic.in/handle/123456789/2031",
  "DPDP Act 2023":                       "https://www.indiacode.nic.in/handle/123456789/20483",
  "Telecom Act 2023":                    "https://www.indiacode.nic.in/handle/123456789/20366",
  "SC/ST Atrocities Act 1989":           "https://www.indiacode.nic.in/handle/123456789/1368",
  "UAPA 1967":                           "https://www.indiacode.nic.in/handle/123456789/1431",
  "NDPS Act 1985":                       "https://www.indiacode.nic.in/handle/123456789/1719",
  "Prevention of Corruption Act 1988":   "https://www.indiacode.nic.in/handle/123456789/1374",
  "RTE Act 2009":                        "https://www.indiacode.nic.in/handle/123456789/2038",
  "Disability Rights Act 2016":          "https://www.indiacode.nic.in/handle/123456789/15118",
  "Mental Healthcare Act 2017":          "https://www.indiacode.nic.in/handle/123456789/15493",
  "MGNREGA 2005":                        "https://www.indiacode.nic.in/handle/123456789/2030",
  "Legal Services Authorities Act 1987": "https://www.indiacode.nic.in/handle/123456789/1728",
  "Arms Act 1959":                       "https://www.indiacode.nic.in/handle/123456789/1384",
  "RBI Act 1934":                        "https://www.indiacode.nic.in/handle/123456789/2273",
  "LLP Act 2008":                        "https://www.indiacode.nic.in/handle/123456789/2045",
  "Mediation Act 2023":                  "https://www.indiacode.nic.in/handle/123456789/20363",
  "JJ Act 2015":                         "https://www.indiacode.nic.in/handle/123456789/15116",
  "FSSAI Act 2006":                      "https://www.indiacode.nic.in/handle/123456789/2032",
};

// ── LAW CATEGORIES ────────────────────────────────────────────────────────────
const LAW_CATEGORIES = [
  { cat:"🏛️ Constitutional", color:P.rose, laws:[
    {name:"Constitution of India 1950", exp:"Supreme law — 395 Articles, 12 Schedules, 104 Amendments"},
    {name:"All 5 Writs Art.226/32", exp:"Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto"},
  ]},
  { cat:"🔴 New Criminal Codes", color:"#C47B8A", laws:[
    {name:"BNS 2023", exp:"Replaces IPC 1860 — 358 sections, updated offences, community service"},
    {name:"BNSS 2023", exp:"Replaces CrPC — 531 sections, video trials, zero FIR, 90-day chargesheet"},
    {name:"BSA 2023", exp:"Replaces Evidence Act — digital evidence, joint trials"},
    {name:"IPC 1860", exp:"Old Penal Code — still referenced for pre-2023 cases"},
    {name:"CrPC 1973", exp:"Old Criminal Procedure — still applies to pending cases"},
  ]},
  { cat:"📋 Civil & Procedure", color:P.periwinkle, laws:[
    {name:"CPC 1908", exp:"How civil suits are filed, tried, decreed and executed"},
    {name:"Limitation Act 1963", exp:"Time limits — 3 years contract, 12 years land, 30 years mortgage"},
    {name:"Arbitration and Conciliation Act 1996", exp:"Out-of-court dispute resolution"},
    {name:"Mediation Act 2023", exp:"Court-referred and pre-litigation mediation framework"},
    {name:"Legal Services Authorities Act 1987", exp:"Free legal aid — income < ₹1 lakh entitled"},
  ]},
  { cat:"💼 Contracts & Commercial", color:P.amber, laws:[
    {name:"Indian Contract Act 1872", exp:"Offer, acceptance, consideration, breach, remedies"},
    {name:"NI Act 1881", exp:"Cheques, promissory notes — §138 cheque bounce criminal liability"},
    {name:"Specific Relief Act 1963", exp:"Court compels actual performance, not just damages"},
    {name:"Sale of Goods Act 1930", exp:"Implied warranties, delivery, risk, buyer/seller remedies"},
  ]},
  { cat:"🏠 Property & Real Estate", color:P.sage, laws:[
    {name:"Transfer of Property Act 1882", exp:"Rules on transferring, mortgaging, leasing land/buildings"},
    {name:"RERA 2016", exp:"Protects flat buyers — registration mandatory, builders penalised for delay"},
    {name:"Registration Act 1908", exp:"Compulsory registration of property documents"},
    {name:"Benami Transactions Act 1988", exp:"Prohibits holding property in another's name"},
    {name:"LARR 2013", exp:"Land Acquisition — compensation and rehabilitation"},
  ]},
  { cat:"👨‍👩‍👧 Family & Personal Law", color:"#C47B8A", laws:[
    {name:"Hindu Marriage Act 1955", exp:"Hindu marriages, grounds for divorce, maintenance"},
    {name:"Hindu Succession Act 1956", exp:"Inheritance — daughters have equal rights since 2005"},
    {name:"Muslim Personal Law 1937", exp:"Marriage, divorce, inheritance under Sharia"},
    {name:"Domestic Violence Act 2005", exp:"Protection orders, residence, monetary relief"},
    {name:"POCSO Act 2012", exp:"Children from sexual offences — strict punishment"},
    {name:"Special Marriage Act 1954", exp:"Inter-religion civil marriage — no religious ceremony"},
    {name:"Dowry Prohibition Act 1961", exp:"Giving/taking dowry is criminal — up to 5 years"},
  ]},
  { cat:"👷 Labour & Employment", color:P.teal, laws:[
    {name:"Industrial Disputes Act 1947", exp:"Retrenchment, closure, strikes, worker protections"},
    {name:"POSH Act 2013", exp:"Sexual harassment at workplace — IC mandatory, 90-day inquiry"},
    {name:"EPF Act 1952", exp:"12% employer PF contribution — full corpus on exit"},
    {name:"Payment of Gratuity Act 1972", exp:"15 days × years of service after 5 years"},
    {name:"Maternity Benefit Act 1961", exp:"26 weeks paid leave — no termination during pregnancy"},
    {name:"Minimum Wages Act 1948", exp:"State-notified wages — criminal liability for violation"},
  ]},
  { cat:"🛒 Consumer Law", color:P.lavender, laws:[
    {name:"Consumer Protection Act 2019", exp:"District/State/National commissions — defective goods/services"},
    {name:"Competition Act 2002", exp:"CCI prevents cartels, price-fixing, anti-competitive mergers"},
    {name:"FSSAI Act 2006", exp:"Food safety — adulteration, mislabelling, licensing"},
  ]},
  { cat:"🏢 Corporate & Insolvency", color:P.amber, laws:[
    {name:"Companies Act 2013", exp:"Formation, management, directors' duties, audits, winding up"},
    {name:"IBC 2016", exp:"Time-bound 180-day insolvency resolution — NCLT, CoC"},
    {name:"SEBI Act 1992", exp:"Stock market regulation — insider trading, investor protection"},
    {name:"FEMA 1999", exp:"Foreign exchange — FDI, NRI accounts, cross-border transactions"},
    {name:"PMLA 2002", exp:"Money laundering — attachment, confiscation, 7 years imprisonment"},
  ]},
  { cat:"💰 Taxation", color:P.sage, laws:[
    {name:"Income Tax Act 1961", exp:"Tax on personal/corporate income — TDS, deductions, ITAT"},
  ]},
  { cat:"💡 Intellectual Property", color:P.periwinkle, laws:[
    {name:"Trade Marks Act 1999", exp:"Brand names, logos — 10-year renewable registration"},
    {name:"Copyright Act 1957", exp:"Literary, artistic works — author's life + 60 years"},
    {name:"Patents Act 1970", exp:"20-year monopoly on inventions"},
    {name:"Designs Act 2000", exp:"Visual appearance of products — 10+5 year protection"},
  ]},
  { cat:"🌿 Environmental Law", color:P.sage, laws:[
    {name:"Environment Protection Act 1986", exp:"Umbrella act — rules for pollution, environmental standards"},
    {name:"NGT Act 2010", exp:"National Green Tribunal — fast-track environmental cases"},
    {name:"Wildlife Protection Act 1972", exp:"Protects endangered species, restricts hunting"},
    {name:"Forest Conservation Act 1980", exp:"Govt approval for any non-forest use of forest land"},
  ]},
  { cat:"🏦 Banking & Finance", color:P.amber, laws:[
    {name:"SARFAESI Act 2002", exp:"Banks seize mortgaged property without court order on default"},
    {name:"RBI Act 1934", exp:"Establishes RBI — monetary policy, bank licensing"},
  ]},
  { cat:"💻 Cyber & Digital", color:P.periwinkle, laws:[
    {name:"IT Act 2000", exp:"Cyber crimes, electronic signatures, intermediary liability"},
    {name:"DPDP Act 2023", exp:"Data protection — consent, rights, penalties up to ₹250 crore"},
    {name:"RTI Act 2005", exp:"Any citizen can seek info from public authority in 30 days"},
    {name:"Telecom Act 2023", exp:"Replaces Telegraph Act 1885 — spectrum, licensing"},
  ]},
  { cat:"🛡️ Security & Special", color:"#C47B8A", laws:[
    {name:"NDPS Act 1985", exp:"Narcotics — commercial quantity = 10–20 years, bail very strict"},
    {name:"UAPA 1967", exp:"Terrorism — up to life, bail nearly impossible"},
    {name:"Prevention of Corruption Act 1988", exp:"Bribery of public servants — up to 7 years"},
    {name:"SC/ST Atrocities Act 1989", exp:"Offences against SC/ST — no anticipatory bail"},
    {name:"Arms Act 1959", exp:"Firearm licensing — unlicensed = 3–7 years"},
  ]},
  { cat:"⚖️ Rights & Social", color:P.teal, laws:[
    {name:"RTE Act 2009", exp:"Free and compulsory education for children 6–14"},
    {name:"Disability Rights Act 2016", exp:"Equal opportunities, reservations — 21 disability categories"},
    {name:"Mental Healthcare Act 2017", exp:"Rights of mentally ill — no forced treatment"},
    {name:"MGNREGA 2005", exp:"100 days guaranteed wage employment for rural households"},
    {name:"Legal Services Authorities Act 1987", exp:"Free legal aid — women, SC/ST, income < ₹1 lakh"},
  ]},
];

// ── QUICK PROMPTS ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = {
  consult:   ["Builder delayed possession by 3 years — RERA or consumer forum?", "Cheque of ₹5 lakh bounced — criminal and civil strategy", "Wrongful termination — private company, 8 years service", "Father died intestate — property division among children", "Cyber fraud ₹2 lakh — FIR, bank freeze, recovery options", "Wife filed false 498A — anticipatory bail and defence"],
  draft:     ["Draft legal notice for cheque bounce u/s 138 NI Act — ₹3 lakh", "Draft anticipatory bail application — NDPS small quantity", "Draft consumer complaint against builder for 4-year delay", "Draft general affidavit for court proceedings", "Draft RTI application to get land mutation records", "Draft PIL petition for road deaths due to potholes"],
  precedent: ["SC cases on daughters' right in ancestral Hindu property", "Principles of anticipatory bail — landmark SC judgments", "Triple talaq — Shayara Bano Supreme Court judgment", "Right to privacy — Puttaswamy 2017 nine-judge bench", "POCSO Act — landmark cases on bail and punishment", "Cheque bounce — Supreme Court on presumption of liability"],
  research:  ["Explain Section 138 NI Act — ingredients, procedure, punishment", "BNS 2023 vs IPC 1860 — all major changes explained", "POCSO Act 2012 — every offence, punishment and procedure", "RERA 2016 — complete rights of flat buyers and remedies", "Domestic Violence Act 2005 — every relief available", "IBC 2016 — complete insolvency resolution process"],
  forum:     ["Cheque bounce ₹3 lakh — which court, Mumbai?", "Consumer complaint against Amazon — which commission?", "Property dispute ₹1 crore — District Court or High Court?", "Wrongful termination — Labour Court or Industrial Tribunal?", "Environmental violation — NGT or High Court?", "RERA complaint — authority, appeal, and NCDRC option?"],
  rights:    ["Police detained husband 3 days without producing in court", "RTI application to get my land records from collector office", "PIL for pothole deaths on state highway — file in HC", "Municipal corporation demolishing house without notice", "School refusing SC/ST child admission — which authority", "Right to free legal aid — who is entitled and how to apply"],
};

// ── SECTION LINK ──────────────────────────────────────────────────────────────
function getSectionLink(actName) {
  for (const [key, url] of Object.entries(LAW_LINKS)) {
    if (actName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(actName.toLowerCase())) return url;
  }
  const lower = actName.toLowerCase();
  if (lower.includes("ni act") || lower.includes("negotiable")) return LAW_LINKS["NI Act 1881"];
  if (lower.includes("bns")) return LAW_LINKS["BNS 2023"];
  if (lower.includes("bnss")) return LAW_LINKS["BNSS 2023"];
  if (lower.includes("ipc")) return LAW_LINKS["IPC 1860"];
  if (lower.includes("crpc")) return LAW_LINKS["CrPC 1973"];
  if (lower.includes("cpc")) return LAW_LINKS["CPC 1908"];
  if (lower.includes("constitution") || lower.includes("art.")) return LAW_LINKS["Constitution of India 1950"];
  return "https://www.indiacode.nic.in/";
}

// ── FORMAT MESSAGE CONTENT ────────────────────────────────────────────────────
function fmt(text) {
  let html = text
    .replace(/§(\d+[A-Za-z]?(?:\([a-z0-9]+\))?)\s+([A-Za-z][A-Za-z /]+(?:Act|Code|Sanhita|Adhiniyam|Constitution)\s*\d*)/g,
      (_, sec, act) => `<a href="${getSectionLink(act)}" target="_blank" rel="noopener" style="color:${P.gold};font-weight:700;text-decoration:underline;text-underline-offset:2px">§${sec} ${act} ↗</a>`)
    .replace(/[Ss]ection\s+(\d+[A-Za-z]?)\s+(?:of\s+)?([A-Za-z][A-Za-z ]+(?:Act|Code|Sanhita|Adhiniyam)\s*\d*)/g,
      (_, sec, act) => `<a href="${getSectionLink(act)}" target="_blank" rel="noopener" style="color:${P.gold};font-weight:700;text-decoration:underline;text-underline-offset:2px">Section ${sec} of ${act} ↗</a>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(📖|⚖️|📋|🏛️|🔧|📍|⏰|📌|💡|⚠️)\s+(.+)$/gm,
      (_, em, rest) => `<div style="display:flex;align-items:flex-start;gap:8px;margin:14px 0 6px;padding:8px 12px;background:${P.bgAlt};border-radius:8px;border-left:3px solid ${P.gold}"><span style="font-size:16px;flex-shrink:0">${em}</span><span style="font-size:13px;font-weight:700;color:${P.textMid};line-height:1.5">${rest}</span></div>`)
    .replace(/^→ (.+)$/gm, `<div style="padding:3px 0 3px 14px;color:${P.textMid};border-left:2px solid ${P.border};margin:2px 0">→ $1</div>`)
    .replace(/^• (.+)$/gm, `<div style="padding:2px 0 2px 8px;color:${P.text};margin:1px 0">• $1</div>`)
    .replace(/^- (.+)$/gm, `<div style="padding:2px 0 2px 8px;color:${P.text};margin:1px 0">• $1</div>`)
    .replace(/^(\d+)\.\s+(.+)$/gm, `<div style="padding:3px 0 3px 6px;color:${P.text};margin:2px 0"><strong style="color:${P.gold}">$1.</strong> $2</div>`)
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, '<br/>');
  return html;
}

// ── GEMINI API CALL ───────────────────────────────────────────────────────────
async function callGemini(history, mode) {
  const contents = history.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT + `\n\nCurrent mode: ${mode}. Tailor response accordingly. ALWAYS write complete responses — never truncate.` }] },
      contents,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.95,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to process. Please retry.";
}

// ── LOCAL STORAGE ─────────────────────────────────────────────────────────────
const LS_KEY = "lexindica_sessions_v1";
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function saveSessions(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode]             = useState("consult");
  const [chatsByMode, setChatsByMode] = useState(() => {
    const init = {}; MODES.forEach(m => { init[m.id] = []; }); return init;
  });
  const [sessionsByMode, setSessionsByMode] = useState(() => loadSessions());
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panel, setPanel]           = useState("guide");
  const [expandedCat, setExpandedCat] = useState(null);
  const [view, setView]             = useState("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const [greeting]                  = useState(getGreeting);
  const [apiKeyMissing, setApiKeyMissing] = useState(!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE");
  const [tempKey, setTempKey]       = useState("");
  const [liveKey, setLiveKey]       = useState(GEMINI_API_KEY);
  const bottomRef = useRef(null);

  const activeMode = MODES.find(m => m.id === mode);
  const messages = chatsByMode[mode] || [];

  // Set welcome message on first visit to a mode
  useEffect(() => {
    setChatsByMode(prev => {
      if (prev[mode].length === 0) {
        const welcome = `**${greeting}**\n\nYou are in **${activeMode.label} Mode** — ${activeMode.desc}.\n\nI am LEXINDICA — India's complete legal intelligence, commanding every statute, code, act, regulation, and judicial precedent.\n\nEvery response begins with a plain-English explanation, followed by full legal analysis, landmark judgments with citations, all available remedies, the correct forum, limitation periods, and a practical step-by-step action plan. All cited sections are **clickable links** to the official bare acts.\n\nWhat legal matter can I assist you with today?`;
        return { ...prev, [mode]: [{ role:"assistant", content:welcome, id:Date.now() }] };
      }
      return prev;
    });
  }, [mode]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading, mode]);

  const saveSession = useCallback((modeId, msgs) => {
    if (msgs.length <= 1) return;
    const title = msgs.find(m => m.role==="user")?.content?.slice(0,70) || "Session";
    const session = { id:Date.now(), title, messages:msgs, timestamp:new Date().toISOString(), mode:modeId };
    setSessionsByMode(prev => {
      const updated = { ...prev, [modeId]: [session, ...(prev[modeId]||[]).slice(0,99)] };
      saveSessions(updated);
      return updated;
    });
  }, []);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    const userMsg = { role:"user", content:q, id:Date.now() };
    const newMsgs = [...messages, userMsg];
    setChatsByMode(prev => ({ ...prev, [mode]: newMsgs }));
    setInput("");
    setLoading(true);
    setError("");
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${liveKey}`;
      const contents = newMsgs.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const res = await fetch(apiUrl, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          system_instruction:{ parts:[{ text: SYSTEM_PROMPT + `\n\nMode: ${activeMode.label}. Write complete, untruncated responses.` }]},
          contents,
          generationConfig:{ maxOutputTokens:4096, temperature:0.7, topP:0.95 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to process. Please retry.";
      const finalMsgs = [...newMsgs, { role:"assistant", content:reply, id:Date.now()+1 }];
      setChatsByMode(prev => ({ ...prev, [mode]:finalMsgs }));
      saveSession(mode, finalMsgs);
    } catch(e) {
      setError(`Error: ${e.message}. Check your API key.`);
    } finally { setLoading(false); }
  };

  const switchMode = (newMode) => {
    if (messages.length > 1) saveSession(mode, messages);
    setMode(newMode); setView("chat");
  };

  const startNewChat = () => {
    if (messages.length > 1) saveSession(mode, messages);
    setChatsByMode(prev => ({ ...prev, [mode]:[] }));
  };

  const loadSession = (session) => {
    if (messages.length > 1) saveSession(mode, messages);
    setMode(session.mode);
    setChatsByMode(prev => ({ ...prev, [session.mode]:session.messages }));
    setView("chat");
  };

  const allSessions = Object.values(sessionsByMode).flat().sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp));
  const filteredSessions = searchTerm.trim()
    ? allSessions.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase())))
    : allSessions;

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

  // ── API KEY ENTRY SCREEN ──
  if (apiKeyMissing) {
    return (
      <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Palatino Linotype',Palatino,Georgia,serif"}}>
        <div style={{maxWidth:"480px",width:"100%",background:P.bgCard,border:`2px solid ${P.gold}`,borderRadius:"16px",padding:"32px",boxShadow:`0 8px 40px rgba(184,134,11,0.15)`}}>
          <div style={{textAlign:"center",marginBottom:"24px"}}>
            <div style={{fontSize:"40px",marginBottom:"10px"}}>⚖️</div>
            <div style={{color:P.gold,fontSize:"22px",fontWeight:"bold",letterSpacing:"2px"}}>LEXINDICA</div>
            <div style={{color:P.textLight,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"sans-serif",marginTop:"4px"}}>Complete Indian Legal Intelligence</div>
          </div>
          <div style={{background:P.sagePale,border:`1px solid ${P.sage}`,borderRadius:"10px",padding:"14px",marginBottom:"22px"}}>
            <div style={{color:P.sage,fontWeight:"700",fontSize:"12px",fontFamily:"sans-serif",marginBottom:"6px"}}>✅ 100% FREE — No credit card needed</div>
            <div style={{color:P.textMid,fontSize:"12px",fontFamily:"sans-serif",lineHeight:"1.6"}}>
              This app uses Google Gemini's free API — <strong>1,500 free requests per day</strong>. Get your free key in 2 minutes:
            </div>
          </div>
          <div style={{marginBottom:"20px"}}>
            {[
              ["1","Go to","https://aistudio.google.com/apikey","aistudio.google.com/apikey"],
              ["2","Sign in with any Google account (Gmail is fine)","",""],
              ["3",'Click "Create API Key" — copy it',"",""],
              ["4","Paste it below and click Activate","",""],
            ].map(([n,text,url,label]) => (
              <div key={n} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"10px"}}>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:P.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",flexShrink:0,fontFamily:"sans-serif"}}>{n}</div>
                <div style={{color:P.textMid,fontSize:"12px",fontFamily:"sans-serif",lineHeight:"1.5"}}>
                  {text}{url && <> <a href={url} target="_blank" rel="noopener" style={{color:P.gold,fontWeight:"700"}}>{label}</a></>}
                </div>
              </div>
            ))}
          </div>
          <input
            value={tempKey}
            onChange={e=>setTempKey(e.target.value)}
            placeholder="Paste your Gemini API key here (AIza...)"
            style={{width:"100%",background:P.bgAlt,border:`1.5px solid ${P.border}`,borderRadius:"10px",padding:"11px 14px",color:P.text,fontSize:"13px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",marginBottom:"12px"}}
            onFocus={e=>e.target.style.borderColor=P.gold}
            onBlur={e=>e.target.style.borderColor=P.border}
          />
          <button
            onClick={() => { const key = tempKey.trim();

if (key.startsWith("AIza") || key.startsWith("AQ.")) {
    setLiveKey(key);
    setApiKeyMissing(false);
} else {
    alert("Please enter a valid Gemini API key."); }}}
            style={{width:"100%",background:`linear-gradient(135deg,${P.rose},${P.gold})`,border:"none",borderRadius:"10px",padding:"13px",color:"#fff",fontSize:"14px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",boxShadow:`0 4px 16px ${P.gold}40`}}
          >
            ⚖️ Activate LEXINDICA — Free
          </button>
          <div style={{color:P.textFaint,fontSize:"10px",fontFamily:"sans-serif",textAlign:"center",marginTop:"12px",lineHeight:"1.5"}}>
            Your API key stays in your browser only. It is never sent to any server other than Google's API.
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:P.bg,fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",overflow:"hidden",color:P.text}}>

      {/* TOP BAR */}
      <div style={{background:"linear-gradient(90deg,#FDF8F0,#FAF4E8,#FDF8F0)",borderBottom:`2px solid ${P.gold}`,padding:"0 14px",display:"flex",alignItems:"center",height:"52px",gap:"10px",flexShrink:0,boxShadow:`0 2px 10px rgba(184,134,11,0.10)`}}>
        <span style={{fontSize:"22px"}}>⚖️</span>
        <div>
          <div style={{color:P.gold,fontSize:"16px",fontWeight:"bold",letterSpacing:"2px"}}>LEXINDICA</div>
          <div style={{color:P.textLight,fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"sans-serif"}}>Complete Indian Legal Intelligence · Free · Unlimited</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:"7px",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:P.sage,boxShadow:`0 0 5px ${P.sage}`}} />
            <span style={{color:P.sage,fontSize:"9px",fontFamily:"sans-serif",fontWeight:"700"}}>FREE · UNLIMITED</span>
          </div>
          <button onClick={()=>setView(view==="history"?"chat":"history")} style={{background:view==="history"?P.amberPale:"transparent",border:`1px solid ${view==="history"?P.amber:P.border}`,borderRadius:"7px",padding:"4px 10px",fontSize:"10px",cursor:"pointer",color:view==="history"?P.amber:P.textMid,fontFamily:"sans-serif",fontWeight:"600"}}>
            {view==="history"?"← Chat":"🕐 History"}
          </button>
          <button onClick={startNewChat} style={{background:P.sagePale,border:`1px solid ${P.sage}`,borderRadius:"7px",padding:"4px 10px",fontSize:"10px",cursor:"pointer",color:P.sage,fontFamily:"sans-serif",fontWeight:"600"}}>+ New</button>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} title={sidebarOpen?"Collapse panel":"Expand panel"} style={{background:sidebarOpen?P.rosePale:"transparent",border:`1px solid ${sidebarOpen?P.rose:P.border}`,borderRadius:"7px",padding:"4px 9px",fontSize:"13px",cursor:"pointer",color:sidebarOpen?P.rose:P.textMid}}>
            {sidebarOpen?"◀":"▶"}
          </button>
        </div>
      </div>

      {/* MODE TABS */}
      <div style={{background:P.bgAlt,borderBottom:`1px solid ${P.border}`,padding:"6px 12px",display:"flex",gap:"5px",overflowX:"auto",flexShrink:0}}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>switchMode(m.id)} style={{
            background:mode===m.id?m.accentPale:"transparent",
            border:`1px solid ${mode===m.id?m.accent:P.borderSoft}`,
            borderRadius:"20px",padding:"5px 12px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:"4px",whiteSpace:"nowrap",
            transition:"all 0.15s",boxShadow:mode===m.id?`0 2px 8px ${m.accent}30`:"none",
          }}>
            <span style={{fontSize:"12px"}}>{m.icon}</span>
            <span style={{color:mode===m.id?m.accent:P.textMid,fontSize:"11px",fontFamily:"sans-serif",fontWeight:mode===m.id?"700":"400"}}>{m.label}</span>
            {(sessionsByMode[m.id]||[]).length>0&&<span style={{background:`${m.accent}22`,color:m.accent,borderRadius:"10px",padding:"0 5px",fontSize:"9px",fontFamily:"sans-serif"}}>{(sessionsByMode[m.id]||[]).length}</span>}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* COLLAPSIBLE SIDEBAR */}
        {sidebarOpen&&(
          <div style={{width:"255px",flexShrink:0,background:P.bgCard,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"flex",borderBottom:`1px solid ${P.border}`,flexShrink:0}}>
              {[["guide","💬 Guide"],["laws","📚 Laws"]].map(([id,label])=>(
                <button key={id} onClick={()=>setPanel(id)} style={{flex:1,padding:"8px 4px",background:panel===id?P.bgAlt:"transparent",border:"none",borderBottom:`2px solid ${panel===id?P.gold:"transparent"}`,color:panel===id?P.gold:P.textLight,fontSize:"11px",fontFamily:"sans-serif",fontWeight:panel===id?"700":"400",cursor:"pointer"}}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"11px 10px"}}>
              {panel==="guide"&&(
                <div>
                  <div style={{background:activeMode.accentPale,border:`1px solid ${activeMode.accent}40`,borderRadius:"9px",padding:"10px",marginBottom:"11px"}}>
                    <div style={{color:activeMode.accent,fontSize:"11px",fontWeight:"700",fontFamily:"sans-serif",marginBottom:"5px"}}>{activeMode.icon} {activeMode.label}</div>
                    <div style={{color:P.textMid,fontSize:"10.5px",lineHeight:"1.6",fontFamily:"sans-serif"}}>{activeMode.desc}</div>
                  </div>
                  <div style={{color:P.gold,fontSize:"9.5px",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"sans-serif",marginBottom:"7px",fontWeight:"700"}}>Every Response Includes</div>
                  {[["📖","Plain-English explanation first"],["⚖️","Laws & clickable section links"],["📋","Strengths & weaknesses"],["🏛️","Landmark judgments + citations"],["🔧","All remedies available"],["📍","Court, jurisdiction & filing"],["⏰","Exact limitation period"],["📌","7+ step action plan"],["💡","Hidden rights you may not know"]].map(([icon,label])=>(
                    <div key={label} style={{display:"flex",gap:"5px",alignItems:"flex-start",marginBottom:"4px"}}>
                      <span style={{fontSize:"10px",flexShrink:0}}>{icon}</span>
                      <span style={{color:P.textMid,fontSize:"10.5px",lineHeight:"1.5",fontFamily:"sans-serif"}}>{label}</span>
                    </div>
                  ))}
                  <div style={{margin:"11px 0 7px",color:P.gold,fontSize:"9.5px",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:"700"}}>Quick Queries</div>
                  {(QUICK_PROMPTS[mode]||[]).map((q,i)=>(
                    <button key={i} onClick={()=>send(q)} style={{display:"block",width:"100%",textAlign:"left",background:P.bgAlt,border:`1px solid ${P.border}`,borderRadius:"7px",padding:"6px 8px",marginBottom:"4px",cursor:"pointer",color:P.textMid,fontSize:"10px",fontFamily:"sans-serif",lineHeight:"1.4",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=activeMode.accentPale;e.currentTarget.style.borderColor=activeMode.accent;e.currentTarget.style.color=activeMode.accent;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=P.bgAlt;e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.textMid;}}
                    >→ {q}</button>
                  ))}
                </div>
              )}
              {panel==="laws"&&(
                <div>
                  <div style={{color:P.gold,fontSize:"9.5px",letterSpacing:"1px",textTransform:"uppercase",fontFamily:"sans-serif",marginBottom:"9px",fontWeight:"700"}}>Tap law name to open bare act ↗</div>
                  {LAW_CATEGORIES.map(({cat,color,laws})=>(
                    <div key={cat} style={{marginBottom:"6px"}}>
                      <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)} style={{width:"100%",textAlign:"left",background:expandedCat===cat?`${color}14`:P.bgAlt,border:`1px solid ${expandedCat===cat?color+"50":P.border}`,borderRadius:"7px",padding:"6px 8px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.15s"}}>
                        <span style={{color:expandedCat===cat?color:P.textMid,fontSize:"10.5px",fontFamily:"sans-serif",fontWeight:"600"}}>{cat}</span>
                        <span style={{color:P.textFaint,fontSize:"10px"}}>{expandedCat===cat?"▲":"▼"}</span>
                      </button>
                      {expandedCat===cat&&(
                        <div style={{background:P.bgCard,border:`1px solid ${P.border}`,borderTop:"none",borderRadius:"0 0 7px 7px",padding:"7px 8px"}}>
                          {laws.map(({name,exp})=>{
                            const link=LAW_LINKS[name];
                            return(
                              <div key={name} style={{marginBottom:"7px",paddingBottom:"7px",borderBottom:`1px solid ${P.borderSoft}`}}>
                                {link?(
                                  <a href={link} target="_blank" rel="noopener" style={{color:color,fontSize:"10px",fontWeight:"700",fontFamily:"sans-serif",textDecoration:"underline",textUnderlineOffset:"2px",display:"block",marginBottom:"2px"}}>{name} ↗</a>
                                ):(
                                  <div style={{color:color,fontSize:"10px",fontWeight:"700",fontFamily:"sans-serif",marginBottom:"2px"}}>{name}</div>
                                )}
                                <div style={{color:P.textLight,fontSize:"9.5px",lineHeight:"1.5",fontFamily:"sans-serif"}}>{exp}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{color:P.textFaint,fontSize:"9px",fontFamily:"sans-serif",textAlign:"center",marginTop:"10px",padding:"7px",background:P.bgAlt,borderRadius:"7px",lineHeight:"1.5"}}>
                    Links open India Code (indiacode.nic.in) — official Government of India bare act repository.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {view==="history"?(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{background:P.bgAlt,borderBottom:`1px solid ${P.border}`,padding:"10px 14px",flexShrink:0}}>
                <div style={{color:P.gold,fontSize:"13px",fontWeight:"700",marginBottom:"7px"}}>🕐 History — Search All Sessions</div>
                <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search by keyword, section, topic, law, case name…" style={{width:"100%",background:P.bgCard,border:`1.5px solid ${P.border}`,borderRadius:"9px",padding:"8px 12px",color:P.text,fontSize:"12.5px",fontFamily:"Palatino,serif",outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor=P.gold} onBlur={e=>e.target.style.borderColor=P.border}/>
                <div style={{color:P.textFaint,fontSize:"10px",fontFamily:"sans-serif",marginTop:"5px"}}>{filteredSessions.length} session{filteredSessions.length!==1?"s":""} found · Sessions persist across browser sessions</div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
                {filteredSessions.length===0&&(
                  <div style={{textAlign:"center",color:P.textFaint,fontFamily:"sans-serif",fontSize:"12px",marginTop:"40px"}}>{allSessions.length===0?"No saved sessions yet. Conversations are saved automatically after your first exchange.":"No sessions match your search."}</div>
                )}
                {filteredSessions.map(session=>{
                  const modeObj=MODES.find(m=>m.id===session.mode);
                  return(
                    <div key={session.id} onClick={()=>loadSession(session)} style={{background:P.bgCard,border:`1px solid ${P.border}`,borderRadius:"10px",padding:"11px 13px",marginBottom:"8px",cursor:"pointer",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=P.gold;e.currentTarget.style.background=P.bgAlt;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background=P.bgCard;}}>
                      <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"4px"}}>
                        <span style={{fontSize:"12px"}}>{modeObj?.icon}</span>
                        <span style={{color:modeObj?.accent,fontSize:"9.5px",fontFamily:"sans-serif",fontWeight:"700",background:modeObj?.accentPale,padding:"2px 7px",borderRadius:"10px"}}>{modeObj?.label}</span>
                        <span style={{color:P.textFaint,fontSize:"9.5px",fontFamily:"sans-serif",marginLeft:"auto"}}>{formatDate(session.timestamp)}</span>
                      </div>
                      <div style={{color:P.textMid,fontSize:"12px",fontWeight:"600",marginBottom:"3px"}}>{session.title}</div>
                      <div style={{color:P.textLight,fontSize:"10.5px",fontFamily:"sans-serif"}}>
                        {session.messages.length} messages
                        {searchTerm&&(()=>{
                          const match=session.messages.find(m=>m.content.toLowerCase().includes(searchTerm.toLowerCase()));
                          if(!match)return null;
                          const idx=match.content.toLowerCase().indexOf(searchTerm.toLowerCase());
                          const snippet=match.content.slice(Math.max(0,idx-35),idx+75).replace(/\n/g," ").replace(/\*\*/g,"");
                          return<span style={{display:"block",color:P.textLight,marginTop:"3px",fontStyle:"italic",fontSize:"10px"}}>…{snippet}…</span>;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ):(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Mode banner */}
              <div style={{background:activeMode.accentPale,borderBottom:`1px solid ${activeMode.accent}30`,padding:"5px 14px",display:"flex",alignItems:"center",gap:"7px",flexShrink:0}}>
                <span style={{fontSize:"13px"}}>{activeMode.icon}</span>
                <span style={{color:activeMode.accent,fontSize:"11px",fontFamily:"sans-serif",fontWeight:"700"}}>{activeMode.label}</span>
                <span style={{color:P.textLight,fontSize:"10px",fontFamily:"sans-serif"}}>— {activeMode.desc}</span>
                <span style={{marginLeft:"auto",color:P.textFaint,fontSize:"9.5px",fontFamily:"sans-serif"}}>§Sections in responses are clickable bare act links</span>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"14px 12px"}}>
                {messages.map((msg,i)=>(
                  <div key={msg.id||i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:"14px",gap:"8px",alignItems:"flex-start"}}>
                    {msg.role==="assistant"&&(
                      <div style={{width:"34px",height:"34px",borderRadius:"50%",background:`linear-gradient(135deg,${P.rose},${P.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0,marginTop:"3px",boxShadow:`0 2px 8px ${P.gold}35`}}>⚖️</div>
                    )}
                    <div style={{maxWidth:"78%",background:msg.role==="user"?P.userBubble:P.aiBubble,border:`1px solid ${msg.role==="user"?P.periwinkle+"50":P.border}`,borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 15px",color:P.text,fontSize:"13.5px",lineHeight:"1.75",boxShadow:msg.role==="assistant"?"0 2px 12px rgba(0,0,0,0.05)":"0 1px 5px rgba(123,134,196,0.10)"}}
                      dangerouslySetInnerHTML={{__html:fmt(msg.content)}}/>
                    {msg.role==="user"&&(
                      <div style={{width:"32px",height:"32px",borderRadius:"50%",background:P.periwinklePale,border:`1px solid ${P.periwinkle}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",flexShrink:0,marginTop:"3px"}}>👤</div>
                    )}
                  </div>
                ))}
                {loading&&(
                  <div style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"14px"}}>
                    <div style={{width:"34px",height:"34px",borderRadius:"50%",background:`linear-gradient(135deg,${P.rose},${P.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>⚖️</div>
                    <div style={{background:P.aiBubble,border:`1px solid ${P.border}`,borderRadius:"18px 18px 18px 4px",padding:"13px 18px",display:"flex",gap:"6px",alignItems:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.04)"}}>
                      {[0,1,2].map(i=><div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:P.gold,animation:`lexb 1.3s ease-in-out ${i*0.22}s infinite`}}/>)}
                      <span style={{color:P.textLight,fontSize:"11px",fontFamily:"sans-serif",marginLeft:"8px"}}>Consulting the full corpus of Indian law…</span>
                    </div>
                  </div>
                )}
                {error&&<div style={{background:"#FFF0F0",border:"1px solid #F5C0C0",borderRadius:"8px",padding:"10px 14px",color:"#C0392B",fontSize:"12px",fontFamily:"sans-serif",marginBottom:"10px"}}>{error}</div>}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div style={{background:P.bgAlt,borderTop:`1px solid ${P.border}`,padding:"11px 12px",flexShrink:0}}>
                <div style={{display:"flex",gap:"8px",alignItems:"flex-end",maxWidth:"900px",margin:"0 auto"}}>
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                    placeholder={`${activeMode.icon} ${activeMode.label} — describe your legal matter in detail. Shift+Enter for new line.`}
                    rows={2}
                    style={{flex:1,background:P.bgCard,border:`1.5px solid ${P.border}`,borderRadius:"12px",padding:"10px 13px",color:P.text,fontSize:"13.5px",fontFamily:"Palatino,serif",resize:"none",outline:"none",lineHeight:"1.6",boxShadow:"0 1px 5px rgba(0,0,0,0.04)",transition:"border-color 0.15s"}}
                    onFocus={e=>e.target.style.borderColor=P.gold}
                    onBlur={e=>e.target.style.borderColor=P.border}/>
                  <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?P.bgCard:`linear-gradient(135deg,${P.rose},${P.gold})`,border:`1.5px solid ${loading||!input.trim()?P.border:P.gold}`,borderRadius:"12px",cursor:loading||!input.trim()?"not-allowed":"pointer",width:"47px",height:"47px",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:loading||!input.trim()?"none":`0 3px 12px ${P.gold}40`,transition:"all 0.2s"}}>
                    {loading?"⏳":"⚖️"}
                  </button>
                </div>
                <div style={{color:P.textFaint,fontSize:"9.5px",fontFamily:"sans-serif",textAlign:"center",marginTop:"6px"}}>
                  Free · Unlimited · Powered by Google Gemini · For educational guidance only · Engage an enrolled advocate for court proceedings
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lexb { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:${P.gold}50}
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
