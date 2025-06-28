# esbuild-macros

An esbuild plugin for compile-time macros in JavaScript and TypeScript. Inline code at build time for zero runtime overhead.

## Features

- **Expression macros**: `const result = $macro();`
- **Statement macros**: `$macro();`
- **Array destructuring**: `const [a, b] = $macro();`
- **Object destructuring**: `const {x, y} = $macro();`
- **Parameter substitution**: `$macro(arg1, arg2)`

## Installation

```bash
npm install esbuild-macros
```

## Usage

### Basic Setup

```javascript
import { build } from 'esbuild';
import { macroPlugin } from 'esbuild-macros';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [macroPlugin()],
});
```

### Macro Syntax

Define macros using the `// @macro` comment and `$` prefix:

```typescript
// @macro
function $createPoint(x, y) {
  const temp = 'Creating point';
  console.log(temp, x, y);
  return { x: x, y: y };
}
```

**Important**: Macros must have a **single return statement** at the end. This keeps the macro system simple and predictable.

## Examples

### Expression Macros

```typescript
// @macro
function $distance2D(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Usage in collision detection loop
for (let i = 0; i < entities.length; i++) {
  const dist = $distance2D(player.x, player.y, entities[i].x, entities[i].y);
  if (dist < collisionRadius) handleCollision(entities[i]);
}
// Expands to:
// const dx$1 = entities[i].x - player.x;
// const dy$1 = entities[i].y - player.y;
// const dist = Math.sqrt(dx$1 * dx$1 + dy$1 * dy$1);
```

### Statement Macros

```typescript
// @macro
function $debugAssert(condition, message) {
  if (process.env.NODE_ENV === 'development') {
    if (!condition) {
      console.error('Assertion failed:', message);
      debugger;
    }
  }
}

// Usage in game loop
function updateEntity(entity) {
  $debugAssert(entity.health >= 0, 'Entity health cannot be negative');
  $debugAssert(entity.position, 'Entity must have position');
  // ... update logic ...
}
// Expands to nothing in production builds
// In development expands to:
// if (!entity.health >= 0) {
//   console.error('Assertion failed:', 'Entity health cannot be negative');
//   debugger;
// }
```

### Array Destructuring

```typescript
// @macro
function $getPixels(pixelArray, offset) {
  return [
    pixelArray[offset],
    pixelArray[offset + 1],
    pixelArray[offset + 2],
    pixelArray[offset + 3],
  ];
}

// Usage in image processing loop
for (let i = 0; i < width * height; i++) {
  const [r, g, b, a] = $getPixels(imageData, i * 4);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  outputData[i] = gray;
}
// Expands to:
// const r = imageData[i * 4];
// const g = imageData[i * 4 + 1];
// const b = imageData[i * 4 + 2];
// const a = imageData[i * 4 + 3];
```

```typescript
// @macro
function $vec3Add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

// Usage in physics loop
for (let i = 0; i < particles.length; i++) {
  const [newX, newY, newZ] = $vec3Add(
    particles[i].position,
    particles[i].velocity
  );
  particles[i].position = [newX, newY, newZ];
}
// Expands to:
// const newX = particles[i].position[0] + particles[i].velocity[0];
// const newY = particles[i].position[1] + particles[i].velocity[1];
// const newZ = particles[i].position[2] + particles[i].velocity[2];
```

### Object Destructuring

```typescript
// @macro
function $transformPoint(x, y, matrix) {
  return {
    x: matrix.a * x + matrix.c * y + matrix.tx,
    y: matrix.b * x + matrix.d * y + matrix.ty,
  };
}

// Usage in graphics pipeline
for (let i = 0; i < vertices.length; i++) {
  const { x, y } = $transformPoint(vertices[i].x, vertices[i].y, worldMatrix);
  screenVertices[i] = { x, y };
}
// Expands to:
// const x = worldMatrix.a * vertices[i].x + worldMatrix.c * vertices[i].y + worldMatrix.tx;
// const y = worldMatrix.b * vertices[i].x + worldMatrix.d * vertices[i].y + worldMatrix.ty;
```

### Parameter Substitution

```typescript
// @macro
function $lerp(a, b, t) {
  return a + (b - a) * t;
}

// Usage in animation loop (60fps)
function updateAnimation(deltaTime) {
  for (let i = 0; i < animatedObjects.length; i++) {
    const progress = animatedObjects[i].time / animatedObjects[i].duration;
    animatedObjects[i].x = $lerp(
      animatedObjects[i].startX,
      animatedObjects[i].endX,
      progress
    );
    animatedObjects[i].y = $lerp(
      animatedObjects[i].startY,
      animatedObjects[i].endY,
      progress
    );
  }
}
// Expands to:
// animatedObjects[i].x = animatedObjects[i].startX + (animatedObjects[i].endX - animatedObjects[i].startX) * progress;
// animatedObjects[i].y = animatedObjects[i].startY + (animatedObjects[i].endY - animatedObjects[i].startY) * progress;
```

### Variable Hygiene

```typescript
// @macro
function $clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

// Usage in audio processing
function processAudioSample(samples) {
  for (let i = 0; i < samples.length; i++) {
    const result = applyFilter(samples[i]); // User variable
    samples[i] = $clamp(result, -1.0, 1.0);
  }
}
// Expands to:
// samples[i] = result < -1.0 ? -1.0 : result > 1.0 ? 1.0 : result;
```

### Loop Unrolling

```typescript
// @macro
function $unroll4(array, fn) {
  fn(array[0]);
  fn(array[1]);
  fn(array[2]);
  fn(array[3]);
}

// Usage in tight loops where call overhead matters
function processQuads(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    $unroll4(
      [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]],
      applyFilter
    );
  }
}
// Expands to:
// applyFilter(pixels[i]);
// applyFilter(pixels[i+1]);
// applyFilter(pixels[i+2]);
// applyFilter(pixels[i+3]);
```

## Supported Syntax

### Supported

```typescript
// Expression assignment (single macro call only)
const result = $macro();
const value = $macro(arg1, arg2);

// Statement calls
$macro();
$macro(arg1, arg2);

// Array destructuring
const [a, b, c] = $macro();

// Object destructuring (all patterns)
const { x, y } = $macro();
const { x: newX, y: newY } = $macro();
const { y, x } = $macro(); // Out of order works
```

### Not Supported

```typescript
// Any processing of a macro result on the same line.  `= $macro(args);` is the only valid syntax
const result = $macro1() + $macro2(); // Not supported
const result = someFunc($macro()); // Not supported
const result = $macro1($macro2()); // Not supported
const result = condition ? $macro1() : $macro2(); // Not supported

// Deep destructuring
const {
  inner: { value },
} = $macro(); // Not supported

// Multiple returns in macros
// @macro
function $badMacro(x) {
  if (x > 0) return x; // Multiple returns not supported
  return -x;
}
```

## How It Works

1. Find functions with `// @macro` comments and `$` prefix
2. Replace macro calls with the macro function body
3. Rename variables to prevent naming conflicts (using `$N` suffix)
4. Replace parameter references with actual arguments
5. Handle array/object destructuring patterns
6. Expect exactly one return statement at the end of each macro

## TypeScript Support

Works with TypeScript including type annotations, interfaces, generics, and all TypeScript syntax.

```typescript
// @macro
function $typedMacro<T>(value: T): { data: T; timestamp: number } {
  const timestamp = Date.now();
  return { data: value, timestamp };
}

const result = $typedMacro<string>('hello');
```

## Performance

- Zero runtime overhead: Macros are expanded at compile time
- No bundle size impact: Macro definitions are removed from output
- Fast compilation: Efficient AST transformation using TypeScript compiler API

## License

MIT
