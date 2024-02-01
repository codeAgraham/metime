import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const timeZone = 'UTC'; // Specify your desired time zone
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

	const currentDate = new Date();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
	const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

	// Format dates in the specified time zone
	const firstDayISO = formatter.format(firstDayOfMonth) + 'T00:00:00Z';
	const lastDayISO = formatter.format(lastDayOfMonth) + 'T23:59:59Z';

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
