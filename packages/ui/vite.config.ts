import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  },
  resolve: {
    alias: {
      // react-dom/test-utils was removed in React 19; stub it for Storybook
      'react-dom/test-utils': new URL('./src/stubs/react-dom-test-utils.ts', import.meta.url)
        .pathname,
    },
  },
});
