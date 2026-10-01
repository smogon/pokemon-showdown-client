const assert = require('assert').strict;
const {describe, it} = require('node:test');

global.BattlePokedex = require('../../play.pokemonshowdown.com/data/pokedex.js').BattlePokedex;
global.BattleMovedex = require('../../play.pokemonshowdown.com/data/moves.js').BattleMovedex;
require('../../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../../play.pokemonshowdown.com/js/battle-dex.js');
require('../../play.pokemonshowdown.com/js/battle-tooltips.js');

describe('EV Guesser', () => {

  it('should guess well', () => {
    const guesser = new BattleStatGuesser('gen7ou');
    let guess = guesser.guess({
      species: 'Arcanine',
      item: 'Choice Band',
      moves: ['Flare Blitz', 'Close Combat', 'Wild Charge', 'Extreme Speed'],
    });
    assert.strictEqual(guess.role, 'Fast Band');
  });

});
