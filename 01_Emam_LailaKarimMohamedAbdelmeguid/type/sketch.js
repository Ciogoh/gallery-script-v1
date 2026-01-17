// ---------------- Variables ----------------
let textInput, sizeSlider, speedSlider, modeSelect, shapeSelect;
let pCol, bgCol, gifBtn, savePicBtn, statusLabel;
let intensitySlider, rotSlider, spacingSlider;

// ---------------- Setup ----------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // TEXT & SHAPE SELECTION
  textInput = createInput('VIBE');
  textInput.position(20, height - 140);
  
  shapeSelect = createSelect();
  shapeSelect.position(20, height - 110);
  shapeSelect.option('Circle');
  shapeSelect.option('Square');
  shapeSelect.option('Star');
  shapeSelect.option('Cross');
  shapeSelect.option('Heart');
  shapeSelect.option('Spiral');

  // MOTION & SIZE SETTINGS
  modeSelect = createSelect();
  modeSelect.position(180, height - 140);
  modeSelect.option('Wave'); 
  modeSelect.option('Glitch'); 
  modeSelect.option('Orbit');
  
  sizeSlider = createSlider(5, 100, 25); // Font Size
  sizeSlider.position(180, height - 110);
  
  intensitySlider = createSlider(20, 400, 150); // Shape Radius
  intensitySlider.position(180, height - 80);
  
  spacingSlider = createSlider(1, 10, 3); // Text Density
  spacingSlider.position(180, height - 50);

  // ROTATION & SPEED
  rotSlider = createSlider(0, TWO_PI, 0, 0.01); // Global Rotation
  rotSlider.position(350, height - 110);

  speedSlider = createSlider(0.01, 0.5, 0.1, 0.01);
  speedSlider.position(350, height - 60);

  // COLORS & EXPORTS
  pCol = createColorPicker('#000000');
  pCol.position(width - 320, height - 110);
  
  bgCol = createColorPicker('#ffffff');
  bgCol.position(width - 320, height - 70);

  gifBtn = createButton('🎬 RECORD 6s GIF');
  gifBtn.position(width - 160, height - 110);
  gifBtn.mousePressed(() => {
    statusLabel.html('RECORDING...');
    saveGif('Shape_Outline_Vibe', 6);
    setTimeout(() => statusLabel.html(''), 6000);
  });

  savePicBtn = createButton('📸 SAVE PNG');
  savePicBtn.position(width - 160, height - 75);
  savePicBtn.mousePressed(() => saveCanvas('Outline_Still', 'png'));

  statusLabel = createElement('span', '');
  statusLabel.position(width - 160, height - 35);
}

// ---------------- Draw ----------------
function draw() {
  background(bgCol.color());
  textAlign(CENTER, CENTER);
  textSize(sizeSlider.value());
  fill(pCol.color());

  let txt = textInput.value();
  let shape = shapeSelect.value();
  let speed = speedSlider.value();
  let radius = intensitySlider.value();
  let spacing = spacingSlider.value();

  push();
  translate(width/2, height/2 - 50);
  rotate(rotSlider.value()); // Manual Rotation

  // Draw characters along the geometric path
  let charCount = txt.length * spacing; 
  for (let i = 0; i < charCount; i++) {
    let pct = i / charCount;
    let pos = getShapePoint(shape, pct, radius);
    
    push();
    translate(pos.x, pos.y);
    applyDistortion(i, speed);
    text(txt[i % txt.length], 0, 0);
    pop();
  }
  pop();
  
  drawInterfaceLabels();
}

// ---------------- Path Math ----------------
function getShapePoint(shape, pct, r) {
  let angle = pct * TWO_PI;
  if (shape === 'Circle') {
    return { x: cos(angle) * r, y: sin(angle) * r };
  } 
  else if (shape === 'Square') {
    let x, y;
    if (pct < 0.25) { x = map(pct, 0, 0.25, -r, r); y = -r; }
    else if (pct < 0.5) { x = r; y = map(pct, 0.25, 0.5, -r, r); }
    else if (pct < 0.75) { x = map(pct, 0.5, 0.75, r, -r); y = r; }
    else { x = -r; y = map(pct, 0.75, 1, r, -r); }
    return { x: x, y: y };
  } 
  else if (shape === 'Star') {
    let r2 = r * 0.5;
    let starAngle = angle - HALF_PI;
    let currentR = (floor(pct * 10) % 2 === 0) ? r : r2;
    return { x: cos(starAngle) * currentR, y: sin(starAngle) * currentR };
  }
  else if (shape === 'Cross') {
    return (pct < 0.5) ? { x: 0, y: map(pct, 0, 0.5, -r, r) } : { x: map(pct, 0.5, 1, -r, r), y: 0 };
  }
  else if (shape === 'Heart') {
    let t = angle;
    let x = 16 * pow(sin(t), 3);
    let y = -(13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t));
    return { x: x * (r/15), y: y * (r/15) };
  }
  else if (shape === 'Spiral') {
    let spiralR = pct * r;
    return { x: cos(angle * 3) * spiralR, y: sin(angle * 3) * spiralR };
  }
}

function applyDistortion(i, speed) {
  let mode = modeSelect.value();
  if (mode === 'Wave') translate(0, sin(frameCount * speed + i) * 20);
  else if (mode === 'Glitch' && random(1) > 0.9) translate(random(-15, 15), random(-5, 5));
  else if (mode === 'Orbit') rotate(frameCount * speed * 0.5);
}

function drawInterfaceLabels() {
  let isDark = brightness(bgCol.color()) < 50;
  let c = isDark ? 255 : 0;
  fill(c); noStroke(); textSize(11); textStyle(BOLD);
  
  text('TEXT & SHAPE', 80, height - 155);
  text('FONT / RADIUS / DENSITY', 250, height - 155);
  text('ROTATION & SPEED', 420, height - 155);
  text('VISUALS & EXPORT', width - 240, height - 155);
  
  // Sub-labels for sliders
  textSize(9); textStyle(NORMAL);
  text('Rotation', 420, height - 125);
  text('Speed', 420, height - 75);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }