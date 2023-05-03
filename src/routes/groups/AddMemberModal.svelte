<script lang="ts">
	import { enhance } from '$app/forms';
	import { createEventDispatcher } from 'svelte';
	// import type { PageData } from './$types';
	// export let data: PageData;
	export let showModal: boolean;
	const dispatch = createEventDispatcher();

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();

	let first_name = '';
	let last_name = '';

	function resetDialog() {
		first_name = '';
		last_name = '';
		// dialog.close();
	}

	function addPartyMember(first_name: string, last_name: string) {
		dispatch('addPartyMember', { first_name, last_name });
		resetDialog();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		<h1>Add a new group member</h1>
		<!-- <p>User id: {data.user.userId}</p>
	<p>Email: {data.user.email}</p> -->

		<label for="first_name">First name</label><br />
		<input type="text" id="first_name" bind:value={first_name} />

		<br />

		<label for="last_name">Last name</label><br />
		<input type="text" id="last_name" bind:value={last_name} />

		<button
			type="button"
			class="text-indigo-600"
			on:click={() => addPartyMember(first_name, last_name)}>Add Group Member</button
		>
	</div>
</dialog>
