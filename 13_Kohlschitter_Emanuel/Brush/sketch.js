let paletteUI; 
let paperTextureImg;

// Brush State
let currentR = 0;
let currentG = 174;
let currentB = 239; 

// SLIDER VARIABLES
let brushSize = 40;       
let brushWetness = 0.5;   

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); 
  
  colorMode(RGB, 255);
  
  // 1. Generate Paper Texture
  paperTextureImg = createGraphics(width, height);
  generatePaper(paperTextureImg);
  
  // 2. Initialize UI
  paletteUI = new PaletteHub();
  
  // 3. Background
  background(255); 
  image(paperTextureImg, 0, 0);
}

function draw() {
  // Check if we are interacting with UI or Canvas
  if (mouseIsPressed && mouseY > paletteUI.height + 20) {
    paintStroke();
  } else if (mouseIsPressed) {
    paletteUI.updateSliders(mouseX, mouseY);
  }

  // Draw UI on top
  blendMode(BLEND);
  paletteUI.display();
}

function mousePressed() {
  if (mouseY < paletteUI.height + 20) {
    paletteUI.checkClick(mouseX, mouseY);
  }
}

// --- THE ENGINE (Refined for Better Color Mixing) ---
function paintStroke() {
  // We use MULTIPLY because it simulates subtractive pigment mixing.
  // However, we must use LIGHTER colors to prevent instant black.
  blendMode(MULTIPLY); 

  let distMoved = dist(mouseX, mouseY, pmouseX, pmouseY);
  
  // Interpolation steps
  let steps = max(1, floor(distMoved / 3)); 
  
  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let cx = lerp(pmouseX, mouseX, t);
    let cy = lerp(pmouseY, mouseY, t);
    
    // Density calculation
    let density = map(brushWetness, 0, 1, 10, 20);
    
    for (let j = 0; j < density; j++) {
      
      // Calculate Spread
      let sd = map(brushWetness, 0, 1, 5, brushSize * 1.2);
      
      let xOff = randomGaussian(0, sd);
      let yOff = randomGaussian(0, sd);
      
      // Constrain spread
      let maxSpread = brushSize * (1 + brushWetness * 2);
      xOff = constrain(xOff, -maxSpread, maxSpread);
      yOff = constrain(yOff, -maxSpread, maxSpread);
      
      let x = cx + xOff;
      let y = cy + yOff;
      
      // Size variation based on distance from center
      let distFromCenter = dist(0, 0, xOff, yOff);
      let sizeScale = map(distFromCenter, 0, maxSpread, 1.2, 0.1);
      
      // Add a little randomness to size for organic feel
      let finalSize = brushSize * 0.5 * sizeScale * random(0.8, 1.2);
      
      drawWetShape(x, y, finalSize);
    }
  }
}

function drawWetShape(x, y, size) {
  push();
  translate(x, y);
  rotate(random(TWO_PI)); 
  
  // --- THE COLOR FIX ---
  // 1. Water Dilution:
  // Instead of painting with pure Red (255,0,0), we paint with a "Tint" (255, 200, 200).
  // When these tints overlap in Multiply mode, they saturate into the true color.
  let dilution = 0.85; // 0 = Pure Color, 1 = White. 
  
  let r = lerp(currentR, 255, dilution);
  let g = lerp(currentG, 255, dilution);
  let b = lerp(currentB, 255, dilution);

  // 2. Pigment Jitter:
  // Real paint isn't a solid hex code. It has impurities. 
  // We slightly jitter the RGB values per droplet to create "optical blending."
  let jitter = 15;
  r += random(-jitter, jitter);
  g += random(-jitter, jitter);
  b += random(-jitter, jitter);
  
  // 3. Opacity
  // Keep this low. Since we are using "Diluted" colors (whiter), 
  // we can afford slightly higher opacity than before without it getting too dark.
  let alphaVal = 10; 

  fill(r, g, b, alphaVal);
  
  // The "Coffee Ring" Effect:
  // The edge of a water drop has more pigment. 
  // We make the stroke slightly darker (less diluted) than the fill.
  let strokeR = lerp(currentR, 255, dilution * 0.6); // Less diluted
  let strokeG = lerp(currentG, 255, dilution * 0.6);
  let strokeB = lerp(currentB, 255, dilution * 0.6);
  
  stroke(strokeR, strokeG, strokeB, alphaVal * 2);
  strokeWeight(0.5);
  
  beginShape();
  // Organic shape logic
  for (let a = 0; a < TWO_PI; a += 0.5) {
    let rBase = size;
    let n = noise(x*0.1 + cos(a), y*0.1 + sin(a), frameCount * 0.01);
    let rad = rBase * map(n, 0, 1, 0.6, 1.4);
    curveVertex(rad * cos(a), rad * sin(a));
  }
  endShape(CLOSE);
  pop();
}

// --- UI CLASS ---
class PaletteHub {
  constructor() {
    this.height = 150; 
    this.colors = [
      {r: 255, g: 0, b: 144, name: "Magenta"}, 
      {r: 220, g: 20, b: 60, name: "Crimson"},
      {r: 255, g: 100, b: 80, name: "Coral"},
      {r: 255, g: 165, b: 0, name: "Orange"},
      {r: 255, g: 242, b: 0, name: "Yellow"},
      {r: 204, g: 119, b: 34, name: "Ochre"}, 
      {r: 154, g: 205, b: 50, name: "Lime"},
      {r: 34, g: 139, b: 34, name: "Sap Green"},
      {r: 0, g: 140, b: 100, name: "Viridian"},
      {r: 0, g: 174, b: 239, name: "Cyan"}, 
      {r: 0, g: 100, b: 200, name: "Cobalt"},
      {r: 75, g: 0, b: 130, name: "Indigo"},
      {r: 138, g: 43, b: 226, name: "Violet"},
      {r: 101, g: 67, b: 33, name: "Burnt Umber"},
      {r: 112, g: 128, b: 144, name: "Paynes Gray"},
      {r: 40, g: 40, b: 40, name: "Black"}      
    ];
    this.sliders = [
      { label: "Size", min: 10, max: 80, val: 40, x: 0, y: 90, w: 180 },
      { label: "Spread / Wetness", min: 0.0, max: 1.0, val: 0.5, x: 0, y: 90, w: 180 }
    ];
    this.buttons = [
      { label: "Clear", action: "CLEAR", x: 0, y: 100, w: 80, h: 30 },
      { label: "Save PNG", action: "SAVE", x: 0, y: 100, w: 100, h: 30 }
    ];
  }

  display() {
    noStroke(); fill(245); rect(0, 0, width, this.height);
    fill(200); rect(0, this.height, width, 2);

    // Colors
    let panSize = 40; let gap = 10;
    let startX = (width - (this.colors.length * (panSize + gap))) / 2; 
    for (let i = 0; i < this.colors.length; i++) {
      let c = this.colors[i];
      let x = startX + i * (panSize + gap);
      let y = 15; c.x = x; c.y = y;
      
      stroke(200); fill(255); rect(x, y, panSize, panSize, 6);
      noStroke(); fill(c.r, c.g, c.b); ellipse(x+panSize/2, y+panSize/2, panSize*0.7);
      if (currentR === c.r && currentG === c.g && currentB === c.b) {
        stroke(50); strokeWeight(3); noFill(); ellipse(x+panSize/2, y+panSize/2, panSize*0.85);
      }
    }

    // Sliders
    let sliderStartX = width/2 - 250;
    for (let i = 0; i < this.sliders.length; i++) {
      let s = this.sliders[i];
      if (i === 0) brushSize = s.val;
      if (i === 1) brushWetness = s.val;
      
      let sx = sliderStartX + i * (s.w + 60); let sy = 90; s.x = sx; s.y = sy;
      noStroke(); fill(80); textAlign(LEFT, BOTTOM); textSize(12); text(s.label, sx, sy - 8);
      stroke(200); strokeWeight(4); line(sx, sy, sx + s.w, sy);
      let knobX = map(s.val, s.min, s.max, sx, sx + s.w);
      stroke(100); strokeWeight(1); fill(255); circle(knobX, sy, 15);
    }
    
    // Buttons
    let btnStartX = width/2 + 250;
    for(let i=0; i<this.buttons.length; i++){
      let b = this.buttons[i];
      let bx = btnStartX + i * (b.w + 20); let by = 80; b.x = bx; b.y = by;
      stroke(200); fill(255); rect(bx, by, b.w, b.h, 5);
      noStroke(); fill(80); textAlign(CENTER, CENTER); text(b.label, bx + b.w/2, by + b.h/2);
    }
  }

  checkClick(mx, my) {
    let panSize = 40;
    for (let c of this.colors) {
      if (mx > c.x && mx < c.x + panSize && my > c.y && my < c.y + panSize) {
        currentR = c.r; currentG = c.g; currentB = c.b;
      }
    }
    for(let b of this.buttons){
      if(mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h){
        if(b.action === "CLEAR") { background(255); image(paperTextureImg, 0, 0); }
        if(b.action === "SAVE") { saveCanvas("watercolor_studio", "png"); }
      }
    }
  }

  updateSliders(mx, my) {
    for (let s of this.sliders) {
      if (mx > s.x - 20 && mx < s.x + s.w + 20 && my > s.y - 20 && my < s.y + 40) {
        let n = map(mx, s.x, s.x + s.w, s.min, s.max);
        s.val = constrain(n, s.min, s.max);
      }
    }
  }
}

// --- TEXTURE ---
function generatePaper(pg) {
  pg.noStroke();
  for (let i = 0; i < width * height * 0.1; i++) {
    pg.fill(0, 5); pg.rect(random(width), random(height), 1, 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  paperTextureImg = createGraphics(width, height);
  generatePaper(paperTextureImg);
  paletteUI = new PaletteHub();
  background(255);
  image(paperTextureImg, 0, 0);
}