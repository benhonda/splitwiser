import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import type { AnonUser, TempAnonUser } from './types';
import { QueryLoader } from './QueryLoader';
import { readFileSync } from 'fs';

const db = new Database(DB_PATH, { verbose: console.log });
// why WAL? https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
// db.pragma('journal_mode = WAL');

// this is a class that we use to cache queries... though I'm not sure we actually need it...
// more on that later.
// const queryLoader = new QueryLoader();

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

export function createPartyWithMembers(
	owner_user_id: string,
	party_name: string,
	members: TempAnonUser[]
): void {
	// create a new party
	const addParty = db.prepare(
		`
    INSERT INTO party (party_name, owner_user_id) VALUES (?, ?)
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

	// add the new party to the anon_users
	const addPartyToAnonUsers = db.prepare(
		`
    INSERT INTO anon_user_party (anon_user_id, party_id) VALUES (?, ?)
    `
	);

	const newPartyWithMembers = db.transaction((members: TempAnonUser[]) => {
		// add the party
		const party_id = addParty.run(party_name, owner_user_id).lastInsertRowid;
		console.log('party_id:', party_id);

		// add the owner to the party
		const owners_anon = getAnonUserId.get(owner_user_id) as { id: number };
		addPartyToAnonUsers.run(owners_anon.id, party_id);

		for (const member of members) {
			console.log('member:', member);
			// add the anon user
			const anon_id = addAnonUser.run(member).lastInsertRowid;
			// add the many-to-many relationship between the anon user and the party
			addPartyToAnonUsers.run(anon_id, party_id);
		}
	});

	newPartyWithMembers(members);
}

export function getAnonUsersUserMaybeKnows(user_id: string): AnonUser[] {
	// we say a user probably knows an anon user if they share at least two parties

	const selectCurrentUsersAnonIds = db.prepare(
		`
    SELECT id FROM anon_user WHERE user_id = ? 
    `
	);

	const selectAnonsPartyIds = db.prepare(
		`
    SELECT party_id FROM anon_user_party WHERE anon_user_id = ? 
    `
	);

	const transaction = db.transaction((user_id: string) => {
		const returnUsers: AnonUser[] = [];
		const anon_user_ids = selectCurrentUsersAnonIds.all(user_id) as { id: number }[];
		console.log('anon_user_ids:', anon_user_ids);

		for (const anon_user of anon_user_ids) {
			const party_ids = selectAnonsPartyIds.all(anon_user.id) as { party_id: number }[];
			const party_id_list = party_ids.map((row) => row.party_id);

			console.log('party_id_list:', party_id_list);

			// if the user is not in any parties, return an empty array
			if (party_id_list.length < 1) {
				return returnUsers;
			}

			const selectAnonUsersInSameParties = db.prepare(
				`
        SELECT anon_user_id FROM anon_user_party 
        WHERE anon_user_id != ? AND party_id IN (${party_id_list.map(() => '?').join(',')})
        `
			);

			const anon_user_ids_maybe_known = selectAnonUsersInSameParties.all(
				anon_user.id,
				party_id_list
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
