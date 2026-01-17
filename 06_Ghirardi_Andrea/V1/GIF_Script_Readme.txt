# Kinetic Moiré Generator

A powerful web-based tool for creating hypnotic Op-Art animations using overlapping geometric patterns and mathematical precision. Built with p5.js for seamless GIF export.

## Overview

The Kinetic Moiré Generator creates mesmerizing interference patterns by rotating and scaling multiple layers of complex geometric patterns at mathematically related speeds. The tool is designed for artists, designers, and creative coders interested in generative art, Op-Art, and vibe-coding aesthetics.

## Features

### Dual-Layer Pattern System
- **Independent Layers**: Configure two separate pattern layers with different geometries
- **7 Pattern Types**: 
  - Concentric Circles
  - Radial Lines
  - Square Grid
  - Spiral
  - Hexagonal
  - Triangular
  - Wave Grid
- **Custom Colors**: Full color picker for each layer and background
- **Speed Control**: Independent rotation speed for each layer (-5 to +5)

### Animation Controls
- **Complexity Slider**: Adjust the number of lines/circles (5-50)
- **Speed Ratio**: Mathematical relationship between layer speeds for perfect synchronization
- **Pattern Radius**: Control how much the patterns fill the canvas (20%-80%)
- **Perfect Looping**: All animations loop seamlessly using p5.createLoop

### Visual Effects
- **Chromatic Aberration**: RGB channel separation effect (0-10 intensity)
- **Kaleidoscope Mode**: Create symmetrical mirror effects with adjustable segments (3-12)
- **Custom Stroke Weight**: Fine-tune line thickness (0.5-5)

### Color Presets
Eight carefully crafted color palettes:
- **Vaporwave**: Pink and cyan aesthetic
- **Cyberpunk**: Neon cyan and magenta
- **Monochrome**: Clean white and gray
- **Neon Night**: Neon green and pink
- **Infrared**: Red and orange heat map
- **Deep Ocean**: Blue aquatic tones
- **Sunset**: Orange and yellow warmth
- **Toxic**: Radioactive green

### Canvas Configuration
- **Orientation**: Horizontal or Vertical
- **Aspect Ratios**: 
  - Square: 1:1
  - Horizontal: 4:3, 16:9, 21:9, 3:2
  - Vertical: 3:4, 9:16, 9:21, 2:3
- **Custom Size**: 400-1600px base dimension
- **Smart Filtering**: Only shows compatible aspect ratios for selected orientation

### Export Options
- **GIF Export**: High-quality animated GIF generation
- **Duration Control**: 1-10 seconds
- **Frame Rate**: 15-60 FPS (adjustable in real-time)
- **PNG Export**: Save individual frames
- **Custom Naming**: Files automatically named with timestamp

## Usage

### Basic Workflow
1. **Select Patterns**: Choose a pattern type for Layer 1 and Layer 2
2. **Adjust Colors**: Use color pickers or select a preset palette
3. **Set Animation**: Configure speed and complexity
4. **Configure Canvas**: Choose your desired format and dimensions
5. **Preview**: Watch the animation loop in real-time
6. **Export**: Click "RECORD & EXPORT" to generate your GIF

### Keyboard Shortcuts
- `R` - Start GIF recording
- `S` - Save current frame as PNG
- `K` - Toggle Kaleidoscope mode
- `P` - Pause/Play animation

### Tips for Best Results

#### Creating Smooth Moiré Patterns
- Use contrasting speeds (e.g., 1.0 and 2.0)
- Keep complexity between 15-30 for optimal detail
- Start with complementary colors for maximum contrast

#### Optimizing Performance
- Lower FPS (15-30) for faster export and smaller files
- Reduce complexity if experiencing lag
- Use simpler patterns (Concentric Circles, Radial Lines) for better performance

#### Achieving Perfect Loops
- Keep duration at whole numbers (2, 3, 5 seconds work well)
- Use speed ratios that are simple fractions (1:2, 2:3, 3:4)
- Test the loop before exporting (it repeats automatically)

#### Export Quality
- **Web/Social Media**: 30 FPS, 3 seconds, 800px
- **High Quality**: 60 FPS, 5 seconds, 1200px
- **File Size**: 15 FPS, 2 seconds, 600px

## GUI Structure

### Layer 1 / Layer 2
- Pattern selection dropdown
- Speed slider
- Color picker

### Animation
- Complexity (pattern density)
- Speed Ratio (mathematical relationship)

### Effects
- Chromatic Aberration intensity
- Kaleidoscope toggle and segment count

### Style
- Palette presets dropdown
- Background color picker
- Stroke weight

### Canvas
- Orientation (Horizontal/Vertical)
- Aspect Ratio (filtered by orientation)
- Size in pixels
- Pattern Radius scale

### Export
- Duration (seconds)
- FPS (frames per second)
- Record & Export button
- Save Frame button

### Actions
- Pause/Play toggle

## Performance Notes

### Optimal Settings
- Canvas size: 800px or less
- Complexity: 20-30
- FPS: 30 (balances quality and speed)

### Heavy Settings
- Canvas size: 1200px+
- Complexity: 40+
- FPS: 60
- Kaleidoscope with 12 segments

If you experience lag:
1. Reduce canvas size
2. Lower complexity
3. Decrease FPS
4. Disable kaleidoscope
5. Use simpler pattern types

## Troubleshooting

### GIF Export Not Working
- Check browser console for errors
- Ensure p5.createLoop loaded correctly
- Try reducing duration or FPS
- Check available disk space

### Animation Not Looping Smoothly
- Verify speed ratio is a simple fraction
- Ensure duration is a whole number
- Check that FPS matches your preview settings

### Canvas Not Resizing
- Click away from size slider and back
- Try changing aspect ratio first
- Refresh the page if issues persist

### Colors Not Updating
- Palette presets override individual colors
- Select palette first, then customize colors
- Click color picker to ensure it's active

## Potential improvements:
- Additional pattern types
- More visual effects
- Preset animation templates
- Mobile optimization
- Video export (MP4)
- Batch export multiple variations