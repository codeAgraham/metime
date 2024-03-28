<script lang="ts">
	import type { PageData } from './$types';
	import { format, parse, parseISO } from 'date-fns';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { page } from '$app/stores';
	import { getToastStore, ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data: PageData;

	let entries: any[];
	let project: { id: any; proj_name: any; hourly_rate: any };
	let invoices: any[];
	let formattedMonth: string;
	let totalHours = 0;
	let currentUrl = $page.url;
	const deleted = false;

	// Simple utility to ensure UTC dates are formatted to their literal calendar day
	function formatDateKeepingUTC(dateStr: string) {
		const datePart = dateStr.split('T')[0];
		const date = parseISO(datePart);
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

	if (data.invoices) {
		invoices = data.invoices;
	}

	$: billedForMonth = (project.hourly_rate * totalHours).toFixed(2);

	const createInvoice = async () => {
		try {
			const response = await fetch('/createinvoice', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					projectId: project.id,
					monthParam: data.monthParam
				})
			});

			if (!response.ok) {
				// Handle non-2xx responses
				const errorData = await response.json();
				console.error('Failed to create invoice:', errorData.message);
			} else {
				const responseData = await response.json();
				invoices = responseData;
				console.log('Invoice created successfully:', responseData);
			}
		} catch (error) {
			console.error('Error creating invoice:', error);
		}
	};

	const deleteInvoice = async () => {
		try {
			const response = await fetch('/deleteinvoice', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					invoiceId: invoices[0].id
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Failed to create invoice:', errorData.message);
			} else {
				// Successfully deleted the invoice
				const responseData = await response.json();
				invoices = [];
			}
		} catch (error) {
			console.error('Error creating invoice:', error);
		}
	};

	const generatePdf = async () => {
		try {
			const response = await fetch('/generatepdf', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					invoiceId: invoices[0].id
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Failed to create pdf:', errorData.message);
			} else {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				// Instead of downloading, open in a new tab
				window.open(url, '_blank');
				window.URL.revokeObjectURL(url); // Optional: Clean up object URL
			}
		} catch (error) {
			console.error('Error creating pdf:', error);
		}
	};
</script>

<div class="flex flex-col items-center w-full">
	<BreadCrumb proj_id={project.id} proj_name={project.proj_name} {currentUrl} />
	<div class="table-container w-11/12 md:w-3/5 my-8">
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
					<td class="font-bold text-success-800-100-token"
						>${billedForMonth}
						<button
							class="btn btn-sm variant-filled-success md:ml-8"
							disabled={invoices.length > 0}
							on:click={createInvoice}>Create Invoice</button
						>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
	{#if invoices.length > 0}
		<div class="mb-8 text-center">
			<p>You have created an invoice for this month:</p>
			<div class="flex">
				<p class="text-secondary-500">{invoices[0].invoice_number}</p>
				<button
					class="text-success-800 text-sm ml-4 hover:underline"
					on:click={() => generatePdf(invoices[0].id)}>Download</button
				>
				<button
					on:click={() => deleteInvoice()}
					class="text-primary-500 text-sm ml-4 hover:underline">Delete</button
				>
			</div>
		</div>
	{/if}
</div>
