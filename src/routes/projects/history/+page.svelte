<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { parse, format } from 'date-fns';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

	export let data: PageData;
	let monthsWithEntries: any;
	let selectedMonth: string = '';
	let projName: string;
	let projectId: string;
	const currentURL = $page.url;

	if (data.uniqueMonths) {
		monthsWithEntries = data.uniqueMonths;
	}

	if (data.projectName?.proj_name) {
		projName = data.projectName.proj_name;
	}

	if (data.projectId) {
		projectId = data.projectId;
	}

	function formatMonths(dates: string[]): { formatted: string; original: string }[] {
		return dates.map((date) => {
			const parsedDate: Date = parse(date, 'yyyy-MM', new Date());
			const formattedDate: string = format(parsedDate, 'MMMM, yyyy');
			return { formatted: formattedDate, original: date };
		});
	}
	const formattedMonths: { formatted: string; original: string }[] =
		formatMonths(monthsWithEntries);

	function navigateToMonth(month: string) {
		goto(`/projects/history/${month}?projectId=${projectId}`);
	}
</script>

<div class="w-full flex flex-col justify-center items-center">
	<BreadCrumb proj_id={projectId} proj_name={projName} currentUrl={currentURL} />
	<div class="card w-11/12 md:w-3/5 p-4">
		<h1 class="h2 card-header font-bold">
			<span class="capitalize text-primary-500">{projName} </span>History
		</h1>
		<section class="p-4">
			{#if formattedMonths && formattedMonths.length > 0}
				<ListBox>
					{#each formattedMonths as month}
						<ListBoxItem
							on:click={() => navigateToMonth(month.original)}
							bind:group={selectedMonth}
							name="month"
							value={month.original}><span class="anchor">{month.formatted}</span></ListBoxItem
						>
					{/each}
				</ListBox>
			{:else}
				<p>You have no history for this project yet</p>
			{/if}
		</section>
	</div>
</div>
