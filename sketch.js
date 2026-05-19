let hatchColor; // Color of hatched tiles
let showPaint;
let paintColor; // Color of painted "fill" tiles (set to "" to skip)
let paintSize; // adjust the size of the painted "fill" tiles relative to the hatched tiles

let showBackground;
let backgroundColor; // Color of background (set to "" for transparent)
let density; // Maximum number of tiles across (increase for more density)
let darkThreshold; // Set to 0 for full range, raise for more dark
let lightThreshold; // Set to 255 for full range, lower for more light
let whiteBalance; // Adjust to hide white tiles (255 shows everything) (does not do anything if set higher than lightThreshold)
let contrast; // Adjust image contrast (0 for no adjustment)
let tileSize; // Tile size in pixels
let hatchWeight; // Weight of hatched strokes
let adjustedHatchWeight;

let showHatch;
let hatchSpacing;
let minHatchSpace; // Arbitrary value defining the minimum space between hatched strokes (0.5 is pretty tight)
let maxHatchSpace; // Arbitrary value defining the maximum space between hatched strokes (10 is pretty wide)

let img;
let paintRowCount;
let hatchRowCount;
let canvas;
let readyToRender = false;
let imgPreview;

// Setup
// ─────────────────────────────────────────────────────────────────────
async function setup() {
  // p5.brush requires a WEBGL canvas.
  canvas = createCanvas(1, 1, WEBGL);
  angleMode(DEGREES);

  // Create UI

  // 1. Create a div controls
  let controls = createDiv();
  controls.id("controls");

  // 2. Create buttons
  exportWidth = createSelect();
  exportWidth.option("1080 pixels", 1080);
  exportWidth.option("1280 pixels", 1280);
  exportWidth.option("1440 pixels", 1440);
  exportWidth.option("1920 pixels", 1920);
  exportWidth.option("2048 pixels", 2048);
  exportWidth.selected("1080 pixels");
  let exportWidthLabel = createP("Export Width");

  // IMAGE
  imageURL = createInput(
    getParam("imageURL") ??
      "https://images.unsplash.com/photo-1539664030485-a936c7d29c6e?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  imgPreview = createImg(imageURL.value(), "");
  imageURL.changed(() => {
    imgPreview.elt.src = imageURL.value();
    url.searchParams.set("imageURL", imageURL);
    setButton("render");
  });
  imageURLLabel = createP("Image URL");

  // BUTTON
  button = createButton("Render");
  setButton("render");

  // HATCH
  showHatch = createCheckbox(
    "Show Hatching?",
    getParam("showHatch") === "false" ? false : true
  );
  showHatch.changed(() => {
    setParam("showHatch", showHatch.checked());

    // Show/hide hatch options
    setInputState(hatchColor, showHatch.checked());
    setInputState(hatchColorLabel, showHatch.checked());
    setInputState(hatchWeight, showHatch.checked());
    setInputState(hatchWeightLabel, showHatch.checked());
    setInputState(hatchSpacing, showHatch.checked());
    setInputState(hatchSpacingLabel, showHatch.checked());
    setInputState(hatchAngle, showHatch.checked());
    setInputState(hatchAngleLabel, showHatch.checked());

    setButton("render");
  });

  hatchColor = createColorPicker(getParam("hatchColor") ?? "#2D372D");
  let hatchColorLabel = createP("Hatch Color");
  hatchColor.changed(() => {
    url.searchParams.set("hatchColor", hatchColor);
    setButton("render");
  });

  hatchWeight = createSlider(1, 15, 5);
  let hatchWeightLabel = createP(`Hatch Weight: ${hatchWeight.value()}`);
  hatchWeight.changed(() => {
    setButton("render");
    hatchWeightLabel.html(`Hatch Weight: ${hatchWeight.value()}`);
  });

  hatchSpacing = createSlider(1, 40, 20);
  let hatchSpacingLabel = createP(`Hatch Spacing: ${hatchSpacing.value()}`);
  hatchSpacing.changed(() => {
    setButton("render");
    hatchSpacingLabel.html(`Hatch Spacing: ${hatchSpacing.value()}`);
  });

  hatchAngle = createSlider(0, 3, 0);
  let hatchAngleLabel = createP(
    `Hatch Angle: ${45 + hatchAngle.value() * 90}°`
  );
  hatchAngle.changed(() => {
    setButton("render");
    hatchAngleLabel.html(`Hatch Angle: ${45 + hatchAngle.value() * 90}°`);
  });

  // BACKGROUND
  showBackground = createCheckbox("Show Background?", true);
  showBackground.changed(() => {
    setButton("render");
    setInputState(backgroundColor, showBackground.checked());
    setInputState(backgroundColorLabel, showBackground.checked());
  });

  backgroundColor = createColorPicker("#F0F0EC");
  let backgroundColorLabel = createP("Background Color");
  backgroundColor.changed(() => setButton("render"));

  // PAINT
  showPaint = createCheckbox("Show Paint?", true);
  showPaint.changed(() => {
    setButton("render");
    setInputState(paintColor, showPaint.checked());
    setInputState(paintColorLabel, showPaint.checked());
    setInputState(paintSize, showPaint.checked());
    setInputState(paintSizeLabel, showPaint.checked());
  });

  paintColor = createColorPicker("#ABAD6C");
  let paintColorLabel = createP("Paint Color");
  paintColor.changed(() => setButton("render"));

  paintSize = createSlider(1, 8, 2);
  let paintSizeLabel = createP(`Paint Size: ${paintSize.value()}`);
  paintSize.changed(() => {
    setButton("render");
    paintSizeLabel.html(`Paint Size: ${paintSize.value()}`);
  });

  // TILE DENSITY
  density = createSlider(1, 200, 60);
  let densityLabel = createP(`Density: ${density.value()} Tiles`);
  density.changed(() => {
    setButton("render");
    densityLabel.html(`Density: ${density.value()} Tiles`);
  });

  // IMAGE ADJUSTMENTS
  darkThreshold = createSlider(0, 255, 0);
  let darkThresholdLabel = createP(`Dark Threshold: ${darkThreshold.value()}`);
  darkThreshold.changed(() => {
    setButton("render");
    darkThresholdLabel.html(`Dark Threshold: ${darkThreshold.value()}`);
  });

  lightThreshold = createSlider(0, 255, 255);
  let lightThresholdLabel = createP(
    `Light Threshold: ${lightThreshold.value()}`
  );
  lightThreshold.changed(() => {
    setButton("render");
    lightThresholdLabel.html(`Light Threshold: ${lightThreshold.value()}`);
  });

  whiteBalance = createSlider(0, 255, 255);
  let whiteBalanceLabel = createP(`White Balance: ${whiteBalance.value()}`);
  whiteBalance.changed(() => {
    setButton("render");
    whiteBalanceLabel.html(`White Balance: ${whiteBalance.value()}`);
  });

  contrast = createSlider(0, 255, 40);
  let contrastLabel = createP(`Contrast: ${contrast.value()}`);
  contrast.changed(() => {
    setButton("render");
    contrastLabel.html(`Contrast: ${contrast.value()}`);
  });

  // 3. Place buttons inside the div
  button.parent(controls);

  imageURLLabel.parent(controls);
  imageURL.parent(controls);
  imgPreview.parent(controls);

  exportWidthLabel.parent(controls);
  exportWidth.parent(controls);

  contrastLabel.parent(controls);
  contrast.parent(controls);

  lightThresholdLabel.parent(controls);
  lightThreshold.parent(controls);

  darkThresholdLabel.parent(controls);
  darkThreshold.parent(controls);

  whiteBalanceLabel.parent(controls);
  whiteBalance.parent(controls);

  densityLabel.parent(controls);
  density.parent(controls);

  showHatch.parent(controls);

  hatchColorLabel.parent(controls);
  hatchColor.parent(controls);

  hatchWeightLabel.parent(controls);
  hatchWeight.parent(controls);

  hatchSpacingLabel.parent(controls);
  hatchSpacing.parent(controls);

  hatchAngleLabel.parent(controls);
  hatchAngle.parent(controls);

  showPaint.parent(controls);

  paintColorLabel.parent(controls);
  paintColor.parent(controls);

  paintSizeLabel.parent(controls);
  paintSize.parent(controls);

  showBackground.parent(controls);

  backgroundColorLabel.parent(controls);
  backgroundColor.parent(controls);

  // Don't run draw loop until render setup completes
  noLoop();
}

// Render Setup
// ─────────────────────────────────────────────────────────────────────
async function setupRender() {
  if (whiteBalance >= lightThreshold.value()) {
    whiteBalance = lightThreshold.value() - 1;
  }

  // Resize image so we have one pixel per tile
  img = await loadImage(imageURL.value());

  img.resize(density.value(), 0);
  img.loadPixels();

  // Adjust contrast
  for (let x = 0; x < img.width; x += 1) {
    for (let y = 0; y < img.height; y += 1) {
      let c = img.get(x, y);
      let factor =
        (259 * (contrast.value() + 255)) / (255 * (259 - contrast.value()));
      let nR = constrain(factor * (red(c) - 128) + 128, 0, 255);
      let nG = constrain(factor * (green(c) - 128) + 128, 0, 255);
      let nB = constrain(factor * (blue(c) - 128) + 128, 0, 255);
      let nC = color(nR, nG, nB);
      img.set(x, y, nC);
    }
  }
  img.updatePixels();

  // Calculate canvas size
  let baseWidth = Number(exportWidth.value());
  let baseHeight = baseWidth / (img.width / img.height);
  resizeCanvas(baseWidth, baseHeight);

  // css transform canvas to make sure it's visible
  const aspectRatio = baseWidth / baseHeight;
  cssScaleCanvas(canvas, aspectRatio, baseWidth);

  // brush.load() initialises the library on the current canvas.
  // Must be called after createCanvas() and resizeCanvas.
  brush.load();

  // new brush
  brush.add("customBrush", {
    type: "default",
    weight: 1.5,
    scatter: 1.25,
    sharpness: 0,
    grain: 10,
    opacity: 1000,
    spacing: 1,
    noise: 5,
    pressure: [1.2, 1.5],
    rotate: "natural",
    blend: false,
  });

  // Setup sizing
  clear();
  if (showBackground.checked()) background(backgroundColor.value());
  tileSize = baseWidth / density.value();
  adjustedHatchWeight =
    (hatchWeight.value() / 10) * (exportWidth.value() / 1080);
  maxHatchSpace = hatchSpacing.value() * (exportWidth.value() / 1080);
  minHatchSpace = (hatchSpacing.value() / 15) * (exportWidth.value() / 1080);
  if (minHatchSpace < 1) minHatchSpace = 1; // Catch to keep this from becoming too tiny
  paintRowCount = 0;
  hatchRowCount = 0;

  // Start loop
  readyToRender = true;
  setButton("rendering");
  loop();
  translate(-width / 2, -height / 2);
}

// Draw Loop
// ─────────────────────────────────────────────────────────────────────
function draw() {
  if (readyToRender) {
    // Has to be called on every draw loop
    resetMatrix();
    translate(-width / 2, -height / 2);

    // PAINT in rows
    if (
      showPaint.checked() &&
      paintSize.value() > 0 &&
      paintRowCount <= img.height / paintSize.value()
    ) {
      let avgDarkness = 0;
      // noprotect
      for (i = 0; i < density.value() / paintSize.value(); i++) {
        for (y = 0; y < paintSize.value(); y++) {
          for (x = 0; x < paintSize.value(); x++) {
            const pixelIndex =
              (i * paintSize.value() +
                x +
                (paintRowCount * paintSize.value() + y) * img.width) *
              4;
            const r = img.pixels[pixelIndex + 0];
            const g = img.pixels[pixelIndex + 1];
            const b = img.pixels[pixelIndex + 2];

            let tempDarkness = (r + g + b) / 3;
            avgDarkness = (avgDarkness + tempDarkness) / 2;
          }
        }

        if (avgDarkness < darkThreshold.value()) {
          avgDarkness = darkThreshold.value();
        } else if (avgDarkness > lightThreshold.value()) {
          avgDarkness = lightThreshold.value();
        }

        if (avgDarkness < whiteBalance.value()) {
          const pos = {
            x:
              i * tileSize * paintSize.value() +
              (tileSize * paintSize.value()) / 2,
            y:
              paintRowCount * tileSize * paintSize.value() +
              (tileSize * paintSize.value()) / 2,
          };

          const sizedTile = map(
            avgDarkness,
            darkThreshold.value(),
            lightThreshold.value(),
            tileSize * paintSize.value(),
            0
          );

          if (sizedTile > 1) {
            const tile = new Tile(pos, sizedTile, avgDarkness, false);
            tile.show();
          }
        }
      }
      paintRowCount++;
    } else if (showHatch.checked() && hatchRowCount < img.height) {
      // HATCH in rows
      for (let i = 0; i < density.value(); i++) {
        const pixelIndex = (i + hatchRowCount * img.width) * 4;
        const r = img.pixels[pixelIndex + 0];
        const g = img.pixels[pixelIndex + 1];
        const b = img.pixels[pixelIndex + 2];

        let avgDarkness = (r + g + b) / 3;

        if (avgDarkness < darkThreshold.value()) {
          avgDarkness = darkThreshold.value();
        } else if (avgDarkness > lightThreshold.value()) {
          avgDarkness = lightThreshold.value();
        }

        if (avgDarkness < whiteBalance.value()) {
          const pos = {
            x: i * tileSize + tileSize / 2,
            y: hatchRowCount * tileSize + tileSize / 2,
          };

          const sizedTile = map(
            avgDarkness,
            darkThreshold.value(),
            lightThreshold.value(),
            tileSize * 0.92,
            tileSize * 0.98
          );

          if (sizedTile > 1) {
            const tile = new Tile(pos, sizedTile, avgDarkness, true);
            tile.show();
          }
        }
      }
      hatchRowCount++;
    } else {
      noLoop();
      setButton("save");
    }
  }
}

// Tile Class
// ─────────────────────────────────────────────────────────────────────
class Tile {
  constructor(pos_, size_, darkness_, hatch_) {
    this.pos = pos_;
    this.size = size_;
    this.darkness = darkness_;
    this.hatch = hatch_;
  }

  show() {
    if (this.pos && this.pos.x && this.pos.y) {
      if (!this.hatch) {
        // BG
        brush.fill(
          paintColor.value(),
          map(
            this.darkness,
            darkThreshold.value(),
            lightThreshold.value(),
            250,
            20
          )
        ); // this is the opacity
        brush.fillBleed(random(0.1, 0.2), "out");
        brush.fillTexture(0.4, 1);

        let sizedTile = this.size * 0.75;

        if (sizedTile > 1) {
          brush.circle(this.pos.x, this.pos.y, sizedTile);
        }
        brush.noFill();
      } else {
        // HATCH
        brush.hatchStyle(
          "customBrush",
          hatchColor.value(),
          adjustedHatchWeight
        );
        brush.hatch(
          map(
            this.darkness,
            darkThreshold.value(),
            lightThreshold.value(),
            minHatchSpace,
            maxHatchSpace
          ), // This is distance between lines
          random(
            45 + hatchAngle.value() * 90 - 5,
            45 + hatchAngle.value() * 90 + 5
          ), // This is angle in degrees
          { rand: 0, continuous: false, gradient: false }
        );

        brush.rect(this.pos.x, this.pos.y, this.size, this.size, "center");
        brush.noHatch();
      }
    }
  }
}

// Helpers
// ─────────────────────────────────────────────────────────────────────
function saveDrawing() {
  let now = new Date();
  save(
    `sauceLabs_${now.getFullYear()}.${now
      .getMonth()
      .toString()
      .padStart(
        2,
        "0"
      )}.${now.getDate()}_at_${now
      .getHours()
      .toString()
      .padStart(2, "0")}.${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}.${now.getSeconds().toString().padStart(2, "0")}.png`
  );
}

function getCanvasDimensions(aspectRatio) {
  // Technically, we only use width, but might be helpful to have height down the line
  if (windowWidth / windowHeight > aspectRatio) {
    return {
      canvasWidth: windowHeight * aspectRatio,
      canvasHeight: windowHeight,
    };
  }

  return {
    canvasWidth: windowWidth,
    canvasHeight: windowWidth / aspectRatio,
  };
}

function cssScaleCanvas(canvas, aspectRatio, baseWidth) {
  const { canvasWidth, canvasHeight } = getCanvasDimensions(aspectRatio);
  const targetWidth = canvasWidth;
  const currentWidth = baseWidth;
  const scaleFactor = targetWidth / currentWidth;

  canvas.style("transform", `scale(${scaleFactor * 0.9})`);
}

// Create an image if the file is an image.
function handleImageUpload(file) {
  if (file.type === "image") {
    img = createImg(file.data, "");
    img.hide();
  } else {
    img = null;
  }
}

function setButton(state) {
  if (state === "render") {
    button.html("Render");
    button.style("background", "#4790DD");
    button.mousePressed(setupRender);
  } else if (state === "rendering") {
    button.html("Stop Render");
    button.style("background", "#F55524");
    button.mousePressed(() => {
      noLoop();
      setButton("render");
    });
  } else if (state === "save") {
    button.html("Save PNG");
    button.mousePressed(saveDrawing);
    button.style("background", "#ABE082");
  }
}

function setInputState(input, checked) {
  if (checked) {
    input.style("opacity", "1");
    input.style("pointer-events", "auto");
  } else {
    input.style("opacity", "0.3");
    input.style("pointer-events", "none");
  }
}

function getParam(id) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(id)) {
    return urlParams.get(id);
  }
}

function setParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, String(value));
  console.log(String(value));

  window.history.pushState({}, "", url);
}
