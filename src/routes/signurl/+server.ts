import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		const { filePath } = await request.json();

		if (!filePath) {
			return new Response('File path is required.', { status: 400 });
		}
		const { data, error: supabaseError } = await locals.supabase.storage
			.from('your-private-bucket-name')
			.createSignedUrl(filePath, 3600); // Expires in 1 hour (3600 seconds)

		if (supabaseError) {
			throw supabaseError;
		}

		return json({ signedUrl: data.signedUrl });
	} catch (err) {
		console.log(err);
		throw error(err.message);
	}
};
