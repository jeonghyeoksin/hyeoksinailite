import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Send, Copy, Check, Code, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

import { getApiKey } from '../utils/apiKey';

export default function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [purpose, setPurpose] = useState('정보 전달 및 교육');
  const [tone, setTone] = useState('전문적이고 신뢰감 있는');
  const [length, setLength] = useState('중간 (약 1500자)');
  const [businessName, setBusinessName] = useState('');
  const [itemName, setItemName] = useState('');
  const [ctaDetail, setCtaDetail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [result, setResult] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  
  const markdownRef = useRef<HTMLDivElement>(null);

  const handleAutoPlan = async () => {
    if (!topic) {
      alert('주제를 먼저 입력해주세요.');
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
        model: 'gemini-3.1-flash-preview',
        contents: `주제 "${topic}"에 대한 블로그 포스팅 기획을 작성해주세요.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: { type: Type.STRING, description: "쉼표로 구분된 핵심 키워드 3~5개" },
              targetAudience: { type: Type.STRING, description: "구체적인 타겟 독자층" },
              purpose: { type: Type.STRING, description: "다음 중 하나 선택: 정보 전달 및 교육, 제품/서비스 홍보, 브랜딩 및 신뢰 구축, 트래픽 유도 (SEO), 고객 설득 및 전환" },
              tone: { type: Type.STRING, description: "다음 중 하나 선택: 전문적이고 신뢰감 있는, 친근하고 소통하는, 유머러스하고 재치있는, 감성적이고 따뜻한, 강력하고 설득력 있는" },
              ctaDetail: { type: Type.STRING, description: "독자의 행동을 유도할 구체적인 문구 (예: 무료 상담 신청하기)" }
            },
            required: ["keywords", "targetAudience", "purpose", "tone", "ctaDetail"]
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      if (data.keywords) setKeywords(data.keywords);
      if (data.targetAudience) setTargetAudience(data.targetAudience);
      if (data.purpose) setPurpose(data.purpose);
      if (data.tone) setTone(data.tone);
      if (data.ctaDetail) setCtaDetail(data.ctaDetail);
    } catch (error) {
      console.error('Error auto planning:', error);
      alert('자동 기획 중 오류가 발생했습니다.');
    } finally {
      setIsAutoPlanning(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult('');
    
    try {
      const prompt = `
당신은 전문 블로그 포스팅 작가입니다. 다음 정보를 바탕으로 SEO에 최적화된 매력적인 블로그 포스트를 작성해주세요.

주제: ${topic}
핵심 키워드: ${keywords}
타겟 독자층: ${targetAudience || '일반 대중'}
포스팅 목적: ${purpose}
어조 및 스타일: ${tone}
원하는 분량: ${length}
${businessName ? `상호명: ${businessName}` : ''}
${itemName ? `아이템명: ${itemName}` : ''}
${ctaDetail ? `구체적인 행동 유도(CTA): ${ctaDetail}` : ''}

작성 가이드라인:
1. 서론: 타겟 독자층(${targetAudience || '일반 대중'})의 페인포인트(Pain Point)나 관심사를 건드리며 시선을 사로잡는 후킹(Hooking)성 멘트로 시작하세요.
2. 본론: '${purpose}' 목적에 맞게 전문적이면서도 이해하기 쉬운 스토리텔링 방식으로 전개하세요.
3. 결론: 자연스럽게 문의나 구매로 전환될 수 있도록 강력한 행동 촉구(CTA)를 포함하세요. ${businessName || itemName ? `(반드시 ${businessName} 상호명과 ${itemName} 아이템명을 자연스럽게 언급할 것)` : ''} ${ctaDetail ? `(${ctaDetail} 하도록 유도할 것)` : ''}
4. 소제목은 <h2> 또는 <h3> 태그(마크다운 ##, ###)를 사용하세요.
5. [중요] ** 기호(마크다운 볼드체)는 절대 사용하지 마세요. 결과물에 **가 포함되어서는 안 됩니다.
6. [중요] 가독성을 극대화하기 위해, 2~3문장마다 반드시 빈 줄(엔터 2번)을 추가하여 문단을 나누어 작성하세요.
7. 가장 강조하고 싶은 핵심 문장은 인용구(> 텍스트)를 사용하세요.
`;

      const apiKey = getApiKey();
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      let fullText = '';
      for await (const chunk of response) {
        fullText += chunk.text;
        setResult(fullText);
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      setResult('블로그 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    if (!markdownRef.current) return;
    
    const clone = markdownRef.current.cloneNode(true) as HTMLElement;
    
    const h2s = clone.querySelectorAll('h2');
    const h3s = clone.querySelectorAll('h3');
    const strongs = clone.querySelectorAll('strong');
    const blockquotes = clone.querySelectorAll('blockquote');
    
    h2s.forEach(el => { el.style.color = '#60a5fa'; el.style.fontWeight = 'bold'; el.style.fontSize = '1.5em'; el.style.marginTop = '1.5em'; el.style.marginBottom = '0.5em'; });
    h3s.forEach(el => { el.style.color = '#60a5fa'; el.style.fontWeight = 'bold'; el.style.fontSize = '1.17em'; el.style.marginTop = '1.2em'; el.style.marginBottom = '0.5em'; });
    strongs.forEach(el => { el.style.color = '#ef4444'; el.style.fontWeight = 'bold'; });
    blockquotes.forEach(el => { 
      el.style.backgroundColor = '#fde047'; 
      el.style.color = '#000000'; 
      el.style.padding = '12px 16px'; 
      el.style.margin = '16px 0'; 
      el.style.borderRadius = '8px'; 
      el.style.fontWeight = 'bold'; 
      el.style.display = 'block';
      el.style.border = 'none';
    });

    const html = clone.innerHTML;
    const text = clone.innerText;

    try {
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
      console.error('Failed to copy rich text: ', err);
      await navigator.clipboard.writeText(text);
    }
    
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">블로그 생성</h2>
        <p className="text-zinc-400">주제와 키워드를 입력하면 완성도 높은 블로그 포스트를 작성해 드립니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-5 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-zinc-300">주제 <span className="text-red-400">*</span></label>
              <button
                onClick={handleAutoPlan}
                disabled={isAutoPlanning || !topic}
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
              placeholder="예: 인공지능이 디자인 산업에 미치는 영향"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">상세 내용 및 키워드</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="예: AI, 디자인, 미래, 트렌드"
              rows={2}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">타겟 독자층</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="예: 2030 직장인"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">포스팅 목적</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="정보 전달 및 교육">정보 전달 및 교육</option>
                <option value="제품/서비스 홍보">제품/서비스 홍보</option>
                <option value="브랜딩 및 신뢰 구축">브랜딩 및 신뢰 구축</option>
                <option value="트래픽 유도 (SEO)">트래픽 유도 (SEO)</option>
                <option value="고객 설득 및 전환">고객 설득 및 전환</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">어조 및 스타일</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="전문적이고 신뢰감 있는">전문적이고 신뢰감 있는</option>
                <option value="친근하고 소통하는">친근하고 소통하는</option>
                <option value="유머러스하고 재치있는">유머러스하고 재치있는</option>
                <option value="감성적이고 따뜻한">감성적이고 따뜻한</option>
                <option value="강력하고 설득력 있는">강력하고 설득력 있는</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">분량</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="짧게 (약 800자)">짧게 (약 800자)</option>
                <option value="중간 (약 1500자)">중간 (약 1500자)</option>
                <option value="길고 상세하게 (약 2500자 이상)">길고 상세하게 (약 2500자 이상)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">상호명 (선택)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="예: 혁신컴퍼니"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">아이템명 (선택)</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="예: AI 솔루션"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">구체적인 행동 유도 (CTA)</label>
            <input
              type="text"
              value={ctaDetail}
              onChange={(e) => setCtaDetail(e.target.value)}
              placeholder="예: 무료 상담 신청하기 링크 클릭 유도"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? '생성 중...' : '블로그 작성하기'}
          </button>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">결과물</h3>
            {result && (
              <button
                onClick={handleCopyText}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
              >
                {copiedText ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiedText ? '복사됨' : '복사하기'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl p-6 overflow-auto max-w-none">
            {result ? (
              <div className="markdown-body" ref={markdownRef}>
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                좌측에서 주제를 입력하고 생성 버튼을 눌러주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
