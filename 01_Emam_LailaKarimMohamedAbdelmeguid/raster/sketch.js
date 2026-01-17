let img;
let input, shapeSelect, resSlider, bgPicker, shapePicker, colorModeRadio, exportBtn;

function setup() {
  let cnv = createCanvas(600, 600);
  background(240);

  let body = select('body');
  body.style('font-family', 'sans-serif');
  body.style('background-color', '#f0f0f0');

  let x = 20, y = 660; 

  // Row 1: Upload and Shape Selection
  createP("1. Upload Image:").position(x, y - 40).style('font-weight', 'bold');
  input = createFileInput(handleFile);
  input.position(x, y);

  createP("2. Shape Type:").position(x + 200, y - 40).style('font-weight', 'bold');
  shapeSelect = createSelect();
  shapeSelect.position(x + 200, y);
  shapeSelect.option('circle');
  shapeSelect.option('heart');
  shapeSelect.option('cross');
  shapeSelect.option('square');
  shapeSelect.option('star');
  shapeSelect.changed(() => { if(img) redraw(); });

  // Row 2: Resolution and Colors
  let row2Y = y + 75;
  
  createP("3. Resolution (Size):").position(x, row2Y - 40).style('font-weight', 'bold');
  resSlider = createSlider(5, 50, 15, 1);
  resSlider.position(x, row2Y);
  resSlider.input(() => { if(img) redraw(); });

  createP("4. Background Color:").position(x + 200, row2Y - 40).style('font-weight', 'bold');
  bgPicker = createColorPicker('#F2E205');
  bgPicker.position(x + 200, row2Y);
  bgPicker.input(() => { if(img) redraw(); });

  // Row 3: Shape Coloring and Export
  let row3Y = row2Y + 80;

  createP("5. Color Style:").position(x, row3Y - 40).style('font-weight', 'bold');
  colorModeRadio = createRadio();
  colorModeRadio.option('original', 'Photo Color  ');
  colorModeRadio.option('custom', 'Custom Color');
  colorModeRadio.selected('original');
  colorModeRadio.position(x, row3Y);
  colorModeRadio.input(() => { if(img) redraw(); });

  shapePicker = createColorPicker('#000000');
  shapePicker.position(x + 220, row3Y - 5);
  shapePicker.input(() => { if(img) redraw(); });

  exportBtn = createButton('DOWNLOAD PNG');
  exportBtn.position(x + 320, row3Y - 10);
  exportBtn.style('font-weight', 'bold');
  exportBtn.style('padding', '10px 20px');
  exportBtn.style('cursor', 'pointer');
  exportBtn.mousePressed(() => saveCanvas('raster_art', 'png'));

  noLoop();
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      img.resize(width, 0);
      if (img.height > height) img.resize(0, height);
      redraw();
    });
  }
}

function draw() {
  background(bgPicker.color());
  
  if (!img) {
    textAlign(CENTER, CENTER);
    fill(150);
    text("Upload a PNG to begin", width/2, height/2);
    return;
  }

  img.loadPixels();
  let res = resSlider.value();

  for (let py = 0; py < img.height; py += res) {
    for (let px = 0; px < img.width; px += res) {
      let i = (px + py * img.width) * 4;
      let r = img.pixels[i];
      let g = img.pixels[i+1];
      let b = img.pixels[i+2];
      let a = img.pixels[i+3];

      if (a > 50) { 
        fill(colorModeRadio.value() === 'original' ? color(r, g, b) : shapePicker.color());
        noStroke();
        drawShape(px + res/2, py + res/2, res * 0.9, shapeSelect.value());
      }
    }
  }
}

function drawShape(x, y, size, type) {
  push();
  translate(x, y);
  if (type === 'circle') ellipse(0, 0, size, size);
  if (type === 'square') { rectMode(CENTER); rect(0, 0, size, size); }
  if (type === 'cross') { 
    rectMode(CENTER); 
    rect(0, 0, size, size/3); 
    rect(0, 0, size/3, size); 
  }
  if (type === 'star') {
    beginShape();
    for (let i = 0; i < 10; i++) {
      let r = i % 2 === 0 ? size / 2 : size / 4;
      let angle = PI / 5 * i;
      vertex(r * cos(angle), r * sin(angle));
    }
    endShape(CLOSE);
  }
  if (type === 'heart') {
    beginShape();
    vertex(0, size/4);
    bezierVertex(0, 0, -size/2, 0, -size/2, size/4);
    bezierVertex(-size/2, size/2, 0, size*0.8, 0, size);
    bezierVertex(0, size*0.8, size/2, size/2, size/2, size/4);
    bezierVertex(size/2, 0, 0, 0, 0, size/4);
    endShape(CLOSE);
  }
  pop();
}