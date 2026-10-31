'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');

function combat(seed = 'rules') {
  const state = E.createExpedition(seed);
  assert.equal(E.startNode(state, '0-0').ok, true);
  return state;
}

function give(state, cardId) {
  const existing = state.combat.hand.find(card => card.id === cardId);
  if (existing) return existing;
  const card = { uid: `test-${cardId}-${state.combat.hand.length}`, id: cardId };
  state.combat.hand[0] = card;
  return card;
}

function onlyEnemy(state, type = 'sentry') {
  state.combat.enemies.forEach((enemy, index) => {
    enemy.type = index === 0 ? type : enemy.type;
    enemy.hp = index === 0 ? ENEMY_HP(type) : 0;
  });
  return state.combat.enemies[0];
}

function ENEMY_HP(type) { return E.ENEMIES[type].hp; }

test('initial combat has a 7x5 board, three heroes, five cards, three energy and twelve cards', () => {
  const state = combat();
  assert.equal(E.WIDTH * E.HEIGHT, 35);
  assert.equal(state.heroes.length, 3);
  assert.equal(state.combat.hand.length, 5);
  assert.equal(state.combat.energy, 3);
  const zones = [...state.combat.hand, ...state.combat.deck, ...state.combat.discard];
  assert.equal(zones.length, 12);
  assert.ok(state.combat.intents.length > 0);
  assert.equal(new Set(state.collection).size >= 8, true);
});

test('card costs and range are enforced without mutating state on rejection', () => {
  const state = combat();
  const card = give(state, 'bash');
  const guardian = E.heroById(state, 'guardian');
  const enemy = E.aliveEnemies(state)[0];
  guardian.x = 0; guardian.y = 0;
  enemy.x = 6; enemy.y = 4;
  const before = E.clone(state);
  assert.equal(E.playCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]).error, 'invalidTarget');
  assert.deepEqual(state, before);
  state.combat.energy = 0;
  assert.equal(E.playCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]).error, 'energy');
  assert.equal(state.combat.hand.filter(item => item.uid === card.uid).length, 1);
});

test('deterministic bash preview matches damage, energy and forced movement', () => {
  const state = combat();
  const card = give(state, 'bash');
  const guardian = E.heroById(state, 'guardian');
  const enemy = E.aliveEnemies(state)[0];
  guardian.x = 3; guardian.y = 0;
  enemy.x = 4; enemy.y = 0; enemy.hp = 6; enemy.maxHp = 6;
  const before = E.clone(state);
  const preview = E.previewCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]);
  assert.equal(preview.ok, true);
  assert.deepEqual(state, before);
  const result = E.playCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]);
  assert.equal(result.ok, true);
  assert.equal(state.combat.energy, preview.changes.energyAfter);
  const changed = preview.changes.enemies.find(item => item.id === enemy.id);
  assert.equal(enemy.hp, changed.hpAfter);
  assert.equal(enemy.x, changed.to.x);
  assert.equal(enemy.y, changed.to.y);
  assert.equal(state.combat.discard.some(item => item.uid === card.uid), true);
});

test('bash pushes an enemy onto thorns for two additional deterministic damage', () => {
  const state = combat();
  const card = give(state, 'bash');
  const guardian = E.heroById(state, 'guardian');
  const enemy = E.aliveEnemies(state)[0];
  guardian.x = 2; guardian.y = 0;
  enemy.x = 3; enemy.y = 0; enemy.hp = 6; enemy.maxHp = 6;
  const result = E.playCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]);
  assert.equal(result.ok, true);
  assert.equal(enemy.x, 4);
  assert.equal(enemy.y, 0);
  assert.equal(enemy.hp, 2);
});

test('short movement is limited to two reachable cells and once per hero per turn', () => {
  const state = combat();
  const targets = E.getMoveTargets(state, 'guardian');
  assert.ok(targets.length > 0);
  assert.ok(targets.every(target => E.distance(E.heroById(state, 'guardian'), target) <= 2));
  assert.equal(E.moveHero(state, 'guardian', { x: 6, y: 4 }).ok, false);
  const target = targets[0];
  assert.equal(E.moveHero(state, 'guardian', target).ok, true);
  assert.equal(E.heroById(state, 'guardian').moved, true);
  assert.equal(E.getMoveTargets(state, 'guardian').length, 0);
});

test('protection absorbs announced damage and expires on the next player turn', () => {
  const state = combat();
  const enemy = onlyEnemy(state, 'sentry');
  const scout = E.heroById(state, 'scout');
  const guardian = E.heroById(state, 'guardian');
  enemy.x = 6; enemy.y = 2;
  scout.x = 5; scout.y = 2;
  guardian.x = 2; guardian.y = 2;
  E.createIntents(state);
  const card = give(state, 'safeguard');
  const oldHp = scout.hp;
  assert.equal(E.playCard(state, card.uid, [{ kind: 'hero', id: scout.id }]).ok, true);
  assert.equal(scout.guard, 3);
  assert.equal(E.endTurn(state).ok, true);
  assert.equal(scout.hp, oldHp);
  assert.equal(scout.guard, 0);
});

test('a locked enemy attack strikes its original cell after the target moves', () => {
  const state = combat();
  const enemy = onlyEnemy(state, 'sentry');
  const scout = E.heroById(state, 'scout');
  const guardian = E.heroById(state, 'guardian');
  enemy.x = 6; enemy.y = 2;
  scout.x = 5; scout.y = 2;
  guardian.x = 0; guardian.y = 0;
  E.createIntents(state);
  const locked = E.clone(state.combat.intents);
  scout.x = 0; scout.y = 1;
  guardian.x = 5; guardian.y = 2;
  const guardianHp = guardian.hp;
  const scoutHp = scout.hp;
  E.endTurn(state);
  assert.equal(guardian.hp, guardianHp - 2);
  assert.equal(scout.hp, scoutHp);
  assert.deepEqual(locked[0].area, [{ x: 5, y: 2 }]);
});

test('crystal shatter previews friendly and enemy damage and removes the crystal', () => {
  const state = combat();
  const card = give(state, 'shatter');
  const artificer = E.heroById(state, 'artificer');
  const guardian = E.heroById(state, 'guardian');
  const enemy = E.aliveEnemies(state)[0];
  artificer.x = 0; artificer.y = 2;
  guardian.x = 2; guardian.y = 2;
  enemy.x = 4; enemy.y = 2; enemy.hp = 6; enemy.maxHp = 6;
  const preview = E.previewCard(state, card.uid, [{ kind: 'crystal', id: 'crystal-0' }]);
  assert.equal(preview.ok, true);
  assert.equal(preview.changes.enemies.find(item => item.id === enemy.id).hpBefore - preview.changes.enemies.find(item => item.id === enemy.id).hpAfter, 3);
  assert.equal(preview.changes.heroes.find(item => item.id === guardian.id).hpBefore - preview.changes.heroes.find(item => item.id === guardian.id).hpAfter, 3);
  assert.equal(E.playCard(state, card.uid, [{ kind: 'crystal', id: 'crystal-0' }]).ok, true);
  assert.equal(state.combat.crystals.length, 0);
});

test('ally swap exchanges exact positions', () => {
  const state = combat();
  const card = give(state, 'swap');
  const guardian = E.heroById(state, 'guardian');
  const scout = E.heroById(state, 'scout');
  const before = { guardian: { x: guardian.x, y: guardian.y }, scout: { x: scout.x, y: scout.y } };
  const targets = [{ kind: 'hero', id: guardian.id }, { kind: 'hero', id: scout.id }];
  assert.equal(E.playCard(state, card.uid, targets).ok, true);
  assert.deepEqual({ x: guardian.x, y: guardian.y }, before.scout);
  assert.deepEqual({ x: scout.x, y: scout.y }, before.guardian);
});

test('resonance attracts enemies without rewriting their announced intents', () => {
  const state = combat();
  const card = give(state, 'resonance');
  const artificer = E.heroById(state, 'artificer');
  const enemy = E.aliveEnemies(state)[0];
  artificer.x = 0; artificer.y = 3;
  enemy.x = 5; enemy.y = 2;
  E.createIntents(state);
  const intents = E.clone(state.combat.intents);
  assert.equal(E.playCard(state, card.uid, [{ kind: 'crystal', id: 'crystal-0' }]).ok, true);
  assert.equal(E.distance(enemy, { x: 3, y: 2 }) < 2, true);
  assert.deepEqual(state.combat.intents, intents);
});

test('isolated scout strike deals five, otherwise three', () => {
  const state = combat();
  const card = give(state, 'edge');
  const scout = E.heroById(state, 'scout');
  const enemies = E.aliveEnemies(state);
  scout.x = 1; scout.y = 1;
  enemies[0].x = 2; enemies[0].y = 1; enemies[0].hp = 6; enemies[0].maxHp = 6;
  enemies[1].x = 6; enemies[1].y = 4;
  const isolated = E.previewCard(state, card.uid, [{ kind: 'enemy', id: enemies[0].id }]);
  assert.equal(isolated.isolated, true);
  assert.equal(isolated.changes.enemies.find(item => item.id === enemies[0].id).hpAfter, 1);
  enemies[1].x = 2; enemies[1].y = 2;
  const grouped = E.previewCard(state, card.uid, [{ kind: 'enemy', id: enemies[0].id }]);
  assert.equal(grouped.isolated, false);
  assert.equal(grouped.changes.enemies.find(item => item.id === enemies[0].id).hpAfter, 3);
});

test('discard is reshuffled only when drawing requires it and RNG resumes exactly', () => {
  const state = combat();
  state.combat.hand = [];
  state.combat.deck = [{ uid: 'a', id: 'bash' }];
  state.combat.discard = [{ uid: 'b', id: 'bolt' }, { uid: 'c', id: 'edge' }, { uid: 'd', id: 'swap' }];
  const restored = E.clone(state);
  E.drawToFive(state);
  E.drawToFive(restored);
  assert.deepEqual(state, restored);
  assert.equal(state.combat.hand.length, 4);
  assert.equal(state.combat.deck.length + state.combat.discard.length + state.combat.hand.length, 4);
  const saved = JSON.stringify(state);
  const loaded = JSON.parse(saved);
  assert.equal(saved, JSON.stringify(loaded));
  assert.equal(E.random(state), E.random(loaded));
  assert.equal(state.rngState, loaded.rngState);
});

test('victory opens three rewards and revives fallen heroes at one HP', () => {
  const state = combat();
  const enemy = onlyEnemy(state, 'sentry');
  const artificer = E.heroById(state, 'artificer');
  const scout = E.heroById(state, 'scout');
  scout.hp = 0;
  enemy.x = 1; enemy.y = 3; enemy.hp = 2;
  artificer.x = 0; artificer.y = 3;
  const card = give(state, 'bolt');
  assert.equal(E.playCard(state, card.uid, [{ kind: 'enemy', id: enemy.id }]).ok, true);
  assert.equal(state.screen, 'reward');
  assert.equal(state.reward.options.length, 3);
  assert.equal(scout.hp, 1);
});

test('all three heroes at zero HP causes defeat', () => {
  const state = combat();
  state.heroes.forEach(hero => { hero.hp = 0; });
  E.checkOutcome(state);
  assert.equal(state.screen, 'ending');
  assert.equal(state.ending.victory, false);
});

test('boss phase two begins at half HP without changing the current announced intent', () => {
  const state = E.createExpedition('boss');
  state.stage = 5;
  E.startNode(state, 'final');
  const boss = state.combat.enemies.find(enemy => enemy.type === 'boss');
  const intent = E.clone(state.combat.intents.find(item => item.enemyId === boss.id));
  boss.hp = 3;
  boss.x = 1; boss.y = 3;
  const artificer = E.heroById(state, 'artificer');
  artificer.x = 0; artificer.y = 3;
  const card = give(state, 'bolt');
  assert.equal(E.playCard(state, card.uid, [{ kind: 'enemy', id: boss.id }]).ok, true);
  assert.equal(state.combat.bossPhase, 2);
  assert.deepEqual(state.combat.intents.find(item => item.enemyId === boss.id), intent);
  E.endTurn(state);
  assert.equal(state.combat.intents.find(item => item.enemyId === boss.id).type, 'bossCross');
});

test('rest upgrades the selected card and advances exactly one stage', () => {
  const state = E.createExpedition('rest');
  const restNode = state.map.flat().find(node => node.type === 'rest');
  state.stage = restNode.stage;
  E.startNode(state, restNode.id);
  const id = state.rest.upgradeCardId;
  assert.equal(E.chooseRest(state, 'upgrade').ok, true);
  assert.equal(state.upgrades[id], 1);
  assert.equal(state.stage, restNode.stage + 1);
});
