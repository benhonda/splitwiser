<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import AddMemberModal from '../AddMemberModal.svelte';
	import type { TempAnonUser } from '$lib/server/db/types';
	export let data: PageData;

	let showModal = false;
	let partiers: TempAnonUser[] = [];
	$: partiersJsonString = JSON.stringify(partiers);

	// this function is called when the user clicks the "Add Group Member" button from the modal
	function handleAddPartyMember(event: CustomEvent) {
		partiers.push(event.detail);
		// Why no reactivity?
		// From svelte:
		// A simple rule of thumb: the updated variable must directly appear on the left hand side of the assignment.
		partiers = partiers;
		console.log(partiers);
	}
</script>

<div>
	<h1>Let's create a group</h1>
	<p>User id: {data.user.id}</p>
	<p>Email: {data.user.email}</p>

	<form method="POST" use:enhance>
		<label for="party_name">Group name</label><br />
		<input id="party_name" name="party_name" /><br />

		<label for="party_members">Group members</label><br />
		<button type="button" on:click={() => (showModal = true)}>Add Group Members</button>

		<AddMemberModal bind:showModal on:addPartyMember={handleAddPartyMember} />
		<input type="hidden" hidden name="party_members" bind:value={partiersJsonString} />

		{#each data.anonUsers as anon_user}
			<p>{anon_user.first_name} {anon_user.last_name} {anon_user.user_id}</p>
		{/each}

		{#each partiers as partier}
			<p>{partier.first_name} {partier.last_name}</p>
		{/each}

		<!-- 

      get the anon_user_id's for the current user
      from all parties, get all the parties that the anon_user_id is a member of
      from all the parties that the user is a member of, get all the anon users that are members of those parties

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
