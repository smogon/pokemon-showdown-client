#!/usr/bin/env node

window = global;

require('./production.min.js');

const fs = require('fs');
const file = fs.readFileSync('./index.js', 'utf8');
const arr = file.slice(file.indexOf('['), file.indexOf(']')+1);
const SPECIES = JSON.parse(arr);

const GENS = Object.keys(PokemonSprites.GENS);
const MISSING = {};
const LENGTH = 'https://play.pokemonshowdown.com/sprites/'.length;

function sprites(gen, namestar) {
  const name = namestar.endsWith('*') ? namestar.slice(0, -1) : namestar;
  const urls = [];

  if (gen === 'dex') {
    // no gender or back sprites
    for (const shiny of [false, true]) {
      if (name.endsWith('-Starter') && shiny === true) continue;
      urls.push( PokemonSprites.getDexPokemon(name, {gen, shiny}).url);
    }
    return urls;
  }

  const genders =
    (PokemonSprites.GENS[gen] < 4 || !namestar.endsWith('*')) ? [undefined] : ['M', 'F'];
  for (const shiny of (gen.startsWith('gen1') ? [false] :  [false, true])) {
    if (name.endsWith('-Starter') && shiny === true) continue;
    for (const side of ['p2', 'p1']) {
      for (const gender of genders) {
        urls.push(PokemonSprites.getPokemon(name, {gen, side, shiny, gender}).url);
      }
    }
  }

  return urls;
}

for (let i = 0; i < SPECIES.length; i++) {
  const namestar = SPECIES[i];

  for (const gen of GENS) {
    for (const url of sprites(gen, namestar)) {
      const f = url.slice(LENGTH);
      if (!fs.existsSync(f) && f.startsWith(gen)) {
        MISSING[gen] = MISSING[gen] || [];
        if (!MISSING[gen].includes(f)) MISSING[gen].push(f);
      }
    }
  }
}

console.log(JSON.stringify(MISSING, null, 2));