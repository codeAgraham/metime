import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const data = await request.formData();
		const projName = data.get('proj_name');
		const user = await locals.getSession();

		const { error } = await locals.supabase
			.from('projects')
			.insert({ proj_name: projName, user_id: user?.user.id });

		if (error) {
			console.error('Error inserting new project:', error);
			throw new Error('Failed to add new Project');
		} else {
			return {
				success: true
			};
		}
	}
};
