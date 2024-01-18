<script lang="ts">
	import type { PageData } from './$types';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data: PageData;
	export let form: any;

	const t: ToastSettings = {
		message: 'Your account details have been updated successfully!'
	};

	if (form?.success) {
		toastStore.trigger(t);
	}

	const user = data.session?.user;
	let userInfo = { first_name: '', last_name: '' };

	if (data.userDetails && data.userDetails.length > 0) {
		userInfo = { ...userInfo, ...data.userDetails[0] };
	}
</script>

<div class="w-full h-screen flex flex-col items-center mt-10">
	<div class="card md:w-3/5 p-8">
		<div class="card-header">
			<h1 class="h2 mb-2">Account Details</h1>
			<span>{user?.email}</span>
		</div>
		<hr class="my-10" />
		<section class="flex w-full justify-center">
			<div class="w-11/12 md:w-1/2">
				<p class="mt-4">Update Name</p>
				<form method="POST" class="flex flex-col">
					<div class="flex flex-col">
						<label class="label !mt-8">
							<span>First</span>
							<input
								class="input"
								type="text"
								name="fname"
								placeholder="First"
								bind:value={userInfo.first_name}
							/>
						</label>
						<label class="label !mt-8">
							<span>Last</span>
							<input
								class="input"
								type="text"
								name="lname"
								placeholder="Last"
								bind:value={userInfo.last_name}
							/>
						</label>
					</div>
					<button class="btn btn-l variant-filled-secondary mx-auto w-40 mt-20">Save</button>
				</form>
				<div class="w-full flex justify-center">
					<a href="projects" class="btn btn-l variant-filled-error w-40 mt-4">Cancel</a>
				</div>
			</div>
		</section>
	</div>
</div>
