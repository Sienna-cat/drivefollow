import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../public/modules/data.js';
import { buildFollowEvidence } from '../public/modules/evidence.js';

test('buildFollowEvidence does not invent an adoption denominator', () => {
  const evidence = buildFollowEvidence(createInitialState());
  assert.deepEqual(evidence.feedback, { denominator: 0, accepted: 0, edited: 0, rejected: 0, adoptionRate: null });
  assert.deepEqual(evidence.evaluations, { total: 0, passed: 0, passRate: null });
  assert.equal(evidence.evidenceBoundary.status, '规则回归 + 本地操作记录');
});

test('buildFollowEvidence separates direct adoption, edited adoption, and rejection', () => {
  const state = createInitialState();
  state.feedback = [
    { id: 'f1', planId: 'p1', type: 'accepted' },
    { id: 'f2', planId: 'p2', type: 'edited' },
    { id: 'f3', planId: 'p3', type: 'rejected' },
  ];
  state.evaluations = [{ id: 'case-1', pass: true }, { id: 'case-2', pass: false }];
  const evidence = buildFollowEvidence(state);
  assert.deepEqual(evidence.feedback, { denominator: 3, accepted: 1, edited: 1, rejected: 1, adoptionRate: 67 });
  assert.deepEqual(evidence.evaluations, { total: 2, passed: 1, passRate: 50 });
});
