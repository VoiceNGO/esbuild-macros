// Test shorthand properties with hygiene conflicts
const temp = 'global';
const id = 'global_id';
const temp$1 = 'point_' + 'test';
const id$1 = Math.random();
const point = { x: 10, y: 20, temp: temp$1, id: id$1 };
