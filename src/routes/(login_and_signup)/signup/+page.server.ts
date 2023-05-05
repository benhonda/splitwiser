import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import { createAnonUserWithRegistration } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		// maybe redirect to the previous page...
		const returnUrlStr = url.searchParams.get('r') || '';

		// TODO: need more validation here?
		// validate return url
		const returnUrl = new URL(returnUrlStr);

		if (returnUrl.origin === url.origin) {
			throw redirect(302, returnUrl.pathname + returnUrl.search);
		}

		throw redirect(302, '/groups');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = form.get('email');
		const first_name = form.get('first_name');
		const last_name = form.get('last_name');
		const password = form.get('password');

		// check for empty values
		if (
			typeof email !== 'string' ||
			typeof first_name !== 'string' ||
			typeof last_name !== 'string' ||
			typeof password !== 'string'
		) {
			return fail(400);
		}

		if (first_name.length < 1 || last_name.length < 1) return fail(400);

		console.log('email', email);
		console.log('first_name', first_name);
		console.log('last_name', last_name);

		try {
			const user = await auth.createUser({
				primaryKey: {
					providerId: 'email',
					providerUserId: email,
					password
				},
				attributes: {
					email
				}
			});

			const session = await auth.createSession(user.id);

			// create anon user and connect it to the user
			try {
				createAnonUserWithRegistration(user.id, first_name, last_name);
			} catch (e) {
				console.error(e);
				await auth.deleteUser(user.id);
				throw e;
			}

			locals.auth.setSession(session);
		} catch (e) {
			// email already in use
			console.error('error', e);
			return fail(400);
		}
	}
};
