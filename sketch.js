let emojis = [];
let iconX, iconY;
let iconColor;
let emojiFoundText = "";
let endpointsData;
let endpoint;
let draggedEmoji = null;
let pageNotFoundText = "PAGE NOT FOUND";
let redColor;
let greenColor;

let lerpAmount = 0.5; // Amount of interpolation (between 0 and 1)

// Variables to control velocity and density
let velocity = 1;
let density = 50; // Number of emojis

// Graphics buffer for blurred background
let textGraphics;

function preload() {
  endpointsData = loadJSON("endpoints.json", onJSONLoaded, onJSONLoadError);
}

function onJSONLoaded(data) {
  endpointsData = data.endpoints;
}

function onJSONLoadError(error) {
  console.error("Failed to load the JSON file:", error);
}

function setup() {
  if (!endpointsData || !Array.isArray(endpointsData)) {
    console.error("Endpoints data is not properly loaded or is not an array.");
    noLoop();
    return;
  }

  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  iconX = width / 2;
  iconY = height / 2;
  redColor = color(255, 52, 51);
  greenColor = color(0, 205, 12);
  iconColor = redColor;

  // Extract the endpoint from the URL
  endpoint = getEndpointFromURL();

  // Initialize emojis with given density and associate them with strings
  for (let i = 0; i < density; i++) {
    let endpointString = endpointsData[i % endpointsData.length];
    emojis.push(new Emoji(random(width), random(height), endpointString));
  }

  // Create graphics buffer
  textGraphics = createGraphics(windowWidth, windowHeight);
}

function draw() {
  background(245);

  // Update and display emojis
  let emojiFound = false;
  for (let emoji of emojis) {
    emoji.update();
    emoji.display();
    // Check if emoji passes through the center of the zero of the 404-icon
    if (dist(emoji.x, emoji.y, iconX, iconY) < 30) {
      emojiFound = true;
      emojiFoundText = `but ${emoji.endpoint} was found`;
    }
  }

  if (!emojiFound) {
    lerpAmount = max(0, lerpAmount - 0.05);
    iconColor = lerpColor(redColor, greenColor, lerpAmount);
    // iconColor = redColor;
    emojiFoundText = "";
  } else {
    lerpAmount = min(1, lerpAmount + 0.05);
    iconColor = lerpColor(redColor, greenColor, lerpAmount);
    // iconColor = greenColor;
  }

  // Draw the 404 icon
  draw404Icon(iconX, iconY);

  // Draw blurred background for text
  // drawBlurredTextBackground();

  // Display endpoint and Page Not Found message with outline
  drawTextWithOutline(endpoint, width / 2, height / 2 + 70 - 200, 22);
  // endpoint is the preview windows instead of the real website. See function for more details
  textStyle(BOLD);  drawTextWithOutline(pageNotFoundText, width / 2, height / 2 + 110 -200, 36);
  textStyle(NORMAL);
  drawTextWithOutline(emojiFoundText, width / 2, height / 2 + 190 -70, 22); // -300 added due to iframe size in noc website
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  textGraphics.resizeCanvas(windowWidth, windowHeight);
}

function draw404Icon(x, y) {
  textSize(100);
  fill(iconColor);
  text("4", x - 58, y);
  text("0", x, y);
  text("4", x + 58, y);
  text(".", x, y - 28);
}

function drawBlurredTextBackground() {
  textGraphics.clear();
  textGraphics.noStroke();
  textGraphics.fill(0, 0, 0, 150); // Semi-transparent black background

  // Measure text widths
  textSize(20);
  let endpointWidth = textWidth(endpoint) + 10;
  textSize(30);
  let pageNotFoundWidth = textWidth(pageNotFoundText) + 10;
  textSize(20);
  let messageWidth = textWidth(emojiFoundText) + 10;

  // Draw rectangles with measured widths
  textGraphics.rectMode(CENTER);
  textGraphics.rect(width / 2, height / 2 + 70, endpointWidth, 30); // Background for endpoint
  textGraphics.rect(width / 2, height / 2 + 120, pageNotFoundWidth, 40); // Background for "Page Not Found"
  textGraphics.rect(width / 2, height / 2 + 170, messageWidth, 30); // Background for additional message

  textGraphics.filter(BLUR, 10); // Apply blur
  image(textGraphics, 0, 0); // Draw the blurred background on the main canvas
}

function drawTextWithOutline(textString, x, y, textSizeValue) {
  textSize(textSizeValue);
  stroke(255); // Outline color (black)
  strokeWeight(2); // Outline thickness
  fill(206, 54, 153); // Text color

  text(textString, x, y);

  noStroke(); // Disable outline for other elements
}

function getEndpointFromURL() {
  // When no iframe
  const url = window.location.href;
  const urlObj = new URL(url);
  return urlObj.pathname.replace("https://preview.p5js.org", "");

  /*
  // When iframe in same server
  const iframe = document.getElementById('test');
  const iframeUrl = iframe.contentWindow.location.href;
  return iframeUrl;
  */
}

class Emoji {
  constructor(x, y, endpoint) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40);
    this.xSpeed = random(-velocity, velocity);
    this.ySpeed = random(-velocity, velocity);
    this.endpoint = endpoint;
    this.dragging = false;
  }

  update() {
    if (!this.dragging) {
      this.x += this.xSpeed;
      this.y += this.ySpeed;

      if (this.x > width || this.x < 0) {
        this.xSpeed *= -1;
      }

      if (this.y > height || this.y < 0) {
        this.ySpeed *= -1;
      }
    }
  }

  display() {
    noStroke();
    fill(255);
    textSize(this.size);
    text("📄", this.x, this.y);
  }

  mousePressed() {
    if (dist(mouseX, mouseY, this.x, this.y) < this.size / 2) {
      this.dragging = true;
      this.xSpeed = 0;
      this.ySpeed = 0;
    }
  }

  mouseReleased() {
    if (this.dragging) {
      this.dragging = false;
      this.xSpeed = random(-velocity, velocity);
      this.ySpeed = random(-velocity, velocity);
    }
  }

  drag() {
    if (this.dragging) {
      this.x = mouseX;
      this.y = mouseY;
    }
  }

  isHovered() {
    return dist(mouseX, mouseY, this.x, this.y) < this.size / 2;
  }
}

function mousePressed() {
  for (let emoji of emojis) {
    emoji.mousePressed();
  }
}

function mouseReleased() {
  for (let emoji of emojis) {
    emoji.mouseReleased();
  }
}

function mouseDragged() {
  for (let emoji of emojis) {
    emoji.drag();
  }
}

function mouseMoved() {
  let hovering = false;
  for (let emoji of emojis) {
    if (emoji.isHovered()) {
      hovering = true;
      break;
    }
  }
  if (hovering) {
    cursor("pointer"); // Change cursor to hand
  } else {
    cursor("default"); // Change cursor to default
  }
}
