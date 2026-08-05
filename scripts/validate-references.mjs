import fs from 'node:fs';

const cases = JSON.parse(fs.readFileSync(new URL('../cases.json', import.meta.url), 'utf8'));
const modules = fs.readFileSync(new URL('../modules.html', import.meta.url), 'utf8');
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
  'https://www.domstol.se/goteborgs-tingsratt/om-tingsratten/kontakta-oss/'
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
    if (forbiddenUrls.has(source.url)) errors.push(`${item.id}: länk går till landnings-/översiktssida: ${source.url}`);
    urls.add(source.url);
  }
}

if (!modules.includes(`const CASES=${JSON.stringify(cases)};`)) errors.push('Falldatan i modules.html avviker från cases.json');
if (cases.length !== 115) errors.push(`Förväntade 115 fall, hittade ${cases.length}`);

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`OK: ${cases.length} unika fall och ${urls.size} unika direkta källadresser.`);
