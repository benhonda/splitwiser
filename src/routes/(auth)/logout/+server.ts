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
