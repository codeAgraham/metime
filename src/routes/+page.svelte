<script lang="ts">
	import homeImg from '$lib/assets/images/freelance_window.webp';
</script>

<div class="container mx-auto p-4 h-screen">
	<div class="md:flex md:flex-row md:items-center h-full">
		<div class="md:w-1/2 p-4 flex flex-col justify-center items-end md:h-2/3">
			<div>
				<h1 class="h1 !text-5xl md:!text-7xl max-w-[600px]">
					Keep track of all your freelance time,
					<span class="font-bold">meTime</span>
				</h1>
				<a href="/login" class="btn variant-filled-primary mt-3 w-1/4"><span>Sign In</span></a>
				<a href="/signup" class="btn variant-soft-primary mt-3 w-1/4"><span>Sign Up</span></a>
			</div>
		</div>
		<div class="md:w-1/2 p-4 flex flex-col justify-center items-start md:h-2/3">
			<img src={homeImg} alt="" />
		</div>
	</div>
</div>
