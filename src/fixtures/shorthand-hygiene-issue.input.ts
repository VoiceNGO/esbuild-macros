// @macro
function $createPoint(x, y, label) {
  const temp = 'point_' + label;
  const id = Math.random();
  return { x, y, temp, id };
}

// Test shorthand properties with hygiene conflicts
const temp = 'global';
const id = 'global_id';
const point = $createPoint(10, 20, 'test');
