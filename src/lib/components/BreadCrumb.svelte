<script lang="ts">
	import { format, parseISO } from 'date-fns';
	export let proj_id: string;
	export let proj_name: string;
	export let currentUrl: URL;

	let breadcrumbLabel = '';
	let breadcrumbLink = '';

	$: if (currentUrl) {
		const pathSegments = currentUrl.pathname.split('/');
		const historyIndex = pathSegments.indexOf('history');

		if (historyIndex !== -1) {
			if (historyIndex < pathSegments.length - 1) {
				// Check if the segment after 'history' is a date
				const nextSegment = pathSegments[historyIndex + 1];
				if (isDateString(nextSegment)) {
					breadcrumbLabel = `History for ${formatDateForBreadcrumb(nextSegment)}`;
				} else {
					breadcrumbLabel = 'History';
				}
			} else {
				// 'history' is the last segment
				breadcrumbLabel = 'History';
			}
		} else {
			// Default behavior for other URLs
			const lastSegment = pathSegments[pathSegments.length - 1].toLowerCase();
			switch (lastSegment) {
				case 'addhours':
					breadcrumbLabel = 'Add Hours';
					break;
				default:
					breadcrumbLabel = 'Unknown';
			}
		}

		breadcrumbLink = currentUrl.href;
	}

	function formatDateForBreadcrumb(dateSegment: string): string {
		const date = parseISO(`${dateSegment}-01`); // Adding '-01' to make it a full date
		return format(date, 'MMMM, yyyy');
	}

	function isDateString(segment: string): boolean {
		// Basic check for YYYY-MM format
		return /^\d{4}-\d{2}$/.test(segment);
	}
</script>

<ol class="breadcrumb p-4">
	<li class="crumb"><a class="anchor" href="/projects">Dashboard</a></li>
	<li class="crumb-separator" aria-hidden>&rsaquo;</li>
	<li class="crumb"><a class="anchor capitalize" href={`/projects/${proj_id}`}>{proj_name}</a></li>
	<li class="crumb-separator" aria-hidden>&rsaquo;</li>
	{#if breadcrumbLabel !== 'Unknown'}
		<li class="crumb"><a class="anchor" href={breadcrumbLink}>{breadcrumbLabel}</a></li>
	{/if}
</ol>
