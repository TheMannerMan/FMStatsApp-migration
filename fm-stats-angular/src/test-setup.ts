/**
 * Global test setup — runs before each test file in the vitest environment.
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
