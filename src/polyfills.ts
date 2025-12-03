
import 'zone.js';

(window as any).global = window;
(window as any).globalThis = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (cb: Function) => setTimeout(cb, 0)
};
(window as any).Buffer = [];
