<script lang="ts">
	import type { PageData } from './$types';
	import { parse, format } from 'date-fns';

	export let data: PageData;
	let monthsWithEntries: any;

	if (data.uniqueMonths) {
		monthsWithEntries = data.uniqueMonths;
	}

	// monthsWithEntries = [];

	function formatMonths(dates: string[]): string[] {
		return dates.map((date) => {
			// Parse the date string into a Date object
			const parsedDate: Date = parse(date, 'yyyy-MM', new Date());

			// Format the Date object into the desired format
			return format(parsedDate, 'MMMM, yyyy');
		});
	}

	const formattedMonths: string[] = formatMonths(monthsWithEntries);
</script>

<h1>History</h1>
{#if formattedMonths && formattedMonths.length > 0}
	{#each formattedMonths as month}
		<p>{month}</p>
	{/each}
{:else}
	<p>You have no history for this project yet</p>
{/if}
