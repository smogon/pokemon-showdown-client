const assert = require('assert').strict;

try {
  global.BattlePokedex = require('../play.pokemonshowdown.com/data/pokedex.js').BattlePokedex;
} catch (err) {}
require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');
require('../play.pokemonshowdown.com/js/battle-tooltips.js');

describe('EV Optimizer', () => {
  (global.BattlePokedex ? it : it.skip)('should find the spreads that saves the most EVs', () => {
    const trapinch = BattleStatOptimizer({
      species: "Trapinch",
      nature: "Lax",
      evs: {hp: 204, atk: 252, def: 52, spa: 0, spd: 0, spe: 0},
      level: 100
    }, 'gen9');
    assert.deepStrictEqual(trapinch, {
      evs: {hp: 204, atk: 144, def: 104, spa: 0, spd: 0, spe: 0},
      plus: 'atk',
      minus: 'spd',
      savedEVs: 56,
    });

    const groudon = BattleStatOptimizer({
      species: "Groudon-Primal",
      nature: "Serious",
      evs: {hp: 0, atk: 252, def: 0, spa: 156, spd: 0, spe: 100},
      level: 100
    }, 'gen7');
    assert.deepStrictEqual(groudon, {
      evs: {hp: 0, atk: 88, def: 0, spa: 156, spd: 96, spe: 100},
      plus: 'atk',
      minus: 'spd',
      savedEVs: 68,
    });

    const thundurus = BattleStatOptimizer({
      species: "Thundurus",
      nature: "Timid",
      evs: {hp: 252, atk: 0, def: 0, spa: 232, spd: 0, spe: 24},
      ivs: {hp: 31, atk: 2, def: 31, spa: 30, spd: 31, spe: 30},
      level: 50
    }, 'gen5');
    assert.deepStrictEqual(thundurus, {
      evs: {hp: 252, atk: 0, def: 0, spa: 112, spd: 0, spe: 128},
      plus: 'spa',
      minus: 'atk',
      savedEVs: 16,
    });

    const amoonguss = BattleStatOptimizer({
      species: "Amoonguss",
      nature: "Bold",
      evs: {hp: 252, atk: 0, def: 100, spa: 0, spd: 156, spe: 0},
      level: 50
    }, 'gen9');
    assert.deepStrictEqual(amoonguss, {
      evs: {hp: 252, atk: 0, def: 180, spa: 0, spd: 76, spe: 0},
      plus: 'spd',
      minus: 'atk',
      savedEVs: 0,
    });

    const mienfoo = BattleStatOptimizer({
      species: "Mienfoo",
      nature: "Jolly",
      evs: {hp: 0, atk: 236, def: 116, spa: 0, spd: 0, spe: 156},
      level: 5
    }, 'gen9');
    assert.equal(mienfoo, null);
  });
});
