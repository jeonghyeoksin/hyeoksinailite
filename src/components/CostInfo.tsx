import React, { useState } from 'react';
import { HelpCircle, X, Coins, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CostInfoProps {
  featureName: string;
  minCost: number;
  maxCost: number;
  description: string;
}

export default function CostInfo({ featureName, minCost, maxCost, description }: CostInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white border border-white/5 rounded-lg text-xs font-semibold transition-all group"
      >
        <Coins className="w-3.5 h-3.5" />
        <span>API 비용 확인</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-zinc-950 border border-white/10 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white">{featureName} 비용</h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">최소 예상</p>
                  <p className="text-lg font-black text-white">
                    {minCost.toLocaleString()} <span className="text-xs font-normal text-zinc-400 ml-0.5">원</span>
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">최대 예상</p>
                  <p className="text-lg font-black text-emerald-400 text-glow">
                    {maxCost.toLocaleString()} <span className="text-xs font-normal text-zinc-400 ml-0.5 text-glow-none">원</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>

              <p className="text-[10px] text-zinc-600 leading-tight">
                * 1달러 = 1,400원 환율 기준 예상치이며, 실제 청구 금액은 Google의 최신 가격 및 토큰 사용량에 따라 달라질 수 있습니다.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
