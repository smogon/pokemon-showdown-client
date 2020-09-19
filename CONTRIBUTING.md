Contributing to the PS client
=============================

Architecture overview
---------------------

This is an overview of what I want PS's architecture to look like when the Preact rewrite is finished. So far, it's just a work in progress.

PS loads itself in phases:

**Phase 1:** Background

- `client.css`
  - Basic styling
- `client-core.ts`
  - Background model
  - Background view

**Phase 2:** Basic UI

- `font-awesome.css`
- `client-main.ts`
  - Prefs model
  - Teams model
  - User model
  - Generic Room model
  - PS model
- SockJS
- `client-connection.ts`
  - Connect to server
- Preact
- BattleSound
- `panel-mainmenu.tsx`
- `panel-rooms.tsx`
- `panels.tsx`
  - URL router
  - global listeners
  - Main view

**Phase 3:** Lightweight panels

- Caja (HTML sanitizer)
- `panel-chat.tsx`
- `panel-ladder.tsx`

**Phase 4:** Heavyweight panels - loaded only when a user opens one

- `battle.css`
- `sim-types.css`
- `utilichart.css`
- Data files
- jQuery
- `panel-battle.tsx`
- `panel-teambuilder.tsx`
- `battle-dex.ts`
- `battle.ts`

Phase 4 doesn't load automatically, it'll only load when you start a battle or join a battle room or teambuilder.

Note that jQuery is only loaded in Phase 4. In earlier files, PS doesn't use jQuery. Just interact with the DOM directly, making sure you don't write any code that crashes IE9.

ES2018
------

The client has a weird smattering of constraints:

- Replays are intended to support IE7 and later
- The rest of the client is intended to support IE9, Safari 5, and later

This means that our target is ES3 - even outside of replays, things like `{return: 1}` instead of `{"return": 1}` are not allowed.

This is very restrictive for 2018, but fortunately, with Babel 7 and polyfills, we can still write idiomatic ES2018. There are just a few things to watch out for:

- no `Map`s and `Set`s - these can technically be polyfilled, but it's better just to use Objects directly. `Object.create(null)` is available if you need it.
- no `async`/`await` - there's no way to compile them into ES3 - `Promise`s are okay, though
- no generators or iterables other than `Array` - they either have tons of overhead or are outright unsupported, and this lets us use `for`-`of` on arrays with zero overhead

We have polyfills for:
- `Array#includes` - Note: won't be able to find `NaN`s
- `Array.isArray`
- `String#startsWith`
- `String#endsWith`
- `String#includes`
- `String#trim`
- `Object.assign`
- `Object.create` - Note: second argument is unsupported

These polyfills are optimized for speed, not spec-compliance. As long as you don't write very nonstandard code, you won't have a problem.

`Array#includes` is put directly on the `Array` prototype, so you can't use `for-in` on Arrays. Fortunately, TypeScript will complain if you try.
