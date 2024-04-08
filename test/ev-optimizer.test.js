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
      evs: {hp: 204, atk: 252, def: 52},
      level: 100
    }, 'gen9');
    assert.deepStrictEqual(trapinch, {
      evs: {hp: 204, atk: 144, def: 104},
      plus: 'atk',
      minus: 'spd',
      savedEVs: 56,
    });

    const groudon = BattleStatOptimizer({
      species: "Groudon-Primal",
      nature: "Serious",
      evs: {atk: 252, spa: 156, spe: 100},
      level: 100
    }, 'gen7');
    assert.deepStrictEqual(groudon, {
      evs: {atk: 88, spa: 156, spd: 96, spe: 100},
      plus: 'atk',
      minus: 'spd',
      savedEVs: 68,
    });

    const thundurus = BattleStatOptimizer({
      species: "Thundurus",
      nature: "Timid",
      evs: {hp: 252, spa: 232, spe: 24},
      ivs: {hp: 31, atk: 2, def: 31, spa: 30, spd: 31, spe: 30},
      level: 50
    }, 'gen5');
    assert.deepStrictEqual(thundurus, {
      evs: {hp: 252, spa: 112, spe: 128},
      plus: 'spa',
      minus: 'atk',
      savedEVs: 16,
    });

    const amoonguss = BattleStatOptimizer({
      species: "Amoonguss",
      nature: "Bold",
      evs: {hp: 252, def: 100, spd: 156},
      level: 50
    }, 'gen9');
    assert.deepStrictEqual(amoonguss, {
      evs: {hp: 252, def: 180, spd: 76},
      plus: 'spd',
      minus: 'atk',
      savedEVs: 0,
    });

    const avalugg = BattleStatOptimizer({
      species: "Avalugg",
      nature: "Hasty",
      evs: {hp: 56, atk: 200, def: 252},
      level: 100
    }, 'gen9');
    assert.deepStrictEqual(avalugg, {
      evs: {hp: 56, atk: 84, def: 64, spe: 84},
      plus: 'atk',
      minus: 'spe',
      savedEVs: 220,
    });

    const mew = BattleStatOptimizer({
      species: "Mew",
      nature: "Sassy",
      evs: {hp: 24, atk: 92, def: 92, spa: 92, spd: 104, spe: 104},
      level: 100
    }, 'gen9');
    assert.deepStrictEqual(mew, {
      evs: {hp: 24, atk: 92, def: 92, spa: 92, spd: 208},
      savedEVs: 0,
    });

    const mew2 = BattleStatOptimizer({
      species: "Mew",
      nature: "Sassy",
      evs: {hp: 24, atk: 92, def: 92, spa: 92, spd: 144, spe: 64},
      level: 100
    }, 'gen9');
    assert.equal(mew2, null);

    const greatTusk = BattleStatOptimizer({
      species: "Great Tusk",
      nature: "Jolly",
      evs: {hp: 136, atk: 92, def: 100, spd: 72, spe: 108},
      level: 100
    }, 'gen9');
    assert.deepStrictEqual(greatTusk, {
      evs: {hp: 136, atk: 92, spd: 72, spe: 200},
      plus: 'def',
      minus: 'spa',
      savedEVs: 8,
    });
    
    const mienfoo = BattleStatOptimizer({
      species: "Mienfoo",
      nature: "Jolly",
      evs: {atk: 236, def: 116, spe: 156},
      level: 5
    }, 'gen9');
    assert.equal(mienfoo, null);
  });
});
