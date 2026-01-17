let swordModel;
let rotationAxis = 'Y';
let speedSlider;
let swordColorPicker;
let bgColorPicker;

function preload() {
  swordModel = loadModel('Freedom sworn.stl', true);
}

function setup() {
  createCanvas(600, 600, WEBGL);

  // --- UI PANEL ---
  let gui = createDiv().position(20, 20).style('color', 'white').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  // Axis Buttons
  gui.html('<strong>Rotation Axis:</strong><br>', true);
  createButton('X').parent(gui).mousePressed(() => rotationAxis = 'X');
  createButton('Y').parent(gui).mousePressed(() => rotationAxis = 'Y');
  createButton('Z').parent(gui).mousePressed(() => rotationAxis = 'Z');

  // Color Pickers
  createDiv('<br><strong>Sword Color:</strong>').parent(gui);
  swordColorPicker = createColorPicker('#C0C0C0').parent(gui);

  createDiv('<strong>Background:</strong>').parent(gui);
  bgColorPicker = createColorPicker('#141414').parent(gui);

  // Speed Slider
  createDiv('<br><strong>Rotation Speed:</strong>').parent(gui);
  speedSlider = createSlider(0, 0.2, 0.05, 0.01).parent(gui);
}

function draw() {
  background(bgColorPicker.color());
  
  // Lighting
  lights();
  pointLight(255, 255, 255, 0, -200, 200);
  
  orbitControl();

  // Rotation Logic
  let speed = speedSlider.value();
  if (rotationAxis === 'X') rotateX(frameCount * speed);
  else if (rotationAxis === 'Y') rotateY(frameCount * speed);
  else if (rotationAxis === 'Z') rotateZ(frameCount * speed);

  // Apply Colors to the Model
  push();
    noStroke();
    
    // Use the color from our picker
    let c = swordColorPicker.color();
    fill(c);
    
    // Material settings for a metallic look
    specularMaterial(255); 
    shininess(50);
    
    model(swordModel);
  pop();
}