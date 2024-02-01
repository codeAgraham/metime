import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

export const load: PageServerLoad = async ({ locals, params }) => {
	const currentDate = new Date();
	const firstDayOfMonth = startOfMonth(currentDate);
	const lastDayOfMonth = endOfMonth(currentDate);

	const firstDayISO = formatISO(firstDayOfMonth);
	const lastDayISO = formatISO(lastDayOfMonth);

	console.log('First Day: ', firstDayISO);
	console.log('Last Day: ', lastDayISO);

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
		.gte('hours.date_worked', firstDayISO)
		.lte('hours.date_worked', lastDayISO)
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
