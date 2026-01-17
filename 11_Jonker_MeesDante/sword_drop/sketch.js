let swordModel;
let swordY = -400; 
let velocity = 0;
let gravity = 0.6; 
let isFalling = false;
let isStuck = false;

let swordColorPicker;
let bgColorPicker;

function preload() {
  swordModel = loadModel('Freedom sworn.stl', true);
}

function setup() {
  createCanvas(600, 600, WEBGL);

  let gui = createDiv().position(20, 20).style('color', 'white').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  let dropBtn = createButton('DROP SWORD').parent(gui);
  dropBtn.mousePressed(startDrop);

  let resetBtn = createButton('Reset').parent(gui);
  resetBtn.mousePressed(resetScene);

  createDiv('<br><strong>Sword Color:</strong>').parent(gui);
  swordColorPicker = createColorPicker('#C0C0C0').parent(gui);

  createDiv('<strong>Background:</strong>').parent(gui);
  bgColorPicker = createColorPicker('#141414').parent(gui);
}

function draw() {
  background(bgColorPicker.color());
  lights();
  pointLight(255, 255, 255, 200, -200, 200);
  
  orbitControl();

  // --- TARGET BALL ---
  push();
  fill(220, 40, 40);
  noStroke();
  if (isStuck && frameCount % 2 === 0) {
    translate(random(-1, 1), 0, random(-1, 1));
  }
  sphere(50);
  pop();

  // --- FALLING LOGIC ---
  if (isFalling && !isStuck) {
    velocity += gravity;
    swordY += velocity;
    
    // Impact detection: Ball top is at -50. 
    // We stop at -55 so the horizontal blade looks resting on/in the ball.
    if (swordY >= -55) {
      swordY = -55;
      isStuck = true;
      isFalling = false;
      velocity = 0;
    }
  }

  // --- RENDER SWORD ---
  push();
  translate(0, swordY, 0); 
  
  // OPTION 1: 90 DEGREE ROTATION (HORIZONTAL)
  rotateX(HALF_PI); 
  
  // Optional: rotateY(HALF_PI) if you want the tip 
  // pointing towards/away from you instead of left/right.
  
  noStroke();
  fill(swordColorPicker.color());
  specularMaterial(250);
  shininess(100);
  
  model(swordModel);
  pop();
}

function startDrop() {
  swordY = -400;
  velocity = 0;
  isFalling = true;
  isStuck = false;
}

function resetScene() {
  swordY = -400;
  velocity = 0;
  isFalling = false;
  isStuck = false;
}