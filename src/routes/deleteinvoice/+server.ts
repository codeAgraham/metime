import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, request }) => {
	try {
		const { invoiceId } = await request.json();

		const { error: invoiceDeleteError } = await locals.supabase
			.from('invoices')
			.delete()
			.eq('id', invoiceId);

		if (invoiceDeleteError) {
			throw new Error(invoiceDeleteError.message);
		}

		return new Response(JSON.stringify({ message: 'Invoice deleted successfully' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Could not delete invoice.  Server error. ' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
