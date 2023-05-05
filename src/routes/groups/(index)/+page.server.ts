import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	connectAnonUserToUser,
	createGroupWithMembers,
	getAnonTokenFromCookie,
	getAnonUserAndGroupFromTokenId,
	getAnonUserFromTokenId,
	getPrimaryAnonUserForUser,
	getUsersGroups
} from '$lib/server/db';
import type { AnonToken, AnonUser, Group, TempAnonUser } from '$lib/server/db/types';
import { to_number } from 'svelte/internal';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const { user } = await locals.auth.validateUser();

	// TODO: probably don't need to require login,
	// if they have an anon_coookie, just show the 1 group they're an anon member of
	if (!user) throw redirect(302, '/login');

	// get primary anon_user
	const anon_user_primary: AnonUser = getPrimaryAnonUserForUser(user.id);

	// check if the user has a valid anon_token
	const anon_cookie = cookies.get('anon_cookie');

	// let anon_user_from_token: AnonUser | null = null;
	let anon_user_and_group_from_token: (AnonUser & Group) | null = null;
	if (anon_cookie) {
		// get token from db using cookie
		const anonToken: AnonToken = getAnonTokenFromCookie(anon_cookie);

		if (anonToken) {
			// get the user
			// anon_user_from_token = getAnonUserFromTokenId(anonToken.id);
			anon_user_and_group_from_token = getAnonUserAndGroupFromTokenId(anonToken.id);
		}
	}

	console.log('anon_user_and_group_from_token', anon_user_and_group_from_token);

	// no token found for that cookie or not from this group, user please join
	// if (!anonToken || anonToken.group_id !== group.id)
	// 	throw redirect(302, `/groups/${group_uid}/join`);

	// get user's groups
	const groups: Group[] = getUsersGroups(user.id);
	console.log('groups', groups);

	return {
		// anon_user_from_token,
		anon_user_and_group_from_token,
		anon_user_primary,
		user,
		groups
	};
};

export const actions: Actions = {
	connect_anon_user: async ({ request, locals, cookies }) => {
		const { user } = await locals.auth.validateUser();
		const form = await request.formData();
		const anon_user_id = form.get('anon_user_id');
		const decision = form.get('should_connect_account');

		if (!user) throw error(401, 'Unauthorized');

		if (typeof anon_user_id !== 'string' || typeof decision !== 'string')
			throw error(400, 'Bad Request');

		if (decision === 'true') {
			// connect account
			connectAnonUserToUser(to_number(anon_user_id), user.id);
		}

		// delete/eat the browser cookie
		cookies.set('anon_cookie', '', { path: '/', maxAge: 0 });
	}
};

// TODO:
// Group creators should be able to revoke anon members tokens. Such that if a user somehow signs in with the wrong name, the owner can handle that.
