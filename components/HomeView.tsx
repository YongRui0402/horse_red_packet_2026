import React from 'react';
import { WallItem } from '../types';

interface Props {
  onStart: () => void;
  wallItems: WallItem[];
  stats: { totalAmount: number; totalCount: number };
  isLoading: boolean;
  isError?: boolean;
}

const HomeView: React.FC<Props> = ({ onStart, wallItems, stats, isLoading, isError }) => {
  return (
    <div className="w-full max-w-md flex flex-col pb-32 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="pt-12 pb-8 px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 border-2 border-[#C5A059] rounded-full flex items-center justify-center bg-[#B30000] shadow-xl relative">
             <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse"></div>
            <span className="text-4xl relative z-10">🐎</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-[0.25em] text-[#C5A059] drop-shadow-lg font-serif">
          2026 龍馬精神
        </h1>
        <p className="text-xl mt-3 tracking-[0.4em] opacity-90 font-serif text-white">AI 紅包</p>
      </header>

      <main className="px-6 space-y-8">
        {/* Statistics Board */}
        <section className="ornate-border bg-[#1F0000] p-6 rounded-lg relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-2 border-[#C5A059]/50">
          <div className="ornate-corner-tl text-[#C5A059]">✦</div>
          <div className="ornate-corner-tr text-[#C5A059]">✦</div>
          <div className="ornate-corner-bl text-[#C5A059]">✦</div>
          <div className="ornate-corner-br text-[#C5A059]">✦</div>
          
          {/* Live Indicator - Dynamic Status */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-full border ${isError ? 'border-red-500/40' : 'border-green-500/30'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]'}`}></span>
            <span className={`text-[8px] font-bold tracking-tighter ${isError ? 'text-red-500/80' : 'text-green-500/80'}`}>
              {isError ? 'OFFLINE MODE' : 'CLOUD SYNC'}
            </span>
          </div>

          <h2 className="text-[#C5A059] text-[10px] font-bold mb-6 flex items-center justify-center gap-3 tracking-[0.2em] uppercase">
            <span className="w-6 h-px bg-[#C5A059]/40"></span>
            新春全網數據
            <span className="w-6 h-px bg-[#C5A059]/40"></span>
          </h2>

          <div className="grid grid-cols-2 gap-4 divide-x divide-[#C5A059]/20">
            <div className="text-center">
              <p className="text-[10px] uppercase text-[#E2C98C] opacity-60 mb-1 tracking-widest">累積發放金額</p>
              <p className="text-2xl font-bold text-[#E2C98C] tracking-tighter tabular-nums drop-shadow-sm">
                <span className="text-xs mr-1 opacity-70">NT$</span>
                {isLoading ? "---" : stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase text-[#E2C98C] opacity-60 mb-1 tracking-widest">累積領取人數</p>
              <p className="text-2xl font-bold text-[#E2C98C] tracking-tighter tabular-nums drop-shadow-sm">
                {isLoading ? "---" : stats.totalCount.toLocaleString()}
                <span className="text-xs ml-1 opacity-70">人</span>
              </p>
            </div>
          </div>
        </section>

        {/* 福氣排行榜 */}
        <section className="bg-black/40 rounded-2xl p-6 border border-[#C5A059]/20 relative h-[420px] overflow-hidden shadow-inner">
          {/* 修正標題背景為不透明 (深紅色搭配邊框效果) */}
          <h3 className="text-[#C5A059] text-center text-sm font-bold py-3 sticky top-0 bg-[#3D0000] border-b border-[#C5A059]/30 z-20 font-serif tracking-[0.3em] uppercase drop-shadow-md -mx-6 -mt-6 mb-6 px-6">
            福氣排行榜
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]"></div>
              <p className="text-xs text-[#C5A059]/60">正在同步雲端資料庫...</p>
            </div>
          ) : (
            <div className={`${wallItems.length > 3 ? 'scrolling-content' : ''} space-y-4`}>
              {wallItems.length > 0 ? (
                // 如果資料很少，不重複顯示來維持美觀；資料多時才啟用捲動效果
                (wallItems.length > 3 ? [...wallItems, ...wallItems] : wallItems).map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`} 
                    className="bg-[#2D0000] rounded-xl p-4 border-2 border-[#C5A059]/40 shadow-2xl group hover:border-[#C5A059] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] bg-[#C5A059] text-[#2D0000] px-1.5 py-0.5 rounded font-mono font-bold">
                             RANK {(idx % wallItems.length) + 1}
                           </span>
                           <span className="text-sm font-bold text-white group-hover:text-[#E2C98C] transition-colors">
                             {item.userName.length > 2 ? item.userName.substring(0, 1) + '*' + item.userName.substring(item.userName.length-1) : item.userName}
                           </span>
                        </div>
                        <p className="text-[#F5F5DC]/90 text-xs italic leading-relaxed line-clamp-2">
                          "{item.greeting}"
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#E2C98C] font-bold text-base tabular-nums">
                          NT$ {item.amount.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-[#C5A059]/60 mt-1 font-bold tracking-tighter uppercase">RECEIVED</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                  <span className="text-4xl">🧧</span>
                  <div className="text-sm text-[#C5A059] italic font-serif">首位馬年幸運兒<br/>等待您來領取紅包</div>
                </div>
              )}
            </div>
          )}

          {/* Gradient Masks */}
          <div className="absolute top-10 left-0 right-0 h-12 bg-gradient-to-b from-[#3D0000] to-transparent pointer-events-none z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
        </section>
      </main>

      {/* Sticky Bottom Action */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent backdrop-blur-sm z-50 flex justify-center">
        <button
          onClick={onStart}
          className="w-full max-w-sm bg-[#C5A059] hover:bg-[#d9b36d] text-[#4A0000] font-bold py-5 rounded-full shadow-[0_15px_35px_rgba(197,160,89,0.5)] transition-all transform active:scale-95 text-xl tracking-[0.5em] border-2 border-white/30 font-serif flex items-center justify-center gap-3"
        >
          <span>🧧</span> 領取紅包 <span>🧧</span>
        </button>
      </footer>
    </div>
  );
};

export default HomeView;
