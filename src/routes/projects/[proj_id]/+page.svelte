<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import {
		popup,
		getModalStore,
		getToastStore,
		type ToastSettings,
		type ModalSettings,
		type PopupSettings
	} from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/helpers';

	const toastStore = getToastStore();

	const modalStore = getModalStore();

	export let data: PageData;

	const { proj_name, id } = data.projectWithHours;
	let { hourly_rate, contact_name, contact_email } = data.projectWithHours;
	const currenURL = $page.url;
	let hours: any[] = [];
	let activeDeleteButton: null = null;
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
	let showOptions: boolean = false;

	const popupHover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};

	if (!hourly_rate) {
		hourly_rate = 0.0;
	}

	$: if (data.projectWithHours && data.projectWithHours.hours) {
		hours = data.projectWithHours.hours;
		hours.sort((a, b) => new Date(a.date_worked).getTime() - new Date(b.date_worked).getTime());
	} else {
		hours = [];
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

	$: totalHours = hours.reduce((total: any, currentEntry: { hours_entered: any }) => {
		return total + currentEntry.hours_entered;
	}, 0);

	$: billableThisMonth = (totalHours * hourly_rate).toFixed(2);

	const toggleOptions = () => {
		showOptions = !showOptions;
	};

	async function deleteHour(hourId: number) {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure you wish to delete this hour?',
			buttonTextConfirm: 'Delete',
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
			buttonTextConfirm: 'Delete Forever',
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

	function toggleDeleteButton(entryId: null) {
		activeDeleteButton = activeDeleteButton === entryId ? null : entryId;
	}

	function capitalizeWords(str: string) {
		return str
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	onMount(() => {
		// Convert window.location to a string
		const currentUrl = window.location.toString();
		const url = new URL(currentUrl);
		url.search = ''; // Clears the query parameters
		window.history.replaceState({}, '', url.toString());
	});
</script>

<div class="card p-4 variant-filled-surface z-10" data-popup="popupHover">
	<p>Project Settings</p>
	<div class="arrow variant-filled-surface" />
</div>

<div class="w-full justify-center">
	<ol class="breadcrumb p-4">
		<li class="crumb"><a class="anchor" href="/projects">Dashboard</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor capitalize" href={currenURL.toString()}>{proj_name}</a></li>
	</ol>

	<div class="container mx-auto">
		<div class="mx-4 pb-10">
			<section class="w-full flex items-center justify-between">
				<h2 class="h2 capitalize pt-4 px-8 tracking-tighter antialiased font-semibold">
					{proj_name}
				</h2>
			</section>
			<div class="grid grid-cols-1 md:grid-cols-2 grid-rows-1 gap-4 min-h-[650px]">
				<div class="table-container table-interactive drop-shadow-md">
					<table class="table table-hover h-full">
						<thead>
							<tr>
								<th colspan="3" class="h3 text-center">
									<span
										>hours for {currentMonthName}
										{new Date().getFullYear()}</span
									>
								</th>
							</tr>
							<tr class="h5">
								<th><span class="pl-5">Date</span></th>
								<th colspan="2"><span class="pl-3">Hours</span></th>
							</tr>
						</thead>
						<tbody>
							{#if hours.length === 0}
								<tr>
									<td colspan="2" class="text-center"
										>You have no hours entered for {currentMonthName}</td
									>
								</tr>
							{:else}
								{#each hours as entry (entry.id)}
									<tr class="group" on:click={() => toggleDeleteButton(entry.id)}>
										<td><span class="pl-10">{formatDate(entry.date_worked)}</span></td>
										<td><span class="pl-10">{entry.hours_entered}</span></td>
										<td colspan="2">
											<button
												class="btn btn-sm variant-filled-error invisible opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-300 ease-in-out {activeDeleteButton ===
												entry.id
													? 'opacity-100 visible'
													: ''}"
												on:click={() => deleteHour(entry.id)}
											>
												-
											</button>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
						<tfoot>
							<tr class="variant-soft-tertiary">
								<td
									><a
										href={`/projects/addhours?projectId=${id}`}
										class="btn btn-md variant-filled-tertiary">+ Add hours</a
									></td
								>
								<td class="h4 font-bold" colspan="3"
									>Hours this month: <span class="text-primary-500">{totalHours}</span></td
								>
							</tr>
						</tfoot>
					</table>
				</div>
				<div class="space-y-4">
					<div class="card variant-filled-success drop-shadow-md h-full pb-20">
						<div class="w-full flex justify-end p-6">
							<button
								class="[&>*]:pointer-events-none"
								use:popup={popupHover}
								on:click={toggleOptions}
							>
								<iconify-icon icon="ion:options-outline" class="text-4xl"></iconify-icon>
							</button>
						</div>
						{#if showOptions}
							<div class="flex flex-col items-center">
								<p class="h4">Project Options</p>
								<div class="w-80 flex flex-col justify-center mt-4 space-y-6">
									<form action="?/updateWage" method="post">
										<p class="text-center pb-2">Hourly rate</p>
										<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
											<input
												type="number"
												placeholder="enter hourly rate"
												bind:value={hourly_rate}
												name="wage"
												class="dark:text-white"
											/>

											<input type="hidden" value={id} name="id" />
											<button class="variant-filled">Submit</button>
										</div>
									</form>
									<form action="?/updateName" method="post">
										<p class="text-center pb-2">Contact Name</p>
										<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
											<input
												type="text"
												placeholder="name"
												name="name"
												class="dark:text-white"
												value={contact_name}
											/>

											<input type="hidden" value={id} name="id" />
											<button class="variant-filled">Submit</button>
										</div>
									</form>
									<form action="?/updateEmail" method="post">
										<p class="text-center pb-2">Contact Email</p>
										<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
											<input
												type="email"
												placeholder="email"
												name="email"
												class="dark:text-white"
												value={contact_email}
											/>

											<input type="hidden" value={id} name="id" />
											<button class="variant-filled">Submit</button>
										</div>
									</form>
									<section class="flex flex-col justify-center items-center w-full space-y-6">
										<a
											href={`/projects/history/?pid=${id}`}
											class="btn btn-md variant-filled-secondary w-full">📖 Project History</a
										>
										<button
											class="btn btn-md variant-filled-primary w-full"
											on:click={deleteProject}>⚠️ Delete project</button
										>
									</section>
								</div>
							</div>
						{:else}
							<div class="flex flex-col mt-100 h-full">
								<div class="card-header">
									<h2 class="h3 text-center">Amount billable this month</h2>
								</div>
								<section class="p-4">
									<div class="text-center text-6xl font-extrabold">${billableThisMonth}</div>
								</section>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
