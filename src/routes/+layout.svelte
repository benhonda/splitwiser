<script lang="ts">
	import '../app.css';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div>
	<nav>
		<ul class="flex space-x-6">
			{#if !data.user}
				<li><a href="/signup">Register</a></li>
				<li><a href="/login" role="button">Login</a></li>
			{:else}
				<li>
					<form method="post" action="/logout">
						<input type="submit" class="button" value="Sign out" />
					</form>
				</li>
			{/if}
		</ul>
	</nav>

	<main>
		<slot>
			<!--  -->
		</slot>
	</main>
</div>
