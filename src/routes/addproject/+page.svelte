<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	let loading = false;
</script>

<div class="flex w-full h-screen flex-col mt-10 items-center">
	<div class="w-11/12 md:w-3/5 card py-10">
		<div class="w-full flex justify-center">
			<h1 class="h2">Add Project</h1>
		</div>

		<form
			method="POST"
			class="w-4/6 m-auto space-y-4 pb-20"
			use:enhance={() => {
				loading = true;
				return async ({ update, result }) => {
					await update();
					await applyAction(result);
					if (result.type === 'success') {
						goto('/projects?success=true&projectadded=true');
					}
					loading = false;
				};
			}}
		>
			<label class="label mt-10">
				<span>Project Name</span>
				<input class="input text-black dark:text-white" type="text" name="proj_name" />
			</label>
			<div class="w-full flex justify-center pt-2">
				<button class="btn variant-filled-primary" type="submit" disabled={loading}>
					{#if loading}
						<ProgressRadial value={undefined} width="w-4" />
					{:else}
						Submit
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
