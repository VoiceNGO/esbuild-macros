// @macro
function $getCoordsShorthand() {
  const x = 3;
  const y = 4;
  return { x, y };
}

const { x, y } = $getCoordsShorthand();
