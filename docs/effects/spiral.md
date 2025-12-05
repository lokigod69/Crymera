# Spiral Effect Documentation

## Overview

The **Spiral Effect** (Inside-Out Helix) allows the user to explore the gallery as if they are at the center of a spiraling cylinder of images. As the user scrolls, the entire spiral rotates and shifts vertically, bringing images one by one into the front-center view.

## Mathematical Model

### Coordinate System

- **Camera**: Static at $(0, 0, 0)$ (or effective viewport center).
- **Structure**: Images are arranged on a cylindrical surface with radius $R$.
- **Behavior**:
  - Images are fixed relative to the cylinder.
  - The cylinder rotates around the Y-axis.
  - The cylinder moves along the Y-axis.

### Equations

For the $i$-th item:

- **Index Offset**: $\Delta i = i - \text{scrollProgress}$
- **Angle ($\theta$)**: $\Delta i \times \text{AngleStep}$ ($30^\circ$ or similar).
- **Vertical Position ($Y$)**: $\Delta i \times \text{HeightStep}$ ($200\text{px}$ or similar).

**Item Placement (local to cylinder)**:

- Radius $R$: $800\text{px}$ (large enough to surround user).
- RotationY: $i \times -\text{AngleStep}$
- TranslateZ: $R$ (pushes it out to cylinder wall).
- RotationY (Correction): $180^\circ$ (so the image faces inward towards the center).

**Cylinder Transformation (controlled by scroll)**:

- RotationY: $\text{scrollProgress} \times \text{AngleStep}$
- TranslateY: $\text{scrollProgress} \times \text{HeightStep}$ (Move up/down to keep active item in middle).

### Interaction

- **Scroll Down**: Rotate cylinder counter-clockwise (or clockwise), move cylinder Up (or Down) to bring next item.
- **Snap**: Optional snapping to integer indices to ensure perfect alignment.
- **Looping**: Could be infinite, but for now linear based on image count.

## Files

- `js/effects/SpiralEffect.js`: Contains logic.
