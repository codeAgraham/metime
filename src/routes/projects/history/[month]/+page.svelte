<script lang="ts">
	import type { PageData } from './$types';
	import { format, parse, parseISO } from 'date-fns';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	let entries: any[];
	let project: { id: any; proj_name: any; hourly_rate: any };
	let formattedMonth: string;
	let totalHours = 0;
	let currentUrl = $page.url;

	// Simple utility to ensure UTC dates are formatted to their literal calendar day
	function formatDateKeepingUTC(dateStr: string) {
		// Extract the date part (yyyy-MM-dd) directly from the ISO string
		const datePart = dateStr.split('T')[0];
		// Parse this date part as if it's the full timestamp, avoiding timezone offsets
		const date = parseISO(datePart);
		// Format the date for display
		return format(date, 'MMMM dd, yyyy');
	}

	if (data.entries) {
		entries = data.entries
			.map((entry) => ({
				...entry,
				formattedDate: formatDateKeepingUTC(entry.date_worked)
			}))
			// Sort the entries by date_worked in ascending order
			.sort((a, b) => a.date_worked.localeCompare(b.date_worked));
		totalHours = entries.reduce((sum, entry) => sum + entry.hours_entered, 0);
	}
	if (data.project) {
		project = data.project[0];
	}

	if (data.monthParam) {
		const monthDate = parse(data.monthParam, 'yyyy-MM', new Date());
		formattedMonth = format(monthDate, 'MMMM, yyyy');
	}

	$: billedForMonth = (project.hourly_rate * totalHours).toFixed(2);
</script>

<div class="flex flex-col items-center w-full">
	<BreadCrumb proj_id={project.id} proj_name={project.proj_name} {currentUrl} />
	<div class="table-container w-11/12 md:w-3/5 mt-8">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Date</th>
					<th>Hours Entered</th>
				</tr>
			</thead>
			<tbody>
				{#each entries as entry}
					<tr>
						<td>{entry.formattedDate}</td>
						<td>{entry.hours_entered}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th>Total for month</th>
					<td class="font-bold text-primary-800-100-token">{totalHours}</td>
				</tr>
				<tr>
					<th>Amount billed for {formattedMonth}</th>
					<td class="font-bold text-success-800-100-token">${billedForMonth}</td>
				</tr>
			</tfoot>
		</table>
	</div>
</div>
