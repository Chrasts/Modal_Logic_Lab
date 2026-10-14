# Modal Logic Lab

**Modal Logic Lab** is an interactive educational game and laboratory for learning and experimenting with modal logic through finite Kripke models.

## [Play online](https://chrasts.github.io/Modal_Logic_Lab/)

The project treats formal logic as an interactive system rather than only as symbolic exercises. Users construct and modify Kripke models, evaluate modal formulas, explore accessibility relations and frame properties, and solve tasks checked by a deterministic semantic engine.

## What is currently included

### Learn

A structured introduction to modal logic and Kripke semantics, from truth at a world and accessibility through □ and ◇, nested modalities, countermodels, semantic scope and frame properties.

### Campaigns

Thematic campaign sequences made of missions, with adjacent practice for choosing individual missions, including:

- **Countermodel Hunter**
- **Frame Architect**
- **Formula Laboratory**
- **Axiom Breaker**
- **Model Budget**
- non-linear **Practice** sequences

### Lab

A free **Model Sandbox** for constructing finite Kripke models, evaluating and comparing formulas, exploring frame properties, inspecting semantic traces and interactively examining subformulas through the Evaluation Explorer.

Current sandbox states can also be shared through versioned browser links.

### Create

Tools for creating, validating, playtesting, importing, exporting and sharing custom missions and campaigns.

The application also includes a modal logic reference, controls and help, local progress, browser-local data tools and responsive workspace layouts.

## Platform status

Desktop and laptop currently provide the most mature experience.

The mobile web interface is technically functional and includes dedicated responsive workspace behavior, but it is still under active refinement. Mobile layout, touch interaction, dense Lab workflows and authoring are expected to receive further polish and real-device testing.

## Planned direction

The immediate focus is on hardening the current product across desktop and mobile, refining the educational and authoring experience, and testing the application with users.

Near-term utilities may include:

- LaTeX/TikZ model export
- standard translation of modal formulas into first-order logic

Larger later extensions may include:

- bisimulation
- generated submodels and modal depth
- distinguishing-formula challenges
- filtration
- tableaux and countermodel construction
- symbolic infinite models

Longer-term directions include epistemic logic, Public Announcement Logic, temporal, dynamic, doxastic, deontic and other modal logics where they support a concrete educational or experimental use case.

The project currently uses finite Kripke models as its primary semantic environment.

---

Created and maintained by [Chrasts](https://github.com/Chrasts).

Released under the [MIT License](LICENSE).
