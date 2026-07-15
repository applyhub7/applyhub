import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync(new URL('../src/routes.js', import.meta.url), 'utf8');

assert.match(routes, /app\.all\('\/auth'/);
assert.match(routes, /app\.all\('\/jobs'/);
assert.match(routes, /app\.all\('\/applications'/);
