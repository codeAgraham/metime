<script lang="ts">
	import { Stepper, Step } from '@skeletonlabs/skeleton';
	import { z } from 'zod';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import eyeShow from '$lib/assets/images/eye-show.svg';
	import eyeHide from '$lib/assets/images/eye-hide.svg';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let fname = '';
	let lname = '';

	let passwordStrengthScore = 0;
	let progressBarColor = '';
	let showPassword = false;

	let emailValidationState = '';

	let passwordCriteria = {
		minLength: { valid: false, message: 'At least 8 characters' },
		upperCase: { valid: false, message: 'At least one uppercase letter' },
		lowerCase: { valid: false, message: 'At least one lowercase letter' },
		number: { valid: false, message: 'At least one number' },
		specialChar: { valid: false, message: 'At least one special character' }
	};

	let nameValidationState = '';
	let emailLockedState = true;
	let passwordLockedState = true;
	let nameLockedState = true;

	const emailSchema = z.string().email();
	const passwordSchema = z
		.string()
		.min(8)
		.refine((password) => /[A-Z]/.test(password), {
			message: 'Password must contain at least one uppercase letter'
		})
		.refine((password) => /[a-z]/.test(password), {
			message: 'Password must contain at least one lowercase letter'
		})
		.refine((password) => /[0-9]/.test(password), {
			message: 'Password must contain at least one number'
		})
		.refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
			message: 'Password must contain at least one special character'
		});

	const nameSchema = z.string().min(1);

	// Reactive validation for email
	$: if (emailSchema.safeParse(email).success) {
		emailValidationState = 'input-success';
		emailLockedState = false;
	} else {
		emailValidationState = '';
		emailLockedState = true;
	}

	// Update password criteria
	$: {
		passwordCriteria.minLength.valid = password.length >= 8;
		passwordCriteria.upperCase.valid = /[A-Z]/.test(password);
		passwordCriteria.lowerCase.valid = /[a-z]/.test(password);
		passwordCriteria.number.valid = /[0-9]/.test(password);
		passwordCriteria.specialChar.valid = /[!@#$%^&*(),.?":{}|<>]/.test(password);

		// Calculate password strength score
		passwordStrengthScore = Object.values(passwordCriteria).filter((c) => c.valid).length;

		// Update the progress bar color based on the score
		progressBarColor =
			passwordStrengthScore === 1
				? 'bg-error-500'
				: passwordStrengthScore === 2
					? 'bg-warning-500'
					: passwordStrengthScore === 3
						? 'bg-tertiary-500'
						: passwordStrengthScore === 4
							? 'bg-secondary-500'
							: passwordStrengthScore === 5
								? 'bg-success-500'
								: '';
	}

	$: {
		passwordLockedState = password.length < 8; // Unlock if password is entered
	}

	// Validate first and last name
	$: {
		const isFnameValid = nameSchema.safeParse(fname).success;
		const isLnameValid = nameSchema.safeParse(lname).success;
		nameLockedState = !(isFnameValid && isLnameValid);
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

	// Toggle password visibility
	function togglePasswordVisibility() {
		showPassword = !showPassword;
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
					autocomplete="email"
					placeholder="email"
					bind:value={email}
				/>
			</Step>
			<Step locked={passwordLockedState}>
				<p class="mt-12">Choose a password - Minimum 8 Characters</p>
				<div class="input-group flex">
					<input
						type="password"
						bind:value={password}
						class={!showPassword ? 'input visible' : 'hidden'}
					/>
					<input
						type="text"
						bind:value={password}
						class={showPassword ? 'input visible' : 'hidden'}
					/>
					<button class="input-group-shim" on:click={togglePasswordVisibility}>
						<img
							src={showPassword ? eyeHide : eyeShow}
							alt={showPassword ? 'Hide Password' : 'Show Password'}
							class="w-5 h-5"
						/>
					</button>
				</div>
				<div class="w-full flex items-center my-6">
					<p class="text-xs">Password Strength</p>
					<ProgressBar value={passwordStrengthScore} max={5} meter={progressBarColor} />
				</div>
			</Step>

			<Step locked={nameLockedState}>
				<svelte:fragment slot="header">
					<p class="my-10">Enter your name</p>
				</svelte:fragment>
				<input
					type="text"
					name="fname"
					id="fname"
					class="input {nameValidationState}"
					placeholder="First"
					autocomplete="additional-name"
					bind:value={fname}
				/>
				<input
					type="text"
					name="lname"
					id="lname"
					class="input !mb-12 {nameValidationState}"
					placeholder="Last"
					autocomplete="additional-name"
					bind:value={lname}
				/>
			</Step>
		</Stepper>
		<div class="mt-20 md:mt-10 w-full flex justify-center">
			<p>or log in <a href="/login" class="anchor">here</a></p>
		</div>
	</div>
</div>
