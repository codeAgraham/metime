import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	return {
		isAuthenticated: !!session?.user
	};
};
