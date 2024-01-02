<script lang="ts">
	import accountIcon from '$lib/assets/images/account.png';
	export let onCloseMenu: () => void;
</script>

<div class="relative w-full">
	<!-- Close Button in the top right corner -->
	<div class="absolute top-0 left-0 -0 m-4">
		<button class="stroke-current text-black dark:text-white" on:click={onCloseMenu}>
			<svg
				width="30"
				height="30"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<line x1="4" y1="4" x2="20" y2="20" stroke-width="2" />
				<line x1="20" y1="4" x2="4" y2="20" stroke-width="2" />
			</svg>
		</button>
	</div>
</div>

<div class="w-full flex justify-center">
	<nav class="list-nav">
		<ul class="text-2xl mt-5">
			<li>
				<a href="/projects" on:click={onCloseMenu}>
					<span class="badge !text-base">⛭</span>
					<span class="flex-auto">Projects</span>
				</a>
			</li>
			<li>
				<a href="/account" on:click={onCloseMenu}>
					<span class="badge">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="fill-current text-black dark:text-white w-3"
							viewBox="0 0 24 24"
						>
							<title>Close window</title>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
							/>
						</svg>
					</span>
					<span class="flex-auto">Account</span>
				</a>
			</li>
			<li>
				<a href="/signout" on:click={onCloseMenu}>
					<span class="badge !text-base">✌️</span>
					<span class="flex-auto">Sign Out</span>
				</a>
			</li>
		</ul>
	</nav>
</div>
