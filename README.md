Pokemon Showdown Client
========================================================================

This is a repository for some of the client code for Pokemon Showdown.

This is what runs `play.pokemonshowdown.com`.

WARNING: You probably want the [Pokemon Showdown server][1].

  [1]: https://github.com/Zarel/Pokemon-Showdown

Testing
------------------------------------------------------------------------

You can make and test client changes simply by opening `testclient.html`.

It will ask for config data. Config data for the main server can be copied from:

http://play.pokemonshowdown.com/~~showdown/action.php?act=upkeep

This will allow you to test changes to the client without setting up your
own login server.

Certain things will fail:

Registering, changing name, the ladder tab, and the /ladder command

Everything else can be tested, though.

Setup
------------------------------------------------------------------------

This repository is not "batteries included". It does NOT include everything
necessary to run a full Pokemon Showdown client.

In particular, it doesn't include a login/authentication server, nor does it
include the database abstraction library used by the ladder library (although
it's similar enough to `mysqli` that you can use that with minimal changes).

It also doesn't include several resource files (namely, the `/audio/` and
`/sprites/` directories) for size reasons.

In other words, this repository is incomplete and NOT intended for people
who wish to serve their own Pokemon Showdown client (you can, but it'll
require you to rewrite some things). Rather, it's intended for people who
wish to contribute and submit pull requests to Pokemon Showdown's client.

License
------------------------------------------------------------------------

Pokemon Showdown's client is distributed under the terms of the [AGPLv3][2].

  [2]: http://www.gnu.org/licenses/agpl-3.0.html

WARNING: This is NOT the same license as Pokemon Showdown's server.
