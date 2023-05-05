<script lang="ts">
	import { enhance } from '$app/forms';
	import type { AnonUser, Group } from '$lib/server/db/types';
	import { createEventDispatcher } from 'svelte';
	// import type { PageData } from './$types';
	// export let data: PageData;
	export let showModal: boolean;
	export let anon_user_and_group: AnonUser & Group;

	const dispatch = createEventDispatcher();

	function shouldConnectAnonUser(should_connect_account: boolean) {
		dispatch('shouldConnectAnonUser', should_connect_account);
	}

	let should_connect_account = true;

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:close={() => (showModal = false)}>
	<div on:click|stopPropagation>
		<h1>Is this you?</h1>

		<p>
			It looks like you signed in with the name <span class="font-bold"
				>{anon_user_and_group.first_name} {anon_user_and_group.last_name}</span
			>
			in the group <span class="font-bold">{anon_user_and_group.group_name}</span>. Is this you?
		</p>

		<p>
			Note: by selecting yes, you will be able to view this on your 'Groups' page. This will NOT
			change the name of the member in the group, which is {anon_user_and_group.first_name}
			{anon_user_and_group.last_name}
		</p>

		<input hidden type="hidden" name="anon_user_id" required value={anon_user_and_group.id} />

		<label>
			<input
				type="radio"
				bind:group={should_connect_account}
				name="should_connect_account"
				value={true}
			/>
			Yes, {anon_user_and_group.first_name}
			{anon_user_and_group.last_name} is me
		</label>

		<label>
			<input
				type="radio"
				bind:group={should_connect_account}
				name="should_connect_account"
				value={false}
			/>
			No, this is not me
		</label>

		<button type="submit" class="text-indigo-600">Save</button>

		<!-- <button
			type="button"
			class="text-indigo-600"
			on:click={() => shouldConnectAnonUser(should_connect_account)}>Save</button
		> -->
	</div>
</dialog>
