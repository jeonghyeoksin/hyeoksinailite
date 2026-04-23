import React from 'react';
import { motion } from 'motion/react';
import { FileText, Image as ImageIcon, Video, LayoutTemplate, Sparkles, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

interface HomeDashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function HomeDashboard({ setActiveTab }: HomeDashboardProps) {
  const features = [
    { id: 'blog', title: '블로그 자동 생성', desc: 'SEO 최적화된 전문적인 블로그 포스팅을 단 몇 초만에 작성합니다.', icon: FileText, color: 'from-blue-500 to-cyan-500', isFree: true },
    { id: 'cardnews', title: 'SNS 카드뉴스', desc: '인스타그램, 페이스북에 딱 맞는 감각적인 카드뉴스를 기획/디자인합니다.', icon: ImageIcon, color: 'from-purple-500 to-pink-500', isFree: true },
    { id: 'image', title: '고품질 이미지', desc: '나노바나나2 모델로 한국어 텍스트가 포함된 완벽한 이미지를 생성합니다.', icon: Sparkles, color: 'from-amber-500 to-orange-500', isFree: true },
    { id: 'video', title: '시네마틱 동영상', desc: 'Veo 모델을 활용하여 프롬프트만으로 놀라운 퀄리티의 영상을 만듭니다.', icon: Video, color: 'from-emerald-500 to-teal-500', isFree: false },
    { id: 'detailpage', title: '상세페이지 디자인', desc: '이커머스 매출을 끌어올리는 프로페셔널한 상세페이지를 원클릭으로 제작합니다.', icon: LayoutTemplate, color: 'from-indigo-500 to-blue-500', isFree: true },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mb-4 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>혁신AI Lite에 오신 것을 환영합니다</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight leading-tight"
        >
          당신의 아이디어가 <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">현실이 되는 공간</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          블로그 포스팅부터 카드뉴스, 이미지, 동영상, 상세페이지까지.<br className="hidden md:block" />
          복잡한 프롬프트 없이 'AI 자동 기획'으로 <br /> 전문가 수준의 콘텐츠를 만들어보세요.
        </motion.p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.button
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              onClick={() => setActiveTab(feature.id)}
              className="group text-left bg-zinc-900/50 border border-white/10 hover:border-white/20 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 shadow-lg`}>
                <div className="w-full h-full bg-zinc-900/90 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-3">
                <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">
                  {feature.title}
                </h3>
                {feature.isFree ? (
                  <span className="w-fit text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold tracking-tight">
                    무료 API Key 사용 가능
                  </span>
                ) : (
                  <span className="w-fit text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold tracking-tight">
                    유료 API key 권장
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>
              <div className="flex items-center text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                시작하기 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Stats / Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10"
      >
        <div className="flex items-center gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">초고속 생성</h4>
            <p className="text-zinc-500 text-sm">최신 AI 모델 적용</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">안전한 데이터</h4>
            <p className="text-zinc-500 text-sm">API 키 로컬 저장</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">시간 단축</h4>
            <p className="text-zinc-500 text-sm">자동 기획 기능 탑재</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
