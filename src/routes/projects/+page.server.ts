import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { format } from 'date-fns';

type MonthlyTotals = {
	[key: string]: number;
};

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	// Check if the user is logged in
	if (!session || !session.user) {
		error(401, { message: 'User not logged in.' });
	}

	// Fetch projects
	const { data: projects, error: projectsError } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('user_id', session?.user.id);

	// Handle error while fetching projects
	if (projectsError) {
		error(500, { message: 'Failed to fetch projects' });
	}

	// Fetch user details
	const { data: userDetails, error: userDetailsError } = await locals.supabase
		.from('user_info')
		.select('*')
		.eq('uuid', session?.user.id);

	// Handle error while fetching user details
	if (userDetailsError) {
		error(500, { message: 'Failed to fetch user details' });
	}

	// Fetch the 10 most recent entries from 'hours' table and join with 'projects'
	const { data: recentActivity, error: recentActivityError } = await locals.supabase
		.from('hours')
		.select(
			`
            created_at,
            hours_entered,
            projects (
                proj_name,
				id
            )
        `
		)
		.eq('projects.user_id', session?.user.id) // Assuming projects.user_id should match the session user
		.order('created_at', { ascending: false })
		.limit(10);

	// Handle error while fetching recent activity
	if (recentActivityError) {
		error(500, { message: 'Failed to fetch recent activity' });
	}

	// Current Year
	const currentYear = new Date().getFullYear();

	const { data: monthlyTotals, error: monthlyTotalsError } = await locals.supabase
		.from('hours')
		.select(
			`
        date_worked,
        hours_entered,
        projects (
            user_id
        )
    `
		)
		.eq('projects.user_id', session?.user.id)
		.gte('date_worked', `${currentYear}-01-01`)
		.lte('date_worked', `${currentYear}-12-31`)
		.order('date_worked', { ascending: true });

	if (monthlyTotalsError) {
		console.error('Query Error:', monthlyTotalsError);
		error(500, { message: 'Failed to fetch monthly totals' });
	}
	// Aggregate data by month
	const aggregatedData = monthlyTotals?.reduce((acc: MonthlyTotals, entry) => {
		const month = format(new Date(entry.date_worked), 'MM');
		acc[month] = (acc[month] || 0) + entry.hours_entered;
		return acc;
	}, {} as MonthlyTotals);

	console.log(aggregatedData);

	// Return all data
	return {
		projects,
		userDetails,
		recentActivity,
		monthlyTotals: aggregatedData
	};
};
