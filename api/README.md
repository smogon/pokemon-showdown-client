**Pokemon Showdown API server**

This is the PS API server, which serves `/api/` on all our subdomains.

Requires a full client build before it can be used.

From the repository root, run it in the foreground with `npm run api`, or under PM2 with
`npm run api:start` and `npm run api:stop`.

Config goes in `config/apiserver.mjs`. See `config/apiserver-example.mjs` for
example usage.

Run `npm test` from the repository root to build the client, lint and typecheck both projects,
and run their tests. `npm run typecheck` runs just the client and API typechecks.

Access it via `/api/[action]`.

See `src/actions.ts` for a list of the actions. (Actions can be added by adding a function to that file)
