<script lang="ts">
	import { Bar } from 'svelte-chartjs';
	import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	// Define a type for the aggregate data
	type AggregateDataType = { [key: string]: number };

	// Export aggregateData as a prop
	export let aggregateData: AggregateDataType;

	// Function to process aggregateData into monthlyData
	function processAggregateData(aggregateData: AggregateDataType): number[] {
		let monthlyData = new Array(12).fill(0);
		for (const month in aggregateData) {
			const index = parseInt(month, 10) - 1; // Convert '01', '02', etc. to 0, 1, etc.
			monthlyData[index] = aggregateData[month];
		}
		return monthlyData;
	}

	// Processed data for the chart
	let monthlyData = processAggregateData(aggregateData);

	// Data for the bar chart
	const data = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
		datasets: [
			{
				label: 'Total Hours per month (all )',
				data: monthlyData,
				backgroundColor: [
					'rgba(212, 22,60,1)',
					'rgba(71,  132, 175,1)',
					'rgba(193, 221, 151,1)',
					'rgba(228,194,94,1)',
					'rgba(44,46,64,1)'
				],
				borderWidth: 2,
				borderColor: [
					'rgba(212, 22,60,1)',
					'rgba(71,  132, 175,1)',
					'rgba(193, 221, 151,1)',
					'rgba(228,194,94,1)',
					'rgba(44,46,64,1)'
				]
			}
		]
	};
</script>

<Bar {data} options={{ responsive: true, maintainAspectRatio: true }} />
