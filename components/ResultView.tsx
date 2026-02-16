
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
    setIsSharing(true);
    try {
      const shareText = `${result.nickname} 在 2026 馬年 AI 紅包獲得了 NT$ ${result.amount}！\nAI 評語：「${result.comment}」\n快來試試你的馬年手氣吧！`;
      const shareUrl = window.location.href;
      
      if (cardRef.current && navigator.share && navigator.canShare) {
        const canvas = await html2canvas(cardRef.current, { 
          scale: 3, 
          backgroundColor: '#B30000', // 使用底色防止白邊
          useCORS: true,
          logging: false,
          ignoreElements: (el) => el.classList.contains('no-screenshot')
        });
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'red-envelope-result.png', { type: 'image/png' });
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
        });
      }

      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`;
      window.open(lineUrl, '_blank');
    } catch (err) {
      console.error('Sharing failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative flex flex-col items-center min-h-[900px] py-10">
      {/* The Red Envelope Background Decoration */}
      <div className="absolute inset-x-0 top-0 h-full bg-[#8B0000] rounded-3xl -z-10 shadow-2xl overflow-hidden opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] text-[#B30000] font-serif opacity-10 rotate-12">馬</div>
      </div>

      {/* The Actual Card to be Shared */}
      <div 
        ref={cardRef}
        className={`bg-white rounded-2xl shadow-2xl p-8 transition-all duration-1000 ease-out border-[6px] border-[#C5A059] relative ${
          showCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
        }`}
        style={{ width: '95%', maxWidth: '420px' }}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center relative">
             <div className="absolute -top-4 -left-4 text-[#C5A059] opacity-20 text-4xl">🧧</div>
            <h3 className="text-[#B30000] font-serif text-lg font-bold uppercase tracking-[0.2em]">{result.nickname} 的專屬福卡</h3>
            <p className="text-gray-400 font-serif text-[10px] mt-1 italic">2026 丙午年 · 智慧紅包鑑定</p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mt-3"></div>
          </div>

          {/* User's Original Greeting - The Highlight */}
          <div className="w-full bg-[#FFFBF0] p-5 rounded-xl border border-[#C5A059]/20 italic text-center relative shadow-sm">
            <span className="absolute top-2 left-3 text-3xl text-[#C5A059] opacity-20 font-serif">“</span>
            <p className="text-[#5D4037] text-base leading-relaxed font-serif px-4 py-2">
              {result.greeting}
            </p>
            <span className="absolute bottom-1 right-3 text-3xl text-[#C5A059] opacity-20 font-serif">”</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-r border-b border-[#C5A059]/20"></div>
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">獲得開春紅包</span>
            <div className="text-6xl font-black text-[#B30000] tracking-tighter tabular-nums drop-shadow-sm flex items-baseline justify-center">
              <span className="text-2xl mr-2 font-serif">NT$</span>
              {result.amount.toLocaleString()}
            </div>
            {result.isEasterEgg && (
              <div className="bg-[#B30000] text-[#E2C98C] text-[11px] px-5 py-1.5 rounded-full inline-block animate-bounce mt-3 uppercase tracking-widest font-bold border-2 border-[#C5A059]">
                🎊 神駒降臨 · 隱藏成就 🎊
              </div>
            )}
          </div>

          <div className="w-full bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <RadarChart scores={result.scores} />
          </div>

          <div className="w-full grid grid-cols-1 gap-2 text-[11px] font-serif">
            {[
              { label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
              { label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
              { label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
              { label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                <span className="font-bold text-[#8B4513] w-12">{d.label}</span>
                <span className="text-[#C5A059] font-mono font-bold mx-2 bg-[#FDF2F2] px-2 py-0.5 rounded">{d.score}</span>
                <span className="flex-1 text-gray-500 text-right truncate italic">{d.comment}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#B30000] text-white p-4 w-full rounded-xl shadow-inner relative">
             <div className="absolute top-0 right-0 p-1 opacity-20 text-xs">AI 總結</div>
            <p className="text-[#FDF2F2] italic text-xs leading-relaxed font-serif">
              「{result.comment}」
            </p>
          </div>

          {/* Action Buttons (Excluded from Screenshot) */}
          <div className="w-full space-y-3 no-screenshot pt-4">
            <button
              onClick={shareToLine}
              disabled={isSharing}
              className="w-full py-4 rounded-full bg-[#06C755] text-white font-bold hover:brightness-105 transition flex items-center justify-center space-x-3 shadow-lg transform active:scale-[0.98]"
            >
              <span className="text-xl">LINE</span>
              <span className="tracking-widest">{isSharing ? '正在製圖...' : '分享福氣至 LINE'}</span>
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-full border-2 border-gray-200 text-gray-400 text-sm font-bold hover:bg-gray-50 transition tracking-widest"
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
