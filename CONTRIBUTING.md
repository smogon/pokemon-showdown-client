Contributing to the PS client
=============================

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
- `String#startsWith`
- `String#endsWith`
- `String#includes`
- `Object.assign`
- `Object.create` - Note: second argument is unsupported

These polyfills are optimized for speed, not spec-compliance. As long as you don't write very nonstandard code, you won't have a problem.

`Array#includes` is put directly on the `Array` prototype, so you can't use `for-in` on Arrays. Fortunately, TypeScript will complain if you try.
