<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<div>
	<h1>Create an account</h1>
	<form method="POST" use:enhance>
		<label for="first_name">First name</label><br />
		<input id="first_name" name="first_name" /><br />

		<label for="last_name">Last name</label><br />
		<input id="last_name" name="last_name" /><br />

		<label for="email">Email</label><br />
		<input id="email" name="email" /><br />

		<label for="password">Password</label><br />
		<input type="password" id="password" name="password" /><br />

		<input type="submit" value="Signup" />
	</form>
</div>
