import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const { error } = await locals.supabase.auth.signOut();

	if (error) {
		console.error('Error signing out:', error);
		return new Response('Error signing out', { status: 500 });
	}

	// Redirect to the home page
	throw redirect(303, '/');
};
