# Chemical Reaction Brush
## Vibe-Coding Assignment: Brush

### ⚡ PERFORMANCE OPTIMIZATIONS

**This version is balanced between quality and performance!**

- **3 Resolution Levels**: 
  - Low (width/2.8 - fast and good quality)
  - Medium (width/2.2 - balanced, **recommended default**)
  - High (width/1.7 - detailed but slower)
- **Simulation Speed**: 1-5 steps per frame for faster evolution
- **Grid size cap**: Max 380x380 for stability
- **Frame rate**: 30fps (instead of 60) to reduce load
- **Velocity sensor**: Less sensitive, more controllable
- **1D Arrays**: Float32Array for 2-3x faster simulation
- **Optimized rendering**: Pre-calculated colors, minimal operations
- **Adaptive grid**: Adjusts to window size

---

## Implemented Features

### Technical Requirements

**1. Gray-Scott Algorithm**
- Complete Reaction-Diffusion implementation
- Two 2D arrays for Chemical A and Chemical B (optimized as 1D Float32Arrays)
- 9-point Laplacian stencil for diffusion
- Detailed comments with mathematical equations

**2. Performance Optimization**
- `pixelDensity(1)` for stability
- `loadPixels()` / `updatePixels()` in draw loop
- Reduced resolution grid for performance (gridWidth/gridHeight)
- 30 FPS smooth
- **1D arrays with inline indexing** for 2-3x faster simulation

**3. Interactive Brush**
- Mouse deposits Chemical B
- **ADVANCED FEATURE**: Mouse velocity influences density
  - Fast movement = thin deposit
  - Slow movement = dense growth
- Real-time velocity indicator

**4. GUI with lil-gui**
- **6 Chemical Presets**: Coral, Fingerprint, Cellular, Mitosis, Waves, Spirals
- Sliders for Feed Rate (f) and Kill Rate (k)
- Sliders for Diffusion Rate of A and B
- Brush controls (radius, density, velocity effect)
- **5 Color modes**: Neon Glow, Heat Map, Acid Green, Electric Cyan, Magmatic Orange
- Color pickers for background and chemical color

**5. Raster Intersection**
- Toggle for Halftone/Dither effect
- 4x4 Bayer matrix for ordered dithering
- Dithering intensity slider

**6. Export Function**
- Dedicated button to export high-resolution PNG
- Keyboard shortcut: `S`

---

## Bio-Synthetic Aesthetic

- **Background**: Deep charcoal (#0a0a0a) - Obsidian black
- **Primary color**: Electric Cyan (#00ff9f) with neon glow
- **Typography**: 
  - Orbitron (display, titles) - futuristic
  - Space Mono (UI, monospace) - technical
- **Effects**:
  - Pulsing glow text-shadow
  - Box-shadow on GUI controls
  - Smooth transitions on all interactive elements

---

## Keyboard Shortcuts

- `C` - Clear & Reset canvas
- `S` - Save/Export PNG image
- `H` - Toggle Halftone effect

---

## How the Algorithm Works

### Gray-Scott Reaction-Diffusion

The system simulates an autocatalytic chemical reaction between two substances:

**Reactions:**
```
A + 2B → 3B  (autocatalytic)
B → P        (decay)
```

**Equations:**
```
dA/dt = Da·∇²A - AB² + f(1-A)
dB/dt = Db·∇²B + AB² - (k+f)B
```

Where:
- **Da, Db**: Diffusion rates (how fast substances spread)
- **f**: Feed rate (speed of A replenishment)
- **k**: Kill rate (speed of B removal)
- **∇²**: Laplacian operator (spatial diffusion)

### Laplacian Stencil

Uses a 9-point 3x3 convolution kernel:
```
  0.05   0.2   0.05
  0.2   -1.0   0.2
  0.05   0.2   0.05
```

Approximates: `∇²f = (∂²f/∂x²) + (∂²f/∂y²)`

---

## Color Modes Explained

**Color Mode** in the GUI controls how Chemical B concentration is visualized. Each mode creates a completely different aesthetic.

### **Neon Glow** (Default)
- **Look**: Bio-synthetic with luminous effect
- **Colors**: Dark background to chemical color (#00ff9f cyan-green)
- **Special effect**: High concentration (>50%) adds white glow for neon effect
- **Use for**: Cyber/futuristic aesthetic, alien organic

### **Heat Map**
- **Look**: Thermal map / infrared vision
- **Colors**: Dark blue (cold) → Bright red (#ff3300)
- **Auto-updates**: Chemical Color → #ff3300 (red)
- **Use for**: Scientific visualization, lava, heat

### **Acid Green**
- **Look**: Radioactive / toxic
- **Colors**: Background → Fluorescent acid green (#39ff14)
- **Auto-updates**: Chemical Color → #39ff14 (acid green)
- **Use for**: Matrix aesthetic, sci-fi, toxic waste

### **Electric Cyan**
- **Look**: Electric / energetic
- **Colors**: Background → Electric cyan (#00ffff)
- **Auto-updates**: Chemical Color → #00ffff (cyan)
- **Use for**: Electric energy, alien water, digital

### **Magmatic Orange**
- **Look**: Lava / liquid fire
- **Colors**: Background → Magmatic orange (#ff6600)
- **Auto-updates**: Chemical Color → #ff6600 (orange)
- **Use for**: Lava, fire, alien sunset

---

## Recommended Presets

**Coral** (f=0.055, k=0.062)
- Organic coral-like patterns
- Dense branching growth

**Fingerprint** (f=0.037, k=0.060)
- Concentric curved lines
- Similar to fingerprints

**Cellular** (f=0.039, k=0.058)
- Cellular structures
- Dotted organic pattern

**Mitosis** (f=0.029, k=0.057)
- Cell division
- Spots that multiply

**Waves** (f=0.014, k=0.054)
- Concentric waves
- Fluid patterns

**Spirals** (f=0.018, k=0.051)
- Organic spirals
- Chemical vortices

---

## Usage Tips

### For Maximum Performance:
1. **Use "Low Resolution"** if still slow - Still good quality
2. **Default "Medium" is balanced** - Good quality/speed compromise
3. **Increase "Sim Speed" to 2** - Pattern evolves faster
4. **Brush velocity is less sensitive now** - More control over deposit
5. **Avoid Halftone on Low** - Computationally expensive

### Play around:
1. **Start with a preset** - Try "Coral" or "Fingerprint"
2. **Brush is less sensitive now** - Easier to control deposit
3. **Move mouse slowly** for dense deposits
4. **Move fast** for thin lines (but less drastic than before)
5. **Experiment with colors** - Try different palettes
6. **Enable Halftone** for raster/retro effect (only on Medium/High)
7. **Adjust "Velocity Effect"** between 0-1 to customize sensitivity

---

## Code Structure

```
sketch.js           → Main logic, Gray-Scott algorithm
├─ setup()         → Canvas and grid initialization
├─ draw()          → Main loop (30fps)
├─ initializeGrid() → Reset chemical grid
├─ depositChemical() → Brush interaction with velocity
├─ simulateReactionDiffusion() → Core algorithm (1D arrays)
├─ renderChemicals() → Optimized rendering with pixels[]
├─ setupGUI()      → lil-gui configuration
└─ keyboard shortcuts

index.html         → HTML structure + UI overlay
style.css          → Bio-synthetic styling + GUI theming

---

## 🔧 Troubleshooting

**If it's too slow (IMPORTANT!):**
1. **Open the "Performance" folder** in the GUI
2. **Set Resolution to "Low"** - This is the most important change!
3. **Increase Sim Speed to 2 or 3** - Pattern evolves faster
4. **Disable Halftone** if active - Very expensive
5. Alternatively, modify `gridWidth = floor(width / 3.5)` for even smaller grid

**If GUI doesn't appear:**
- Verify that lil-gui.umd.min.js is loading correctly
- Check browser console for JavaScript errors

**If colors aren't visible:**
- Check the Color Picker in GUI
- Try changing Color Mode

**Advanced performance tip:**
Comment out the `frameRate(30);` line in setup() to get unlimited FPS (but more unstable)

---

## Performance Optimizations Explained

### **1D Arrays vs 2D Arrays**
- **Before**: `gridA[x][y]` required two array lookups
- **After**: `gridA[x + y * gridWidth]` is a single lookup in contiguous memory
- **Result**: Much better CPU cache performance, 2-3x faster

### **Float32Array**
- Uses typed arrays instead of standard JavaScript arrays
- Fixed memory size with better performance
- Direct memory access without JavaScript object overhead

### **Inline Index Calculation**
```javascript
// Instead of function calls:
let idx = x + y * gridWidth;
let left = idx - 1;
let right = idx + 1;

// We calculate inline:
gridA[idx - 1]  // left
gridA[idx + 1]  // right
```

This eliminates function call overhead and improves performance.