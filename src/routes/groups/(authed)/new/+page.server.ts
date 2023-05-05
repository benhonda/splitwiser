import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createGroupWithMembers, getAnonUsersUserMaybeKnows } from '$lib/server/db';
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
		let group_name = form.get('group_name');
		group_name = `${group_name}`;
		let group_members = form.get('group_members');
		group_members = `${group_members}`;

		console.log('group_name', group_name);
		console.log('group_members', group_members);

		// check for empty values
		if (group_name.length < 1 || group_members.length < 1) return fail(400);

		try {
			const groupMembersParsed: TempAnonUser[] = JSON.parse(group_members);
			createGroupWithMembers(user.id, group_name, groupMembersParsed);
			console.log('Success! Somehow.');
		} catch (e) {
			console.log(e);
		}
	}
};
