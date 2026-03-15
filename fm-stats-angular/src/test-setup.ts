/**
 * Global test setup — runs before each test file in the vitest environment.
 *
 * IMPORTANT: Tests must be run via `ng test`, which uses the Angular builder to
 * initialize TestBed before setup files run. Running `npx vitest run` directly
 * will not work because it bypasses the Angular builder's TestBed initialization.
 *
 * JSDOM does not implement ResizeObserver, but PrimeNG's FrozenColumn directive
 * calls it during ngAfterViewInit. We provide a no-op stub so component specs
 * that include p-table with pFrozenColumn can render without throwing.
 */
if (typeof ResizeObserver === 'undefined') {
  (globalThis as unknown as Record<string, unknown>)['ResizeObserver'] = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
