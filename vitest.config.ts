/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/__tests__/**',
        'src/backend/**',
        'src/apps/mfe-*/components/**',
        'src/components/dashboard/**',
      ],
      thresholds: { lines: 40, functions: 45, branches: 55 },
    },
  },
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(''),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(''),
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001'),
  },
});
