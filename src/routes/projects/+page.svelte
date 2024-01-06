<script lang="ts">
	import type { PageData } from './$types';
	import {
		Tab,
		TabGroup,
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
	let tabSet: number = 0;

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
</script>

<div class="card p-4 variant-filled-secondary" data-popup="popupHover">
	<p>Add New Project</p>
	<div class="arrow variant-filled-secondary" />
</div>

<div class="flex-col justify-center items-center w-full h-screen">
	<div class="w-full text-center mt-6">
		{#if userDetails.first_name}
			<h4 class="h4 font-bold">Hi, {userDetails.first_name}!</h4>
		{:else}
			<div class="flex flex-col justify-center w-40 items-center">
				<h4 class="h4 font-bold">Hi, user!</h4>
				<a href="/account" class="btn btn-sm variant-filled-primary">+ Account Info</a>
			</div>
		{/if}
	</div>

	<div class="card flex-col w-5/6 md:w-3/5 mx-auto mt-5 p-4 space-y-4">
		<div class="flex card-header justify-center items-center">
			<h2 class="h2 font-bold mr-8">Dashboard</h2>
		</div>
		<TabGroup
			border="border-b border-surface-400-500-token"
			active="font-bold border-b-2 border-surface-900-50-token"
		>
			<Tab bind:group={tabSet} name="tab1" value={0}>Your Projects</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Recent Activity</Tab>
			<Tab bind:group={tabSet} name="tab3" value={2}>YTD</Tab>
			{#if tabSet == 0}
				<div class="w-full flex justify-end items-center">
					<a href="/addproject" class="badge variant-filled-secondary h-6" use:popup={popupHover}
						>+</a
					>
				</div>
			{/if}
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<ListBox>
						{#each projects as project}
							<ListBoxItem
								hover="hover:variant-filled-primary"
								bind:group={selectItemId}
								name="project"
								value={project.id}
								><span class="flex justify-center capitalize text-1xl md:text-3xl p-2 m-auto"
									>{project.proj_name}</span
								></ListBoxItem
							>
						{/each}
					</ListBox>
				{:else if tabSet === 1}
					Recent Activity
				{:else if tabSet === 2}
					Yearly Totals
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</div>
