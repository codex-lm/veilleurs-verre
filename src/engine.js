(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VeilleursEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WIDTH = 7;
  const HEIGHT = 5;
  const SAVE_VERSION = 1;
  const INITIAL_COLLECTION = [
    'bash', 'bash', 'safeguard', 'safeguard', 'edge', 'edge',
    'bolt', 'bolt', 'shatter', 'swap', 'resonance', 'vault'
  ];
  const CARD_ORDER = ['bash', 'safeguard', 'fortify', 'edge', 'vault', 'bolt', 'swap', 'shatter', 'resonance', 'mend'];
  const CARDS = {
    bash: { hero: 'guardian', cost: 1, range: 1, target: 'enemy', effect: 'bash', value: 2 },
    safeguard: { hero: 'guardian', cost: 1, range: 3, target: 'hero', effect: 'guard', value: 3 },
    fortify: { hero: 'guardian', cost: 2, range: 0, target: 'self', effect: 'fortify', value: 2 },
    edge: { hero: 'scout', cost: 1, range: 1, target: 'enemy', effect: 'edge', value: 3 },
    vault: { hero: 'scout', cost: 1, range: 3, target: 'cell', effect: 'vault', value: 0 },
    bolt: { hero: 'artificer', cost: 1, range: 4, target: 'enemy', effect: 'bolt', value: 2 },
    swap: { hero: 'artificer', cost: 1, range: 4, target: 'twoHeroes', effect: 'swap', value: 0 },
    shatter: { hero: 'artificer', cost: 2, range: 4, target: 'crystal', effect: 'shatter', value: 3 },
    resonance: { hero: 'artificer', cost: 1, range: 4, target: 'crystal', effect: 'resonance', value: 3 },
    mend: { hero: 'artificer', cost: 1, range: 3, target: 'hero', effect: 'mend', value: 3 }
  };
  const ENEMIES = {
    hound: { hp: 6, damage: 2, behavior: 'pursue' },
    sentry: { hp: 5, damage: 2, behavior: 'snipe' },
    ram: { hp: 8, damage: 3, behavior: 'charge' },
    weaver: { hp: 6, damage: 2, behavior: 'weave' },
    boss: { hp: 24, damage: 2, behavior: 'boss' }
  };
  const HEROES = [
    { id: 'guardian', maxHp: 14, x: 1, y: 2 },
    { id: 'scout', maxHp: 10, x: 0, y: 1 },
    { id: 'artificer', maxHp: 11, x: 0, y: 3 }
  ];
  const LAYOUTS = [
    {
      obstacles: [[3, 1], [3, 3]], crystals: [[3, 2]],
      hazards: [[4, 0], [4, 4], [5, 2]]
    },
    {
      obstacles: [[2, 0], [2, 3], [4, 1], [4, 4]], crystals: [[3, 2], [5, 3]],
      hazards: [[3, 0], [3, 4], [5, 1]]
    },
    {
      obstacles: [[2, 1], [2, 2], [4, 2], [4, 3]], crystals: [[3, 0], [3, 4]],
      hazards: [[3, 2], [5, 1], [5, 3]]
    }
  ];
  const SPAWNS = [[6, 2], [6, 0], [6, 4], [5, 1], [5, 3], [4, 0], [4, 4]];
  const ENCOUNTERS = [
    ['hound', 'hound', 'sentry'],
    ['ram', 'hound', 'sentry'],
    ['weaver', 'hound', 'sentry', 'ram'],
    ['ram', 'weaver', 'hound', 'sentry'],
    ['ram', 'ram', 'weaver', 'sentry', 'hound']
  ];
  const DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function inside(x, y) { return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT; }
  function distance(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
  function cellKey(x, y) { return `${x},${y}`; }
  function sameCell(a, b) { return a && b && a.x === b.x && a.y === b.y; }
  function hashSeed(input) {
    const text = String(input == null ? 'glass' : input);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) || 0x6d2b79f5;
  }
  function random(state) {
    let x = state.rngState >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    state.rngState = x >>> 0;
    return state.rngState / 4294967296;
  }
  function shuffle(state, array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random(state) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function aliveHeroes(state) { return state.heroes.filter(hero => hero.hp > 0); }
  function aliveEnemies(state) { return state.combat ? state.combat.enemies.filter(enemy => enemy.hp > 0) : []; }
  function heroById(state, id) { return state.heroes.find(hero => hero.id === id); }
  function enemyById(state, id) { return state.combat.enemies.find(enemy => enemy.id === id); }
  function crystalById(state, id) { return state.combat.crystals.find(crystal => crystal.id === id); }
  function unitAt(state, x, y, ignoreId) {
    const hero = state.heroes.find(item => item.hp > 0 && item.id !== ignoreId && item.x === x && item.y === y);
    if (hero) return hero;
    return aliveEnemies(state).find(item => item.id !== ignoreId && item.x === x && item.y === y) || null;
  }
  function obstacleAt(state, x, y) { return state.combat.obstacles.some(cell => cell.x === x && cell.y === y); }
  function crystalAt(state, x, y) { return state.combat.crystals.find(crystal => crystal.x === x && crystal.y === y) || null; }
  function hazardAt(state, x, y) { return state.combat.hazards.some(cell => cell.x === x && cell.y === y); }
  function blocked(state, x, y, ignoreId) {
    return !inside(x, y) || obstacleAt(state, x, y) || Boolean(crystalAt(state, x, y)) || Boolean(unitAt(state, x, y, ignoreId));
  }
  function plusCells(x, y) {
    return [{ x, y }, ...DIRECTIONS.map(([dx, dy]) => ({ x: x + dx, y: y + dy }))].filter(cell => inside(cell.x, cell.y));
  }
  function lineOfSight(state, from, to) {
    let x0 = from.x;
    let y0 = from.y;
    const x1 = to.x;
    const y1 = to.y;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    while (!(x0 === x1 && y0 === y1)) {
      const e2 = 2 * error;
      if (e2 >= dy) { error += dy; x0 += sx; }
      if (e2 <= dx) { error += dx; y0 += sy; }
      if (x0 === x1 && y0 === y1) break;
      if (obstacleAt(state, x0, y0) || crystalAt(state, x0, y0)) return false;
    }
    return true;
  }
  function reachable(state, unit, maxDistance) {
    const startKey = cellKey(unit.x, unit.y);
    const seen = new Map([[startKey, { x: unit.x, y: unit.y, path: [] }]]);
    const queue = [seen.get(startKey)];
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      if (current.path.length >= maxDistance) continue;
      for (const [dx, dy] of DIRECTIONS) {
        const x = current.x + dx;
        const y = current.y + dy;
        const key = cellKey(x, y);
        if (seen.has(key) || blocked(state, x, y, unit.id)) continue;
        const next = { x, y, path: [...current.path, { x, y }] };
        seen.set(key, next);
        queue.push(next);
      }
    }
    seen.delete(startKey);
    return [...seen.values()];
  }
  function approachPath(state, unit, target, maxDistance) {
    if (distance(unit, target) <= 1) return [];
    const queue = [{ x: unit.x, y: unit.y, path: [] }];
    const seen = new Set([cellKey(unit.x, unit.y)]);
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      for (const [dx, dy] of DIRECTIONS) {
        const x = current.x + dx;
        const y = current.y + dy;
        const key = cellKey(x, y);
        if (seen.has(key) || blocked(state, x, y, unit.id)) continue;
        const path = [...current.path, { x, y }];
        if (distance({ x, y }, target) === 1) return path.slice(0, maxDistance);
        seen.add(key);
        queue.push({ x, y, path });
      }
    }
    return [];
  }
  function createExpedition(seed) {
    const state = {
      version: SAVE_VERSION,
      seed: String(seed == null ? 'glass-01' : seed),
      rngState: 0,
      screen: 'map',
      stage: 0,
      route: [],
      currentNode: null,
      heroes: HEROES.map(hero => ({ ...hero, hp: hero.maxHp, guard: 0, moved: false })),
      collection: [...INITIAL_COLLECTION],
      upgrades: {},
      nextCardUid: 1,
      map: [],
      combat: null,
      reward: null,
      rest: null,
      event: null,
      ending: null,
      score: 0,
      stats: { turns: 0, cardsPlayed: 0, kills: 0, crystals: 0, damageTaken: 0, combats: 0 }
    };
    state.rngState = hashSeed(state.seed);
    const typeRows = [
      ['combat'],
      ['combat', 'rest'],
      ['event', 'combat'],
      ['rest', 'combat'],
      ['combat', 'event']
    ];
    for (let stage = 0; stage < 5; stage += 1) {
      const types = [...typeRows[stage]];
      if (types.length > 1 && random(state) > 0.5) types.reverse();
      state.map.push(types.map((type, lane) => ({
        id: `${stage}-${lane}`,
        stage,
        lane,
        type,
        layout: Math.floor(random(state) * LAYOUTS.length),
        difficulty: stage
      })));
    }
    return state;
  }
  function availableNodes(state) {
    if (state.screen !== 'map') return [];
    if (state.stage >= 5) return [{ id: 'final', stage: 5, lane: 0, type: 'final', layout: 2, difficulty: 5 }];
    return state.map[state.stage];
  }
  function makeDeck(state) {
    const cards = state.collection.map(id => ({ uid: `c${state.nextCardUid++}`, id }));
    return shuffle(state, cards);
  }
  function drawToFive(state) {
    const combat = state.combat;
    while (combat.hand.length < 5) {
      if (!combat.deck.length) {
        if (!combat.discard.length) break;
        combat.deck = combat.discard.splice(0);
        shuffle(state, combat.deck);
        combat.log.push({ type: 'reshuffle' });
      }
      combat.hand.push(combat.deck.pop());
    }
  }
  function createIntents(state) {
    const combat = state.combat;
    const intents = [];
    for (const enemy of aliveEnemies(state)) {
      const def = ENEMIES[enemy.type];
      const heroes = aliveHeroes(state).slice().sort((a, b) => distance(enemy, a) - distance(enemy, b) || a.id.localeCompare(b.id));
      if (!heroes.length) continue;
      const target = heroes[0];
      let intent = null;
      if (def.behavior === 'pursue') {
        if (distance(enemy, target) === 1) {
          intent = { type: 'attack', area: [{ x: target.x, y: target.y }], damage: def.damage };
        } else {
          const path = approachPath(state, enemy, target, 2);
          intent = { type: 'move', path, destination: path.length ? path[path.length - 1] : { x: enemy.x, y: enemy.y } };
        }
      } else if (def.behavior === 'snipe') {
        if (distance(enemy, target) <= 5 && lineOfSight(state, enemy, target)) {
          intent = { type: 'attack', area: [{ x: target.x, y: target.y }], damage: def.damage };
        } else {
          const path = approachPath(state, enemy, target, 1);
          intent = { type: 'move', path, destination: path.length ? path[path.length - 1] : { x: enemy.x, y: enemy.y } };
        }
      } else if (def.behavior === 'charge') {
        const aligned = (enemy.x === target.x || enemy.y === target.y) && distance(enemy, target) <= 4 && lineOfSight(state, enemy, target);
        if (aligned) {
          const path = [];
          let x = enemy.x;
          let y = enemy.y;
          while (x !== target.x || y !== target.y) {
            if (x !== target.x) x += Math.sign(target.x - x);
            else y += Math.sign(target.y - y);
            path.push({ x, y });
          }
          intent = { type: 'charge', path, area: path, target: { x: target.x, y: target.y }, damage: def.damage };
        } else {
          const path = approachPath(state, enemy, target, 1);
          intent = { type: 'move', path, destination: path.length ? path[path.length - 1] : { x: enemy.x, y: enemy.y } };
        }
      } else if (def.behavior === 'weave') {
        const wounded = aliveEnemies(state).filter(item => item.hp < item.maxHp).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp) || a.id.localeCompare(b.id));
        if (combat.turn % 2 === 0 && wounded.length) {
          intent = { type: 'heal', targetEnemyId: wounded[0].id, amount: 3 };
        } else {
          const center = aliveHeroes(state).slice().sort((a, b) => {
            const aCount = aliveHeroes(state).filter(hero => distance(a, hero) <= 1).length;
            const bCount = aliveHeroes(state).filter(hero => distance(b, hero) <= 1).length;
            return bCount - aCount || distance(enemy, a) - distance(enemy, b) || a.id.localeCompare(b.id);
          })[0];
          intent = { type: 'attack', area: plusCells(center.x, center.y), damage: def.damage, center: { x: center.x, y: center.y } };
        }
      } else if (def.behavior === 'boss') {
        const rowTarget = aliveHeroes(state).slice().sort((a, b) => {
          const aCount = aliveHeroes(state).filter(hero => hero.y === a.y).length;
          const bCount = aliveHeroes(state).filter(hero => hero.y === b.y).length;
          return bCount - aCount || a.id.localeCompare(b.id);
        })[0];
        if (combat.bossPhase === 2) {
          const area = [];
          for (let x = 0; x < WIDTH; x += 1) area.push({ x, y: rowTarget.y });
          for (let y = 0; y < HEIGHT; y += 1) if (y !== rowTarget.y) area.push({ x: rowTarget.x, y });
          intent = { type: 'bossCross', area, damage: 3, center: { x: rowTarget.x, y: rowTarget.y } };
        } else if (combat.turn % 2 === 1) {
          intent = { type: 'bossRow', area: Array.from({ length: WIDTH }, (_, x) => ({ x, y: rowTarget.y })), damage: 2, center: { x: rowTarget.x, y: rowTarget.y } };
        } else {
          intent = { type: 'attack', area: plusCells(rowTarget.x, rowTarget.y), damage: 2, center: { x: rowTarget.x, y: rowTarget.y } };
        }
      }
      if (intent) intents.push({ id: `${enemy.id}-t${combat.turn}`, enemyId: enemy.id, ...intent });
    }
    combat.intents = intents;
  }
  function setupCombat(state, node) {
    const combat = {
      nodeId: node.id,
      final: node.type === 'final',
      layout: node.layout,
      turn: 1,
      energy: 3,
      deck: [],
      hand: [],
      discard: [],
      enemies: [],
      obstacles: [],
      crystals: [],
      hazards: [],
      intents: [],
      bossPhase: 1,
      log: []
    };
    state.combat = combat;
    const layout = LAYOUTS[node.layout];
    combat.obstacles = layout.obstacles.map(([x, y]) => ({ x, y }));
    combat.crystals = layout.crystals.map(([x, y], index) => ({ id: `crystal-${index}`, x, y }));
    combat.hazards = layout.hazards.map(([x, y]) => ({ x, y }));
    state.heroes.forEach((hero, index) => {
      hero.x = HEROES[index].x;
      hero.y = HEROES[index].y;
      hero.guard = 0;
      hero.moved = false;
    });
    const types = node.type === 'final' ? ['boss', 'hound'] : ENCOUNTERS[node.difficulty];
    let spawnIndex = 0;
    types.forEach((type, index) => {
      while (spawnIndex < SPAWNS.length) {
        const [x, y] = SPAWNS[spawnIndex++];
        if (!blocked(state, x, y)) {
          const def = ENEMIES[type];
          combat.enemies.push({ id: `e${index + 1}`, type, x, y, hp: def.hp, maxHp: def.hp });
          break;
        }
      }
    });
    combat.deck = makeDeck(state);
    drawToFive(state);
    createIntents(state);
    state.screen = 'combat';
    state.stats.combats += 1;
    combat.log.push({ type: node.type === 'final' ? 'bossStart' : 'combatStart' });
  }
  function startNode(state, nodeId) {
    const node = availableNodes(state).find(item => item.id === nodeId);
    if (!node) return { ok: false, error: 'invalidNode' };
    state.currentNode = { ...node };
    state.reward = null;
    state.rest = null;
    state.event = null;
    state.ending = null;
    if (node.type === 'combat' || node.type === 'final') setupCombat(state, node);
    else if (node.type === 'rest') {
      const candidates = upgradeCandidates(state);
      state.rest = { heal: 6, upgradeCardId: candidates.length ? candidates[Math.floor(random(state) * candidates.length)] : 'bash' };
      state.screen = 'rest';
    } else {
      const newCardId = CARD_ORDER[Math.floor(random(state) * CARD_ORDER.length)];
      state.event = { newCardId, cost: 1, heal: 4 };
      state.screen = 'event';
    }
    return { ok: true };
  }
  function incomingAt(state, x, y) {
    if (!state.combat) return 0;
    return state.combat.intents.reduce((total, intent) => {
      const enemy = enemyById(state, intent.enemyId);
      if (!enemy || enemy.hp <= 0 || !intent.damage) return total;
      return total + ((intent.area || []).some(cell => cell.x === x && cell.y === y) ? intent.damage : 0);
    }, 0);
  }
  function damageHero(state, hero, amount, source) {
    if (!hero || hero.hp <= 0 || amount <= 0) return { hpLost: 0, absorbed: 0 };
    const absorbed = Math.min(hero.guard, amount);
    hero.guard -= absorbed;
    const hpLost = Math.min(hero.hp, amount - absorbed);
    hero.hp -= hpLost;
    state.stats.damageTaken += hpLost;
    if (source) state.combat.log.push({ type: 'heroHit', heroId: hero.id, amount: hpLost, absorbed, source });
    return { hpLost, absorbed };
  }
  function damageEnemy(state, enemy, amount, source) {
    if (!enemy || enemy.hp <= 0 || amount <= 0) return { hpLost: 0 };
    const hpLost = Math.min(enemy.hp, amount);
    enemy.hp -= hpLost;
    state.combat.log.push({ type: 'enemyHit', enemyId: enemy.id, amount: hpLost, source });
    if (enemy.hp === 0) {
      state.stats.kills += 1;
      state.score += 20;
      state.combat.log.push({ type: 'enemyDown', enemyId: enemy.id });
    }
    return { hpLost };
  }
  function enterCell(state, unit, isHero) {
    if (!hazardAt(state, unit.x, unit.y) || unit.hp <= 0) return;
    if (isHero) damageHero(state, unit, 2, 'thorns');
    else damageEnemy(state, unit, 2, 'thorns');
    state.combat.log.push({ type: 'thorns', unitId: unit.id });
  }
  function checkOutcome(state) {
    if (!state.combat || state.screen !== 'combat') return true;
    if (!aliveHeroes(state).length) {
      state.screen = 'ending';
      state.ending = { victory: false, reason: 'shattered' };
      return true;
    }
    if (!aliveEnemies(state).length) {
      const final = state.combat.final;
      state.stats.turns += state.combat.turn;
      state.score += final ? 500 : 100;
      if (final) {
        state.screen = 'ending';
        state.ending = { victory: true, reason: 'lighthouse' };
      } else {
        state.heroes.forEach(hero => { if (hero.hp <= 0) hero.hp = 1; hero.guard = 0; });
        state.reward = makeRewards(state);
        state.screen = 'reward';
      }
      return true;
    }
    return false;
  }
  function updateBossPhase(state) {
    const combat = state.combat;
    if (!combat || !combat.final || combat.bossPhase === 2) return;
    const boss = combat.enemies.find(enemy => enemy.type === 'boss');
    if (boss && boss.hp > 0 && boss.hp <= Math.ceil(boss.maxHp / 2)) {
      combat.bossPhase = 2;
      combat.log.push({ type: 'bossPhase', phase: 2 });
    }
  }
  function getMoveTargets(state, heroId) {
    const hero = heroById(state, heroId);
    if (state.screen !== 'combat' || !hero || hero.hp <= 0 || hero.moved) return [];
    return reachable(state, hero, 2).map(cell => ({ kind: 'cell', x: cell.x, y: cell.y }));
  }
  function moveHero(state, heroId, target) {
    if (state.screen !== 'combat') return { ok: false, error: 'notCombat' };
    const hero = heroById(state, heroId);
    if (!hero || hero.hp <= 0 || hero.moved) return { ok: false, error: 'moveUsed' };
    const legal = getMoveTargets(state, heroId).some(cell => sameCell(cell, target));
    if (!legal) return { ok: false, error: 'invalidMove' };
    const from = { x: hero.x, y: hero.y };
    hero.x = target.x;
    hero.y = target.y;
    hero.moved = true;
    enterCell(state, hero, true);
    state.combat.log.push({ type: 'move', heroId, from, to: { x: hero.x, y: hero.y } });
    checkOutcome(state);
    return { ok: true };
  }
  function cardLevel(state, cardId) { return state.upgrades[cardId] || 0; }
  function cardInfo(state, cardId) {
    const def = CARDS[cardId];
    const level = cardLevel(state, cardId);
    return { ...def, id: cardId, level, value: def.value + (['vault', 'swap'].includes(cardId) ? 0 : level), range: def.range + (['vault', 'swap'].includes(cardId) ? level : 0) };
  }
  function targetEntity(state, target) {
    if (!target) return null;
    if (target.kind === 'hero') return heroById(state, target.id);
    if (target.kind === 'enemy') return enemyById(state, target.id);
    if (target.kind === 'crystal') return crystalById(state, target.id);
    return target.kind === 'cell' ? target : null;
  }
  function validTarget(state, card, targets) {
    const actor = heroById(state, card.hero);
    const target = targetEntity(state, targets[0]);
    if (!actor || actor.hp <= 0 || !target) return false;
    if (card.target === 'self') return target.id === actor.id;
    if (card.target === 'twoHeroes') {
      const second = targetEntity(state, targets[1]);
      if (!second || second.id === target.id || target.hp <= 0 || second.hp <= 0) return false;
      return distance(actor, target) <= card.range && distance(actor, second) <= card.range;
    }
    if (target.hp !== undefined && target.hp <= 0) return false;
    if (distance(actor, target) > card.range) return false;
    if (card.effect === 'bolt' && !lineOfSight(state, actor, target)) return false;
    if (card.target === 'enemy') return target.kind === undefined && Boolean(enemyById(state, target.id));
    if (card.target === 'hero') return Boolean(heroById(state, target.id));
    if (card.target === 'crystal') return Boolean(crystalById(state, target.id));
    if (card.target === 'cell') return !blocked(state, target.x, target.y);
    return false;
  }
  function getCardTargets(state, uid, selected) {
    if (state.screen !== 'combat') return [];
    const instance = state.combat.hand.find(card => card.uid === uid);
    if (!instance) return [];
    const card = cardInfo(state, instance.id);
    const actor = heroById(state, card.hero);
    const first = selected && selected[0];
    if (!actor || actor.hp <= 0 || state.combat.energy < card.cost) return [];
    if (card.target === 'twoHeroes' && first) {
      return aliveHeroes(state).filter(hero => hero.id !== first.id && distance(actor, hero) <= card.range).map(hero => ({ kind: 'hero', id: hero.id }));
    }
    if (card.target === 'enemy') return aliveEnemies(state).filter(enemy => distance(actor, enemy) <= card.range && (card.effect !== 'bolt' || lineOfSight(state, actor, enemy))).map(enemy => ({ kind: 'enemy', id: enemy.id }));
    if (card.target === 'hero' || card.target === 'self') return aliveHeroes(state).filter(hero => (card.target !== 'self' || hero.id === actor.id) && distance(actor, hero) <= card.range).map(hero => ({ kind: 'hero', id: hero.id }));
    if (card.target === 'crystal') return state.combat.crystals.filter(crystal => distance(actor, crystal) <= card.range).map(crystal => ({ kind: 'crystal', id: crystal.id }));
    if (card.target === 'cell') {
      const cells = [];
      for (let y = 0; y < HEIGHT; y += 1) for (let x = 0; x < WIDTH; x += 1) {
        if (distance(actor, { x, y }) <= card.range && !blocked(state, x, y)) cells.push({ kind: 'cell', x, y });
      }
      return cells;
    }
    return [];
  }
  function playCard(state, uid, targets) {
    if (state.screen !== 'combat') return { ok: false, error: 'notCombat' };
    const combat = state.combat;
    const handIndex = combat.hand.findIndex(card => card.uid === uid);
    if (handIndex < 0) return { ok: false, error: 'cardMissing' };
    const instance = combat.hand[handIndex];
    const card = cardInfo(state, instance.id);
    if (combat.energy < card.cost) return { ok: false, error: 'energy' };
    if (!validTarget(state, card, targets || [])) return { ok: false, error: 'invalidTarget' };
    const actor = heroById(state, card.hero);
    const target = targetEntity(state, targets[0]);
    combat.energy -= card.cost;
    combat.hand.splice(handIndex, 1);
    combat.discard.push(instance);
    state.stats.cardsPlayed += 1;
    if (card.effect === 'bash') {
      damageEnemy(state, target, card.value, card.id);
      if (target.hp > 0) {
        const dx = Math.sign(target.x - actor.x);
        const dy = Math.sign(target.y - actor.y);
        const destination = { x: target.x + dx, y: target.y + dy };
        if (!blocked(state, destination.x, destination.y, target.id)) {
          target.x = destination.x;
          target.y = destination.y;
          combat.log.push({ type: 'push', enemyId: target.id, to: destination });
          enterCell(state, target, false);
        }
      }
    } else if (card.effect === 'guard') {
      target.guard += card.value;
      combat.log.push({ type: 'guard', heroId: target.id, amount: card.value });
    } else if (card.effect === 'fortify') {
      aliveHeroes(state).forEach(hero => { hero.guard += card.value; });
      combat.log.push({ type: 'fortify', amount: card.value });
    } else if (card.effect === 'edge') {
      const isolated = !aliveEnemies(state).some(enemy => enemy.id !== target.id && distance(enemy, target) === 1);
      damageEnemy(state, target, card.value + (isolated ? 2 : 0), card.id);
      combat.log.push({ type: 'edge', enemyId: target.id, isolated });
    } else if (card.effect === 'vault') {
      actor.x = target.x;
      actor.y = target.y;
      enterCell(state, actor, true);
      combat.log.push({ type: 'vault', heroId: actor.id, to: { x: actor.x, y: actor.y } });
    } else if (card.effect === 'bolt') {
      damageEnemy(state, target, card.value, card.id);
    } else if (card.effect === 'swap') {
      const second = targetEntity(state, targets[1]);
      const position = { x: target.x, y: target.y };
      target.x = second.x; target.y = second.y;
      second.x = position.x; second.y = position.y;
      enterCell(state, target, true);
      enterCell(state, second, true);
      combat.log.push({ type: 'swap', heroIds: [target.id, second.id] });
    } else if (card.effect === 'shatter') {
      const center = { x: target.x, y: target.y };
      combat.crystals = combat.crystals.filter(crystal => crystal.id !== target.id);
      aliveEnemies(state).filter(enemy => distance(enemy, center) <= 1).forEach(enemy => damageEnemy(state, enemy, card.value, card.id));
      aliveHeroes(state).filter(hero => distance(hero, center) <= 1).forEach(hero => damageHero(state, hero, card.value, card.id));
      state.stats.crystals += 1;
      combat.log.push({ type: 'shatter', center });
    } else if (card.effect === 'resonance') {
      const center = { x: target.x, y: target.y };
      const radius = card.value;
      const attracted = aliveEnemies(state).filter(enemy => distance(enemy, center) <= radius && distance(enemy, center) > 1);
      attracted.forEach(enemy => {
        const path = approachPath(state, enemy, center, 2);
        path.forEach(cell => {
          if (enemy.hp > 0 && !blocked(state, cell.x, cell.y, enemy.id)) {
            enemy.x = cell.x; enemy.y = cell.y;
            enterCell(state, enemy, false);
          }
        });
      });
      combat.log.push({ type: 'resonance', center, enemyIds: attracted.map(enemy => enemy.id) });
    } else if (card.effect === 'mend') {
      const healed = Math.min(card.value, target.maxHp - target.hp);
      target.hp += healed;
      combat.log.push({ type: 'mend', heroId: target.id, amount: healed });
    }
    updateBossPhase(state);
    checkOutcome(state);
    return { ok: true, cardId: card.id };
  }
  function diffPreview(before, after) {
    const heroes = after.heroes.map(hero => {
      const old = before.heroes.find(item => item.id === hero.id);
      return { id: hero.id, hpBefore: old.hp, hpAfter: hero.hp, guardBefore: old.guard, guardAfter: hero.guard, from: { x: old.x, y: old.y }, to: { x: hero.x, y: hero.y } };
    });
    const enemies = after.combat ? after.combat.enemies.map(enemy => {
      const old = before.combat.enemies.find(item => item.id === enemy.id);
      return { id: enemy.id, hpBefore: old.hp, hpAfter: enemy.hp, from: { x: old.x, y: old.y }, to: { x: enemy.x, y: enemy.y } };
    }) : [];
    return { heroes, enemies, energyAfter: after.combat ? after.combat.energy : 0 };
  }
  function previewMove(state, heroId, target) {
    const before = clone(state);
    const after = clone(state);
    const result = moveHero(after, heroId, target);
    if (!result.ok) return result;
    return { ...result, kind: 'move', heroId, target, changes: diffPreview(before, after), incomingBefore: incomingAt(before, heroById(before, heroId).x, heroById(before, heroId).y), incomingAfter: incomingAt(before, target.x, target.y) };
  }
  function previewCard(state, uid, targets) {
    const before = clone(state);
    const after = clone(state);
    const result = playCard(after, uid, targets);
    if (!result.ok) return result;
    return { ...result, kind: 'card', uid, targets, changes: diffPreview(before, after), isolated: result.cardId === 'edge' && !aliveEnemies(before).some(enemy => enemy.id !== targets[0].id && distance(enemy, enemyById(before, targets[0].id)) === 1) };
  }
  function executeMoveIntent(state, enemy, intent) {
    for (const cell of intent.path || []) {
      if (enemy.hp <= 0 || blocked(state, cell.x, cell.y, enemy.id)) break;
      enemy.x = cell.x;
      enemy.y = cell.y;
      enterCell(state, enemy, false);
    }
  }
  function executeIntents(state) {
    const combat = state.combat;
    for (const intent of combat.intents) {
      const enemy = enemyById(state, intent.enemyId);
      if (!enemy || enemy.hp <= 0) continue;
      if (intent.type === 'move' || intent.type === 'charge') executeMoveIntent(state, enemy, intent);
      if (enemy.hp <= 0) continue;
      if (intent.damage) {
        for (const hero of aliveHeroes(state)) {
          if (intent.area.some(cell => cell.x === hero.x && cell.y === hero.y)) damageHero(state, hero, intent.damage, intent.type);
        }
        combat.log.push({ type: 'enemyAction', enemyId: enemy.id, intentType: intent.type });
      } else if (intent.type === 'heal') {
        const target = enemyById(state, intent.targetEnemyId);
        if (target && target.hp > 0) {
          const amount = Math.min(intent.amount, target.maxHp - target.hp);
          target.hp += amount;
          combat.log.push({ type: 'enemyHeal', enemyId: target.id, amount });
        }
      }
    }
  }
  function endTurn(state) {
    if (state.screen !== 'combat') return { ok: false, error: 'notCombat' };
    const combat = state.combat;
    combat.discard.push(...combat.hand.splice(0));
    executeIntents(state);
    if (checkOutcome(state)) return { ok: true };
    combat.turn += 1;
    combat.energy = 3;
    state.heroes.forEach(hero => { hero.moved = false; hero.guard = 0; });
    drawToFive(state);
    createIntents(state);
    combat.log.push({ type: 'turn', turn: combat.turn });
    return { ok: true };
  }
  function upgradeCandidates(state) {
    return [...new Set(state.collection)].filter(id => cardLevel(state, id) < 2).sort();
  }
  function makeRewards(state) {
    const newCardId = CARD_ORDER[Math.floor(random(state) * CARD_ORDER.length)];
    const candidates = upgradeCandidates(state);
    const upgradeCardId = candidates.length ? candidates[Math.floor(random(state) * candidates.length)] : 'bash';
    return {
      options: [
        { id: `new:${newCardId}`, kind: 'new', cardId: newCardId },
        { id: `upgrade:${upgradeCardId}`, kind: 'upgrade', cardId: upgradeCardId },
        { id: 'heal', kind: 'heal', amount: 4 }
      ]
    };
  }
  function completeNode(state) {
    state.route.push({ id: state.currentNode.id, type: state.currentNode.type });
    state.stage += 1;
    state.currentNode = null;
    state.combat = null;
    state.reward = null;
    state.rest = null;
    state.event = null;
    state.screen = 'map';
    state.heroes.forEach(hero => { hero.guard = 0; hero.moved = false; });
  }
  function chooseReward(state, optionId) {
    if (state.screen !== 'reward' || !state.reward) return { ok: false, error: 'notReward' };
    const option = state.reward.options.find(item => item.id === optionId);
    if (!option) return { ok: false, error: 'invalidReward' };
    if (option.kind === 'new') state.collection.push(option.cardId);
    else if (option.kind === 'upgrade') {
      if (cardLevel(state, option.cardId) >= 2) return { ok: false, error: 'maxUpgrade' };
      state.upgrades[option.cardId] = cardLevel(state, option.cardId) + 1;
    } else state.heroes.forEach(hero => { hero.hp = Math.min(hero.maxHp, hero.hp + option.amount); });
    completeNode(state);
    return { ok: true };
  }
  function chooseRest(state, choice) {
    if (state.screen !== 'rest' || !state.rest) return { ok: false, error: 'notRest' };
    if (choice === 'heal') state.heroes.forEach(hero => { hero.hp = Math.min(hero.maxHp, hero.hp + state.rest.heal); });
    else if (choice === 'upgrade') {
      const id = state.rest.upgradeCardId;
      if (cardLevel(state, id) >= 2) return { ok: false, error: 'maxUpgrade' };
      state.upgrades[id] = cardLevel(state, id) + 1;
    } else return { ok: false, error: 'invalidRest' };
    completeNode(state);
    return { ok: true };
  }
  function chooseEvent(state, choice) {
    if (state.screen !== 'event' || !state.event) return { ok: false, error: 'notEvent' };
    if (choice === 'salvage') {
      state.heroes.forEach(hero => { hero.hp = Math.max(1, hero.hp - state.event.cost); });
      state.collection.push(state.event.newCardId);
    } else if (choice === 'heal') state.heroes.forEach(hero => { hero.hp = Math.min(hero.maxHp, hero.hp + state.event.heal); });
    else return { ok: false, error: 'invalidEvent' };
    completeNode(state);
    return { ok: true };
  }
  function applyAction(state, action) {
    if (!action) return { ok: false, error: 'noAction' };
    if (action.type === 'startNode') return startNode(state, action.nodeId);
    if (action.type === 'card') return playCard(state, action.uid, action.targets);
    if (action.type === 'move') return moveHero(state, action.heroId, action.target);
    if (action.type === 'endTurn') return endTurn(state);
    if (action.type === 'reward') return chooseReward(state, action.optionId);
    if (action.type === 'rest') return chooseRest(state, action.choice);
    if (action.type === 'event') return chooseEvent(state, action.choice);
    return { ok: false, error: 'unknownAction' };
  }
  function bestCardAction(state, predicate) {
    const candidates = [];
    for (const instance of state.combat.hand) {
      const card = cardInfo(state, instance.id);
      if (state.combat.energy < card.cost || (predicate && !predicate(card))) continue;
      for (const target of getCardTargets(state, instance.uid)) {
        const targets = card.target === 'twoHeroes' ? [target, ...[]] : [target];
        if (card.target === 'twoHeroes') continue;
        const preview = previewCard(state, instance.uid, targets);
        if (!preview.ok) continue;
        const enemyLoss = preview.changes.enemies.reduce((sum, enemy) => sum + enemy.hpBefore - enemy.hpAfter, 0);
        const heroLoss = preview.changes.heroes.reduce((sum, hero) => sum + hero.hpBefore - hero.hpAfter, 0);
        const kills = preview.changes.enemies.filter(enemy => enemy.hpBefore > 0 && enemy.hpAfter === 0).length;
        const moved = preview.changes.enemies.some(enemy => !sameCell(enemy.from, enemy.to));
        candidates.push({ action: { type: 'card', uid: instance.uid, targets }, card, enemyLoss, heroLoss, kills, moved, preview });
      }
    }
    return candidates;
  }
  function autoAction(state) {
    if (state.screen === 'map') {
      const nodes = availableNodes(state);
      const missing = state.heroes.reduce((sum, hero) => sum + hero.maxHp - hero.hp, 0);
      let node = nodes.find(item => item.type === 'final');
      if (!node && missing >= 12) node = nodes.find(item => item.type === 'rest');
      if (!node) node = nodes.find(item => item.type === 'combat') || nodes.find(item => item.type === 'event') || nodes[0];
      return { type: 'startNode', nodeId: node.id };
    }
    if (state.screen === 'reward') {
      const missing = state.heroes.reduce((sum, hero) => sum + hero.maxHp - hero.hp, 0);
      const option = missing >= 8 ? state.reward.options.find(item => item.kind === 'heal') : state.reward.options.find(item => item.kind === 'upgrade') || state.reward.options[0];
      return { type: 'reward', optionId: option.id };
    }
    if (state.screen === 'rest') {
      const missing = state.heroes.reduce((sum, hero) => sum + hero.maxHp - hero.hp, 0);
      return { type: 'rest', choice: missing >= 5 ? 'heal' : 'upgrade' };
    }
    if (state.screen === 'event') return { type: 'event', choice: 'salvage' };
    if (state.screen !== 'combat') return null;
    const combat = state.combat;
    const shatters = bestCardAction(state, card => card.id === 'shatter').filter(item => item.heroLoss === 0 && (item.enemyLoss >= 4 || combat.turn > 6)).sort((a, b) => (b.enemyLoss + b.kills * 5) - (a.enemyLoss + a.kills * 5));
    if (shatters.length) return shatters[0].action;
    const hasShatter = combat.hand.some(card => card.id === 'shatter');
    if (hasShatter && combat.energy >= 3) {
      const resonance = bestCardAction(state, card => card.id === 'resonance').find(item => item.moved);
      if (resonance) return resonance.action;
    }
    const attacks = bestCardAction(state, card => ['bash', 'edge', 'bolt'].includes(card.id)).sort((a, b) => {
      const aScore = a.enemyLoss + a.kills * 8 + (a.moved ? 1 : 0) - a.heroLoss * 3 - a.card.cost * 0.1;
      const bScore = b.enemyLoss + b.kills * 8 + (b.moved ? 1 : 0) - b.heroLoss * 3 - b.card.cost * 0.1;
      return bScore - aScore;
    });
    if (attacks.length && attacks[0].enemyLoss > 0) return attacks[0].action;
    const threatened = aliveHeroes(state).filter(hero => incomingAt(state, hero.x, hero.y) > hero.guard).sort((a, b) => incomingAt(state, b.x, b.y) - incomingAt(state, a.x, a.y));
    if (threatened.length) {
      const guards = bestCardAction(state, card => card.id === 'safeguard' && threatened.some(hero => hero.id === card.hero || true));
      const useful = guards.filter(item => threatened.some(hero => hero.id === item.action.targets[0].id)).sort((a, b) => {
        const aTarget = targetEntity(state, a.action.targets[0]);
        const bTarget = targetEntity(state, b.action.targets[0]);
        return incomingAt(state, bTarget.x, bTarget.y) - incomingAt(state, aTarget.x, aTarget.y);
      });
      if (useful.length) return useful[0].action;
      if (threatened.reduce((sum, hero) => sum + incomingAt(state, hero.x, hero.y), 0) >= 4) {
        const fortify = bestCardAction(state, card => card.id === 'fortify')[0];
        if (fortify) return fortify.action;
      }
      const scout = heroById(state, 'scout');
      if (scout.hp > 0 && incomingAt(state, scout.x, scout.y) > 0) {
        const vaults = bestCardAction(state, card => card.id === 'vault').filter(item => incomingAt(state, item.action.targets[0].x, item.action.targets[0].y) === 0 && item.heroLoss === 0);
        if (vaults.length) return vaults[0].action;
      }
    }
    const wounded = aliveHeroes(state).filter(hero => hero.maxHp - hero.hp >= 3);
    if (wounded.length) {
      const mend = bestCardAction(state, card => card.id === 'mend').find(item => wounded.some(hero => hero.id === item.action.targets[0].id));
      if (mend) return mend.action;
    }
    const moveCandidates = [];
    for (const hero of aliveHeroes(state)) {
      if (hero.moved) continue;
      const moves = getMoveTargets(state, hero.id);
      if (!moves.length) continue;
      const enemies = aliveEnemies(state);
      const currentRisk = incomingAt(state, hero.x, hero.y);
      const riskWeight = combat.turn > 8 ? 1 : 8;
      const canShoot = position => {
        const original = { x: hero.x, y: hero.y };
        hero.x = position.x; hero.y = position.y;
        const result = enemies.some(enemy => distance(hero, enemy) <= 4 && lineOfSight(state, hero, enemy));
        hero.x = original.x; hero.y = original.y;
        return result;
      };
      const scored = moves.map(target => {
        const risk = incomingAt(state, target.x, target.y);
        const nearest = Math.min(...enemies.map(enemy => distance(target, enemy)));
        let score = risk * riskWeight;
        if (hero.id === 'artificer') score += Math.abs(nearest - 3) * 2 + (canShoot(target) ? 0 : 10);
        else score += nearest * 3;
        if (hazardAt(state, target.x, target.y)) score += 50;
        return { target, score, risk };
      }).sort((a, b) => a.score - b.score || a.target.y - b.target.y || a.target.x - b.target.x);
      const currentNearest = Math.min(...enemies.map(enemy => distance(hero, enemy)));
      const currentScore = currentRisk * riskWeight + (hero.id === 'artificer' ? Math.abs(currentNearest - 3) * 2 + (canShoot(hero) ? 0 : 10) : currentNearest * 3);
      if (scored[0] && (scored[0].score < currentScore || scored[0].risk < currentRisk)) {
        moveCandidates.push({ action: { type: 'move', heroId: hero.id, target: scored[0].target }, improvement: currentScore - scored[0].score });
      }
    }
    moveCandidates.sort((a, b) => b.improvement - a.improvement);
    return moveCandidates.length ? moveCandidates[0].action : { type: 'endTurn' };
  }

  return {
    WIDTH, HEIGHT, SAVE_VERSION, CARDS, CARD_ORDER, ENEMIES, HEROES, LAYOUTS, INITIAL_COLLECTION,
    clone, inside, distance, cellKey, hashSeed, random, shuffle, aliveHeroes, aliveEnemies,
    heroById, enemyById, crystalById, unitAt, obstacleAt, crystalAt, hazardAt, blocked,
    lineOfSight, reachable, createExpedition, availableNodes, startNode, setupCombat,
    drawToFive, createIntents, incomingAt, getMoveTargets, moveHero, cardInfo,
    getCardTargets, playCard, previewCard, previewMove, endTurn, chooseReward,
    chooseRest, chooseEvent, makeRewards, checkOutcome, autoAction, applyAction
  };
});
