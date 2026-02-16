
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
      
      // 1. Attempt to capture image for sharing
      if (cardRef.current && navigator.share && navigator.canShare) {
        const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#FFFFFF' });
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'red-envelope-result.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: '2026 馬年 AI 紅包結果',
                text: shareText
              });
              setIsSharing(false);
              return;
            }
          }
        });
      }

      // 2. Fallback: Traditional LINE Text/URL sharing
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`;
      window.open(lineUrl, '_blank');
    } catch (err) {
      console.error('Sharing failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative flex flex-col items-center">
      {/* Red Envelope Shell Background */}
      <div className="w-full aspect-[3/4.5] bg-[#B30000] rounded-2xl shadow-inner relative overflow-hidden flex items-end p-4 border-t-4 border-[#8B0000]">
         <div className="absolute top-4 left-4 text-6xl opacity-10">馬</div>
         <div className="absolute bottom-4 right-4 text-6xl opacity-10">福</div>
      </div>

      {/* The Extracted Card */}
      <div 
        ref={cardRef}
        className={`absolute inset-x-4 top-0 bg-white rounded-xl shadow-2xl p-6 transition-all duration-1000 ease-out border-4 border-[#C5A059] ${
          showCard ? 'translate-y-4 opacity-100' : 'translate-y-64 opacity-0'
        }`}
        style={{ zIndex: 20 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <h3 className="text-[#B30000] font-serif text-sm font-bold uppercase tracking-widest">{result.nickname} 的馬年福卡</h3>
            <h3 className="text-gray-400 font-serif text-xs">2026 丙午年</h3>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-2"></div>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs text-gray-500">獲得金額</span>
            <div className="text-5xl font-bold text-[#B30000]">
              <span className="text-2xl mr-1">NT$</span>
              {result.amount}
            </div>
            {result.isEasterEgg && (
              <div className="bg-[#C5A059] text-white text-[10px] px-2 py-0.5 rounded-full inline-block animate-bounce mt-2 uppercase tracking-tighter">
                Easter Egg!
              </div>
            )}
          </div>

          <div className="w-full">
            <RadarChart scores={result.scores} />
          </div>

          {/* 5-Dimension Detailed Comments */}
          <div className="w-full grid grid-cols-1 gap-1 text-[10px]">
            {[
              { label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
              { label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
              { label: '情緒', score: result.scores.emotion, comment: result.dimensionComments.emotion },
              { label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
              { label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between border-b border-gray-50 pb-0.5">
                <span className="font-bold text-gray-700 w-10">{d.label}</span>
                <span className="text-[#C5A059] font-mono font-bold mr-2">{d.score}%</span>
                <span className="flex-1 text-gray-500 text-right truncate italic">{d.comment}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF9F6] border-l-4 border-[#C5A059] p-3 w-full">
            <p className="text-[#4A4A4A] italic text-xs leading-relaxed">
              AI 總評：「{result.comment}」
            </p>
          </div>

          <div className="w-full space-y-2 no-screenshot">
            <button
              onClick={shareToLine}
              disabled={isSharing}
              className="w-full py-3 rounded-lg bg-[#06C755] text-white font-bold hover:brightness-105 transition flex items-center justify-center space-x-2 shadow-md"
            >
              <span>{isSharing ? '處理中...' : '分享結果至 LINE'}</span>
            </button>
            <button
              onClick={onBack}
              className="w-full py-2 rounded-lg border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 transition"
            >
              再試一次
            </button>
          </div>
        </div>
      </div>

      {result.isEasterEgg && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
           <div className="animate-confetti">✨ 🐎 🧧 💰 ✨</div>
        </div>
      )}

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out infinite;
          font-size: 2rem;
        }
        @media screen {
          .no-screenshot {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultView;
