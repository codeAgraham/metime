<script lang="ts">
	import type { PageData } from './$types';
	import {
		ListBox,
		ListBoxItem,
		getToastStore,
		type ToastSettings,
		popup
	} from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	export let data: PageData;

	const toastStore = getToastStore();

	$: if ($page.url.searchParams.get('projectadded') === 'true') {
		const t: ToastSettings = {
			message: 'New Project Added!'
		};
		toastStore.trigger(t);
	}

	let selectItemId: number = 0;

	// Reactive statement to detect changes in selectItemId
	$: if (selectItemId) {
		goto(`/projects/${selectItemId}`);
	}

	const popupHover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};

	let projects: any[];
	if (data.projects) {
		projects = data.projects;
	}

	let userDetails: any;
	if (data.userDetails) {
		userDetails = data.userDetails[0];
	}

	userDetails = [];
</script>

<div class="card p-4 bg-success-700" data-popup="popupHover">
	<p>Add New Project</p>
	<div class="arrow bg-success-700" />
</div>

<div class="flex-col justify-center items-center w-full h-screen">
	{#if userDetails.first_name}
		<h4 class="h4 font-bold ml-10 mt-10">Hi, {userDetails.first_name}!</h4>
	{:else}
		<h4 class="h4 font-bold ml-10 mt-10">Hi!</h4>
	{/if}
	<div class="card flex-col w-5/6 md:w-3/5 mx-auto mt-5 p-4 space-y-4">
		<div class="flex card-header justify-between items-center">
			<h2 class="h1 text-center w-full">Your Projects</h2>
			<a href="/addproject" class="badge bg-success-700 h-6" use:popup={popupHover}>+</a>
		</div>
		<ListBox>
			{#each projects as project}
				<ListBoxItem
					hover="hover:variant-filled-primary"
					bind:group={selectItemId}
					name="project"
					value={project.id}
					><span class="flex justify-center capitalize text-2xl md:text-4xl w-full p-2"
						>{project.proj_name}</span
					></ListBoxItem
				>
			{/each}
		</ListBox>
	</div>
</div>
