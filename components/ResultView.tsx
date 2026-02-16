
import React, { useEffect, useState, useRef } from 'react';
import { ResultData } from '../types';
import RadarChart from './RadarChart';
import html2canvas from 'html2canvas';

interface Props {
  result: ResultData;
  onBack: () => void;
}

const ResultView: React.FC<Props> = ({ result, onBack }) => {
  const [showCard, setShowCard] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setShowCard(true), 300);
  }, []);

  const shareToLine = async () => {
    if (!cardRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      const shareText = `${result.nickname} 在 2026 馬年 AI 紅包獲得了 NT$ ${result.amount}！\n快來試試你的馬年手氣吧！`;
      
      // 修復截圖被切掉的核心邏輯：
      // 1. 先捲動到頂部確保 html2canvas 座標計算正確
      window.scrollTo(0, 0);

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 2倍率兼顧清晰度與檔案大小
        useCORS: true,
        backgroundColor: '#B30000', // 確保背景底色一致
        logging: false,
        // 確保捕捉完整高度與寬度
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // 在克隆出的 DOM 中隱藏不需要的按鈕，確保截圖乾淨
          const noScreenshotElems = clonedDoc.querySelectorAll('.no-screenshot');
          noScreenshotElems.forEach(el => (el as HTMLElement).style.display = 'none');
          
          // 強制克隆出的卡片容器取消動畫位移，避免截圖時還在跑動畫
          const clonedCard = clonedDoc.querySelector('.result-card-container');
          if (clonedCard) {
            (clonedCard as HTMLElement).style.transform = 'none';
            (clonedCard as HTMLElement).style.opacity = '1';
          }
        }
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
      
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], '2026-horse-red-packet.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '2026 馬年 AI 紅包福卡',
            text: shareText
          });
          setIsSharing(false);
          return;
        }
      }

      // 如果瀏覽器不支援 Web Share API，則降級使用圖片下載或 LINE 連結
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `馬年福卡-${result.nickname}.png`;
      link.href = dataUrl;
      link.click();

      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + window.location.href)}`;
      window.open(lineUrl, '_blank');
      
    } catch (err) {
      console.error('Sharing failed', err);
      alert('分享失敗，請稍後再試');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative flex flex-col items-center py-6 px-4">
      {/* 真正要被截圖的卡片區域 */}
      <div 
        ref={cardRef}
        className={`result-card-container bg-white rounded-2xl shadow-2xl p-6 transition-all duration-1000 ease-out border-[8px] border-[#C5A059] relative overflow-hidden ${
          showCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
        }`}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div className="flex flex-col items-center">
          {/* Header Section */}
          <div className="text-center relative mb-6">
            <div className="absolute -top-1 -left-8 text-[#B30000] opacity-10 text-6xl pointer-events-none">🧧</div>
            <h3 className="text-[#B30000] font-serif text-2xl font-bold tracking-widest flex items-center justify-center gap-2">
              <span className="text-red-700">{result.nickname}</span> 的專屬福卡
            </h3>
            <p className="text-gray-400 font-serif text-[11px] mt-2 tracking-widest">2026 丙午年 · 智慧紅包鑑定</p>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mt-4"></div>
          </div>

          {/* Blessing Content Box */}
          <div className="w-full bg-[#FFFBF0] p-6 rounded-xl border border-[#C5A059]/20 italic text-center relative shadow-inner mb-6">
            <span className="absolute top-2 left-4 text-4xl text-[#C5A059] opacity-30 font-serif">“</span>
            <p className="text-[#5D4037] text-lg leading-relaxed font-serif px-2 py-2">
              {result.greeting}
            </p>
            <span className="absolute bottom-1 right-4 text-4xl text-[#C5A059] opacity-30 font-serif">”</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-r border-b border-[#C5A059]/20"></div>
          </div>

          {/* Amount Section */}
          <div className="text-center mb-6">
            <span className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-bold block mb-2">獲得開春紅包</span>
            <div className="flex items-baseline justify-center gap-1">
               <span className="text-3xl font-serif text-[#B30000] font-bold">NT$</span>
               <span className="text-7xl font-black text-[#B30000] tracking-tighter drop-shadow-sm tabular-nums">
                 {result.amount.toLocaleString()}
               </span>
            </div>
          </div>

          {/* Radar Chart Section */}
          <div className="w-full bg-gray-50/30 rounded-2xl p-2 border border-gray-100 mb-6">
            <RadarChart scores={result.scores} />
          </div>

          {/* Dimension Scores Table */}
          <div className="w-full space-y-3 mb-8 px-2">
            {[
              { label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
              { label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
              { label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
              { label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-4">
                <span className="font-bold text-[#8B4513] text-sm w-10">{d.label}</span>
                <div className="bg-[#FDF2F2] px-3 py-1 rounded-lg min-w-[45px] text-center border border-red-100">
                  <span className="text-[#B30000] font-mono font-bold text-sm">{d.score}</span>
                </div>
                <span className="flex-1 text-gray-500 text-sm italic truncate text-right">{d.comment}</span>
              </div>
            ))}
          </div>

          {/* AI Conclusion Box */}
          <div className="bg-[#990000] text-white p-5 w-full rounded-xl shadow-lg relative border-b-4 border-black/20">
            <div className="absolute top-2 right-4 text-[10px] font-bold tracking-tighter opacity-40 uppercase">AI 總結</div>
            <p className="text-[#FDF2F2] italic text-sm leading-relaxed font-serif">
              「{result.comment}」
            </p>
          </div>

          {/* Action Buttons (不截圖) */}
          <div className="w-full space-y-3 no-screenshot pt-10">
            <button
              onClick={shareToLine}
              disabled={isSharing}
              className="w-full py-4 rounded-full bg-[#06C755] text-white font-bold hover:brightness-105 transition flex items-center justify-center space-x-3 shadow-xl transform active:scale-[0.98]"
            >
              <span className="text-2xl">📱</span>
              <span className="tracking-widest text-lg">{isSharing ? '正在製作福卡...' : '分享福卡至 LINE'}</span>
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-full border-2 border-gray-300 text-gray-500 text-sm font-bold hover:bg-gray-50 transition tracking-widest bg-white/50"
            >
              返回首頁
            </button>
          </div>
        </div>
      </div>

      {result.isEasterEgg && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
           <div className="animate-confetti">🐎 🧧 ✨ 💰 🏮</div>
        </div>
      )}

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 4s ease-out infinite;
          font-size: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default ResultView;
