<script lang="ts">
	import homeImg from '$lib/assets/images/freelance_window.webp';
</script>

<div class="container mx-auto p-4 md:h-screen w-full">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-center h-full mt-5 md:mt-0">
		<div class="flex flex-col justify-center items-center p-4">
			<div>
				<h1 class="text-5xl lg:text-6xl max-w-[600px]">
					Keep track of all your freelance time,
					<span class="font-bold">MeTime</span>
				</h1>
				<div class="w-full flex space-x-4">
					<a href="/login" class="btn variant-filled-primary mt-3 w-40 md:w-60"
						><span>Sign In</span></a
					>
					<a href="/signup" class="btn variant-soft-primary mt-3 w-40 md:w-60"
						><span>Sign Up</span></a
					>
				</div>
			</div>
		</div>
		<div class="flex justify-center md:justify-start p-4">
			<img src={homeImg} alt="Descriptive Alt Text" class="w-4/5" />
		</div>
	</div>
</div>
