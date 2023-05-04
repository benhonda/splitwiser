import { addNewGroupMember } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Group } from '$lib/server/db/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (!user) throw redirect(302, '/login');

	// get groups
	// const groups: Group[] = [];
	const groups: Group[] = [
		{
			id: 12,
			group_name: '501 Victoria',
			created_at: 'string',
			owner_user_id: 'string'
		} satisfies Group,
		{
			id: 13,
			group_name: 'Albert St.',
			created_at: 'string',
			owner_user_id: 'string'
		} satisfies Group
	];

	return {
		user,
		groups
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const first_name = form.get('first_name');
		const last_name = form.get('last_name');
		const group_ids = form.getAll('group_ids');

		// check for empty values
		if (typeof first_name !== 'string' || typeof last_name !== 'string' || group_ids.length <= 0)
			return fail(400);

		try {
			const int_group_ids = group_ids.map((id) => parseInt(id.toString()));
			addNewGroupMember(int_group_ids, first_name, last_name);
		} catch (e) {
			console.log(e);
		}
	}
};
