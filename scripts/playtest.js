'use strict';

const fs = require('node:fs');
const path = require('node:path');
const E = require('../src/engine.js');

function play(seed, keepLog = false) {
  const state = E.createExpedition(seed);
  const decisions = [];
  const encounters = [];
  let previousNode = null;
  for (let step = 0; step < 2000 && state.screen !== 'ending'; step += 1) {
    if (state.currentNode && state.currentNode.id !== previousNode) {
      previousNode = state.currentNode.id;
      encounters.push({ node: previousNode, type: state.currentNode.type, startHp: state.heroes.map(hero => hero.hp) });
    }
    const action = E.autoAction(state);
    if (!action) throw new Error(`No action on ${state.screen}`);
    const before = { screen: state.screen, turn: state.combat ? state.combat.turn : null, stage: state.stage };
    const result = E.applyAction(state, action);
    if (!result.ok) throw new Error(`${JSON.stringify(action)}: ${result.error}`);
    if (keepLog) decisions.push({ step, before, action, screen: state.screen, rngState: state.rngState });
  }
  return {
    seed: String(seed),
    outcome: state.ending ? (state.ending.victory ? 'victory' : 'defeat') : 'unfinished',
    stage: state.stage,
    score: state.score,
    hp: state.heroes.map(hero => ({ id: hero.id, hp: hero.hp, maxHp: hero.maxHp })),
    route: state.route,
    collection: state.collection,
    upgrades: state.upgrades,
    stats: state.stats,
    encounters,
    decisions,
    finalState: keepLog ? state : undefined
  };
}

if (require.main === module) {
  const seed = process.argv[2] || 'glass-01';
  const result = play(seed, true);
  const output = path.join(__dirname, '..', 'evidence', `playthrough-${seed.replace(/[^a-z0-9_-]/gi, '_')}.json`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ...result, decisions: undefined, finalState: undefined, evidence: output }, null, 2));
}

module.exports = { play };
