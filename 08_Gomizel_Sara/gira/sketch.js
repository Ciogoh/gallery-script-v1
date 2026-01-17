let currentRecordTexture;
let albumTexture;
let stackTextures = [];
let angle = 0;
let recordCenterY = -165;

// Interaction State variables
let showRecordStack = false;

// Animation variables
let spinStartTime = 0;
let isSpinning = false;
let spinDuration = 8000;

// Variabili Audio
let songBlue;
let songRed;
let songGreen;
let songPurple;
let songYellow;
let songOrange;

// Variabili per tracciare il colore dei dischi
let currentRecordColor = "red"; 
let stackColors = ["green", "blue", "yellow", "purple", "orange"];

// Memoria per i secondi di ogni canzone
let trackTimes = {
  "red": 0,
  "green": 0,
  "blue": 0,
  "yellow": 0,
  "purple": 0,
  "orange": 0
};

function createRecordGraphics(r, g, b) {
  let pg = createGraphics(400, 400);
  pg.clear();
  
  // Black Vinyl Disc
  pg.fill(25);
  pg.noStroke();
  pg.ellipse(200, 200, 395, 395);
  
  // Grooves
  pg.stroke(80);
  pg.strokeWeight(2);
  pg.noFill();
  for (let i = 75; i < 190; i += 8) {
    pg.ellipse(200, 200, i * 2, i * 2);
  }
  
  // COLORED LABEL
  pg.fill(r, g, b);
  pg.noStroke();
  pg.ellipse(200, 200, 130, 130);
  
  // Small hole
  pg.fill(0);
  pg.ellipse(200, 200, 10, 10);
  
  return pg;
}

function preload() {
  // *** CARICAMENTO AUDIO ***
  songBlue = loadSound('The Smiths - This Charming Man.mp3');
  songRed = loadSound('Hate It Or Love It.mp3');
  songGreen = loadSound('Gorillaz - Feel Good Inc..mp3');
  songPurple = loadSound('Tyler, The Creator - ARE WE STILL FRIENDS_.mp3');
  songYellow = loadSound('Creep.mp3');
  songOrange = loadSound('Thinkin Bout You.mp3');

  // 1. Initial Main Record (Red)
  currentRecordTexture = createRecordGraphics(220, 20, 20);
  currentRecordTexture.fill(255);
  currentRecordTexture.rectMode(CENTER);
  currentRecordTexture.noStroke();
  currentRecordTexture.rect(200, 200, 80, 10);

  // 2. Stack Textures (Various Colors)
  stackTextures.push(createRecordGraphics(50, 255, 50));  // Green
  stackTextures.push(createRecordGraphics(80, 80, 255));  // Blue
  stackTextures.push(createRecordGraphics(255, 255, 50)); // Yellow
  stackTextures.push(createRecordGraphics(200, 50, 200)); // Purple
  stackTextures.push(createRecordGraphics(255, 100, 0));  // Orange

  // 3. Album Cover Texture
  albumTexture = createGraphics(300, 300);
  albumTexture.background(50, 80, 150);
  albumTexture.stroke(255);
  albumTexture.strokeWeight(15);
  albumTexture.noFill();
  albumTexture.rect(0, 0, 300, 300);
  albumTexture.noStroke();
  albumTexture.fill(255);
  albumTexture.textSize(60);
  albumTexture.textAlign(CENTER, CENTER);
  albumTexture.text("ALBUM", 150, 150);
}

function setup() {
  createCanvas(800, 600, WEBGL);
  angleMode(DEGREES);
  textureMode(NORMAL);
}

function draw() {
  background(240);
  
  // --- CAMERA ---
  camera(0, -150, 850, 0, -100, 0, 0, 1, 0);

  // --- LIGHTING ---
  ambientLight(150);
  directionalLight(255, 255, 255, 0.8, 0, 0, -1);
  directionalLight(255, 255, 255, 0.5, 1, 1, -1);
  pointLight(255, 255, 255, 0, -200, 200);

  // --- ANIMATION LOGIC ---
  if (isSpinning) {
    let timePassed = millis() - spinStartTime;
    let timeLeft = spinDuration - timePassed;

    if (timeLeft > 0) {
      let currentSpeed = map(timeLeft, 0, spinDuration, 0, 20);
      angle -= currentSpeed;
    } else {
      isSpinning = false;
    }
  }

  // --- DRAW ALBUM COVER ---
  push();
  translate(-320, -350, 0);
  rotateY(5);
  texture(albumTexture);
  box(100, 100, 5);
  pop();

  // --- DRAW RECORD STACK ---
  if (showRecordStack) {
    push();
    translate(-320, -280, 0);
    rotateY(5);
    
    for (let i = 0; i < stackTextures.length; i++) {
      push();
      translate(0, i * 110, i * 2);
      texture(stackTextures[i]);
      noStroke();
      plane(130, 130);
      pop();
    }
    pop();
  }

  // --- DRAW TURNTABLE ---
  push();
  translate(100, 0, 0);

    // Base
    push();
    translate(0, 20, 0);
    
    // Base nera
    fill(25);      
    stroke(80);    
    
    box(400, 40, 300);
    pop();

    // Feet
    fill(40);
    noStroke();
    let feetY = 40;
    push(); translate(-180, feetY, -130); cylinder(20, 20); pop();
    push(); translate(180, feetY, -130); cylinder(20, 20); pop();
    push(); translate(180, feetY, 130); cylinder(20, 20); pop();
    push(); translate(-180, feetY, 130); cylinder(20, 20); pop();

    // Platter (Il Piatto)
    push();
    translate(0, 0, 0);
    
    // *** MODIFICA: GRIGIO SCURO ***
    fill(60); 
    stroke(100);
    
    cylinder(140, 10);
    pop();

    // Vertical Record Assembly
    push();
    translate(0, recordCenterY, 0);
    rotateZ(angle);
    rotateX(90);
    
    // Thickness
    fill(20);
    cylinder(130, 5);
    
    // Faces
    push(); translate(0, -2.6, 0); rotateX(90); noStroke();
    texture(currentRecordTexture); plane(260, 260); pop();
    
    push(); translate(0, 2.6, 0); rotateX(90); noStroke();
    texture(currentRecordTexture); plane(260, 260); pop();
    
    pop(); 

    // Center Axle (L'Asticella)
    push();
    translate(0, recordCenterY, 0);
    
    // *** MODIFICA: GRIGIO CHIARO ***
    fill(220); 
    
    sphere(6);
    let pillarLength = -recordCenterY;
    translate(0, pillarLength / 2, 0);
    cylinder(6, pillarLength);
    pop();

    // Buttons
    push();
    translate(-175, -2.5, 100);
    if (isSpinning) fill(0, 255, 0); else fill(50);
    stroke(0);
    box(30, 5, 30);
    pop();

    push();
    translate(-175, -10, 60);
    fill(80);
    stroke(0);
    cylinder(12, 20);
    pop();

  pop();
}

// --- INTERACTION LOGIC ---
function mousePressed() {
  userStartAudio();

  // 1. ALBUM CLICK
  if (mouseX < 250 && mouseY < 150) {
     showRecordStack = !showRecordStack;
     return;
  }
  
  // 2. STACK RECORD CLICK (Swap)
  if (showRecordStack && mouseX < 250 && mouseY >= 150) {
    let stackStartY = 150;
    let recordHeight = 85; 
    let clickedIndex = floor((mouseY - stackStartY) / recordHeight);
    
    if (clickedIndex >= 0 && clickedIndex < stackTextures.length) {
      
      let tempTex = currentRecordTexture;
      currentRecordTexture = stackTextures[clickedIndex];
      stackTextures[clickedIndex] = tempTex;
      
      let tempColor = currentRecordColor;
      currentRecordColor = stackColors[clickedIndex];
      stackColors[clickedIndex] = tempColor;
      
      // Reset stato e ferma tutto
      isSpinning = false;
      angle = 0;
      stopAllSongs();
      
      // Reset del tempo quando metti un nuovo disco
      trackTimes[currentRecordColor] = 0; 
    }
    return;
  }
  
  // 3. TURNTABLE CLICK (Play)
  if (mouseX > 350 && mouseX < 650 && mouseY > 200 && mouseY < 550) {
    spinStartTime = millis();
    isSpinning = true;

    stopAllSongs();
    
    // Trova la canzone corretta e il punto di partenza
    let activeSong = null;
    
    if (currentRecordColor === "blue") activeSong = songBlue;
    else if (currentRecordColor === "red") activeSong = songRed;
    else if (currentRecordColor === "green") activeSong = songGreen;
    else if (currentRecordColor === "purple") activeSong = songPurple;
    else if (currentRecordColor === "yellow") activeSong = songYellow;
    else if (currentRecordColor === "orange") activeSong = songOrange;
    
    if (activeSong != null) {
      let startTime = trackTimes[currentRecordColor];
      let duration = 7;
      
      if (startTime >= activeSong.duration()) {
        startTime = 0;
      }

      activeSong.play(0, 1, 1, startTime, duration);
      trackTimes[currentRecordColor] = startTime + duration;
      
    } else {
       console.log("Nessuna canzone trovata.");
    }
  }
}

function stopAllSongs() {
  if (songBlue.isPlaying()) songBlue.stop();
  if (songRed.isPlaying()) songRed.stop();
  if (songGreen.isPlaying()) songGreen.stop();
  if (songPurple.isPlaying()) songPurple.stop();
  if (songYellow.isPlaying()) songYellow.stop();
  if (songOrange.isPlaying()) songOrange.stop();
}