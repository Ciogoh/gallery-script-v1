/* ----------------------------------------------------
  PRO GRAPHIC TEXT LAB (v14.0 - Vector Scan Edition)
  ----------------------------------------------------
*/

// --- BUFFERS & STATE ---
let cleanLayer, effectLayer, glassBuffer;
let isDraggingText = false;
let isExporting = false; 

// MULTI-TEXT MANAGEMENT
let textObjects = [];
let activeIndex = 0; 

// GLASS STATE
let isGlassLocked = false;
let glassPos = { x: 0, y: 0 };

// UI GROUPS
let uiGroups = { melt: null, motion: null, glass: null };
let domElements = {}; 

// SETTINGS
let settings = {
  canvasW: 800,
  canvasH: 600,
  bgColor: '#111111',
  mode: 'Melt', 
  
  // OPTIMIZED MELT SETTINGS
  meltAmount: 100,   
  meltFreq: 0.005,  
  meltSeed: 0, 
  
  // MOTION
  motionAngle: 45,
  motionTotalDist: 200, 
  motionStepDist: 5,     
  leadOpacity: 255,
  
  // GLASS
  glassBlur: 8,
  glassWidth: 300,
  glassHeight: 400,
  glassStroke: true,
  glassFull: false,
  glassTextColor: '#ff0055' 
};

function setup() {
  let cnv = createCanvas(settings.canvasW, settings.canvasH);
  cnv.position(270, 20); 
  
  // High res display for screen
  pixelDensity(2); 
  select('body').style('background-color', '#222');
  
  // --- IMPORTANT: Set Graphics Buffers to Density 1 ---
  // This ensures the Raster-to-SVG scan is mathematically accurate
  cleanLayer = createGraphics(settings.canvasW, settings.canvasH);
  cleanLayer.pixelDensity(1);
  
  effectLayer = createGraphics(settings.canvasW, settings.canvasH);
  effectLayer.pixelDensity(1);
  
  // Glass buffer (Fixed WebGL crash by initializing here)
  glassBuffer = createGraphics(settings.canvasW, settings.canvasH); 
  glassBuffer.pixelDensity(1);
  
  glassPos = { x: settings.canvasW/2, y: settings.canvasH/2 };

  createInterface(); 
  addTextObject("LIQUID");
}

function draw() {
  background(settings.bgColor); 
  
  generateCleanLayer(cleanLayer, false); 
  
  // --- MODE 1: MELT ---
  if (settings.mode === 'Melt') {
    generateMeltEffect();
    image(effectLayer, 0, 0);
  } 
  
  // --- MODE 2: GLASS ---
  else if (settings.mode === 'Glass') {
    image(cleanLayer, 0, 0);
    let tx, ty;
    if (settings.glassFull) {
      tx = width/2; ty = height/2;
    } else {
      tx = isGlassLocked ? glassPos.x : mouseX;
      ty = isGlassLocked ? glassPos.y : mouseY;
    }
    renderGlassPane(tx, ty);
  }
  
  // --- MODE 3: MOTION ---
  else if (settings.mode === 'Motion') {
    applyMotionBlur();
    image(effectLayer, 0, 0); 
  } 

  if (!isExporting) {
    drawOverlayUI();
  }
}

// ----------------------------------------------------
// 1. TEXT MANAGEMENT
// ----------------------------------------------------
function addTextObject(str) {
  textObjects.push({
    text: str,
    x: settings.canvasW / 2,
    y: settings.canvasH / 2,
    fontSize: 150,
    fontFamily: 'Georgia',
    color: '#ffffff'
  });
  activeIndex = textObjects.length - 1;
  updateUIForActiveText(); 
}

function deleteTextObject(index) {
  textObjects.splice(index, 1);
  if (activeIndex >= textObjects.length) activeIndex = textObjects.length - 1;
  if (activeIndex < 0) activeIndex = 0;
  if (textObjects.length > 0) updateUIForActiveText();
}

function updateUIForActiveText() {
  let t = textObjects[activeIndex];
  if(!t) return;
  if(domElements.inpText) domElements.inpText.value(t.text);
  if(domElements.sSize) domElements.sSize.value(t.fontSize);
  if(domElements.selFont) domElements.selFont.selected(t.fontFamily);
  if(domElements.colText) domElements.colText.value(t.color);
}

function generateCleanLayer(pg, useGlassColor) {
  pg.clear();
  pg.noStroke();
  pg.textAlign(CENTER, CENTER);
  
  for (let t of textObjects) {
    if (useGlassColor) {
      pg.fill(settings.glassTextColor);
    } else {
      pg.fill(t.color);
    }
    pg.textSize(t.fontSize);
    pg.textFont(t.fontFamily);
    pg.text(t.text, t.x, t.y);
  }
}

// ----------------------------------------------------
// 2. MELT EFFECT
// ----------------------------------------------------
function generateMeltEffect() {
  let pg = effectLayer;
  pg.clear();
  
  let seed = settings.meltSeed;
  let step = 2; 
  
  for (let x = 0; x < width; x += step) {
     let n = noise(x * settings.meltFreq, seed);
     let offset = Math.floor(n * settings.meltAmount);
     pg.copy(cleanLayer, x, 0, step, height, x, offset, step, height);
  }
}

// ----------------------------------------------------
// 3. MOTION EFFECT
// ----------------------------------------------------
function applyMotionBlur() {
  let pg = effectLayer;
  pg.clear();
  pg.textAlign(CENTER, CENTER);
  
  let rads = radians(settings.motionAngle);
  let dirX = cos(rads);
  let dirY = sin(rads);
  
  let stepDist = max(1, settings.motionStepDist);
  let count = Math.floor(settings.motionTotalDist / stepDist);
  
  // Trails
  for (let t of textObjects) {
    let trailColor = color(t.color);
    trailColor.setAlpha(100); 
    
    pg.fill(trailColor);
    pg.textSize(t.fontSize);
    pg.textFont(t.fontFamily);
    
    for(let i = count; i > 0; i--) {
      let d = i * stepDist;
      let px = t.x - (dirX * d);
      let py = t.y - (dirY * d);
      pg.text(t.text, px, py);
    }
  }
  
  // Lead Text
  for (let t of textObjects) {
    let c = color(t.color);
    c.setAlpha(settings.leadOpacity);
    pg.fill(c);
    pg.textSize(t.fontSize);
    pg.textFont(t.fontFamily);
    pg.text(t.text, t.x, t.y);
  }
}

// ----------------------------------------------------
// 4. GLASS EFFECT (OPTIMIZED)
// ----------------------------------------------------
function renderGlassPane(mx, my) {
  let gW = settings.glassFull ? width : settings.glassWidth;
  let gH = settings.glassFull ? height : settings.glassHeight;
  
  let gx = mx - gW / 2;
  let gy = my - gH / 2;
  
  if (!settings.glassFull) {
    gx = constrain(gx, 0, width - gW);
    gy = constrain(gy, 0, height - gH);
  } else {
    gx = 0; gy = 0;
  }

  // Reuse the persistent buffer
  glassBuffer.clear();
  generateCleanLayer(glassBuffer, true); 
  
  let b = settings.glassBlur;
  if (b > 0) {
    glassBuffer.filter(BLUR, b * 0.5); 
    glassBuffer.filter(BLUR, b * 0.5); 
  }
  
  let glassImg = glassBuffer.get(gx, gy, gW, gH);
  
  push();
  translate(gx, gy);
  
  let frostCol = color(settings.bgColor);
  frostCol.setAlpha(240); 
  noStroke(); fill(frostCol); rect(0, 0, gW, gH);
  image(glassImg, 0, 0);
  
  if (settings.glassStroke && !settings.glassFull) {
    noFill(); strokeWeight(1);
    stroke(255, 100); rect(1, 1, gW-2, gH-2);
    stroke(0, 50); rect(0, 0, gW, gH);
  }
  pop();
}

// ----------------------------------------------------
// INTERACTION
// ----------------------------------------------------
function drawOverlayUI() {
  textSize(10);
  for (let i = 0; i < textObjects.length; i++) {
    let t = textObjects[i];
    textSize(t.fontSize); textFont(t.fontFamily);
    let w = textWidth(t.text);
    let h = t.fontSize; 
    let rightX = t.x + w/2;
    let topY = t.y - h/2;
    
    noStroke();
    if (dist(mouseX, mouseY, rightX, topY) < 15) {
      fill(255, 0, 0); cursor(HAND);
    } else {
      fill(80); cursor(ARROW);
    }
    ellipse(rightX, topY, 20, 20);
    stroke(255); strokeWeight(2);
    line(rightX - 4, topY - 4, rightX + 4, topY + 4);
    line(rightX + 4, topY - 4, rightX - 4, topY + 4);
  }
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // 1. DELETE
    for (let i = 0; i < textObjects.length; i++) {
      let t = textObjects[i];
      textSize(t.fontSize); textFont(t.fontFamily);
      let w = textWidth(t.text);
      let h = t.fontSize;
      if (dist(mouseX, mouseY, t.x + w/2, t.y - h/2) < 15) {
        deleteTextObject(i);
        return; 
      }
    }
    // 2. SELECT
    let hitIndex = -1;
    for(let i=0; i<textObjects.length; i++) {
      let t = textObjects[i];
      if(dist(mouseX, mouseY, t.x, t.y) < t.fontSize) {
        hitIndex = i;
        break; 
      }
    }
    if (hitIndex !== -1) {
      activeIndex = hitIndex;
      updateUIForActiveText(); 
      if (keyIsDown(SHIFT)) {
        isDraggingText = true;
        return;
      }
    }
    // 3. GLASS
    if (settings.mode === 'Glass' && !settings.glassFull) {
      isGlassLocked = !isGlassLocked;
      if (isGlassLocked) glassPos = {x: mouseX, y: mouseY};
    } 
  }
}

function mouseDragged() {
  if (isDraggingText && textObjects[activeIndex]) {
    let t = textObjects[activeIndex];
    t.x += (mouseX - pmouseX);
    t.y += (mouseY - pmouseY);
  } 
}
function mouseReleased() { isDraggingText = false; }


// ----------------------------------------------------
// PIXEL SCAN EXPORTER (RASTER -> VECTOR)
// ----------------------------------------------------
function exportSVG() {
  // This logic is adapted from the Rasterizer to save the visual effects as Vectors
  console.log("Scanning pixels for vector export...");
  
  let svgLines = [];
  let w = settings.canvasW;
  let h = settings.canvasH;
  
  // Choose which layer to scan
  // If in Melt or Motion, the effect is on effectLayer
  // If in Glass, it's complex, so we fallback to scanning cleanLayer (Text)
  let source = (settings.mode === 'Glass') ? cleanLayer : effectLayer;
  
  // Prepare pixels
  source.loadPixels();
  
  // Header
  svgLines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  svgLines.push(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`);
  
  // Background
  svgLines.push(`<rect width="100%" height="100%" fill="${settings.bgColor}" />`);
  
  // SCAN LOOP
  // step = 2 means 1 SVG rect per 2x2 pixel block (Smaller file size)
  // step = 1 means pixel perfect (Large file size)
  let step = 2; 
  
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      
      let index = (x + y * w) * 4;
      let r = source.pixels[index];
      let g = source.pixels[index + 1];
      let b = source.pixels[index + 2];
      let a = source.pixels[index + 3]; // Alpha channel
      
      // If the pixel is visible (alpha > 20), draw a vector rect
      if (a > 20) {
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        // We add +0.5 to dimensions to overlap slightly and prevent gaps
        svgLines.push(`<rect x="${x}" y="${y}" width="${step + 0.5}" height="${step + 0.5}" fill="${hex}" />`);
      }
    }
  }
  
  svgLines.push(`</svg>`);
  
  // Save using p5 native function
  saveStrings(svgLines, 'vector_effect_scan', 'svg');
}


// ----------------------------------------------------
// UI CREATION
// ----------------------------------------------------
function createInterface() {
  let container = createDiv('');
  container.style('position', 'absolute'); container.style('top', '20px'); container.style('left', '10px');
  container.style('width', '240px'); container.style('background', '#2a2a2a'); container.style('padding', '15px');
  container.style('color', '#eee'); container.style('font-family', 'sans-serif'); container.style('border-radius', '8px');
  container.style('box-shadow', '0 4px 15px rgba(0,0,0,0.5)');
  
  function createLabel(txt, parent) {
    let l = createDiv(txt); l.parent(parent);
    l.style('margin-top', '15px'); l.style('font-size', '10px'); l.style('color', '#aaa'); l.style('font-weight', 'bold');
  }

  createDiv('GRAPHIC ENGINE v14.0').parent(container).style('color','#fff').style('font-weight','bold');
  
  createLabel('SELECTED TEXT PROPERTIES', container);
  
  domElements.selFont = createSelect(); domElements.selFont.parent(container); domElements.selFont.style('width', '100%'); 
  domElements.selFont.option('Georgia'); domElements.selFont.option('Arial'); domElements.selFont.option('Impact'); domElements.selFont.option('Courier New');
  domElements.selFont.changed(() => { if(textObjects[activeIndex]) textObjects[activeIndex].fontFamily = domElements.selFont.value(); });

  domElements.inpText = createInput(''); domElements.inpText.parent(container); domElements.inpText.style('width','100%');
  domElements.inpText.input(() => { if(textObjects[activeIndex]) textObjects[activeIndex].text = domElements.inpText.value(); });
  
  domElements.sSize = createSlider(10, 400, 150); domElements.sSize.parent(container); domElements.sSize.style('width','100%');
  domElements.sSize.input(() => { if(textObjects[activeIndex]) textObjects[activeIndex].fontSize = domElements.sSize.value(); });

  let btnAdd = createButton('+ ADD NEW TEXT'); btnAdd.parent(container); 
  btnAdd.style('width','100%'); btnAdd.style('margin-top','5px'); btnAdd.style('background','#444'); btnAdd.style('color','white'); btnAdd.style('border','none');
  btnAdd.mousePressed(() => { addTextObject("NEW"); });

  createLabel('COLORS', container);
  let row = createDiv(''); row.parent(container); row.style('display','flex'); row.style('gap','10px');
  domElements.colText = createColorPicker('#ffffff'); domElements.colText.parent(row); domElements.colText.style('width','50%');
  let colBg = createColorPicker(settings.bgColor); colBg.parent(row); colBg.style('width','50%');
  
  domElements.colText.input(() => { if(textObjects[activeIndex]) textObjects[activeIndex].color = domElements.colText.value(); });
  colBg.input(() => { settings.bgColor = colBg.value(); });

  createLabel('MODE', container);
  let selMode = createSelect(); selMode.parent(container); selMode.style('width','100%');
  selMode.option('Melt'); selMode.option('Glass'); selMode.option('Motion'); 
  selMode.changed(() => { settings.mode = selMode.value(); updateUIVisibility(); });
  
  createDiv('<hr>').parent(container).style('border','0').style('border-top','1px solid #444');
  
  // UI: MELT
  uiGroups.melt = createDiv(''); uiGroups.melt.parent(container);
  createLabel('MELT SEED (Pattern Shift)', uiGroups.melt);
  let sSeed = createSlider(0, 100, settings.meltSeed); sSeed.parent(uiGroups.melt); sSeed.style('width','100%');
  sSeed.input(() => { settings.meltSeed = sSeed.value(); });

  createLabel('MELT AMOUNT (Stretch)', uiGroups.melt);
  let sMelt = createSlider(0, 500, settings.meltAmount); sMelt.parent(uiGroups.melt); sMelt.style('width','100%');
  sMelt.input(() => { settings.meltAmount = sMelt.value(); });
  
  createLabel('WAVE FREQUENCY (Smoothness)', uiGroups.melt);
  let sFreq = createSlider(0.001, 0.05, settings.meltFreq, 0.001); sFreq.parent(uiGroups.melt); sFreq.style('width','100%');
  sFreq.input(() => { settings.meltFreq = sFreq.value(); });

  // UI: GLASS
  uiGroups.glass = createDiv(''); uiGroups.glass.parent(container);
  createLabel('GLASS TEXT COLOR', uiGroups.glass);
  let colGlassText = createColorPicker(settings.glassTextColor); colGlassText.parent(uiGroups.glass); colGlassText.style('width','100%');
  colGlassText.input(() => { settings.glassTextColor = colGlassText.value(); });

  let chkFull = createCheckbox('FULL SCREEN', settings.glassFull); chkFull.parent(uiGroups.glass); chkFull.style('color','#fff'); chkFull.style('margin-top','10px');
  chkFull.changed(() => { settings.glassFull = chkFull.checked(); });

  let chkStroke = createCheckbox('Show Border', settings.glassStroke); chkStroke.parent(uiGroups.glass); chkStroke.style('color','#aaa');
  chkStroke.changed(() => { settings.glassStroke = chkStroke.checked(); });

  createLabel('BLUR STRENGTH', uiGroups.glass);
  let sGBlur = createSlider(0, 20, settings.glassBlur); sGBlur.parent(uiGroups.glass); sGBlur.style('width','100%');
  sGBlur.input(() => { settings.glassBlur = sGBlur.value(); });
  
  createLabel('PANE SIZE', uiGroups.glass);
  let sGW = createSlider(50, 1000, settings.glassWidth); sGW.parent(uiGroups.glass); sGW.style('width','100%');
  let sGH = createSlider(50, 1000, settings.glassHeight); sGH.parent(uiGroups.glass); sGH.style('width','100%');
  sGW.input(() => { settings.glassWidth = sGW.value(); });
  sGH.input(() => { settings.glassHeight = sGH.value(); });

  // UI: MOTION
  uiGroups.motion = createDiv(''); uiGroups.motion.parent(container);
  createLabel('ANGLE', uiGroups.motion);
  let sAng = createSlider(0, 360, settings.motionAngle); sAng.parent(uiGroups.motion); sAng.style('width','100%');
  sAng.input(() => { settings.motionAngle = sAng.value(); });
  
  createLabel('TOTAL LENGTH', uiGroups.motion);
  let sTot = createSlider(10, 800, settings.motionTotalDist); sTot.parent(uiGroups.motion); sTot.style('width','100%');
  sTot.input(() => { settings.motionTotalDist = sTot.value(); });

  createLabel('STEP DISTANCE (Gap)', uiGroups.motion);
  let sStep = createSlider(1, 50, settings.motionStepDist); sStep.parent(uiGroups.motion); sStep.style('width','100%');
  sStep.input(() => { settings.motionStepDist = sStep.value(); });

  createLabel('ORIGINAL OPACITY', uiGroups.motion);
  let sOp = createSlider(0, 255, settings.leadOpacity); sOp.parent(uiGroups.motion); sOp.style('width','100%');
  sOp.input(() => { settings.leadOpacity = sOp.value(); });

  updateUIVisibility();
  
  createLabel('CANVAS SIZE', container);
  let cW = createInput(settings.canvasW.toString(), 'number'); cW.parent(container); cW.style('width','45%');
  let cH = createInput(settings.canvasH.toString(), 'number'); cH.parent(container); cH.style('width','45%'); cH.style('margin-left','5%');
  let btnResize = createButton('Apply'); btnResize.parent(container); btnResize.style('margin-top','5px');
  
  // Resize Logic
  btnResize.mousePressed(() => {
    settings.canvasW = parseInt(cW.value()); settings.canvasH = parseInt(cH.value());
    resizeCanvas(settings.canvasW, settings.canvasH);
    
    cleanLayer = createGraphics(settings.canvasW, settings.canvasH);
    cleanLayer.pixelDensity(1);
    
    effectLayer = createGraphics(settings.canvasW, settings.canvasH);
    effectLayer.pixelDensity(1);
    
    glassBuffer = createGraphics(settings.canvasW, settings.canvasH); 
    glassBuffer.pixelDensity(1);
  });
  
  createDiv('<br>').parent(container);
  
  let btnSave = createButton('SAVE PNG'); btnSave.parent(container); 
  btnSave.style('width','100%'); btnSave.style('background','#555'); btnSave.style('color','white'); btnSave.style('padding','10px'); btnSave.style('border','none');
  btnSave.mousePressed(() => { 
    isExporting = true; 
    draw(); 
    saveCanvas('graphic_export', 'png'); 
    setTimeout(() => { isExporting = false; }, 1000); 
  });
  
  let btnSVG = createButton('SAVE SVG (VECTOR SCAN)'); btnSVG.parent(container); 
  btnSVG.style('width','100%'); btnSVG.style('margin-top','5px'); btnSVG.style('background','#333'); btnSVG.style('color','white'); btnSVG.style('padding','10px'); btnSVG.style('border','1px solid #555');
  btnSVG.mousePressed(() => { exportSVG(); });
}

function updateUIVisibility() {
  uiGroups.melt.hide(); uiGroups.motion.hide(); uiGroups.glass.hide();
  if (settings.mode === 'Melt') uiGroups.melt.show();
  else if (settings.mode === 'Motion') uiGroups.motion.show();
  else if (settings.mode === 'Glass') uiGroups.glass.show();
}