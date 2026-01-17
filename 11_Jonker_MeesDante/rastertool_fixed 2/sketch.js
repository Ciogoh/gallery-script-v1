let img, vectorGraphics, fileInput, resolutionSlider, resolutionLabel;
let contrastSlider, contrastLabel, vibrationSlider, vibrationLabel;
let shapeSelector, dotColorPicker, bgColorPicker, vibrationCheckbox, imageColorCheckbox;
let pngSaveButton, gifSaveButton, filenameInput; // New variable for naming

let drawMode = 'DOTS', isVibrating = false, useImageColors = false;
let isRecordingGif = false, recordTimer = 0;
let resolution = 8, maxShapeSize = 8, contrastVal = 1, vibrationStrength = 0.3;

const MENU_HEIGHT = 85, IMAGE_AREA_WIDTH = 800, PADDING = 20, MENU_BG = '#1E1E1E';

function setup() {
  createCanvas(IMAGE_AREA_WIDTH, 600);
  setupUI();
  noLoop();
}

function setupUI() {
  const getMenuY = (o) => height - MENU_HEIGHT + o;
  const styleBtn = (b, c) => {
    b.style('background', c); b.style('color', '#fff'); b.style('border', 'none');
    b.style('padding', '5px 10px'); b.style('border-radius', '4px'); b.style('cursor', 'pointer');
  };

  let x = 15;
  // 1. Image Input
  createP('IMAGE').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  fileInput = createFileInput(handleFile).position(x, getMenuY(35));
  x += 115;

  // 2. Shape Selector
  createP('SHAPE').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  shapeSelector = createSelect().position(x, getMenuY(35));
  ['DOTS', 'LINES', 'SQUARES', 'HEARTS', 'STARS'].forEach(s => shapeSelector.option(s));
  shapeSelector.changed(() => { drawMode = shapeSelector.value(); loop(); });
  x += 85;

  // 3. Detail Slider
  resolutionLabel = createP('DETAIL: 8').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  resolutionSlider = createSlider(4, 40, 8, 1).position(x, getMenuY(35)).style('width', '70px');
  resolutionSlider.input(() => { resolution = resolutionSlider.value(); resolutionLabel.html('DETAIL: ' + resolution); maxShapeSize = resolution; loop(); });
  x += 85;

  // 4. Contrast Slider
  contrastLabel = createP('CONTRAST: 1.0').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  contrastSlider = createSlider(0, 3, 1, 0.1).position(x, getMenuY(35)).style('width', '70px');
  contrastSlider.input(() => { contrastVal = contrastSlider.value(); contrastLabel.html('CONTRAST: ' + contrastVal.toFixed(1)); loop(); });
  x += 85;

  // 5. Vibration Slider
  vibrationLabel = createP('STRENGTH: 0.3').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  vibrationSlider = createSlider(0, 1.5, 0.3, 0.05).position(x, getMenuY(35)).style('width', '70px');
  vibrationSlider.input(() => { vibrationStrength = vibrationSlider.value(); vibrationLabel.html('STRENGTH: ' + vibrationStrength.toFixed(2)); loop(); });
  x += 85;

  // 6. Colors Section
  createP('COLORS').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  dotColorPicker = createColorPicker('#000000').position(x, getMenuY(35));
  bgColorPicker = createColorPicker('#ffffff').position(x + 35, getMenuY(35));
  imageColorCheckbox = createCheckbox('ORIGINAL', false).position(x, getMenuY(60)).style('color', '#eee').style('font-size', '9px');
  imageColorCheckbox.changed(() => { useImageColors = imageColorCheckbox.checked(); dotColorPicker.style('opacity', useImageColors ? '0.3' : '1.0'); loop(); });
  dotColorPicker.input(() => loop()); bgColorPicker.input(() => loop());
  x += 85;

  // --- NEW: 7. Filename Input ---
  createP('FILENAME').position(x, getMenuY(5)).style('color', '#007AFF').style('font-size', '10px').style('font-weight', 'bold');
  filenameInput = createInput('raster_output').position(x, getMenuY(35)).style('width', '80px').style('background', '#333').style('color', '#fff').style('border', '1px solid #555').style('padding', '3px');
  x += 100;

  // 8. Save Buttons
  createP('SAVE').position(x, getMenuY(5)).style('color', '#eee').style('font-size', '10px');
  pngSaveButton = createButton('PNG').position(x, getMenuY(35)); styleBtn(pngSaveButton, '#007AFF');
  pngSaveButton.mousePressed(savePNG);
  gifSaveButton = createButton('GIF').position(x + 45, getMenuY(35)); styleBtn(gifSaveButton, '#FF3B30');
  gifSaveButton.mousePressed(saveGIF);
  x += 100;

  // 9. Vibration Toggle
  vibrationCheckbox = createCheckbox('VIBRATION', false).position(x, getMenuY(35)).style('color', '#eee');
  vibrationCheckbox.changed(() => { isVibrating = vibrationCheckbox.checked(); isVibrating ? loop() : noLoop(); });
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      let aspect = img.height / img.width;
      let newW = IMAGE_AREA_WIDTH - (PADDING * 2);
      let newH = newW * aspect;
      img.resize(newW, 0);
      resizeCanvas(IMAGE_AREA_WIDTH, newH + MENU_HEIGHT + (PADDING * 2));
      vectorGraphics = createGraphics(img.width, img.height);
      vectorGraphics.image(img, 0, 0);
      vectorGraphics.filter(GRAY);
      vectorGraphics.loadPixels();
      img.loadPixels();
      removeElements(); setupUI(); loop();
    });
  }
}

function savePNG() {
  if (!img) return;
  let name = filenameInput.value() || 'raster_output';
  save(get(PADDING, PADDING, img.width, img.height), name + '.png');
}

function saveGIF() {
  if (!img) return;
  let name = filenameInput.value() || 'raster_output';
  isRecordingGif = true; recordTimer = 10;
  gifSaveButton.html('REC...'); gifSaveButton.attribute('disabled', '');
  frameRate(12);
  saveGif(name, 10, {
    units: 'seconds', fps: 12,
    onComplete: () => {
      isRecordingGif = false; frameRate(60);
      gifSaveButton.html('GIF'); gifSaveButton.removeAttribute('disabled');
      if (!vibrationCheckbox.checked()) noLoop();
    }
  });
}

function draw() {
  if (!img || !vectorGraphics) { background(230); return; }
  background(230);
  fill(MENU_BG); noStroke(); rect(0, height - MENU_HEIGHT, width, MENU_HEIGHT);
  fill(bgColorPicker.color()); rect(PADDING, PADDING, img.width, img.height);

  let vibAmount = (isVibrating || isRecordingGif) ? (resolution * vibrationStrength) : 0;

  for (let x = 0; x < img.width; x += resolution) {
    for (let y = 0; y < img.height; y += resolution) {
      let idx = 4 * (y * img.width + x);
      let r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
      let brRaw = vectorGraphics.pixels[idx];
      
      let br = constrain((brRaw - 128) * contrastVal + 128, 0, 255);
      let sz = map(br, 0, 255, maxShapeSize, 0);
      
      if (sz > 0.5) {
        let finalCol = useImageColors ? color(r, g, b) : dotColorPicker.color();
        drawShape(x + PADDING + random(-vibAmount, vibAmount), 
                  y + PADDING + random(-vibAmount, vibAmount), 
                  sz, br, finalCol);
      }
    }
  }

  if (isRecordingGif) {
    if (frameCount % 12 === 0 && recordTimer > 0) { recordTimer--; gifSaveButton.html('REC: ' + recordTimer + 's'); }
    fill(255, 0, 0); stroke(255); strokeWeight(2); ellipse(35, 35, 20, 20);
    noStroke(); fill(0); textAlign(LEFT); textSize(16); text("CAPTURING: " + recordTimer + "s", 55, 40);
  }
  if (!isVibrating && !isRecordingGif) noLoop();
}

function drawShape(x, y, sz, br, col) {
  fill(col); noStroke();
  if (drawMode === 'DOTS') ellipse(x, y, sz);
  else if (drawMode === 'SQUARES') rect(x - sz/2, y - sz/2, sz, sz);
  else if (drawMode === 'LINES') {
    push(); translate(x, y); rotate(map(br, 0, 255, 0, PI));
    stroke(col); strokeWeight(1.5); line(-sz/2, 0, sz/2, 0); pop();
  } else if (drawMode === 'HEARTS') {
    push(); translate(x, y); scale(sz/20); beginShape(); vertex(0, 0);
    bezierVertex(5, -10, 15, -5, 0, 10); bezierVertex(-15, -5, -5, -10, 0, 0); endShape(CLOSE); pop();
  } else if (drawMode === 'STARS') {
    push(); translate(x, y); beginShape();
    for(let i=0; i<10; i++){ let r = i%2==0 ? sz/2 : sz/4; let a = TWO_PI * i / 10; vertex(cos(a)*r, sin(a)*r); }
    endShape(CLOSE); pop();
  }
}