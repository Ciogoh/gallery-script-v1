let cols = 4;
let rows = 4;
let seed = 0;

// --- TIMING VARIABLES ---
let framesPerPoster = 60; 
let savePending = false; 

// UI Variables
let xpWindow;
let posterSelector, orientSelector, sizeSelector, textInput, colorSelector;
let saveButton;

function setup() {
  createCanvas(400, 500);
  noStroke();
  frameRate(30);
  
  // FIX: Force density to 1. This prevents the canvas from scaling up 
  // on Retina screens or during export, ensuring the size stays exactly what you picked.
  pixelDensity(1);
  
  seed = random(10000); 
  
  createXPInterface();
  updateCanvasSize();
}

function draw() {
  background(240, 240, 235); 
  
  // --- TIMING LOGIC ---
  if (frameCount % framesPerPoster === 0) {
    seed = random(10000); 
    
    if (savePending === true) {
      let numPosters = int(posterSelector.value());
      let framesToSave = (numPosters * framesPerPoster) - 1;
      let filename = `poster_${sizeSelector.value()}_${orientSelector.value()}`;
      
      // Save exact dimensions with best color sampling
      saveGif(filename, framesToSave, { units: 'frames', quality: 1 });
      
      savePending = false;
      saveButton.html('Saving...');
      
      let approximateTime = (framesToSave / 30) * 1000;
      setTimeout(() => {
        saveButton.html('Export GIF');
      }, approximateTime + 500);
    }
  }
  
  randomSeed(seed);
  
  let cellW = width / cols;
  let cellH = height / rows;
  
  // Prepare Text
  let fullText = textInput.value();
  let words = fullText.split(' ').filter(w => w.length > 0);
  
  // --- COLOR PALETTE LOGIC ---
  let paletteName = colorSelector.value();
  let palette = [];

  if (paletteName === 'Bauhaus') {
    palette = [color(0, 50, 200), color(255, 100, 0), color(20)];
  } else if (paletteName === 'Swiss Red') {
    palette = [color(220, 20, 20), color(20), color(40)];
  } else if (paletteName === 'Deep Ocean') {
    palette = [color(10, 25, 60), color(0, 100, 110), color(180, 170, 140)];
  } else if (paletteName === 'Retro 70s') {
    palette = [color(204, 153, 0), color(85, 107, 47), color(120, 60, 20)];
  } else if (paletteName === 'Industrial') {
    palette = [color(40), color(150), color(255, 69, 0)];
  }

  let emptyCells = [];

  // 1. GRID LOOP
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      
      let xPos = x * cellW;
      let yPos = y * cellH;
      
      // 60% chance of a shape
      if (random() > 0.6) {
        
        fill(random(palette));
        let shapeType = floor(random(3));
        
        if (shapeType === 0) {
          rect(xPos, yPos, cellW, cellH);
        } else if (shapeType === 1) {
          ellipseMode(CORNER);
          ellipse(xPos, yPos, cellW, cellW);
        } else if (shapeType === 2) {
          triangle(xPos, yPos, xPos + cellW, yPos, xPos, yPos + cellH);
        }
        
      } else {
        emptyCells.push({x: xPos, y: yPos, w: cellW, h: cellH, active: false});
      }
    }
  }
  
  // 2. TEXT FILLER
  if (words.length > 0 && emptyCells.length > 0) {
    
    let activeCount = 0;
    let availableIndices = [];
    
    for (let i = 0; i < emptyCells.length; i++) {
      availableIndices.push(i);
      if (random() < 0.4) {
        emptyCells[i].active = true;
        activeCount++;
      }
    }
    
    if (activeCount < words.length && activeCount < emptyCells.length) {
      let needed = words.length - activeCount;
      let inactiveIndices = availableIndices.filter(index => !emptyCells[index].active);
      shuffle(inactiveIndices, true);
      
      for (let i = 0; i < needed; i++) {
        if (i < inactiveIndices.length) {
           let idx = inactiveIndices[i];
           emptyCells[idx].active = true;
        }
      }
    }
    
    fill(20); 
    textAlign(CENTER, CENTER);
    textFont('Helvetica');
    textStyle(BOLD);
    let fixedSize = cellW * 0.2; 
    textSize(fixedSize);
    
    for (let i = 0; i < emptyCells.length; i++) {
      if (emptyCells[i].active) {
        
        let cell = emptyCells[i];
        let wordToDraw = random(words); 
        
        let txtW = textWidth(wordToDraw);
        let maxW = cell.w * 0.9; 
        
        if (txtW <= maxW) {
          text(wordToDraw, cell.x + cell.w / 2, cell.y + cell.h / 2);
        } else {
          let mid = floor(wordToDraw.length / 2);
          let part1 = wordToDraw.substring(0, mid) + "-";
          let part2 = wordToDraw.substring(mid);
          let spacing = fixedSize * 1.1;
          text(part1, cell.x + cell.w / 2, cell.y + cell.h / 2 - spacing/2);
          text(part2, cell.x + cell.w / 2, cell.y + cell.h / 2 + spacing/2);
        }
      }
    }
  }
}

// --- CANVAS RESIZING & MENU POSITIONING ---
function updateCanvasSize() {
  let orient = orientSelector.value();
  let sizeLabel = sizeSelector.value();
  
  let w = 400;
  let h = 500;
  
  let multiplier = 1;
  if (sizeLabel === 'Tiny') multiplier = 0.5;
  if (sizeLabel === 'Regular') multiplier = 1.0;
  if (sizeLabel === 'Big') multiplier = 1.5;
  if (sizeLabel === 'Huge') multiplier = 2.0;
  
  w *= multiplier;
  h *= multiplier;
  
  if (orient === 'Horizontal') {
    let temp = w;
    w = h;
    h = temp;
  }
  
  resizeCanvas(w, h);
  
  if (xpWindow) {
    xpWindow.position(w + 20, 20);
  }
}

// --- SAVE TRIGGER ---
function requestSave() {
  savePending = true;
  saveButton.html('Waiting...');
}

// --- XP INTERFACE CONSTRUCTION ---
function createXPInterface() {
  xpWindow = createDiv();
  xpWindow.position(0, 0); 
  xpWindow.style('width', '200px');
  xpWindow.style('background-color', '#ECE9D8'); 
  xpWindow.style('border', '1px solid #0054E3'); 
  xpWindow.style('border-radius', '3px 3px 0 0');
  xpWindow.style('box-shadow', '2px 2px 5px rgba(0,0,0,0.3)');
  xpWindow.style('font-family', 'Tahoma, sans-serif');
  
  let titleBar = createDiv('Poster_Gen.exe');
  titleBar.parent(xpWindow);
  titleBar.style('background', 'linear-gradient(to bottom, #0058EE 0%, #3593FF 4%, #288EFF 18%, #127DFF 100%)');
  titleBar.style('color', 'white');
  titleBar.style('padding', '4px 8px');
  titleBar.style('font-weight', 'bold');
  titleBar.style('font-size', '13px');
  titleBar.style('text-shadow', '1px 1px #0f1089');
  
  let content = createDiv();
  content.parent(xpWindow);
  content.style('padding', '10px');
  
  // Text Input
  createDiv('Poster Text:').parent(content).style('font-size', '11px').style('margin-bottom', '2px');
  textInput = createInput('DESIGN IS FUN'); 
  textInput.parent(content);
  textInput.style('width', '94%'); 
  textInput.style('margin-bottom', '10px');
  textInput.style('border', '1px solid #7F9DB9'); 
  textInput.style('padding', '3px');
  
  // Loop Count
  createDiv('Posters in Loop:').parent(content).style('font-size', '11px').style('margin-bottom', '2px');
  posterSelector = createSelect();
  posterSelector.parent(content);
  posterSelector.style('width', '100%');
  posterSelector.style('margin-bottom', '10px');
  for (let i = 2; i <= 10; i++) posterSelector.option(i);
  posterSelector.selected(3);
  
  // Color Selector
  createDiv('Color Palette:').parent(content).style('font-size', '11px').style('margin-bottom', '2px');
  colorSelector = createSelect();
  colorSelector.parent(content);
  colorSelector.style('width', '100%');
  colorSelector.style('margin-bottom', '10px');
  colorSelector.option('Bauhaus');
  colorSelector.option('Swiss Red');
  colorSelector.option('Deep Ocean');
  colorSelector.option('Retro 70s');
  colorSelector.option('Industrial');
  colorSelector.selected('Bauhaus');

  // Orientation
  createDiv('Orientation:').parent(content).style('font-size', '11px').style('margin-bottom', '2px');
  orientSelector = createSelect();
  orientSelector.parent(content);
  orientSelector.style('width', '100%');
  orientSelector.style('margin-bottom', '10px');
  orientSelector.option('Vertical');
  orientSelector.option('Horizontal');
  orientSelector.changed(updateCanvasSize);

  // Size
  createDiv('Canvas Size:').parent(content).style('font-size', '11px').style('margin-bottom', '2px');
  sizeSelector = createSelect();
  sizeSelector.parent(content);
  sizeSelector.style('width', '100%');
  sizeSelector.style('margin-bottom', '15px');
  sizeSelector.option('Tiny');
  sizeSelector.option('Regular');
  sizeSelector.option('Big');
  sizeSelector.option('Huge');
  sizeSelector.selected('Regular');
  sizeSelector.changed(updateCanvasSize);

  // Save Button
  saveButton = createButton('Export GIF');
  saveButton.parent(content);
  saveButton.mousePressed(requestSave);
  
  saveButton.style('width', '100%');
  saveButton.style('padding', '5px');
  saveButton.style('font-family', 'Tahoma');
  saveButton.style('font-size', '12px');
  saveButton.style('cursor', 'pointer');
  saveButton.style('background-color', '#f0f0f0');
  saveButton.style('border', '2px solid');
  saveButton.style('border-color', '#ffffff #808080 #808080 #ffffff'); 
  saveButton.style('color', 'black');
  
  saveButton.mouseOver(() => saveButton.style('background-color', '#f8f8f8'));
  saveButton.mouseOut(() => saveButton.style('background-color', '#f0f0f0'));
}