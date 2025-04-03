PS replays database
===================

This is the code powering https://replay.pokemonshowdown.com/


JSON API
--------

The replays database has a JSON API, documented at:

https://github.com/smogon/pokemon-showdown-client/blob/master/WEB-API.md


Testing local changes
---------------------

We now have a `testclient.html` for testing local changes.

1. `npm install` <- you only have to do this the first time
2. `./build`
3. open `testclient.html` in a browser.

And then repeat every time you make changes.

Features requiring login (private replay search, auto-self) won't work, but
everything else should.
