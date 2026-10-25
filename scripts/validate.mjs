import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../',import.meta.url);
const text = name => readFileSync(new URL(name,root),'utf8');
const manifest = JSON.parse(text('manifest.json'));
assert.equal(manifest.id,'obsidian-bridge');
assert.equal(manifest.author,'AG-albino');
assert.match(manifest.version,/^\d+\.\d+\.\d+$/);
assert.equal(manifest.tier,'js');
assert.equal(manifest.sdkVersion,'>=0.3.22');
assert.deepEqual([...manifest.permissions].sort(),['ui:file-link-menu','exec:powershell','exec:open','exec:xdg-open'].sort());
assert.ok(manifest.description.length <= 120);
assert.ok(manifest.name.length <= 30);
const source = text('main.js');
assert.ok(Buffer.byteLength(source) < 512*1024);
for (const forbidden of [/\beval\s*\(/,/new\s+Function\s*\(/,/__TAURI/,/\blocalStorage\b/,/\bimport\s*(?:\(|['"{*])/]) {
  assert.ok(!forbidden.test(source),`Forbidden runtime capability: ${forbidden}`);
}
assert.ok(source.includes('ctx.ui.registerFileLinkMenuItem('));
assert.ok(source.includes("'plugin_exec_spawn'"));
assert.ok(source.includes("lifecycle: 'detached'"));
assert.ok(!source.includes('__OBSIDIAN_ICON_DATA__'));
assert.ok(!text('styles.css').match(/@import|url\(\s*['"]?https?:/i));
for (const name of ['README.md','LICENSE','.github/workflows/release.yml',manifest.icon,...manifest.screenshots]) {
  assert.ok(existsSync(new URL(name,root)),`Missing required file: ${name}`);
}
console.log('Validated manifest, permissions, assets, readable single-file ESM and size. Requires proposed SDK 0.3.22.');
