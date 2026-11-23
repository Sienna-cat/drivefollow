import test from 'node:test';
import assert from 'node:assert/strict';

// Assertions describe business behavior. Optional imports make missing behavior
// fail as assertions in the first red run, rather than a module loading error.
const domain = await import('../public/modules/domain.js').catch(() => ({}));
const data = await import('../public/modules/data.js').catch(() => ({}));
const lead = (overrides = {}) => ({ id: 'c-test', name: '测试客户', model: 'nio-es6', budget: '25–30 万', needs: ['后排空间'], consent: true, complaint: false, requestedDrive: true, lastContact: '2026-11-18', status: 'following', history: [{ date: '2026-11-18', text: '询问后排空间，希望周末试驾。' }], ...overrides });

test('contact refusal blocks an invitation even when intent is high', () => {
  const result = domain.buildPlan?.(lead({ consent: false }));
  assert.equal(result?.blocked, true);
  assert.equal(result?.draft, '');
});
test('an unresolved complaint routes to service recovery', () => {
  const result = domain.buildPlan?.(lead({ complaint: true }));
  assert.equal(result?.blocked, true);
  assert.equal(result?.action, '处理客户诉求');
});
test('expired offers are excluded from the draft and usable citations', () => {
  const expired = { id: 'expired-fixture', brand: 'nio', model: 'all', validUntil: '2026-11-15', content: '合成评测：旧活动 5000 元权益，禁止引用。' };
  const result = domain.buildPlan?.(lead(), [...data.KNOWLEDGE, expired]);
  assert.ok(result?.sources?.length > 0);
  assert.ok(result.sources.every(source => !source.validUntil || source.validUntil >= '2026-11-19'));
  assert.ok(!result.draft.includes('5000'));
  assert.ok(result.warnings.some(warning => warning.includes('过期')));
});
test('unknown budget is explicitly requested and not invented', () => {
  const result = domain.buildPlan?.(lead({ budget: '', needs: [] }));
  assert.ok(result?.missing?.includes('购车预算'));
  assert.match(result?.draft || '', /预算/);
  assert.doesNotMatch(result.draft, /25.?30/);
});
test('priority sorts explicit trial requests ahead of dormant unqualified leads', () => {
  const urgent = domain.assessLead?.(lead());
  const normal = domain.assessLead?.(lead({ requestedDrive: false, lastContact: '2026-11-18' }));
  assert.ok(urgent?.score > normal?.score);
});
test('a booking requires the customer to have confirmed the time', () => {
  const state = data.createInitialState?.();
  assert.ok(state, 'seed state is available');
  assert.throws(() => domain.reserveSlot(state, 'c-001', 'slot-1', false), /确认/);
  assert.equal(state.bookings.length, 2);
});
test('a competing booking cannot overwrite a reserved time slot', () => {
  const state = data.createInitialState?.();
  assert.ok(state, 'seed state is available');
  domain.reserveSlot(state, 'c-001', 'slot-1', true);
  assert.throws(() => domain.reserveSlot(state, 'c-003', 'slot-1', true), /占用/);
  assert.equal(state.bookings.length, 3);
});
test('booking confirmation is idempotent and changes the customer stage', () => {
  const state = data.createInitialState?.();
  assert.ok(state, 'seed state is available');
  const first = domain.reserveSlot(state, 'c-001', 'slot-1', true);
  const again = domain.reserveSlot(state, 'c-001', 'slot-1', true);
  assert.equal(first.id, again.id);
  assert.equal(state.bookings.length, 3);
  assert.equal(state.customers.find(customer => customer.id === 'c-001').status, 'booked');
});
test('blocked customers cannot bypass contact rules through the booking tool', () => {
  const state = data.createInitialState?.();
  assert.ok(state, 'seed state is available');
  state.customers.find(customer => customer.id === 'c-001').consent = false;
  assert.throws(() => domain.reserveSlot(state, 'c-001', 'slot-1', true), /联系/);
});
test('repeated adoption creates only one open task for a customer', () => {
  const state = data.createInitialState?.();
  assert.ok(state, 'seed state is available');
  const plan = domain.buildPlan(state.customers.find(customer => customer.id === 'c-001'));
  domain.createTask(state, 'c-001', plan);
  domain.createTask(state, 'c-001', { ...plan, draft: '修改后的草稿' });
  assert.equal(state.tasks.filter(task => task.leadId === 'c-001' && task.status === 'pending').length, 1);
});
