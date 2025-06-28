// Test 1: Variable hygiene with global conflicts
const temp = 'global';
const msg = 'global_msg';
const id = 'global_id';
const result = 'global_result';
const temp$1 = 'point_' + 'main';
const id$1 = Math.random();
console.log('Creating', temp$1, 'with id', id$1);
const pointTemp = temp$1;
const pointId = id$1;
const pointY = 100;
const pointX = 42;
const msg$2 = 'Logging value';
const processed$2 = 5 * 3;
console.log(msg$2, 5, '->', processed$2);
const result$2 = processed$2 + 1;
// Test 3: Expression with multiple parameters and hygiene conflicts
const doubled = result$2;
const arr$3 = [];
for (let i$3 = 0; i$3 < 3; i$3++) {
  arr$3.push('item_' + i$3);
}
const first = arr$3[0];
const second = arr$3[1];
const third = arr$3[2];
const x$4 = 99 + 10;
const y$4 = 88 + 20;
const z$4 = 'coordinate';
const coordZ = z$4;
const coordX = x$4;
const coordY = y$4;
const inner$5 = { val: 7 * 8, name: 'inner' };
const outer$5 = [inner$5, 7 + 8, 'test'];
const meta$5 = { inner: inner$5, outer: outer$5, total: 7 + 8 };
console.log('Starting:', 'test_run');
for (let i$6 = 0; i$6 < 2; i$6++) {
  console.log('Iteration', i$6);
}
const final$6 = 'test_run' + '_done';
console.log('Finished:', final$6);
const row1$7 = [1, 2, 3];
const row2$7 = [4, 5, 6];
const row1 = row1$7;
const row2 = row2$7;
const inner$8 = { val: 3 * 4, name: 'inner' };
const outer$8 = [inner$8, 3 + 4, 'test'];
const meta$8 = { inner: inner$8, outer: outer$8, total: 3 + 4 };
// Test 10: Multiple macro calls in single expression
const combined = $logAndReturn(1, 2) + $logAndReturn(3, 4);
const temp$9 = 'point_' + 'nested';
const id$9 = Math.random();
console.log('Creating', temp$9, 'with id', id$9);
// Test 11: Macro result as parameter to another macro
const point = { x: 10, y: 20, temp: temp$9, id: id$9 };
const x$10 = 99 + point.x;
const y$10 = 88 + point.y;
const z$10 = 'coordinate';
const coords = { x: x$10, y: y$10, z: z$10 };
const arr$11 = [];
for (let i$11 = 0; i$11 < 2; i$11++) {
  arr$11.push('prefix_' + i$11);
}
const a = arr$11[0];
const b = arr$11[1];
const temp$12 = 'point_' + 'final';
const id$12 = Math.random();
console.log('Creating', temp$12, 'with id', id$12);
const finalX = 99;
const arr$13 = [];
for (let i$13 = 0; i$13 < 2; i$13++) {
  arr$13.push('last_' + i$13);
}
const item1 = arr$13[0];
const item2 = arr$13[1];
console.log(temp, msg, id, result);
console.log(pointTemp, pointId, pointX, pointY, doubled);
console.log(first, second, third, coordX, coordY, coordZ);
console.log(inner, outer, total, row1, row2);
console.log(val, name, nestedInner, sum, testStr, combined);
console.log(point, coords, a, b, finalX, item1, item2);
