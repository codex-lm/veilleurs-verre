# The Glass Wardens · Les Veilleurs de Verre

A complete, deterministic tactical card expedition for the browser. Guide the Guardian, Scout and Artificer through five branching steps, then defeat the Dark Warden beneath the lighthouse. English is the default; French and Spanish are included.

## Play

The committed `index.html` is the self-contained playable export. It has no runtime dependencies, remote assets, account, service worker or network calls.

```sh
python -m http.server 8080
```

Open `http://localhost:8080`. The `main` branch is the directly playable LOB7 export and needs no build.

The [`development` branch](https://github.com/codex-lm/veilleurs-verre/tree/development) retains the complete build and browser-check tooling, including `build.py`, `art/render_cover.py` and `scripts/browser_check.py`. To rebuild and run all checks from that branch:

```sh
git checkout development
python build.py
node --check src/engine.js
node --check src/game.js
node --test tests/*.test.js
python scripts/browser_check.py
```

On this export branch, the engine and integration tests remain runnable with `node --test tests/*.test.js`.

`?seed=first-light` selects a reproducible expedition when starting a new game. `?autoplay=1&seed=first-light` watches the built-in guide play through the ordinary public game actions, without changing health, draws, enemies or rewards. The guide is a testing and demonstration aid, not a claim of human play.

## Rules

### Your turn

- The board is **7 × 5 cells**. Enemy intents are generated and locked before you act.
- Each living hero may make **one free move of up to two reachable cells**. Stone, units and crystals block movement.
- You share **3 energy** and draw up to **five cards**. Cards cost 1 or 2 energy and name their hero, range, target and effect.
- Select a hero or card, then a highlighted target. The preview shows deterministic HP, Guard, movement and energy results. Nothing is committed until confirmation; cancel is always available before then.
- End the turn to execute the shown enemy intents in order. Unused cards enter the discard. When a draw requires it, the discard is shuffled into the draw pile.

A cell attack strikes **that exact cell**, even if its original target moved. Move and charge intents follow their shown path and stop if blocked. Enemy healing never switches targets. Moving, pushing or resonating never quietly rewrites an announced attack.

### Team and combinations

- **Guardian** — Shield Bash damages and pushes; Safeguard protects an ally; Luminous Bulwark protects the team.
- **Scout** — Glass Edge gains +2 damage against an isolated enemy; Prism Vault is an extra leap.
- **Artificer** — Prism Bolt fires at range with line of sight; Transposition swaps allies; Shatter detonates a crystal; Resonant Call draws nearby enemies toward it; Mending Light heals.

Stone blocks movement and line of sight. Volatile crystals block their cell until destroyed. Shatter damages **both teams** in the crystal's cell and its four adjacent cells. Glass thorns deal 2 damage on entry to either team. Guard absorbs damage during the coming enemy turn, then expires.

The starting deck contains **12 cards** across eight of the ten card types. Fortify and Mending Light can join through rewards. Upgrades strengthen every copy of a card, up to level 2.

### Expedition

Choose one node at each of five steps: combat, rest or event. Combat rewards offer a new card, an upgrade or healing. Rest offers healing or an upgrade. The event trades a small amount of health for a card, or provides healing.

Wounds persist. Fallen heroes return at 1 HP after a won non-final encounter; the expedition ends if all three shatter. After step five, the final boss changes at half health from row beams and bursts to an announced row-and-column attack dealing 3 damage. Its current intent never changes during the transition.

Victory and defeat screens offer a fresh expedition or the same seed. Routes, rewards and enemy combinations provide replay variety without random combat damage.

### Saving and reproduction

The current expedition is saved locally after every accepted game action. The save includes hero health and positions, board elements, hand/draw/discard order, upgrades, collection, route, current intents, turn, energy and the exact xorshift32 generator state. Reloading and choosing **Continue** therefore does not reroll future draws. Preferences and the expedition use separate local-storage keys.

## Controls

- Click or tap a hero/card, then a highlighted target; confirm or cancel.
- Click an enemy or its **i** button for its behavior and exact intent.
- **Escape**: cancel selection or close help.
- **Space**: end turn when the board, not another control, has focus.
- **M**: toggle synthesized sound.

## Source layout

- `src/engine.js`: deterministic rules, encounters, rewards and guide policy; also runs in Node.
- `src/game.js`: rendering, EN/FR/ES text, SVG artwork, input, audio and local save.
- `src/styles.css`: responsive ceramic-and-glass presentation.
- `src/index.template.html`: export template; `build.py` on `development` inlines the sources into `index.html`.
- `tests/`: rule, save-cycle and full-expedition tests using `node:test`.
- `scripts/playtest.js`: complete expedition through public engine actions, with JSON evidence.
- `art/`: original cover and favicon; the cover generator is retained on `development`.
- `MISSION.json`: mission-specific implementation and verification record.

## Rights and attribution

Designed and developed with **Kimi** for **Kimi Games**. Code and original visual/audio assets are MIT licensed; no third-party runtime library or external asset is used. Pillow is optional only for regenerating the cover. See `LICENSE`, `CREDITS.md`, `LOB7-GAME.json` and `LOB7-ATTRIBUTION.json`.
