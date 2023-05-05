<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<!-- group home -->
	<a href="/groups/{data.group.hashed_id}/">Group Home</a>
	<!-- settings link -->
	<a href="/groups/{data.group.hashed_id}/settings">Settings</a>

	<hr />

	<slot>
		<!--  -->
	</slot>
</div>
