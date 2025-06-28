// @macro
function $unroll4(array, fn) {
  fn(array[0]);
  fn(array[1]);
  fn(array[2]);
  fn(array[3]);
}

// Test usage
const data = [10, 20, 30, 40];
$unroll4(data, console.log);
