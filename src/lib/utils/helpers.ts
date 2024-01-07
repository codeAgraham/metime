export function formatDate(dateStr: string) {
	// Extract the year, month, and day from the date string
	const [year, month, day] = dateStr.split('-').map((part) => parseInt(part));

	// Create a new date object using the year, month (adjusted for zero-index), and day
	const date = new Date(year, month - 1, day);

	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	const monthIndex = date.getMonth();
	const dayOfMonth = date.getDate();

	return `${monthNames[monthIndex]} ${dayOfMonth}, ${year}`;
}
