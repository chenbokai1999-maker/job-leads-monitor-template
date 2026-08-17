import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const schemaOnly = args.includes('--schema-only');
const allowTrial = args.includes('--allow-trial');
const fileArg = args.find(arg => !arg.startsWith('--')) ?? 'config/candidate.local.json';
const file = path.resolve(root, fileArg);
const fail = message => { throw new Error(message); };
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const stringArray = value => Array.isArray(value) && value.every(item => nonEmpty(item));

if (!fs.existsSync(file)) {
  fail(`Missing ${path.relative(root, file)}. Run the first-use needs interview before scheduling scans.`);
}

const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!profile || typeof profile !== 'object' || Array.isArray(profile)) fail('profile must be an object');

const required = [
  'profileVersion', 'profileConfirmed', 'lastConfirmed', 'trialStatus', 'trialReviewedAt', 'searchGoal', 'jobTypes',
  'locations', 'remotePolicy', 'roleFamilies', 'industryPreferences', 'background',
  'availability', 'hardConstraints', 'preferences', 'excludeKeywords', 'sourcePolicy',
  'openQuestions'
];
for (const key of required) if (!(key in profile)) fail(`profile missing ${key}`);
for (const key of Object.keys(profile)) if (!required.includes(key)) fail(`unexpected profile field ${key}`);

if (!Number.isInteger(profile.profileVersion) || profile.profileVersion < 1) fail('profileVersion must be a positive integer');
if (typeof profile.profileConfirmed !== 'boolean') fail('profileConfirmed must be boolean');
if (!(profile.lastConfirmed === null || nonEmpty(profile.lastConfirmed))) fail('lastConfirmed must be null or a non-empty string');
if (!['not_run', 'needs_review', 'approved'].includes(profile.trialStatus)) fail('trialStatus is invalid');
if (!(profile.trialReviewedAt === null || nonEmpty(profile.trialReviewedAt))) fail('trialReviewedAt must be null or a non-empty string');
if (typeof profile.searchGoal !== 'string') fail('searchGoal must be a string');
if (!stringArray(profile.jobTypes)) fail('jobTypes must be a string array');
if (!['onsite', 'hybrid', 'remote', 'flexible', 'unknown'].includes(profile.remotePolicy)) fail('remotePolicy is invalid');

if (!Array.isArray(profile.locations)) fail('locations must be an array');
for (const [index, location] of profile.locations.entries()) {
  if (!location || typeof location !== 'object' || !nonEmpty(location.name)) fail(`location ${index} needs a name`);
  if (!['must', 'prefer'].includes(location.priority)) fail(`location ${index} priority must be must or prefer`);
}

if (!Array.isArray(profile.roleFamilies)) fail('roleFamilies must be an array');
for (const [index, role] of profile.roleFamilies.entries()) {
  if (!role || typeof role !== 'object' || !nonEmpty(role.name)) fail(`role family ${index} needs a name`);
  if (!['must', 'prefer', 'explore'].includes(role.priority)) fail(`role family ${index} priority is invalid`);
  if (!stringArray(role.keywords) || !stringArray(role.reasons) || role.keywords.length === 0 || role.reasons.length === 0) fail(`role family ${index} needs keywords and at least one evidence-based reason`);
}

for (const key of ['preferred', 'excluded']) {
  if (!stringArray(profile.industryPreferences?.[key])) fail(`industryPreferences.${key} must be a string array`);
}
for (const key of ['education', 'graduationWindow', 'experienceSummary', 'workAuthorization']) {
  if (typeof profile.background?.[key] !== 'string') fail(`background.${key} must be a string`);
}
for (const key of ['skills', 'languages']) {
  if (!stringArray(profile.background?.[key])) fail(`background.${key} must be a string array`);
}
if (!profile.availability || typeof profile.availability !== 'object') fail('availability must be an object');
if (typeof profile.availability.startDate !== 'string') fail('availability.startDate must be a string');
for (const key of ['daysPerWeekMin', 'durationMonthsMin']) {
  const value = profile.availability[key];
  if (!(value === null || (Number.isInteger(value) && value > 0))) fail(`availability.${key} must be null or a positive integer`);
}
for (const key of ['hardConstraints', 'preferences', 'excludeKeywords', 'openQuestions']) {
  if (!stringArray(profile[key])) fail(`${key} must be a string array`);
}
if (!Number.isInteger(profile.sourcePolicy?.maxPostAgeDays) || profile.sourcePolicy.maxPostAgeDays < 1) fail('sourcePolicy.maxPostAgeDays must be a positive integer');
if (!stringArray(profile.sourcePolicy?.trustLevels) || profile.sourcePolicy.trustLevels.length === 0 || profile.sourcePolicy.trustLevels.some(level => !['A', 'B'].includes(level))) fail('sourcePolicy.trustLevels must contain A, B, or both');

const serialized = JSON.stringify(profile);
if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(serialized)) fail('profile appears to contain an email address');
if (/(?:^|\D)1[3-9]\d{9}(?:\D|$)/.test(serialized)) fail('profile appears to contain a phone number');

if (!schemaOnly) {
  if (!profile.profileConfirmed) fail('profileConfirmed must be true before a scheduled scan');
  if (!nonEmpty(profile.lastConfirmed)) fail('lastConfirmed is required after confirmation');
  if (!allowTrial && profile.trialStatus !== 'approved') fail('trialStatus must be approved before a scheduled scan');
  if (profile.trialStatus === 'approved' && !nonEmpty(profile.trialReviewedAt)) fail('trialReviewedAt is required after trial approval');
  if (!nonEmpty(profile.searchGoal)) fail('searchGoal is required after confirmation');
  if (profile.jobTypes.length === 0) fail('confirm at least one job type');
  if (profile.locations.length === 0 && profile.remotePolicy !== 'remote') fail('confirm at least one location or choose remote');
  if (profile.roleFamilies.length === 0) fail('confirm at least one target or exploratory role family');
  const hasBackground = [profile.background.education, profile.background.experienceSummary].some(nonEmpty) || profile.background.skills.length > 0;
  if (!hasBackground) fail('record at least one non-sensitive background signal for matching');
}

console.log(JSON.stringify({
  file: path.relative(root, file),
  profileConfirmed: profile.profileConfirmed,
  trialStatus: profile.trialStatus,
  jobTypes: profile.jobTypes.length,
  locations: profile.locations.length,
  roleFamilies: profile.roleFamilies.length,
  openQuestions: profile.openQuestions.length,
  mode: schemaOnly ? 'schema-only' : allowTrial ? 'ready-for-trial' : 'ready-to-schedule'
}, null, 2));
