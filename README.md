# Sauce Labs Image Generator
A p5.js image generator for Sauce Labs. For more information on p5.js, you can read the documentation and see examples here: https://p5js.org/

## p5.brush
The hand-made shading is handled through p5.brush by Alejandro Campos. For more information, you can read the documentation here: https://github.com/acamposuribe/p5.brush

## Using the generator
The generator accepts an image URL (Unsplash.com is a good source) and renders it in a unique hand-made bitmap style. As you edit, your settings will be saved into the URL.

### Image Options
- *Contrast:* Increase for starker differences between light and dark areas.
- *Light Threshold:* The upper limit at which a tile is considered pure white. Decrease lighten image.
- *Dark Threshold:* The lower limit at which a tile is considered pure black. Increase to darken image.
- *White Balance:* A hard cut-off at which a tile is considered pure white and not rendered. Decrease for more blank tiles.
- *Density:* The number of tiles across the width of the image.

### Hatch Options
- *Show Hatching:* Whether or not to show the hatched pen strokes.
- *Hatch Color:* The color of the pen strokes. Should be a Sauce Labs brand color.
- *Hatch Weight:* The width of the pen strokes.
- *Hatch Spacing:* The width between strokes in a single tile.
- *Hatch Angle:* The angle of the pen strokes (locked to 45°).

### Paint Options
- *Show Paint:* Whether or not to show paint spots.
- *Paint Color:* The color of the paint spots. Should be a Sauce Labs brand color.
- *Paint Size:* The size of the paint spots, as a multiple of tile size. Ex: a value of 3 means paint spots are 3x larger than hatched tiles.

### Background Options
- *Show Background:* Whether or not to show the background. If you do not show the background, your download will be a transparent PNG.
- *Background Color:* The color of the background. Should be a Sauce Labs brand color.
