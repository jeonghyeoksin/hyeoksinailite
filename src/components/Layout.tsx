import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Image as ImageIcon, Video, LogOut, Sparkles, ImagePlus, Key, LayoutTemplate, ExternalLink, Info, Home } from 'lucide-react';
import { getApiKey } from '../utils/apiKey';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'applied' | 'missing'>('checking');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showApiKeyGuideModal, setShowApiKeyGuideModal] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const helpContent: Record<string, { title: string, desc: string, steps: string[] }> = {
    home: {
      title: '혁신AI Lite 홈',
      desc: '혁신AI Lite의 전체 기능을 한눈에 확인하고 이동할 수 있는 대시보드입니다.',
      steps: [
        '좌측 메뉴 또는 화면의 카드를 클릭하여 원하는 생성 기능으로 이동하세요.',
        '모든 기능은 우측 상단의 "Google API KEY 설정"이 완료되어야 정상 작동합니다.',
        '각 기능 화면에서 "사용방법" 버튼을 누르면 상세한 안내를 볼 수 있습니다.'
      ]
    },
    blog: {
      title: '블로그 생성 사용방법',
      desc: 'SEO에 최적화된 전문적인 블로그 포스트를 손쉽게 작성해보세요.',
      steps: [
        '작성하고자 하는 블로그의 핵심 주제를 입력합니다.',
        '우측 상단의 "✨ AI 자동 기획" 버튼을 누르면 타겟 독자, 목적, 어조 등이 자동으로 추천됩니다.',
        '필요에 따라 상호명, 아이템명, 구체적인 CTA(행동 유도)를 추가로 입력합니다.',
        '"블로그 작성하기" 버튼을 누르면 마크다운 형식의 깔끔한 포스팅이 생성됩니다.',
        '결과물 우측 상단의 "복사하기"를 눌러 블로그에 바로 붙여넣기 하세요.'
      ]
    },
    cardnews: {
      title: '카드뉴스 생성 사용방법',
      desc: '인스타그램, 페이스북 등 SNS에 올릴 매력적인 카드뉴스를 기획하고 디자인합니다.',
      steps: [
        '카드뉴스의 메인 주제를 입력합니다.',
        '"✨ AI 자동 기획" 버튼을 눌러 타겟 독자와 톤앤매너, 디자인 스타일을 자동 설정합니다.',
        '원하는 장수(3~8장)와 비율을 선택한 후 "텍스트 생성"을 누릅니다.',
        '각 장에 들어갈 제목, 내용, 이미지 프롬프트가 기획되어 나타납니다.',
        '기획안이 마음에 들면 "배경 이미지 생성하기"를 눌러 각 장에 어울리는 고품질 이미지를 생성하세요.'
      ]
    },
    image: {
      title: '이미지 생성 사용방법',
      desc: '나노바나나2 모델을 활용하여 한국어 텍스트가 포함된 고품질 이미지를 생성합니다.',
      steps: [
        '생성하고 싶은 이미지의 주제를 입력합니다.',
        '"✨ AI 자동 기획" 버튼을 누르면 화풍, 색감, 분위기, 조명 등이 주제에 맞게 자동 설정됩니다.',
        '내용 란에 이미지 안에 포함하고 싶은 구체적인 묘사나 "한국어 텍스트"를 적어주세요.',
        '비율(정방형 또는 가로형)을 선택하고 "이미지 생성하기"를 누릅니다.',
        '생성된 이미지 우측 하단의 다운로드 버튼을 눌러 이미지를 저장하세요.'
      ]
    },
    video: {
      title: '동영상 생성 사용방법',
      desc: 'Veo 모델을 사용하여 프롬프트 기반의 고품질 짧은 동영상을 생성합니다.',
      steps: [
        '영상에 등장할 메인 주제나 피사체를 입력합니다.',
        '"✨ AI 자동 기획" 버튼을 누르면 피사체에 어울리는 동작, 배경, 카메라 워크, 조명이 자동 설정됩니다.',
        '세부적인 움직임이나 환경을 직접 수정할 수도 있습니다.',
        '원하는 비율을 선택하고 "동영상 생성하기"를 누릅니다.',
        '동영상 생성은 모델 특성상 몇 분 정도 소요될 수 있습니다. 완료 후 다운로드 가능합니다.'
      ]
    },
    detailpage: {
      title: '상세페이지 생성 사용방법',
      desc: '이커머스 및 랜딩페이지용 상세페이지 이미지를 통째로 디자인합니다.',
      steps: [
        '제품/서비스명과 카테고리(주제)를 입력합니다.',
        '"✨ AI 자동 기획" 버튼을 누르면 타겟 고객, 핵심 소구점, 레이아웃, 메인 색상이 자동 기획됩니다.',
        '원하는 상세페이지 장수와 비율(1:4 또는 1:8)을 선택합니다.',
        '"상세페이지 생성하기"를 누르면 한국어 타이포그래피가 깨지지 않고 세련되게 배치된 긴 이미지가 생성됩니다.',
        '생성 완료 후 하단의 다운로드 버튼을 통해 이미지를 저장하세요.'
      ]
    }
  };

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
    { id: 'home', label: '홈', icon: Home },
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
              onClick={() => setShowApiKeyGuideModal(true)}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 rounded-full text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Key className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="tracking-wide">API Key 설정방법</span>
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 rounded-full text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <Info className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="tracking-wide">사용방법</span>
            </button>

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
                혁신AI의 기본기능을 체험해볼 수 있습니다. <br /> 고급기능은 혁신AI 프리미엄멤버십 신청시 사용가능합니다.
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

      {/* API Key Guide Modal */}
      {showApiKeyGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden my-8"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <Key className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Google API Key 발급 및 설정 방법</h3>
              </div>
              <button 
                onClick={() => setShowApiKeyGuideModal(false)}
                className="text-zinc-500 hover:text-white p-2 transition-colors"
              >
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-amber-400 font-bold flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">1</span>
                  Google AI Studio 접속
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  먼저 Google의 AI 스튜디오 페이지에 접속해야 합니다. 구글 계정으로 로그인이 필요합니다.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-amber-100 transition-colors border border-white/5"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google AI Studio 바로가기
                </a>
              </section>

              <section className="space-y-3">
                <h4 className="text-amber-400 font-bold flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">2</span>
                  API Key 생성
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  화면 왼쪽 메뉴에서 <span className="text-white font-semibold">"Get API key"</span> 버튼을 클릭한 후, <span className="text-white font-semibold">"Create API key in new project"</span> 버튼을 눌러 키를 생성합니다.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-amber-400 font-bold flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">3</span>
                  Key 복사 및 보안 확인
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  생성된 API Key(AIzaSy...)를 <span className="text-white font-semibold">복사(Copy)</span>합니다. 팝업창에서 'Copy' 버튼을 누르면 클립보드에 저장됩니다.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-amber-400 font-bold flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">4</span>
                  혁신AI Lite에 설정
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  현재 페이지 우측 상단의 <span className="text-white font-semibold">"Google API KEY 설정"</span> 버튼을 클릭한 후, 복사한 키를 붙여넣고 <span className="text-white font-semibold">"적용하기"</span>를 클릭합니다.
                </p>
              </section>
              
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  💡 <span className="font-bold">주의사항:</span> 발급받은 API 키는 개인의 자산입니다. 타인에게 공유하지 않도록 주의해 주세요. 본 서비스는 입력하신 키를 서버로 전송하지 않으며, 브라우저의 로컬 스토리지에만 안전하게 저장합니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApiKeyGuideModal(false)}
              className="w-full mt-8 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 font-semibold transition-all border border-amber-500/20"
            >
              확인 후 닫기
            </button>
          </motion.div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{helpContent[activeTab]?.title}</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {helpContent[activeTab]?.desc}
            </p>
            <div className="space-y-4 mb-8">
              {helpContent[activeTab]?.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">{idx + 1}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/10"
            >
              확인
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
