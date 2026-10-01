// Ensure fetch has both getter and setter for third-party script / iframe environment compatibility
(function () {
  try {
    const targetScope: any = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : self);
    let currentFetch = targetScope.fetch;
    const descriptor = {
      configurable: true,
      enumerable: true,
      get: () => currentFetch,
      set: (fn: any) => {
        currentFetch = fn;
      },
    };
    try {
      Object.defineProperty(targetScope, 'fetch', descriptor);
    } catch (_) {}
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', descriptor);
      } catch (_) {}
    }
  } catch (_) {}
})();

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
