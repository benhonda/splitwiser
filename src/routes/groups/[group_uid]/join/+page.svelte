<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	export let data: PageData;

	let anon_user_id: number;
</script>

<div>
	<br />
	<h1>Group: {data.group.group_name}</h1>
	<h2>Please identify yourself:</h2>

	<form method="POST" action="/groups/{data.group.hashed_id}/join" use:enhance>
		<input hidden type="hidden" name="group_id" required value={data.group.id} />

		{#each data.anonUsers as anonUser}
			<label>
				<input
					disabled={anonUser.active}
					type="radio"
					bind:group={anon_user_id}
					name="anon_user_id"
					value={anonUser.id}
				/>
				{anonUser.first_name}&nbsp;{anonUser.last_name}&nbsp;{anonUser.active ? '(taken)' : ''}
			</label>
			<br />
		{/each}

		<button type="submit">Join</button>
	</form>
</div>
