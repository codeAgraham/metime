<script lang="ts">
	import homeImg from '$lib/assets/images/freelance_window.webp';
</script>

<div class="container mx-auto p-4 h-screen main-bg w-full">
	<div class="md:flex md:flex-row md:items-center h-full mt-10 md:mt-0">
		<div class="md:w-1/2 md:h-2/3 p-4 flex flex-col justify-center items-end">
			<div>
				<h1 class="h1 !text-4xl md:!text-6xl max-w-[600px]">
					Keep track of all your freelance time,
					<span class="font-bold">meTime</span>
				</h1>
				<a href="/login" class="btn variant-filled-primary mt-3"><span>Sign In</span></a>
				<a href="/signup" class="btn variant-soft-primary mt-3"><span>Sign Up</span></a>
			</div>
		</div>
		<div class="md:w-1/2 p-4 flex flex-col justify-center items-start md:h-2/3">
			<img src={homeImg} alt="" />
		</div>
	</div>
</div>
