let inputField;
let textColorPicker;
let shadowColorPicker;
let sliderDepth;
let animationMenu;
let axisMenu;
let bgCheckbox;
let myFont;
let exportBtn;

function preload() {
  // Use a standard system font fallback if this external one causes security errors
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
  createCanvas(600, 400, WEBGL);

  createP('<strong>Type text:</strong>');
  inputField = createInput('OH HELLO');
  inputField.size(300);

  // --- ANIMATION MODE MENU ---
  createP('<strong>Animation Mode:</strong>');
  animationMenu = createSelect();
  animationMenu.option('Static');
  animationMenu.option('Spin');
  animationMenu.option('Wave');
  animationMenu.option('Pop');
  animationMenu.selected('Static');

  // --- AXIS MENU ---
  createP('<strong>Spin Axis (for Spin):</strong>');
  axisMenu = createSelect();
  axisMenu.option('Horizontal');
  axisMenu.option('Vertical');
  axisMenu.selected('Horizontal');

  createP('<strong>Face Color:</strong>');
  textColorPicker = createColorPicker('#FF00FF');

  createP('<strong>Side/Shadow Color:</strong>');
  shadowColorPicker = createColorPicker('#220033');

  createP('<strong>3D Thickness:</strong>');
  sliderDepth = createSlider(0, 100, 40);

  // --- VIEW SETTINGS ---
  createP('<strong>View Settings:</strong>');
  bgCheckbox = createCheckbox('Transparent Background', false);
  bgCheckbox.style('display', 'inline-block');

  // --- EXPORT BUTTON ---
  createP('<strong>Actions:</strong>');
  exportBtn = createButton('Download 3s GIF');
  exportBtn.mousePressed(downloadGif);

  textFont(myFont);
  textSize(60);
}

function downloadGif() {
  // 1. Give visual feedback
  exportBtn.html('Recording (Wait 3s)...');
  exportBtn.attribute('disabled', ''); // Disable button to prevent double clicks

  // 2. Trigger the save
  // We specify 'units: seconds' to be safe
  saveGif('kinetic-text.gif', 3, { units: 'seconds' });

  // 3. Reset button after recording + estimated processing time
  setTimeout(() => {
    exportBtn.html('Download 3s GIF');
    exportBtn.removeAttribute('disabled');
  }, 4500);
}

function draw() {
  // Background Logic
  if (bgCheckbox.checked()) {
    clear(); 
  } else {
    background(255); 
  }

  let txt = inputField.value();
  let depth = sliderDepth.value();
  let mode = animationMenu.value();
  let axis = axisMenu.value();

  // --- GLOBAL CAMERA ---
  rotateX(-0.3);
  rotateY(0.3);

  drawingContext.disable(drawingContext.CULL_FACE);
  textAlign(LEFT, BASELINE);

  // --- LAYOUT LOGIC ---
  let maxWidth = 500;
  let lineHeight = 70;
  let spaceWidth = textWidth(' ');

  let rawLines = txt.split('\n');
  let lines = [];

  for (let r = 0; r < rawLines.length; r++) {
    let words = rawLines[r].split(' ');
    let currentLine = [];
    let currentLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let wordW = textWidth(word);
      if (currentLineWidth + wordW > maxWidth && currentLine.length > 0) {
        lines.push({ words: currentLine, width: currentLineWidth });
        currentLine = [];
        currentLineWidth = 0;
      }
      currentLine.push(word);
      currentLineWidth += wordW + spaceWidth;
    }
    if (currentLine.length > 0) {
      lines.push({ words: currentLine, width: currentLineWidth });
    }
  }

  // --- RENDER LOOP ---
  let totalBlockHeight = lines.length * lineHeight;
  let startY = -totalBlockHeight / 2 + (lineHeight / 2);

  let commonRockAngle = 0;
  if (mode === 'Spin') {
    commonRockAngle = sin(frameCount * 0.05) * 0.4;
  }

  let globalWordCounter = 0;

  for (let l = 0; l < lines.length; l++) {
    let lineObj = lines[l];
    let lineWords = lineObj.words;
    let lineWidthFinal = lineObj.width - spaceWidth;

    let lineCursorX = -lineWidthFinal / 2;
    let lineCursorY = startY + (l * lineHeight);

    for (let w = 0; w < lineWords.length; w++) {
      let word = lineWords[w];
      let wordWidth = textWidth(word);
      let wordHeight = 45;

      let zOffset = 0;
      if (mode === 'Pop') {
        let wave = sin(frameCount * 0.1 - globalWordCounter * 0.8);
        if (wave > 0) { zOffset = wave * 150; }
      }

      push();
      translate(lineCursorX + wordWidth / 2, lineCursorY - (wordHeight / 3), zOffset);

      if (mode === 'Spin') {
        if (axis === 'Horizontal') rotateY(commonRockAngle);
        else rotateX(commonRockAngle);
      }

      translate(-(lineCursorX + wordWidth / 2), -(lineCursorY - (wordHeight / 3)));
      translate(lineCursorX, lineCursorY);

      let charCursorX = 0;

      for (let c = 0; c < word.length; c++) {
        let char = word.charAt(c);
        let charW = textWidth(char);

        let waveY = 0;
        if (mode === 'Wave') {
          let absoluteX = lineCursorX + charCursorX;
          waveY = sin(frameCount * 0.05 + absoluteX * 0.02) * 20;
        }

        let pts = myFont.textToPoints(char, 0, 0, 60, {
          sampleFactor: 0.1,
          simplifyThreshold: 0
        });

        push();
        translate(charCursorX, waveY);

        // A. SIDES
        fill(shadowColorPicker.color());
        stroke(shadowColorPicker.color());
        strokeWeight(1);
        strokeJoin(ROUND);

        beginShape(QUADS);
        for (let i = 0; i < pts.length; i++) {
          let nextIndex = (i + 1) % pts.length;
          let p1 = pts[i];
          let p2 = pts[nextIndex];
          if (dist(p1.x, p1.y, p2.x, p2.y) < 20) {
            vertex(p1.x, p1.y, 0);
            vertex(p2.x, p2.y, 0);
            vertex(p2.x, p2.y, -depth);
            vertex(p1.x, p1.y, -depth);
          }
        }
        endShape();

        // B. BACK
        push();
        translate(0, 0, -depth);
        noStroke();
        text(char, 0, 0);
        pop();

        // C. FACE
        drawingContext.depthMask(false);
        push();
        translate(0, 0, 1);
        fill(textColorPicker.color());
        noStroke();
        text(char, 0, 0);
        pop();
        drawingContext.depthMask(true);

        pop();

        charCursorX += charW;
      }
      pop();

      lineCursorX += wordWidth + spaceWidth;
      globalWordCounter++;
    }
  }
}