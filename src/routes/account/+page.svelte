<script lang="ts">
	import type { PageData } from './$types';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data: PageData;
	/** @type {import('./$types').ActionData} */
	export let form: any;

	const t: ToastSettings = {
		message: 'Your account details have been updated successfully!'
	};

	if (form?.success) {
		toastStore.trigger(t);
	}

	const user = data.session?.user;
	let userInfo: { [x: string]: any };

	if (data.userDetails) {
		userInfo = data.userDetails[0];
	}
</script>

<div class="w-full h-screen flex flex-col items-center mt-10">
	<div class="card w-5/6 md:w-3/5 p-8">
		<div class="card-header">
			<h1 class="h2 mb-2">Account Details</h1>
			<span>{user?.email}</span>
		</div>
		<hr class="my-10" />
		<section class="mt-4">
			<div class="px-10">
				<p class="mt-20 mb-4">Name</p>
				<form method="POST" class="flex flex-col">
					<div class="flex">
						<input
							class="input mr-6 mb-4"
							type="text"
							name="fname"
							placeholder="First"
							bind:value={userInfo.first_name}
						/>
						<input
							class="input mb-4"
							type="text"
							name="lname"
							placeholder="Last"
							bind:value={userInfo.last_name}
						/>
					</div>
					<button class="btn btn-l variant-filled-secondary mx-auto w-40 mt-20">Save</button>
				</form>
			</div>
		</section>
	</div>
</div>
