# Splitwiser

## This is a SvelteKit project

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

### Developing

### SvelteKit

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Database

We're using SQLite with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) and a custom migrator function that allows us to declare our schema in plain ol' SQL (thank you [David Rõthlisberger and William Manley](https://david.rothlis.net/declarative-schema-migration-for-sqlite/)).

#### Linting

We're using the [SQLFluff](https://github.com/sqlfluff/sqlfluff) CLI to lint our SQL. 

Optionally, create a virtual environment. Then install SQLFluff with pip:

```bash
pip install sqlfluff
```

Lint!

```bash
# Ignore some rules we don't care about. The options are here: https://docs.sqlfluff.com/en/stable/cli.html#sqlfluff-lint
sqlfluff lint schema.sql --dialect sqlite -e RF06,LT02,LT05,LT12
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
