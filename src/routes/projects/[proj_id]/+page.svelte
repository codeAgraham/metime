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

	function formatDate(dateStr: string) {
		// Extract the year, month, and day from the date string
		const [year, month, day] = dateStr.split('-').map((part) => parseInt(part));

		// Create a new date object using the year, month (adjusted for zero-index), and day
		let date = new Date(year, month - 1, day);

		let monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		let monthIndex = date.getMonth();
		let dayOfMonth = date.getDate();

		return `${monthNames[monthIndex]} ${dayOfMonth}, ${year}`;
	}

	$: totalHours = hours.reduce((total: any, currentEntry: { hours_entered: any }) => {
		return total + currentEntry.hours_entered;
	}, 0);

	function deletHour(hourId: number) {
		new Promise<boolean>((resolve) => {
			const modal: ModalSettings = {
				type: 'confirm',
				title: 'Please Confirm',
				body: 'Are you sure you wish to delete this hour?',
				response: (r: boolean) => {
					resolve(r);
				}
			};
			modalStore.trigger(modal);
		}).then(async (confirmDelete) => {
			if (confirmDelete) {
				const { error } = await data.supabase.from('hours').delete().eq('id', hourId);
				if (!error) {
					const index = hours.findIndex((hour) => hour.id === hourId);
					if (index !== -1) {
						hours.splice(index, 1);
						hours = hours.slice(); // this reassignment should trigger reactivity
					}
				} else {
					console.error('Error deleting hour:', error);
				}
			}
		});
	}

	async function deleteProject() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Confirm Deletion',
			body: `Are you sure you want to delete ${proj_name}?`,
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
		<!-- <li>Hours</li> -->
	</ol>
	<div class="table-container table-interactive mx-auto w-5/6 md:w-3/5 mt-6">
		<table class="table table-hover">
			<thead>
				<tr>
					<th colspan="2" class="h3 lg:h2 text-center">
						<span class="text-primary-500">{proj_name}</span>
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
								on:click={() => deletHour(entry.id)}
							>
								-
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="variant-soft-tertiary">
					<td
						><a href={`/projects/addhours?projectId=${id}`} class="btn variant-filled-tertiary ml-4"
							>+ Add hours</a
						></td
					>
					<td class="h4 font-bold" colspan="2"
						>Month Total: <span class="text-primary-500">{totalHours}</span></td
					>
				</tr>
			</tfoot>
		</table>
		<div class="flex w-full justify-center mt-10">
			<button class="btn variant-filled-primary w-auto" on:click={deleteProject}
				>Delete this project</button
			>
		</div>
	</div>
</div>
