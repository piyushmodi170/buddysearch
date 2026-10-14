import assert from 'node:assert/strict';
import { shouldCacheSettingLoad, type SettingLoadKind } from './settings.js';

const decisions: Record<SettingLoadKind, boolean> = {
  hit: true,
  miss: true,
  timeout: false,
  error: false,
};

for (const [kind, cache] of Object.entries(decisions) as [SettingLoadKind, boolean][]) {
  assert.equal(shouldCacheSettingLoad(kind), cache, `kind ${kind}`);
}

console.log('settings cache policy tests passed');
