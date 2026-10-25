import { test } from 'node:test';
import assert from 'node:assert/strict';
import activate, { createObsidianUri, createLaunchRequest } from '../main.js';

test('encodes Unicode, quotes, whitespace and query delimiters without changing the path', () => {
  const path = "C:\\Заметки\\O'Brien & #1 + 100%.md";
  const uri = createObsidianUri(path);
  assert.equal(new URL(uri).searchParams.get('path'), path);
  assert.ok(!uri.includes("'"));
});

test('rejects relative and empty paths', () => {
  for (const path of ['', 'note.md', '../note.md', '~/note.md', '--help']) {
    assert.throws(() => createObsidianUri(path), /absolute/i);
  }
});

test('OS launchers receive a URI as data, never a raw file path as shell code', () => {
  const uri = createObsidianUri("C:\\Vault\\file'; Stop-Process test.md");
  const win = createLaunchRequest('Win32', uri);
  assert.equal(win.bin, 'powershell');
  assert.ok(win.args.includes('-NonInteractive'));
  assert.ok(win.args.includes('-WindowStyle'));
  assert.ok(!win.args.join(' ').includes('Stop-Process'));
  assert.equal(createLaunchRequest('MacIntel', uri).bin, 'open');
  assert.equal(createLaunchRequest('Darwin', uri).bin, 'open');
  assert.deepEqual(createLaunchRequest('Linux x86_64', uri).args, [uri]);
  assert.throws(() => createLaunchRequest('UnknownOS', uri), /support/i);
});

function context(platform = 'Win32', language = 'en') {
  const calls = [];
  const registrations = [];
  const ctx = {
    host: { sdkVersion: '0.3.22' },
    i18n: { language, addBundle: () => () => {} },
    react: { createElement: (...args) => args },
    ui: { registerFileLinkMenuItem: def => { registrations.push(def); return () => {}; } },
    bridge: { invoke: async (command, args) => { calls.push({command,args}); return {code:0,stdout:'',stderr:''}; } },
  };
  return { ctx, calls, registrations, platform };
}

test('registers one branded entry and uses only the approved process bridge', async () => {
  const fixture = context();
  activate(fixture.ctx, {platform:'Win32',language:'en'});
  assert.equal(fixture.registrations.length, 1);
  const entry = fixture.registrations[0];
  assert.equal(entry.label(), 'Open in Obsidian');
  assert.equal(typeof entry.icon, 'function');
  await entry.run({path:'note.md',resolvedPath:'C:/Vault/笔记.md',workspacePath:'C:/Vault'});
  assert.equal(fixture.calls.length,1);
  assert.equal(fixture.calls[0].command,'plugin_exec_spawn');
  assert.equal(fixture.calls[0].args.lifecycle,'detached');
  assert.equal(fixture.calls[0].args.bin,'powershell');
});

test('missing resolved targets never launch', async () => {
  const fixture = context(); activate(fixture.ctx,{platform:'Win32',language:'en'});
  await assert.rejects(() => fixture.registrations[0].run({resolvedPath:null}), /resolved/i);
  assert.equal(fixture.calls.length,0);
});

test('old hosts fail clearly instead of pretending to activate', () => {
  const fixture = context(); delete fixture.ctx.ui.registerFileLinkMenuItem;
  assert.throws(() => activate(fixture.ctx), /SDK 0\.3\.22/);
});

test('launch errors are returned to the host', async () => {
  const fixture = context();
  fixture.ctx.bridge.invoke = async () => { throw new Error('not installed'); };
  activate(fixture.ctx,{platform:'Linux',language:'en'});
  await assert.rejects(() => fixture.registrations[0].run({resolvedPath:'/Vault/note.md'}), /not installed/);
});
