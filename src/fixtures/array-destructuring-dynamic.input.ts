// @macro
function $buildArray(size, prefix) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(prefix + i);
  }
  return arr;
}

const [first, second, third] = $buildArray(3, 'item_');
