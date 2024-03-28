import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { format } from 'date-fns';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		throw error(500, { message: 'User not logged in.' });
	}

	const { invoiceId } = await request.json();

	if (!invoiceId) {
		return new Response('Missing invoice ID.', { status: 400 });
	}

	const { data: invoice, error: invoiceError } = await locals.supabase
		.from('invoices')
		.select()
		.eq('id', invoiceId)
		.single();

	if (invoiceError) {
		throw error(500, { message: 'Error fetching invoice data.' });
	}

	const { data: project, error: projectError } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('id', invoice.project_id)
		.single();

	if (projectError) {
		throw error(500, { message: 'Error fetching project name.' });
	}

	const capitalizedProjectName =
		project.proj_name.charAt(0).toUpperCase() + project.proj_name.slice(1);

	const { data: user, error: userError } = await locals.supabase
		.from('user_info')
		.select('first_name, last_name,phone')
		.eq('uuid', invoice.user_id);

	if (userError) {
		throw error(500, { message: userError.message });
	}

	return new Promise<Response>((resolve, reject) => {
		const doc = new PDFDocument({ size: 'LETTER' });
		const chunks: Uint8Array[] = [];

		doc.on('data', (chunk) => {
			chunks.push(chunk);
		});

		doc.on('end', () => {
			const pdfBuffer = Buffer.concat(chunks);
			resolve(
				new Response(pdfBuffer, {
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': 'attachment; filename="invoice.pdf"'
					}
				})
			);
		});

		const startDate = format(new Date(invoice.start_date), 'MM/dd/yy');
		const endDate = format(new Date(invoice.end_date), 'MM/dd/yy');

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
		doc.fontSize(12).text(`#${invoice.invoice_number}`);
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
				`${invoice.total_hours} ${project.project_role} hours at an hourly rate of $${invoice.hourly_rate}.`
			)
			.moveDown();
		doc.fontSize(9).text('Amount due:').moveDown(0.5);
		doc
			.fontSize(32)
			.text(`$${invoice.total_hours * invoice.hourly_rate}`)
			.moveDown(3);
		doc.fontSize(12).text('Payment is net 15');
		doc.fontSize(12).text('Thank you!');
		doc.end();
	}).catch((err) => {
		// Handle any errors that occur during PDF generation
		return new Response(JSON.stringify({ message: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	});
};
