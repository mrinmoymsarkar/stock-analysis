export async function register() {
  // Node.js 25+ exposes `localStorage` as a global stub (backed by --localstorage-file)
  // but without proper Storage methods. Next.js dev overlay calls localStorage.getItem()
  // during SSR which crashes. Polyfill with an in-memory implementation.
  if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value); },
        removeItem: (key: string) => { store.delete(key); },
        clear: () => store.clear(),
        get length() { return store.size; },
        key: (index: number) => [...store.keys()][index] ?? null,
      },
      writable: true,
      configurable: true,
    });
  }
}
