import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createGroupWithMembers, getUsersGroups } from '$lib/server/db';
import type { Group, TempAnonUser } from '$lib/server/db/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (!user) throw redirect(302, '/login');

	// get user's groups
	const groups: Group[] = getUsersGroups(user.id);
	console.log('groups', groups);

	return {
		user,
		groups
	};
};

export const actions: Actions = {};
