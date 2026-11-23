import test from 'node:test';
import assert from 'node:assert/strict';
import { KNOWLEDGE, VEHICLES, createInitialState } from '../public/modules/data.js';
import { buildPlan } from '../public/modules/domain.js';

const nioDocs = KNOWLEDGE.filter(doc => doc.brand === 'nio');

test('NIO knowledge contains official source metadata and freshness boundaries', () => {
  assert.ok(nioDocs.length >= 10);
  for (const doc of nioDocs) {
    assert.equal(doc.publisher, 'NIO蔚来官网');
    assert.match(doc.sourceUrl, /^https:\/\/www\.nio\.cn\//);
    assert.match(doc.retrievedAt, /^2026-11-19$/);
    assert.ok(doc.content.length > 30);
    assert.ok(['fact', 'inference', 'guardrail'].includes(doc.evidenceType));
  }
});

test('NIO model catalog exposes the four sourced models with cautious user-fit notes', () => {
  for (const id of ['nio-es6', 'nio-et5', 'nio-et5t', 'nio-et7']) {
    assert.equal(VEHICLES[id].brand, 'nio');
    assert.ok(VEHICLES[id].sourceUrl.startsWith('https://www.nio.cn/'));
    const profile = nioDocs.find(doc => doc.model === id && doc.evidenceType === 'inference');
    assert.ok(profile, `user fit for ${id} is labeled as an inference`);
    assert.match(profile.content, /基于官方产品定位|销售假设/);
  }
});

test('NIO user-fit docs match the selected real vehicle without citing another model', () => {
  const nioLead = { ...createInitialState().customers[0], id: 'c-nio', model: 'nio-es6', name: 'NIO 测试客户' };
  const nioPlan = buildPlan(nioLead);
  assert.ok(nioPlan.sources.some(source => source.id === 'nio-es6-positioning'));
  assert.ok(nioPlan.sources.some(source => source.evidenceType === 'inference'));
  assert.ok(nioPlan.audience.includes('家庭') || nioPlan.audience.includes('空间'));
  assert.equal(nioPlan.sources.some(source => source.brand === 'demo'), false);
  assert.doesNotMatch(nioPlan.draft, /远航/);
  assert.equal(nioPlan.warnings.some(warning => warning.includes('过期活动')), false);
  assert.equal(nioPlan.sources.some(source => source.model === 'nio-et5'), false);
  const et5Plan = buildPlan({ ...nioLead, model: 'nio-et5' });
  assert.ok(et5Plan.sources.some(source => source.id === 'nio-et5-positioning'));
  assert.equal(et5Plan.sources.some(source => source.model === 'nio-es6'), false);
});

test('a NIO audience hypothesis never becomes a customer fact or assumed need', () => {
  const plan = buildPlan({ ...createInitialState().customers[0], model: 'nio-es6', needs: [], budget: '' });
  assert.ok(plan.audience);
  assert.equal(plan.facts.some(fact => /家庭|空间/.test(fact.value)), false);
  assert.match(plan.draft, /需求/);
  assert.doesNotMatch(plan.draft, /您.*家庭/);
});

test('NIO service docs avoid turning live counts or official caveats into promises', () => {
  const power = nioDocs.find(doc => doc.id === 'nio-power-services');
  const service = nioDocs.find(doc => doc.id === 'nio-service-overview');
  assert.match(power.content, /2026-11-19/);
  assert.match(power.guardrail, /实时|官方地图/);
  assert.match(service.content, /一键维保|上门补胎|事故安心|驾享/);
  assert.match(service.guardrail, /权益|实际/);
});
