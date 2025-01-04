import { endOfMonth, format, parse, startOfMonth } from 'date-fns';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
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
			.select('*')
			.eq('id', projectId)
			.single();

		if (projectError) {
			throw error(500, 'Could not find project id');
		}

		const capitalizedProjectName =
			project.proj_name.charAt(0).toUpperCase() + project.proj_name.slice(1);

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

		const { data: user, error: userError } = await locals.supabase
			.from('user_info')
			.select('first_name, last_name,phone')
			.eq('uuid', invoice[0].user_id);

		if (userError) {
			throw error(500, { message: userError.message });
		}

		// Inside your POST handler, after successfully creating the invoice...
		const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
			const doc = new PDFDocument({ size: 'LETTER' });
			const chunks: Buffer[] = [];

			// Set up your document event listeners first
			doc.on('data', (chunk) => {
				chunks.push(Buffer.from(chunk));
			});

			// Event listener for 'end'
			doc.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

			doc.on('error', (err) => {
				console.error('PDF generation error:', err);
				reject(err);
			});

			const startDate = format(new Date(invoice[0].start_date), 'MM/dd/yy');
			const endDate = format(new Date(invoice[0].end_date), 'MM/dd/yy');

			// Insert your PDF generation logic here
			doc.fontSize(9).text(`${user[0].first_name} ${user[0].last_name}`, {
				align: 'right'
			});
			doc.fontSize(9).text(`${session.user.email}`, {
				align: 'right'
			});
			doc
				.fontSize(9)
				.text(`${user[0].phone}`, {
					align: 'right'
				})
				.moveDown(3);
			doc.fontSize(62).font('Times-Roman').text('INVOICE');
			doc.fontSize(12).text(`#${invoice[0].invoice_number}`);
			doc.fontSize(12).text(`For bill period: ${startDate} - ${endDate}`).moveDown().moveDown(3);
			doc.fontSize(9).text('Billed to:');
			doc.fontSize(18).text(capitalizedProjectName);
			doc.fontSize(12).text(project.contact_name);
			doc.fontSize(12).text(project.contact_email).moveDown(2);
			doc
				.fontSize(12)
				.text(`For services performed by: ${user[0].first_name} ${user[0].last_name}`)
				.moveDown();

			doc
				.fontSize(12)
				.text(
					`${invoice[0].total_hours} ${project.project_role} hours at an hourly rate of $${invoice[0].hourly_rate}.`
				)
				.moveDown();
			doc.fontSize(9).text('Amount due:').moveDown(0.5);
			doc
				.fontSize(32)
				.text(`$${invoice[0].total_hours * invoice[0].hourly_rate}`)
				.moveDown(3);
			doc.fontSize(12).text('Payment is net 15');
			doc.fontSize(12).text('Thank you!');
			doc.end();
		});

		const invoiceFileName = `${invoice[0].invoice_number}.pdf`;

		// Upload the generated PDF to Supabase Storage
		const { error: uploadError } = await locals.supabase.storage
			.from('invoicepdfs') // Use your bucket name
			.upload(invoiceFileName, pdfBuffer, {
				contentType: 'application/pdf',
				upsert: true // Replace the file if it already exists
			});

		if (uploadError) {
			throw error(500, { message: uploadError.message });
		}

		// Fetching the public URL for the uploaded PDF
		const { data: publicURL } = locals.supabase.storage
			.from('invoicepdfs')
			.getPublicUrl(invoiceFileName);

		if (!publicURL) {
			throw error(500, { message: 'No public URL found.' });
		}

		// Update your database record with the PDF URL
		const { error: updateError } = await locals.supabase
			.from('invoices')
			.update({ pdf_link: publicURL.publicUrl })
			.eq('id', invoice[0].id);

		if (updateError) {
			throw error(500, { message: updateError.message });
		}

		// Respond with the invoice information and PDF link
		return json({ ...invoice[0], pdf_link: publicURL });
	} catch (error) {
		console.error('Error in PDF generation or saving:', error);
		return json(error);
	}
};
