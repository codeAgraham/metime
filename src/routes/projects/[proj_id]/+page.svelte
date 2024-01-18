<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import {
		getModalStore,
		getToastStore,
		type ToastSettings,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/helpers';

	const toastStore = getToastStore();

	const modalStore = getModalStore();

	export let data: PageData;

	const { proj_name, id } = data.projectWithHours;
	const currenURL = $page.url;
	let hours: any[] = [];

	$: if (data.projectWithHours && data.projectWithHours.hours) {
		hours = data.projectWithHours.hours;
		hours.sort((a, b) => new Date(a.date_worked).getTime() - new Date(b.date_worked).getTime());
	} else {
		hours = [];
	}

	function capitalizeWords(str: string) {
		return str
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	$: if ($page.url.searchParams.get('success') === 'true') {
		const projectName = decodeURIComponent($page.url.searchParams.get('proj_name') || '');
		const capitalizedName = capitalizeWords(projectName);
		const message = projectName
			? `Hours added successfully to ${capitalizedName}!`
			: 'Hours added successfully!';
		const t: ToastSettings = {
			message: message
		};
		toastStore.trigger(t);
	}

	let monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	let today = new Date();
	let currentMonthName = monthNames[today.getMonth()];

	$: totalHours = hours.reduce((total: any, currentEntry: { hours_entered: any }) => {
		return total + currentEntry.hours_entered;
	}, 0);

	async function deleteHour(hourId: number) {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure you wish to delete this hour?',
			response: async (confirmDelete: boolean) => {
				if (confirmDelete) {
					try {
						const response = await fetch(`/deletehour`, {
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ hourId })
						});

						if (!response.ok) {
							throw new Error('Failed to delete hour');
						}

						const index = hours.findIndex((hour) => hour.id === hourId);
						if (index !== -1) {
							hours.splice(index, 1);
							hours = hours.slice(); // Trigger reactivity
						}

						toastStore.trigger({ message: 'Hour deleted successfully' });
					} catch (error) {
						console.error('Error deleting hour:', error);

						// Check if error is an instance of Error
						if (error instanceof Error) {
							toastStore.trigger({
								message: `Error deleting hour: ${error.message}`,
								background: 'variant-filled-error'
							});
						} else {
							// If it's not an Error instance, handle it as a generic error
							toastStore.trigger({
								message: 'Error deleting hour: An unknown error occurred',
								background: 'variant-filled-error'
							});
						}
					}
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function deleteProject() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Confirm Deletion',
			body: `Are you sure you want to delete ${proj_name}? This cannot be undone!`,
			buttonTextConfirm: 'Yes, delete this project forever',
			response: (confirm: boolean) => {
				if (confirm) {
					performDeletion();
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function performDeletion() {
		const { error } = await data.supabase.from('projects').delete().eq('id', id);
		if (!error) {
			toastStore.trigger({
				message: `${proj_name} deleted successfully`
			});
			// Redirect to projects page or a safe page
			goto('/projects');
		} else {
			console.error('Error deleting project:', error);
			toastStore.trigger({
				message: `Error deleting project: ${error.message}`
			});
		}
	}

	onMount(() => {
		// Convert window.location to a string
		const currentUrl = window.location.toString();
		const url = new URL(currentUrl);
		url.search = ''; // Clears the query parameters
		window.history.replaceState({}, '', url.toString());
	});
</script>

<div class="w-full justify-center">
	<ol class="breadcrumb p-6">
		<li class="crumb"><a class="anchor" href="/projects">Dashboard</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor capitalize" href={currenURL.toString()}>{proj_name}</a></li>
	</ol>
	<div class="table-container table-interactive mx-auto w-11/12 md:w-3/5 mt-6">
		<table class="table table-hover">
			<thead>
				<tr>
					<th colspan="2" class="h2">
						<span class="text-primary-500">{proj_name} </span>
						<span
							>hours for {currentMonthName}
							{new Date().getFullYear()}</span
						>
					</th>
					<th></th>
				</tr>
				<tr class="h5">
					<th><span class="pl-5">Date</span></th>
					<th><span class="pl-3">Hours</span></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each hours as entry (entry.id)}
					<tr class="group">
						<td><span class="pl-10">{formatDate(entry.date_worked)}</span></td>
						<td><span class="pl-10">{entry.hours_entered}</span></td>
						<td>
							<button
								class="btn btn-sm variant-filled-error opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
								on:click={() => deleteHour(entry.id)}
							>
								-
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="variant-soft-tertiary">
					<td></td>
					<td class="h4 font-bold" colspan="2"
						>Month Total: <span class="text-primary-500">{totalHours}</span></td
					>
				</tr>
			</tfoot>
		</table>
	</div>
</div>

<div class="flex w-full justify-center mt-10 px-4 space-x-4">
	<a href={`/projects/addhours?projectId=${id}`} class="btn variant-filled-tertiary">+ Add hours</a>
	<a href={`/projects/history/?pid=${id}`} class="btn btn-sm variant-filled-success"
		>📖 Project History</a
	>
	<button class="btn btn-sm variant-filled-primary" on:click={deleteProject}
		>⚠️ Delete project</button
	>
</div>
