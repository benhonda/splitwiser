<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	export let data: PageData;

	// let groups: number[] = [];
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
		{#each data.groups as group}
			<label>
				<input type="checkbox" bind:group={groups} id={`group_${group.id}`} name="group_ids" value={group.id} />
				{group.group_name}
			</label>
			<br />
		{/each}

		<p>Groups selected</p>
		{#each groups as group_id}
			<p>{data.groups.find((group) => group.id == group_id)?.group_name}</p>
		{/each} -->

		<!-- URL params
      - group_id optional number
      - temp_group_name optional string
      - from optional string, tells you where to navigate after successful submit
    -->

		<input type="submit" value="Add Group Member" />
	</form>
</div>
