import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const data = await request.formData();
		const projName = data.get('proj_name');
		const user = await locals.getSession();

		const { error } = await locals.supabase
			.from('projects')
			.insert({ proj_name: projName, user_id: user?.user.id });

		if (error) {
			console.log('Error inserting new project');
			throw new Error('Failed to insert project');
		} else {
			throw redirect(303, `/projects?success=true&projectadded=true`);
		}
	}
};
