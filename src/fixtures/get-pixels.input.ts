// @macro
function $getPixels(pixelArray, offset) {
  return [
    pixelArray[offset],
    pixelArray[offset + 1],
    pixelArray[offset + 2],
    pixelArray[offset + 3],
  ];
}

// Test usage
const imageData = new Uint8Array([255, 128, 64, 255, 0, 255, 128, 128]);
const [r, g, b, a] = $getPixels(imageData, 0);
const [red, green, blue, alpha] = $getPixels(imageData, 4);
