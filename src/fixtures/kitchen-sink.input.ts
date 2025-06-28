// @macro
function $createPoint(x, y, label) {
  const temp = 'point_' + label;
  const id = Math.random();
  console.log('Creating', temp, 'with id', id);
  return { x: x, y: y, temp, id };
}

// @macro
function $logAndReturn(value, multiplier) {
  const msg = 'Logging value';
  const processed = value * multiplier;
  console.log(msg, value, '->', processed);
  const result = processed + 1;
  return result;
}

// @macro
function $initArray(size, prefix) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(prefix + i);
  }
  return arr;
}

// @macro
function $getCoordsShorthand(offsetX, offsetY) {
  const x = 99 + offsetX;
  const y = 88 + offsetY;
  const z = 'coordinate';
  return { x, y, z };
}

// @macro
function $complexNested(a, b) {
  const inner = { val: a * b, name: 'inner' };
  const outer = [inner, a + b, 'test'];
  const meta = { inner, outer, total: a + b };
  return meta;
}

// @macro
function $multiStatement(msg, count) {
  console.log('Starting:', msg);
  for (let i = 0; i < count; i++) {
    console.log('Iteration', i);
  }
  const final = msg + '_done';
  console.log('Finished:', final);
}

// @macro
function $getMatrix() {
  const row1 = [1, 2, 3];
  const row2 = [4, 5, 6];
  return [row1, row2];
}

// Test 1: Variable hygiene with global conflicts
const temp = 'global';
const msg = 'global_msg';
const id = 'global_id';
const result = 'global_result';

// Test 2: Object destructuring with parameters (out of order)
const {
  temp: pointTemp,
  id: pointId,
  y: pointY,
  x: pointX,
} = $createPoint(42, 100, 'main');

// Test 3: Expression with multiple parameters and hygiene conflicts
const doubled = $logAndReturn(5, 3);

// Test 4: Array destructuring with parameters
const [first, second, third] = $initArray(3, 'item_');

// Test 5: Shorthand property destructuring with parameters (out of order)
const { z: coordZ, x: coordX, y: coordY } = $getCoordsShorthand(10, 20);

// Test 6: Complex nested destructuring
const { inner, outer, total } = $complexNested(7, 8);

// Test 7: Statement macro with parameters
$multiStatement('test_run', 2);

// Test 8: Nested array destructuring
const [row1, row2] = $getMatrix();

// Test 9: Deep destructuring from complex return
const {
  inner: { val, name },
  outer: [nestedInner, sum, testStr],
} = $complexNested(3, 4);

// Test 10: Multiple macro calls in single expression
const combined = $logAndReturn(1, 2) + $logAndReturn(3, 4);

// Test 11: Macro result as parameter to another macro
const point = $createPoint(10, 20, 'nested');
const coords = $getCoordsShorthand(point.x, point.y);

// Test 12: Array destructuring with complex expressions
const [a, b] = $initArray(2, 'prefix_');

// Test 13: Mixed destructuring patterns
const { x: finalX } = $createPoint(99, 88, 'final');
const [item1, item2] = $initArray(2, 'last_');

console.log(temp, msg, id, result);
console.log(pointTemp, pointId, pointX, pointY, doubled);
console.log(first, second, third, coordX, coordY, coordZ);
console.log(inner, outer, total, row1, row2);
console.log(val, name, nestedInner, sum, testStr, combined);
console.log(point, coords, a, b, finalX, item1, item2);
