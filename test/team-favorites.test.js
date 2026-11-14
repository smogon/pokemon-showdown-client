// Exercise the storage models and backup parsers without starting either client UI.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const babel = require('@babel/core');
const path = require('node:path');
const {test} = require('node:test');
const clientRoot = path.resolve(__dirname, '../play.pokemonshowdown.com');
const read = file => fs.readFileSync(path.join(clientRoot, file), 'utf8');
const compile = source => babel.transformSync(source, {
 filename: 'test.ts', configFile: false, babelrc: false,
 presets: ['@babel/preset-typescript'], plugins: ['babel-plugin-remove-import-export'],
}).code;
global.window = global;
// Minimal dex fixtures keep these storage tests independent of a full data build.
global.BattlePokedex = {
 pikachu: {name: 'Pikachu', num: 25, abilities: {0: 'Static', H: 'Lightning Rod'}},
 charizard: {name: 'Charizard', num: 6, abilities: {0: 'Blaze', H: 'Solar Power'}},
};
global.BattleTypeChart = {Ice: {HPivs: {atk: 30, def: 30}}, Fire: {HPivs: {atk: 30, spa: 30, spe: 30}}};
global.BattleTeambuilderTable = {};
require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');
const stats = vm.runInThisContext(read('js/battle-dex-data.js') + '\n({BattleStatNames, BattleStatIDs});');
const Teams = vm.runInThisContext(read('js/battle-teams.js') + '\nTeams;');
const main = read('src/client-main.ts'), conn = read('src/client-connection.ts'), dropdown = read('src/panel-teamdropdown.tsx');
const mainJS = compile(main.slice(main.indexOf('class PSTeams extends'), main.indexOf('class PSUser extends')));
const connJS = compile(conn.slice(conn.indexOf('export class PSStorage'), conn.indexOf('PSConnection.connect();')));
const backupJS = compile(dropdown.slice(dropdown.indexOf('export class PSTeambuilder'), dropdown.indexOf('export function TeamBox')));
function setup(kind) {
 const data = new Map(), sent = [], callbacks = [];
 const localStorage = {getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key)};
 const context = vm.createContext({Teams, Dex, toID, ...stats, console, localStorage,
  window: {localStorage}, Config: {routes: {client: 'play.pokemonshowdown.com'}},
  document: {location: {hostname: 'example.test'}}, $: {trim: text => text.trim()},
  PSStreamModel: class {update() {}}, DOMException: {QUOTA_EXCEEDED_ERR: 22},
  fs: {mkdirSync() {}, writeFile: (path, data, cb) => callbacks.push(cb), unlink: (path, cb) => callbacks.push(cb), rmdir() {}},
  app: {rooms: {teambuilder: {updateTeamList() {throw Error('unexpected UI callback');}}}},
 });
 vm.runInContext(read('src/oldclient/storage.js').replace('Storage.initialize();', '').replace('Storage.bg.load();', ''), context);
 const old = context.Storage; old.teams = []; old.dir = '/desktop/';
 const modern = vm.runInContext(mainJS + '\nnew PSTeams()', context);
 context.PS = {teams: modern};
 const bridge = vm.runInContext(connJS + '\nPSStorage', context);
 const backup = vm.runInContext(backupJS + '\nPSTeambuilder', context);
 const isOld = kind === 'old', model = isOld ? old : modern;
 return {model, context, data, localStorage, sent, callbacks,
  list: () => isOld ? old.teams : modern.list,
  setList: list => {if (isOld) old.teams = list; else modern.list = list;},
  favorites: () => isOld ? old.packTeamFavorites() : modern.packFavorites(),
  load: (buffer, normalize = false) => isOld ? old.loadTeamFavorites(buffer, normalize) : modern.unpackFavorites(buffer, normalize),
  export: readable => isOld ? (readable ? old.exportAllTeams() : old.packAllTeams(old.teams)) : backup.exportTeamBackup(modern.list, readable),
  restore: buffer => {if (isOld) old.importTeam(buffer, true); else modern.list = backup.importTeamBackup(buffer);},
  save: () => isOld ? old.saveTeams() : modern.save(),
  receive: data => {const e = {origin: old.origin, data, source: {postMessage: value => sent.push(value)}}; if (isOld) old.onMessage({originalEvent: e}); else bridge.onMessage(e);},
 };
}
const set = {species: 'Pikachu', name: 'Sparky', item: 'Light Ball', ability: 'Static', moves: ['Thunderbolt'],
 nature: 'Timid', evs: {spa: 252, spe: 252}, ivs: {atk: 0}, level: 50, gender: 'M',
 happiness: 0, shiny: true, pokeball: 'pokeball', dynamaxLevel: 5, teraType: 'Water'};
function team(name, favorite = false, packed = Teams.pack([set])) {
 return {name, favorite, format: 'gen9ou', folder: 'Folder', packedTeam: packed, team: packed, capacity: 6, isBox: false, iconCache: '', key: ''};
}
function permutations(a) {return a.length ? a.flatMap((x, i) => permutations(a.filter((_, j) => i !== j)).map(t => [x, ...t])) : [[]];}
for (const kind of ['old', 'new']) {
 for (const remoteFavorite of ['opposite', 'empty', 'missing']) {
  test(kind + ' tnull uses local favorites despite ' + remoteFavorite + ' remote metadata', () => {
   const env = setup(kind); env.setList([team('A', true), team('B')]);
   const local = env.favorites(), packed = env.export(false);
   env.setList([team('A'), team('B', true)]);
   const remote = remoteFavorite === 'opposite' ? env.favorites() : remoteFavorite === 'empty' ? '[]' : 'null';
   env.setList([]); env.data.set('showdown_teams_local', packed); env.data.set('showdown_teams_favorites', local);
   env.receive('f' + remote); env.receive('tnull');
   assert.deepEqual(Array.from(env.list(), t => !!t.favorite), [true, false]);
   assert.equal(env.data.get('showdown_teams_favorites'), local);
  });
 }
 test(kind + ' remote teams still use remote Favorites', () => {
  const env = setup(kind); env.setList([team('A', true), team('B')]);
  env.data.set('showdown_teams_favorites', env.favorites()); const packed = env.export(false);
  env.setList([team('A'), team('B', true)]); const remote = env.favorites(); env.setList([]);
  env.receive('f' + remote); env.receive('t' + packed);
  assert.deepEqual(Array.from(env.list(), t => !!t.favorite), [false, true]);
 });
 for (const readable of [false, true]) {
  test(kind + ' ' + (readable ? 'readable' : 'packed') + ' backups: all 120 orders with 3 identical copies, 2 starred', () => {
   const env = setup(kind);
   for (const order of permutations([0,1,2,3,4])) {
    const originals = [team('Copy', true), team('Other', true), team('Copy', true), team('Copy'), team('Unstarred')];
    env.setList(originals); const metadata = env.favorites();
    env.setList(order.map(i => originals[i])); const backup = env.export(readable);
    env.restore(backup); const before = env.export(false);
    let conversions = 0; const packIdentity = env.model.packTeamIdentity;
    env.model.packTeamIdentity = function (team, normalize) {if (normalize) conversions++; return packIdentity.call(this, team, normalize);};
    env.load(metadata, true);
    env.model.packTeamIdentity = packIdentity;
    assert.equal(env.export(false), before, 'matching must not mutate team data');
    assert.equal(env.list().filter(t => t.name === 'Copy' && t.favorite).length, 2);
    assert.equal(env.list().filter(t => t.name === 'Other' && t.favorite).length, 1);
    assert.equal(env.list().filter(t => t.name === 'Unstarred' && t.favorite).length, 0);
    assert.ok(conversions <= 3);
    if (!readable) assert.equal(conversions, 0);
   }
  });
 }
 test(kind + ' normalization demonstrably restores a readable backup missed by exact matching', () => {
  const env = setup(kind); env.setList([team('A', true)]); const metadata = env.favorites();
  const packed = env.export(false); env.restore(env.export(true));
  assert.notEqual(env.export(false), packed);
  env.load(metadata, false); assert.equal(!!env.list()[0].favorite, false);
  env.load(metadata, true); assert.equal(env.list()[0].favorite, true);
 });
 test(kind + ' changed team does not inherit a star from normalization', () => {
  const env = setup(kind); env.setList([team('A', true)]); const metadata = env.favorites();
  env.setList([team('A', false, Teams.pack([{...set, moves: ['Thunder']}]))]);
  env.restore(env.export(true)); env.load(metadata, true); assert.equal(!!env.list()[0].favorite, false);
 });
}

for (const kind of ['old', 'new']) {
 test(kind + ' local recovery ignores remote Favorites when local metadata is absent', () => {
  const env = setup(kind); env.setList([team('A', true)]);
  const remote = env.favorites(); env.data.set('showdown_teams_local', env.export(false)); env.setList([]);
  env.receive('f' + remote); env.receive('tnull');
  assert.equal(env.list().length, 1); assert.equal(!!env.list()[0].favorite, false);
 });
 test(kind + ' fnull with remote teams retains local Favorites fallback', () => {
  const env = setup(kind); env.setList([team('A', true)]);
  env.data.set('showdown_teams_favorites', env.favorites()); const packed = env.export(false); env.setList([]);
  env.receive('fnull'); env.receive('t' + packed);
  assert.equal(env.list()[0].favorite, true);
 });
 test(kind + ' cross-origin writes still run if local Favorites storage fails, with no warning state', () => {
  const env = setup(kind); env.receive('f[]'); env.receive('tnull');
  env.setList([team('A', true)]);
  env.localStorage.setItem = () => {throw Error('local storage unavailable');};
  env.save();
  assert.ok(env.sent.some(m => m.startsWith('T')));
  assert.ok(env.sent.some(m => m.startsWith('F')));
  assert.equal('cantSaveFavorites' in env.model, false);
 });
 test(kind + ' direct save failure introduces no warning state', () => {
  const env = setup(kind); env.setList([team('A', true)]);
  const original = env.localStorage.setItem;
  env.localStorage.setItem = (key, value) => {if (key.endsWith('_favorites')) throw Error('quota'); original(key, value);};
  env.save();
  assert.equal('cantSaveFavorites' in env.model, false);
  assert.ok(env.data.get('showdown_teams'));
 });
 test(kind + ' edit and reorder persist current Favorites; deletion clears metadata', () => {
  const env = setup(kind); env.setList([team('A', true), team('B')]); env.save();
  const edited = Teams.pack([{...set, moves: ['Thunder']}]);
  env.list()[0].name = 'Renamed'; env.list()[0].packedTeam = edited; env.list()[0].team = edited;
  env.list().reverse(); env.save();
  const metadata = env.data.get('showdown_teams_favorites');
  env.restore(env.data.get('showdown_teams')); env.load(metadata);
  assert.equal(env.list()[1].name, 'Renamed'); assert.equal(env.list()[1].favorite, true);
  env.setList([env.list()[0]]); env.save(); assert.equal(env.data.get('showdown_teams_favorites'), '[]');
 });
 for (const readable of [false, true]) {
  test(kind + ' ' + (readable ? 'readable' : 'packed') + ' backup with fewer identical copies does not duplicate stars', () => {
   const env = setup(kind); env.setList([team('Copy', true), team('Copy', true), team('Copy')]);
   const metadata = env.favorites(); env.setList([team('Copy')]); env.restore(env.export(readable));
   env.load(metadata, true); assert.equal(env.list().filter(t => t.favorite).length, 1);
   env.restore(''); env.load(metadata, true); assert.equal(env.list().length, 0);
  });
 }
}
test('desktop save callbacks preserve newest Favorites and avoid UI updates', () => {
 const env = setup('old'); env.context.window.nodewebkit = true;
 const t = team('A', true); env.setList([t]); env.model.nwSaveTeam(t);
 t.favorite = false; env.model.saveTeamFavorites(); env.model.nwSaveTeam(t);
 env.callbacks.reverse().forEach(cb => cb(Error('filesystem failure')));
 assert.equal(env.data.get('showdown_teams_favorites'), '[]');
 assert.equal('cantSaveFavorites' in env.model, false);
});


for (const kind of ['old', 'new']) {
 for (const readable of [false, true]) {
  test(kind + ' ' + (readable ? 'readable' : 'packed') + ': different EV spreads keep the correct individual star', () => {
   const env = setup(kind);
   for (const starred of [0, 1]) {
    for (const reversed of [false, true]) {
     const originals = [
      team('Same name', starred === 0, Teams.pack([{...set, evs: {spa: 252, spe: 252, hp: 4}}])),
      team('Same name', starred === 1, Teams.pack([{...set, evs: {hp: 252, def: 252, spd: 4}}])),
     ];
     env.setList(originals); const metadata = env.favorites();
     env.setList(reversed ? originals.slice().reverse() : originals);
     env.restore(env.export(readable)); const before = env.export(false);
     env.load(metadata, true);
     assert.equal(env.export(false), before);
     assert.equal(env.list().filter(t => t.favorite).length, 1);
     const matched = env.list().find(t => t.favorite);
     const evs = Teams.unpack(kind === 'old' ? matched.team : matched.packedTeam)[0].evs;
     assert.equal(starred === 0 ? evs.spe : evs.hp, 252);
    }
   }
  });
 }
 const fixtures = [
  {name: 'gen1', format: 'gen1ou', sets: [{species: 'Pikachu', moves: ['Thunderbolt'], evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255}, ivs: {hp: 30, atk: 30, def: 30, spa: 30, spd: 30, spe: 30}}]},
  {name: 'gen2', format: 'gen2ou', sets: [{species: 'Pikachu', item: 'Leftovers', moves: ['Frustration', 'Hidden Power Ice'], happiness: 0, ivs: {atk: 30, def: 30}}]},
  {name: 'gen3', format: 'gen3ou', sets: [{...set, pokeball: undefined, dynamaxLevel: undefined, teraType: undefined}]},
  {name: 'Hidden Power and zero IVs', format: 'gen7ou', sets: [{...set, hpType: 'Ice', ivs: {atk: 0, spe: 0}, moves: ['Hidden Power Ice', 'Thunderbolt']}]},
  {name: 'Gigantamax', format: 'gen8anythinggoes', sets: [{...set, species: 'Charizard', ability: 'Solar Power', moves: ['Flamethrower'], gigantamax: true, dynamaxLevel: 0}]},
  {name: 'Tera, nickname, shiny, gender, item, nature, level and happiness', format: 'gen9ou', sets: [{...set, name: 'Sparky Jr.', level: 5, happiness: 42, teraType: 'Water'}]},
  {name: '24-slot box', format: 'gen9ou', isBox: true, sets: Array.from({length: 24}, (_, i) => ({...set, name: 'Slot ' + i}))},
 ];
 for (const fixture of fixtures) {
  for (const readable of [false, true]) {
   test(kind + ' ' + fixture.name + ' ' + (readable ? 'readable' : 'packed') + ': matching preserves restored contents', () => {
    const env = setup(kind);
    const original = {...team('Special', true, Teams.pack(fixture.sets)), format: fixture.format,
     isBox: !!fixture.isBox, capacity: fixture.isBox ? 24 : 6};
    env.setList([original]); const metadata = env.favorites();
    env.restore(env.export(readable));
    const before = env.export(false);
    env.load(metadata, true);
    assert.equal(env.list()[0].favorite, true);
    assert.equal(env.export(false), before, 'Favorites matching changed actual team contents');
    assert.equal(env.list()[0].format, fixture.format);
    assert.equal(kind === 'old' ? env.list()[0].capacity === 24 : env.list()[0].isBox, !!fixture.isBox);
    assert.equal(Teams.unpack(kind === 'old' ? env.list()[0].team : env.list()[0].packedTeam).length, fixture.sets.length);
   });
  }
 }
}
test('desktop: real files retain Favorites after save, edit, rename and fresh reload', async () => {
 const tempRoot = path.resolve(require('node:os').tmpdir());
 const dir = fs.mkdtempSync(path.join(tempRoot, 'ps-favorites-'));
 fs.mkdirSync(path.join(dir, 'Teams'));
 const pending = [];
 const trackedFs = {...fs};
 for (const operation of ['writeFile', 'unlink', 'readFile', 'rmdir']) {
  trackedFs[operation] = (...args) => {
   const callback = args.pop();
   pending.push(new Promise((resolve, reject) => {
    fs[operation](...args, (err, data) => {
     try {
      callback(err, data);
      if (err && operation !== 'rmdir') reject(err); else resolve();
     } catch (error) {reject(error);}
    });
   }));
  };
 }
 const flush = async () => {while (pending.length) await Promise.all(pending.splice(0));};
 const configure = env => {env.context.window.nodewebkit = true; env.context.fs = trackedFs; env.model.dir = dir + '/';};
 const env = setup('old'); configure(env);
 async function reload(filename) {
  const fresh = setup('old'); configure(fresh);
  for (const [key, value] of env.data) fresh.data.set(key, value);
  fresh.model.nwTeamsLeft = 1; fresh.model.nwLoadTeamFile(filename, {});
  await flush();
  assert.equal(fresh.list().length, 1); assert.equal(fresh.list()[0].favorite, true);
  return fresh.list()[0];
 }
 try {
  const t = team('Before rename', true); env.setList([t]);
  env.model.nwSaveTeam(t); await flush(); await reload(t.filename);
  t.team = env.model.packTeam([{...set, evs: {hp: 252, def: 252, spd: 4}, moves: ['Thunder']}]);
  env.model.nwSaveTeam(t); await flush();
  const edited = await reload(t.filename);
  assert.equal(Teams.unpack(edited.team)[0].evs.hp, 252);
  const oldFilename = t.filename;
  t.name = 'After rename'; env.model.nwSaveTeam(t); await flush();
  assert.equal(fs.existsSync(path.join(dir, 'Teams', oldFilename)), false);
  const renamed = await reload(t.filename);
  assert.equal(renamed.name, 'After rename'); assert.equal(renamed.team, edited.team);
 } finally {
  try {
   await flush();
  } finally {
   assert.equal(path.dirname(dir), tempRoot);
   fs.rmSync(dir, {recursive: true, force: true});
  }
 }
});
