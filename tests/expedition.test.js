'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const { play } = require('../scripts/playtest.js');

test('first-light completes five steps and the final boss through public game actions', () => {
  const result = play('first-light', true);
  assert.equal(result.outcome, 'victory');
  assert.equal(result.route.length, 5);
  assert.equal(result.stats.combats, 6);
  assert.equal(result.stats.kills, 21);
  assert.ok(result.decisions.length < 2000);
  assert.ok(result.decisions.every(decision => decision.action && decision.rngState !== undefined));
});

test('a save between encounters reproduces all following draws and choices exactly', () => {
  const state = E.createExpedition('save-between');
  while (state.screen !== 'reward') {
    const result = E.applyAction(state, E.autoAction(state));
    assert.equal(result.ok, true);
  }
  assert.equal(E.applyAction(state, E.autoAction(state)).ok, true);
  assert.equal(state.screen, 'map');
  const restored = JSON.parse(JSON.stringify(state));
  for (let index = 0; index < 60 && state.screen !== 'ending'; index += 1) {
    const action = E.autoAction(state);
    const restoredAction = E.autoAction(restored);
    assert.deepEqual(action, restoredAction);
    assert.equal(E.applyAction(state, action).ok, true);
    assert.equal(E.applyAction(restored, restoredAction).ok, true);
    assert.deepEqual(state, restored);
  }
});
