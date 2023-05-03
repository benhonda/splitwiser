import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';
import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import sqlite from 'better-sqlite3';
import { dev } from '$app/environment';
import { DB_PATH } from '$env/static/private';

const db = sqlite(DB_PATH);

export const auth = lucia({
	adapter: betterSqlite3(db),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (user) => {
		return {
			id: user.id,
			email: user.email
			// password: user.password,
			// createdAt: user.created_at,
			// updatedAt: user.updated_at,
		};
	}
});

export type Auth = typeof auth;
