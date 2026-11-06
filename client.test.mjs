import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8');
function mount() {
  let plugin;
  runInNewContext(source, {
    window: { __ModuleLoader__: { load({ factory }) {
      plugin = factory(name => {
        assert.equal(name, 'react');
        return { createElement: (type, props, children) => ({ type, props, children }) };
      });
    } } },
  });
  const builtin = () => null;
  const cards = new Map([['session_search', builtin]]);
  plugin.apply({ slots: {
    inject(name, callback) { assert.equal(name, 'tool.call.toolview'); callback(); },
    register({ name, key }, card) {
      assert.equal(name, 'tool.call.toolview');
      assert.equal(cards.has(key), false, `duplicate card: ${key}`);
      cards.set(key, card);
    },
  } });
  return { cards, builtin };
}

test('family cards coexist with the native session_search card', () => {
  const { cards, builtin } = mount();
  assert.equal(cards.size, 12);
  assert.equal(cards.get('session_search'), builtin);
  assert.equal(typeof cards.get('transcript_search'), 'function');
  assert.equal(typeof cards.get('quota_meter'), 'function');
});

test('running and completed quota cards expose state and text content', () => {
  const card = mount().cards.get('quota_meter');
  const running = JSON.stringify(card({ block: { name: 'quota_meter', argsRaw: '{"scope":"session"}' } }));
  assert.match(running, /quota meter/);
  assert.match(running, /运行中/);
  assert.match(running, /scope: session/);
  const done = JSON.stringify(card({ block: { kind: 'tool-result', call: { name: 'quota_meter', argsRaw: '{}' }, content: [{ type: 'text', text: '<script>untrusted</script>' }] } }));
  assert.match(done, /完成/);
  assert.match(done, /<script>untrusted<\/script>/);
  assert.doesNotMatch(done, /dangerouslySetInnerHTML/);
});

test('malformed arguments and error results remain readable', () => {
  const card = mount().cards.get('transcript_search');
  const result = JSON.stringify(card({ block: { kind: 'tool-result', isError: true, call: { name: 'transcript_search', argsRaw: '{broken' }, content: [{ type: 'text', text: 'No archive' }] } }));
  assert.match(result, /transcript search/);
  assert.match(result, /出错/);
  assert.match(result, /\{broken/);
  assert.match(result, /No archive/);
});
