import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { email, password, fname, lname } = body;

		// Step 1: Sign up the user
		const signUpResponse = await locals.supabase.auth.signUp({ email, password });
		if (signUpResponse.error) throw signUpResponse.error;

		// Ensure the user object is returned
		const user = signUpResponse.data.user;
		if (!user) throw new Error('User creation failed');

		// Step 2: Add first name and last name to 'user_info' table
		const { error: userInfoError } = await locals.supabase
			.from('user_info')
			.insert({ first_name: fname, last_name: lname, uuid: user.id });

		if (userInfoError) throw userInfoError;

		// Success response
		return new Response(JSON.stringify({ message: 'Registration complete!' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		// Error handling
		console.error('Registration error:', err);
		return new Response(JSON.stringify({ message: 'Registration failed', error: err }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
