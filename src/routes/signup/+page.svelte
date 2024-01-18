<script lang="ts">
	import { Stepper, Step } from '@skeletonlabs/skeleton';
	import { z } from 'zod';
	import { goto } from '$app/navigation';

	// Variables
	let email = '';
	let password = '';
	let passwordConfirm = '';
	let fname = '';
	let lname = '';

	let message;

	// Validation states
	let emailValidationState = '';
	let passwordValidationState = '';
	let passwordConfirmValidationState = '';
	let nameValidationState = '';
	let emailLockedState = true;
	let passwordLockedState = true;
	let nameLockedState = true;

	// Zod schemas
	const emailSchema = z.string().email();
	const passwordSchema = z.string().min(8);
	const nameSchema = z.string().min(1);

	// Reactive validation for email
	$: if (emailSchema.safeParse(email).success) {
		emailValidationState = 'input-success';
		emailLockedState = false;
	} else {
		emailValidationState = '';
		emailLockedState = true;
	}

	$: {
		if (passwordSchema.safeParse(password).success) {
			passwordValidationState = 'input-success';
			// Set passwordConfirm to error if password is valid but they don't match
			passwordConfirmValidationState = password !== passwordConfirm ? 'input-error' : '';
		} else {
			passwordValidationState = '';
		}

		// Set both to success if passwords match and are valid
		if (password === passwordConfirm && passwordSchema.safeParse(password).success) {
			passwordValidationState = 'input-success';
			passwordConfirmValidationState = 'input-success';
			passwordLockedState = false;
		}
	}

	$: {
		const isFnameValid = nameSchema.safeParse(fname).success;
		const isLnameValid = nameSchema.safeParse(lname).success;

		if (isFnameValid && isLnameValid) {
			nameValidationState = 'input-success';
			nameLockedState = false;
		} else {
			nameValidationState = '';
			nameLockedState = true;
		}
	}

	async function registerUser() {
		const response = await fetch('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password, fname, lname })
		});

		if (response.ok) {
			goto('/login?newsignup=true');
		}
	}

	function onCompleteHandler(e: Event): void {
		registerUser();
	}
</script>

<div class="flex flex-col items-center mt-14 h-full">
	<div class="w-11/12 md:w-2/5 card p-6 md:p-14 min-h-fit">
		<Stepper on:complete={onCompleteHandler}>
			<Step locked={emailLockedState}>
				<svelte:fragment slot="header">
					<h2 class="h2">Get started!</h2>
				</svelte:fragment>
				<p class="mt-10">Enter a valid email</p>
				<input
					type="email"
					name="email"
					id="email"
					class="input !mb-12 {emailValidationState}"
					placeholder="email"
					bind:value={email}
				/>
			</Step>
			<Step locked={passwordLockedState}>
				<svelte:fragment slot="header">
					<p class="my-10">Choose a password</p>
				</svelte:fragment>
				<input
					type="password"
					name="password"
					id="password"
					class="input {passwordValidationState}"
					placeholder="enter a password"
					bind:value={password}
				/>
				<input
					type="password"
					name="password_confirm"
					id="password_confirm"
					class="input !mb-12 {passwordConfirmValidationState}"
					placeholder="confirm password"
					bind:value={passwordConfirm}
				/>
			</Step>
			<Step locked={nameLockedState}>
				<svelte:fragment slot="header">
					<p class="my-10">Choose a password</p>
				</svelte:fragment>
				<input
					type="text"
					name="fname"
					id="fname"
					class="input {nameValidationState}"
					placeholder="First"
					bind:value={fname}
				/>
				<input
					type="text"
					name="lname"
					id="lname"
					class="input !mb-12 {nameValidationState}"
					placeholder="Last"
					bind:value={lname}
				/>
			</Step>
		</Stepper>
		<div class="mt-20 md:mt-10 w-full flex justify-center">
			<p>or log in <a href="/login" class="anchor">here</a></p>
		</div>
	</div>
</div>
