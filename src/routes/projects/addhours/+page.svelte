<script lang="ts">
	import type { PageData } from './$types';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { page } from '$app/stores';
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	export let data: PageData;

	let loading = false;
	let sliderValue = 0;
	let isSubmitEnabled = false;

	const project = data.project[0];

	// Reactive statement to update the submit button state
	$: isSubmitEnabled = sliderValue >= 0.5;

	function handleDateChange(event: Event) {
		const input = event.target as HTMLInputElement;
		input.setCustomValidity('');
	}

	function handleInvalidDate(event: Event) {
		const input = event.target as HTMLInputElement;
		input.setCustomValidity('A full date is required.');
	}

	const increaseSliderVal = () => {
		sliderValue = sliderValue + 0.5;
	};

	const decreaseSliderVal = () => {
		if (sliderValue > 0.5) {
			sliderValue = sliderValue - 0.5;
		}
	};
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
				use:enhance={() => {
					loading = true;
					return async ({ update, result }) => {
						await update();
						await applyAction(result);
						if (result.type === 'success') {
							goto(`/projects/${project.id}?success=true&projectadded=true`);
						}
					};
				}}
			>
				{#if !loading}
					<input
						type="range"
						name="hours"
						bind:value={sliderValue}
						step=".5"
						max="24"
						class="w-full md:w-4/6 mt-8"
					/>
				{:else}
					<ProgressRadial value={undefined} width="w-12" />
				{/if}

				<input
					type="date"
					name="date"
					id="date"
					class="w-3/6 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					required
					on:change={handleDateChange}
					on:invalid={handleInvalidDate}
				/>
				<div class="flex justify-center h-fit items-center space-x-10">
					<button
						on:click={() => {
							decreaseSliderVal();
						}}
						class="bg-slate-200 border border-gray-500 rounded-full w-20 h-20 text-4xl dark:text-black"
						>-</button
					>
					<p class="text-5xl md:text-8xl w-20 md:w-44">{sliderValue}</p>
					<button
						on:click={() => {
							increaseSliderVal();
						}}
						class="bg-slate-200 border border-gray-500 rounded-full w-20 h-20 text-4xl dark:text-black"
						>+</button
					>
				</div>
				<input type="number" name="proj_id" value={project.id} hidden />
				<input type="text" name="proj_name" bind:value={project.proj_name} hidden />
				<button
					class="btn btn-lg variant-filled-primary w-3/5"
					disabled={!isSubmitEnabled || loading}
				>
					{#if loading}
						<ProgressRadial value={undefined} width="w-6" />
					{:else}
						Submit
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
