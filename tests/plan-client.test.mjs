import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../public/modules/data.js';

const client = await import('../public/modules/plan-client.js').catch(() => ({}));
const customer = overrides => ({ ...createInitialState().customers[0], ...overrides });

test('published static demo generates a sourced plan without any API request', async () => {
  let requests = 0;
  const plan = await client.requestPlan?.(customer(), { staticMode: true, request: async () => { requests++; throw new Error('must not request'); } });
  assert.equal(requests, 0);
  assert.equal(plan?.mode, 'demo');
  assert.ok(plan.sources.length > 0);
  assert.ok(plan.draft.length > 0);
  assert.ok(!plan.warnings.some(warning => warning.includes('服务不可用')));
});

test('static publishing preserves refusal and complaint blocking', async () => {
  for (const overrides of [{ consent: false }, { complaint: true }]) {
    const plan = await client.requestPlan?.(customer(overrides), { staticMode: true });
    assert.equal(plan?.mode, 'rule-blocked');
    assert.equal(plan.blocked, true);
    assert.equal(plan.draft, '');
  }
});

test('server mode still uses the API response with customer data', async () => {
  const lead = customer();
  let captured;
  const plan = await client.requestPlan?.(lead, { request: async (url, options) => {
    captured = { url, options };
    return { ok: true, json: async () => ({ mode: 'model', draft: '服务端草稿' }) };
  } });
  assert.equal(plan?.mode, 'model');
  assert.equal(JSON.parse(captured.options.body).lead.id, lead.id);
  assert.equal(captured.options.method, 'POST');
});

test('server failure preserves a usable rule result with an explicit fallback label', async () => {
  const plan = await client.requestPlan?.(customer(), { request: async () => { throw new Error('offline'); } });
  assert.equal(plan?.mode, 'offline');
  assert.ok(plan.draft);
  assert.ok(plan.warnings.some(warning => warning.includes('服务不可用')));
});
