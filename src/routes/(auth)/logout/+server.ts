// import { redirect } from '@sveltejs/kit';

// export const load = async () => {
// 	// we only use this endpoint for the api
// 	// and don't need to see the page
// 	throw redirect(302, '/');
// };

// export const actions = {
// 	default({ cookies }) {
// 		// eat the cookie
// 		cookies.set('session', '', {
// 			path: '/',
// 			expires: new Date(0)
// 		});

// 		// redirect the user
// 		throw redirect(302, '/login');
// 	}
// };

import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/lucia';

export const POST: RequestHandler = async ({ locals }) => {
	// we only use this endpoint for the api
	const session = await locals.auth.validate();
	if (!session) throw redirect(302, '/');
	await auth.invalidateSession(session.sessionId); // invalidate session
	locals.auth.setSession(null);
	throw redirect(302, '/');
};

// export const load: PageServerLoad = async ({ locals }) => {
// 	// we only use this endpoint for the api
// 	const session = await locals.auth.validate();
// 	if (!session) return fail(401);
// 	await auth.invalidateSession(session.sessionId); // invalidate session
// 	locals.auth.setSession(null); // remove cookie
// 	// throw redirect(302, '/');
// 	return {};
// };

// export const actions: Actions = {
// 	default: async ({ locals }) => {
// 		const session = await locals.auth.validate();
// 		if (!session) return fail(401);
// 		await auth.invalidateSession(session.sessionId); // invalidate session
// 		locals.auth.setSession(null); // remove cookie
// 	}
// };
