import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Get the first and last day of the current month
	const currentDate = new Date();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
	const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

	const { data: projectWithHours, error } = await locals.supabase
		.from('projects')
		.select(
			`
            *,
            hours (
                *
            )
        `
		)
		.eq('id', params.proj_id)
		.gte('hours.date_worked', firstDayOfMonth.toISOString())
		.lte('hours.date_worked', lastDayOfMonth.toISOString())
		.single();

	if (error) {
		throw new Error('Failed to fetch data');
	}

	return {
		projectWithHours
	};
};
