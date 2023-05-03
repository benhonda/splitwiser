import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPartyWithMembers, getAnonUsersUserMaybeKnows } from '$lib/server/db';
import type { AnonUser, TempAnonUser } from '$lib/server/db/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (!user) throw redirect(302, '/login');

	// get anon users
	const anonUsers: AnonUser[] = getAnonUsersUserMaybeKnows(user.id);

	return {
		user,
		anonUsers
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.auth.validateUser();

		const form = await request.formData();
		const party_name = form.get('party_name');
		const party_members = form.get('party_members');

		console.log('party_name', party_name);
		console.log('party_members', party_members);

		// check for empty values
		if (typeof party_name !== 'string' || typeof party_members !== 'string') return fail(400);

		try {
			const partyMembersParsed: TempAnonUser[] = JSON.parse(party_members);
			createPartyWithMembers(user.id, party_name, partyMembersParsed);
			console.log('Success! Somehow.');
		} catch (e) {
			console.log(e);
		}
	}
};
