let inputField;
let pg; 
let textX = 0;
let angle = 0;
let currentSpeed = 1;
let targetPosX = 0;
let targetPosY = 0;
let currentPosX = 0;
let currentPosY = 0;
let isMoving = true;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Testo aggiornato come richiesto
  inputField = createInput('HELLO KITTY 🎀');
  inputField.position(25, 25);
  inputField.size(200);
  inputField.style('background-color', '#fff347'); 
  inputField.style('border', '3px solid #ffaa00');
  inputField.style('border-radius', '20px');
  inputField.style('padding', '10px');
  inputField.style('font-weight', 'bold');

  pg = createGraphics(1600, 300); 
}

function draw() {
  background(255, 192, 203); 

  // --- 1. CONTROLLO VELOCITÀ ---
  let targetSpeed = map(mouseX, 0, width, 0.8, 8); 
  if (mouseX <= 0) targetSpeed = 1.5;
  currentSpeed = lerp(currentSpeed, targetSpeed, 0.1);

  // --- 2. CONTROLLO POSIZIONE ---
  targetPosX = map(mouseX, 0, width, -width/3, width/3);
  targetPosY = map(mouseY, 0, height, -height/3, height/3);
  currentPosX = lerp(currentPosX, targetPosX, 0.05);
  currentPosY = lerp(currentPosY, targetPosY, 0.05);

  // --- LOGICA TESTO ---
  pg.clear(); 
  let txt = inputField.value().toUpperCase();
  let scrollingText = txt + "         "; 
  pg.fill(255, 0, 110); 
  pg.textSize(85);
  pg.textFont('Arial Black');
  pg.textAlign(LEFT, CENTER);
  let tw = pg.textWidth(scrollingText);
  
  pg.text(scrollingText + scrollingText, textX, pg.height/2);
  
  if (isMoving) {
    textX -= (4.5 * currentSpeed); 
    if (textX <= -tw) textX = 0;
  }

  // --- LUCI ---
  ambientLight(180);
  pointLight(255, 255, 255, 200, -200, 400);
  directionalLight(255, 255, 255, 0, 1, -1);

  // --- POSIZIONAMENTO E ROTAZIONE ---
  translate(currentPosX, currentPosY, 0);
  
  let autoFloat = sin(frameCount * 0.05) * 15;
  translate(0, autoFloat, 0);
  
  rotateY(angle);
  
  if (isMoving) {
    angle -= (0.015 * currentSpeed); 
  }

  noStroke();

  // --- DISEGNO HELLO KITTY ---
  push();
  fill(255); scale(1.3, 1, 0.9); sphere(99);
  pop();

  push();
  texture(pg); scale(1.305, 1.005, 0.905); sphere(100);
  pop();

  drawEar(-75, -85, -0.2);
  drawEar(75, -85, 0.2);
  drawBow();
}

function mousePressed() {
  isMoving = !isMoving;
}

function drawEar(x, y, zRot) {
  push();
  translate(x, y, 0);
  rotateZ(zRot); rotateX(PI);
  fill(255); cone(35, 70);
  pop();
}

function drawBow() {
  fill(255, 0, 60);
  push();
  translate(65, -75, 75);
  rotateZ(0.4);
  sphere(18); 
  push(); translate(-30, 0, 0); ellipsoid(30, 25, 15); pop(); 
  push(); translate(30, 0, 0); ellipsoid(30, 25, 15); pop();  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}