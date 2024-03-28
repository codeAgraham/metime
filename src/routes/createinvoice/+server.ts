import { endOfMonth, format, parse, startOfMonth } from 'date-fns';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session || !session.user) {
		return new Response('User not logged in.', { status: 401 });
	}

	const { projectId, monthParam } = await request.json();
	if (!projectId || !monthParam) {
		return new Response('Missing month or project ID.', { status: 400 });
	}

	const monthDate = parse(monthParam, 'yyyy-MM', new Date());
	const startOfTheMonth = startOfMonth(monthDate);
	const endOfTheMonth = endOfMonth(monthDate);

	// Calculate total hours worked
	const { data: hours, error: hoursError } = await locals.supabase
		.from('hours')
		.select('hours_entered')
		.eq('proj_id', projectId)
		.gte('date_worked', format(startOfTheMonth, 'yyyy-MM-dd'))
		.lte('date_worked', format(endOfTheMonth, 'yyyy-MM-dd'));

	if (hoursError) {
		throw error(500, 'Failed to calculate total hours.');
	}

	const totalHours = hours.reduce((acc, curr) => acc + curr.hours_entered, 0);

	// Fetch hourly rate and other project details as needed
	const { data: project, error: projectError } = await locals.supabase
		.from('projects')
		.select('hourly_rate')
		.eq('id', projectId)
		.single();

	if (projectError) {
		throw error(500, 'Could not find project id');
	}

	const today = new Date();
	const dateString = format(today, 'yyyyMMdd');

	const { data: lastInvoice } = await locals.supabase
		.from('invoices')
		.select('invoice_number')
		.like('invoice_number', `INV-${dateString}-%`)
		.order('invoice_number', { ascending: false })
		.limit(1)
		.single();

	let nextSeqNumber = 1;
	if (lastInvoice) {
		const lastSeq = parseInt(lastInvoice.invoice_number.split('-')[2], 10);
		nextSeqNumber = lastSeq + 1;
	}

	const invoiceNumber = `INV-${dateString}-${nextSeqNumber.toString().padStart(4, '0')}`;

	// Create invoice record
	const { data: invoice, error: invoiceError } = await locals.supabase
		.from('invoices')
		.insert([
			{
				user_id: session.user.id,
				project_id: projectId,
				start_date: format(startOfTheMonth, 'yyyy-MM-dd'),
				end_date: format(endOfTheMonth, 'yyyy-MM-dd'),
				total_hours: totalHours,
				hourly_rate: project.hourly_rate,
				invoice_number: invoiceNumber,
				status: 'drafted'
			}
		])
		.select();

	if (invoiceError) {
		throw error(500, 'Failed to create invoice.');
	}

	// Return a success response or the invoice data
	return json(invoice);
};
