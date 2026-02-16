
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 載入當前環境的變數（包含系統環境變數）
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 使用相對路徑，這樣無論部署在 GitHub Pages 的子目錄或自定義網域都能運作
    base: './',
    plugins: [react()],
    define: {
      // 確保 API_KEY 被正確字串化並注入
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // 確保資產路徑正確
      assetsDir: 'assets'
    }
  };
});
