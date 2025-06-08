This repository holds the ad-hoc simulator source code used for generating simulation data for the CS 198/199 thesis entitled "Comparative Analaysis of Perceptual Forward Collision Warning Algorithms"

# Comparative Analysis of Perceptual forward Collision Warning Algorithms

Rear-end collisions account for a significant portion of road accidents in Metro
Manila, highlighting the need for advanced driver assistance systems (ADAS) such
as Forward Collision Warning (FCW) systems. These systems aim to improve road
safety by providing timely alerts to drivers, helping prevent rear-end accidents.
This study evaluates three perceptual algorithms–Honda, Hirst & Graham, and
Bella & Russo–within a two-car following system.

A computational analysis was conducted using NumPy to examine trends in
Modified Time to Collision (MTTC) based on relative velocity and acceleration.
Additionally, an ad-hoc simulator is developed to evaluate the impact of these
algorithms on driver behavior and efficiency. Results indicate that while all three
algorithms contribute to improved safety, variations in warning distances affect
driver response patterns, with implications for both driving efficiency and envi-
ronmental impact.

This study emphasizes the need to balance safety and efficiency in FCW sys-
tems to minimize false positives, avoid overly conservative warnings, and reduce
unnecessary braking events that increase fuel consumption and carbon emissions.
Future research should explore real-world implementation and extend the analysis
to more complex traffic scenarios, such as vehicle platoons, to further refine FCW
performance.

# Usage

<details>
<summary>- Running through `nix`</summary>
- Run `nix develop` to bootstrap a shell that includes `nodejs_23` and pnpm through corepack.
> You can also use this devShell (`./nix/devShell.nix`) as your development environment!
- `pnpm install`
- `pnpm dev`
</details>

<details>
<summary>- Other systems</summary>
- install NodeJS v23 and `pnpm` manually or through `corepack`.
- `pnpm install`
- `pnpm dev`
</details>

## Project Structure

The simulator has four key components: the simulator generator function, the renderer, the parallel processing infrastructure, and the persistence layer.

### Simulator Generator Function

The simulator generator function is a TypeScript generator which aims to lazily generate simulation states. This function is strictly detached from all other components, allowing for headless invocations. 

The function resides in `./src/lib/simulator/simulator.ts` with sample usage in `(renderer)`, `lagrangian` and `parallel` Svelte routes.

### Renderer

The renderer serves as the runner which prompts the simulator generator function for system states for every tick. As the simulation states are all in metric units, the renderer converts the results into a specific pixel representation. It then updates the PixiJS Canvas with the appropriate values, before starting another render call. This project comes with two renderers: the default one, and the lagrangian renderer.

The default renderer displays the scenario derived from the given parameters as a whole. That is, as the vehicle representation goes out of bounds, the simulation halts. 

<video controls src="https://github.com/user-attachments/assets/5665aec5-0641-473d-880e-b8c04f526a1c" title="Default Renderer"></video>

On the other hand, the lagrangian simulator works a bit differently. It still retains the mechanism where the renderer prompts the simulator for values, as well as the metric-to-pixel conversion. However, the simulation halting condition with this renderer is based on the set maximum run distance (by default, 1 kilometer). The renderer pans the view as the vehicles go out of bounds, with options to follow the FV or LV. For ease of interpretation, lane markers are also renderered as well as signs for every 100m of the road.

<video controls src="https://github.com/user-attachments/assets/4503f600-40d6-4514-a437-a571c27a3e87" title="Lagrangian Renderer"></video>

Both renderers keep track and display certain metrics such as:
- Current headway
- Average headway
- Following Car Average velocity (in mps)
- Warning Distance (hit/no hit)
- Current MTTC
- MTTC on first warning distance hit

These metrics are then analyzed within the study to gauge the performance of the three perceptual warning algorithms under varying driving conditions.

### Parallel Processing

This project also houses a parallel runner located in the `parallel` Svelte route. The parallel runner initializes a worker pool of size 100, where simulation requests are dispatched and independently processed. Worker status are also displayed to show which workers are currently preoccupied with running simulations, and which workers are idle. As of now, the default tasks are based on the simulation data required by the study. Upon finishing a task, the simulation data is exported as JSON. 

> I recommend running the parallel runner in a chromium-based browser. Firefox-based browsers tend to finish all tasks twice as longer.

<video controls src="https://github.com/user-attachments/assets/d0d7540f-f4f1-4f32-984d-2fcc691406fd" title="Parallel Runner"></video>

### Persistence Layer

The simulation framework utilizes Dexie.js, a lightweight and performant wrapper for IndexedDB, to manage persistent storage of simulation data. Each row in the Chapter 3. Methodology 19 database contains one simulation run, with its primary keys being the simula- tion inputs and the simulation results as other columns. Dexie.js also allows for quick JSON exports, which allows seamless integration with Python for further visualizations and analyses.

## Remarks and Recommendations

This ad-hoc simulator is written in TypeScript with the following technologies:
- [Svelte v5](https://svelte.dev/)
> This project uses Svelte v5, however some routes are still not migrated.
- [Valibot v0.31](https://valibot.dev/)
- [PixiJS v7](https://pixijs.com/)
- [DexieJS](https://dexie.org/)
- [Tailwind](https://tailwindcss.com/)
- [`@solana/fast-stable-stringify`](https://www.npmjs.com/package/@solana/fast-stable-stringify)

As this project is written with heavy time constraints, there are a few more avenues for improvement. I recommend future forks of this project to work on the following item points:
- Full rework for the default renderer
- Kinematics FCWA support
- Proper IndexedDB tables for each task in parallel runner
- Ability to create task queue from the interface
- Ability to set maximum run distance in interface of Lagrangian renderer
- Proper code refactors
- Migrate to Svelte 5
- Migrate to PixiJS v8
