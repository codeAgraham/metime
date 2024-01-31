<script lang="ts">
	import { format, parseISO } from 'date-fns';
	export let proj_id: string;
	export let proj_name: string;
	export let currentUrl: URL;

	let breadcrumbLabel = 'History';
	let dateBreadcrumbLabel = ''; // Variable for date breadcrumb
	let breadcrumbLink = ''; // Updated link logic for 'History'

	$: if (currentUrl) {
		const pathSegments = currentUrl.pathname.split('/').filter((segment) => segment.length > 0);
		const historyIndex = pathSegments.indexOf('history');

		if (historyIndex !== -1 && historyIndex < pathSegments.length - 1) {
			const nextSegment = pathSegments[historyIndex + 1];
			if (isDateString(nextSegment)) {
				dateBreadcrumbLabel = `History for ${formatDateForBreadcrumb(nextSegment)}`;
				// Set breadcrumbLink for 'History' when there is a date
				breadcrumbLink = `/projects/history?pid=${proj_id}`;
			} else {
				// Fallback URL if next segment is not a date
				breadcrumbLink = currentUrl.href;
			}
		} else {
			// Set the default URL if 'history' is not in the URL
			breadcrumbLink = currentUrl.href;
		}
	}

	function formatDateForBreadcrumb(dateSegment: string): string {
		const date = parseISO(`${dateSegment}-01`); // Making it a full date
		return format(date, 'MMMM, yyyy');
	}

	function isDateString(segment: string): boolean {
		return /^\d{4}-\d{2}$/.test(segment);
	}
</script>

<ol class="breadcrumb p-4">
	<li class="crumb"><a class="anchor" href="/projects">Dashboard</a></li>
	<li class="crumb-separator" aria-hidden>&rsaquo;</li>
	<li class="crumb"><a class="anchor capitalize" href={`/projects/${proj_id}`}>{proj_name}</a></li>
	<li class="crumb-separator" aria-hidden>&rsaquo;</li>
	<li class="crumb"><a class="anchor" href={breadcrumbLink}>{breadcrumbLabel}</a></li>
	{#if dateBreadcrumbLabel}
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor" href={breadcrumbLink}>{dateBreadcrumbLabel}</a></li>
	{/if}
</ol>
