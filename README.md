# Simulation-based benchmarking for Forward Collision Warning Algorithms

CS 198/199 - Scientific Computing Laboratory

Michael Angelo L. Monasterial

BS Computer Science | University of the Philippines - Diliman.

## Abstract

### \<header pending\>

This project utilizes generators in order to create a simulator for selecting an FCW
algorithm. The scenario is as such:

- Randomize some initial parameters for the vehicles.
- Calculate the initial warning distances based on those parameters.
- Initialize two vehicles (FV, LV).
- Assume both FV and LV do not have FCWS.
- FV and LV go through the road while FV maintains the precomputed warning distance as headway.
- LV slows down at some predefined position.
- The driver of FV stochastically chooses to break based on some parameters

This then makes the simulation FCWS agnostic, rather it only tests the performance of the algorithm based on the stochasticity of the driver - how safe the warning distance is if the driver decides to heed the warning late.

The scenarios are run <img src="https://latex.codecogs.com/svg.latex?N"/> times, taking note of the number of collisions (<img src="https://latex.codecogs.com/svg.latex?n"/>). This gives us the probability of collision (<img src="https://latex.codecogs.com/svg.latex?%p"/>) through the Monte Carlo Method.

<img src="https://latex.codecogs.com/svg.latex?%p"/> is then compared to FV's average speed throughout the simulation. This ensures that we determine the algorithm that yields a safe enough warning distance while minimizing the time loss due to braking.

### Pool of Algorithms

- **Kinematics**:
  - Stop Distance
  - Mazda
  - PATH
- **Perceptual**:
  - Honda
  - Hirst & Graham
  - Bella & Russo

## Instructions

`git clone`, `npm/yarn/pnpm install`, `npm/yarn/pnpm dev`.
