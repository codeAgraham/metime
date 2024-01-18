import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getSession();

	if (user) {
		throw redirect(303, '/projects');
	}

	return {};
};
/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		const { error: err } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (err) {
			throw error(401, `Your login attempt failed. ${err.message}`);
		}

		throw redirect(303, '/projects');
	}
};
