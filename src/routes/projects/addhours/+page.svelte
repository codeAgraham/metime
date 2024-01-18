<script lang="ts">
	import type { PageData } from './$types';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	let sliderValue = 0;

	const project = data.project[0];

	console.log(project);
</script>

<div class="w-full justify-center">
	<BreadCrumb proj_id={project.id} proj_name={project.proj_name} currentUrl={$page.url} />
	<div class="card px-10 mx-auto w-11/12 md:w-3/5 mt-6">
		<div class="card-header my-10">
			<h1 class="h2 text-center">
				Add Hours for <span class="capitalize">{project.proj_name}</span>
			</h1>
		</div>
		<div id="form-container" class="flex flex-col justify-center items-center h-1/2">
			<form method="post" class="w-full text-center">
				<input type="range" name="hours" bind:value={sliderValue} max="24" class="w-4/5" />
				<input type="date" name="date" id="date" class="mt-10" />
				<p class="h1 text-8xl mt-8">{sliderValue}</p>
				<input type="number" name="proj_id" value={project.id} hidden />
				<input type="text" name="proj_name" bind:value={project.proj_name} hidden />
				<button class="btn btn-lg variant-filled-primary my-10 w-3/5">Submit</button>
			</form>
		</div>
	</div>
</div>
