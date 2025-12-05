# Spiral Effect Documentation

## Overview

The **Spiral Effect** is a 3D visualization where gallery items are arranged continuously along a helical path. Unlike a simple rotating cylinder, this effect simulates the camera moving *through* the spiral (or the spiral moving past the camera), creating an immersive "fly-through" experience.

## Mathematical Model

The layout is based on the parametric equations of a Helix.

### Coordinate System

- **X**: Horizontal position
- **Y**: Vertical position
- **Z**: Depth (into/out of screen)

### Equations

For the $i$-th item:

1. **Angle ($\theta$)**: $\theta_i = i \times \text{angle\_increment}$
    - Controls how "tight" the spiral is rotationally.
2. **Radius ($R$)**: Constant (or variable for conical spirals).
    - $x_i = R \cdot \cos(\theta_i)$
    - $y_i = R \cdot \sin(\theta_i)$  (Using Y/X for the cross-section circle, so Z is the forward axis)

    *Correction for this specific implementation:*
    We want the items to spiral *towards* the viewer.
    - $x = R \cdot \cos(\theta)$
    - $y = R \cdot \sin(\theta)$
    - $z = i \cdot \text{spacing}$

    *Alternative Orientation (Tunnel)*:
    If we want a "tunnel" where we fly through:
    - $x = R \cdot \cos(\theta)$
    - $y = R \cdot \sin(\theta)$
    - $z = \text{progress}$

    *Requested Experience*: "one picture coming into view... then moving out".
    This implies the path of the items passes directly in front of the camera.

    Let's place the camera at $(0, 0, Z_{cam})$.
    The items are at:
    - $x = R \cdot \cos(\theta + \text{scroll\_offset})$
    - $z = R \cdot \sin(\theta + \text{scroll\_offset})$
    - $y = i \cdot \text{vertical\_spacing} - \text{scroll\_y}$

    Wait, if we use a standard helix:
    $x = R \cos(t)$
    $z = R \sin(t)$
    $y = c \cdot t$

    To have the item come "into view in a big way", it must pass close to the camera (low Z distance, close to $Z=0$ if camera is at $Z>0$, or close to camera Z).

    **Chosen Approach: The "Spiral Stream"**
    The items are arranged on a giant imaginary corkscrew.
    The user scrolls "forward" along the corkscrew's axis.

    - **Radius**: 600px
    - **Angle Step**: 30 degrees (0.52 rad) per item.
    - **Z Step**: 300px per item (Depth spacing).

    When scrolling:
    We shift the entire world along the Z-axis.
    We also rotate the world to keep the "current" item oriented upright or facing the camera.

## Interaction Details

- **Scroll**: Moves the user along the spiral path.
  - Scroll Down -> Move Forward (items come at you).
  - Scroll Up -> Move Backward.
- **Focus**: The item closest to $Z=0$ (screen plane) is the "active" item.
- **Transition**: Smooth interpolation using GSAP.

## Files

- `js/effects/SpiralEffect.js`: Contains `initSpiral`, `updateSpiral`, `cleanupSpiral`.
- `js/effects/EffectManager.js`: Handles switching between this and other effects.
