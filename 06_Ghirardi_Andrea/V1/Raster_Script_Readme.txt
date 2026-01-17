# Raster

A high-performance web tool that kind of simulates the Risograph printing aesthetic by deconstructing images into RGB color channels with customizable halftone patterns and misregistration effects.

## Overview

Raster transforms digital images into print-inspired artworks by separating RGB channels and applying geometric patterns (circles, lines, crosses, dots, grain) to each layer. The tool simulates the characteristic "misprint" effect of Risograph printing where color layers are slightly misaligned, creating a distinctive vintage aesthetic.

## Features

### Core Functionality
- **Grid-based processing** - Optimized pixel sampling ensures 60fps interactive performance
- **RGB channel separation** - Independent control over Red, Green, and Blue layers
- **5 halftone patterns** - Choose from circles, lines, crosses, dots, or grain for each channel
- **Misregistration controls** - Offset each color layer independently on X and Y axes
- **Pattern rotation** - Adjust the angle of each channel's pattern (0-180°)
- **Opacity control** - Fine-tune the transparency of each layer

### Aesthetics
- **Paper texture overlay** - Simulates the graininess of physical paper
- **Blend modes** - Choose from multiply, screen, overlay, or normal to control how inks interact
- **High-resolution export** - Maintains original image dimensions and quality

## Usage

### Getting Started
1. **Load an image** - Click the canvas or drag and drop an image file
2. **Adjust settings** - Use the control panel to modify grid size, patterns, and offsets
3. **Export** - Click "Save PNG" to download your creation at original resolution

### Controls

#### Grid
- **Grid Size** (3-20) - Controls the resolution of the raster effect. Lower values = more detail, higher values = larger patterns

#### Channel Controls (Red/Green/Blue)
Each channel has independent controls:
- **Offset X/Y** (-50 to 50) - Shifts the layer position to create misregistration
- **Pattern** - Select the geometric pattern for this channel
  - `circles` - Halftone dots that scale with intensity
  - `lines` - Diagonal lines (angle controlled by rotation)
  - `crosses` - Intersecting lines forming a grid
  - `dots` - Square dots for a digital halftone look
  - `grain` - Random scattered particles
- **Angle** (0-180°) - Rotation angle for directional patterns
- **Opacity** (0-255) - Channel transparency

#### Aesthetics
- **Paper Texture** - Toggle paper grain overlay on/off
- **Paper Opacity** (0-100) - Controls visibility of paper texture
- **Blend Mode** - How color layers mix:
  - `multiply` - Realistic ink overlay (darker where colors overlap)
  - `screen` - Additive blending (brighter overlaps)
  - `overlay` - Enhanced contrast
  - `normal` - Simple layering

#### Actions
- **Clear** - Remove current image and reset
- **Save PNG** - Export at original image resolution

## Technical Details

### Optimization Strategy
- Grid-based pixel sampling (not every pixel) for performance
- Static rendering (only updates on parameter change)
- Dual image system: scaled version for display, original for export
- Proportional scaling ensures export matches preview appearance

### Export Quality
The tool maintains original image dimensions during export by:
1. Storing the original unmodified image
2. Creating a scaled display version for the canvas
3. Recalculating patterns at original scale during export
4. Applying all effects at full resolution

### Browser Compatibility
- Requires modern browser with HTML5 Canvas support
- Built with p5.js 1.7.0
- Uses lil-gui for controls

## Use Cases

- **Print design** - Create Risograph-style artwork digitally
- **Poster art** - Generate vintage print aesthetics
- **Experimental photography** - Add halftone effects to photos
- **Graphic design** - Explore color separation techniques
- **Art projects** - Create unique layered compositions

## Tips

### Getting the Classic Risograph Look
1. Set blend mode to `multiply`
2. Use different patterns for each channel (e.g., Red: lines, Green: circles, Blue: crosses)
3. Apply slight offsets (2-5px) on X and Y for subtle misregistration
4. Rotate each channel at different angles (15°, 45°, 75° works well)
5. Enable paper texture at 20-30 opacity

### For Bold Effects
- Increase grid size to 12-20 for large, graphic patterns
- Use high offset values (20-50) for dramatic misalignment
- Set patterns to `grain` for experimental textures
- Try `screen` blend mode for bright, glowing colors

### For Subtle Refinement
- Keep grid size small (3-6) for fine detail
- Use minimal offsets (0-2)
- Lower opacity on one or two channels for muted colors
- Disable paper texture for clean output