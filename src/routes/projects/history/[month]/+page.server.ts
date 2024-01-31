import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const session = await locals.getSession();

	// Check if the user is logged in
	if (!session || !session.user) {
		throw error(401, 'User not logged in.');
	}

	// Extract month from the route parameters and projectId from the query string
	const monthParam = params.month;
	const projectId = url.searchParams.get('projectId');

	if (!monthParam || !projectId) {
		throw error(400, 'Missing month or project ID.');
	}

	// Parse the monthParam to a Date object and define the start and end of the month
	const monthDate = parse(monthParam, 'yyyy-MM', new Date());
	const startOfTheMonth = startOfMonth(monthDate);
	const endOfTheMonth = endOfMonth(monthDate);

	// Fetch entries from 'hours' for the given month and project ID
	const { data: entries, error: entriesError } = await locals.supabase
		.from('hours')
		.select('*')
		.eq('proj_id', projectId)
		.gte('date_worked', format(startOfTheMonth, 'yyyy-MM-dd'))
		.lte('date_worked', format(endOfTheMonth, 'yyyy-MM-dd'));

	// Handle error while fetching entries
	if (entriesError) {
		throw error(500, 'Failed to fetch entries');
	}

	const { data: project, error: projectError } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('id', projectId);

	if (projectError) {
		throw error(500, 'Failed to fetch project name.');
	}

	// Return the entries
	return {
		entries,
		project,
		monthParam
	};
};
