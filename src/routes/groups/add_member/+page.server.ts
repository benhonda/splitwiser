import { addNewPartyMember } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Party } from '$lib/server/db/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (!user) throw redirect(302, '/login');

	// get groups
	// const parties: Party[] = [];
	const parties: Party[] = [
		{
			id: 12,
			party_name: '501 Victoria',
			created_at: 'string',
			owner_user_id: 'string'
		} satisfies Party,
		{
			id: 13,
			party_name: 'Albert St.',
			created_at: 'string',
			owner_user_id: 'string'
		} satisfies Party
	];

	return {
		user,
		parties
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const first_name = form.get('first_name');
		const last_name = form.get('last_name');
		const party_ids = form.getAll('party_ids');

		// check for empty values
		if (typeof first_name !== 'string' || typeof last_name !== 'string' || party_ids.length <= 0)
			return fail(400);

		try {
			const int_party_ids = party_ids.map((id) => parseInt(id.toString()));
			addNewPartyMember(int_party_ids, first_name, last_name);
		} catch (e) {
			console.log(e);
		}
	}
};
