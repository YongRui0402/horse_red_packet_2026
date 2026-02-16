
import React, { useState } from 'react';
import { analyzeGreeting } from '../services/geminiService';
import { ResultData } from '../types';

interface Props {
  onComplete: (data: ResultData) => void;
  onCancel: () => void;
}

const ScoringView: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [greeting, setGreeting] = useState('');
  const [nickname, setNickname] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    'AI 正在品味您的文采...',
    '計算馬年應景指數...',
    '偵測祝福中的情緒頻率...',
    '正在封入紅包中...'
  ];

  const minChars = 30;
  const maxChars = 100;
  const isTooShort = greeting.trim().length < minChars;
  const isTooLong = greeting.trim().length > maxChars;
  const isFormValid = !isTooShort && !isTooLong && nickname.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsAnalyzing(true);
    
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 1500);

    const result = await analyzeGreeting(greeting, nickname);
    
    clearInterval(timer);
    setTimeout(() => {
      onComplete(result);
    }, 800);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="w-48 h-64 bg-[#D10000] rounded-lg shadow-2xl gold-border flex items-center justify-center animate-shake">
            <div className="text-6xl">🧧</div>
          </div>
          <div className="absolute -inset-4 border-2 border-[#C5A059]/30 rounded-2xl animate-ping opacity-20"></div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-xl font-serif text-[#C5A059] animate-pulse">
            {steps[loadingStep]}
          </p>
          <div className="w-64 h-2 bg-black/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full gold-gradient transition-all duration-500 ease-out" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif text-[#C5A059]">撰寫您的馬年祝福</h2>
        <p className="text-gray-300">請輸入暱稱與 {minChars} 至 {maxChars} 字的祝福語</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[#C5A059] text-sm font-bold mb-2">暱稱 (必填)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例如：馬年好運星"
              className="w-full bg-white border-2 border-[#C5A059] rounded-xl px-6 py-3 text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/20 transition-all shadow-md"
              maxLength={20}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-[#C5A059] text-sm font-bold mb-2">祝福內容 ({minChars} - {maxChars} 字)</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="祝您在 2026 丙午馬年龍馬精神、萬事如意、身體健康，全家上下平安喜樂，事業一馬當先，財運馬上有錢，闔家幸福..."
              className="w-full h-48 bg-white border-2 border-[#C5A059] rounded-2xl p-6 text-black text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C5A059]/20 transition-all resize-none shadow-xl"
            />
            <div className={`absolute bottom-4 right-4 text-xs font-bold ${isTooShort || isTooLong ? 'text-red-500' : 'text-green-600'}`}>
              {greeting.length} / {minChars}-{maxChars} 字
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full py-4 rounded-full text-xl font-bold gold-gradient text-[#4A0000] shadow-2xl transform transition active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isTooShort ? `還差 ${minChars - greeting.length} 字` : isTooLong ? `字數過多 (${greeting.length}/${maxChars})` : nickname.trim() ? '提交評分並開啟' : '請輸入暱稱'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-white/50 hover:text-white transition"
          >
            返回首頁
          </button>
        </div>
      </form>
      
      <div className="bg-black/20 p-4 rounded-xl text-xs text-white/60 leading-relaxed text-center">
        💡 提示：內容越有馬年氣息且真誠，獲得高額紅包機率越高！
      </div>
    </div>
  );
};

export default ScoringView;
