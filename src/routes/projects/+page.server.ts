import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	// Check if the user is logged in
	if (!session || !session.user) {
		error(401, { message: 'User not logged in.' });
	}

	// Fetch projects
	const { data: projects, error: projectsError } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('user_id', session?.user.id);

	// Handle error while fetching projects
	if (projectsError) {
		error(500, { message: 'Failed to fetch projects' });
	}

	// Fetch user details
	const { data: userDetails, error: userDetailsError } = await locals.supabase
		.from('user_info')
		.select('*')
		.eq('uuid', session?.user.id);

	// Handle error while fetching user details
	if (userDetailsError) {
		error(500, { message: 'Failed to fetch user details' });
	}

	// Return both projects and userDetails
	return {
		projects,
		userDetails
	};
};
