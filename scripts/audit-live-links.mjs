import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const all = process.argv.includes('--all');
const fast = process.argv.includes('--fast');
const cases = JSON.parse(fs.readFileSync(new URL('cases.json', root), 'utf8'));
const index = fs.readFileSync(new URL('index.html', root), 'utf8');
const modules = fs.readFileSync(new URL('modules.html', root), 'utf8');

const urls = all
  ? [...new Set([...`${index}\n${modules}`.matchAll(/<a\b[^>]*href="(https?:\/\/[^"#]+)"/g)].map(match => match[1]))]
  : [...new Set(cases.flatMap(item => item.sources.map(source => source.url)))];

const results = [];
let cursor = 0;

async function inspect(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(fast ? 10_000 : 20_000),
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; INBLICK-LinkAudit/1.0)',
        accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
      },
    });
    await response.body?.cancel();
    return { url, status: response.status, finalUrl: response.url, ms: Date.now() - started };
  } catch (error) {
    return { url, status: null, error: error?.name ?? String(error), ms: Date.now() - started };
  }
}

async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    results[index] = await inspect(urls[index]);
    if ((index + 1) % 100 === 0) console.error(`Kontrollerat ${index + 1}/${urls.length}`);
  }
}

await Promise.all(Array.from({ length: Math.min(fast ? 32 : 12, urls.length) }, worker));

const broken = results.filter(result => [404, 410].includes(result.status));
const restricted = results.filter(result => [401, 403, 429].includes(result.status));
const serverErrors = results.filter(result => result.status >= 500);
const unreachable = results.filter(result => result.status === null);

const report = {
  scope: all ? 'all-clickable-links' : 'case-sources',
  checked: results.length,
  ok: results.filter(result => result.status >= 200 && result.status < 400).length,
  broken,
  restricted,
  serverErrors,
  unreachable,
};

fs.writeFileSync('/tmp/inblick-link-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

process.exitCode = broken.length ? 1 : 0;
