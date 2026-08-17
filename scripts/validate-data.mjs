import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

const site = readJson('docs/data/site.json');
const leads = readJson('docs/data/leads.json');
const scan = readJson('docs/data/scan-history.json');

const fail = message => { throw new Error(message); };
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const normalized = value => String(value).trim().toLowerCase().replace(/\s+/g, ' ');
const duplicateValues = values => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

for (const field of ['title', 'subtitle', 'storageKey']) {
  if (!nonEmpty(site[field])) fail(`site.json missing ${field}`);
}
if (!Array.isArray(leads)) fail('leads.json must be an array');
if (!scan || typeof scan !== 'object' || Array.isArray(scan)) fail('scan-history.json must be an object');
if (!scan.scanMeta || typeof scan.scanMeta !== 'object') fail('scanMeta is required');
if (!Array.isArray(scan.history)) fail('history must be an array');
if (scan.history.length > 30) fail(`history has ${scan.history.length} entries; maximum is 30`);
if (!Number.isInteger(scan.scanMeta.filteredTotal) || scan.scanMeta.filteredTotal < 0) fail('filteredTotal must be a non-negative integer');
if (!nonEmpty(scan.scanMeta.lastChecked) || !nonEmpty(scan.scanMeta.note)) fail('scanMeta lastChecked and note are required');

const required = ['id', 'trust', 'trustReason', 'company', 'title', 'city', 'platform', 'date', 'checked', 'summary', 'risks', 'url', 'status'];
for (const [index, lead] of leads.entries()) {
  for (const field of required) {
    if (!(field in lead)) fail(`lead ${index} missing ${field}`);
  }
  for (const field of required.filter(field => !['risks'].includes(field))) {
    if (!nonEmpty(lead[field])) fail(`lead ${index} has empty ${field}`);
  }
  if (!['A', 'B'].includes(lead.trust)) fail(`lead ${index} trust must be A or B`);
  if (!['open', 'needs_recheck', 'closed'].includes(lead.status)) fail(`lead ${index} has invalid status`);
  if (!Array.isArray(lead.risks) || lead.risks.some(risk => !nonEmpty(risk))) fail(`lead ${index} risks must be a string array`);
  let url;
  try { url = new URL(lead.url); } catch { fail(`lead ${index} has invalid URL`); }
  if (!['http:', 'https:'].includes(url.protocol)) fail(`lead ${index} URL must use http or https`);
}

const duplicateIds = duplicateValues(leads.map(lead => normalized(lead.id)));
const duplicateUrls = duplicateValues(leads.map(lead => {
  const url = new URL(lead.url);
  url.hash = '';
  return url.href.replace(/\/$/, '').toLowerCase();
}));
const duplicateJobs = duplicateValues(leads.map(lead => [lead.company, lead.title, lead.city].map(normalized).join('\u0000')));
if (duplicateIds.length) fail(`duplicate ids: ${duplicateIds.join(', ')}`);
if (duplicateUrls.length) fail(`duplicate URLs: ${duplicateUrls.join(', ')}`);
if (duplicateJobs.length) fail(`duplicate company/title/city keys: ${duplicateJobs.join(', ')}`);

for (const [index, log] of scan.history.entries()) {
  for (const field of ['time', 'scanned', 'accepted', 'filtered', 'note']) {
    if (!(field in log)) fail(`history ${index} missing ${field}`);
  }
  if (!nonEmpty(log.time) || !nonEmpty(log.note)) fail(`history ${index} time and note are required`);
  for (const field of ['scanned', 'accepted', 'filtered']) {
    if (!Number.isInteger(log[field]) || log[field] < 0) fail(`history ${index} ${field} must be a non-negative integer`);
  }
  if (log.scanned !== log.accepted + log.filtered) fail(`history ${index} counts do not add up`);
}

console.log(JSON.stringify({
  leads: leads.length,
  trustA: leads.filter(lead => lead.trust === 'A').length,
  trustB: leads.filter(lead => lead.trust === 'B').length,
  filteredTotal: scan.scanMeta.filteredTotal,
  history: scan.history.length,
  latest: scan.history.at(-1) ?? null
}, null, 2));
