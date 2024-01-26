<script lang="ts">
	import { page } from '$app/stores';
	import { getToastStore, ProgressRadial } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';

	const toastStore = getToastStore();

	let loading: boolean = false;

	$: if ($page.url.searchParams.get('redirected') === 'true') {
		const t: ToastSettings = {
			message: 'You must be logged in to access that page',
			background: 'variant-filled-error'
		};
		toastStore.trigger(t);
	}

	$: if ($page.url.searchParams.get('newsignup') === 'true') {
		const t: ToastSettings = {
			message: 'Please check your email to verify your account before signing in!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(t);
	}
</script>

<div class="flex flex-col items-center mt-14 h-full md:justify-center md:mt-auto">
	<div class="w-11/12 md:w-2/5 card min-h-fit py-10">
		<h1 class="h3 font-bold pl-8 md:pl-20 pt-6 uppercase !rounded-sm">Login</h1>
		<form
			method="POST"
			class="w-5/6 m-auto py-6 md:px-10 space-y-4"
			use:enhance={() => {
				loading = true;
				return async ({ update, result }) => {
					await update();
					await applyAction(result);
					if (result.type === 'success') {
						goto('/projects');
					}
				};
			}}
		>
			<label class="label">
				<span>email</span>
				<input
					class="input text-black dark:text-white"
					type="email"
					name="email"
					autocomplete="username"
				/>
			</label>
			<label class="label">
				<span>password</span>
				<input
					class="input text-black dark:text-white"
					type="password"
					name="password"
					autocomplete="current-password"
				/>
			</label>
			<button class="btn variant-filled-primary w-full !mt-8" disabled={loading}>
				{#if loading}
					<ProgressRadial value={undefined} width="w-4" />
				{:else}
					Submit
				{/if}
			</button>
		</form>
		<div class="my-4 w-full flex justify-center">
			<p>or sign up <a href="/signup" class="anchor">here</a></p>
		</div>
	</div>
</div>
