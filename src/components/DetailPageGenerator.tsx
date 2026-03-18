import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, LayoutTemplate, Download } from 'lucide-react';

export default function DetailPageGenerator() {
  const [productName, setProductName] = useState('');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [layoutStyle, setLayoutStyle] = useState('문제제기 -> 해결책 -> 특장점 -> 리뷰 -> CTA');
  const [colorPalette, setColorPalette] = useState('신뢰감을 주는 블루 톤 (Trust Blue)');
  const [aspectRatio, setAspectRatio] = useState<'1:4' | '1:8'>('1:4');
  const [pageCount, setPageCount] = useState('Auto');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName || !topic) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const apiKey = localStorage.getItem('GEMINI_API_KEY') || (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `주제/카테고리: ${topic}
제품/서비스명: ${productName}
타겟 고객: ${targetAudience}
핵심 소구점(특장점): ${keyPoints}
레이아웃 구성: ${layoutStyle}
메인 색상: ${colorPalette}
상세페이지 분량(장수): ${pageCount === 'Auto' ? 'AI가 내용에 맞게 자동으로 적절한 장수를 결정' : pageCount}

위 내용을 바탕으로 이커머스/랜딩페이지용 '상세페이지' 이미지를 생성해주세요.
[매우 중요] 이미지 내의 모든 텍스트는 '한국어'로 작성되어야 하며, 글씨가 깨지거나 뭉개지지 않고 명확하고 세련된 타이포그래피로 렌더링되어야 합니다.
제품명 "${productName}"과 핵심 소구점들이 레이아웃 흐름(${layoutStyle})에 맞게 시각적으로 아름답게 배치된 프로페셔널한 웹 디자인을 만들어주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "2K"
          }
        }
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const url = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
            setImageUrl(url);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error('이미지를 생성하지 못했습니다.');
      }
    } catch (error) {
      console.error('Error generating detail page:', error);
      alert('상세페이지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">상세페이지 생성</h2>
        <p className="text-zinc-400">나노바나나2 모델을 활용하여 한국어 깨짐 없는 고품질 상세페이지를 제작합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-5 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">제품/서비스명 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 혁신 AI 솔루션 프로"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">카테고리/주제 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: B2B SaaS 소프트웨어"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">타겟 고객</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="예: 업무 효율을 높이고 싶은 마케터"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">핵심 소구점 (특장점)</label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="예: 1. 작업 시간 90% 단축&#13;&#10;2. 클릭 한 번으로 자동 생성&#13;&#10;3. 완벽한 한국어 지원"
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">레이아웃 구성 (객관식)</label>
            <select
              value={layoutStyle}
              onChange={(e) => setLayoutStyle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="문제제기 -> 해결책 -> 특장점 -> 리뷰 -> CTA">문제제기 -&gt; 해결책 -&gt; 특장점 -&gt; 리뷰 -&gt; CTA (표준형)</option>
              <option value="감성 스토리텔링 -> 제품 스펙 -> 혜택 -> CTA">감성 스토리텔링 -&gt; 제품 스펙 -&gt; 혜택 (감성형)</option>
              <option value="강렬한 후킹 -> 비포/애프터 -> 상세 스펙 -> CTA">강렬한 후킹 -&gt; 비포/애프터 -&gt; 상세 스펙 (비교형)</option>
              <option value="브랜드 철학 -> 제품 라인업 -> 디테일 컷 -> CTA">브랜드 철학 -&gt; 제품 라인업 -&gt; 디테일 컷 (브랜딩형)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">메인 색상 (객관식)</label>
            <select
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="신뢰감을 주는 블루 톤 (Trust Blue)">신뢰감을 주는 블루 톤 (IT/테크)</option>
              <option value="고급스러운 블랙 & 골드 (Luxury Black & Gold)">고급스러운 블랙 & 골드 (프리미엄)</option>
              <option value="따뜻하고 감성적인 베이지/파스텔 (Warm Pastel)">따뜻하고 감성적인 베이지/파스텔 (뷰티/리빙)</option>
              <option value="신선하고 활기찬 그린/오렌지 (Fresh & Energetic)">신선하고 활기찬 그린/오렌지 (식품/건강)</option>
              <option value="트렌디한 퍼플/네온 (Trendy Neon)">트렌디한 퍼플/네온 (엔터/게임)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">상세페이지 장수</label>
            <div className="grid grid-cols-4 gap-2">
              {['Auto', '5장', '10장', '20장'].map((count) => (
                <button
                  key={count}
                  onClick={() => setPageCount(count)}
                  className={`py-3 rounded-xl border font-medium transition-all text-sm ${
                    pageCount === count 
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                      : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">최적화 사이즈 비율</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAspectRatio('1:4')}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  aspectRatio === '1:4' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                1:4 (표준 상세)
              </button>
              <button
                onClick={() => setAspectRatio('1:8')}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  aspectRatio === '1:8' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                1:8 (롱 상세)
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !productName || !topic}
            className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutTemplate className="w-5 h-5" />}
            {loading ? '상세페이지 생성 중...' : '상세페이지 생성하기'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white font-medium text-lg animate-pulse">상세페이지를 디자인하고 있습니다...</p>
              <p className="text-zinc-400 text-sm mt-2">한국어 타이포그래피를 최적화하는 중입니다.</p>
            </div>
          )}

          {imageUrl ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="relative w-full max-w-2xl overflow-y-auto custom-scrollbar rounded-xl border border-white/10 shadow-2xl" style={{ maxHeight: '700px' }}>
                <img 
                  src={imageUrl} 
                  alt="Generated Detail Page" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <a
                href={imageUrl}
                download={`detail-page-${productName}.png`}
                className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
              >
                <Download className="w-5 h-5" />
                상세페이지 다운로드
              </a>
            </div>
          ) : !loading && (
            <div className="text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutTemplate className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500">생성된 상세페이지가 이곳에 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
