// @macro
function $createPoint(x, y) {
  const temp = 'point';
  console.log('Creating', temp);
  return { x: x, y: y };
}

// @macro
function $logAndReturn(value) {
  const msg = 'Logging value';
  console.log(msg, value);
  return value * 2;
}

const temp = 'global';
const { x, y } = $createPoint(42, 100);
const doubled = $logAndReturn(5);
