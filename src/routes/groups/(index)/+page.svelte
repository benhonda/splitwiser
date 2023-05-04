<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div>
	<h1>Your groups:</h1>

	{#each data.groups as group}
		<a href="/groups/{group.hashed_id}/">
			{group.group_name}
		</a>
	{/each}
</div>
