let swordModel;
let p1Col, p2Col;

// Game State
let p1Health = 100, p2Health = 100, gameOver = false;
let p1Blocking = false, p2Blocking = false;

// Independent Animation Controllers
let p1Anim = { active: false, type: 'none', progress: 0 };
let p2Anim = { active: false, type: 'none', progress: 0 };
const swingDuration = 18;
const flipDuration = 30;

function preload() {
  swordModel = loadModel('Freedom sworn.stl', true);
}

function setup() {
  createCanvas(800, 600, WEBGL);

  // --- HTML HEALTH BARS (The Fix) ---
  createHealthBarUI(20, "p1-health-fill", "#00f2ff", "PLAYER 1");
  createHealthBarUI(width - 220, "p2-health-fill", "#ff0055", "PLAYER 2");

  // --- PLAYER 1 COMMAND PANEL ---
  let p1Gui = createDiv().position(20, 80).id('p1-gui');
  stylePanel(p1Gui, 'rgba(0, 242, 255, 0.2)');
  p1Gui.html(`<b>P1: WASD</b><hr>[W] Overhead<br>[A] Side<br>[D] Pierce<br>[S] Flip<br>[Q] Defend<hr><div id="p1-status">READY</div>`);
  p1Col = createColorPicker('#00f2ff').parent(p1Gui).style('width', '100%');

  // --- PLAYER 2 COMMAND PANEL ---
  let p2Gui = createDiv().position(width - 200, 80).id('p2-gui');
  stylePanel(p2Gui, 'rgba(255, 0, 85, 0.2)');
  p2Gui.html(`<b>P2: IJKL</b><hr>[I] Overhead<br>[J] Side<br>[L] Pierce<br>[K] Flip<br>[U] Defend<hr><div id="p2-status">READY</div>`);
  p2Col = createColorPicker('#ff0055').parent(p2Gui).style('width', '100%');
}

function createHealthBarUI(x, id, col, label) {
  let container = createDiv().position(x, 20).style('width', '200px').style('background', '#333').style('height', '25px').style('border', '2px solid #000');
  createDiv(label).position(x, 5).style('color', 'white').style('font-family', 'sans-serif').style('font-weight', 'bold');
  createDiv().id(id).parent(container).style('width', '100%').style('height', '100%').style('background', col).style('transition', 'width 0.2s');
}

function keyPressed() {
  if (key === 'r' || key === 'R') resetGame();
  if (gameOver) return;

  // PLAYER 1: WASD + Q
  if (key === 'w' || key === 'W') takeAction(1, 'overhead');
  if (key === 'a' || key === 'A') takeAction(1, 'side');
  if (key === 'd' || key === 'D') takeAction(1, 'pierce');
  if (key === 's' || key === 'S') takeAction(1, 'backflip');
  if (key === 'q' || key === 'Q') {
    p1Blocking = !p1Blocking;
    select('#p1-status').html(p1Blocking ? '<span style="color:#ffcc00">[ DEFENDING ]</span>' : 'READY');
  }

  // PLAYER 2: IJKL + U
  if (key === 'i' || key === 'I') takeAction(2, 'overhead');
  if (key === 'j' || key === 'J') takeAction(2, 'side');
  if (key === 'l' || key === 'L') takeAction(2, 'pierce');
  if (key === 'k' || key === 'K') takeAction(2, 'backflip');
  if (key === 'u' || key === 'U') {
    p2Blocking = !p2Blocking;
    select('#p2-status').html(p2Blocking ? '<span style="color:#ffcc00">[ DEFENDING ]</span>' : 'READY');
  }
}

function draw() {
  background(15);
  lights();
  orbitControl();

  // Floor
  push();
    translate(0, 100, 0);
    fill(30); noStroke();
    box(1000, 2, 800);
  pop();

  updateAnim(p1Anim);
  updateAnim(p2Anim);

  // Character 1 (Left)
  push();
    translate(-120, 0, 0);
    let react1 = (p2Anim.active && p2Anim.type !== 'backflip' && p2Anim.progress > 8 && !p1Blocking && p1Anim.type !== 'backflip') ? sin(PI * (p2Anim.progress/swingDuration)) * 0.2 : 0;
    drawStickman(p1Col.color(), p1Anim, react1, p1Blocking);
  pop();

  // Character 2 (Right)
  push();
    translate(120, 0, 0);
    rotateY(PI);
    let react2 = (p1Anim.active && p1Anim.type !== 'backflip' && p1Anim.progress > 8 && !p2Blocking && p2Anim.type !== 'backflip') ? sin(PI * (p1Anim.progress/swingDuration)) * 0.2 : 0;
    drawStickman(p2Col.color(), p2Anim, react2, p2Blocking);
  pop();
  
  // Update HTML Bars
  select('#p1-health-fill').style('width', max(0, p1Health) + '%');
  select('#p2-health-fill').style('width', max(0, p2Health) + '%');
}

function drawStickman(col, anim, reaction, isBlocking) {
  push();
    let t = anim.progress / (anim.type === 'backflip' ? flipDuration : swingDuration);
    if (anim.active && anim.type === 'backflip') {
      translate(0, sin(t * PI) * -100, 0);
      rotateX(t * TWO_PI);
    }
    rotateZ(reaction);
    fill(col); noStroke();
    cylinder(5, 80);
    translate(0, -55, 0);
    sphere(18);
    
    let armX = 0, armY = 0, armZ = HALF_PI + 0.3, thrust = 0;
    if (isBlocking && !anim.active) {
      armX = -HALF_PI; armZ = 0.5;
    } else if (anim.active && anim.type !== 'backflip') {
      if (anim.type === 'overhead') armX = map(t, 0, 1, -PI, PI/2);
      else if (anim.type === 'side') armY = map(t, 0, 1, -1.8, 1.8);
      else if (anim.type === 'pierce') {
        thrust = map(t, 0, 1, 0, 130);
        if (t > 0.5) thrust = map(t, 0.5, 1, 130, 0);
        armZ = HALF_PI;
      }
    }
    push();
      translate(10 + thrust, 25, 0); rotateX(armX); rotateY(armY);
      push(); rotateZ(armZ); translate(0, 25, 0); cylinder(3, 50); pop();
      translate(45, 10, 0); 
      push();
        rotateY(HALF_PI); rotateZ(HALF_PI); rotateY(PI);
        if (isBlocking) rotateX(HALF_PI);
        translate(0, -40, 0);
        fill(200); if (swordModel) model(swordModel);
      pop();
    pop();
  pop();
}

function takeAction(pNum, type) {
  let myAnim = (pNum === 1) ? p1Anim : p2Anim;
  let oppAnim = (pNum === 1) ? p2Anim : p1Anim;
  let myBlock = (pNum === 1) ? p1Blocking : p2Blocking;
  let oppBlock = (pNum === 1) ? p2Blocking : p1Blocking;

  if (!myAnim.active && !myBlock) {
    myAnim.active = true;
    myAnim.type = type;
    myAnim.progress = 0;
    if (type !== 'backflip' && oppAnim.type !== 'backflip') {
      let dmg = oppBlock ? 2 : 12;
      if (pNum === 1) p2Health -= dmg; else p1Health -= dmg;
      if (p1Health <= 0 || p2Health <= 0) gameOver = true;
    }
  }
}

function stylePanel(el, bg) {
  el.style('background', bg); el.style('padding', '15px');
  el.style('border-radius', '10px'); el.style('color', 'white');
  el.style('font-family', 'sans-serif'); el.style('width', '160px');
  el.style('line-height', '1.4'); el.style('font-size', '12px');
}

function resetGame() {
  p1Health = 100; p2Health = 100; gameOver = false;
  p1Anim.active = false; p2Anim.active = false;
  p1Blocking = false; p2Blocking = false;
  select('#p1-status').html('READY');
  select('#p2-status').html('READY');
}

function updateAnim(a) { if (a.active) { a.progress++; if (a.progress >= (a.type==='backflip'?30:18)) a.active=false; } }