let swordModel;
let textInput;
let textGraphics; 

let swordY = -400; 
let velocity = 0;
let gravity = 0.6; 
let isFalling = false;
let isStuck = false;

let particles = [];
let exploded = false;
const numParticles = 60;

let swordColorPicker, bgColorPicker, textColorPicker;

function preload() {
  swordModel = loadModel('Freedom sworn.stl', true);
}

function setup() {
  createCanvas(600, 600, WEBGL);
  
  textGraphics = createGraphics(400, 100);
  textGraphics.textAlign(CENTER, CENTER);
  textGraphics.textSize(60);
  textGraphics.textFont('Arial');

  // --- UI PANEL ---
  let gui = createDiv().position(20, 20).style('color', 'white').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  createDiv('<strong>Target Text:</strong>').parent(gui);
  textInput = createInput('BOOM').parent(gui);

  let dropBtn = createButton('DROP & EXPLODE').parent(gui);
  dropBtn.style('margin-top', '10px').parent(gui).mousePressed(startDrop);

  // --- GIF BUTTON ---
  let gifBtn = createButton('SAVE GIF (3s)').parent(gui);
  gifBtn.style('margin-left', '5px').style('background', '#ffcc00').parent(gui).mousePressed(recordGif);

  let resetBtn = createButton('Reset').parent(gui);
  resetBtn.style('margin-top', '5px').style('display', 'block').parent(gui).mousePressed(resetScene);

  createDiv('<br><strong>Text Color:</strong>').parent(gui);
  textColorPicker = createColorPicker('#DC2828').parent(gui);

  createDiv('<strong>Sword Color:</strong>').parent(gui);
  swordColorPicker = createColorPicker('#C0C0C0').parent(gui);

  createDiv('<strong>Background:</strong>').parent(gui);
  bgColorPicker = createColorPicker('#141414').parent(gui);
}

function draw() {
  background(bgColorPicker.color());
  lights();
  orbitControl();

  textGraphics.clear();
  textGraphics.fill(textColorPicker.color());
  textGraphics.text(textInput.value(), 200, 50);

  if (!exploded) {
    push();
    if (isStuck && frameCount % 2 === 0) translate(random(-2, 2), 0, random(-2, 2));
    texture(textGraphics);
    noStroke();
    translate(0, 0, 1); 
    plane(400, 100); 
    pop();
  } else {
    for (let p of particles) {
      p.update();
      p.display();
    }
  }

  if (isFalling && !isStuck) {
    velocity += gravity;
    swordY += velocity;
    if (swordY >= 0) { 
      swordY = 0;
      isStuck = true;
      isFalling = false;
      velocity = 0;
      triggerExplosion();
    }
  }

  push();
  translate(0, swordY, 0); 
  rotateX(HALF_PI); 
  noStroke();
  fill(swordColorPicker.color());
  specularMaterial(250);
  if (swordModel) model(swordModel);
  pop();
}

function recordGif() {
  // Resets the scene, starts the drop, and captures 3 seconds
  resetScene();
  startDrop();
  saveGif('sword_explosion.gif', 3); 
}

function triggerExplosion() {
  exploded = true;
  let pColor = textColorPicker.color();
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(pColor));
  }
}

function startDrop() {
  isFalling = true;
}

function resetScene() {
  swordY = -400;
  velocity = 0;
  isFalling = false;
  isStuck = false;
  exploded = false;
  particles = [];
}

class Particle {
  constructor(c) {
    this.pos = createVector(random(-100, 100), random(-10, 10), 0);
    this.vel = p5.Vector.random3D().mult(random(4, 12));
    this.size = random(3, 10);
    this.life = 255;
    this.color = c;
  }
  update() {
    this.pos.add(this.vel);
    this.life -= 5;
  }
  display() {
    if (this.life > 0) {
      push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      let r = red(this.color);
      let g = green(this.color);
      let b = blue(this.color);
      fill(r, g, b, this.life);
      noStroke();
      box(this.size);
      pop();
    }
  }
}