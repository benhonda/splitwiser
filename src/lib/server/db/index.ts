import Database from 'better-sqlite3';
import { DB_PATH, SECRET_HASH_KEY } from '$env/static/private';
import type { AnonToken, AnonUser, Group, TempAnonUser } from './types';
const { createHmac } = await import('node:crypto');

const db = new Database(DB_PATH, { verbose: console.log });
// why WAL? https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
// db.pragma('journal_mode = WAL');

// this is a class that we use to cache queries... though I'm not sure we actually need it...
// more on that later.
// const queryLoader = new QueryLoader();

function createUniqueKey(str: string): string {
	const hash = createHmac('sha256', SECRET_HASH_KEY).update(str).digest('hex');
	return hash;
}

/**
 * Gets the anon_users that the given user_id may know.
 * @param user_id The user_id of the user.
 * @returns An array of AnonUser objects.
 */
export function createAnonUserWithRegistration(
	user_id: string,
	first_name: string,
	last_name: string
): void {
	const addAnonUser = db.prepare(
		`
    INSERT INTO anon_user (user_id, first_name, last_name, active) VALUES (?, ?, ?, 1)
    `
	);

	addAnonUser.run(user_id, first_name, last_name);
}

export function getActiveUsersInGroup(group_id: number): AnonUser[] {
	const getActiveUserIds = db.prepare(`
  SELECT anon_user_id as id
  FROM anon_token 
  INNER JOIN anon_user ON anon_token.anon_user_id = anon_user.id
  WHERE group_id = ?
  `);

	const active_users = getActiveUserIds.all(group_id) as AnonUser[];
	return active_users;
}

/**
 * get anon users in a group given group_id
 * @param group_id The group_id of the group.
 * @returns An array of AnonUser objects.
 */
export function getAnonUsersInGroup(group_id: number): AnonUser[] {
	const getAnonUsers = db.prepare(
		`
    SELECT anon_user.id, anon_user.first_name, anon_user.last_name, anon_user.user_id
    FROM anon_user
    INNER JOIN anon_user_groups ON anon_user.id = anon_user_groups.anon_user_id
    WHERE anon_user_groups.group_id = ?
    `
	);

	const anon_users = getAnonUsers.all(group_id) as AnonUser[];
	const active_anon_users = getActiveUsersInGroup(group_id) as AnonUser[];

	anon_users.forEach((anonUser) => {
		anonUser.active =
			active_anon_users.some((activeAnonUser) => activeAnonUser.id === anonUser.id) ||
			anonUser.user_id !== null;
	});

	return anon_users;
}

/**
 * Creates a new group with the given members.
 * @param owner_user_id The user_id of the owner of the group.
 * @param group_name The name of the group.
 * @param members An array of TempAnonUser objects.
 */
export function createGroupWithMembers(
	owner_user_id: string,
	group_name: string,
	members: TempAnonUser[]
): void {
	// create a new group
	const addGroup = db.prepare(
		`
    INSERT INTO user_group (group_name, owner_user_id, hashed_id) VALUES (?, ?, ?)
    RETURNING id
    `
	);

	// get the current user's anon_user_id
	const getAnonUserId = db.prepare(
		`
    SELECT id FROM anon_user WHERE user_id = ?
    `
	);

	// create a new anon_user
	const addAnonUser = db.prepare(
		`
    INSERT INTO anon_user (first_name, last_name) VALUES (:first_name, :last_name)
    RETURNING id
    `
	);

	// add the new group to the anon_users
	const addGroupToAnonUsers = db.prepare(
		`
    INSERT INTO anon_user_groups (anon_user_id, group_id) VALUES (?, ?)
    `
	);

	const newGroupWithMembers = db.transaction((members: TempAnonUser[]) => {
		// add the group
		const hashed_id = createUniqueKey(`${owner_user_id}-${group_name}`);
		const group_id = addGroup.run(group_name, owner_user_id, hashed_id).lastInsertRowid;
		console.log('group_id:', group_id);

		// add the owner to the group
		const owners_anon = getAnonUserId.get(owner_user_id) as { id: number };
		addGroupToAnonUsers.run(owners_anon.id, group_id);

		for (const member of members) {
			console.log('member:', member);
			// add the anon user
			const anon_id = addAnonUser.run(member).lastInsertRowid;
			// add the many-to-many relationship between the anon user and the group
			addGroupToAnonUsers.run(anon_id, group_id);
		}
	});

	newGroupWithMembers(members);
}

/**
 * Gets the groups that the user is a part of.
 * @param user_id The user_id of the user.
 * @returns An array of Group objects.
 */
export function getUsersGroups(user_id: string): Group[] {
	const selectCurrentUsersAnonIds = db.prepare(`SELECT id FROM anon_user WHERE user_id = ?`);
	const selectAnonsGroupIds = db.prepare(
		`SELECT group_id FROM anon_user_groups WHERE anon_user_id = ?`
	);

	const transaction = db.transaction((user_id: string) => {
		const returnGroups: Group[] = [];
		const anon_user_ids = selectCurrentUsersAnonIds.all(user_id) as { id: number }[];
		console.log('anon_user_ids:', anon_user_ids);

		for (const anon_user of anon_user_ids) {
			const group_ids = selectAnonsGroupIds.all(anon_user.id) as { group_id: number }[];
			const group_id_list = group_ids.map((row) => row.group_id);
			console.log('group_id_list:', group_id_list);

			// if the user is not in any groups, return an empty array
			if (group_id_list.length < 1) {
				return returnGroups;
			}

			const selectAnonsGroups = db.prepare(
				`SELECT * FROM user_group WHERE id IN (${group_id_list.map(() => '?').join(',')})`
			);
			const groups = selectAnonsGroups.all(group_id_list) as Group[];
			returnGroups.push(...groups);
		}

		return returnGroups;
	});

	return transaction(user_id);
}

/**
 * Gets the group with the given hashed_id.
 * @param hashed_id The hashed_id of the group.
 * @returns The group object.
 */
export function getGroupByHashedId(hashed_id: string): Group {
	const selectGroup = db.prepare(
		`
    SELECT * FROM user_group WHERE hashed_id = ?
    `
	);

	const group = selectGroup.get(hashed_id) as Group;
	return group;
}

/**
 * Gets the anon_users that are in the given group.
 * @param cookie The hashed token id.
 */
export function getAnonTokenFromCookie(cookie: string): AnonToken {
	const selectAnonToken = db.prepare(`SELECT * FROM anon_token WHERE hashed_anon_user_id = ?`);

	const anon_token = selectAnonToken.get(cookie) as AnonToken;
	return anon_token;
}

/**
 * Sets the anon_token for the anon_user.
 * @param anon_user_id
 * @param group_id
 * @returns The hashed token value for the cookie.
 */
export function setAnonTokenForAnonUser(
	anon_user_id: number,
	group_id: number,
	tokenMaxAge: number
): string {
	const addAnonToken = db.prepare(
		`
    INSERT INTO anon_token (anon_user_id, hashed_anon_user_id, group_id, max_age) VALUES (?, ?, ?, ?)
    `
	);

	// hash it
	const hashed_anon_user_id = createUniqueKey(anon_user_id.toString());
	addAnonToken.run(anon_user_id, hashed_anon_user_id, group_id, tokenMaxAge);

	return hashed_anon_user_id;
}

/**
 * get anon user from a token id
 * @param anon_token_id The id of the anon_token.
 */
export function getAnonUserFromTokenId(anon_token_id: number): AnonUser {
	const selectAnonUserId = db.prepare(`SELECT anon_user_id FROM anon_token WHERE id = ?`);
	const selectAnonUser = db.prepare(`SELECT * FROM anon_user WHERE id = ?`);

	const transaction = db.transaction((anon_token_id: number) => {
		const anon_user_id = selectAnonUserId.get(anon_token_id) as { anon_user_id: number };
		const anon_user = selectAnonUser.get(anon_user_id.anon_user_id) as AnonUser;
		return anon_user;
	});

	return transaction(anon_token_id);
}

/**
 * gets the anon_user with the given user_id
 * @param user_id The user_id of the user.
 */
export function getAnonUserFromUserId(user_id: string): AnonUser {
	const selectAnonUser = db.prepare(`SELECT * FROM anon_user WHERE user_id = ?`);

	const anon_user = selectAnonUser.get(user_id) as AnonUser;
	return anon_user;
}

/**
 *  Gets the anon_users that the given user_id may know.
 * @param user_id The user_id of the user.
 * @returns
 */
export function getAnonUsersUserMaybeKnows(user_id: string): AnonUser[] {
	// we say a user probably knows an anon user if they share at least two groups

	const selectCurrentUsersAnonIds = db.prepare(`SELECT id FROM anon_user WHERE user_id = ?`);
	const selectAnonsGroupIds = db.prepare(
		`SELECT group_id FROM anon_user_groups WHERE anon_user_id = ?`
	);

	const transaction = db.transaction((user_id: string) => {
		const returnUsers: AnonUser[] = [];
		const anon_user_ids = selectCurrentUsersAnonIds.all(user_id) as { id: number }[];
		console.log('anon_user_ids:', anon_user_ids);

		for (const anon_user of anon_user_ids) {
			const group_ids = selectAnonsGroupIds.all(anon_user.id) as { group_id: number }[];
			const group_id_list = group_ids.map((row) => row.group_id);

			console.log('group_id_list:', group_id_list);

			// if the user is not in any groups, return an empty array
			if (group_id_list.length < 1) {
				return returnUsers;
			}

			const selectAnonUsersInSameGroups = db.prepare(
				`
        SELECT anon_user_id FROM anon_user_groups 
        WHERE anon_user_id != ? AND group_id IN (${group_id_list.map(() => '?').join(',')})
        `
			);

			const anon_user_ids_maybe_known = selectAnonUsersInSameGroups.all(
				anon_user.id,
				group_id_list
			) as { anon_user_id: number }[];

			const anon_user_ids_maybe_known_list = anon_user_ids_maybe_known.map(
				(row) => row.anon_user_id
			);

			console.log('anon_user_ids_maybe_known_list:', anon_user_ids_maybe_known_list);

			const selectKnownAnonUsers = db.prepare(
				`
        SELECT * FROM anon_user WHERE id IN (${anon_user_ids_maybe_known_list
					.map(() => '?')
					.join(',')})
        `
			);

			const anonUsers = selectKnownAnonUsers.all(anon_user_ids_maybe_known_list) as AnonUser[];

			returnUsers.push(...anonUsers);
		}

		console.log('returnUsers:', returnUsers);
		return returnUsers;
	});

	return transaction(user_id);
}

// EXAMPLES
//
// export function getInitialTracks(limit = 50): Track[] {
// 	const sql = `
//   select t.TrackId as trackId
//   , t.Name as trackName
//   , a.AlbumId as albumId
//   , a.Title as albumTitle
//   , at.ArtistId as artistId
//   , at.Name as artistName
//   , g.Name as genre
// from tracks t
// join albums a
//  on t.AlbumId = a.AlbumId
// join artists at
//  on a.ArtistId = at.ArtistId
// join genres g
//  on t.GenreId = g.GenreId
// limit $limit
//   `;
// 	const stmnt = db.prepare(sql);
// 	const rows = stmnt.all({ limit });
// 	return rows as Track[];
// }

// export function searchTracks(searchTerm: string, limit = 50): Track[] {
// 	const sql = `
//   select t.TrackId as trackId
//   , t.Name as trackName
//   , a.AlbumId as albumId
//   , a.Title as albumTitle
//   , at.ArtistId as artistId
//   , at.Name as artistName
//   , g.Name as genre
// from tracks t
// join albums a
//  on t.AlbumId = a.AlbumId
// join artists at
//  on a.ArtistId = at.ArtistId
// join genres g
//  on t.GenreId = g.GenreId
// where lower(t.Name) like lower('%' || $searchTerm || '%')
// limit $limit
//   `;
// 	const stmnt = db.prepare(sql);
// 	const rows = stmnt.all({ searchTerm, limit });
// 	return rows as Track[];
// }

// export function getAlbumById(albumId: number): Album {
// 	const sql = `
//   select a.AlbumId as albumId
//      , a.Title as albumTitle
//      , at.ArtistId as artistId
//      , at.Name as artistName
//   from albums a
//   join artists at on a.AlbumId = at.ArtistId
//  where a.AlbumId = $albumId;
//   `;
// 	const stmnt = db.prepare(sql);
// 	const row = stmnt.get({ albumId });
// 	return row as Album;
// }

// export function getAlbumTracks(albumId: number): AlbumTrack[] {
// 	const sql = `
//   select t.TrackId as trackId
//      , t.Name as trackName
//      , t.Milliseconds as trackMs
//   from tracks t
//  where t.AlbumId = $albumId
// order by t.TrackId
// `;
// 	const stmnt = db.prepare(sql);
// 	const rows = stmnt.all({ albumId });
// 	return rows as AlbumTrack[];
// }

// export function updateAlbumTitle(albumId: number, albumTitle: string): void {
// 	const sql = `
//   update albums
//      set Title = $albumTitle
//    where AlbumId = $albumId
// `;
// 	const stmnt = db.prepare(sql);
// 	stmnt.run({ albumId, albumTitle });
// }
