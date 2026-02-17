
import { createClient } from '@supabase/supabase-js';
import { WallItem } from '../types';

const SUPABASE_URL = 'https://hkldokysyknysyzsoxrn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dZRbolbFxk37XdYIjgh6BA_nrSfUqa9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_AMOUNT = 0;
const BASE_COUNT = 0;

export const databaseService = {
  getWallItems: async (): Promise<WallItem[]> => {
    try {
      const { data, error } = await supabase
        .from('red_packet_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(row => ({
        id: String(row.id),
        userName: row.user_name || '匿名馬迷',
        greeting: row.greeting || '',
        amount: Number(row.amount || 0),
        comment: row.comment || null 
      }));
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
          amount: item.amount,
          comment: item.comment 
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Save WallItem failed:', err);
      throw err;
    }
  },

  updateWallItemComment: async (id: string, comment: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('red_packet_logs')
        .update({ comment })
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST204') {
          console.error("資料庫缺少 'comment' 欄位，請前往 SQL Editor 執行 ALTER TABLE 指令。");
        }
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Update WallItem Comment failed:', err);
      return false;
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
