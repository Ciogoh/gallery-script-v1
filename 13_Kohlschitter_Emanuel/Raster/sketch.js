
let font;
let appState = 0; // 0 = Start Screen, 1 = Main App

// --- VARIABLES FOR PART 1 (START SCREEN) ---
let startButton;
let t = 0;              
const GRID_SPACING = 20;    
const DISTORTION_FORCE = 40; 
const ANIMATION_SPEED = 0.005; 

// --- VARIABLES FOR PART 2 (RASTERIZER) ---
let img;
let cnv; 

// UI Globals
let formatSelect; 
let rasterTypeSelect;
let rasterTextInput; 
let densitySlider, sizeSlider, contrastSlider;
let inkColorPicker; 
let warholCb;
let sliceEnableCb, sliceDirSelect, sliceStartSlider, sliceCountSlider;
let infoBox;
let showOriginal = false; // Toggle for 'Y' key

// --- B&W TOGGLE VARIABLES ---
let isBWMode = false;
let prevInkColor = '#000000';

// Buttons
let saveButton;     // Save PNG
let saveSvgButton;  // Save SVG
let saveGifButton;  // Save GIF

// PULSING MODE COLORS
let pColor1, pColor2, pColor3;

// Layout Constants
const MAX_PREVIEW_SIZE = 400; 
const SIDEBAR_WIDTH = 240;
const GAP = 20;

let currentW = 250;
let currentH = 250;

function preload() {
  // Ensure you have this font or comment it out if running locally without assets
  font = loadFont('assets/PixelifySans-Bold.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize Pulsing Colors
  pColor1 = color(153, 255, 0);   // Lime Green
  pColor2 = color(255, 255, 0);   // Sun Yellow
  pColor3 = color(255, 140, 0);   // Dark Orange

  setupStartButton();
  
  textAlign(CENTER, CENTER);
  frameRate(60); 
}

function draw() {
  if (appState === 0) {
    // --- DRAW START SCREEN ---
    background(255); 
    drawWavyGrid();
    drawStartUI();
  } else {
    // --- DRAW MAIN APP ---
    
    // Check for 'Y' Key Toggle (Show Original)
    if (showOriginal) {
      if (!img) return;
      background(240);
      // Draw the original image fitted to the canvas
      let imgAspect = img.width / img.height;
      let boxAspect = width / height;
      let drawW, drawH;
      if (imgAspect > boxAspect) { drawW = width; drawH = width / imgAspect; } 
      else { drawH = height; drawW = height * imgAspect; }
      let startX = (width - drawW) / 2;
      let startY = (height - drawH) / 2;
      
      image(img, startX, startY, drawW, drawH);
      
      // Draw a label so user knows they are in preview mode
      fill(255, 0, 0); noStroke();
      rect(0, height-30, 120, 30);
      fill(255); textSize(12); textAlign(LEFT, CENTER);
      text(" ORIGINAL IMG", 10, height-15);
      
    } else {
      // Normal Render
      
      // --- IMPROVED UPLOAD INDICATOR ---
      if (!img) {
          updateCanvasSize(); // Ensure background is drawn
          return;
      }
      
      if (rasterTypeSelect.value() !== 'Pulsing Halftone') {
         // background(255); // Optional: clear if needed
      } 
      
      render(this, 1.0, width, height, null, null);
    }
  }
}

// ---------------------------------------------------------
// PART 1: START SCREEN FUNCTIONS
// ---------------------------------------------------------

function setupStartButton() {
  startButton = createButton('START');
  startButton.style('font-size', '20px');
  startButton.style('padding', '15px 40px');
  startButton.style('background-color', '#000000');
  startButton.style('color', '#FFFFFF');
  startButton.style('border', 'none');
  startButton.style('border-radius', '5px');
  startButton.style('cursor', 'pointer');
  startButton.style('font-family', 'sans-serif');
  startButton.position(width / 2 - 60, height / 2 + 80);
  startButton.mousePressed(launchMainApp);
}

function launchMainApp() {
  startButton.remove();
  appState = 1;
  background(240);
  setupMainAppInterface();
}

function drawWavyGrid() {
  stroke(0, 50); 
  noFill();
  strokeWeight(1);
  t += ANIMATION_SPEED; 
  for (let x = 0; x <= width; x += GRID_SPACING) {
    beginShape();
    for (let y = 0; y <= height; y += 10) {
      let xOffset = map(noise(x * 0.005, y * 0.005, t), 0, 1, -DISTORTION_FORCE, DISTORTION_FORCE);
      vertex(x + xOffset, y);
    }
    endShape();
  }
  for (let y = 0; y <= height; y += GRID_SPACING) {
    beginShape();
    for (let x = 0; x <= width; x += 10) {
      let yOffset = map(noise(x * 0.005, y * 0.005, t + 100), 0, 1, -DISTORTION_FORCE, DISTORTION_FORCE);
      vertex(x, y + yOffset);
    }
    endShape();
  }
}

function drawStartUI() {
  fill(0);
  textFont(font);
  textSize(80);
  text('THE BEST', width / 2, height / 2 - 80);
  textSize(40);
  text('Image Rasterizer', width / 2, height / 2 + 10);
  startButton.position(width / 2 - startButton.size().width / 2, height / 2 + 80);
}


// ---------------------------------------------------------
// PART 2: MAIN APP LOGIC & INTERFACE
// ---------------------------------------------------------

function setupMainAppInterface() {
  // 1. Setup Sidebar
  let sidebar = createDiv();
  sidebar.position(20, 20);
  sidebar.style('width', SIDEBAR_WIDTH + 'px');
  sidebar.style('max-height', (windowHeight - 40) + 'px');
  sidebar.style('overflow-y', 'auto');
  sidebar.style('background-color', '#f4f4f4');
  sidebar.style('padding', '20px'); 
  sidebar.style('font-family', 'sans-serif');
  sidebar.style('box-sizing', 'border-box');
  sidebar.style('box-shadow', '2px 2px 10px rgba(0,0,0,0.1)'); 

  cnv = createCanvas(currentW, currentH);
  cnv.position(20 + SIDEBAR_WIDTH + GAP, 20);
  pixelDensity(1); 
  noSmooth();
  
  // --- DRAG AND DROP HANDLER ---
  cnv.drop(handleFile);

  // --- HELPER FOR TITLES ---
  function createHeader(label, parent) {
    let h = createDiv(label);
    h.parent(parent);
    h.style('font-family', 'Helvetica, Arial, sans-serif');
    h.style('font-weight', '700'); 
    h.style('font-size', '14px');
    h.style('text-transform', 'uppercase'); 
    h.style('color', '#333');
    h.style('margin-bottom', '8px');
    h.style('border-bottom', '2px solid #ddd'); 
    h.style('padding-bottom', '3px');
    return h;
  }

  // --- UI CONSTRUCTION ---
  
  // A. Format
  createHeader('1. Canvas Format', sidebar);
  formatSelect = createSelect();
  formatSelect.parent(sidebar);
  formatSelect.option('1:1 (Square)');
  formatSelect.option('2:3 (Portrait)');
  formatSelect.option('3:2 (Landscape)');
  formatSelect.option('16:9 (Landscape)');
  formatSelect.option('9:16 (Portrait)');
  formatSelect.style('width', '100%');
  formatSelect.style('margin-bottom', '20px');
  formatSelect.changed(updateCanvasSize); 

  // B. File Input
  createHeader('2. Upload Image', sidebar);
  let fileInput = createFileInput(handleFile);
  fileInput.parent(sidebar);
  fileInput.style('width', '100%');
  fileInput.style('margin-bottom', '20px');

  // C. Raster Style
  createHeader('3. Raster Style', sidebar);
  rasterTypeSelect = createSelect();
  rasterTypeSelect.parent(sidebar);
  rasterTypeSelect.option('Dot Raster');        
  rasterTypeSelect.option('Grainy Film');       
  rasterTypeSelect.option('Pattern Raster');    
  rasterTypeSelect.option('Text Raster'); 
  rasterTypeSelect.option('Pulsing Halftone');
  rasterTypeSelect.option('Wavy Distortion');
  rasterTypeSelect.style('width', '100%');
  rasterTypeSelect.style('padding', '5px');
  rasterTypeSelect.changed(onTypeChanged); 

  // Text Input (Hidden by default)
  rasterTextInput = createInput('');
  rasterTextInput.parent(sidebar);
  rasterTextInput.attribute('placeholder', 'Type characters...');
  rasterTextInput.style('width', '90%');
  rasterTextInput.style('margin-top', '5px');
  rasterTextInput.style('display', 'none'); 
  rasterTextInput.input(requestRedraw);
  createDiv('').parent(sidebar).style('height','20px');

  // D. Sliders
  densitySlider = makeControl('Density / Frequency', 2, 60, 10, 1, sidebar);
  sizeSlider = makeControl('Size / Phase', 0.1, 10.0, 1.2, 0.1, sidebar);
  contrastSlider = makeControl('Contrast / Strength', 0.1, 5.0, 1.5, 0.1, sidebar);
  createDiv('').parent(sidebar).style('height','20px');

  // E. Color Select
  createHeader('Ink Color', sidebar);
  inkColorPicker = createColorPicker('#000000'); 
  inkColorPicker.parent(sidebar);
  inkColorPicker.style('width', '100%');
  inkColorPicker.style('height', '35px');
  inkColorPicker.style('border', 'none');
  inkColorPicker.style('cursor', 'pointer');
  // --- CHANGE: If user manually changes color, reset the B&W toggle state
  inkColorPicker.input(() => {
    isBWMode = false; 
    requestRedraw();
  });
  createDiv('').parent(sidebar).style('height','20px');

  // F. Special Modes
  createHeader('4. Special Modes', sidebar);
  let specialBox = createDiv().parent(sidebar);
  
  warholCb = createCheckbox(' Andy Warhol Mode', false);
  warholCb.parent(specialBox);
  warholCb.style('font-size', '13px');
  
  // G. Slice & Repeat
  createDiv('').parent(sidebar).style('height','20px');
  createHeader('5. Slice & Repeat', sidebar);
  let sliceBox = createDiv().parent(sidebar);

  sliceEnableCb = createCheckbox(' Enable Slice', false);
  sliceEnableCb.parent(sliceBox);
  sliceEnableCb.changed(requestRedraw);

  sliceDirSelect = createSelect();
  sliceDirSelect.parent(sliceBox);
  sliceDirSelect.option('Vertical (Repeat rows)');
  sliceDirSelect.option('Horizontal (Repeat cols)');
  sliceDirSelect.style('width', '100%');
  sliceDirSelect.style('margin', '10px 0');
  sliceDirSelect.changed(requestRedraw);

  sliceCountSlider = makeControl('Number of Slices', 1, 10, 2, 1, sliceBox);
  sliceStartSlider = makeControl('Slice Offset', 0.0, 0.99, 0.0, 0.01, sliceBox);
  createDiv('').parent(sidebar).style('height','25px');

  // H. Save Buttons
  
  // PNG BUTTON
  saveButton = createButton('<b>Save PNG</b>');
  saveButton.parent(sidebar);
  saveButton.style('width', '100%');
  saveButton.style('padding', '12px');
  saveButton.style('background', '#2196F3');
  saveButton.style('color', 'white');
  saveButton.style('border', 'none');
  saveButton.style('border-radius', '4px');
  saveButton.style('cursor', 'pointer');
  saveButton.mousePressed(saveHighRes);

  // SVG BUTTON
  saveSvgButton = createButton('<b>Save SVG (Vector)</b>');
  saveSvgButton.parent(sidebar);
  saveSvgButton.style('width', '100%');
  saveSvgButton.style('padding', '12px');
  saveSvgButton.style('margin-top', '10px');
  saveSvgButton.style('background', '#9C27B0'); // Purple
  saveSvgButton.style('color', 'white');
  saveSvgButton.style('border', 'none');
  saveSvgButton.style('border-radius', '4px');
  saveSvgButton.style('cursor', 'pointer');
  saveSvgButton.mousePressed(saveSVG);

  saveGifButton = createButton('<b>Record GIF (5 sec)</b>');
  saveGifButton.parent(sidebar);
  saveGifButton.style('width', '100%');
  saveGifButton.style('padding', '12px');
  saveGifButton.style('background', '#FF5722');
  saveGifButton.style('color', 'white');
  saveGifButton.style('border', 'none');
  saveGifButton.style('border-radius', '4px');
  saveGifButton.style('cursor', 'pointer');
  saveGifButton.style('display', 'none'); 
  saveGifButton.mousePressed(saveAnimatedGif);

  // --- INFO BOX ---
  infoBox = createDiv(`
    <span style="margin-right: 15px;"><b>S</b> Quicksave</span> 
    <span style="margin-right: 15px;"><b>Y</b> Preview</span> 
    <span><b>U</b> B&W Toggle</span>
  `);
  infoBox.style('font-family', 'sans-serif');
  infoBox.style('font-size', '12px');
  infoBox.style('color', '#666');
  infoBox.style('background', '#eee');
  infoBox.style('padding', '5px 10px');
  infoBox.style('border-radius', '4px');
  
  // We set the position properly in updateCanvasSize
  updateCanvasSize();
  
  noLoop();
}

function updateCanvasSize() {
  let mode = formatSelect.value();
  let maxDim = MAX_PREVIEW_SIZE; 

  if (mode === '1:1 (Square)') {
    currentW = maxDim; currentH = maxDim;
  } 
  else if (mode === '2:3 (Portrait)') {
    currentH = maxDim; currentW = Math.floor(maxDim * (2/3)); 
  } 
  else if (mode === '3:2 (Landscape)') {
    currentW = maxDim; currentH = Math.floor(maxDim * (2/3)); 
  }
  else if (mode === '16:9 (Landscape)') {
    currentW = maxDim; currentH = Math.floor(maxDim * (9/16)); 
  }
  else if (mode === '9:16 (Portrait)') {
    currentH = maxDim; currentW = Math.floor(maxDim * (9/16));
  }
  
  resizeCanvas(currentW, currentH);
  background(240);
  
  // --- NEW: Update Info Box Position ---
  if(infoBox) {
    infoBox.position(20 + SIDEBAR_WIDTH + GAP, 20 + currentH + 10);
  }

  // --- CHANGED: BETTER READABILITY WHEN NO IMAGE IS UPLOADED ---
  if (!img) {
    // Dashed border logic
    stroke(150);
    strokeWeight(2);
    // Native p5 setLineDash isn't always available in old versions, but drawingContext is standard HTML5 canvas
    drawingContext.setLineDash([10, 10]); 
    noFill();
    rect(10, 10, width - 20, height - 20, 10);
    drawingContext.setLineDash([]); // Reset dash

    fill(50);
    noStroke();
    
    // Use the Pixel font if loaded, otherwise generic
    if (font) textFont(font);
    else textFont('sans-serif');
    
    textSize(40);
    textAlign(CENTER, CENTER);
    text("DROP IMAGE", width/2, height/2);
    
    textSize(14);
    textFont('sans-serif');
    fill(100);
    text("(Or use sidebar)", width/2, height/2 + 35);
  } else {
    if (rasterTypeSelect.value() === 'Pulsing Halftone') {
        loop();
    } else {
        redraw();
    }
  }
}

function makeControl(label, min, max, val, step, parent) {
  createSpan(label).parent(parent).style('font-size','12px');
  let box = createDiv().parent(parent).style('display', 'flex').style('align-items', 'center').style('margin-top', '2px');
  let btnMinus = createButton('-').parent(box).style('width', '25px').style('cursor', 'pointer');
  let sld = createSlider(min, max, val, step).parent(box).style('flex-grow', '1').style('margin', '0 5px');
  let btnPlus = createButton('+').parent(box).style('width', '25px').style('cursor', 'pointer');
  btnMinus.mousePressed(() => { sld.value(sld.value() - step); requestRedraw(); });
  btnPlus.mousePressed(() => { sld.value(sld.value() + step); requestRedraw(); });
  sld.input(requestRedraw);
  return sld;
}

function onTypeChanged() {
  let type = rasterTypeSelect.value();
  
  // 1. Manage Text Input Visibility
  if (type === 'Text Raster') {
    rasterTextInput.style('display', 'block');
  } else {
    rasterTextInput.style('display', 'none');
  }

  // 2. Manage Animation & GIF Button
  if (type === 'Pulsing Halftone') {
    saveButton.style('display', 'none');   
    saveSvgButton.style('display', 'none'); // SVG not available for animation
    saveGifButton.style('display', 'block'); 
    loop(); 
  } else {
    saveButton.style('display', 'block');  
    saveSvgButton.style('display', 'block'); // Available for static
    saveGifButton.style('display', 'none');   
    noLoop(); 
  }
  
  // 3. Defaults for different modes
  if (type === 'Dot Raster') {
    contrastSlider.value(5.0); 
    densitySlider.value(6);
  } else if (type === 'Grainy Film') {
    contrastSlider.value(1.5); 
    densitySlider.value(6);
  } else if (type === 'Pattern Raster') {
    contrastSlider.value(1.0);
    densitySlider.value(15); 
  } else if (type === 'Text Raster') {
    densitySlider.value(12);
    contrastSlider.value(1.0);
  } else if (type === 'Pulsing Halftone') {
    densitySlider.value(8);
    contrastSlider.value(1.0);
  } else if (type === 'Wavy Distortion') {
    densitySlider.value(10); 
    contrastSlider.value(1.0); 
    sizeSlider.value(1.0);      
  }

  if (type !== 'Pulsing Halftone') redraw();
}

function requestRedraw() { 
  if (rasterTypeSelect.value() !== 'Pulsing Halftone') {
      redraw(); 
  }
}

function getRGB(name) {
  if (name === 'Black') return {r:0, g:0, b:0};
  if (name === 'White') return {r:255, g:255, b:255};
  if (name === 'Red') return {r:255, g:0, b:0};
  if (name === 'Blue') return {r:0, g:0, b:255};
  if (name === 'Cyan') return {r:0, g:255, b:255};
  if (name === 'Magenta') return {r:255, g:0, b:255};
  if (name === 'Yellow') return {r:255, g:255, b:0};
  if (name === 'Green') return {r:0, g:255, b:0};
  if (name === 'Purple') return {r:128, g:0, b:128};
  if (name === 'Orange') return {r:255, g:165, b:0};
  return {r:0, g:0, b:0};
}

// Helper to get RGB object from Color Picker
function getInkColor() {
  let c = inkColorPicker.color();
  return {r: red(c), g: green(c), b: blue(c)};
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * MAIN RENDER FUNCTION
 */
function render(target, scaleFactor, boxW, boxH, overrideInk, overrideBg) {
  let type = rasterTypeSelect.value();
  
  let density = densitySlider.value();
  let sizeMult = sizeSlider.value();
  let contrast = contrastSlider.value();
  
  // Determine Ink Color
  let rInk, gInk, bInk;
  if (overrideInk) {
    rInk = overrideInk.r; gInk = overrideInk.g; bInk = overrideInk.b;
  } else {
    let c = getInkColor();
    rInk = c.r; gInk = c.g; bInk = c.b;
  }
  
  // Determine BG Color
  let bgCol; 
  if (overrideBg) {
    bgCol = color(overrideBg.r, overrideBg.g, overrideBg.b);
  } else {
    if (type === 'Grainy Film' || type === 'Pulsing Halftone') {
        bgCol = color(20);
    } else {
        bgCol = color(255); 
    }
  }

  // Slicing Logic
  let sliceEnabled = sliceEnableCb.checked();
  if (type === 'Pulsing Halftone') sliceEnabled = false; 

  let sliceVertical = sliceDirSelect.value().startsWith('Vertical');
  let sliceCount = sliceCountSlider.value();
  let sliceSizePct = 1.0 / sliceCount; 
  let sliceStartPct = sliceStartSlider.value();

  let imgAspect = img.width / img.height;
  let boxAspect = boxW / boxH;
  let drawW, drawH;
  if (imgAspect > boxAspect) { drawW = boxW; drawH = boxW / imgAspect; } 
  else { drawH = boxH; drawW = boxH * imgAspect; }
  let startX = (boxW - drawW) / 2;
  let startY = (boxH - drawH) / 2;

  let sliceW = img.width * sliceSizePct;
  let sliceH = img.height * sliceSizePct;
  let sliceXStart = img.width * sliceStartPct;
  let sliceYStart = img.height * sliceStartPct;

  img.loadPixels();
  
  target.background(bgCol); 
  target.noStroke();

  // 1. --- DOT RASTER ---
  if (type === 'Dot Raster') {
    let effectiveGrid = density * scaleFactor;
    let dotAlpha = map(contrast, 0.1, 5.0, 25, 255);
    target.fill(rInk, gInk, bInk, dotAlpha);
    
    let minDotSize = effectiveGrid * 0.05;

    for (let y = 0; y < drawH; y += effectiveGrid) {
      for (let x = 0; x < drawW; x += effectiveGrid) {
        
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        if (sliceEnabled) {
          if (sliceVertical) sy = sliceYStart + (sy % sliceH);
          else sx = sliceXStart + (sx % sliceW);
        }
        let ix = floor(constrain(sx, 0, img.width-1));
        let iy = floor(constrain(sy, 0, img.height-1));
        let idx = (ix + iy * img.width) * 4;
        let r = img.pixels[idx];
        let g = img.pixels[idx+1];
        let b = img.pixels[idx+2];
        let bright = (r*0.299 + g*0.587 + b*0.114);
        let diameter = map(bright, 255, 0, minDotSize, effectiveGrid) * sizeMult;
        if (diameter > 0.5 * scaleFactor) {
          target.circle(startX + x + effectiveGrid/2, startY + y + effectiveGrid/2, diameter);
        }
      }
    }

  // 2. --- PATTERN RASTER ---
  } else if (type === 'Pattern Raster') {
    let effectiveGrid = density * scaleFactor;
    for (let y = 0; y < drawH; y += effectiveGrid) {
      for (let x = 0; x < drawW; x += effectiveGrid) {
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        if (sliceEnabled) {
          if (sliceVertical) sy = sliceYStart + (sy % sliceH);
          else sx = sliceXStart + (sx % sliceW);
        }
        let sampleW = effectiveGrid * (img.width / drawW);
        let ix = floor(constrain(sx, 0, img.width - 1));
        let iy = floor(constrain(sy, 0, img.height - 1));
        let avgGray = getAverageGrayFromImage(ix, iy, sampleW);
        avgGray = constrain(avgGray * contrast, 0, 255);
        drawPatternTexture(target, startX + x, startY + y, effectiveGrid, avgGray, rInk, gInk, bInk);
      }
    }

  // 3. --- GRAINY FILM ---
  } else if (type === 'Grainy Film') {
    target.fill(rInk, gInk, bInk); 
    target.loadPixels(); 
    let grainAmount = map(density, 2, 15, 10, 100); 
    let grainBuffer = 15;
    let rBg = red(bgCol); let gBg = green(bgCol); let bBg = blue(bgCol);

    for (let y = 0; y < drawH; y++) {
      for (let x = 0; x < drawW; x++) {
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        if (sliceEnabled) {
          if (sliceVertical) sy = sliceYStart + (sy % sliceH);
          else sx = sliceXStart + (sx % sliceW);
        }
        let ix = floor(constrain(sx, 0, img.width-1));
        let iy = floor(constrain(sy, 0, img.height-1));
        let srcIdx = (ix + iy * img.width) * 4;
        let r = img.pixels[srcIdx];
        let g = img.pixels[srcIdx+1];
        let b = img.pixels[srcIdx+2];
        let bright = (r*0.299 + g*0.587 + b*0.114);
        let val = bright / 255.0;
        val = (val - 0.5) * contrast + 0.5;
        val = val * 255.0;
        val = val + random(-grainAmount, grainAmount);
        val = constrain(val, grainBuffer, 255-grainBuffer);
        let ratio = 1.0 - (val / 255.0); 
        let bgRatio = 1.0 - ratio;        
        let finalR = rInk * ratio + rBg * bgRatio;
        let finalG = gInk * ratio + gBg * bgRatio;
        let finalB = bInk * ratio + bBg * bgRatio;
        let destIdx = ((startX + x | 0) + (startY + y | 0) * target.width) * 4;
        target.pixels[destIdx]    = finalR;
        target.pixels[destIdx+1] = finalG;
        target.pixels[destIdx+2] = finalB;
        target.pixels[destIdx+3] = 255; 
      }
    }
    target.updatePixels();
    
  // 4. --- TEXT RASTER ---
  } else if (type === 'Text Raster') {
    let effectiveGrid = density * scaleFactor;
    target.fill(rInk, gInk, bInk);
    target.textFont(font); 
    target.textAlign(CENTER, CENTER);
    let txt = rasterTextInput.value();
    if (txt.length === 0) txt = "TYPE";
    let charIndex = 0;

    for (let y = 0; y < drawH; y += effectiveGrid) {
      for (let x = 0; x < drawW; x += effectiveGrid) {
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        if (sliceEnabled) {
          if (sliceVertical) sy = sliceYStart + (sy % sliceH);
          else sx = sliceXStart + (sx % sliceW);
        }
        let sampleW = effectiveGrid * (img.width / drawW);
        let ix = floor(constrain(sx, 0, img.width - 1));
        let iy = floor(constrain(sy, 0, img.height - 1));
        let bright = getAverageGrayFromImage(ix, iy, sampleW);
        let dynamicMax = effectiveGrid * 1.5 * sizeMult; 
        let dynamicMin = 1 * sizeMult;
        let tSize = map(bright, 0, 255, dynamicMin, dynamicMax);
        tSize = tSize * contrast; 
        target.textSize(tSize);
        let char = txt.charAt(charIndex % txt.length);
        target.text(char, startX + x + effectiveGrid/2, startY + y + effectiveGrid/2);
        charIndex++;
      }
    }

  // 5. --- PULSING HALFTONE ---
  } else if (type === 'Pulsing Halftone') {
      let effectiveGrid = density * scaleFactor;
      let colW = drawW / 3;
      let blendZone = effectiveGrid * 10;
      let pulseWave = sin(frameCount * 0.1); 
      let pulseFactor = map(pulseWave, -1, 1, 2, 6); 

      for (let y = 0; y < drawH; y += effectiveGrid) {
       for (let x = 0; x < drawW; x += effectiveGrid) {
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        let ix = floor(constrain(sx, 0, img.width-1));
        let iy = floor(constrain(sy, 0, img.height-1));
        let idx = (ix + iy * img.width) * 4;
        let r = img.pixels[idx];
        let g = img.pixels[idx+1];
        let b = img.pixels[idx+2];
        let bright = (r*0.299 + g*0.587 + b*0.114);
        
        let dotColor;
        if (x < colW - blendZone) {
            dotColor = pColor1;
        } else if (x >= colW - blendZone && x < colW + blendZone) {
            let lerpFactor = map(x, colW - blendZone, colW + blendZone, 0, 1, true);
            dotColor = lerpColor(pColor1, pColor2, lerpFactor);
        } else if (x < colW * 2 - blendZone) {
            dotColor = pColor2;
        } else if (x >= colW * 2 - blendZone && x < colW * 2 + blendZone) {
            let lerpFactor = map(x, colW * 2 - blendZone, colW * 2 + blendZone, 0, 1, true);
            dotColor = lerpColor(pColor2, pColor3, lerpFactor);
        } else {
            dotColor = pColor3;
        }

        let baseDiameter = map(bright, 0, 255, 0, effectiveGrid * 0.7);
        let diameter = baseDiameter * pulseFactor * sizeMult * 0.5; 

        target.fill(dotColor);
        target.circle(startX + x + effectiveGrid/2, startY + y + effectiveGrid/2, diameter);
       }
      }
      
  // 6. --- WAVY DISTORTION ---
  } else if (type === 'Wavy Distortion') {
    drawWavyDistortion(target, drawW, drawH, startX, startY, density, contrast, sizeMult, sliceEnabled, sliceVertical, sliceYStart, sliceH, sliceXStart, sliceW);
  }
}

function drawWavyDistortion(target, drawW, drawH, startX, startY, density, contrast, sizeMult, sliceEnabled, sliceVertical, sliceYStart, sliceH, sliceXStart, sliceW) {
  target.loadPixels();
  let noiseScale = map(density, 2, 60, 0.002, 0.05);
  let distortionMax = map(contrast, 0.1, 5.0, 0, 100);
  let phase = sizeMult * 10; 

  for (let y = 0; y < drawH; y++) {
    for (let x = 0; x < drawW; x++) {
      let nX = noise(x * noiseScale + phase, y * noiseScale);
      let xOffset = map(nX, 0, 1, -distortionMax, distortionMax);
      let nY = noise(x * noiseScale, y * noiseScale + phase + 100);
      let yOffset = map(nY, 0, 1, -distortionMax, distortionMax);

      let sx_draw = x - xOffset;
      let sy_draw = y - yOffset;
      
      let sx = map(sx_draw, 0, drawW, 0, img.width);
      let sy = map(sy_draw, 0, drawH, 0, img.height);
      
      if (sliceEnabled) {
        if (sliceVertical) sy = sliceYStart + (sy % sliceH);
        else sx = sliceXStart + (sx % sliceW);
      }
      
      let ix = floor(constrain(sx, 0, img.width - 1));
      let iy = floor(constrain(sy, 0, img.height - 1));
      let srcIdx = (ix + iy * img.width) * 4;
      let destIdx = ((startX + x | 0) + (startY + y | 0) * target.width) * 4;
      
      target.pixels[destIdx]    = img.pixels[srcIdx];
      target.pixels[destIdx+1] = img.pixels[srcIdx+1];
      target.pixels[destIdx+2] = img.pixels[srcIdx+2];
      target.pixels[destIdx+3] = 255; 
    }
  }
  target.updatePixels();
}


function drawPatternTexture(target, x, y, size, grayValue, r, g, b) {
    target.push(); 
    target.translate(x, y); 
    target.fill(r, g, b); 
    target.stroke(r, g, b);
    const step = 255 / 6;
    const level = floor(grayValue / step);
    const lineW = size / 10; 
    switch (level) {
        case 0: target.noStroke(); target.rect(0, 0, size, size); break;
        case 1: target.strokeWeight(lineW / 2); for (let i = 0; i < 8; i++) { target.line(i * size/8, 0, 0, i * size/8); target.line(i * size/8, size, size, i * size/8); } break;
        case 2: target.strokeWeight(lineW / 2); for (let i = -1; i < 8; i++) { target.line(i * size/6, 0, 0, i * size/6); } break;
        case 3: target.strokeWeight(lineW / 2); for (let i = -1; i < 6; i++) { target.line(i * size/4, 0, 0, i * size/4); } break;
        case 4: target.noStroke(); const smallRectSize = size / 4; target.rect(0, 0, smallRectSize, smallRectSize); target.rect(smallRectSize * 3, 0, smallRectSize, smallRectSize); target.rect(0, smallRectSize * 3, smallRectSize, smallRectSize); target.rect(smallRectSize * 3, smallRectSize * 3, smallRectSize, smallRectSize); break;
        case 5: target.noStroke(); target.rect(size/2 - lineW/2, size/2 - lineW/2, lineW, lineW); break;
    }
    target.pop(); 
}

function getAverageGrayFromImage(ix, iy, sampleSize) {
  let avg = 0; let count = 0;
  let step = (sampleSize > 5) ? 2 : 1;
  let half = floor(sampleSize / 2);
  let startX = max(0, ix - half);
  let endX = min(img.width, ix + half);
  let startY = max(0, iy - half);
  let endY = min(img.height, iy + half);
  if (sampleSize < 1.5) {
     let idx = (ix + iy * img.width) * 4;
     return (img.pixels[idx]*0.299 + img.pixels[idx+1]*0.587 + img.pixels[idx+2]*0.114);
  }
  for (let y = startY; y < endY; y += step) {
    for (let x = startX; x < endX; x += step) {
      let idx = (x + y * img.width) * 4;
      avg += (img.pixels[idx]*0.299 + img.pixels[idx+1]*0.587 + img.pixels[idx+2]*0.114);
      count++;
    }
  }
  if (count > 0) return avg / count;
  return 255; 
}

// -----------------------------------------------------------
// SAVE FUNCTIONS
// -----------------------------------------------------------

function saveHighRes() {
  if (!img) return;
  
  let exportScale = 2400 / currentW; 
  let singleW = currentW * exportScale; 
  let singleH = currentH * exportScale;
  
  if (warholCb.checked()) {
    let gridW = singleW * 2; let gridH = singleH * 2;
    let finalPG = createGraphics(gridW, gridH);
    finalPG.pixelDensity(1); finalPG.noSmooth(); finalPG.background(255);
    let palettes = [ { ink: getRGB('Magenta'), bg: getRGB('Yellow') }, { ink: getRGB('Cyan'), bg: getRGB('Red') }, { ink: getRGB('Green'), bg: getRGB('Purple') }, { ink: getRGB('Yellow'), bg: getRGB('Blue') } ];
    palettes = shuffle(palettes);
    let pg1 = createGraphics(singleW, singleH); pg1.pixelDensity(1); pg1.noSmooth();
    render(pg1, exportScale, singleW, singleH, palettes[0].ink, palettes[0].bg); finalPG.image(pg1, 0, 0);
    let pg2 = createGraphics(singleW, singleH); pg2.pixelDensity(1); pg2.noSmooth();
    render(pg2, exportScale, singleW, singleH, palettes[1].ink, palettes[1].bg); finalPG.image(pg2, singleW, 0);
    let pg3 = createGraphics(singleW, singleH); pg3.pixelDensity(1); pg3.noSmooth();
    render(pg3, exportScale, singleW, singleH, palettes[2].ink, palettes[2].bg); finalPG.image(pg3, 0, singleH);
    let pg4 = createGraphics(singleW, singleH); pg4.pixelDensity(1); pg4.noSmooth();
    render(pg4, exportScale, singleW, singleH, palettes[3].ink, palettes[3].bg); finalPG.image(pg4, singleW, singleH);
    save(finalPG, 'warhol-grid.png');
  } else {
    let pg = createGraphics(singleW, singleH);
    pg.pixelDensity(1); pg.noSmooth();
    render(pg, exportScale, singleW, singleH, null, null);
    save(pg, 'raster-image.png');
  }
}

// --- SVG EXPORTER (FIXED) ---
function saveSVG() {
  if (!img) return;

  // Use the same scale math as SaveHighRes for consistency
  let exportScale = 2400 / currentW; 
  let drawW = currentW * exportScale;
  let drawH = currentH * exportScale;
  
  let density = densitySlider.value();
  let sizeMult = sizeSlider.value();
  let contrast = contrastSlider.value();
  let ink = getInkColor();
  let hexColor = rgbToHex(ink.r, ink.g, ink.b);
  
  let type = rasterTypeSelect.value();
  
  let svgContent = [];
  svgContent.push(`<?xml version="1.0" encoding="utf-8"?>`);
  svgContent.push(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${drawW}px" height="${drawH}px" viewBox="0 0 ${drawW} ${drawH}">`);
  
  // Background
  svgContent.push(`<rect x="0" y="0" width="${drawW}" height="${drawH}" fill="white" />`);

  // Slicing vars
  let sliceEnabled = sliceEnableCb.checked();
  let sliceVertical = sliceDirSelect.value().startsWith('Vertical');
  let sliceCount = sliceCountSlider.value();
  let sliceSizePct = 1.0 / sliceCount; 
  let sliceStartPct = sliceStartSlider.value();
  let sliceW = img.width * sliceSizePct;
  let sliceH = img.height * sliceSizePct;
  let sliceXStart = img.width * sliceStartPct;
  let sliceYStart = img.height * sliceStartPct;
  
  let effectiveGrid = density * exportScale;
  let minDotSize = effectiveGrid * 0.05;

  // Render Loop for SVG
  for (let y = 0; y < drawH; y += effectiveGrid) {
      for (let x = 0; x < drawW; x += effectiveGrid) {
        
        let sx = map(x, 0, drawW, 0, img.width);
        let sy = map(y, 0, drawH, 0, img.height);
        
        if (sliceEnabled) {
          if (sliceVertical) sy = sliceYStart + (sy % sliceH);
          else sx = sliceXStart + (sx % sliceW);
        }
        
        let ix = floor(constrain(sx, 0, img.width-1));
        let iy = floor(constrain(sy, 0, img.height-1));
        let idx = (ix + iy * img.width) * 4;
        let r = img.pixels[idx];
        let g = img.pixels[idx+1];
        let b = img.pixels[idx+2];
        let bright = (r*0.299 + g*0.587 + b*0.114);
        
        if (type === 'Text Raster') {
            // Text Export
            let dynamicMax = effectiveGrid * 1.5 * sizeMult; 
            let dynamicMin = 1 * sizeMult;
            let tSize = map(bright, 0, 255, dynamicMin, dynamicMax);
            tSize = tSize * contrast; 
            
            let txt = rasterTextInput.value() || "TYPE";
            let charIndex = floor((x+y)/effectiveGrid);
            let char = txt.charAt(charIndex % txt.length);
            
            // Escape special chars just in case
            if(char === '<') char = '&lt;'; if(char === '>') char = '&gt;'; if(char === '&') char = '&amp;';
            
            svgContent.push(`<text x="${x + effectiveGrid/2}" y="${y + effectiveGrid/2}" fill="${hexColor}" font-family="sans-serif" font-size="${tSize}" text-anchor="middle" dominant-baseline="middle">${char}</text>`);

        } else {
            // Default to Dots
            let diameter = map(bright, 255, 0, minDotSize, effectiveGrid) * sizeMult;
            
            let cx = x + effectiveGrid/2;
            let cy = y + effectiveGrid/2;

            if (type === 'Wavy Distortion') {
               // Re-calculate noise logic for SVG
               let noiseScale = map(density, 2, 60, 0.002, 0.05);
               let distortionMax = map(contrast, 0.1, 5.0, 0, 100); 
               distortionMax = distortionMax * (exportScale); 
               
               let nX = noise((x/exportScale) * noiseScale + sizeMult*10, (y/exportScale) * noiseScale);
               let xOffset = map(nX, 0, 1, -distortionMax, distortionMax);
               let nY = noise((x/exportScale) * noiseScale, (y/exportScale) * noiseScale + sizeMult*10 + 100);
               let yOffset = map(nY, 0, 1, -distortionMax, distortionMax);
               
               cx += xOffset;
               cy += yOffset;
            }

            if (diameter > 0.5 * exportScale) {
                svgContent.push(`<circle cx="${cx}" cy="${cy}" r="${diameter/2}" fill="${hexColor}" />`);
            }
        }
      }
  }

  svgContent.push(`</svg>`);
  
  // FIX: Force download as .svg by using Blob
  let svgString = svgContent.join('\n');
  let blob = new Blob([svgString], {type: "image/svg+xml"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "vector-export.svg";
  link.click();
}

function saveAnimatedGif() {
  console.log("Recording 5 seconds of GIF...");
  saveGif('pulsing_raster', 5); 
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => { 
      updateCanvasSize(); 
      // Force loop if in pulsing mode
      if (rasterTypeSelect.value() === 'Pulsing Halftone') loop();
      else redraw(); 
    });
  }
}

function keyPressed() {
  if (appState !== 1) return;

  // S for QUICKSAVE
  if (key === 's' || key === 'S') {
    saveCanvas(cnv, 'quicksave', 'png');
  }

  // Y for BEFORE/AFTER (Toggle)
  if (key === 'y' || key === 'Y') {
    showOriginal = !showOriginal;
    if (rasterTypeSelect.value() !== 'Pulsing Halftone') {
      redraw();
    }
  }

  // U for B&W TOGGLE (UPDATED)
  if (key === 'u' || key === 'U') {
    isBWMode = !isBWMode; 
    if (isBWMode) {
      prevInkColor = inkColorPicker.value();
      inkColorPicker.value('#000000');
    } else {
      inkColorPicker.value(prevInkColor);
    }
    requestRedraw();
  }
}