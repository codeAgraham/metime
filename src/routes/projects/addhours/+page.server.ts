import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const projectId = url.searchParams.get('projectId');

	const { data: project, error } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('id', projectId);

	if (error) {
		throw new Error('Failed to fetch data');
	}

	return {
		project: project
	};
}) satisfies PageServerLoad;

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getSession();
		const data = await request.formData();
		const hours = data.get('hours');
		const date = data.get('date');
		const proj_id = data.get('proj_id') as string;
		const userId = user?.user.id;

		const { error } = await locals.supabase
			.from('hours')
			.insert({ hours_entered: hours, proj_id: proj_id, date_worked: date, user_id: userId });

		if (error) {
			console.log(error.message, error.details);
			throw new Error('Failed to insert new project');
		} else {
			return { success: true };
		}
	}
};
