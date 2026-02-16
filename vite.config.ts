
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '');
  
  // 優先從 env 讀取（本地測試用），再從系統環境讀取（GitHub Actions 用）
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    // 這裡必須對應您的 GitHub 儲存庫名稱（子目錄路徑）
    base: '/horse_red_packet_2026/',
    plugins: [react()],
    define: {
      // 這行會將 API_KEY 直接替換進打包後的代碼
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets'
    }
  };
});
