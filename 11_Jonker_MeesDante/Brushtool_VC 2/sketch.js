let thicknessSlider, colorPicker, rainbowMode, straightLineTool, brushType;
let nameInput; // The text box for the file name
let canvasLayer;
let uiWidth = 200;
let startX, startY;
let hueValue = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  canvasLayer = createGraphics(windowWidth, windowHeight);
  canvasLayer.background(255);

  // --- UI SETUP ---
  colorPicker = createColorPicker('#2c3e50');
  colorPicker.position(20, 60);
  
  rainbowMode = createCheckbox(' Rainbow Mode', false);
  rainbowMode.position(20, 100);

  straightLineTool = createCheckbox(' Straight Line Tool', false);
  straightLineTool.position(20, 130);

  brushType = createSelect();
  brushType.position(20, 170);
  brushType.option('Fine Line');
  brushType.option('Graffiti');
  brushType.option('Dots');
  brushType.option('Calligraphy');
  brushType.option('Paint Brush');
  brushType.option('Soft Glow');
  
  thicknessSlider = createSlider(1, 100, 20, 1);
  thicknessSlider.position(20, 210);

  // NEW: File Name Input
  let nameLabel = createP("FILE NAME:");
  nameLabel.position(20, 230);
  nameLabel.style('font-weight', 'bold');
  nameLabel.style('font-size', '12px');
  
  nameInput = createInput('my_artwork'); // Initial default text
  nameInput.position(20, 265);
  nameInput.style('width', '150px');
  
  // Action Buttons
  let clearBtn = createButton('Clear Canvas');
  clearBtn.position(20, 310);
  clearBtn.style('width', '160px');
  clearBtn.mousePressed(() => canvasLayer.background(255));

  let saveBtn = createButton('Save as PNG');
  saveBtn.position(20, 345);
  saveBtn.style('width', '160px');
  saveBtn.style('background-color', '#4CAF50');
  saveBtn.style('color', 'white');
  saveBtn.mousePressed(exportImage);
}

function exportImage() {
  // Get the text from the input box
  let fileName = nameInput.value();
  
  // If the user left it empty, provide a fallback
  if (fileName === "") {
    fileName = "untitled_art";
  }
  
  // Save the canvasLayer with the custom name
  save(canvasLayer, fileName + ".png");
}

function draw() {
  background(240);
  image(canvasLayer, 0, 0);

  // UI Sidebar Overlay
  noStroke();
  fill(240);
  rect(0, 0, uiWidth, height);
  
  fill(50);
  textSize(12);
  text("BRUSH TYPE", 20, 165);
  text("THICKNESS: " + thicknessSlider.value(), 20, 205);

  if (mouseIsPressed && mouseX > uiWidth) {
    if (straightLineTool.checked()) {
      applyStyles(this);
      line(startX, startY, mouseX, mouseY);
    } else {
      drawContinuousPath(canvasLayer);
    }
  }
}

// ... (Rest of the drawContinuousPath and applyStyles functions remain the same as previous)
function drawContinuousPath(target) {
  applyStyles(target);
  let type = brushType.value();
  let weight = thicknessSlider.value();
  let d = dist(pmouseX, pmouseY, mouseX, mouseY);
  let stepSize = (type === 'Dots') ? weight * 1.5 : 2; 

  for (let i = 0; i <= d; i += stepSize) {
    let t = i / d;
    let x = lerp(pmouseX, mouseX, t);
    let y = lerp(pmouseY, mouseY, t);

    if (type === 'Fine Line') {
      target.line(pmouseX, pmouseY, mouseX, mouseY);
      break; 
    } else if (type === 'Graffiti') {
      for (let j = 0; j < 6; j++) {
        let offsetX = random(-weight/2, weight/2);
        let offsetY = random(-weight/2, weight/2);
        target.strokeWeight(random(1, 3));
        target.point(x + offsetX, y + offsetY);
      }
    } else if (type === 'Dots') {
      target.noStroke();
      target.fill(target.strokeColor);
      target.circle(x, y, weight / 2);
    } else if (type === 'Calligraphy') {
      target.strokeWeight(2);
      for(let j = 0; j < weight; j++){
        target.point(x + j, y - j);
      }
    } else if (type === 'Paint Brush') {
      let c = target.strokeColor;
      target.stroke(red(c), green(c), blue(c), 40);
      target.strokeWeight(1);
      for(let j = 0; j < weight; j += 2){
        target.line(x + j, y, x + j, y + 5);
      }
    } else if (type === 'Soft Glow') {
      let c = target.strokeColor;
      target.noStroke();
      for(let r = weight; r > 0; r -= 5) {
        target.fill(red(c), green(c), blue(c), 15);
        target.circle(x, y, r);
      }
    }
  }
}

function mousePressed() {
  startX = mouseX;
  startY = mouseY;
}

function mouseReleased() {
  if (straightLineTool.checked() && mouseX > uiWidth) {
    applyStyles(canvasLayer);
    canvasLayer.line(startX, startY, mouseX, mouseY);
  }
}

function applyStyles(target) {
  let c;
  if (rainbowMode.checked()) {
    target.colorMode(HSB, 360, 100, 100);
    c = target.color(hueValue, 80, 90);
    hueValue = (hueValue + 2) % 360;
  } else {
    target.colorMode(RGB);
    c = colorPicker.color();
  }
  target.stroke(c);
  target.strokeColor = c;
  target.strokeWeight(thicknessSlider.value());
  target.strokeCap(PROJECT);
}