// @macro
function $createPoint(x, y) {
  return { x: x, y: y };
}
const { x, y } = $createPoint(42, 100);
