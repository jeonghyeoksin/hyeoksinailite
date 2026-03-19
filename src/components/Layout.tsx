import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Image as ImageIcon, Video, LogOut, Sparkles, ImagePlus, Key, LayoutTemplate, ExternalLink } from 'lucide-react';
import { getApiKey } from '../utils/apiKey';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'applied' | 'missing'>('checking');
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeyStatus(hasKey ? 'applied' : 'missing');
      } else {
        const apiKey = getApiKey();
        if (apiKey) {
          setApiKeyStatus('applied');
        } else {
          setApiKeyStatus('missing');
        }
      }
    } catch (error) {
      setApiKeyStatus('missing');
    }
  };

  const tabs = [
    { id: 'blog', label: '블로그 생성', icon: FileText },
    { id: 'cardnews', label: '카드뉴스 생성', icon: ImageIcon },
    { id: 'image', label: '이미지 생성', icon: ImagePlus },
    { id: 'video', label: '동영상 생성', icon: Video },
    { id: 'detailpage', label: '상세페이지 생성', icon: LayoutTemplate },
  ];

  const handleApiKeyClick = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        checkApiKeyStatus();
      } else {
        setShowApiModal(true);
      }
    } catch (error) {
      console.error('Failed to open API key dialog:', error);
    }
  };

  const saveApiKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
      setApiKeyStatus('applied');
      setShowApiModal(false);
      setTempKey('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-black/40 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">혁신AI Lite</span>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-3 overflow-x-auto md:overflow-x-visible flex md:block">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap group ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-white border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                <span className="font-semibold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto hidden md:block border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border border-white/10">
              <span className="text-xs font-bold text-zinc-300">정</span>
            </div>
            <div className="text-sm font-medium text-zinc-400 tracking-wide">개발자 : 정혁신</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative bg-[#050505]">
        {/* Atmospheric Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[180px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
        
        <main className="p-6 md:p-12 max-w-6xl mx-auto relative z-10">
          {/* Top Header Actions */}
          <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4 mb-8">
            {/* Status Indicator */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border backdrop-blur-md transition-all duration-500 ${
              apiKeyStatus === 'applied' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : apiKeyStatus === 'missing'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiKeyStatus === 'applied' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 
                apiKeyStatus === 'missing' ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)] animate-pulse' : 
                'bg-zinc-400 animate-pulse'
              }`} />
              <span className="text-sm font-semibold tracking-wide">
                {apiKeyStatus === 'applied' ? 'API 키 적용 완료 (혁신AI Lite 사용 가능)' : 
                 apiKeyStatus === 'missing' ? 'API 키 미적용 (설정 필요)' : 
                 'API 키 상태 확인 중...'}
              </span>
            </div>

            <button
              onClick={handleApiKeyClick}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 rounded-full text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            >
              <Key className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="tracking-wide">Google API KEY 설정</span>
            </button>
          </div>

          {/* Banner Image */}
          <div className="w-full aspect-video md:aspect-[21/9] relative rounded-[2rem] overflow-hidden mb-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group">
            <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-emerald-600 to-yellow-500 transition-transform duration-[2000ms] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/60 to-transparent flex flex-col justify-end p-8 md:p-14">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] border border-white/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-yellow-100 tracking-tighter drop-shadow-2xl">
                  혁신AI Lite
                </h1>
              </div>
              <p className="text-zinc-300 text-lg md:text-2xl max-w-3xl leading-relaxed font-medium drop-shadow-lg tracking-tight mb-8">
                혁신AI의 기본기능을 체험해볼 수 있습니다. 고급기능은 혁신AI 프리미엄멤버십 신청시 사용가능합니다.
              </p>
              <a
                href="https://hyeoksinai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-yellow-600 hover:from-emerald-500 hover:to-yellow-500 rounded-2xl text-white font-bold text-lg md:text-xl transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 w-fit"
              >
                <Sparkles className="w-6 h-6 text-emerald-100 group-hover:text-white transition-colors" />
                <span className="tracking-wide">혁신AI 메인 대시보드 바로가기</span>
                <ExternalLink className="w-6 h-6 ml-1 text-emerald-100 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* API Key Modal for Vercel/External Deployment */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Key className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">API 키 설정</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Vercel 등 외부 환경에서 배포된 경우, 이곳에 Google Gemini API 키를 입력하여 적용할 수 있습니다. 키는 브라우저 로컬 스토리지에만 안전하게 저장됩니다.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApiModal(false)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveApiKey}
                disabled={!tempKey.trim()}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
              >
                적용하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
