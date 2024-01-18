<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex flex-col justify-center items-center h-screen w-full">
	<h1 class="h2">{$page.status}: {$page.error?.message}</h1>
	{#if $page.status == 404}
		<p class="h2">That link does not exist</p>
	{/if}
</div>
