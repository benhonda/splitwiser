<script lang="ts">
	import type { TempAnonUser } from '$lib/server/db/types';
	import { createEventDispatcher } from 'svelte';

	export let showModal: boolean;
	const dispatch = createEventDispatcher();

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();

	let new_members: TempAnonUser[] = [];

	let first_name = '';
	let last_name = '';

	function resetDialogFields() {
		first_name = '';
		last_name = '';
		// dialog.close();
	}

	function addNewMember(member: TempAnonUser) {
		// make sure both fields are filled out
		if (!first_name || !last_name) return;
		new_members.push(member);
		new_members = new_members;
		resetDialogFields();
	}

	function removeMember(member: TempAnonUser) {
		new_members = new_members.filter((m) => m !== member);
	}

	function done(added_mems: TempAnonUser[]) {
		if (added_mems.length === 0) return;
		dispatch('done', added_mems);
		resetDialogFields();
		new_members = [];
		dialog.close();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		<h1>Add new group members</h1>

		<label for="_first_name">First name</label><br />
		<input type="text" id="_first_name" bind:value={first_name} />

		<br />

		<label for="last_name">Last name</label><br />
		<input type="text" id="_first_name" bind:value={last_name} />

		{#each new_members as member}
			<div>
				<input hidden type="hidden" name="first_name" value={member.first_name} />
				<input hidden type="hidden" name="last_name" value={member.last_name} />
				<div class="flex justify-between">
					<p>{member.first_name} {member.last_name}</p>
					<button type="button" class="text-red-500" on:click={() => removeMember(member)}
						>Remove</button
					>
				</div>
			</div>
		{/each}

		<button
			type="button"
			class="text-indigo-600"
			on:click={() => addNewMember({ first_name, last_name })}
		>
			Add Group Member
		</button>

		<br />

		<button type="button" class="text-indigo-500" on:click={() => done(new_members)}> Done </button>
	</div>
</dialog>
