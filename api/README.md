**Pokemon Showdown Loginserver.**

This is the PS loginserver.

From the repository root, run it in the foreground with `npm run api`, or under PM2 with
`npm run api:start` and `npm run api:stop`.

Pass a config path after `--`, for example `npm run api -- config/config.cjs`.

Access it via `/api/[action]`.

See `src/actions.ts` for a list of the actions. (Actions can be added by adding a function to that file.)
