import {
	addAnonUsersToGroup,
	getActiveUsersInGroup,
	getAnonTokenFromCookie,
	getAnonUserFromUserId,
	getAnonUsersInGroup,
	getGroupByHashedId,
	getUsersGroups,
	removeAnonUserFromGroup,
	setAnonTokenForAnonUser
} from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { AnonUser, TempAnonUser } from '$lib/server/db/types';
import { to_number } from 'svelte/internal';

export const load: PageServerLoad = async ({ parent, locals, params, cookies }) => {
	// check that the user is the owner
	const { user, group } = await parent();
	if (user.id !== group.owner_user_id) throw error(403, 'You are not the owner of this group');

	// get group members
	const anonUsers: AnonUser[] = getAnonUsersInGroup(group.id);

	return { user, anonUsers };
};

export const actions: Actions = {
	addGroupMembers: async ({ request }) => {
		const form = await request.formData();
		const group_id = form.get('group_id');
		const first_names = form.getAll('first_name');
		const last_names = form.getAll('last_name');

		if (first_names.length < 1 || last_names.length < 1 || typeof group_id !== 'string')
			throw error(400);

		try {
			const members: TempAnonUser[] = first_names.map((first_name, i) => ({
				first_name: `${first_name}`,
				last_name: `${last_names[i]}`
			}));

			// add the members to the group!
			addAnonUsersToGroup(to_number(group_id), members);
		} catch (e) {
			console.log(e);
		}
	},
	removeGroupMember: async ({ request }) => {
		const form = await request.formData();
		const group_id = form.get('group_id');
		const anon_user_id = form.get('anon_user_id');

		if (typeof group_id !== 'string' || typeof anon_user_id !== 'string') throw error(400);

		try {
			removeAnonUserFromGroup(to_number(group_id), to_number(anon_user_id));
		} catch (error) {
			console.log(error);
		}
	}
};
