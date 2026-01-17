let myFont;
let textPoints = [];
let typeInput, distortSlider, speedSlider, sizeSlider, fillToggle;
let bgColorPicker, textColorPicker;
let uiWidth = 220;
let fontLoaded = false;

function preload() {
  // Reliable font URL
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/fonts/HTML-CSS/TeX/otf/MathJax_Main-Regular.otf', 
    () => { fontLoaded = true; }, 
    () => { fontLoaded = false; }
  );
}

function setup() {
  // THE FIX: We check if the library exists. If it does, use SVG mode.
  if (window.SVG) {
    createCanvas(windowWidth, windowHeight, SVG);
    console.log("Renderer: SVG (Vector)");
  } else {
    createCanvas(windowWidth, windowHeight, P2D);
    console.log("Renderer: P2D (Pixel) - Library Missing!");
  }
  
  setupUI();
  updateTextPoints();
}

function setupUI() {
  typeInput = createInput('KINETIC');
  typeInput.position(20, 30);
  typeInput.input(updateTextPoints);

  fillToggle = createCheckbox(' FILL MODE', false);
  fillToggle.position(20, 60);

  createP('COLORS').position(20, 85).style('font-size', '10px').style('font-weight', 'bold');
  textColorPicker = createColorPicker('#000000');
  textColorPicker.position(20, 115);
  bgColorPicker = createColorPicker('#ffffff');
  bgColorPicker.position(100, 115);

  createP('DISTORTION').position(20, 150).style('font-size', '10px');
  distortSlider = createSlider(0, 150, 50);
  distortSlider.position(20, 175);

  createP('SPEED').position(20, 200).style('font-size', '10px');
  speedSlider = createSlider(0, 10, 2, 0.1);
  speedSlider.position(20, 225);

  createP('SIZE').position(20, 250).style('font-size', '10px');
  sizeSlider = createSlider(40, 300, 150);
  sizeSlider.position(20, 275);
  sizeSlider.input(updateTextPoints);

  // EXPORT BUTTON
  let saveSvg = createButton('DOWNLOAD SVG');
  saveSvg.position(20, 320);
  saveSvg.style('background-color', '#4CAF50');
  saveSvg.style('color', 'white');
  
  saveSvg.mousePressed(() => {
    // If we are in SVG mode, this saves a .svg
    // If we are in P2D mode, this saves a .png
    save("my_vector_art.svg"); 
  });
}

function updateTextPoints() {
  if (fontLoaded) {
    textPoints = myFont.textToPoints(typeInput.value(), 0, 0, sizeSlider.value(), {
      sampleFactor: 0.15
    });
  }
}

function draw() {
  // Essential for SVG: background() clears the previous vector paths
  background(bgColorPicker.color());
  
  // Draw Sidebar
  push();
  fill(240);
  noStroke();
  rect(0, 0, uiWidth, height);
  pop();

  if (!fontLoaded || textPoints.length === 0) return;

  push();
  translate(uiWidth + (width - uiWidth) / 4, height / 2);
  
  if (fillToggle.checked()) {
    fill(textColorPicker.color());
    noStroke();
  } else {
    noFill();
    stroke(textColorPicker.color());
    strokeWeight(2);
  }

  

  beginShape();
  for (let i = 0; i < textPoints.length; i++) {
    let p = textPoints[i];
    let t = frameCount * (speedSlider.value() * 0.01);
    
    let offX = noise(p.x * 0.01, p.y * 0.01, t) * distortSlider.value();
    let offY = sin(p.x * 0.02 + t) * (distortSlider.value() * 0.5);

    vertex(p.x + offX, p.y + offY);

    if (i > 0) {
      let prev = textPoints[i-1];
      if (dist(prev.x, prev.y, p.x, p.y) > 20) {
        endShape(fillToggle.checked() ? CLOSE : OPEN);
        beginShape();
      }
    }
  }
  endShape(fillToggle.checked() ? CLOSE : OPEN);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
