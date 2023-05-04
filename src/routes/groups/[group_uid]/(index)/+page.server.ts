import { error, fail, redirect } from '@sveltejs/kit';
import {
	createGroupWithMembers,
	getAnonTokenFromCookie,
	getAnonUserFromTokenId,
	getAnonUserFromUserId,
	getAnonUsersUserMaybeKnows,
	getGroupByHashedId,
	getUsersGroups
} from '$lib/server/db';
import type { AnonUser, TempAnonUser } from '$lib/server/db/types';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
  // TODO: can we put this into a layout so that we don't have to repeat it in join page too?
	// FIRST: check if the group_uid is valid
	// if not, show error page
	const { group_uid } = params;
	const group = getGroupByHashedId(group_uid);
	if (!group) throw error(404, 'Group not found');

	// SECOND: check if the user is logged in
	const { user } = await locals.auth.validateUser();

	if (user) {
		// if they are, we check that they are a member of the group
		const groups = getUsersGroups(user.id);
		const membership = groups.find((g) => g.id === group.id);

		if (membership) {
			const anonUser: AnonUser = getAnonUserFromUserId(user.id);
			return { group, user, anonUser };
		}
	}

	// TEST URL
	// http://localhost:5173/groups/67d53ee344035914a1281ad8e02210aee8bd64bf7ff443b34f3faee98341dd26

	// we assume here that either:
	// - the user is logged in but is not a member of the group
	// - the user is not logged in
	const anon_cookie = cookies.get('anon_cookie');

	// no cookie, user please join
	if (!anon_cookie) throw redirect(302, `/groups/${group_uid}/join`);

	// get token from db using cookie
	const anonToken = getAnonTokenFromCookie(anon_cookie);

	// no token found for that cookie or not from this group, user please join
	if (!anonToken || anonToken.group_id !== group.id)
		throw redirect(302, `/groups/${group_uid}/join`);

	// token expired, user please join
  // TODO: this is not working, need to fix
	// if (anonToken.created_at) throw redirect(302, `/groups/${group_uid}/join`);

	//
	// if we're here, the user is logged in anonymously as a member of the group
	//
	const anonUser: AnonUser = getAnonUserFromTokenId(anonToken.id);

	return { group, user, anonUser };
};

export const actions: Actions = {};
