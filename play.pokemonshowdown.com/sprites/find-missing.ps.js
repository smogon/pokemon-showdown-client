window = global;

window.BattleTeambuilderTable = require('../data/teambuilder-tables.js').BattleTeambuilderTable;
window.BattleAbilities = require('../data/abilities.js').BattleAbilities;
window.BattleItems = require('../data/items.js').BattleItems;
window.BattleMovedex = require('../data/moves.js').BattleMovedex;
window.BattlePokedex = require('../data/pokedex.js').BattlePokedex;
window.BattleTypeChart = require('../data/typechart.js').BattleTypeChart;

require('../js/battle-dex-data.js');
require('../js/battle-dex.js');
require('../js/battle-scene-stub.js');
global.BattleText = require('../data/text.js').BattleText;
require('../js/battle-text-parser.js');
require('../js/battle.js');

const fs = require('fs');

const GRAPHICS = {
  // 'gen1rg': 1,
  // 'gen1rb': 1,
  'gen1': 1,
  // 'gen2g': 2,
  // 'gen2s': 2,
  'gen2': 2,
  // 'gen3rs': 3,
  'gen3': 3,
  // 'gen3frlg': 3,
  // 'gen4dp': 4,
  'gen4': 4,
  'gen5': 5,
  'gen5ani': 5,
  'dex': 6,
  'ani': 6,
};

const SPECIES = [];
let i = 0;
for (let baseid in BattlePokedex) {
  if (baseid.endsWith('totem')) continue;
  const species = Dex.getSpecies(baseid);
  for (let formid of [''].concat(species.cosmeticFormes || [])) {
    let spriteid = species.spriteid;
    if (formid) spriteid += '-' + formid.slice(species.id.length);
    const id = toID(spriteid);
    SPECIES.push([id, species]);
  }
}

SPECIES.sort(([, a], [, b]) => {
  if (a.gen - b.gen) return a.gen - b.gen;
  return Math.abs(a.num) - Math.abs(b.num);
});

function sprites(graphics, spriteid, name, species) {
  const gen = GRAPHICS[graphics];
  const urls = [];

  if (graphics === 'dex') {
    // no gender or back sprites
    const data = Dex.getTeambuilderSpriteData({ species: name }, gen);
    if (data.spriteid === '0') {
      console.error(name);
      return urls;
    }
    for (const shiny of (gen > 1 ? ['', '-shiny'] : [''])) {
      urls.push(`${Dex.resourcePrefix}${data.spriteDir}${shiny}/${data.spriteid}.png`);
    }
    return urls;
  }

  withPrefs({ noanim: !graphics.endsWith('ani') }, () => {
    for (const shiny of (gen > 1 ? [false, true] : [false])) {
      for (const siden of [1, 0]) {
        for (const gender of (gen === 1 || species.gender ? [undefined] : ['M', 'F'])) {
          const data = Dex.getSpriteData(spriteid, siden, { gen, noScale: true, shiny, gender });
          urls.push(data.url);
        }
      }
    }
  });

  return urls;
}

function withPrefs(prefs, fn) {
  const saved = Dex.prefs;
  Dex.prefs = s => prefs[s];
  fn();
  Dex.prefs = saved;
}

function formeName(species, spriteid) {
  if (species.name === 'Toxtricity-Low-Key-Gmax') return species.name;
  let forme = spriteid.slice(species.id.length);
  forme = forme.charAt(0).toUpperCase() + forme.substr(1);
  return `${species.name}-${forme}`;
}

const LENGTH = `${Dex.resourcePrefix}/sprites`.length;
for (let i = 0; i < SPECIES.length; i++) {
  const [spriteid, species] = SPECIES[i];
  const name = species.id !== spriteid ? formeName(species, spriteid) : species.name;
  for (const graphics in GRAPHICS) {
    for (const url of sprites(graphics, spriteid, name, species)) {
      const f = url.slice(LENGTH);
      if (!fs.existsSync(f)) console.log(f);
    }
  }
}
