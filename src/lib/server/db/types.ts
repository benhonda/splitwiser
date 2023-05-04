export type AnonUser = {
	id: number;
	first_name: string;
	last_name: string;
	created_at: string;
	active: boolean;
	user_id: string; // this is an AuthUser.id
};

export type TempAnonUser = {
	first_name: string;
	last_name: string;
};

export type Group = {
	id: number;
	hashed_id: string;
	hashed_password: string;
	group_name: string;
	created_at: string;
	owner_user_id: string; // this is an AuthUser.id
};

export type AnonToken = {
	id: number;
	hashed_id: string;
	max_age: number;
	anon_user_id: number;
	group_id: number;
	created_at: string;
};

// EXAMPLE TYPES
//
// export type Track = {
// 	trackId: number;
// 	trackName: string;
// 	albumId: number;
// 	albumTitle: string;
// 	artistId: number;
// 	artistName: string;
// 	genre: string;
// };

// export type Album = {
// 	albumId: number;
// 	albumTitle: string;
// 	artistId: number;
// 	artistName: string;
// };

// export type AlbumTrack = {
// 	trackId: number;
// 	trackName: string;
// 	trackMs: number;
// };
