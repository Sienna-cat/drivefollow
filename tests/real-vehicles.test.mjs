import test from 'node:test';
import assert from 'node:assert/strict';
import { VEHICLES, KNOWLEDGE, SLOTS, createInitialState } from '../public/modules/data.js';
import { readState, STORAGE_KEY } from '../public/modules/store.js';

test('the selectable catalog and all seeded customers and slots use sourced real vehicles', () => {
  assert.equal(Object.hasOwn(VEHICLES, 's7'), false);
  assert.equal(Object.hasOwn(VEHICLES, 'e5'), false);
  for (const vehicle of Object.values(VEHICLES)) {
    assert.match(vehicle.sourceUrl || '', /^https:\/\/www\.nio\.cn\//);
  }
  for (const record of [...createInitialState().customers, ...SLOTS]) {
    assert.ok(VEHICLES[record.model]?.sourceUrl, `sourced vehicle for ${record.id}`);
  }
  for (const doc of KNOWLEDGE.filter(doc => doc.category === '车型资料')) {
    assert.ok(VEHICLES[doc.model]?.sourceUrl);
    assert.match(doc.sourceUrl || '', /^https:\/\/www\.nio\.cn\//);
  }
});

function legacyFixture() {
  return {
    version: 1,
    customers: [
      { id: 'old-customer', name: '保留的顾客', model: 's7', budget: '客户自定预算', needs: ['后排空间'], consent: true, complaint: false, requestedDrive: true, status: 'booked', lastContact: '2026-11-19', history: [{ date: '2026-11-19', text: '希望体验远航 S7，周六带家人来。' }] },
      { id: 'old-et5', name: '第二位顾客', model: 'e5', budget: '', needs: [], consent: false, complaint: false, requestedDrive: false, status: 'paused', lastContact: '2026-11-19', history: [] },
    ],
    tasks: [{ id: 'task-kept', leadId: 'old-customer', planId: 'plan-kept', title: '跟进试驾', draft: '我是远航体验中心的小林。请来体验远航 S7。', status: 'completed', result: '已约试驾' }],
    bookings: [{ id: 'booking-kept', leadId: 'old-customer', slotId: 'slot-1', status: 'confirmed' }],
    plans: { 'old-customer': { id: 'plan-kept', draft: '旧的远航 S7 草稿', editedDraft: '我手动修改的远航 S7 试驾邀请，请带家人来。', sources: [{ id: 'kb-s7', content: '旧虚构资料' }], warnings: [] } },
    feedback: [{ id: 'feedback-kept', planId: 'plan-kept', leadId: 'old-customer', type: 'edited', reason: '调整远航 S7 话术' }],
    runs: [{ id: 'run-kept', planId: 'plan-kept', leadId: 'old-customer' }],
    evaluations: [],
  };
}

function storageWith(state) {
  const data = new Map([[STORAGE_KEY, JSON.stringify(state)]]);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('opening a legacy browser store migrates vehicles and citations without resetting customer work', () => {
  const original = legacyFixture();
  const storage = storageWith(original);
  const state = readState(storage);
  assert.equal(state.version, 2);
  assert.equal(state.customers.length, 2);
  assert.equal(state.customers[0].name, '保留的顾客');
  assert.equal(state.customers[0].model, 'nio-es6');
  assert.equal(state.customers[1].model, 'nio-et5');
  assert.equal(state.customers[1].consent, false);
  assert.equal(state.customers[0].budget, '客户自定预算');
  assert.equal(state.tasks[0].id, 'task-kept');
  assert.equal(state.tasks[0].status, 'completed');
  assert.equal(state.bookings[0].id, 'booking-kept');
  assert.equal(SLOTS.find(slot => slot.id === state.bookings[0].slotId).model, state.customers[0].model);
  assert.equal(state.feedback[0].planId, 'plan-kept');
  assert.equal(state.runs[0].id, 'run-kept');
  const plan = state.plans['old-customer'];
  assert.equal(plan.id, 'plan-kept');
  assert.match(plan.editedDraft, /我手动修改的蔚来 ES6.*请带家人来/);
  assert.ok(plan.sources.some(source => source.id === 'nio-es6-positioning'));
  assert.ok(plan.sources.every(source => source.sourceUrl?.startsWith('https://www.nio.cn/')));
  assert.doesNotMatch(JSON.stringify(state), /远航|kb-s7/);
  assert.deepEqual(JSON.parse(storage.getItem('drivefollow-demo-v1-backup-before-v2')), original);
  assert.deepEqual(readState(storage), state, 'second load retains the migrated records');
});

test('legacy records remain usable when the browser cannot persist the migration', () => {
  const raw = JSON.stringify(legacyFixture());
  const state = readState({ getItem: key => key === STORAGE_KEY ? raw : null, setItem: () => { throw new Error('quota exceeded'); } });
  assert.equal(state.customers[0].id, 'old-customer');
  assert.equal(state.customers[0].model, 'nio-es6');
  assert.equal(state.tasks[0].id, 'task-kept');
});
