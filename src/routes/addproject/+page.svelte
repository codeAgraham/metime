<script lang="ts">
</script>

<div class="flex w-full h-screen flex-col justify-center items-center">
	<div class="w-4/5 md:w-2/5 card variant-filled">
		<h1 class="h1 card-header pb-4 pl-12">Add New Project</h1>
		<form method="POST" class="w-4/6 m-auto pb-10 space-y-4">
			<label class="label">
				<span>Project Name</span>
				<input class="input text-black dark:text-white" type="text" name="proj_name" />
			</label>
			<button class="btn variant-filled-primary w-full">Submit</button>
		</form>
	</div>
</div>
