
import { createClient } from '@supabase/supabase-js';
import { WallItem } from '../types';

const SUPABASE_URL = 'https://hkldokysyknysyzsoxrn.supabase.co';
// 使用使用者提供的最新 Key
const SUPABASE_KEY = 'sb_publishable_dZRbolbFxk37XdYIjgh6BA_nrSfUqa9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 基礎數值設定為 0，確保完全顯示真實數據
const BASE_AMOUNT = 0;
const BASE_COUNT = 0;

export const databaseService = {
  getWallItems: async (): Promise<WallItem[]> => {
    try {
      const { data, error } = await supabase
        .from('red_packet_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const onlineItems: WallItem[] = (data || []).map(row => ({
        id: String(row.id || Date.now()),
        userName: row.user_name || '匿名馬迷',
        greeting: row.greeting || '',
        amount: Number(row.amount || 0)
      }));

      // 只回傳真實數據，不加入任何假資料
      return onlineItems;
    } catch (err) {
      console.error('Fetch WallItems failed:', err);
      return [];
    }
  },

  saveWallItem: async (item: WallItem): Promise<void> => {
    try {
      const { error } = await supabase
        .from('red_packet_logs')
        .insert([{
          user_name: item.userName,
          greeting: item.greeting,
          amount: item.amount
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Save WallItem failed:', err);
      throw err;
    }
  },

  getStats: async (): Promise<{ totalAmount: number; totalCount: number }> => {
    try {
      const { data, error } = await supabase
        .from('red_packet_logs')
        .select('amount');

      if (error) throw error;

      const onlineTotalAmount = (data || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const onlineTotalCount = (data || []).length;

      return {
        totalAmount: BASE_AMOUNT + onlineTotalAmount,
        totalCount: BASE_COUNT + onlineTotalCount
      };
    } catch (err) {
      console.error('Get Stats failed:', err);
      return { totalAmount: BASE_AMOUNT, totalCount: BASE_COUNT };
    }
  }
};
