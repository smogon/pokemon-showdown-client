import { Selector } from 'testcafe';

fixture('Pokemon Showdown')
    .page('../testclient.html?~~localhost');

const expectedTeam = `=== Untitled 1 ===

Abomasnow-Mega @ Abomasite\x20\x20
Ability: Snow Warning`;

test('Teambuilder works', async t => {
    await t.click('[name="close"]')
        .click('[value="teambuilder"]')
        .click('[name="newTop"]')
        .click('[name="addPokemon"]')
        .click('[data-entry="pokemon|Abomasnow-Mega"]')
        .click('[name="back"]')
        .click('[name="back"]')
        .click('[name="backup"]');

    await t.expect((await Selector('textarea').value).trim()).eql(expectedTeam);
});
