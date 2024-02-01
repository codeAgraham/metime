import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Use UTC dates for the start and end of the month
	const currentDate = new Date();
	const firstDayOfMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
	const lastDayOfMonth = new Date(
		Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
	);

	// Convert to ISO string
	const firstDayISO = firstDayOfMonth.toISOString();
	const lastDayISO = lastDayOfMonth.toISOString();

	const { data: projectWithHours, error } = await locals.supabase
		.from('projects')
		.select(`*, hours (*)`)
		.eq('id', params.proj_id)
		.gte('hours.date_worked', firstDayISO)
		.lte('hours.date_worked', lastDayISO)
		.single();

	if (error) {
		return fail(500, { message: 'Failed to load project.' });
	}

	return { projectWithHours };
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
