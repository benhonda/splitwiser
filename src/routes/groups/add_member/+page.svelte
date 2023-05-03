<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	export let data: PageData;

	// let parties: number[] = [];
</script>

<div>
	<h1>Add a new group member</h1>
	<!-- <p>User id: {data.user.userId}</p>
	<p>Email: {data.user.email}</p> -->

	<form method="POST" use:enhance>
		<label for="first_name">First name</label><br />
		<input id="first_name" name="first_name" /><br />

		<label for="last_name">Last name</label><br />
		<input id="last_name" name="last_name" /><br />

    <!-- show all groups that the user has write access to -->
    <!-- Nevermind, don't allow users to add to multiple groups at a time -->
		<!-- <p>Add to group(s)</p>
		{#each data.parties as party}
			<label>
				<input type="checkbox" bind:group={parties} id={`party_${party.id}`} name="party_ids" value={party.id} />
				{party.party_name}
			</label>
			<br />
		{/each}

		<p>Parties selected</p>
		{#each parties as party_id}
			<p>{data.parties.find((party) => party.id == party_id)?.party_name}</p>
		{/each} -->

		<!-- URL params
      - group_id optional number
      - temp_group_name optional string
      - from optional string, tells you where to navigate after successful submit
    -->

		<input type="submit" value="Add Group Member" />
	</form>
</div>
