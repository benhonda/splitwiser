import {
	getActiveUsersInGroup,
	getAnonTokenFromCookie,
	getAnonUserFromUserId,
	getAnonUsersInGroup,
	getGroupByHashedId,
	getUsersGroups,
	setAnonTokenForAnonUser
} from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { AnonUser } from '$lib/server/db/types';
import { to_number } from 'svelte/internal';

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
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

		// if they are a member, redirect to the group page
		if (membership) throw redirect(302, `/groups/${group_uid}`);
	}

	// we assume here that either:
	// - the user is logged in but is not a member of the group
	// - the user is not logged in
	const anon_cookie = cookies.get('anon_cookie');

	if (anon_cookie) {
		// check if cookie is for this group
		const anonToken = getAnonTokenFromCookie(anon_cookie);
		if (anonToken && anonToken.group_id !== group.id) {
			// redirect to the group page
			throw redirect(302, `/groups/${group_uid}`);
		}
	}

	// here, the user is not logged in at all (anonymous or otherwise)
	// check what members are active, and show the list to the user

	const anonUsers: AnonUser[] = getAnonUsersInGroup(group.id);
	// const activeAnonUsers: AnonUser[] = getActiveUsersInGroup(group.id);

	// anonUsers.forEach((anonUser) => {
	// 	anonUser.active = activeAnonUsers.some((activeAnonUser) => activeAnonUser.id === anonUser.id);
	// });

	return { group, user, anonUsers };
};

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const { group_uid } = params;
		const form = await request.formData();
		const group_id = form.get('group_id');
		const anon_user_id = form.get('anon_user_id');

		if (typeof anon_user_id !== 'string' || typeof group_id !== 'string') throw error(400);

		// set tokenMaxAge to 2 hours in development, 12 hours in production
		const tokenMaxAge = process.env.NODE_ENV === 'production' ? 60 * 60 * 12 : 60 * 60 * 2;

		const hashedVal = setAnonTokenForAnonUser(
			to_number(anon_user_id),
			to_number(group_id),
			tokenMaxAge
		);

		// create cookie
		cookies.set('anon_cookie', hashedVal, {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: process.env.NODE_ENV === 'production',
			// set cookie to expire after a month
			maxAge: tokenMaxAge
		});

		// redirect the user
		throw redirect(302, `/groups/${group_uid}`);
	}
};
