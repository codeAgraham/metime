import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, options);
			},
			remove: (key, options) => {
				event.cookies.delete(key, options);
			}
		}
	});

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	const session = await event.locals.getSession();

	// Define an array of protected routes
	const protectedRoutes = ['/projects', '/account', '/addproject']; // Add your routes here

	// Define a function to check if the current route is in the protectedRoutes array
	const isProtectedRoute = (path: string) => {
		return protectedRoutes.some((protectedPath) => path.startsWith(protectedPath));
	};

	// Check if the current path is a protected route
	if (isProtectedRoute(event.url.pathname)) {
		// If there's no session and the route is protected, redirect to login
		if (!session) {
			throw redirect(301, '/login?redirected=true');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
