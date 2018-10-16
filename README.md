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

Client testing now requires a build step! Install the latest Node.js (we
require v10 or later), and run `node build` (on Windows) or `./build` (on
other OSes) to build.

You can make and test client changes simply by building after each change,
and opening `testclient.html`. This will allow you to test changes to the
client without setting up your own login server.

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
to run a full Pokémon Showdown login server, and we will not provide them.
Please do not ask for help on this; you will be turned away.

If you make a mistake hosting a login server, your users' passwords can get
stolen, so we do not want anyone to host a login server unless they can
figure out how to do it without help.

It also doesn't include several resource files (namely, the `/audio/` and
`/sprites/` directories) for size reasons.

On the other hand, as long as you don't want to run your own login server,
this repository contains everything you need to test changes to the client;
just see the "Testing" section above.

License
------------------------------------------------------------------------

Pokémon Showdown's client is distributed under the terms of the [AGPLv3][5].

  [5]: http://www.gnu.org/licenses/agpl-3.0.html

WARNING: This is NOT the same license as Pokémon Showdown's server.
