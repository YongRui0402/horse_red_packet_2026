
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 如果您未來使用 www.xn--ht0a.tw 且對應到根目錄，請將 base 改回 '/'
export default defineConfig({
  base: '/horse_red_packet_2026/',
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
