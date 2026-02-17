
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
  const [isFinished, setIsFinished] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFinishSharing = () => {
    // 進入成功畫面，引導使用者手動關閉
    setIsFinished(true);
  };

  const shareToLine = async () => {
    if (!cardRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      window.scrollTo(0, 0);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#B30000', 
        logging: false,
        width: 380,
        // 增加更大幅度的高度緩衝，確保底部完全不被切到
        height: cardRef.current.scrollHeight + 100, 
        onclone: (clonedDoc) => {
          const noScreenshotElems = clonedDoc.querySelectorAll('.no-screenshot');
          noScreenshotElems.forEach(el => (el as HTMLElement).style.display = 'none');
          
          const clonedCard = clonedDoc.querySelector('.result-card-container');
          if (clonedCard) {
            const cardEl = clonedCard as HTMLElement;
            cardEl.style.transform = 'none';
            cardEl.style.opacity = '1';
            cardEl.style.margin = '0 auto'; 
            cardEl.style.width = '380px';
            cardEl.style.height = 'auto'; 
            cardEl.style.overflow = 'visible';
            cardEl.style.paddingBottom = '60px'; // 內部增加底距
          }
        }
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], '2026-horse-card.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file]
          });
          handleFinishSharing();
          setIsSharing(false);
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `馬年專屬祝福卡-${result.nickname}.png`;
      link.href = dataUrl;
      link.click();
      
      handleFinishSharing();
      
    } catch (err) {
      console.error('Sharing failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (isFinished) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 min-h-[70vh]">
        <div className="relative mb-10">
           <div className="text-8xl animate-bounce">🧧</div>
           <div className="absolute -inset-6 bg-[#C5A059]/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-serif text-[#C5A059] mb-4 font-black tracking-[0.2em]">祝福已成功送出！</h2>
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-[#C5A059]/20 mb-10 backdrop-blur-md shadow-2xl">
          <p className="text-white/90 text-lg leading-relaxed font-serif">
            感謝您參與 2026 馬年 AI 紅包鑑定。<br/>
            祝您龍馬精神，馬到成功！
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#E2C98C] text-sm font-black uppercase tracking-[0.3em] animate-pulse">
              點擊右上角「╳」關閉此分頁
            </span>
            <div className="w-12 h-1 bg-[#C5A059]/30 rounded-full"></div>
          </div>
          <button 
            onClick={() => setIsFinished(false)}
            className="px-8 py-2 rounded-full border border-white/20 text-white/40 text-[11px] hover:text-white transition tracking-[0.2em] uppercase"
          >
            返回查看卡片
          </button>
        </div>
      </div>
    );
  }

  const dimensionData = [
    { key: 'literary', label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
    { key: 'blessing', label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
    { key: 'wealth', label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
    { key: 'puns', label: '諧音', score: result.scores.puns, comment: result.dimensionComments.puns },
    { key: 'relevance', label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
    { key: 'memes', label: '迷因', score: result.scores.memes, comment: result.dimensionComments.memes },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center py-2 px-4 overflow-y-auto hide-scrollbar">
      <div 
        ref={cardRef}
        className={`result-card-container bg-white rounded-[2rem] shadow-2xl p-5 transition-all duration-1000 ease-out border-[7px] border-[#C5A059] relative overflow-hidden flex flex-col items-center shrink-0 ${
          showCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
        style={{ width: '380px' }}
      >
        <header className="text-center relative mb-3 w-full border-b border-dashed border-[#C5A059]/20 pb-3 flex flex-col items-center">
          <div className={`mb-1 text-[8px] font-black px-3 py-1 rounded-full ${result.isEasterEgg ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-[#C5A059]'} italic uppercase tracking-[0.25em]`}>
            {result.isEasterEgg ? 'LEGENDARY STATUS' : 'AI VERIFIED CARD'}
          </div>
          <h3 className="text-[#B30000] font-serif text-2xl font-black tracking-widest leading-tight">
            <span className="text-red-700">{result.nickname}</span> 的專屬祝福卡
          </h3>
        </header>

        <div className="text-center mb-4 bg-gradient-to-br from-red-50/70 to-white w-full py-2.5 rounded-[1.5rem] border border-red-100 flex items-center justify-around px-5 shadow-sm">
          <span className="text-[10px] text-[#B30000] opacity-60 uppercase tracking-[0.2em] font-black">鑑定紅包賞金 / REWARD</span>
          <div className="flex items-baseline gap-1">
             <span className="text-xl font-serif text-[#B30000] font-bold">NT$</span>
             <span className="text-5xl font-black text-[#B30000] tabular-nums tracking-tighter">
               {result.amount.toLocaleString()}
             </span>
          </div>
        </div>

        <div className="w-full flex gap-3 mb-4 items-center">
          <div className="w-[165px] h-[165px] flex items-center justify-center bg-gray-50/30 rounded-2xl border border-gray-100 overflow-hidden shrink-0 shadow-inner">
            {showCard && <RadarChart scores={result.scores} height={160} />}
          </div>

          <div className="flex-1 space-y-9 py-2 pr-1">
            {dimensionData.map((d) => (
              <div key={d.key} className="flex flex-col relative pb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-black text-[#8B4513] shrink-0 leading-none">{d.label}</span>
                  <div className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#B30000] to-[#FF5252]"
                      style={{ width: showCard ? `${d.score}%` : '0%', transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-black text-[#B30000] shrink-0 w-6 text-right leading-none">{Math.round(d.score)}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-serif italic leading-none opacity-90 pl-0.5 truncate max-w-[130px] absolute top-5 left-0">
                  {d.comment}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full space-y-3 mt-4">
          <div className="w-full bg-[#FFFBF0] p-3.5 rounded-2xl border border-[#C5A059]/15 italic text-center shadow-sm">
            <p className="text-[#5D4037] text-[13px] leading-relaxed font-serif px-2">
              「 {result.greeting.length > 50 ? result.greeting.substring(0, 50) + '...' : result.greeting} 」
            </p>
          </div>

          <div className={`w-full p-4 rounded-2xl shadow-xl relative border ${result.isEasterEgg ? 'bg-gradient-to-br from-[#2a0000] to-[#600000] border-yellow-500' : 'bg-[#1a0000] border-[#C5A059]/40'}`}>
            <div className="absolute top-2 left-5 text-[8px] font-black text-[#C5A059] opacity-70 uppercase tracking-[0.25em]">鑑定官結語 / Verdict</div>
            <p className="text-[#FDF2F2] font-serif text-[14px] leading-relaxed pt-3 pb-2 px-1">
              {result.comment}
            </p>
          </div>
        </div>

        <div className="mt-4 text-[8px] text-gray-300 font-mono tracking-widest uppercase opacity-50">2026 HORSE YEAR AI ENGINE V1.0.9</div>
      </div>

      <div className="w-full max-w-[380px] space-y-3 mt-5 no-screenshot pb-12">
        <button
          onClick={shareToLine}
          disabled={isSharing}
          className="w-full py-4 rounded-full bg-[#06C755] text-white font-black hover:brightness-105 transition flex items-center justify-center space-x-3 shadow-2xl transform active:scale-[0.97]"
        >
          <span className="text-xl">🧧</span>
          <span className="text-lg tracking-[0.1em]">{isSharing ? '卡片製作中...' : '分享福卡並完成'}</span>
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-full border border-white/20 text-white/70 text-xs font-black hover:bg-white/10 transition tracking-[0.2em] bg-transparent uppercase"
        >
          返回修改內容
        </button>
      </div>
    </div>
  );
};

export default ResultView;
