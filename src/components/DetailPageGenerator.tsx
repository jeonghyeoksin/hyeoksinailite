import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, LayoutTemplate, Download, Sparkles } from 'lucide-react';
import { getApiKey } from '../utils/apiKey';
import { generateImage, describeError, TEXT_MODEL } from '../utils/aiClient';
import CostInfo from './CostInfo';

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
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleAutoPlan = async () => {
    if (!productName || !topic) {
      alert('제품/서비스명과 카테고리/주제를 먼저 입력해주세요.');
      return;
    }
    setIsAutoPlanning(true);
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setIsAutoPlanning(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `제품/서비스명 "${productName}", 카테고리/주제 "${topic}"에 대한 상세페이지 기획을 작성해주세요.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetAudience: { type: Type.STRING, description: "구체적인 타겟 고객층" },
              keyPoints: { type: Type.STRING, description: "핵심 소구점 (특장점) 3~4가지를 1. 2. 3. 형식으로 작성" },
              layoutStyle: { type: Type.STRING, description: "다음 중 하나 선택: 문제제기 -> 해결책 -> 특장점 -> 리뷰 -> CTA, 감성 스토리텔링 -> 제품 스펙 -> 혜택 -> CTA, 강렬한 후킹 -> 비포/애프터 -> 상세 스펙 -> CTA, 브랜드 철학 -> 제품 라인업 -> 디테일 컷 -> CTA" },
              colorPalette: { type: Type.STRING, description: "다음 중 하나 선택: 신뢰감을 주는 블루 톤 (Trust Blue), 고급스러운 블랙 & 골드 (Luxury Black & Gold), 따뜻하고 감성적인 베이지/파스텔 (Warm Pastel), 신선하고 활기찬 그린/오렌지 (Fresh & Energetic), 트렌디한 퍼플/네온 (Trendy Neon)" }
            },
            required: ["targetAudience", "keyPoints", "layoutStyle", "colorPalette"]
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      if (data.targetAudience) setTargetAudience(data.targetAudience);
      if (data.keyPoints) setKeyPoints(data.keyPoints);
      if (data.layoutStyle) setLayoutStyle(data.layoutStyle);
      if (data.colorPalette) setColorPalette(data.colorPalette);
    } catch (error) {
      console.error('Error auto planning:', error);
      alert('자동 기획 중 오류가 발생했습니다.');
    } finally {
      setIsAutoPlanning(false);
    }
  };

  const handleGenerate = async () => {
    if (!productName || !topic) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const prompt = `당신은 이커머스 전환율을 극대화하는 전문 상세페이지 디자이너입니다. 아래 브리프로 실제 판매 페이지에 바로 올릴 수 있는 프리미엄 세로형 상세페이지 비주얼을 디자인하세요.

[브리프]
- 주제/카테고리: ${topic}
- 제품/서비스명: ${productName}
- 타겟 고객: ${targetAudience}
- 핵심 소구점(특장점): ${keyPoints}
- 레이아웃 흐름: ${layoutStyle}
- 메인 색상: ${colorPalette}
- 분량: ${pageCount === 'Auto' ? 'AI가 내용에 맞게 적절한 섹션 수를 결정' : pageCount}

[필수 품질 기준]
1. 세로로 긴 상세페이지 형식으로, 위에서 아래로 ${layoutStyle} 흐름에 따라 섹션을 명확히 나눠 구성합니다. 섹션 간 여백·구분·시각적 리듬을 전문 웹디자인 수준으로 정돈합니다.
2. 모든 텍스트는 반드시 '정확하고 자연스러운 한국어'로 작성합니다. 헤드라인은 크고 강렬하게, 본문은 또렷하게 — 글자가 절대 깨지거나 뭉개지지 않고 오탈자·외계어가 없어야 합니다. 가독성 높은 모던 한글 서체를 사용합니다.
3. 제품명 "${productName}"과 핵심 소구점을 시각적 위계에 맞게 배치하고, 신뢰감 있는 ${colorPalette} 색상 시스템과 고급스러운 아이콘/그래픽을 활용합니다.
4. 상업 광고 수준의 디테일·정렬·대비를 적용하고, 워터마크·로렘입숨·의미 없는 텍스트·영어 자투리 글자·형태 왜곡은 금지합니다.

광고 대행사가 만든 듯한 완성도 높은 한 장의 세로형 상세페이지 이미지를 생성하세요.`;

      // Gemini 3 Pro Image 가 지원하는 가장 긴 세로 비율(9:16)로 매핑, 4K 고해상도로 생성
      const url = await generateImage({ prompt, aspectRatio: '9:16', imageSize: '4K' });
      setImageUrl(url);
    } catch (error) {
      console.error('Error generating detail page:', error);
      const { message } = describeError(error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">상세페이지 생성</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold tracking-tight">
              나노바나나2 엔진 적용
            </span>
            <CostInfo 
              featureName="상세페이지 생성" 
              minCost={100} 
              maxCost={250} 
              description="텍스트 기획 및 레이아웃 구성(Gemini 3 Flash)과 1장의 4K 고해상도 상세페이지 이미지(나노바나나2 - Gemini 3 Pro Image) 생성 비용이 포함됩니다."
            />
          </div>
        </div>
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
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-zinc-300">카테고리/주제 <span className="text-red-400">*</span></label>
              <button
                onClick={handleAutoPlan}
                disabled={isAutoPlanning || !productName || !topic}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isAutoPlanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI 자동 기획
              </button>
            </div>
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
