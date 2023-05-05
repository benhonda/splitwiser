<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import AddGroupMemberModal from '../../../AddGroupMemberModal.svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let addGroupMembersForm: HTMLFormElement;
	let showAddMembersModal = false;
</script>

<div>
	<h1>Settings</h1>

	<h2>Invite Group Members</h2>

	<p>
		Invite link:
		<a href={$page.url.toString().split('/').slice(0, -1).join('/')} class="text-blue-600">
			{$page.url.toString().split('/').slice(0, -1).join('/')}
		</a>
	</p>

	<p>
		You can also send personalized invite links, which will forego the "identify yourself" step when
		the user clicks the link. See Manage Group Members to get personalized invite links. Either one
		will work. If you have group members who have the same or very similar names, you may want to
		opt for personalized invite links so that there is no risk of them clicking the wrong name.
	</p>

	<br />

	<h2>Manage Group Members</h2>

	{#each data.anonUsers as group_member}
		<table class="min-w-[600px] text-left">
			<tr class="flex">
				<th class="flex-[2_2_0%]">Name</th>
				<th class="flex-1 sr-only">Invite</th>
				<th class="flex-1 sr-only">Remove</th>
			</tr>
			<tr class="flex">
				<td class="flex-[2_2_0%]">{group_member.first_name} {group_member.last_name}</td>
				<td class="flex-1 text-right">
					<!-- copy invite link button -->
					<button class="text-blue-600">Copy invite link</button>
				</td>
				<td class="flex-1 text-right">
					{#if group_member.user_id !== data.group.owner_user_id}
						<form action="?/removeGroupMember" method="POST" use:enhance>
							<input hidden type="hidden" name="group_id" required value={data.group.id} />
							<input hidden type="hidden" name="anon_user_id" required value={group_member.id} />
							<button type="submit" class="text-red-500">Remove</button>
						</form>
					{/if}
				</td>
			</tr>
		</table>
	{/each}

	<!-- add group member -->
	<button class="text-blue-600" on:click={() => (showAddMembersModal = true)}>
		Add group members
	</button>

	<form bind:this={addGroupMembersForm} action="?/addGroupMembers" method="POST" use:enhance>
		<input hidden type="hidden" name="group_id" required value={data.group.id} />

		<!-- modal -->
		<AddGroupMemberModal
			bind:showModal={showAddMembersModal}
			on:done={() => addGroupMembersForm.requestSubmit()}
		/>
	</form>
</div>
