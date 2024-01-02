import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

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
		const data = await request.formData();
		const hours = data.get('hours');
		const date = data.get('date');
		const proj_id = data.get('proj_id') as string;
		const proj_name = data.get('proj_name') as string;

		const { error } = await locals.supabase
			.from('hours')
			.insert({ hours_entered: hours, proj_id: proj_id, date_worked: date });

		if (error) {
			console.log(error.message, error.details);
			throw new Error('Failed to insert new project');
		} else {
			// Redirect to the specific project page with the success parameter and project name
			throw redirect(
				303,
				`/projects/${encodeURIComponent(proj_id)}?success=true&proj_name=${encodeURIComponent(
					proj_name
				)}`
			);
		}
	}
};
