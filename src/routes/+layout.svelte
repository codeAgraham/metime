<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		LightSwitch,
		initializeStores,
		Toast,
		Modal,
		Drawer,
		getDrawerStore
	} from '@skeletonlabs/skeleton';
	import DropNav from '$lib/components/DropNav.svelte';
	import 'iconify-icon';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	const drawerStore = getDrawerStore();

	const handleOpenMenu = () => {
		drawerStore.open();
	};

	const handleCloseMenu = () => {
		drawerStore.close();
	};
</script>

<svelte:head><title>metime$</title></svelte:head>

<Toast color="variant-filled-success" position="t" />
<Modal buttonPositive="variant-filled-primary" padding="p-6" />
<Drawer position="top">
	<DropNav onCloseMenu={handleCloseMenu} />
</Drawer>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar
			gridColumns="grid-cols-3"
			slotDefault="place-self-center"
			slotTrail="place-content-end"
			background="bg-surface-200-700-token"
		>
			<svelte:fragment slot="lead">
				<button class="dark:fill-white fill-current pl-2" on:click={handleOpenMenu}>
					<svg width="30px" height="30px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
						<title>Open Menu</title>
						<desc>Hamburger menu to open navigation</desc>
						<g fill="currentColor">
							<path d="m 1 2 h 14 v 1 h -14 z m 0 0" />
							<path d="m 1 6 h 14 v 1 h -14 z m 0 0" />
							<path d="m 1 10 h 14 v 1 h -14 z m 0 0" />
						</g>
					</svg>
				</button>
			</svelte:fragment>
			<a href="/"><strong class="h3"> MeTime</strong></a>
			<svelte:fragment slot="trail">
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot />
</AppShell>
