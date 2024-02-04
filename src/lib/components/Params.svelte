<script lang="ts">
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
</script>

<h2>Following Vehicle (FV):</h2>
<h4>Initial Velocity (+ km/h)</h4>
<input bind:value={$params.FV.vx} />
<h4>Acceleration due to braking (- km/h^2)</h4>
<input bind:value={$params.FV.abr} />

<h2>Leading Vehicle (LV):</h2>
<h4>Initial Velocity (+ km/h)</h4>
<input bind:value={$params.LV.vx} />
<h4>Acceleration due to braking (- km/h^2)</h4>
<input bind:value={$params.LV.abr} />

<h2>Simulation Parameters:</h2>
<h4>Reaction time delay (ms)</h4>
<input bind:value={$params.Sim.tr} />
<h4>System time delay (ms)</h4>
<input bind:value={$params.Sim.ts} />
<h4>Minimum safety distance (m)</h4>
<input bind:value={$params.Sim.dmin} />
<h4>Initial distance between FV and LV</h4>
<input bind:value={$params.Sim.id} />
<h4>Number of test runs</h4>
<input bind:value={$params.Sim.N} />
