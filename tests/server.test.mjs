import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../public/modules/data.js';
const runtime = await import('../server.mjs').catch(() => ({}));

async function withServer(options, execute) {
  assert.equal(typeof runtime.createApp, 'function', 'HTTP application is implemented');
  const server = runtime.createApp(options);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  try { await execute(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('config reports simulation mode without exposing server secrets', async () => {
  await withServer({}, async base => {
    const response = await fetch(`${base}/api/config`);
    const config = await response.json();
    assert.equal(config.mode, 'demo');
    assert.equal(config.apiKey, undefined);
  });
});
test('planning endpoint rejects malformed JSON and invalid lead shapes', async () => {
  await withServer({}, async base => {
    const valid = createInitialState().customers[0];
    for (const body of ['{broken', JSON.stringify({ lead: { name: '<script>' } }), JSON.stringify({ lead: { ...valid, needs: 'not-an-array' } }), JSON.stringify({ lead: { ...valid, consent: 'yes' } }), JSON.stringify({ lead: { ...valid, model: 'unknown' } }), JSON.stringify({ lead: { ...valid, model: 's7' } }), JSON.stringify({ lead: { ...valid, model: 'e5' } })]) {
      const result = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
      assert.equal(result.status, 400);
    }
  });
});
test('partial model configuration is not reported as ready', async () => {
  await withServer({ apiKey: 'test-only', baseUrl: '', model: '' }, async base => {
    assert.equal((await (await fetch(`${base}/api/config`)).json()).mode, 'demo');
  });
});
test('model receives valid knowledge and returned drafts are explicitly labeled', async () => {
  let payload;
  await withServer({ apiKey: 'test-only', model: 'test', baseUrl: 'http://unused', modelFetch: async (_url, options) => {
    payload = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ message: { content: '陈先生，您好！周末方便来体验后排空间吗？具体时段我再帮您确认。' } }] }), { status: 200 });
  } }, async base => {
    const response = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lead: createInitialState().customers[0] }) });
    const plan = await response.json();
    assert.equal(plan.mode, 'model');
    assert.ok(payload.messages.some(item => item.content.includes('智能电动全能 SUV')));
    assert.ok(!payload.messages.some(item => item.content.includes('5000')));
    assert.ok(plan.trace.some(step => step.tool === 'model.generate'));
  });
});
test('planning endpoint returns source-backed draft with actual execution mode', async () => {
  await withServer({}, async base => {
    const response = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lead: createInitialState().customers[0] }) });
    const plan = await response.json();
    assert.equal(response.status, 200);
    assert.equal(plan.mode, 'demo');
    assert.ok(plan.sources.some(source => source.id === 'nio-es6-positioning'));
    assert.ok(plan.draft.includes('陈先生'));
  });
});
test('model failure falls back explicitly instead of pretending a model succeeded', async () => {
  await withServer({ apiKey: 'test-only', model: 'test', baseUrl: 'http://unused', modelFetch: async () => { throw new Error('unavailable'); } }, async base => {
    const response = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lead: createInitialState().customers[0] }) });
    const plan = await response.json();
    assert.equal(plan.mode, 'fallback');
    assert.ok(plan.draft.length > 20);
    assert.ok(plan.warnings.some(text => text.includes('不可用')));
  });
});
test('blocked leads never invoke the model', async () => {
  let modelCalls = 0;
  await withServer({ apiKey: 'test-only', model: 'test', modelFetch: async () => { modelCalls++; throw new Error('should not call'); } }, async base => {
    const response = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lead: createInitialState().customers[6] }) });
    assert.equal((await response.json()).blocked, true);
    assert.equal(modelCalls, 0);
  });
});
test('private configuration and source tests are not served as static files', async () => {
  await withServer({}, async base => {
    for (const path of ['/.env', '/server.mjs', '/tests/server.test.mjs', '/%2e%2e%2fpackage.json']) {
      const result = await fetch(`${base}${path}`);
      assert.ok([403, 404].includes(result.status));
    }
  });
});

test('planning accepts a NIO lead and returns only its brand and model evidence', async () => {
  await withServer({}, async base => {
    const lead = { ...createInitialState().customers[0], model: 'nio-es6' };
    const response = await fetch(`${base}/api/plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lead }) });
    assert.equal(response.status, 200);
    const plan = await response.json();
    assert.equal(plan.mode, 'demo');
    assert.ok(plan.sources.some(source => source.model === 'nio-es6'));
    assert.ok(plan.sources.every(source => source.brand === 'nio' && ['all', 'nio-es6'].includes(source.model)));
    assert.doesNotMatch(plan.draft, /远航/);
  });
});
