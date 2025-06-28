import { describe, it, expect } from 'vitest';
import { transform } from './transformer';
import fs from 'fs';
import path from 'path';

const fixturesDir = path.join(__dirname, 'fixtures');
const fixtureFiles = fs.readdirSync(fixturesDir);
const testCases = fixtureFiles
  .filter((file) => file.endsWith('.input.ts'))
  .map((file) => {
    const name = file.replace('.input.ts', '');
    return {
      name,
      input: path.join(fixturesDir, file),
      output: path.join(fixturesDir, `${name}.output.ts`),
    };
  });

// Helper to normalize whitespace and newlines for consistent comparison
const format = (code: string) => code.replace(/\s+/g, ' ').trim();

describe('esbuild-macros from fixtures', () => {
  for (const testCase of testCases) {
    it(`should correctly transform: ${testCase.name}`, () => {
      const inputCode = fs.readFileSync(testCase.input, 'utf-8');
      const expectedCode = fs.readFileSync(testCase.output, 'utf-8');

      const transformedCode = transform(inputCode);
      expect(format(transformedCode)).toBe(format(expectedCode));
    });
  }
});
