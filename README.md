Pokémon Showdown Client
========================================================================

Navigation: [Website][1] | [Server repository][2] | **Client repository** | [Dex repository][3]

  [1]: http://pokemonshowdown.com/
  [2]: https://github.com/Zarel/Pokemon-Showdown
  [3]: https://github.com/Zarel/Pokemon-Showdown-Dex
  
Introduction
------------------------------------------------------------------------

This is a repository for most of the client code for Pokémon Showdown.

This is what runs `play.pokemonshowdown.com`.

**WARNING: You probably want the [Pokémon Showdown server][4]**, if you're
setting up a server.

  [4]: https://github.com/Zarel/Pokemon-Showdown

Testing
------------------------------------------------------------------------

You can make and test client changes simply by opening `testclient.html`.
This will allow you to test changes to the client without setting up your
own login server.

You can connect to an arbitrary server by navigating to
`testclient.html?~~host:port`. For example, to connect to a server running
locally on port 8000, you can navigate to `testclient.html?~~localhost:8000`.

The following things will fail in `testclient.html`:

+ Registering
+ Changing name to a registered name other than the one you are currently
  logged in with (however, changing to an unregistered name will work, and
  you can even change back to your original registered name afterward)

Everything else can be tested, though.

Warning
------------------------------------------------------------------------

This repository is not "batteries included". It does NOT include instructions
to run a full Pokémon Showdown client, and we will not provide them. Please
do not ask for help on this; you will be turned away.

It also doesn't include several resource files (namely, the `/audio/` and
`/sprites/` directories) for size reasons.

In other words, this repository is incomplete and NOT intended for people
who wish to serve their own Pokémon Showdown client (you can, but it'll
require you figure it out yourself). Rather, it's intended for people who
wish to contribute and submit pull requests to Pokémon Showdown's client.

License
------------------------------------------------------------------------

Pokémon Showdown's client is distributed under the terms of the [AGPLv3][5].

  [5]: http://www.gnu.org/licenses/agpl-3.0.html

WARNING: This is NOT the same license as Pokémon Showdown's server.
