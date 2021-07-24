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

Browser support
------------------------------------------------------------------------

Pokémon Showdown currently supports, in order of preference:

 - Chrome
 - Firefox
 - Opera
 - Safari 5+
 - IE11+
 - Chrome/Firefox/Safari for various mobile devices

Pokémon Showdown is usable, but expect degraded performance and certain features not to work in:

 - Safari 4+
 - IE9+

Pokémon Showdown is mostly developed on Chrome, and Chrome or the desktop client is required for certain features like dragging-and-dropping teams from PS to your computer. However, bugs reported on any supported browser will usually be fixed pretty quickly.

Testing
------------------------------------------------------------------------

Client testing now requires a build step! Install the latest Node.js (we
require v14 or later) and Git, and run `node build` (on Windows) or `./build`
(on other OSes) to build.

You can make and test client changes simply by building after each change,
and opening `testclient.html`. This will allow you to test changes to the
client without setting up your own login server.

### Test keys

For security reasons, browsers [don't let other websites control PS][5], so
they can't screw with your account, but it does make it harder to log in on
the test client.

The default hack makes you copy/paste the data instead, but if you're
refreshing a lot, just add a `config/testclient-key.js` file, with the
contents:

    const POKEMON_SHOWDOWN_TESTCLIENT_KEY = 'sid';

Replace `sid` with the contents of your actual PS `sid` cookie. You can quickly
access this on Chrome through the URL bar:

![image](https://user-images.githubusercontent.com/551184/53414680-def43480-3994-11e9-89d0-c06098c23fa0.png)
![image](https://user-images.githubusercontent.com/551184/53414760-119e2d00-3995-11e9-80f8-ecd17467310a.png)

(This is the only supported method of logging in on the beta Preact client.)

  [5]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

### Other servers

You can connect to an arbitrary server by navigating to
`testclient.html?~~host:port`. For example, to connect to a server running
locally on port 8000, you can navigate to `testclient.html?~~localhost:8000`.

**NOTE**: Certain browsers will convert `'?'` to `'%3F'` when reading files off
of the local filesystem. As a workaround, try using a different browser or
serving the files locally first (ie. run `npx http-server` from the
directory this README is in, then navigate in your browser to
`http://localhost:8080/testclient.html?~~localhost:8000`).

### Limitations

Even with a test key, the following things will fail in `testclient.html`:

+ Registering
+ Logging into other accounts (you can still switch to other unregistered
  accounts and back, though)

Everything else can be tested.

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

Pokémon Showdown's client is distributed under the terms of the [AGPLv3][6].

The reason is mostly because I don't want low-effort proprietary forks that add bad code that steals everyone's passwords, or something like that.

If you're doing _anything_ else other than forking, _especially_ if you want to some client code files in your own open-source project that you want to release under a more permissive license (like, if you want to make your own multiplayer open-source game client for a different game), please ask at `staff@pokemonshowdown.com`. I hold all the copyright to the AGPLv3 parts and can relicense them to MIT for you.

  [6]: http://www.gnu.org/licenses/agpl-3.0.html

**WARNING:** This is **NOT** the same license as Pokémon Showdown's server.
