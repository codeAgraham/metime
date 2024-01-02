import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getSession();
	const { data: userDetails, error: err } = await locals.supabase
		.from('user_info')
		.select('*')
		.eq('uuid', user?.user.id);

	if (err) {
		error(500, { message: 'Could not get user information from server.' });
	}

	return {
		userDetails
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const firstName = data.get('fname') as string;
		const lastName = data.get('lname') as string;
		const user = await locals.getSession();

		const { error: err } = await locals.supabase
			.from('user_info')
			.insert({ first_name: firstName, last_name: lastName, uuid: user?.user.id })
			.eq('uuid', user?.user.id);

		if (err) {
			throw error(500, 'Could not update your username');
		}

		return { success: true };
	}
};
