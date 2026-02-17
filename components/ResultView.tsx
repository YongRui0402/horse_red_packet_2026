
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
    const timer = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const shareToLine = async () => {
    if (!cardRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      const shareText = `🧧 2026 馬年 AI 鑑定報告！我抽到了 NT$ ${result.amount}！\n鑑定官說：「${result.comment.substring(0, 15)}...」快來挑戰你的含梗量！`;
      window.scrollTo(0, 0);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#B30000',
        logging: false,
        width: 400,
        height: cardRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          const noScreenshotElems = clonedDoc.querySelectorAll('.no-screenshot');
          noScreenshotElems.forEach(el => (el as HTMLElement).style.display = 'none');
          
          const clonedCard = clonedDoc.querySelector('.result-card-container');
          if (clonedCard) {
            const cardEl = clonedCard as HTMLElement;
            cardEl.style.transform = 'none';
            cardEl.style.opacity = '1';
            cardEl.style.margin = '0';
            cardEl.style.width = '400px'; 
          }
        }
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], '2026-horse-card.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '2026 馬年專屬祝福卡',
            text: shareText
          });
          setIsSharing(false);
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `馬年專屬祝福卡-${result.nickname}.png`;
      link.href = dataUrl;
      link.click();
      
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + window.location.href)}`;
      window.open(lineUrl, '_blank');
      
    } catch (err) {
      console.error('Sharing failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  const dimensionData = [
    { key: 'literary', label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
    { key: 'blessing', label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
    { key: 'wealth', label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
    { key: 'puns', label: '諧音', score: result.scores.puns, comment: result.dimensionComments.puns },
    { key: 'relevance', label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
    { key: 'memes', label: '迷因', score: result.scores.memes, comment: result.dimensionComments.memes },
  ];

  return (
    <div className="w-full max-w-lg relative flex flex-col items-center py-6 px-4">
      <div 
        ref={cardRef}
        className={`result-card-container bg-white rounded-[2.5rem] shadow-2xl p-6 transition-all duration-1000 ease-out border-[10px] border-[#C5A059] relative overflow-hidden flex flex-col items-center ${
          showCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
        }`}
        style={{ width: '400px' }}
      >
        {/* Header Section */}
        <header className="text-center relative mb-4 w-full border-b-2 border-dashed border-[#C5A059]/20 pb-4 flex flex-col items-center">
          <div className={`mb-3 text-[9px] font-black px-4 py-1 rounded-full ${result.isEasterEgg ? 'bg-red-600 text-white animate-pulse shadow-lg' : 'bg-gray-100 text-[#C5A059]'} italic uppercase tracking-widest`}>
            {result.isEasterEgg ? 'LEGENDARY STATUS' : 'AI VERIFIED CARD'}
          </div>
          <h3 className="text-[#B30000] font-serif text-2xl font-black tracking-widest px-4 leading-tight">
            <span className="text-red-700">{result.nickname}</span> 的專屬祝福卡
          </h3>
          <p className="text-gray-400 font-serif text-[10px] mt-1 tracking-[0.3em] uppercase">2026 丙午年 · 智慧鑑定結果</p>
        </header>

        {/* Amount Section */}
        <div className="text-center mb-6 bg-gradient-to-br from-red-50 to-white w-full py-5 rounded-[2rem] border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/20 rounded-full -mr-12 -mt-12"></div>
          <span className="text-[10px] text-[#B30000] opacity-60 uppercase tracking-[0.5em] block mb-1 font-black">鑑定紅包賞金 / REWARD</span>
          <div className="flex items-baseline justify-center gap-1">
             <span className="text-3xl font-serif text-[#B30000] font-bold">NT$</span>
             <span className="text-7xl font-black text-[#B30000] tabular-nums drop-shadow-sm tracking-tighter">
               {result.amount.toLocaleString()}
             </span>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="w-full bg-[#FFFBF0] p-5 rounded-[1.5rem] border border-[#C5A059]/20 italic text-center relative shadow-inner mb-6 min-h-[80px] flex items-center justify-center">
          <p className="text-[#5D4037] text-md leading-relaxed font-serif break-words px-1">
            「 {result.greeting} 」
          </p>
        </div>

        {/* Radar Chart Section */}
        <div className="w-full bg-gray-50/80 rounded-[2rem] p-2 border border-gray-100 mb-6 relative">
          <div className="absolute top-3 left-4 z-10 text-[9px] font-black text-[#8B4513] opacity-30 uppercase tracking-widest">能力圖譜 / Stats</div>
          {showCard && <RadarChart scores={result.scores} />}
        </div>

        {/* Dimension Details Section */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3 mb-8 px-2">
          {dimensionData.map((d) => (
            <div key={d.key} className="flex flex-col">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-black text-[#8B4513] opacity-70">{d.label}</span>
                <span className="text-[11px] font-mono font-bold text-[#B30000]">{d.score}</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-[#B30000] to-[#FF5252] transition-all duration-1000"
                  style={{ width: showCard ? `${d.score}%` : '0%' }}
                />
              </div>
              <p className="text-[9px] text-gray-400 italic truncate" title={d.comment}>
                {d.comment.split('，')[0]}
              </p>
            </div>
          ))}
        </div>

        {/* Verdict Section */}
        <div className={`w-full p-5 rounded-[2rem] shadow-xl relative overflow-hidden border ${result.isEasterEgg ? 'bg-gradient-to-br from-[#2a0000] to-[#600000] border-yellow-500' : 'bg-[#1a0000] border-[#C5A059]/30'}`}>
          <div className="absolute -bottom-2 -right-4 opacity-10 text-7xl transform rotate-12">🐎</div>
          <div className="absolute top-3 left-5 text-[9px] font-black text-[#C5A059] uppercase tracking-[0.4em]">鑑定官結語 / Verdict</div>
          <p className="text-[#FDF2F2] font-serif text-[15px] leading-relaxed pt-3 relative z-10">
            {result.comment}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 no-screenshot pt-10">
          <button
            onClick={shareToLine}
            disabled={isSharing}
            className="w-full py-5 rounded-full bg-[#06C755] text-white font-black hover:brightness-105 transition flex items-center justify-center space-x-3 shadow-xl transform active:scale-[0.98] text-lg"
          >
            <span className="text-2xl">🧧</span>
            <span className="tracking-[0.2em]">{isSharing ? '卡片製作中...' : '分享福卡至 LINE'}</span>
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 rounded-full border-2 border-gray-100 text-gray-400 text-sm font-black hover:bg-gray-50 transition tracking-[0.3em] bg-white/50 uppercase"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
