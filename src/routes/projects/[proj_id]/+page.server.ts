import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

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
		return fail(500, { message: 'Failed to load project.' });
	}

	return {
		projectWithHours
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	updateWage: async ({ locals, request }) => {
		const data = await request.formData();
		const projId = data.get('id');
		const wage = data.get('wage') as string;

		const wageNumber = parseFloat(wage);

		console.log(wageNumber, typeof wageNumber);

		const { error: error } = await locals.supabase
			.from('projects')
			.update({ hourly_rate: wageNumber })
			.eq('id', projId)
			.select();

		if (error) {
			console.log(error);
			throw fail(500, { message: 'Failed to update wage' });
		}

		return { success: true };
	}
};
