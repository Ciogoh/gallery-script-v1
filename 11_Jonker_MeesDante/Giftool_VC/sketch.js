let frames = [];
let currentFrame = 0;
let lastStepTime = 0;
let isRecording = false;

// UI Elements
let fileInput, chooseBtn, recordBtn, nameInput;
let effects = {}; 
let intensitySlider;
let selectedColor = null;

function setup() {
  createCanvas(900, 600);
  
  let xUI = 670; 
  let uiWidth = 190;

  // --- TOP ACTION: CHOOSE ---
  fileInput = createFileInput(handleFile, true);
  fileInput.position(xUI, 40);
  fileInput.style('display', 'none'); 

  chooseBtn = createButton('Choose Media');
  chooseBtn.position(xUI, 40);
  chooseBtn.size(uiWidth, 34);
  styleAppleButton(chooseBtn, '#007AFF'); 
  chooseBtn.mousePressed(() => fileInput.elt.click());

  // --- SECTION: FILE NAME ---
  let tName = createP('FILE NAME');
  tName.position(xUI, 90);
  styleHeader(tName);

  nameInput = createInput('My-Animation');
  nameInput.position(xUI, 120);
  nameInput.size(uiWidth - 10, 24);
  styleAppleInput(nameInput);

  // --- SECTION 1: ANIMATION ---
  let t1 = createP('ANIMATION');
  t1.position(xUI, 160);
  styleHeader(t1);

  effects.spin = createCheckbox(' Rotate', false).position(xUI, 190);
  effects.bounce = createCheckbox(' Float', false).position(xUI, 220);
  effects.pulse = createCheckbox(' Scale', false).position(xUI, 250);
  styleCheckboxes([effects.spin, effects.bounce, effects.pulse]);

  // --- SECTION 2: COLOR OVERLAY ---
  let t2 = createP('COLOR OVERLAY');
  t2.position(xUI, 300);
  styleHeader(t2);
  createColorSwatches(xUI, 335);

  // --- SECTION 3: FILTERS ---
  let t3 = createP('FILTERS');
  t3.position(xUI, 380);
  styleHeader(t3);

  effects.glitch = createCheckbox(' RGB Glitch', false).position(xUI, 410);
  styleCheckboxes([effects.glitch]);

  // --- SECTION 4: INTENSITY ---
  let t4 = createP('INTENSITY');
  t4.position(xUI, 460);
  styleHeader(t4);

  intensitySlider = createSlider(0, 100, 20, 1);
  intensitySlider.position(xUI, 495);
  intensitySlider.size(uiWidth);

  // --- BOTTOM ACTION: EXPORT ---
  recordBtn = createButton('Record 10s GIF');
  recordBtn.position(xUI, 540);
  recordBtn.size(uiWidth, 38);
  styleAppleButton(recordBtn, '#FF3B30'); 
  recordBtn.mousePressed(startNativeRecord);
}

function draw() {
  background(255); 
  
  // Sidebar (The "Inspector" Panel)
  noStroke();
  fill(248, 248, 250); 
  rect(640, 0, 260, height);
  stroke(225);
  line(640, 0, 640, height);

  if (frames.length > 0) {
    if (millis() - lastStepTime > 100) {
      currentFrame = (currentFrame + 1) % frames.length;
      lastStepTime = millis();
    }

    let img = frames[currentFrame];
    let s = min(580 / img.width, 500 / img.height);
    let val = intensitySlider.value();

    push();
    translate(320, height / 2); 
    
    let p = map(val, 0, 100, 0.5, 6);
    if (effects.spin.checked()) rotate(frameCount * 0.04 * p);
    if (effects.bounce.checked()) translate(0, sin(frameCount * 0.08 * p) * 30);
    if (effects.pulse.checked()) scale(1 + sin(frameCount * 0.1 * p) * 0.15);

    imageMode(CENTER);

    if (effects.glitch.checked()) {
      drawGlitch(img, s, val);
    } else {
      if (selectedColor) tint(selectedColor); 
      image(img, 0, 0, img.width * s, img.height * s);
      noTint();
    }
    pop();

    if (isRecording) showRecordingUI();
  } else {
    drawEmptyState();
  }
}

// --- NEW STYLING HELPERS ---

function styleAppleInput(input) {
  input.style('background-color', '#FFFFFF');
  input.style('border', '1px solid #d1d1d6');
  input.style('border-radius', '6px');
  input.style('padding', '4px 8px');
  input.style('font-family', 'system-ui');
  input.style('font-size', '13px');
  input.style('color', '#1c1c1e');
}

function startNativeRecord() {
  if (frames.length === 0) return;
  isRecording = true;
  
  // Get the filename from the input field
  let fileName = nameInput.value() || "My-Animation";
  
  saveGif(fileName, 10, { 
    units: 'seconds', 
    onComplete: () => isRecording = false 
  });
}

// --- PREVIOUS HELPERS ---

function createColorSwatches(x, y) {
  let colors = [
    { name: 'None', val: null, hex: '#e5e5ea' },
    { name: 'Blue', val: color(0, 122, 255, 150), hex: '#007AFF' },
    { name: 'Green', val: color(52, 199, 89, 150), hex: '#34C759' },
    { name: 'Purple', val: color(175, 82, 222, 150), hex: '#AF52DE' },
    { name: 'Orange', val: color(255, 149, 0, 150), hex: '#FF9500' }
  ];

  for (let i = 0; i < colors.length; i++) {
    let btn = createButton('');
    btn.position(x + (i * 38), y);
    btn.size(30, 30);
    btn.style('background-color', colors[i].hex);
    btn.style('border', 'none');
    btn.style('border-radius', '50%');
    btn.style('cursor', 'pointer');
    btn.mousePressed(() => { selectedColor = colors[i].val; });
  }
}

function drawGlitch(img, s, val) {
  let w = img.width * s;
  let h = img.height * s;
  imageMode(CENTER);
  let maxShift = map(val, 0, 100, 0, 45);
  let rX = random(-maxShift, maxShift);
  let cX = random(-maxShift, maxShift);

  push();
  blendMode(MULTIPLY); 
  if (selectedColor) tint(selectedColor); 
  else tint(255, 120, 120, 220); 
  image(img, rX, random(-2, 2), w, h);
  if (!selectedColor) tint(120, 255, 255, 220); 
  image(img, cX, random(-2, 2), w, h);
  tint(255, 240); 
  image(img, 0, 0, w, h);
  pop();
}

function styleAppleButton(btn, col) {
  btn.style('background-color', col);
  btn.style('border', 'none');
  btn.style('border-radius', '8px');
  btn.style('color', 'white');
  btn.style('font-family', 'system-ui');
  btn.style('font-weight', '500');
  btn.style('font-size', '13px');
  btn.style('cursor', 'pointer');
}

function styleHeader(p) {
  p.style('font-family', 'system-ui');
  p.style('font-weight', '700');
  p.style('font-size', '10px');
  p.style('letter-spacing', '0.8px');
  p.style('color', '#8e8e93');
  p.style('margin', '0');
}

function styleCheckboxes(arr) {
  arr.forEach(c => {
    c.style('font-family', 'system-ui');
    c.style('font-size', '13px');
    c.style('color', '#1c1c1e');
  });
}

function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, (img) => frames.push(img));
  }
}

function drawEmptyState() {
  fill(210); textAlign(CENTER); textSize(14);
  text("Import media to begin", 320, height / 2);
}

function showRecordingUI() {
  fill(255, 59, 48); noStroke(); ellipse(40, height - 40, 10, 10);
  fill(142, 142, 147); textAlign(LEFT); textSize(12); text("Recording...", 60, height - 36);
}