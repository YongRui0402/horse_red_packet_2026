
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
  const screenshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const shareToLine = async () => {
    if (!screenshotRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      window.scrollTo(0, 0);

      const canvas = await html2canvas(screenshotRef.current, {
        scale: 2, // 2倍率足夠清晰且體積小
        useCORS: true,
        backgroundColor: '#B30000',
        logging: false,
        width: 380,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('ultra-compact-template');
          if (target) {
            target.style.display = 'block';
            target.style.opacity = '1';
          }
        }
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
      
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], '2026-horse-card.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          setIsFinished(true);
          setIsSharing(false);
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `馬年祝福-${result.nickname}.png`;
      link.href = dataUrl;
      link.click();
      setIsFinished(true);
      
    } catch (err) {
      console.error('Sharing failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (isFinished) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="text-7xl mb-6 animate-bounce">🧧</div>
        <h2 className="text-2xl font-serif text-[#C5A059] mb-4 font-black">分享已完成！</h2>
        <div className="bg-black/30 p-6 rounded-3xl border border-[#C5A059]/20 mb-10 backdrop-blur-md">
          <p className="text-white/90 text-sm leading-relaxed font-serif">
            紅包鑑定已紀錄。<br/>
            祝您馬年龍馬精神，大吉大利！
          </p>
        </div>
        <p className="text-[#E2C98C] text-[11px] font-black uppercase tracking-[0.2em] mb-8">
          請點擊右上角「╳」關閉
        </p>
        <button onClick={() => setIsFinished(false)} className="text-white/20 text-[10px] underline uppercase tracking-widest">
          返回卡片
        </button>
      </div>
    );
  }

  const dimensionData = [
    { label: '文采', score: result.scores.literary, comment: result.dimensionComments.literary },
    { label: '福氣', score: result.scores.blessing, comment: result.dimensionComments.blessing },
    { label: '發財', score: result.scores.wealth, comment: result.dimensionComments.wealth },
    { label: '諧音', score: result.scores.puns, comment: result.dimensionComments.puns },
    { label: '應景', score: result.scores.relevance, comment: result.dimensionComments.relevance },
    { label: '迷因', score: result.scores.memes, comment: result.dimensionComments.memes },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center py-2 px-4 overflow-y-auto hide-scrollbar">
      {/* 視覺卡片 (緊湊顯示版) */}
      <div className={`bg-white rounded-[1.8rem] shadow-2xl p-4 border-[6px] border-[#C5A059] relative transition-all duration-700 ${showCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ width: '360px' }}>
        <header className="text-center mb-2 border-b border-dashed border-[#C5A059]/20 pb-2">
          <div className="text-[7px] font-black px-2 py-0.5 bg-gray-100 text-[#C5A059] inline-block rounded-full mb-1">AI VERIFIED</div>
          <h3 className="text-[#B30000] font-serif text-lg font-black">{result.nickname} 的馬年福卡</h3>
        </header>

        <div className="bg-red-50/50 py-2 rounded-xl text-center mb-3">
          <span className="text-[10px] text-red-800 font-black opacity-50 block">賞金 REWARD</span>
          <span className="text-3xl font-black text-red-700">NT$ {result.amount.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-[120px] h-[120px] shrink-0">
             {showCard && <RadarChart scores={result.scores} height={120} />}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-3">
            {dimensionData.map(d => (
              <div key={d.label} className="border-l-2 border-red-100 pl-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-700">{d.label}</span>
                  <span className="text-[9px] font-mono text-red-600 font-bold">{Math.round(d.score)}</span>
                </div>
                <div className="text-[8px] text-gray-400 italic truncate">{d.comment}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-yellow-50/30 p-2 rounded-lg border border-yellow-100/50 text-center italic text-[11px] text-[#5D4037]">
            「 {result.greeting} 」
          </div>
          <div className="bg-[#1a0000] p-3 rounded-lg border border-[#C5A059]/30">
            <p className="text-[#FDF2F2] font-serif text-[12px] leading-relaxed">{result.comment}</p>
          </div>
        </div>
        <div className="mt-2 text-[7px] text-gray-200 text-center">HORSE AI v1.1.1</div>
      </div>

      {/* 截圖專用模板：極度緊湊且穩定 */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={screenshotRef} id="ultra-compact-template" style={{ width: '380px', backgroundColor: '#B30000', padding: '15px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '25px', padding: '25px', border: '6px solid #C5A059' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '10px', color: '#C5A059', fontWeight: 'bold' }}>2026 HORSE YEAR SPECIAL</span>
              <h2 style={{ color: '#B30000', fontSize: '24px', margin: '5px 0' }}>{result.nickname} 的祝福卡</h2>
            </div>

            <div style={{ backgroundColor: '#FFF5F5', borderRadius: '15px', padding: '15px', textAlign: 'center', marginBottom: '20px' }}>
               <span style={{ fontSize: '12px', color: '#B30000' }}>鑑定紅包賞金 / REWARD</span>
               <div style={{ fontSize: '48px', fontWeight: '900', color: '#B30000' }}>NT$ {result.amount.toLocaleString()}</div>
            </div>

            {/* 核心數據區：使用兩欄式表格佈局壓縮高度且防遮擋 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  {[0, 1].map(colIdx => (
                    <td key={colIdx} style={{ width: '50%', verticalAlign: 'top', padding: '0 5px' }}>
                      {dimensionData.slice(colIdx * 3, colIdx * 3 + 3).map(d => (
                        <div key={d.label} style={{ marginBottom: '10px', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: '#8B4513' }}>{d.label}</span>
                            <span style={{ color: '#B30000' }}>{Math.round(d.score)}</span>
                          </div>
                          <div style={{ fontSize: '9px', color: '#999', fontStyle: 'italic' }}>{d.comment}</div>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div style={{ backgroundColor: '#FFFEF5', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '15px', border: '1px solid #eee' }}>
              <p style={{ color: '#5D4037', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>「 {result.greeting} 」</p>
            </div>

            <div style={{ backgroundColor: '#1A0000', borderRadius: '12px', padding: '18px' }}>
              <span style={{ fontSize: '9px', color: '#C5A059', display: 'block', marginBottom: '5px', opacity: 0.8 }}>鑑定官結語 VERDICT</span>
              <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{result.comment}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[360px] space-y-3 mt-4 no-screenshot pb-10">
        <button onClick={shareToLine} disabled={isSharing} className="w-full py-4 rounded-full bg-[#06C755] text-white font-black shadow-xl active:scale-95 transition">
          {isSharing ? '卡片製作中...' : '分享福卡並完成'}
        </button>
        <button onClick={onBack} className="w-full py-2 text-white/40 text-[10px] tracking-widest uppercase">
          返回修改內容
        </button>
      </div>
    </div>
  );
};

export default ResultView;
