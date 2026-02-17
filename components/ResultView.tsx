
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
        scale: 2, 
        useCORS: true,
        backgroundColor: '#B30000',
        logging: false,
        width: 360,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('ultimate-compact-template-v2');
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
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 min-h-[50vh]">
        <div className="text-5xl mb-4 animate-bounce">🧧</div>
        <h2 className="text-xl font-serif text-[#C5A059] mb-4 font-black">鑑定福卡已生成！</h2>
        <div className="bg-black/30 p-5 rounded-3xl border border-[#C5A059]/20 mb-6 backdrop-blur-md">
          <p className="text-white/90 text-[13px] leading-relaxed font-serif">
            紅包鑑定紀錄成功。<br/>
            祝您馬年萬事如意，馬上有錢！
          </p>
        </div>
        <button onClick={() => setIsFinished(false)} className="text-white/30 text-[9px] underline uppercase tracking-widest">
          返回查看卡片
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
    <div className="w-full h-full flex flex-col items-center py-1 px-4 overflow-y-auto hide-scrollbar">
      {/* 視覺卡片 (極致緊湊版 v1.1.2) */}
      <div className={`bg-white rounded-[1.2rem] shadow-2xl p-3 border-[4px] border-[#C5A059] relative transition-all duration-700 ${showCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ width: '340px' }}>
        <header className="text-center mb-1 border-b border-dashed border-[#C5A059]/20 pb-1">
          <h3 className="text-[#B30000] font-serif text-sm font-black truncate">{result.nickname} 的祝福鑑定</h3>
        </header>

        <div className="bg-red-50/50 py-1 rounded-lg text-center mb-1.5 border border-red-100">
          <span className="text-[8px] text-red-800 font-black opacity-40 block uppercase">Reward</span>
          <span className="text-2xl font-black text-red-700 leading-none">NT$ {result.amount.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-[90px] h-[90px] shrink-0">
             {showCard && <RadarChart scores={result.scores} height={90} />}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-1">
            {dimensionData.map(d => (
              <div key={d.label} className="border-l border-red-100 pl-1 leading-none">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[8px] font-black text-gray-700">{d.label}</span>
                  <span className="text-[7px] font-mono text-red-600 font-bold">{Math.round(d.score)}</span>
                </div>
                <div className="text-[7px] text-gray-400 italic truncate opacity-70">{d.comment}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="bg-yellow-50/20 p-1.5 rounded border border-yellow-100/40 text-center italic text-[9px] text-[#5D4037] leading-tight max-h-12 overflow-hidden">
            「 {result.greeting.length > 35 ? result.greeting.substring(0, 35) + '...' : result.greeting} 」
          </div>
          <div className="bg-[#1a0000] p-2 rounded-lg border border-[#C5A059]/20">
            <p className="text-[#FDF2F2] font-serif text-[10px] leading-snug">{result.comment}</p>
          </div>
        </div>
        <div className="mt-1 text-[5px] text-gray-200 text-center opacity-20 tracking-tighter uppercase">v1.1.2 EXTREME COMPACT</div>
      </div>

      {/* 截圖專用模板：極速穩定佈局 */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={screenshotRef} id="ultimate-compact-template-v2" style={{ width: '360px', backgroundColor: '#B30000', padding: '10px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '18px', border: '5px solid #C5A059' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ color: '#B30000', fontSize: '18px', margin: '0', fontWeight: '900' }}>{result.nickname} 的祝福卡</h2>
            </div>

            <div style={{ backgroundColor: '#FFF5F5', borderRadius: '10px', padding: '8px', textAlign: 'center', marginBottom: '10px' }}>
               <span style={{ fontSize: '9px', color: '#B30000', opacity: 0.5 }}>鑑定賞金 REWARD</span>
               <div style={{ fontSize: '32px', fontWeight: '900', color: '#B30000', lineHeight: '1.1' }}>NT$ {result.amount.toLocaleString()}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <tbody>
                <tr>
                  {[0, 1].map(colIdx => (
                    <td key={colIdx} style={{ width: '50%', verticalAlign: 'top', padding: '0 3px' }}>
                      {dimensionData.slice(colIdx * 3, colIdx * 3 + 3).map(d => (
                        <div key={d.label} style={{ marginBottom: '5px', borderBottom: '1px solid #f2f2f2', paddingBottom: '1px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                            <span style={{ color: '#8B4513' }}>{d.label}</span>
                            <span style={{ color: '#B30000' }}>{Math.round(d.score)}</span>
                          </div>
                          <div style={{ fontSize: '7px', color: '#bbb', fontStyle: 'italic' }}>{d.comment}</div>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div style={{ backgroundColor: '#FFFEF5', borderRadius: '6px', padding: '8px', textAlign: 'center', marginBottom: '10px', border: '1px solid #eee' }}>
              <p style={{ color: '#5D4037', fontSize: '11px', margin: 0, fontStyle: 'italic', lineHeight: '1.3' }}>「 {result.greeting} 」</p>
            </div>

            <div style={{ backgroundColor: '#1A0000', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontSize: '7px', color: '#C5A059', display: 'block', marginBottom: '2px', opacity: 0.7 }}>鑑定官結語 VERDICT</span>
              <p style={{ color: 'white', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>{result.comment}</p>
            </div>
            
            <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '5px', color: '#ddd', letterSpacing: '1px' }}>
              2026 HORSE YEAR AI ENGINE | v1.1.2
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[340px] space-y-2.5 mt-4 no-screenshot pb-6">
        <button onClick={shareToLine} disabled={isSharing} className="w-full py-3.5 rounded-full bg-[#06C755] text-white font-black shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
          <span>{isSharing ? '正在處理圖卡...' : '分享福卡並完成'}</span>
        </button>
        <button onClick={onBack} className="w-full py-1.5 text-white/30 text-[8px] tracking-widest uppercase font-bold">
          返回修改內容
        </button>
      </div>
    </div>
  );
};

export default ResultView;
