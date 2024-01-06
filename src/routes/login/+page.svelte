<script lang="ts">
	import { page } from '$app/stores';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	$: if ($page.url.searchParams.get('redirected') === 'true') {
		const t: ToastSettings = {
			message: 'You must be logged in to access that page',
			background: 'variant-filled-error'
		};
		toastStore.trigger(t);
	}
</script>

<div class="flex justify-center items-center mt-32">
	<div class="w-4/5 md:w-2/5 card variant-filled">
		<h1 class="h1 card-header pb-4 pl-12">Login</h1>
		<form method="POST" class="w-4/6 m-auto pb-10 space-y-4">
			<label class="label">
				<span>email</span>
				<input class="input dark:text-white" type="email" name="email" />
			</label>
			<label class="label">
				<span>password</span>
				<input class="input text-black dark:text-white" type="password" name="password" />
			</label>
			<button class="btn variant-filled-primary w-full">Submit</button>
		</form>
	</div>
</div>
