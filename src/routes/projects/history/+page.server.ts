import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { format } from 'date-fns';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	// Check if the user is logged in
	if (!session || !session.user) {
		error(401, { message: 'User not logged in.' });
	}

	// Extract project ID from query parameter
	const projectId = url.searchParams.get('pid');
	if (!projectId) {
		error(400, { message: 'Project ID not provided.' });
	}

	// Fetch all hours entries for the specified project
	const { data: hoursData, error: hoursError } = await locals.supabase
		.from('hours')
		.select('date_worked')
		.eq('proj_id', projectId) // Filter by the provided project ID
		.order('date_worked', { ascending: true });

	if (hoursError) {
		error(500, { message: 'Failed to fetch hours data' });
	}

	// Process the entries to get unique months
	const uniqueMonthsSet = new Set();
	hoursData?.forEach((entry) => {
		const monthYear = format(new Date(entry.date_worked), 'yyyy-MM');
		uniqueMonthsSet.add(monthYear);
	});

	const uniqueMonths = Array.from(uniqueMonthsSet);

	// Return the unique months
	return { uniqueMonths };
};
