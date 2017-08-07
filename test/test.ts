import { Selector } from 'testcafe';
import { execFile } from 'child_process';

const showdownDirectory = __dirname + '/../data/Pokemon-Showdown';

fixture('Pokemon Showdown')
    .page('../testclient.html?~~localhost')
    .before(async ctx => {
        ctx.process = execFile(showdownDirectory + '/pokemon-showdown', {
            cwd: showdownDirectory,
        });
    })
    .after(async ctx => {
        ctx.process.kill();
    })
    .beforeEach(t => t.maximizeWindow());

const expectedTeam = `=== [gen7] Untitled 1 ===

Charizard-Mega-Y @ Charizardite Y\x20\x20
Ability: Drought`;

test('Teambuilder works', async t => {
    await t.click('[name="close"]')
        .click('[value="teambuilder"]')
        .click('[name="newTop"]')
        .click('[name="addPokemon"]')
        .click('[data-entry="pokemon|Charizard-Mega-Y"]')
        .click('[name="back"]')
        .click('[name="back"]')
        .click('[name="backup"]');

    await t.expect((await Selector('textarea').value).trim()).eql(expectedTeam);
});

test('Teambuilder shows level 50 for VGC', async t => {
    await t.click('[name="close"]')
        .click('[value="teambuilder"]')
        .click('[name="newTop"]')
        .click('.teambuilderformatselect')
        .click('[value^="gen7vgc"]')
        .click('[name="addPokemon"]')
        .click('[data-entry="pokemon|Absol"]')
        .click('.setdetails')
        .expect(Selector('[name="level"]').value).eql('50');
});

test('Trump Card has 5 PP', async t => {
    await t.click('[name="close"]')
        .click('[value="teambuilder"]')
        .click('[name="newTop"]')
        .click('[name="addPokemon"]')
        // Eevee (e e v), Trump Card (t c)
        .pressKey('e e v enter enter enter t c')
        .expect(Selector('.hover .pplabelcol').textContent).eql('PP5');
});
