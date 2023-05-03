import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) throw redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = form.get('email');
		const password = form.get('password');
		// check for empty values
		if (typeof email !== 'string' || typeof password !== 'string') return fail(400);

		try {
			// We want to reference the key we created for the user in the previous step, so "email" will 
      // be the provider id and the email will be the provider user id.
      // useKey() will throw an error if the key doesn’t exist or if the password is incorrect.
			const key = await auth.useKey('email', email, password);
			const session = await auth.createSession(key.userId);
			locals.auth.setSession(session);
		} catch {
			// invalid credentials
			return fail(400);
		}
	}
};
