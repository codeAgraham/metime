<script lang="ts">
	import type { PageData } from './$types';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	let sliderValue = 0;
	let isSubmitEnabled = false;

	const project = data.project[0];

	// Reactive statement to update the submit button state
	$: isSubmitEnabled = sliderValue >= 1;

	// Function to reset custom validation message
	function handleDateChange(event) {
		event.target.setCustomValidity('');
	}

	// Function to set custom validation message
	function handleInvalidDate(event) {
		event.target.setCustomValidity('A full date is required.');
	}
</script>

<div class="w-full justify-center">
	<BreadCrumb proj_id={project.id} proj_name={project.proj_name} currentUrl={$page.url} />
	<div class="card p-8 mx-auto w-11/12 md:w-3/5 my-6">
		<div class="card-header">
			<h1 class="h2 text-center">
				Add Hours for <span class="capitalize">{project.proj_name}</span>
			</h1>
		</div>
		<div id="form-container" class="flex justify-center items-center h-1/2 py-6">
			<form
				method="post"
				class="w-full text-center flex flex-col justify-center items-center space-y-16"
			>
				<input type="range" name="hours" bind:value={sliderValue} max="24" class="w-3/6 mt-8" />
				<input
					type="date"
					name="date"
					id="date"
					class="w-3/6 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					required
					on:change={handleDateChange}
					on:invalid={handleInvalidDate}
				/>
				<p class="h1 text-8xl mt-8">{sliderValue}</p>
				<input type="number" name="proj_id" value={project.id} hidden />
				<input type="text" name="proj_name" bind:value={project.proj_name} hidden />
				<button class="btn btn-lg variant-filled-primary w-3/5" disabled={!isSubmitEnabled}
					>Submit</button
				>
			</form>
		</div>
	</div>
</div>
