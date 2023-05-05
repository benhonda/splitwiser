<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { TempAnonUser } from '$lib/server/db/types';
	import AddGroupMemberModal from '../../AddGroupMemberModal.svelte';
	export let data: PageData;

	let showModal = false;
	let partiers: TempAnonUser[] = [];
	$: partiersJsonString = JSON.stringify(partiers);

	// this function is called when the user clicks the "Add Group Member" button from the modal
	function handleAddGroupMember(event: CustomEvent) {
    const newMembers: TempAnonUser[] = event.detail;
		partiers.push(...newMembers);
		partiers = partiers;
		console.log(partiers);
	}
</script>

<div>
	<h1>Let's create a group</h1>
	<!-- <p>User id: {data.user.id}</p>
	<p>Email: {data.user.email}</p> -->

	<form method="POST" use:enhance>
		<label for="group_name">Group name</label><br />
		<input id="group_name" name="group_name" /><br />

		<label for="group_members">Group members</label><br />
		<button type="button" on:click={() => (showModal = true)}>Add Group Members</button>

    <AddGroupMemberModal bind:showModal on:done={handleAddGroupMember} />
		<input type="hidden" hidden name="group_members" bind:value={partiersJsonString} />

		{#each data.anonUsers as anon_user}
			<p>{anon_user.first_name} {anon_user.last_name} (id: {anon_user.id}, user_id: {anon_user.user_id})</p>
		{/each}

		{#each partiers as partier}
			<p>{partier.first_name} {partier.last_name}</p>
		{/each}

		<!-- 

      get the anon_user_id's for the current user
      from all groups, get all the groups that the anon_user_id is a member of
      from all the groups that the user is a member of, get all the anon users that are members of those groups

     -->

		<!-- URL params
      - temp_group_name optional string, (this pre-populates the group name field if the user is returning from the add_member page)
      - temp_group_members optional string, (this pre-populates the group members field if the user is returning from the add_member page). Obviously, we will need to check that the user has permission to add these members to the group.
    -->

		<br />
		<br />
		<input type="submit" value="Create Group" />
	</form>
</div>
