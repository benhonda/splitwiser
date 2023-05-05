<script lang="ts">
	import { enhance } from '$app/forms';
	import ConnectAnonUserModal from '../ConnectAnonUserModal.svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let showModal = data.anon_user_and_group_from_token !== null;

	function handleShouldConnectAnonUser(event: CustomEvent) {
		const decision: boolean = event.detail;
	}
</script>

<div>
	<p>Hello, {data.anon_user_primary.first_name}&nbsp;{data.anon_user_primary.last_name}</p>

	<h1>Your groups:</h1>

	{#each data.groups as group}
		<a href="/groups/{group.hashed_id}/">
			{group.group_name}
		</a>
	{/each}

	{#if data.anon_user_and_group_from_token && !data.anon_user_and_group_from_token.user_id}
		<form action="?/connect_anon_user" method="POST" use:enhance>
			<ConnectAnonUserModal
				bind:showModal
				anon_user_and_group={data.anon_user_and_group_from_token}
			/>
		</form>
	{/if}
</div>
