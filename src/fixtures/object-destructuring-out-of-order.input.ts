// @macro
function $getPoint() {
  const x = 42;
  const y = 100;
  const z = 'Kitsune';
  return { x, y, z };
}

// Test out-of-order destructuring
const { z, x, y } = $getPoint();
console.log(x, y, z);
