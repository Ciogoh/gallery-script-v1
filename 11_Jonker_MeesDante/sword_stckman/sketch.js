let swordModel;
let armAngle = 0;
let bodyLean = 0;
let swingMode = false;
let trail = [];

let swordColorPicker, stickmanColorPicker, bgColorPicker;

function preload() {
  swordModel = loadModel('Freedom sworn.stl', true);
}

function setup() {
  createCanvas(600, 600, WEBGL);

  let gui = createDiv().position(20, 20).style('color', 'white').style('background', 'rgba(0,0,0,0.5)').style('padding', '15px').style('border-radius', '10px');
  
  let swingBtn = createButton('⚡ TOGGLE COMBAT MODE').parent(gui);
  swingBtn.style('background', '#ffcc00').style('font-weight', 'bold');
  swingBtn.mousePressed(() => swingMode = !swingMode);

  createDiv('<br>Sword Glow:').parent(gui);
  swordColorPicker = createColorPicker('#00f2ff').parent(gui);

  createDiv('Armor Color:').parent(gui);
  stickmanColorPicker = createColorPicker('#ffffff').parent(gui);

  createDiv('Dojo Background:').parent(gui);
  bgColorPicker = createColorPicker('#1a1a1a').parent(gui);
}

function draw() {
  background(bgColorPicker.color());
  
  // Dynamic Lighting
  ambientLight(50);
  directionalLight(255, 255, 255, 0, 1, -1);
  pointLight(red(swordColorPicker.color()), green(swordColorPicker.color()), blue(swordColorPicker.color()), 0, 0, 50);
  
  orbitControl();

  // --- ANIMATION LOGIC ---
  let idleBreathing = sin(frameCount * 0.05) * 0.05;
  
  if (swingMode) {
    armAngle = sin(frameCount * 0.2) * (PI / 2.5) - PI/6;
    bodyLean = sin(frameCount * 0.2) * 0.1; // Lean torso into the swing
  } else {
    armAngle = -PI/6 + idleBreathing;
    bodyLean = idleBreathing;
  }

  // --- ENVIRONMENT ---
  push();
  translate(0, 180, 0);
  fill(40);
  box(1000, 10, 1000); // Floor
  pop();

  // --- STICKMAN ASSEMBLY ---
  push();
    translate(0, 20, 0);
    rotateX(bodyLean); // Torso leaning
    
    fill(stickmanColorPicker.color());
    noStroke();

    // Torso
    push();
      translate(0, 40, 0);
      cylinder(6, 100);
    pop();

    // Head (with a small "visor" look)
    push();
      translate(0, -30, 0);
      sphere(22);
      fill(0);
      translate(0, 0, 15);
      box(30, 5, 10); // Visor
    pop();

    // Arms & Sword
    drawTwoHandedArms(armAngle);
  pop();

  // Legs (Static but positioned for balance)
  drawLeg(-20, 100, 0.4); 
  drawLeg(25, 100, -0.3, 20); // One leg slightly back
}

function drawTwoHandedArms(angle) {
  let gripX = 0;
  let gripY = 60;
  let gripZ = 0;

  // Left Arm
  push();
    translate(-12, -10, 0);
    rotateX(angle);
    rotateZ(PI/6);
    translate(0, 35, 0);
    cylinder(4, 75);
  pop();

  // Right Arm & Sword
  push();
    translate(12, -10, 0);
    rotateX(angle);
    rotateZ(-PI/6);
    
    // Upper Arm
    push();
      translate(0, 35, 0);
      cylinder(4, 75);
    pop();

    // Hand/Grip Point
    translate(0, 75, 0); 
    
    // SWORD
    push();
      rotateX(HALF_PI); 
      translate(0, -50, 0); 
      
      // Sword Material
      emissiveMaterial(swordColorPicker.color());
      specularMaterial(255);
      shininess(100);
      if (swordModel) model(swordModel);
    pop();
  pop();
}

function drawLeg(x, y, angle, z = 0) {
  push();
  translate(x, y, z);
  rotateZ(angle);
  translate(0, 35, 0);
  fill(stickmanColorPicker.color());
  cylinder(5, 80);
  pop();
}