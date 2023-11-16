const assert = require('assert').strict;

try {
  global.BattlePokedex = require('../play.pokemonshowdown.com/data/pokedex.js').BattlePokedex;
} catch (err) {}
require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');
require('../play.pokemonshowdown.com/js/battle-tooltips.js');

describe('EV Guesser', () => {

  (global.BattlePokedex ? it : it.skip)('should guess well', () => {
    const guesser = new BattleStatGuesser('gen7ou');
    let guess = guesser.guess({
      species: 'Arcanine',
      item: 'Choice Band',
      moves: ['Flare Blitz', 'Close Combat', 'Wild Charge', 'Extreme Speed'],
    });
    assert(guess.role === 'Fast Band');
  });

});
