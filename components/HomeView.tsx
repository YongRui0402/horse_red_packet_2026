
import React from 'react';
import { WallItem } from '../types';

interface Props {
  onStart: () => void;
  wallItems: WallItem[];
  stats: { totalAmount: number; totalCount: number };
}

const HomeView: React.FC<Props> = ({ onStart, wallItems, stats }) => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#C5A059] drop-shadow-lg">
          2026 馬年
        </h1>
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-widest">
          AI 智慧紅包
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full bg-black/20 p-6 rounded-xl border border-[#C5A059]/30 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">累計發出金額</span>
          <span className="text-2xl font-bold text-[#C5A059]">NT$ {stats.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">領取人數</span>
          <span className="text-2xl font-bold text-[#C5A059]">{stats.totalCount} 人</span>
        </div>
      </div>

      <div className="w-full bg-black/10 rounded-xl p-4 h-64 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#B30000]/80 z-10 pointer-events-none"></div>
        <div className="text-left font-serif text-sm text-[#C5A059]/80 mb-4 border-b border-[#C5A059]/20 pb-2">
          近期高分佳句牆
        </div>
        <div className="space-y-4 animate-scroll">
          {wallItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
              <div className="flex-1 mr-4">
                <p className="text-white text-sm line-clamp-1">「{item.greeting}」</p>
                <p className="text-xs text-gray-400">— {item.userName}</p>
              </div>
              <div className="text-[#C5A059] font-bold text-lg">NT$ {item.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-full text-xl font-bold gold-gradient text-[#4A0000] shadow-2xl transform transition active:scale-95 hover:brightness-110 flex items-center justify-center space-x-2"
      >
        <span>🧧</span>
        <span>領取馬年大紅包</span>
        <span>🧧</span>
      </button>

      <p className="text-xs text-white/50">
        AI 自動評分 | 2026 丙午馬年限定 | 文采、財氣、福氣一次擁有 | 羊.tw
      </p>

      <style>{`
        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeView;
