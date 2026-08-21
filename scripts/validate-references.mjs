import fs from 'node:fs';

const cases = JSON.parse(fs.readFileSync(new URL('../cases.json', import.meta.url), 'utf8'));
const actors = JSON.parse(fs.readFileSync(new URL('../actors.json', import.meta.url), 'utf8'));
const indicators = JSON.parse(fs.readFileSync(new URL('../indicators.json', import.meta.url), 'utf8'));
const modules = fs.readFileSync(new URL('../modules.html', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
const ids = new Set();
const urls = new Set();

const forbiddenHosts = new Set(['linkedin.com', 'www.linkedin.com', 'lnkd.in']);
const forbiddenUrls = new Set([
  'https://www.fairplaybygg.se/rapporter',
  'https://www.byggnadsarbetaren.se/',
  'https://actapublica.se/nyheter-och-insikter/',
  'https://www.ekobrottsmyndigheten.se/om-oss/publikationer/',
  'https://www.sakerhetspolisen.se/ovrigt/publikationer/arsberattelse.html',
  'https://www.msb.se/sv/publikationer/',
  'https://www.cert.se/',
  'https://www.nyteknik.se/sakerhet/',
  'https://www.isp.se/om-isp/publikationer/',
  'https://www.dagensarena.se/',
  'https://assistanskoll.se/',
  'https://www.ekobrottsmyndigheten.se/arbetslivskriminalitet/',
  'https://polisen.se/',
  'https://www.advokatsamfundet.se/disciplinnamnden/disciplinnamndens-beslut/',
  'https://www.domstol.se/amnen/domstolarnas-domar-och-beslut/',
  'https://www.aftonbladet.se/nyheter/krim/',
  'https://www.tullverket.se/omtullverket/pressmedia/pressmeddelanden.html',
  'https://www.svt.se/nyheter/inrikes/',
  'https://www.svt.se/nyheter/lokalt/skane/',
  'https://www.aklagare.se/nyheter-press/pressmeddelanden/',
  'https://www.publikt.se/amne/tingsratten',
  'https://www.domstol.se/goteborgs-tingsratt/om-tingsratten/kontakta-oss/',
  "https://edition.cnn.com/2024/07/26/sport/paris-olympics-opening-ceremony-train-sabotage/index.html",
  "https://foreignpolicy.com/2024/05/13/russia-gru-sabotage-europe-arson-criminal-network/",
  "https://foreignpolicy.com/2024/06/13/russia-sabotage-attacks-europe-espionage-hybrid-arson/",
  "https://lakartidningen.se/aktuellt/nyheter/2020/01/medhelp-ska-betala-12-miljoner-for-1177-lackan/",
  "https://sverigesradio.se/artikel/kriminalvardarna-som-byter-sida",
  "https://www.bellingcat.com/news/uk-and-europe/2021/04/19/gru-unit-29155-and-the-czech-ammunition-depots/",
  "https://www.bloomberg.com/news/articles/2024-07-26/paris-olympics-rail-sabotage-sncf",
  "https://www.dagenssamhalle.se/ekonomi/kommunekonomi/chef-sparkad-misstanks-ha-stulit-miljoner-fran-skaanska-kommuner/",
  "https://www.dn.se/nyheter/sverige/atalas-for-att-ha-beviljat-66-arbetstillstand/",
  "https://www.dn.se/nyheter/sverige/utbetalningsmyndigheten-nekades-placering-i-sodertalje/",
  "https://www.etc.se/inrikes/gaengkopplad-naemndeman-tvingas-fraan-moderaterna-skulle-driva-hvb-hem",
  "https://www.expressen.se/nyheter/brottscentralen/advokat-med-232-timmars-kontakt-med-livstidsdomd-utesluts/",
  "https://www.expressen.se/nyheter/brottscentralen/klanadvokaten-uteslots-ur-advokatsamfundet-nu-ar-han-tillbaka/",
  "https://www.expressen.se/nyheter/brottscentralen/kriminalvardaren-gifte-sig-med-bandidos-man-bombhotet-foljde/",
  "https://www.expressen.se/nyheter/brottscentralen/kriminalvardaren-hotades-till-narkotikabrott/",
  "https://www.expressen.se/nyheter/krim/kvinna-tog-jobb-pa-haktet-for-att-hjalpa-gangledarens-fange/",
  "https://www.gp.se/ekonomi/bankman-godkande-bolan-med-falska-anstallningsbevis",
  "https://www.gp.se/nyheter/g%C3%B6teborg/radikala-islamisters-bolag-tj%C3%A4nar-miljoner-p%C3%A5-myndigheter-1.33313573",
  "https://www.gp.se/nyheter/goteborg/bankman-domdes-till-fangelse-for-att-ha-lurat-seb.6df8e5a4-90ce-4ae0-a59a-cb27a7cb87f9",
  "https://www.justice.gov/usao-mdla/pr/westlake-man-sentenced-computer-fraud-charges-after-hacking-former-employer",
  "https://www.msb.se/sv/amnesomraden/informationssakerhet-cybersakerhet-och-sakra-kommunikationer/",
  "https://www.ncsc.gov.uk/alerts/operation-cloud-hopper",
  "https://www.nyteknik.se/sakerhet/ericssonspionen-fick-tre-ar-6386124",
  "https://www.oxfordmail.co.uk/news/23560266.ashley-liles-jailed-following-cyber-attack-oxford-biomedica/",
  "https://www.publikt.se/nyhet/skatteanstallda-doms-for-grovt-bedrageri-19892",
  "https://www.riksrevisionen.se/granskningar/granskningsrapporter/2018/skyddet-mot-oegentligheter-i-migrationsverksamheten.html",
  "https://www.riksrevisionen.se/rapporter/granskningsrapporter/2023/informationssakerhet-vid-universitet-och-hogskolor---hanteringen-av-skyddsvarda-forskningsdata.html",
  "https://www.sakerhetspolisen.se/hoten-mot-sverige/underrattelsehotet.html",
  "https://www.sakerhetspolisen.se/kontraspionage/industrispionage.html",
  "https://www.sakerhetspolisen.se/kontraspionage/ryssland.html",
  "https://www.sakerhetspolisen.se/om-sakerhetspolisen/publikationer/sakerhetspolisens-arsberattelse/sakerhetspolisens-2023-2024/allvarligt-lage/ryssland-kina-och-iran.html",
  "https://www.svd.se/a/unga-kvinnor-infiltrerar-hakten",
  "https://www.svt.se/nyheter/inrikes/handlaggare-beviljade-66-tillstand-sista-dagen-pa-jobbet",
  "https://www.svt.se/nyheter/lokalt/skane/hamnanstallda-smugglade-118-kilo-narkotika",
  "https://www.svt.se/nyheter/lokalt/sodermanland/region-sormland-far-betala-250-000-kr-for-1177-lackan",
  "https://www.svt.se/nyheter/lokalt/vast/anstalld-pa-kriminalvarden-smugglade-meddelanden",
  "https://www.svt.se/nyheter/lokalt/vast/socialsekreterare-fejkade-examensbevis",
  "https://www.svt.se/nyheter/lokalt/stockholm/allt-fler-3d-vapen-tas-i-besla",
  "https://www.theregister.com/2015/02/18/it_admin_jailed_for_sabotaging_employer_systems/",
  "https://www.theregister.com/2023/05/31/it_analyst_guilty_blackmail/",
  "https://www.trendmicro.com/en_us/research/17/a/operation-cloud-hopper.html",
  "https://www.trendmicro.com/vinfo/pl/security/news/cyber-attacks/operation-cloud-hopper-what-you-need-to-know",
  "https://www.unitedagainstnucleariran.com/report/irans-irgc-at-swedish-universities",
  "https://bra.se/amnen/politisk-brottslighet/valfusk.html",
  "https://www.dagensjuridik.se/nyheter/edip-samuelssons-chef-till-attack-mot-ra-arendet-avslutas/",
]);

for (const item of cases) {
  if (ids.has(item.id)) errors.push(`Dubblett-ID: ${item.id}`);
  ids.add(item.id);
  if (!/^c\d+$/.test(item.id)) errors.push(`Ogiltigt ID: ${item.id}`);
  if (!['CONFIRMED', 'INDICATION'].includes(item.status)) errors.push(`${item.id}: ogiltig status ${item.status}`);
  if (!Array.isArray(item.sources) || item.sources.length === 0) errors.push(`${item.id}: saknar källa`);

  for (const source of item.sources ?? []) {
    if (!source.l?.trim()) errors.push(`${item.id}: källa saknar beskrivande etikett`);
    let parsed;
    try { parsed = new URL(source.url); } catch { errors.push(`${item.id}: ogiltig URL ${source.url}`); continue; }
    if (parsed.protocol !== 'https:') errors.push(`${item.id}: källan använder inte HTTPS: ${source.url}`);
    if (forbiddenHosts.has(parsed.hostname)) errors.push(`${item.id}: social medie-länk får inte vara kanonisk källa: ${source.url}`);
    if ((parsed.pathname === '/' || parsed.pathname === '') && !parsed.search) errors.push(`${item.id}: länk går till startsida: ${source.url}`);
    if (forbiddenUrls.has(source.url)) errors.push(`${item.id}: länk är känd som inaktuell eller går till landnings-/översiktssida: ${source.url}`);
    if (/\/(search|sok|sök)(\/|$)/i.test(parsed.pathname) || parsed.searchParams.has('query')) errors.push(`${item.id}: sökresultat får inte användas som källa: ${source.url}`);
    urls.add(source.url);
  }
}

for (const [dataset, items] of [['actors.json', actors], ['indicators.json', indicators]]) {
  for (const item of items) {
    if (!item.sourceUrl) {
      errors.push(`${dataset}: ${item.id} saknar sourceUrl`);
      continue;
    }
    try {
      const parsed = new URL(item.sourceUrl);
      if (parsed.protocol !== 'https:') errors.push(`${dataset}: ${item.id} använder inte HTTPS: ${item.sourceUrl}`);
      if (parsed.pathname === '/' && !parsed.search) errors.push(`${dataset}: ${item.id} länkar bara till en startsida: ${item.sourceUrl}`);
    } catch {
      errors.push(`${dataset}: ${item.id} har ogiltig sourceUrl: ${item.sourceUrl}`);
    }
  }
}

const clickableUrls = new Set();
for (const [file, html] of [['index.html', index], ['modules.html', modules]]) {
  for (const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"#]+)"/g)) {
    const raw = match[1];
    let parsed;
    try { parsed = new URL(raw); } catch { errors.push(`${file}: ogiltig extern länk ${raw}`); continue; }
    if (parsed.protocol !== 'https:') errors.push(`${file}: extern länk använder inte HTTPS: ${raw}`);
    if ([...parsed.searchParams.keys()].some(key => /^utm_/i.test(key) || ['fbclid', 'gclid'].includes(key.toLowerCase()))) {
      errors.push(`${file}: spårningsparameter i länk: ${raw}`);
    }
    clickableUrls.add(raw);
  }
}

for (const staleClaim of ['22 av 29', '22/29', 'Alla 97 fall', 'Svenska kraftnät', 'tio talare']) {
  if (index.includes(staleClaim) || modules.includes(staleClaim)) errors.push(`Inaktuell eller felaktig formulering finns kvar: ${staleClaim}`);
}

const moduleIds = [...modules.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]).filter(id => !id.includes('${'));
const duplicateIds = [...new Set(moduleIds.filter((id, index) => moduleIds.indexOf(id) !== index))];
for (const id of duplicateIds) errors.push(`modules.html: duplicerat statiskt id: ${id}`);
for (const match of index.matchAll(/href="modules\.html#([^"]+)"/g)) {
  if (!moduleIds.includes(match[1])) errors.push(`index.html: modulankare saknas: ${match[1]}`);
}

for (const [name, expected] of [['SECTORS', 12], ['ACTORS', 4], ['INDICATORS', 25], ['CHAIN', 7]]) {
  const match = modules.match(new RegExp(`const ${name}=(\\[[^\\n]*\\]);`));
  if (!match) {
    errors.push(`modules.html: ${name} saknas — en eller flera moduler kan inte starta`);
    continue;
  }
  try {
    const items = JSON.parse(match[1]);
    if (items.length !== expected) errors.push(`modules.html: förväntade ${expected} poster i ${name}, hittade ${items.length}`);
  } catch (error) {
    errors.push(`modules.html: ${name} är inte giltig JSON: ${error.message}`);
  }
}

const questionsMatch = modules.match(/const QUESTIONS=(\[[\s\S]*?\]);\s*const DIMS=/);
if (!questionsMatch) {
  errors.push('modules.html: QUESTIONS saknas — modulsidans JavaScript kan inte starta');
} else {
  try {
    const questions = JSON.parse(questionsMatch[1]);
    if (questions.length !== 14) errors.push(`modules.html: förväntade 14 organisationsfrågor, hittade ${questions.length}`);
  } catch (error) {
    errors.push(`modules.html: QUESTIONS är inte giltig JSON: ${error.message}`);
  }
}

if (!modules.includes(`const CASES=${JSON.stringify(cases)};`)) errors.push('Falldatan i modules.html avviker från cases.json');
if (!modules.includes(`const ACTORS=${JSON.stringify(actors)};`)) errors.push('Aktörsdatan i modules.html avviker från actors.json');
if (!modules.includes(`const INDICATORS=${JSON.stringify(indicators)};`)) errors.push('Indikatordatan i modules.html avviker från indicators.json');
if (cases.length !== 140) errors.push(`Förväntade 140 fall, hittade ${cases.length}`);

const publicText = [modules, index, JSON.stringify(cases), JSON.stringify(actors), JSON.stringify(indicators)]
  .join('\n')
  .replace(/https?:\/\/[^\s"'<>]+/g, '');
const identifiedPeople = [
  'Ekrem Güngör', 'Amir Amdouni', 'Naz Zihaoui', 'Gunnel Jonsson', 'Silva Gündüz',
  'Zaniar Matapour', 'Theodor Engström', 'Rakhmat Akilov', 'Peter Mangs',
  'Anton Lundin Pettersson', 'John Ausonius', 'Fekri Hamad', 'Mahmoud Ezzat',
  'Abdesalem Lassoued', 'Fatosh Ibrahim', 'Mirsad Bektašević', 'Anas Khalifa',
  'Viktor Melin', 'Robert Hanssen', 'Nidal Hasan', 'Lina Ishaq', 'Anna Sundberg',
  'Ismail Abdo', 'Rawa Majid', 'Maykil Yokhanna', 'Edip Samuelsson',
  'Abdel Nasser El Nadi', 'Abdirizak Waberi', 'Aldrich-Ames', 'Robert-Hanssen',
  'Jonathan-Pollard', 'Edward-Snowden', 'Daniel-Ellsberg', 'Mika-Invasor',
];
for (const name of identifiedPeople) {
  if (publicText.includes(name)) errors.push(`Utpekad person visas med fullständigt namn i stället för initialer: ${name}`);
}

for (const marker of [
  'Källa: Handledningen', 'Källor: Handledningen', 'handledningen', 'Argus', 'Erfarenheter från Göteborgs stad',
  'MCF0079 mars 2026 kap', 'SMOB SGL 2026 kap', 'original ur handledningen',
  'Konferensen den 30 september', 'Konferens 30 sept 2026', 'abilitypartner.se',
  'recruitmentkanal', 'blind spots', 'operation where', 'anomalier découverts',
]) {
  if (modules.includes(marker)) errors.push(`Intern eller olänkad källhänvisning finns kvar: ${marker}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`OK: ${cases.length} unika fall, ${urls.size} unika fallkällor och ${clickableUrls.size} externa HTTPS-länkar utan spårningsparametrar.`);
