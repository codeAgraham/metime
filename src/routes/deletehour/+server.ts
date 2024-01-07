import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		const { hourId } = await request.json();

		// Perform the deletion logic here
		const { error } = await locals.supabase.from('hours').delete().eq('id', hourId);

		if (error) {
			return new Response(JSON.stringify({ error: 'Failed to delete hour' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		return new Response(JSON.stringify({ message: 'Hour deleted successfully' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: 'An error occurred' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
