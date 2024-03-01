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
	import BarChart from '$lib/components/BarChart.svelte';

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
		placement: 'bottom'
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

	let aggregateData: any;
	if (data.monthlyTotals) {
		aggregateData = data.monthlyTotals;
	}
</script>

<div class="card p-4 variant-filled-primary" data-popup="popupHover">
	<p>Add New Project</p>
	<div class="arrow variant-filled-primary" />
</div>

<div class="flex-col justify-center items-center w-full h-screen space-y-4 pt-10">
	<div class="grid grid-cols-3 grid-rows-1 gap-0 w-full text-center items-center">
		<div class="font-bold text-xs md:text-lg md:font-medium">
			{#if userDetails}
				<p>Hi, {userDetails.first_name}!</p>
			{:else}
				<p>Hi, new user!</p>
			{/if}
		</div>
		<div>
			<h1 class="h1">Dashboard</h1>
		</div>
		<div></div>
	</div>
	<div
		class="flex-col w-11/12 md:w-3/4 mx-auto min-h-[calc(100vh_-_20%)] p-4 space-y-4 overflow-auto"
	>
		<TabGroup
			border="border-b border-surface-400-500-token"
			regionList="text-sm"
			regionPanel="pt-2"
		>
			<Tab bind:group={tabSet} name="tab1" value={0}>Your Projects</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Recent Activity</Tab>
			<Tab bind:group={tabSet} name="tab3" value={2}>YTD</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					{#if projects && projects.length > 0}
						<ListBox spacing="space-y-2" active="variant-filled-secondary">
							{#each projects as project}
								<ListBoxItem bind:group={selectItemId} name="project" value={project.id}>
									<span class="flex justify-center capitalize text-1xl md:text-3xl p-2">
										{project.proj_name}
									</span>
								</ListBoxItem>
							{/each}
						</ListBox>
						<div class="w-full flex justify-center mt-4">
							<a
								href="/addproject"
								class="badge variant-filled-primary w-8 h-8"
								use:popup={popupHover}>+</a
							>
						</div>
					{:else}
						<div class="text-center p-4">
							<p>To get started, add a project</p>
							<a href="/addproject" class="badge variant-filled-secondary h-6 my-4">Add Project</a>
						</div>
					{/if}
				{:else if tabSet === 1}
					{#if recentActivity && recentActivity.length > 0}
						<div class="table-container mx-auto">
							<table class="table">
								<thead class="text-sm">
									<tr>
										<th>Date</th>
										<th>Hours Entered</th>
										<th>Project Name</th>
									</tr>
								</thead>
								<tbody class="text-sm">
									{#each recentActivity as entry}
										<tr>
											<td>{formatDate(entry.created_at)}</td>
											<td class="!pl-10 md:!pl-20">{entry.hours_entered}</td>
											<td>
												<a href={`/projects/${entry.projects?.id}`} class="capitalize anchor pl-2">
													{entry.projects?.proj_name}
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="text-center p-4">
							<p>No activity on account yet.</p>
						</div>
					{/if}
				{:else if tabSet === 2}
					<div class="card w-full drop-shadow-md">
						<div class="p-4 md:p-16 md:w-3/5 mx-auto">
							<BarChart {aggregateData} />
						</div>
					</div>
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</div>
