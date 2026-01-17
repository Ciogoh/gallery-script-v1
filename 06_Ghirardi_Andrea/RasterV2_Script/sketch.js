// ============================================
// RASTER - Risograph Print Aesthetic Tool
// ============================================

// Apply CSS styles programmatically
function applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            margin: 0;
            padding: 0;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #111;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        canvas {
            display: block;
        }

        /* Minimal GUI styling */
        .lil-gui {
            --background-color: #1a1a1a;
            --text-color: #e0e0e0;
            --title-background-color: #000;
            --title-text-color: #fff;
            --widget-color: #2a2a2a;
            --hover-color: #333;
            --focus-color: #666;
            --number-color: #999;
            --string-color: #e0e0e0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11px;
        }

        .lil-gui.root {
            position: fixed;
            top: 16px;
            right: 16px;
            max-height: calc(100vh - 32px);
            overflow-y: auto;
            overflow-x: hidden;
        }
        
        /* Scrollbar styling for GUI */
        .lil-gui.root::-webkit-scrollbar {
            width: 8px;
        }
        
        .lil-gui.root::-webkit-scrollbar-track {
            background: #1a1a1a;
        }
        
        .lil-gui.root::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 4px;
        }
        
        .lil-gui.root::-webkit-scrollbar-thumb:hover {
            background: #666;
        }

        .lil-gui button {
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// Load lil-gui library dynamically
function loadLilGui() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/lil-gui@0.19.1/dist/lil-gui.umd.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Global variables
let img; // Original image (never modified)
let displayImg; // Scaled version for display
let gui;
let params;
let imageData = [];
let canvasWidth = 800;
let canvasHeight = 800;
let isInitialized = false;

// Pattern drawing functions
const patterns = {
    circles: (x, y, size, intensity) => {
        const radius = map(intensity, 0, 255, 0, size * 0.8);
        circle(x, y, radius);
    },
    
    lines: (x, y, size, intensity, angle) => {
        const lineLength = map(intensity, 0, 255, 0, size * 1.2);
        push();
        translate(x, y);
        rotate(angle);
        line(-lineLength/2, 0, lineLength/2, 0);
        pop();
    },
    
    crosses: (x, y, size, intensity, angle) => {
        const lineLength = map(intensity, 0, 255, 0, size * 1.2);
        push();
        translate(x, y);
        rotate(angle);
        line(-lineLength/2, 0, lineLength/2, 0);
        line(0, -lineLength/2, 0, lineLength/2);
        pop();
    },
    
    dots: (x, y, size, intensity) => {
        const dotSize = map(intensity, 0, 255, 0, size * 0.6);
        rect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
    },
    
    grain: (x, y, size, intensity) => {
        const grainDensity = map(intensity, 0, 255, 0, 8);
        for (let i = 0; i < grainDensity; i++) {
            const px = x + random(-size/2, size/2);
            const py = y + random(-size/2, size/2);
            const grainSize = random(0.5, 2);
            circle(px, py, grainSize);
        }
    }
};

// p5.js setup function - called automatically when p5.js is loaded
function setup() {
    // Apply styles first
    applyStyles();
    
    // Create canvas
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.drop(handleFile);
    canvas.mousePressed(selectFile);
    
    background(245, 240, 230);
    
    // Show loading message
    textAlign(CENTER, CENTER);
    fill(100);
    textSize(18);
    text('Loading GUI...', width/2, height/2);
    
    // Load lil-gui and then initialize GUI
    loadLilGui().then(() => {
        setupGUI();
        isInitialized = true;
        
        // Show upload prompt
        background(245, 240, 230);
        textAlign(CENTER, CENTER);
        fill(100);
        textSize(18);
        text('Drop an image here or click to upload', width/2, height/2);
    }).catch(err => {
        console.error('Failed to load lil-gui:', err);
        textAlign(CENTER, CENTER);
        fill(255, 0, 0);
        textSize(14);
        text('Error loading GUI library', width/2, height/2);
    });
}

function setupGUI() {
    gui = new lil.GUI({ 
        title: 'Raster'
    });
    
    params = {
        gridSize: 8,
        blendMode: 'source',
        
        // Dynamic channels array
        channels: [
            {
                id: 'channel_0',
                name: 'Red',
                color: '#ff0000',
                offsetX: 0,
                offsetY: 0,
                pattern: 'lines',
                angle: 15,
                opacity: 255
            },
            {
                id: 'channel_1',
                name: 'Green',
                color: '#00ff00',
                offsetX: 2,
                offsetY: -2,
                pattern: 'circles',
                angle: 45,
                opacity: 255
            },
            {
                id: 'channel_2',
                name: 'Blue',
                color: '#0000ff',
                offsetX: -2,
                offsetY: 2,
                pattern: 'crosses',
                angle: 75,
                opacity: 255
            }
        ],
        
        addChannel: () => addChannel(),
        clear: () => clearImage(),
        savePNG: () => saveImage(),
        saveSVG: () => saveImageSVG()
    };
    
    // Create static folders FIRST (they'll be at top initially, then we'll move channels before them)
    const gridFolder = gui.addFolder('Grid');
    gridFolder.add(params, 'gridSize', 3, 20, 1).name('Grid Size').onChange(processImage);
    
    const aestheticsFolder = gui.addFolder('Aesthetics');
    aestheticsFolder.add(params, 'blendMode', ['source', 'multiply', 'screen', 'overlay', 'normal']).name('Blend Mode').onChange(processImage);
    
    // Actions
    const actionsFolder = gui.addFolder('Actions');
    actionsFolder.add(params, 'addChannel').name('➕ Add Channel');
    actionsFolder.add(params, 'clear').name('Clear');
    actionsFolder.add(params, 'savePNG').name('Save PNG');
    actionsFolder.add(params, 'saveSVG').name('Save SVG');
    
    // Store references to static folders
    gui._gridFolder = gridFolder;
    gui._aestheticsFolder = aestheticsFolder;
    gui._actionsFolder = actionsFolder;
    
    // Create channel folders (will be moved to top)
    updateChannelGUI();
}

let channelFolders = [];

function updateChannelGUI() {
    // Remove existing channel folders
    channelFolders.forEach(folder => {
        folder.destroy();
    });
    channelFolders = [];
    
    // Get reference to GUI's controllers array
    const guiControllers = gui.controllersRecursive();
    
    // Create folder for each channel
    params.channels.forEach((channel, index) => {
        const folder = gui.addFolder(channel.name);
        channelFolders.push(folder);
        
        // Move this folder to the top (before Grid folder)
        const allFolders = gui.folders;
        const folderIndex = allFolders.indexOf(folder);
        if (folderIndex !== -1) {
            allFolders.splice(folderIndex, 1);
            allFolders.splice(index, 0, folder);
        }
        
        // Color picker - lil-gui supports addColor for objects with r,g,b properties
        folder.addColor(channel, 'color').name('Color').onChange(processImage);
        
        // Position controls
        folder.add(channel, 'offsetX', -50, 50, 0.5).name('Offset X').onChange(processImage);
        folder.add(channel, 'offsetY', -50, 50, 0.5).name('Offset Y').onChange(processImage);
        
        // Pattern controls
        folder.add(channel, 'pattern', ['circles', 'lines', 'crosses', 'dots', 'grain']).name('Pattern').onChange(processImage);
        folder.add(channel, 'angle', 0, 180, 1).name('Angle (°)').onChange(processImage);
        folder.add(channel, 'opacity', 0, 255, 1).name('Opacity').onChange(processImage);
        
        // Remove button (only if more than 1 channel)
        if (params.channels.length > 1) {
            channel.removeChannel = () => removeChannel(index);
            folder.add(channel, 'removeChannel').name('🗑️ Remove');
        }
    });
}

function addChannel() {
    const newChannel = {
        id: `channel_${Date.now()}`,
        name: `Channel ${params.channels.length + 1}`,
        color: '#808080', // Gray
        offsetX: 0,
        offsetY: 0,
        pattern: 'circles',
        angle: 0,
        opacity: 255
    };
    
    params.channels.push(newChannel);
    updateChannelGUI();
    processImage();
}

function removeChannel(index) {
    if (params.channels.length > 1) {
        params.channels.splice(index, 1);
        updateChannelGUI();
        processImage();
    }
}

function selectFile() {
    if (!img && isInitialized) {
        let input = createFileInput(handleFile);
        input.elt.click();
        input.remove();
    }
}

function handleFile(file) {
    if (file.type === 'image') {
        loadImage(file.data, (loadedImg) => {
            img = loadedImg; // Keep original
            
            // Create scaled version for display
            const scale = min(canvasWidth / img.width, canvasHeight / img.height) * 0.9;
            displayImg = img.get(); // Create a copy
            displayImg.resize(displayImg.width * scale, displayImg.height * scale);
            
            extractImageData();
            processImage();
        });
    }
}

function clearImage() {
    img = null;
    displayImg = null;
    imageData = [];
    background(245, 240, 230);
    
    // Show upload prompt again
    textAlign(CENTER, CENTER);
    fill(100);
    textSize(18);
    text('Drop an image here or click to upload', width/2, height/2);
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

function extractImageData() {
    if (!displayImg) return;
    
    imageData = [];
    displayImg.loadPixels();
    
    // Extract color data on grid points only (optimization)
    for (let y = 0; y < displayImg.height; y += params.gridSize) {
        for (let x = 0; x < displayImg.width; x += params.gridSize) {
            const idx = (x + y * displayImg.width) * 4;
            
            // Store original RGB values
            const pixelData = {
                x: x,
                y: y,
                r: displayImg.pixels[idx],
                g: displayImg.pixels[idx + 1],
                b: displayImg.pixels[idx + 2],
                channels: {}
            };
            
            // Calculate intensity for each channel based on its color
            params.channels.forEach(channel => {
                // Convert hex color to RGB
                const channelRgb = hexToRgb(channel.color);
                
                // Calculate how much this pixel matches the channel's color
                // Using a weighted sum based on channel color
                const colorWeight = (channelRgb.r + channelRgb.g + channelRgb.b) / 765; // Normalize to 0-1
                
                if (colorWeight === 0) {
                    pixelData.channels[channel.id] = 0;
                } else {
                    // Simple approach: weight by channel color components
                    const rContrib = (pixelData.r / 255) * (channelRgb.r / 255);
                    const gContrib = (pixelData.g / 255) * (channelRgb.g / 255);
                    const bContrib = (pixelData.b / 255) * (channelRgb.b / 255);
                    
                    // Average of contributions
                    const intensity = ((rContrib + gContrib + bContrib) / 3) * 255;
                    pixelData.channels[channel.id] = intensity;
                }
            });
            
            imageData.push(pixelData);
        }
    }
}

function processImage() {
    if (!displayImg) return;
    
    // Re-extract data if grid size changed
    extractImageData();
    
    // Clear canvas with paper color
    background(245, 240, 230);
    
    // Calculate centering offsets
    const offsetX = (width - displayImg.width) / 2;
    const offsetY = (height - displayImg.height) / 2;
    
    // Set blend mode
    if (params.blendMode === 'source') {
        // SOURCE mode: direct RGB reconstruction without blend modes
        // We'll draw each channel to separate buffers and combine them manually
        blendMode(BLEND);
    } else {
        switch(params.blendMode) {
            case 'multiply':
                blendMode(MULTIPLY);
                break;
            case 'screen':
                blendMode(SCREEN);
                break;
            case 'overlay':
                blendMode(OVERLAY);
                break;
            default:
                blendMode(BLEND);
        }
    }
    
    // Draw each channel
    if (params.blendMode === 'source') {
        // SOURCE mode: draw all channels to a buffer and combine pixel-by-pixel
        drawChannelsSource(offsetX, offsetY);
    } else {
        // Standard blend modes: draw each channel dynamically
        params.channels.forEach(channel => {
            drawChannel(channel, channel.offsetX, channel.offsetY, channel.pattern, 
                       channel.angle, channel.opacity, offsetX, offsetY);
        });
    }
    
    blendMode(BLEND);
}

function drawChannelsSource(offsetX, offsetY) {
    // Create separate graphics buffers for each channel
    const buffers = params.channels.map(() => createGraphics(width, height));
    
    // Clear all buffers
    buffers.forEach(buffer => buffer.background(0));
    
    // Draw each channel to its buffer
    params.channels.forEach((channel, index) => {
        drawChannelToBuffer(buffers[index], channel, channel.offsetX, channel.offsetY, 
                           channel.pattern, channel.angle, channel.opacity, offsetX, offsetY);
    });
    
    // Load pixels from all buffers
    loadPixels();
    buffers.forEach(buffer => buffer.loadPixels());
    
    // Combine channels pixel by pixel
    for (let i = 0; i < pixels.length; i += 4) {
        let r = 0, g = 0, b = 0;
        
        // Sum contributions from all channels
        params.channels.forEach((channel, index) => {
            const bufferR = buffers[index].pixels[i];
            const bufferG = buffers[index].pixels[i + 1];
            const bufferB = buffers[index].pixels[i + 2];
            
            r += bufferR;
            g += bufferG;
            b += bufferB;
        });
        
        // Clamp values to 0-255
        pixels[i] = min(r, 255);
        pixels[i + 1] = min(g, 255);
        pixels[i + 2] = min(b, 255);
        pixels[i + 3] = 255;
    }
    
    updatePixels();
    
    // Clean up buffers
    buffers.forEach(buffer => buffer.remove());
}

function drawChannelToBuffer(buffer, channel, centerX, centerY, patternType, angle, opacity, offsetX, offsetY) {
    const angleRad = radians(angle);
    
    buffer.noFill();
    buffer.strokeWeight(1.5);
    
    imageData.forEach(pixel => {
        // Get intensity for this channel
        const intensity = pixel.channels[channel.id];
        
        // Skip if intensity is too low
        if (intensity < 5) return;
        
        // Calculate position with offset and centering
        const x = pixel.x + offsetX + centerX;
        const y = pixel.y + offsetY + centerY;
        
        // Set color based on channel color and intensity
        const channelRgb = hexToRgb(channel.color);
        const colorValue = map(intensity, 0, 255, 0, 255) * (opacity / 255);
        const r = (channelRgb.r / 255) * colorValue;
        const g = (channelRgb.g / 255) * colorValue;
        const b = (channelRgb.b / 255) * colorValue;
        
        buffer.stroke(r, g, b);
        buffer.fill(r, g, b);
        
        // Draw pattern directly to buffer
        switch(patternType) {
            case 'circles':
                const radius = map(intensity, 0, 255, 0, params.gridSize * 0.8);
                buffer.circle(x, y, radius);
                break;
                
            case 'lines':
                const lineLength = map(intensity, 0, 255, 0, params.gridSize * 1.2);
                buffer.push();
                buffer.translate(x, y);
                buffer.rotate(angleRad);
                buffer.line(-lineLength/2, 0, lineLength/2, 0);
                buffer.pop();
                break;
                
            case 'crosses':
                const crossLength = map(intensity, 0, 255, 0, params.gridSize * 1.2);
                buffer.push();
                buffer.translate(x, y);
                buffer.rotate(angleRad);
                buffer.line(-crossLength/2, 0, crossLength/2, 0);
                buffer.line(0, -crossLength/2, 0, crossLength/2);
                buffer.pop();
                break;
                
            case 'dots':
                const dotSize = map(intensity, 0, 255, 0, params.gridSize * 0.6);
                buffer.rect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
                break;
                
            case 'grain':
                const grainDensity = map(intensity, 0, 255, 0, 8);
                for (let i = 0; i < grainDensity; i++) {
                    const px = x + random(-params.gridSize/2, params.gridSize/2);
                    const py = y + random(-params.gridSize/2, params.gridSize/2);
                    const grainSize = random(0.5, 2);
                    buffer.circle(px, py, grainSize);
                }
                break;
        }
    });
}

function drawChannel(channel, centerX, centerY, patternType, angle, opacity, offsetX, offsetY) {
    const angleRad = radians(angle);
    
    noFill();
    strokeWeight(1.5);
    
    imageData.forEach(pixel => {
        // Get intensity for this channel
        const intensity = pixel.channels[channel.id];
        
        // Skip if intensity is too low
        if (intensity < 5) return;
        
        // Calculate position with offset and centering
        const x = pixel.x + offsetX + centerX;
        const y = pixel.y + offsetY + centerY;
        
        // Set color based on channel color and opacity
        const channelRgb = hexToRgb(channel.color);
        const channelColor = color(channelRgb.r, channelRgb.g, channelRgb.b, opacity);
        
        // Set color
        stroke(channelColor);
        fill(channelColor);
        
        // Draw pattern
        const patternFunc = patterns[patternType];
        if (patternFunc) {
            patternFunc(x, y, params.gridSize, intensity, angleRad);
        }
    });
}

function saveImage() {
    if (!img || !displayImg) {
        alert('Carica prima un\'immagine!');
        return;
    }
    
    // Calculate scale factor between original and display
    const scaleFactor = img.width / displayImg.width;
    
    // Safety check
    if (!scaleFactor || scaleFactor <= 0 || isNaN(scaleFactor)) {
        console.error('Invalid scale factor:', scaleFactor);
        alert('Errore nel calcolo della scala. Riprova.');
        return;
    }
    
    console.log('Export info:', {
        originalSize: `${img.width}x${img.height}`,
        displaySize: `${displayImg.width}x${displayImg.height}`,
        scaleFactor: scaleFactor,
        gridSize: params.gridSize
    });
    
    // Extract data from ORIGINAL image using SAME grid as display
    // but we'll scale the positions when drawing
    let originalImageData = [];
    img.loadPixels();
    for (let y = 0; y < displayImg.height; y += params.gridSize) {
        for (let x = 0; x < displayImg.width; x += params.gridSize) {
            // Get color from original image at scaled position
            const origX = Math.floor(x * scaleFactor);
            const origY = Math.floor(y * scaleFactor);
            const idx = (origX + origY * img.width) * 4;
            originalImageData.push({
                x: origX,  // Position in original image
                y: origY,
                r: img.pixels[idx],
                g: img.pixels[idx + 1],
                b: img.pixels[idx + 2]
            });
        }
    }
    
    // Temporarily resize canvas to original image size
    const originalW = width;
    const originalH = height;
    
    resizeCanvas(img.width, img.height);
    
    // Draw on main canvas at full resolution
    background(245, 240, 230);
    
    // Set blend mode
    if (params.blendMode === 'source') {
        // SOURCE mode will be handled separately
        blendMode(BLEND);
    } else {
        switch(params.blendMode) {
            case 'multiply':
                blendMode(MULTIPLY);
                break;
            case 'screen':
                blendMode(SCREEN);
                break;
            case 'overlay':
                blendMode(OVERLAY);
                break;
            default:
                blendMode(BLEND);
        }
    }
    
    // Scale parameters for export
    const exportGridSize = params.gridSize * scaleFactor;
    const exportStrokeWeight = 1.5 * scaleFactor;
    
    // Draw channels based on blend mode
    if (params.blendMode === 'source') {
        // SOURCE mode: draw all channels to buffers and combine
        drawChannelsSourceExport(originalImageData, scaleFactor, exportGridSize, exportStrokeWeight);
    } else {
        // Standard blend modes
        drawChannelFromData(originalImageData, 'red', params.redOffsetX * scaleFactor, 
                            params.redOffsetY * scaleFactor, params.redPattern, 
                            params.redAngle, params.redOpacity, exportGridSize, exportStrokeWeight);
        drawChannelFromData(originalImageData, 'green', params.greenOffsetX * scaleFactor, 
                            params.greenOffsetY * scaleFactor, params.greenPattern, 
                            params.greenAngle, params.greenOpacity, exportGridSize, exportStrokeWeight);
        drawChannelFromData(originalImageData, 'blue', params.blueOffsetX * scaleFactor, 
                            params.blueOffsetY * scaleFactor, params.bluePattern, 
                            params.blueAngle, params.blueOpacity, exportGridSize, exportStrokeWeight);
    }
    
    blendMode(BLEND);
    
    // Save
    saveCanvas('raster-print', 'png');
    
    // Restore original canvas size
    resizeCanvas(originalW, originalH);
    
    // Redraw at display size
    processImage();
}

function saveImageSVG() {
    if (!img || !displayImg) {
        alert('Carica prima un\'immagine!');
        return;
    }
    
    // Calculate scale factor between original and display
    const scaleFactor = img.width / displayImg.width;
    
    // Safety check
    if (!scaleFactor || scaleFactor <= 0 || isNaN(scaleFactor)) {
        console.error('Invalid scale factor:', scaleFactor);
        alert('Errore nel calcolo della scala. Riprova.');
        return;
    }
    
    console.log('SVG Export info:', {
        originalSize: `${img.width}x${img.height}`,
        displaySize: `${displayImg.width}x${displayImg.height}`,
        scaleFactor: scaleFactor,
        gridSize: params.gridSize
    });
    
    // Extract data from ORIGINAL image
    let originalImageData = [];
    img.loadPixels();
    for (let y = 0; y < displayImg.height; y += params.gridSize) {
        for (let x = 0; x < displayImg.width; x += params.gridSize) {
            const origX = Math.floor(x * scaleFactor);
            const origY = Math.floor(y * scaleFactor);
            const idx = (origX + origY * img.width) * 4;
            originalImageData.push({
                x: origX,
                y: origY,
                r: img.pixels[idx],
                g: img.pixels[idx + 1],
                b: img.pixels[idx + 2]
            });
        }
    }
    
    // Scale parameters for export
    const exportGridSize = params.gridSize * scaleFactor;
    const exportStrokeWeight = 1.5 * scaleFactor;
    
    // Build SVG string
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.width} ${img.height}">
`;
    
    // Add background - black for source mode, beige for others
    if (params.blendMode === 'source') {
        svg += `  <rect width="${img.width}" height="${img.height}" fill="rgb(0, 0, 0)"/>\n`;
    } else {
        svg += `  <rect width="${img.width}" height="${img.height}" fill="rgb(245, 240, 230)"/>\n`;
    }
    
    // Create groups for each channel based on blend mode
    if (params.blendMode === 'source') {
        // For SOURCE mode, we need to combine channels into final colors
        // instead of overlaying pure RGB channels
        svg += generateSVGSourceMode(originalImageData, scaleFactor, exportGridSize, exportStrokeWeight);
    } else {
        const svgBlendMode = getSVGBlendMode(params.blendMode);
        
        svg += `  <g id="red-channel" style="mix-blend-mode: ${svgBlendMode}">\n`;
        svg += generateSVGChannel(originalImageData, 'red', params.redOffsetX * scaleFactor, 
                                  params.redOffsetY * scaleFactor, params.redPattern, 
                                  params.redAngle, params.redOpacity, exportGridSize, exportStrokeWeight);
        svg += `  </g>\n`;
        
        svg += `  <g id="green-channel" style="mix-blend-mode: ${svgBlendMode}">\n`;
        svg += generateSVGChannel(originalImageData, 'green', params.greenOffsetX * scaleFactor, 
                                  params.greenOffsetY * scaleFactor, params.greenPattern, 
                                  params.greenAngle, params.greenOpacity, exportGridSize, exportStrokeWeight);
        svg += `  </g>\n`;
        
        svg += `  <g id="blue-channel" style="mix-blend-mode: ${svgBlendMode}">\n`;
        svg += generateSVGChannel(originalImageData, 'blue', params.blueOffsetX * scaleFactor, 
                                  params.blueOffsetY * scaleFactor, params.bluePattern, 
                                  params.blueAngle, params.blueOpacity, exportGridSize, exportStrokeWeight);
        svg += `  </g>\n`;
    }
    
    svg += `</svg>`;
    
    // Download SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raster-print.svg';
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('SVG exported successfully!');
}

function getSVGBlendMode(mode) {
    const modeMap = {
        'multiply': 'multiply',
        'screen': 'screen',
        'overlay': 'overlay',
        'normal': 'normal',
        'source': 'normal'
    };
    return modeMap[mode] || 'normal';
}

function generateSVGSourceMode(data, scaleFactor, gridSize, strokeW) {
    // For SOURCE mode, each channel draws its pattern but with only its RGB component
    // We use 'lighten' blend mode in SVG to combine them additively
    
    let svgContent = '';
    
    // Red channel with lighten blend
    svgContent += '  <g id="red-channel-source" style="mix-blend-mode: lighten">\n';
    svgContent += generateSVGChannelSource(data, 'red', params.redOffsetX * scaleFactor, 
                              params.redOffsetY * scaleFactor, params.redPattern, 
                              params.redAngle, params.redOpacity, gridSize, strokeW);
    svgContent += '  </g>\n';
    
    // Green channel with lighten blend
    svgContent += '  <g id="green-channel-source" style="mix-blend-mode: lighten">\n';
    svgContent += generateSVGChannelSource(data, 'green', params.greenOffsetX * scaleFactor, 
                              params.greenOffsetY * scaleFactor, params.greenPattern, 
                              params.greenAngle, params.greenOpacity, gridSize, strokeW);
    svgContent += '  </g>\n';
    
    // Blue channel with lighten blend
    svgContent += '  <g id="blue-channel-source" style="mix-blend-mode: lighten">\n';
    svgContent += generateSVGChannelSource(data, 'blue', params.blueOffsetX * scaleFactor, 
                              params.blueOffsetY * scaleFactor, params.bluePattern, 
                              params.blueAngle, params.blueOpacity, gridSize, strokeW);
    svgContent += '  </g>\n';
    
    return svgContent;
}

function generateSVGChannelSource(data, channel, offsetX, offsetY, patternType, angle, opacity, gridSize, strokeW) {
    // In SOURCE mode, each channel contributes ONLY its color component
    // Red channel: contributes (R, 0, 0)
    // Green channel: contributes (0, G, 0)
    // Blue channel: contributes (0, 0, B)
    // They will visually combine when overlaid
    
    let svgContent = '';
    const angleRad = radians(angle);
    const opacityValue = opacity / 255;
    
    data.forEach(pixel => {
        let intensity;
        
        switch(channel) {
            case 'red':
                intensity = pixel.r;
                break;
            case 'green':
                intensity = pixel.g;
                break;
            case 'blue':
                intensity = pixel.b;
                break;
        }
        
        if (intensity < 5) return;
        
        const x = pixel.x + offsetX;
        const y = pixel.y + offsetY;
        
        // Calculate the color value for this specific channel
        const colorValue = Math.round((intensity / 255) * 255 * opacityValue);
        
        // Each channel contributes only its component
        let color;
        switch(channel) {
            case 'red':
                color = `rgb(${colorValue}, 0, 0)`;
                break;
            case 'green':
                color = `rgb(0, ${colorValue}, 0)`;
                break;
            case 'blue':
                color = `rgb(0, 0, ${colorValue})`;
                break;
        }
        
        // Generate SVG elements based on pattern type
        switch(patternType) {
            case 'circles':
                const radius = map(intensity, 0, 255, 0, gridSize * 0.8) / 2;
                svgContent += `    <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}"/>\n`;
                break;
                
            case 'lines':
                const lineLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                const x1 = x + Math.cos(angleRad) * (-lineLength/2);
                const y1 = y + Math.sin(angleRad) * (-lineLength/2);
                const x2 = x + Math.cos(angleRad) * (lineLength/2);
                const y2 = y + Math.sin(angleRad) * (lineLength/2);
                svgContent += `    <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}"/>\n`;
                break;
                
            case 'crosses':
                const crossLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                const cx1 = x + Math.cos(angleRad) * (-crossLength/2);
                const cy1 = y + Math.sin(angleRad) * (-crossLength/2);
                const cx2 = x + Math.cos(angleRad) * (crossLength/2);
                const cy2 = y + Math.sin(angleRad) * (crossLength/2);
                svgContent += `    <line x1="${cx1.toFixed(2)}" y1="${cy1.toFixed(2)}" x2="${cx2.toFixed(2)}" y2="${cy2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}"/>\n`;
                const angleRad90 = angleRad + PI/2;
                const vx1 = x + Math.cos(angleRad90) * (-crossLength/2);
                const vy1 = y + Math.sin(angleRad90) * (-crossLength/2);
                const vx2 = x + Math.cos(angleRad90) * (crossLength/2);
                const vy2 = y + Math.sin(angleRad90) * (crossLength/2);
                svgContent += `    <line x1="${vx1.toFixed(2)}" y1="${vy1.toFixed(2)}" x2="${vx2.toFixed(2)}" y2="${vy2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}"/>\n`;
                break;
                
            case 'dots':
                const dotSize = map(intensity, 0, 255, 0, gridSize * 0.6);
                svgContent += `    <rect x="${(x - dotSize/2).toFixed(2)}" y="${(y - dotSize/2).toFixed(2)}" width="${dotSize.toFixed(2)}" height="${dotSize.toFixed(2)}" fill="${color}"/>\n`;
                break;
                
            case 'grain':
                const grainDensity = map(intensity, 0, 255, 0, 8);
                for (let i = 0; i < grainDensity; i++) {
                    const px = x + random(-gridSize/2, gridSize/2);
                    const py = y + random(-gridSize/2, gridSize/2);
                    const grainSize = random(0.5 * (gridSize/8), 2 * (gridSize/8)) / 2;
                    svgContent += `    <circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${grainSize.toFixed(2)}" fill="${color}"/>\n`;
                }
                break;
        }
    });
    
    return svgContent;
}

function getChannelParams(channel, scaleFactor) {
    switch(channel) {
        case 'red':
            return {
                offsetX: params.redOffsetX * scaleFactor,
                offsetY: params.redOffsetY * scaleFactor,
                pattern: params.redPattern,
                angle: params.redAngle,
                opacity: params.redOpacity
            };
        case 'green':
            return {
                offsetX: params.greenOffsetX * scaleFactor,
                offsetY: params.greenOffsetY * scaleFactor,
                pattern: params.greenPattern,
                angle: params.greenAngle,
                opacity: params.greenOpacity
            };
        case 'blue':
            return {
                offsetX: params.blueOffsetX * scaleFactor,
                offsetY: params.blueOffsetY * scaleFactor,
                pattern: params.bluePattern,
                angle: params.blueAngle,
                opacity: params.blueOpacity
            };
    }
}

function generateSVGChannel(data, channel, offsetX, offsetY, patternType, angle, opacity, gridSize, strokeW) {
    let svgContent = '';
    const angleRad = radians(angle);
    
    // Set channel color
    let color;
    switch(channel) {
        case 'red':
            color = 'rgb(255, 0, 0)';
            break;
        case 'green':
            color = 'rgb(0, 255, 0)';
            break;
        case 'blue':
            color = 'rgb(0, 0, 255)';
            break;
    }
    
    const opacityValue = opacity / 255;
    
    data.forEach(pixel => {
        let intensity;
        
        switch(channel) {
            case 'red':
                intensity = pixel.r;
                break;
            case 'green':
                intensity = pixel.g;
                break;
            case 'blue':
                intensity = pixel.b;
                break;
        }
        
        if (intensity < 5) return;
        
        const x = pixel.x + offsetX;
        const y = pixel.y + offsetY;
        
        // Generate SVG elements based on pattern type
        switch(patternType) {
            case 'circles':
                const radius = map(intensity, 0, 255, 0, gridSize * 0.8) / 2;
                svgContent += `    <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}" opacity="${opacityValue}"/>\n`;
                break;
                
            case 'lines':
                const lineLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                const x1 = x + Math.cos(angleRad) * (-lineLength/2);
                const y1 = y + Math.sin(angleRad) * (-lineLength/2);
                const x2 = x + Math.cos(angleRad) * (lineLength/2);
                const y2 = y + Math.sin(angleRad) * (lineLength/2);
                svgContent += `    <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacityValue}"/>\n`;
                break;
                
            case 'crosses':
                const crossLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                // Horizontal line
                const cx1 = x + Math.cos(angleRad) * (-crossLength/2);
                const cy1 = y + Math.sin(angleRad) * (-crossLength/2);
                const cx2 = x + Math.cos(angleRad) * (crossLength/2);
                const cy2 = y + Math.sin(angleRad) * (crossLength/2);
                svgContent += `    <line x1="${cx1.toFixed(2)}" y1="${cy1.toFixed(2)}" x2="${cx2.toFixed(2)}" y2="${cy2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacityValue}"/>\n`;
                // Vertical line
                const angleRad90 = angleRad + PI/2;
                const vx1 = x + Math.cos(angleRad90) * (-crossLength/2);
                const vy1 = y + Math.sin(angleRad90) * (-crossLength/2);
                const vx2 = x + Math.cos(angleRad90) * (crossLength/2);
                const vy2 = y + Math.sin(angleRad90) * (crossLength/2);
                svgContent += `    <line x1="${vx1.toFixed(2)}" y1="${vy1.toFixed(2)}" x2="${vx2.toFixed(2)}" y2="${vy2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW}" opacity="${opacityValue}"/>\n`;
                break;
                
            case 'dots':
                const dotSize = map(intensity, 0, 255, 0, gridSize * 0.6);
                svgContent += `    <rect x="${(x - dotSize/2).toFixed(2)}" y="${(y - dotSize/2).toFixed(2)}" width="${dotSize.toFixed(2)}" height="${dotSize.toFixed(2)}" fill="${color}" opacity="${opacityValue}"/>\n`;
                break;
                
            case 'grain':
                const grainDensity = map(intensity, 0, 255, 0, 8);
                for (let i = 0; i < grainDensity; i++) {
                    const px = x + random(-gridSize/2, gridSize/2);
                    const py = y + random(-gridSize/2, gridSize/2);
                    const grainSize = random(0.5 * (gridSize/8), 2 * (gridSize/8)) / 2;
                    svgContent += `    <circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${grainSize.toFixed(2)}" fill="${color}" opacity="${opacityValue}"/>\n`;
                }
                break;
        }
    });
    
    return svgContent;
}

function drawChannelsSourceExport(data, scaleFactor, gridSize, strokeW) {
    // Create three separate graphics buffers for each channel at export size
    let redBuffer = createGraphics(img.width, img.height);
    let greenBuffer = createGraphics(img.width, img.height);
    let blueBuffer = createGraphics(img.width, img.height);
    
    // Clear all buffers
    redBuffer.background(0);
    greenBuffer.background(0);
    blueBuffer.background(0);
    
    // Draw each channel to its buffer
    drawChannelToBufferExport(redBuffer, data, 'red', params.redOffsetX * scaleFactor, 
                             params.redOffsetY * scaleFactor, params.redPattern, 
                             params.redAngle, params.redOpacity, gridSize, strokeW);
    drawChannelToBufferExport(greenBuffer, data, 'green', params.greenOffsetX * scaleFactor, 
                             params.greenOffsetY * scaleFactor, params.greenPattern, 
                             params.greenAngle, params.greenOpacity, gridSize, strokeW);
    drawChannelToBufferExport(blueBuffer, data, 'blue', params.blueOffsetX * scaleFactor, 
                             params.blueOffsetY * scaleFactor, params.bluePattern, 
                             params.blueAngle, params.blueOpacity, gridSize, strokeW);
    
    // Load pixels from all buffers and main canvas
    loadPixels();
    redBuffer.loadPixels();
    greenBuffer.loadPixels();
    blueBuffer.loadPixels();
    
    // Combine channels pixel by pixel
    for (let i = 0; i < pixels.length; i += 4) {
        let r = redBuffer.pixels[i];
        let g = greenBuffer.pixels[i + 1];
        let b = blueBuffer.pixels[i + 2];
        
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
    }
    
    updatePixels();
    
    // Clean up buffers
    redBuffer.remove();
    greenBuffer.remove();
    blueBuffer.remove();
}

function drawChannelToBufferExport(buffer, data, channel, offsetX, offsetY, patternType, angle, opacity, gridSize, strokeW) {
    const angleRad = radians(angle);
    
    buffer.noFill();
    buffer.strokeWeight(strokeW);
    
    data.forEach(pixel => {
        let intensity;
        
        switch(channel) {
            case 'red':
                intensity = pixel.r;
                break;
            case 'green':
                intensity = pixel.g;
                break;
            case 'blue':
                intensity = pixel.b;
                break;
        }
        
        if (intensity < 5) return;
        
        const x = pixel.x + offsetX;
        const y = pixel.y + offsetY;
        
        const colorValue = map(intensity, 0, 255, 0, 255) * (opacity / 255);
        
        if (channel === 'red') {
            buffer.stroke(colorValue, 0, 0);
            buffer.fill(colorValue, 0, 0);
        } else if (channel === 'green') {
            buffer.stroke(0, colorValue, 0);
            buffer.fill(0, colorValue, 0);
        } else {
            buffer.stroke(0, 0, colorValue);
            buffer.fill(0, 0, colorValue);
        }
        
        // Draw pattern using the provided gridSize
        switch(patternType) {
            case 'circles':
                const radius = map(intensity, 0, 255, 0, gridSize * 0.8);
                buffer.circle(x, y, radius);
                break;
                
            case 'lines':
                const lineLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                buffer.push();
                buffer.translate(x, y);
                buffer.rotate(angleRad);
                buffer.line(-lineLength/2, 0, lineLength/2, 0);
                buffer.pop();
                break;
                
            case 'crosses':
                const crossLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                buffer.push();
                buffer.translate(x, y);
                buffer.rotate(angleRad);
                buffer.line(-crossLength/2, 0, crossLength/2, 0);
                buffer.line(0, -crossLength/2, 0, crossLength/2);
                buffer.pop();
                break;
                
            case 'dots':
                const dotSize = map(intensity, 0, 255, 0, gridSize * 0.6);
                buffer.rect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
                break;
                
            case 'grain':
                const grainDensity = map(intensity, 0, 255, 0, 8);
                for (let i = 0; i < grainDensity; i++) {
                    const px = x + random(-gridSize/2, gridSize/2);
                    const py = y + random(-gridSize/2, gridSize/2);
                    const grainSize = random(0.5 * (gridSize/8), 2 * (gridSize/8));
                    buffer.circle(px, py, grainSize);
                }
                break;
        }
    });
}

// Helper function to draw channel from specific data array
function drawChannelFromData(data, channel, offsetX, offsetY, patternType, angle, opacity, gridSize, strokeW) {
    const angleRad = radians(angle);
    
    noFill();
    strokeWeight(strokeW);
    
    data.forEach(pixel => {
        let intensity;
        let channelColor;
        
        // Get the appropriate channel value
        switch(channel) {
            case 'red':
                intensity = pixel.r;
                channelColor = color(255, 0, 0, opacity);
                break;
            case 'green':
                intensity = pixel.g;
                channelColor = color(0, 255, 0, opacity);
                break;
            case 'blue':
                intensity = pixel.b;
                channelColor = color(0, 0, 255, opacity);
                break;
        }
        
        // Skip if intensity is too low
        if (intensity < 5) return;
        
        // Calculate position with offset (no centering for export)
        const x = pixel.x + offsetX;
        const y = pixel.y + offsetY;
        
        // Set color
        stroke(channelColor);
        fill(channelColor);
        
        // Draw pattern using the provided gridSize
        switch(patternType) {
            case 'circles':
                const radius = map(intensity, 0, 255, 0, gridSize * 0.8);
                circle(x, y, radius);
                break;
                
            case 'lines':
                const lineLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                push();
                translate(x, y);
                rotate(angleRad);
                line(-lineLength/2, 0, lineLength/2, 0);
                pop();
                break;
                
            case 'crosses':
                const crossLength = map(intensity, 0, 255, 0, gridSize * 1.2);
                push();
                translate(x, y);
                rotate(angleRad);
                line(-crossLength/2, 0, crossLength/2, 0);
                line(0, -crossLength/2, 0, crossLength/2);
                pop();
                break;
                
            case 'dots':
                const dotSize = map(intensity, 0, 255, 0, gridSize * 0.6);
                rect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
                break;
                
            case 'grain':
                const grainDensity = map(intensity, 0, 255, 0, 8);
                for (let i = 0; i < grainDensity; i++) {
                    const px = x + random(-gridSize/2, gridSize/2);
                    const py = y + random(-gridSize/2, gridSize/2);
                    const grainSize = random(0.5 * (gridSize/8), 2 * (gridSize/8));
                    circle(px, py, grainSize);
                }
                break;
        }
    });
}

// p5.js draw function - called automatically every frame
function draw() {
    // Static render - only updates on parameter changes
}