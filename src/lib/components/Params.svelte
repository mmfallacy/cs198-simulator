<script lang="ts">
	import { Algorithms } from '$lib/const';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { adapter } from '$lib/utils';

	let isWarningInitial = true;

	$: console.log(isWarningInitial);

	// FIX: Ensure typesafety
	//@ts-ignore
	$: if (isWarningInitial) $params.Sim.id = Algorithms[$params.Sim.algo](adapter($params));
</script>

<h2>Following Vehicle (FV):</h2>
<h4>Initial Velocity (+ mps)</h4>
<input type="number" bind:value={$params.FV.vx} />
<h4>Acceleration due to braking (- mps^2)</h4>
<input type="number" bind:value={$params.FV.abr} />
<h4>Acceleration (+ mps^2)</h4>
<input type="number" bind:value={$params.FV.ax} />

<h2>Leading Vehicle (LV):</h2>
<h4>Initial Velocity (+ mps)</h4>
<input type="number" bind:value={$params.LV.vx} />
<!-- <h4>Acceleration due to braking (- km/h^2)</h4>
<input type="number" bind:value={$params.LV.abr} /> -->

<h2>Simulation Parameters:</h2>
<!-- <h4>Reaction time delay (ms)</h4>
<input type="number" bind:value={$params.Sim.tr} />
<h4>System time delay (ms)</h4>
<input type="number" bind:value={$params.Sim.ts} /> -->
<h4>Minimum safety distance (m)</h4>
<input type="number" bind:value={$params.Sim.dmin} />
<h4>Initial distance between FV and LV</h4>
<input type="number" bind:value={$params.Sim.id} disabled={isWarningInitial} />
<label class="ml-2" for="usefcwa">Use FCWA</label>
<input type="checkbox" name="usefcwa" bind:checked={isWarningInitial} />
<h4>Forward Collision Warning Algorithm</h4>
<select bind:value={$params.Sim.algo}>
	{#each Object.keys(Algorithms) as algo}
		<option value={algo}>{algo}</option>
	{/each}
</select>
<!-- <h4>Number of test runs</h4>
<input type="number" bind:value={$params.Sim.N} /> -->
