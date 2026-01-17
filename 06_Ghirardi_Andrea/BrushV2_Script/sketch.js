// ============================================
// CHEMICAL REACTOR - p5.js Editor Version
// Gray-Scott Reaction-Diffusion Algorithm
// ============================================

let gridA, gridB;
let nextA, nextB;
let gridWidth, gridHeight;
let gridSize;

// Simulation parameters
let params = {
    feedRate: 0.055,
    killRate: 0.062,
    diffusionA: 1.0,
    diffusionB: 0.5,
    resolution: 'Medium',
    simSpeed: 1,
    brushRadius: 20,
    brushDensity: 1.0,
    velocityEffect: 0.3,
    backgroundColor: '#0a0a0a',
    chemicalColor: '#00ff9f',
    colorMode: 'Neon Glow',
    halftone: false,
    ditherStrength: 0.5
};

// Store default values
let defaultParams = {
    feedRate: 0.055,
    killRate: 0.062,
    diffusionA: 1.0,
    diffusionB: 0.5,
    resolution: 'Medium',
    simSpeed: 1,
    brushRadius: 20,
    brushDensity: 1.0,
    velocityEffect: 0.3,
    backgroundColor: '#0a0a0a',
    chemicalColor: '#00ff9f',
    colorMode: 'Neon Glow',
    halftone: false,
    ditherStrength: 0.5
};

// Mouse tracking
let prevMouseX = 0;
let prevMouseY = 0;
let mouseVelocity = 0;
let lastDepositX = 0;
let lastDepositY = 0;
let mouseWasPressed = false;

// Preset boost
let presetBoostFrames = 0;
let originalSimSpeed = 1;

// GIF Recording
let isRecordingGIF = false;
let gifFrames = [];
let gifFrameCount = 0;
let gifSettings = {
    duration: 5,  // seconds
    fps: 30,      // frames per second
    quality: 10   // 1-30, lower is better quality
};
let maxGifFrames = gifSettings.duration * gifSettings.fps;

// UI Elements
let guiContainer;
let sliders = {};
let buttons = {};
let selects = {};
let showGUI = true;
let guiBounds = { x: 20, y: 20, width: 300, height: 800 };
let isInteractingWithGUI = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    
    updateGridSize();
    initializeGrid();
    
    // Create GUI
    createGUI();
    
    frameRate(30);
}

function createGUI() {
    // Container principale
    guiContainer = createDiv('');
    guiContainer.position(20, 20);
    guiContainer.style('background-color', 'rgba(10, 10, 10, 0.95)');
    guiContainer.style('border', '2px solid rgba(0, 255, 159, 0.4)');
    guiContainer.style('border-radius', '8px');
    guiContainer.style('padding', '20px');
    guiContainer.style('color', '#00ff9f');
    guiContainer.style('font-family', 'monospace');
    guiContainer.style('font-size', '12px');
    guiContainer.style('max-height', (height - 40) + 'px');
    guiContainer.style('overflow-y', 'auto');
    guiContainer.style('width', '300px');
    guiContainer.style('box-shadow', '0 0 30px rgba(0, 255, 159, 0.2)');
    guiContainer.style('z-index', '1000');
    guiContainer.style('pointer-events', 'auto');
    
    // Prevent mouse events from reaching canvas
    guiContainer.elt.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    guiContainer.elt.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    });
    guiContainer.elt.addEventListener('mouseenter', () => {
        isInteractingWithGUI = true;
    });
    guiContainer.elt.addEventListener('mouseleave', () => {
        isInteractingWithGUI = false;
    });
    
    // Title
    let title = createDiv('🧪 REACTOR CONTROLS');
    title.style('font-size', '18px');
    title.style('font-weight', 'bold');
    title.style('margin-bottom', '20px');
    title.style('text-align', 'center');
    title.style('letter-spacing', '2px');
    title.style('color', '#00ff9f');
    title.parent(guiContainer);
    
    // PRESETS SECTION
    addSection('CHEMICAL PRESETS');
    
    let presetsGrid = createDiv('');
    presetsGrid.style('display', 'grid');
    presetsGrid.style('grid-template-columns', '1fr 1fr 1fr');
    presetsGrid.style('gap', '6px');
    presetsGrid.style('margin-bottom', '10px');
    presetsGrid.parent(guiContainer);
    
    let presets = ['Coral', 'Maze', 'Mitosis', 'Worms', 'Waves', 'Spirals', 'Chaos', 'Fingerprint', 'Bubbles'];
    presets.forEach(preset => {
        let btn = createButton(preset);
        styleButton(btn);
        btn.mousePressed(() => loadPreset(preset));
        btn.parent(presetsGrid);
        btn.style('width', '100%');
        btn.style('margin', '0');
        btn.style('font-size', '10px');
        btn.style('padding', '8px 6px');
    });
    
    // REACTION PARAMETERS
    addSection('REACTION PARAMETERS');
    sliders.feedRate = addSlider('Feed Rate (f)', 0, 0.1, params.feedRate, 0.001, (val) => {
        params.feedRate = val;
    });
    sliders.killRate = addSlider('Kill Rate (k)', 0, 0.1, params.killRate, 0.001, (val) => {
        params.killRate = val;
    });
    sliders.diffusionA = addSlider('Diffusion A', 0, 2, params.diffusionA, 0.01, (val) => {
        params.diffusionA = val;
    });
    sliders.diffusionB = addSlider('Diffusion B', 0, 2, params.diffusionB, 0.01, (val) => {
        params.diffusionB = val;
    });
    
    // BRUSH SETTINGS
    addSection('BRUSH SETTINGS');
    sliders.brushRadius = addSlider('Radius', 5, 40, params.brushRadius, 1, (val) => {
        params.brushRadius = val;
    });
    sliders.brushDensity = addSlider('Density', 0.1, 1, params.brushDensity, 0.1, (val) => {
        params.brushDensity = val;
    });
    sliders.velocityEffect = addSlider('Velocity Effect', 0, 1, params.velocityEffect, 0.1, (val) => {
        params.velocityEffect = val;
    });
    
    // PERFORMANCE
    addSection('PERFORMANCE');
    
    addSelect('Resolution', selects, 'resolution', 
        ['Low', 'Medium', 'High'], 
        params.resolution,
        (val) => {
            params.resolution = val;
            updateGridSize();
            initializeGrid();
        }
    );
    
    // Performance tip
    let perfTip = createDiv('💡 Low/Medium recommended for smooth performance');
    perfTip.style('font-size', '10px');
    perfTip.style('color', 'rgba(0, 255, 159, 0.6)');
    perfTip.style('margin-top', '4px');
    perfTip.style('margin-bottom', '10px');
    perfTip.style('font-style', 'italic');
    perfTip.parent(guiContainer);
    
    sliders.simSpeed = addSlider('Sim Speed', 1, 5, params.simSpeed, 1, (val) => {
        params.simSpeed = val;
    });
    
    // VISUAL SETTINGS
    addSection('VISUAL SETTINGS');
    
    addSelect('Color Mode', selects, 'colorMode',
        ['Neon Glow', 'Heat Map', 'Acid Green', 'Electric Cyan', 'Magmatic Orange'],
        params.colorMode,
        (val) => {
            params.colorMode = val;
            updateColorMode();
        }
    );
    
    // Background Color Picker
    let bgColorContainer = createDiv('');
    bgColorContainer.parent(guiContainer);
    bgColorContainer.style('margin-bottom', '15px');
    
    let bgColorLabel = createDiv('Background Color:');
    bgColorLabel.style('font-size', '11px');
    bgColorLabel.style('color', '#00ff9f');
    bgColorLabel.style('margin-bottom', '6px');
    bgColorLabel.parent(bgColorContainer);
    
    let bgColorPicker = createColorPicker(params.backgroundColor);
    bgColorPicker.parent(bgColorContainer);
    bgColorPicker.style('width', '100%');
    bgColorPicker.style('height', '35px');
    bgColorPicker.style('border', '1px solid #00ff9f');
    bgColorPicker.style('border-radius', '4px');
    bgColorPicker.style('cursor', 'pointer');
    bgColorPicker.input(() => {
        params.backgroundColor = bgColorPicker.value();
    });
    sliders.bgColorPicker = bgColorPicker; // Store reference for updates
    
    // Chemical/Brush Color Picker
    let chemColorContainer = createDiv('');
    chemColorContainer.parent(guiContainer);
    chemColorContainer.style('margin-bottom', '15px');
    
    let chemColorLabel = createDiv('Brush/Chemical Color:');
    chemColorLabel.style('font-size', '11px');
    chemColorLabel.style('color', '#00ff9f');
    chemColorLabel.style('margin-bottom', '6px');
    chemColorLabel.parent(chemColorContainer);
    
    let chemColorPicker = createColorPicker(params.chemicalColor);
    chemColorPicker.parent(chemColorContainer);
    chemColorPicker.style('width', '100%');
    chemColorPicker.style('height', '35px');
    chemColorPicker.style('border', '1px solid #00ff9f');
    chemColorPicker.style('border-radius', '4px');
    chemColorPicker.style('cursor', 'pointer');
    chemColorPicker.input(() => {
        params.chemicalColor = chemColorPicker.value();
    });
    sliders.chemColorPicker = chemColorPicker; // Store reference for updates
    
    // Halftone checkbox
    addCheckbox('Halftone', params.halftone, (val) => {
        params.halftone = val;
    });
    
    sliders.ditherStrength = addSlider('Dither Strength', 0, 1, params.ditherStrength, 0.1, (val) => {
        params.ditherStrength = val;
    });
    
    // GIF RECORDING SETTINGS
    addSection('GIF RECORDING');
    
    sliders.gifDuration = addSlider('Duration (seconds)', 1, 60, gifSettings.duration, 1, (val) => {
        gifSettings.duration = val;
        // Update button text
        if (buttons.gifBtn) {
            buttons.gifBtn.html(`🎬 Record GIF (${gifSettings.duration}s)`);
        }
    });
    
    sliders.gifFPS = addSlider('FPS', 10, 60, gifSettings.fps, 5, (val) => {
        gifSettings.fps = val;
    });
    
    // Info text
    let gifInfo = createDiv('💡 Creates a single animated GIF file<br>⚠️ Long durations or high FPS may take time to process');
    gifInfo.style('font-size', '10px');
    gifInfo.style('color', 'rgba(0, 255, 159, 0.6)');
    gifInfo.style('margin-top', '8px');
    gifInfo.style('margin-bottom', '10px');
    gifInfo.style('font-style', 'italic');
    gifInfo.style('line-height', '1.5');
    gifInfo.parent(guiContainer);
    
    // ACTIONS
    addSection('ACTIONS');
    
    let actionsGrid = createDiv('');
    actionsGrid.style('display', 'grid');
    actionsGrid.style('gap', '8px');
    actionsGrid.parent(guiContainer);
    
    let clearBtn = createButton('🗑️ Clear Canvas (C)');
    styleButton(clearBtn);
    clearBtn.mousePressed(() => initializeGrid());
    clearBtn.parent(actionsGrid);
    clearBtn.style('width', '100%');
    clearBtn.style('margin', '0');
    
    let saveBtn = createButton('💾 Save Image (S)');
    styleButton(saveBtn);
    saveBtn.mousePressed(() => {
        // Hide GUI temporarily for clean screenshot
        let wasShowing = showGUI;
        showGUI = false;
        
        // Wait one frame to ensure GUI is hidden, then save
        setTimeout(() => {
            saveCanvas('chemical-reactor', 'png');
            // Restore GUI visibility
            showGUI = wasShowing;
        }, 50);
    });
    saveBtn.parent(actionsGrid);
    saveBtn.style('width', '100%');
    saveBtn.style('margin', '0');
    
    // GIF Recording button
    let gifBtn = createButton(`🎬 Record GIF (${gifSettings.duration}s)`);
    buttons.gifBtn = gifBtn;
    styleButton(gifBtn);
    gifBtn.mousePressed(() => {
        if (!isRecordingGIF) {
            startGIFRecording();
            gifBtn.html('⏹️ Stop Recording');
            gifBtn.style('background-color', 'rgba(255, 50, 50, 0.3)');
        } else {
            stopGIFRecording();
            gifBtn.html(`🎬 Record GIF (${gifSettings.duration}s)`);
            gifBtn.style('background-color', 'rgba(0, 255, 159, 0.15)');
        }
    });
    gifBtn.parent(actionsGrid);
    gifBtn.style('width', '100%');
    gifBtn.style('margin', '0');
    
    let resetBtn = createButton('🔄 Reset Defaults (R)');
    styleButton(resetBtn);
    resetBtn.mousePressed(() => resetToDefaults());
    resetBtn.parent(actionsGrid);
    resetBtn.style('width', '100%');
    resetBtn.style('margin', '0');
    
    let toggleBtn = createButton('👁️ Toggle GUI (G)');
    styleButton(toggleBtn);
    toggleBtn.mousePressed(() => toggleGUI());
    toggleBtn.parent(actionsGrid);
    toggleBtn.style('width', '100%');
    toggleBtn.style('margin', '0');
    
    // Instructions at bottom
    addSection('INSTRUCTIONS');
    let instructions = createDiv(
        'CLICK + DRAG to deposit Chemical B<br>' +
        'Mouse VELOCITY affects density<br>' +
        'Press 1-9 for presets<br>' +
        'Press G to hide this panel'
    );
    instructions.style('font-size', '11px');
    instructions.style('line-height', '1.7');
    instructions.style('color', 'rgba(0, 255, 159, 0.7)');
    instructions.style('margin-top', '5px');
    instructions.parent(guiContainer);
    
    // Update GUI bounds after creation
    updateGUIBounds();
}

function addSection(title) {
    let section = createDiv(title);
    section.style('margin-top', '20px');
    section.style('margin-bottom', '12px');
    section.style('font-weight', 'bold');
    section.style('font-size', '12px');
    section.style('color', '#00ff9f');
    section.style('border-bottom', '1px solid rgba(0, 255, 159, 0.3)');
    section.style('padding-bottom', '6px');
    section.style('letter-spacing', '1px');
    section.parent(guiContainer);
}

function addSlider(label, min, max, value, step, callback) {
    let container = createDiv('');
    container.parent(guiContainer);
    container.style('margin-bottom', '15px');
    
    // Label row with value
    let labelRow = createDiv('');
    labelRow.style('display', 'flex');
    labelRow.style('justify-content', 'space-between');
    labelRow.style('align-items', 'center');
    labelRow.style('margin-bottom', '6px');
    labelRow.parent(container);
    
    let labelSpan = createSpan(label);
    labelSpan.parent(labelRow);
    labelSpan.style('font-size', '11px');
    labelSpan.style('color', '#00ff9f');
    
    let valueSpan = createSpan(formatValue(value, step));
    valueSpan.parent(labelRow);
    valueSpan.style('font-size', '11px');
    valueSpan.style('color', '#00ffaa');
    valueSpan.style('font-weight', 'bold');
    
    // Slider
    let slider = createSlider(min, max, value, step);
    slider.parent(container);
    slider.style('width', '100%');
    slider.style('height', '6px');
    slider.style('cursor', 'pointer');
    slider.input(() => {
        let val = slider.value();
        valueSpan.html(formatValue(val, step));
        callback(val);
    });
    
    // Custom slider styling with CSS
    slider.style('accent-color', '#00ff9f');
    slider.style('-webkit-appearance', 'none');
    slider.style('appearance', 'none');
    slider.style('background', 'rgba(0, 255, 159, 0.2)');
    slider.style('border-radius', '3px');
    slider.style('outline', 'none');
    
    return slider;
}

function addSelect(label, selectsObj, key, options, defaultVal, callback) {
    let container = createDiv('');
    container.parent(guiContainer);
    container.style('margin-bottom', '15px');
    
    // Label
    let labelDiv = createDiv(label + ':');
    labelDiv.style('font-size', '11px');
    labelDiv.style('color', '#00ff9f');
    labelDiv.style('margin-bottom', '6px');
    labelDiv.parent(container);
    
    // Select
    let sel = createSelect();
    options.forEach(opt => sel.option(opt));
    sel.selected(defaultVal);
    sel.changed(() => callback(sel.value()));
    sel.parent(container);
    
    sel.style('width', '100%');
    sel.style('background-color', 'rgba(0, 255, 159, 0.15)');
    sel.style('border', '1px solid #00ff9f');
    sel.style('color', '#00ff9f');
    sel.style('padding', '8px 12px');
    sel.style('border-radius', '4px');
    sel.style('font-family', 'monospace');
    sel.style('font-size', '11px');
    sel.style('cursor', 'pointer');
    sel.style('outline', 'none');
    
    selectsObj[key] = sel;
}

function addCheckbox(label, defaultVal, callback) {
    let container = createDiv('');
    container.parent(guiContainer);
    container.style('margin-bottom', '15px');
    container.style('display', 'flex');
    container.style('align-items', 'center');
    container.style('gap', '10px');
    
    let checkbox = createCheckbox('', defaultVal);
    checkbox.changed(() => callback(checkbox.checked()));
    checkbox.parent(container);
    checkbox.style('width', '18px');
    checkbox.style('height', '18px');
    checkbox.style('cursor', 'pointer');
    checkbox.style('accent-color', '#00ff9f');
    
    let labelSpan = createSpan(label + ':');
    labelSpan.parent(container);
    labelSpan.style('font-size', '11px');
    labelSpan.style('color', '#00ff9f');
}

function formatValue(val, step) {
    if (step >= 1) return val.toFixed(0);
    if (step >= 0.1) return val.toFixed(1);
    if (step >= 0.01) return val.toFixed(2);
    return val.toFixed(3);
}

function styleButton(btn) {
    btn.style('background-color', 'rgba(0, 255, 159, 0.15)');
    btn.style('border', '1px solid #00ff9f');
    btn.style('color', '#00ff9f');
    btn.style('padding', '10px 15px');
    btn.style('border-radius', '4px');
    btn.style('cursor', 'pointer');
    btn.style('font-family', 'monospace');
    btn.style('font-size', '11px');
    btn.style('font-weight', 'bold');
    btn.style('transition', 'all 0.2s ease');
    btn.style('outline', 'none');
    
    // Prevent canvas interaction when clicking button
    btn.mousePressed((e) => {
        if (e) e.stopPropagation();
    });
    
    btn.mouseOver(() => {
        btn.style('background-color', 'rgba(0, 255, 159, 0.3)');
        btn.style('box-shadow', '0 0 15px rgba(0, 255, 159, 0.5)');
        btn.style('transform', 'translateY(-1px)');
    });
    btn.mouseOut(() => {
        btn.style('background-color', 'rgba(0, 255, 159, 0.15)');
        btn.style('box-shadow', 'none');
        btn.style('transform', 'translateY(0)');
    });
}

function toggleGUI() {
    showGUI = !showGUI;
    if (showGUI) {
        guiContainer.show();
    } else {
        guiContainer.hide();
    }
}

function updateColorMode() {
    const colorPresets = {
        'Neon Glow': { 
            chemical: '#00ff9f',
            background: '#0a0a0a'
        },
        'Heat Map': { 
            chemical: '#ff3300',
            background: '#001a33'
        },
        'Acid Green': { 
            chemical: '#39ff14',
            background: '#0a0a0a'
        },
        'Electric Cyan': { 
            chemical: '#00ffff',
            background: '#001a1a'
        },
        'Magmatic Orange': { 
            chemical: '#ff6600',
            background: '#1a0a00'
        }
    };
    
    if (colorPresets[params.colorMode]) {
        params.chemicalColor = colorPresets[params.colorMode].chemical;
        params.backgroundColor = colorPresets[params.colorMode].background;
        
        // Update both color pickers to reflect the new colors
        if (sliders.chemColorPicker) {
            sliders.chemColorPicker.value(params.chemicalColor);
        }
        if (sliders.bgColorPicker) {
            sliders.bgColorPicker.value(params.backgroundColor);
        }
    }
}

function updateGridSize() {
    const resolutionMap = {
        'Low': 3.2,      // Even lower divisor for faster Low
        'Medium': 2.5,   // Slightly increased for better performance
        'High': 2.0      // Increased from 1.7 for much better performance
    };
    
    let divisor = resolutionMap[params.resolution] || 2.5;
    gridWidth = floor(width / divisor);
    gridHeight = floor(height / divisor);
    
    // Reduced caps for better performance
    if (params.resolution === 'High') {
        gridWidth = min(gridWidth, 320);  // Reduced from 380
        gridHeight = min(gridHeight, 320);
    } else if (params.resolution === 'Medium') {
        gridWidth = min(gridWidth, 380);
        gridHeight = min(gridHeight, 380);
    } else {
        gridWidth = min(gridWidth, 280);  // Low resolution cap
        gridHeight = min(gridHeight, 280);
    }
    
    gridSize = gridWidth * gridHeight;
}

function initializeGrid() {
    gridA = new Float32Array(gridSize);
    gridB = new Float32Array(gridSize);
    nextA = new Float32Array(gridSize);
    nextB = new Float32Array(gridSize);
    
    for (let i = 0; i < gridSize; i++) {
        gridA[i] = 1.0;
        gridB[i] = 0.0;
        nextA[i] = 1.0;
        nextB[i] = 0.0;
    }
}

function draw() {
    // Calculate mouse velocity
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    mouseVelocity = sqrt(dx * dx + dy * dy);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    // Deposit Chemical B when mouse is pressed (but NOT over GUI)
    if (mouseIsPressed && 
        mouseX > 0 && mouseX < width && 
        mouseY > 0 && mouseY < height &&
        !isInteractingWithGUI) {
        // Initialize last deposit position on first press
        if (!mouseWasPressed) {
            lastDepositX = mouseX;
            lastDepositY = mouseY;
        }
        depositChemicalSmooth(mouseX, mouseY);
        lastDepositX = mouseX;
        lastDepositY = mouseY;
    }
    
    // Track mouse press state
    mouseWasPressed = mouseIsPressed;
    
    // Use boosted sim speed for preset initialization
    let currentSimSpeed = params.simSpeed;
    if (presetBoostFrames > 0) {
        currentSimSpeed = 5; // Reduced to 5x boost instead of 10x
        presetBoostFrames--;
        if (presetBoostFrames === 0) {
            params.simSpeed = originalSimSpeed;
            if (sliders.simSpeed) sliders.simSpeed.value(params.simSpeed);
        }
    }
    
    // Run simulation
    for (let i = 0; i < currentSimSpeed; i++) {
        simulateReactionDiffusion();
    }
    
    // Render chemicals
    renderChemicals();
    
    // Capture frame for GIF if recording
    if (isRecordingGIF) {
        // Capture current frame
        gifFrames.push(get());
        gifFrameCount++;
        
        // Stop recording after maxGifFrames
        if (gifFrameCount >= maxGifFrames) {
            stopGIFRecording();
        }
    }
    
    // Draw velocity indicator only if GUI is visible (skip if hidden for performance)
    if (showGUI) {
        drawVelocityIndicator();
        
        // Draw recording indicator if recording
        if (isRecordingGIF) {
            drawRecordingIndicator();
        }
    }
}

function drawRecordingIndicator() {
    push();
    
    // Recording dot in top right
    let dotX = width - 40;
    let dotY = 40;
    
    // Pulsing red dot
    let pulseAlpha = 150 + sin(frameCount * 0.2) * 105;
    fill(255, 0, 0, pulseAlpha);
    noStroke();
    circle(dotX, dotY, 20);
    
    // REC text
    fill(255, 0, 0, pulseAlpha);
    textSize(14);
    textFont('monospace');
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text('REC', dotX - 15, dotY);
    
    // Progress bar
    let barWidth = 200;
    let barHeight = 8;
    let barX = width - barWidth - 20;
    let barY = 70;
    
    // Background
    fill(20, 20, 20, 200);
    stroke(255, 0, 0, 100);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight, 2);
    
    // Progress
    let progress = gifFrameCount / maxGifFrames;
    noStroke();
    fill(255, 0, 0, 200);
    rect(barX, barY, barWidth * progress, barHeight, 2);
    
    // Frame count
    textAlign(RIGHT, TOP);
    textSize(11);
    fill(255, 0, 0, 200);
    text(`${gifFrameCount}/${maxGifFrames} frames`, width - 20, 85);
    
    pop();
}

function drawVelocityIndicator() {
    if (!showGUI) return;
    
    push();
    let velX = 20;
    let velY = height - 50;
    let velBarWidth = 250;
    let velBarHeight = 10;
    
    // Background panel
    fill(10, 10, 10, 240);
    stroke(0, 255, 159, 100);
    strokeWeight(1);
    rect(velX - 5, velY - 25, velBarWidth + 10, 45, 5);
    
    // Label
    noStroke();
    fill(0, 255, 159, 200);
    textSize(10);
    textFont('monospace');
    textStyle(BOLD);
    text('BRUSH VELOCITY', velX, velY - 8);
    
    // Bar background
    stroke(0, 255, 159, 100);
    strokeWeight(1);
    noFill();
    rect(velX, velY, velBarWidth, velBarHeight, 2);
    
    // Velocity fill
    let velocityPercent = min(mouseVelocity / 90, 1.0);
    noStroke();
    
    // Gradient effect
    for (let i = 0; i < velocityPercent * velBarWidth; i++) {
        let alpha = map(i, 0, velBarWidth, 150, 255);
        fill(0, 255, 159, alpha);
        rect(velX + i, velY, 1, velBarHeight);
    }
    
    pop();
}

function depositChemicalSmooth(currentX, currentY) {
    // Calculate distance from last deposit
    let distance = dist(lastDepositX, lastDepositY, currentX, currentY);
    
    // If distance is small, just deposit at current position
    if (distance < 2) {
        depositChemicalAt(currentX, currentY);
        return;
    }
    
    // Interpolate between last and current position
    // Number of steps based on distance to ensure smooth line
    let steps = ceil(distance / 2);
    
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = lerp(lastDepositX, currentX, t);
        let y = lerp(lastDepositY, currentY, t);
        depositChemicalAt(x, y);
    }
}

function depositChemicalAt(x, y) {
    // Convert mouse position to grid coordinates
    let gx = floor(map(x, 0, width, 0, gridWidth));
    let gy = floor(map(y, 0, height, 0, gridHeight));
    
    // Calculate effective brush radius based on velocity
    let velocityFactor = 1.0 - (mouseVelocity / 150.0) * params.velocityEffect;
    velocityFactor = constrain(velocityFactor, 0.5, 1.0);
    
    let effectiveRadius = params.brushRadius * velocityFactor;
    let effectiveDensity = params.brushDensity * velocityFactor;
    
    // Deposit Chemical B in a circular area
    let radiusSq = effectiveRadius * effectiveRadius;
    let startX = max(1, floor(gx - effectiveRadius));
    let endX = min(gridWidth - 1, ceil(gx + effectiveRadius));
    let startY = max(1, floor(gy - effectiveRadius));
    let endY = min(gridHeight - 1, ceil(gy + effectiveRadius));
    
    for (let ix = startX; ix < endX; ix++) {
        for (let iy = startY; iy < endY; iy++) {
            let dx = ix - gx;
            let dy = iy - gy;
            let distSq = dx * dx + dy * dy;
            
            if (distSq < radiusSq) {
                let idx = ix + iy * gridWidth;
                let dist = sqrt(distSq);
                
                // Smooth falloff from center
                let amount = (1.0 - dist / effectiveRadius) * effectiveDensity;
                gridB[idx] = min(gridB[idx] + amount * 0.3, 1.0); // Reduced amount for smoother deposition
            }
        }
    }
}

function simulateReactionDiffusion() {
    // Pre-calculate frequently used values
    let killPlusFeed = params.killRate + params.feedRate;
    let oneMinusKillPlusFeed = 1.0 - killPlusFeed;
    
    for (let x = 1; x < gridWidth - 1; x++) {
        for (let y = 1; y < gridHeight - 1; y++) {
            let idx = x + y * gridWidth;
            
            let a = gridA[idx];
            let b = gridB[idx];
            
            // Laplacian calculation with inline operations
            let laplaceA = gridA[idx] * -1.0;
            laplaceA += gridA[idx - 1] * 0.2;
            laplaceA += gridA[idx + 1] * 0.2;
            laplaceA += gridA[idx - gridWidth] * 0.2;
            laplaceA += gridA[idx + gridWidth] * 0.2;
            laplaceA += gridA[idx - 1 - gridWidth] * 0.05;
            laplaceA += gridA[idx + 1 - gridWidth] * 0.05;
            laplaceA += gridA[idx - 1 + gridWidth] * 0.05;
            laplaceA += gridA[idx + 1 + gridWidth] * 0.05;
            
            let laplaceB = gridB[idx] * -1.0;
            laplaceB += gridB[idx - 1] * 0.2;
            laplaceB += gridB[idx + 1] * 0.2;
            laplaceB += gridB[idx - gridWidth] * 0.2;
            laplaceB += gridB[idx + gridWidth] * 0.2;
            laplaceB += gridB[idx - 1 - gridWidth] * 0.05;
            laplaceB += gridB[idx + 1 - gridWidth] * 0.05;
            laplaceB += gridB[idx - 1 + gridWidth] * 0.05;
            laplaceB += gridB[idx + 1 + gridWidth] * 0.05;
            
            // Reaction term
            let abb = a * b * b;
            
            // Update equations with pre-calculated values
            let newA = a + (params.diffusionA * laplaceA) - abb + (params.feedRate * (1.0 - a));
            let newB = b + (params.diffusionB * laplaceB) + abb - (killPlusFeed * b);
            
            // Clamp values inline
            nextA[idx] = newA < 0 ? 0 : (newA > 1 ? 1 : newA);
            nextB[idx] = newB < 0 ? 0 : (newB > 1 ? 1 : newB);
        }
    }
    
    // Swap grids (pointer swap is very fast)
    let tempA = gridA;
    let tempB = gridB;
    gridA = nextA;
    gridB = nextB;
    nextA = tempA;
    nextB = tempB;
}

function renderChemicals() {
    loadPixels();
    
    let scaleX = width / gridWidth;
    let scaleY = height / gridHeight;
    
    let bgColor = color(params.backgroundColor);
    let chemColor = color(params.chemicalColor);
    
    // Pre-extract RGB components once
    let bgR = red(bgColor);
    let bgG = green(bgColor);
    let bgB = blue(bgColor);
    let chemR = red(chemColor);
    let chemG = green(chemColor);
    let chemB = blue(chemColor);
    
    let heatColdR, heatColdG, heatColdB, heatHotR, heatHotG, heatHotB;
    let acidR, acidG, acidB, cyanR, cyanG, cyanB, magmaR, magmaG, magmaB;
    
    switch(params.colorMode) {
        case 'Heat Map':
            let heatCold = color('#001a33');
            let heatHot = color('#ff3300');
            heatColdR = red(heatCold);
            heatColdG = green(heatCold);
            heatColdB = blue(heatCold);
            heatHotR = red(heatHot);
            heatHotG = green(heatHot);
            heatHotB = blue(heatHot);
            break;
        case 'Acid Green':
            let acidColor = color('#39ff14');
            acidR = red(acidColor);
            acidG = green(acidColor);
            acidB = blue(acidColor);
            break;
        case 'Electric Cyan':
            let cyanColor = color('#00ffff');
            cyanR = red(cyanColor);
            cyanG = green(cyanColor);
            cyanB = blue(cyanColor);
            break;
        case 'Magmatic Orange':
            let magmaColor = color('#ff6600');
            magmaR = red(magmaColor);
            magmaG = green(magmaColor);
            magmaB = blue(magmaColor);
            break;
    }
    
    // Pre-compute Bayer matrix if halftone is enabled
    let bayerThresholds = null;
    if (params.halftone) {
        bayerThresholds = new Float32Array(16);
        const bayerMatrix = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
        for (let i = 0; i < 16; i++) {
            let threshold = bayerMatrix[i] / 16.0;
            bayerThresholds[i] = threshold + (0.5 - threshold) * (1.0 - params.ditherStrength);
        }
    }
    
    // Pre-calculate scaled positions to avoid redundant floor operations
    let pixelWidth = width * 4;
    
    for (let y = 0; y < gridHeight; y++) {
        let py = floor(y * scaleY);
        let pyEnd = floor((y + 1) * scaleY);
        let rowOffset = y * gridWidth;
        
        for (let x = 0; x < gridWidth; x++) {
            let idx = x + rowOffset;
            let b = gridB[idx];
            
            // Apply dither first if enabled
            if (params.halftone) {
                let bayerIdx = (x & 3) + ((y & 3) << 2);
                b = b > bayerThresholds[bayerIdx] ? 1.0 : 0.0;
            }
            
            let r, g, b_color;
            
            // Direct RGB interpolation without creating color objects
            switch(params.colorMode) {
                case 'Neon Glow':
                    r = bgR + (chemR - bgR) * b;
                    g = bgG + (chemG - bgG) * b;
                    b_color = bgB + (chemB - bgB) * b;
                    if (b > 0.5) {
                        let glow = (b - 0.5) * 2 * 100 / 255; // Optimized map
                        r += (255 - r) * glow;
                        g += (255 - g) * glow;
                        b_color += (255 - b_color) * glow;
                    }
                    break;
                    
                case 'Heat Map':
                    r = heatColdR + (heatHotR - heatColdR) * b;
                    g = heatColdG + (heatHotG - heatColdG) * b;
                    b_color = heatColdB + (heatHotB - heatColdB) * b;
                    break;
                    
                case 'Acid Green':
                    r = bgR + (acidR - bgR) * b;
                    g = bgG + (acidG - bgG) * b;
                    b_color = bgB + (acidB - bgB) * b;
                    break;
                    
                case 'Electric Cyan':
                    r = bgR + (cyanR - bgR) * b;
                    g = bgG + (cyanG - bgG) * b;
                    b_color = bgB + (cyanB - bgB) * b;
                    break;
                    
                case 'Magmatic Orange':
                    r = bgR + (magmaR - bgR) * b;
                    g = bgG + (magmaG - bgG) * b;
                    b_color = bgB + (magmaB - bgB) * b;
                    break;
                    
                default:
                    r = bgR + (chemR - bgR) * b;
                    g = bgG + (chemG - bgG) * b;
                    b_color = bgB + (chemB - bgB) * b;
            }
            
            // Calculate pixel positions
            let px = floor(x * scaleX);
            let pxEnd = floor((x + 1) * scaleX);
            
            // Fill the scaled area with optimized indexing
            for (let dy = py; dy < pyEnd && dy < height; dy++) {
                let rowStart = dy * pixelWidth;
                for (let dx = px; dx < pxEnd && dx < width; dx++) {
                    let index = rowStart + (dx << 2); // Bit shift instead of multiply
                    pixels[index] = r;
                    pixels[index + 1] = g;
                    pixels[index + 2] = b_color;
                    pixels[index + 3] = 255;
                }
            }
        }
    }
    
    updatePixels();
}

function loadPreset(presetName) {
    const presets = {
        // Organic coral-like branching structures
        'Coral': { 
            f: 0.055, 
            k: 0.062,
            dA: 1.0,
            dB: 0.5,
            seedType: 'random'
        },
        // Maze-like patterns with sharp edges
        'Maze': { 
            f: 0.029, 
            k: 0.057,
            dA: 1.0,
            dB: 0.5,
            seedType: 'random'
        },
        // Large spots that divide and multiply
        'Mitosis': { 
            f: 0.0367, 
            k: 0.0649,
            dA: 1.0,
            dB: 0.5,
            seedType: 'spots'
        },
        // Worm-like moving structures
        'Worms': { 
            f: 0.078, 
            k: 0.061,
            dA: 1.0,
            dB: 0.5,
            seedType: 'random'
        },
        // Pulsating circular waves
        'Waves': { 
            f: 0.014, 
            k: 0.045,
            dA: 1.0,
            dB: 0.5,
            seedType: 'center'
        },
        // Spiraling organic growth
        'Spirals': { 
            f: 0.010, 
            k: 0.041,
            dA: 0.8,
            dB: 0.4,
            seedType: 'center'
        },
        // Unstable chaotic patterns
        'Chaos': {
            f: 0.026,
            k: 0.051,
            dA: 1.2,
            dB: 0.6,
            seedType: 'random'
        },
        // Dense fingerprint-like lines
        'Fingerprint': {
            f: 0.037,
            k: 0.060,
            dA: 1.0,
            dB: 0.5,
            seedType: 'random'
        },
        // Bubble-like cellular structures
        'Bubbles': {
            f: 0.098,
            k: 0.057,
            dA: 1.0,
            dB: 0.5,
            seedType: 'spots'
        }
    };
    
    if (presets[presetName]) {
        params.feedRate = presets[presetName].f;
        params.killRate = presets[presetName].k;
        params.diffusionA = presets[presetName].dA;
        params.diffusionB = presets[presetName].dB;
        
        // Update sliders
        if (sliders.feedRate) sliders.feedRate.value(params.feedRate);
        if (sliders.killRate) sliders.killRate.value(params.killRate);
        if (sliders.diffusionA) sliders.diffusionA.value(params.diffusionA);
        if (sliders.diffusionB) sliders.diffusionB.value(params.diffusionB);
        
        // Seed the grid with the appropriate pattern
        seedGrid(presets[presetName].seedType);
        
        // Activate speed boost for 120 frames (4 seconds at 30fps) at 5x speed
        originalSimSpeed = params.simSpeed;
        presetBoostFrames = 120;
    }
}

function seedGrid(seedType) {
    // Reset grid first
    initializeGrid();
    
    if (seedType === 'random') {
        // Scatter random points across the grid
        let numSeeds = floor(gridWidth * gridHeight * 0.02); // 2% of grid
        for (let i = 0; i < numSeeds; i++) {
            let x = floor(random(5, gridWidth - 5));
            let y = floor(random(5, gridHeight - 5));
            let radius = random(3, 8);
            
            for (let dx = -radius; dx < radius; dx++) {
                for (let dy = -radius; dy < radius; dy++) {
                    let dist = sqrt(dx * dx + dy * dy);
                    if (dist < radius) {
                        let nx = x + dx;
                        let ny = y + dy;
                        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                            let idx = nx + ny * gridWidth;
                            gridB[idx] = 1.0;
                        }
                    }
                }
            }
        }
    } else if (seedType === 'center') {
        // Large central circle
        let cx = floor(gridWidth / 2);
        let cy = floor(gridHeight / 2);
        let radius = min(gridWidth, gridHeight) * 0.15;
        
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                let dx = x - cx;
                let dy = y - cy;
                let dist = sqrt(dx * dx + dy * dy);
                
                if (dist < radius) {
                    let idx = x + y * gridWidth;
                    gridB[idx] = 1.0;
                }
            }
        }
    } else if (seedType === 'spots') {
        // Grid of spots
        let spacing = floor(min(gridWidth, gridHeight) / 8);
        let radius = spacing * 0.3;
        
        for (let sx = spacing; sx < gridWidth; sx += spacing) {
            for (let sy = spacing; sy < gridHeight; sy += spacing) {
                // Add some randomness to position
                let x = sx + floor(random(-spacing * 0.2, spacing * 0.2));
                let y = sy + floor(random(-spacing * 0.2, spacing * 0.2));
                
                for (let dx = -radius; dx < radius; dx++) {
                    for (let dy = -radius; dy < radius; dy++) {
                        let dist = sqrt(dx * dx + dy * dy);
                        if (dist < radius) {
                            let nx = x + dx;
                            let ny = y + dy;
                            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                                let idx = nx + ny * gridWidth;
                                gridB[idx] = 1.0;
                            }
                        }
                    }
                }
            }
        }
    }
}

function resetToDefaults() {
    // Reset all parameters to default values
    params.feedRate = defaultParams.feedRate;
    params.killRate = defaultParams.killRate;
    params.diffusionA = defaultParams.diffusionA;
    params.diffusionB = defaultParams.diffusionB;
    params.resolution = defaultParams.resolution;
    params.simSpeed = defaultParams.simSpeed;
    params.brushRadius = defaultParams.brushRadius;
    params.brushDensity = defaultParams.brushDensity;
    params.velocityEffect = defaultParams.velocityEffect;
    params.backgroundColor = defaultParams.backgroundColor;
    params.chemicalColor = defaultParams.chemicalColor;
    params.colorMode = defaultParams.colorMode;
    params.halftone = defaultParams.halftone;
    params.ditherStrength = defaultParams.ditherStrength;
    
    // Update all sliders
    if (sliders.feedRate) sliders.feedRate.value(params.feedRate);
    if (sliders.killRate) sliders.killRate.value(params.killRate);
    if (sliders.diffusionA) sliders.diffusionA.value(params.diffusionA);
    if (sliders.diffusionB) sliders.diffusionB.value(params.diffusionB);
    if (sliders.simSpeed) sliders.simSpeed.value(params.simSpeed);
    if (sliders.brushRadius) sliders.brushRadius.value(params.brushRadius);
    if (sliders.brushDensity) sliders.brushDensity.value(params.brushDensity);
    if (sliders.velocityEffect) sliders.velocityEffect.value(params.velocityEffect);
    if (sliders.ditherStrength) sliders.ditherStrength.value(params.ditherStrength);
    
    // Update color pickers
    if (sliders.bgColorPicker) sliders.bgColorPicker.value(params.backgroundColor);
    if (sliders.chemColorPicker) sliders.chemColorPicker.value(params.chemicalColor);
    
    // Update selects
    if (selects.resolution) selects.resolution.selected(params.resolution);
    if (selects.colorMode) selects.colorMode.selected(params.colorMode);
    
    // Update grid size if resolution changed
    updateGridSize();
    initializeGrid();
    
    // Update color mode
    updateColorMode();
}

function startGIFRecording() {
    maxGifFrames = gifSettings.duration * gifSettings.fps;
    isRecordingGIF = true;
    gifFrames = [];
    gifFrameCount = 0;
    
    console.log(`🎬 Started GIF recording: ${gifSettings.duration}s at ${gifSettings.fps} fps (${maxGifFrames} frames)`);
}

function stopGIFRecording() {
    if (!isRecordingGIF) return;
    
    isRecordingGIF = false;
    console.log('🎬 Stopped recording. Processing GIF...');
    
    // Reset button appearance
    if (buttons.gifBtn) {
        buttons.gifBtn.html(`🎬 Record GIF (${gifSettings.duration}s)`);
        buttons.gifBtn.style('background-color', 'rgba(0, 255, 159, 0.15)');
    }
    
    // Create GIF from captured frames
    createGIFFromFrames();
}

function createGIFFromFrames() {
    if (gifFrames.length === 0) {
        console.log('❌ No frames to save!');
        alert('No frames captured!');
        return;
    }
    
    console.log(`📦 Processing ${gifFrames.length} frames into GIF...`);
    
    // Load gifshot library if not already loaded
    if (typeof gifshot === 'undefined') {
        let script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/gifshot@0.4.5/dist/gifshot.min.js';
        script.onload = function() {
            processGIF();
        };
        script.onerror = function() {
            console.error('❌ Failed to load gifshot library');
            alert('Failed to load GIF library. Please check your internet connection.');
            gifFrames = [];
            gifFrameCount = 0;
        };
        document.head.appendChild(script);
    } else {
        processGIF();
    }
}

function processGIF() {
    // Convert p5.Image objects to base64 images
    let images = [];
    for (let i = 0; i < gifFrames.length; i++) {
        images.push(gifFrames[i].canvas.toDataURL());
    }
    
    console.log('⏳ Rendering GIF... This may take a moment...');
    
    // Create GIF using gifshot
    gifshot.createGIF({
        images: images,
        gifWidth: width,
        gifHeight: height,
        interval: 1 / gifSettings.fps,
        numFrames: gifFrames.length,
        frameDuration: 1,
        sampleInterval: 10,
        numWorkers: 2
    }, function(obj) {
        if (!obj.error) {
            console.log('✅ GIF created successfully!');
            
            // Download the GIF
            let link = document.createElement('a');
            link.download = 'chemical-reactor-' + Date.now() + '.gif';
            link.href = obj.image;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('💾 GIF downloaded!');
        } else {
            console.error('❌ Error creating GIF:', obj.error);
            alert('Error creating GIF: ' + obj.error);
        }
        
        // Clean up
        gifFrames = [];
        gifFrameCount = 0;
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    let oldGridSize = gridSize;
    updateGridSize();
    if (oldGridSize !== gridSize) {
        initializeGrid();
    }
    
    // Update GUI container max height and bounds
    if (guiContainer) {
        guiContainer.style('max-height', (height - 40) + 'px');
        // Update GUI bounds for click detection
        updateGUIBounds();
    }
}

function updateGUIBounds() {
    // Update the bounds based on actual GUI size
    // Account for scrollable content
    let maxHeight = min(height - 40, 850); // Approximate max content height
    guiBounds.height = maxHeight;
}

function keyPressed() {
    if (key === 'c' || key === 'C') {
        initializeGrid();
    }
    
    if (key === 's' || key === 'S') {
        // Hide GUI temporarily for clean screenshot
        let wasShowing = showGUI;
        showGUI = false;
        
        // Wait one frame to ensure GUI is hidden, then save
        setTimeout(() => {
            saveCanvas('chemical-reactor', 'png');
            // Restore GUI visibility
            showGUI = wasShowing;
        }, 50);
    }
    
    if (key === 'h' || key === 'H') {
        params.halftone = !params.halftone;
    }
    
    if (key === 'g' || key === 'G') {
        toggleGUI();
    }
    
    if (key === 'r' || key === 'R') {
        resetToDefaults();
    }
    
    // Presets (1-9)
    if (key === '1') loadPreset('Coral');
    if (key === '2') loadPreset('Maze');
    if (key === '3') loadPreset('Mitosis');
    if (key === '4') loadPreset('Worms');
    if (key === '5') loadPreset('Waves');
    if (key === '6') loadPreset('Spirals');
    if (key === '7') loadPreset('Chaos');
    if (key === '8') loadPreset('Fingerprint');
    if (key === '9') loadPreset('Bubbles');
}