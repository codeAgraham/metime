import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

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

	const { data: projectWithHours, error: projectError } = await locals.supabase
		.from('projects')
		.select(`*, hours (*)`)
		.eq('id', params.proj_id)
		.gte('hours.date_worked', firstDayISO)
		.lte('hours.date_worked', lastDayISO)
		.single();

	if (projectError) {
		console.log(projectError.message);
		error(500, { message: projectError.hint });
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

		const { error: updateError } = await locals.supabase
			.from('projects')
			.update({ hourly_rate: wageNumber })
			.eq('id', projId)
			.select();

		if (updateError) {
			console.log(updateError.message);
			error(500, { message: updateError.hint });
		}

		return { success: true };
	},
	updateName: async ({ locals, request }) => {
		const data = await request.formData();
		const projId = data.get('id');
		const name = data.get('name') as string;

		const { error: updateError } = await locals.supabase
			.from('projects')
			.update({ contact_name: name })
			.eq('id', projId)
			.select();

		if (updateError) {
			console.log(updateError.message);
			error(500, { message: updateError.hint });
		}

		return { success: true };
	},
	updateEmail: async ({ locals, request }) => {
		const data = await request.formData();
		const projId = data.get('id');
		const email = data.get('email') as string;

		const { error: updateError } = await locals.supabase
			.from('projects')
			.update({ contact_email: email })
			.eq('id', projId)
			.select();

		if (updateError) {
			console.log(updateError.message);
			error(500, { message: updateError.hint });
		}

		return { success: true };
	}
};
