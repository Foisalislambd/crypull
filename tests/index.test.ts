import { describe, it, expect } from 'vitest';
import { Crypull } from '../src/Crypull.js';
import { crypull } from '../src/index.js';

describe('Crypull Aggregator', () => {
  it('should export a default instance', () => {
    expect(crypull).toBeDefined();
    expect(crypull).toBeInstanceOf(Crypull);
  });

  it('should initialize successfully', () => {
    const customCrypull = new Crypull();
    expect(customCrypull).toBeDefined();
  });
});