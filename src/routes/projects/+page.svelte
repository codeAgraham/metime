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
	import { formatDate } from '$lib/utils/helpers';

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

	let recentActivity: any;
	if (data.recentActivity) {
		recentActivity = data.recentActivity;
	}
</script>

<div class="card p-4 variant-filled-secondary" data-popup="popupHover">
	<p>Add New Project</p>
	<div class="arrow variant-filled-secondary" />
</div>

<div class="flex-col justify-center items-center w-full h-screen">
	<div
		class="card flex-col w-11/12 md:w-4/5 mx-auto mt-8 min-h-[calc(100vh_-_20%)] p-4 space-y-4 overflow-auto"
	>
		<div class="grid grid-cols-3 grid-rows-1 gap-4 h-14">
			<div class="pl-4">
				{#if userDetails.first_name}
					<h4 class="h4 font-bold">Hi, {userDetails.first_name}!</h4>
				{:else}
					<h4 class="h4 font-bold">Hi, <a href="/account" class="anchor">user!</a></h4>
				{/if}
			</div>
			<h2 class="h2 font-bold text-center">Dashboard</h2>
		</div>
		<TabGroup
			border="border-b border-surface-400-500-token"
			active="font-bold border-surface-900-50-token variant-filled-primary"
			regionList="w-11/12 mx-auto"
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
								><span class="flex justify-center capitalize text-1xl md:text-3xl p-2"
									>{project.proj_name}</span
								></ListBoxItem
							>
						{/each}
					</ListBox>
				{:else if tabSet === 1}
					<div class="table-container w-11/12 mx-auto pt-10">
						<!-- Native Table Element -->
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Date</th>
									<th>Hours Entered</th>
									<th>Project Name</th>
								</tr>
							</thead>
							<tbody>
								{#each recentActivity as entry}
									<tr>
										<td>{formatDate(entry.created_at)}</td>
										<td class="!pl-10 md:!pl-20">{entry.hours_entered}</td>
										<td>
											<a href={`/projects/${entry.projects.id}`} class="capitalize anchor pl-2"
												>{entry.projects.proj_name}</a
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if tabSet === 2}
					Yearly Totals
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</div>
