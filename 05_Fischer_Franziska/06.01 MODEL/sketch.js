// ==============================================
// CONFIG
// ==============================================
const USE_FILE = false; 

// ==============================================
// VARIABLES
// ==============================================
let handPose, video, myModel;
let hands = [];
let systemRunning = false;

// STATES: 0=Start, 1=Left, 2=Right, 3=Pinch, 4=EXPLORATION
let appState = 0;

// LOGIC
let holdTimer = 0;
let gestureTimer = 0;
let curtainGap = 0; 
let bgCol = 224; 

// 3D CAM
let zoomZ = -1000; 
let rotX = 0, rotY = 0;
let targetZoom = 0;

// SMOOTHING
let smoothHand = { x: 0, y: 0, pinch: 0 };

function preload() {
  handPose = ml5.handPose();
  if(USE_FILE) myModel = loadModel('fiveHundred.obj', true);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  handPose.detectStart(video, gotHands);
  camera(0, 0, 600, 0, 0, 0, 0, 1, 0);
  
  window.p5Sketch = this; // HTML Verbindung
}

function startLogic() {
  systemRunning = true;
  // Wenn Klick passiert, sind wir nicht mehr im Title, sondern im Intro
  updatePhaseDisplay("02 // INTRO SETUP");
}

function draw() {
  background(bgCol);

  // Solange Title Screen da ist, nichts zeichnen
  if(!systemRunning) return; 

  let handActive = hands.length > 0;

  // --- 1. VISUELLES GRID ---
  if(appState < 4) drawTechGrid();

  // --- 2. 3D SZENE ---
  push();
  if(appState === 4) {
    translate(0, 0, zoomZ);
    rotateY(rotY);
    rotateX(rotX);
  } else {
    rotateY(frameCount * 0.005);
  }
  drawModel();
  pop();

  // --- 3. VORHANG ---
  drawCurtain();

  // --- 4. LOGIK & TEXT ---
  if(handActive) {
    smoothData(hands[0]);
    drawCyberHand(hands[0]); // Hand zeichnen
    runStateMachine();       // Logik abspielen
  } else {
    // Wenn Hand weg ist im Intro
    if(appState < 4) {
      updateUI("LIFT HAND", "To Activate Sensor");
      drawWaitingAnimation();
    }
    holdTimer = 0;
  }
  
  // Update Phase Display basierend auf State
  updatePhaseLogic();
}

// ==============================================
// PHASEN STEUERUNG (NEU)
// ==============================================
function updatePhaseLogic() {
  // Aktualisiert den Text oben links
  if(appState < 4) {
    updatePhaseDisplay("02 // INTRO & SETUP");
  } else {
    updatePhaseDisplay("03 // SHOWCASE EXPLORATION");
  }
}

// ==============================================
// STATE MACHINE
// ==============================================
function runStateMachine() {
  if(gestureTimer > 0) gestureTimer--;
  
  let x = smoothHand.x;
  let d = dist(x, smoothHand.y, 0, 0);

  switch(appState) {
    case 0: // ALIGN
      if(d > 80) {
        updateUI("ALIGN CENTER", "Move Hand to the Circle");
        drawTargetCircle();
        holdTimer = max(0, holdTimer - 0.05);
      } else {
        updateUI("HOLD STILL", "Calibrating Sensor...");
        holdTimer += 0.02;
        drawLoader(smoothHand.x, smoothHand.y, holdTimer);
        
        if(holdTimer >= 1) {
          appState = 1; gestureTimer = 50;
        }
      }
      break;

    case 1: // LEFT
      updateUI("SWIPE LEFT", "Calibrate X-Axis");
      drawArrowHint(-1);
      if(gestureTimer == 0 && x < -150) {
        appState = 2; gestureTimer = 50;
      }
      break;

    case 2: // RIGHT
      updateUI("SWIPE RIGHT", "Confirm X-Axis");
      drawArrowHint(1);
      if(gestureTimer == 0 && x > 150) {
        appState = 3; gestureTimer = 50;
      }
      break;

    case 3: // PINCH
      updateUI("PINCH FINGERS", "Initialize 3D Space");
      drawPinchHint();
      if(gestureTimer == 0 && smoothHand.pinch < 25) {
        // REVEAL!
        appState = 4;
        select('#ui-layer').addClass('hidden'); // Text Mitte ausblenden
      }
      break;

    case 4: // MAIN EXPLORATION
      // Animation Vorhang
      curtainGap = lerp(curtainGap, height * 1.5, 0.03);
      zoomZ = lerp(zoomZ, targetZoom, 0.05);
      
      // Steuerung
      let trY = map(smoothHand.x, -width/2, width/2, -PI, PI);
      let trX = map(smoothHand.y, -height/2, height/2, PI/2, -PI/2);
      let zs = map(smoothHand.pinch, 20, 150, 10, -10);
      
      if(abs(zs) > 2) targetZoom += zs;
      targetZoom = constrain(targetZoom, -500, 200);

      rotY = lerp(rotY, trY, 0.1);
      rotX = lerp(rotX, trX, 0.1);
      break;
  }
}

// ==============================================
// VISUALS
// ==============================================

function drawCyberHand(hand) {
  push();
  resetMatrix();
  ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  
  let blue = color(0, 80, 255);
  let dark = color(20);

  let getP = (i) => {
    let kp = hand.keypoints[i];
    return { 
      x: map(kp.x, 0, 640, width/2, -width/2), 
      y: map(kp.y, 0, 480, -height/2, height/2)
    };
  }

  // Linien
  stroke(0, 40); strokeWeight(1);
  let palm = getP(0);
  let tips = [4,8,12,16,20];
  for(let t of tips) {
    let p = getP(t);
    line(palm.x, palm.y, p.x, p.y);
  }

  // Nodes
  noStroke(); fill(dark);
  for(let i=0; i<21; i++) {
    if(i===8) continue; 
    if(i%4===0 || i===0) { 
       let p = getP(i);
       circle(p.x, p.y, 6);
    }
  }

  // Cursor (Zeigefinger)
  let idx = getP(8);
  noFill(); stroke(blue); strokeWeight(2);
  circle(idx.x, idx.y, 30); 
  line(idx.x-10, idx.y, idx.x+10, idx.y); 
  line(idx.x, idx.y-10, idx.x, idx.y+10);
  
  stroke(blue, 100); strokeWeight(1);
  line(idx.x, idx.y, palm.x, palm.y);

  pop();
}

function drawWaitingAnimation() {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  noFill(); stroke(0, 50); strokeWeight(2);
  let r = 100 + sin(frameCount*0.1) * 20;
  circle(0, 0, r); circle(0, 0, 10);
  pop();
}

function drawTargetCircle() {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  noFill(); stroke(0, 100); strokeWeight(2);
  circle(0,0, 100);
  pop();
}

function drawTechGrid() {
  push(); rotateX(HALF_PI); 
  stroke(200); strokeWeight(1);
  let sz = 1000;
  for(let i=-sz; i<=sz; i+=100) {
    line(i, -sz, i, sz); line(-sz, i, sz, i);
  }
  pop();
}

function drawCurtain() {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  noStroke(); fill(bgCol); 
  if(appState < 4) {
    rect(-width/2, -height/2, width, height);
  } else {
    let gap = curtainGap / 2;
    rect(-width/2, -height/2 - gap, width, height/2); 
    rect(-width/2, 0 + gap, width, height/2);       
  }
  pop();
}

function drawModel() {
  if(USE_FILE && myModel) {
    noStroke(); specularMaterial(255); shininess(50);
    model(myModel);
  } else {
    noStroke(); fill(60); specularMaterial(200); shininess(100);
    push(); rotateZ(PI/4); box(80, 250, 20); pop();
    push(); stroke(100); noFill(); sphere(100); pop();
  }
}

function drawLoader(x, y, p) {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  noFill(); stroke(0, 100, 255); strokeWeight(6);
  let ang = map(p, 0, 1, -HALF_PI, TWO_PI-HALF_PI);
  arc(x, y, 100, 100, -HALF_PI, ang);
  pop();
}

function drawArrowHint(dir) {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  let anim = (frameCount % 40) * 3 * dir;
  stroke(0); strokeWeight(3); noFill();
  translate(0, 80); translate(anim, 0);
  if(dir === -1) { line(30,0,-30,0); line(-30,0,-15,-15); line(-30,0,-15,15); }
  else { line(-30,0,30,0); line(30,0,15,-15); line(30,0,15,15); }
  pop();
}

function drawPinchHint() {
  push(); resetMatrix(); ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  let gap = map(sin(frameCount*0.2), -1, 1, 10, 40);
  noStroke(); fill(0); translate(0, 80);
  circle(-gap, 0, 10); circle(gap, 0, 10);
  stroke(0); strokeWeight(1); line(-gap, 0, gap, 0);
  pop();
}

// ==============================================
// HELPERS
// ==============================================
function updateUI(main, sub) {
  select('#instruction-main').html(main);
  select('#instruction-sub').html(sub);
}

function updatePhaseDisplay(txt) {
  select('#phase-text').html(txt);
}

function smoothData(hand) {
  let idx = hand.keypoints[8];
  let thm = hand.keypoints[4];
  let tx = map(idx.x, 0, 640, width/2, -width/2);
  let ty = map(idx.y, 0, 480, -height/2, height/2);
  let tp = dist(idx.x, idx.y, thm.x, thm.y);
  
  smoothHand.x = lerp(smoothHand.x, tx, 0.2);
  smoothHand.y = lerp(smoothHand.y, ty, 0.2);
  smoothHand.pinch = lerp(smoothHand.pinch, tp, 0.2);
}

function gotHands(results) { hands = results; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }