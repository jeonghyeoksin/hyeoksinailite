import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Send, Image as ImageIcon, Sparkles, Download, Zap } from 'lucide-react';
import { getApiKey } from '../utils/apiKey';
import JSZip from 'jszip';

interface CardPage {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

export default function CardNewsGenerator() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneAndManner, setToneAndManner] = useState('트렌디하고 감각적인');
  const [designStyle, setDesignStyle] = useState('미니멀하고 깔끔한 (Minimal & Clean)');
  const [pageCount, setPageCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4'>('1:1');
  const [loading, setLoading] = useState(false);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [cards, setCards] = useState<CardPage[]>([]);

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
        model: 'gemini-3-flash-preview',
        contents: `주제 "${topic}"에 대한 카드뉴스 기획을 작성해주세요.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING, description: "카드뉴스에 들어갈 핵심 내용 요약" },
              targetAudience: { type: Type.STRING, description: "구체적인 타겟 독자층" },
              toneAndManner: { type: Type.STRING, description: "다음 중 하나 선택: 트렌디하고 감각적인, 진지하고 전문적인, 친근하고 발랄한, 감성적이고 따뜻한, 유머러스하고 재치있는" },
              designStyle: { type: Type.STRING, description: "다음 중 하나 선택: 미니멀하고 깔끔한 (Minimal & Clean), 화려하고 다채로운 (Colorful & Vibrant), 감성적인 사진 위주 (Cinematic Photography), 3D 일러스트레이션 (3D Illustration), 사이버펑크/네온 (Cyberpunk/Neon)" }
            },
            required: ["content", "targetAudience", "toneAndManner", "designStyle"]
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      if (data.content) setContent(data.content);
      if (data.targetAudience) setTargetAudience(data.targetAudience);
      if (data.toneAndManner) setToneAndManner(data.toneAndManner);
      if (data.designStyle) setDesignStyle(data.designStyle);
    } catch (error) {
      console.error('Error auto planning:', error);
      alert('자동 기획 중 오류가 발생했습니다.');
    } finally {
      setIsAutoPlanning(false);
    }
  };

  const handleGenerateText = async () => {
    if (!topic) return;
    setLoading(true);
    setCards([]);
    
    try {
      const prompt = `
주제: "${topic}"
상세 내용: "${content}"
타겟 독자층: "${targetAudience || '일반 대중'}"
텍스트 톤앤매너: "${toneAndManner}"
디자인/이미지 스타일: "${designStyle}"

위 주제와 내용을 바탕으로 SNS(인스타그램/페이스북)에 올릴 매력적인 카드뉴스를 기획해주세요.
총 ${pageCount}장으로 구성해주세요. 타겟 독자층(${targetAudience || '일반 대중'})의 공감을 이끌어낼 수 있는 '${toneAndManner}' 어조로 작성하세요.

각 장마다 다음 내용을 포함해야 합니다:
1. title: 카드뉴스 이미지 정중앙에 크게 들어갈 핵심 문구 (한국어, 짧고 강렬하게)
2. content: 게시글 본문에 들어갈 상세 설명
3. imagePrompt: 이미지 생성 AI를 위한 영문 프롬프트. 
   [중요] 반드시 다음 형식을 따르세요: "A high quality background image of [배경 묘사]. The visual style MUST be ${designStyle}. The image MUST contain the exact Korean text '[title 내용]' written in large, clear, modern typography. DO NOT include any English text."
`;

      const apiKey = getApiKey();
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ['title', 'content', 'imagePrompt'],
            },
          },
        },
      });

      const generatedCards = JSON.parse(response.text || '[]') as CardPage[];
      setCards(generatedCards);
    } catch (error) {
      console.error('Error generating card news:', error);
      alert('카드뉴스 텍스트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    if (cards.length === 0) return;
    setLoadingImages(true);

    try {
      const updatedCards = [...cards];
      
      for (let i = 0; i < updatedCards.length; i++) {
        const card = updatedCards[i];
        if (card.imageUrl) continue;

        const apiKey = getApiKey();
        if (!apiKey) {
          alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
          setLoadingImages(false);
          return;
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: card.imagePrompt,
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: '1K',
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            updatedCards[i].imageUrl = `data:image/jpeg;base64,${base64}`;
            setCards([...updatedCards]);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error generating images:', error);
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleOneClickGenerate = async () => {
    if (!topic) return;
    setCards([]);
    setLoading(true);
    
    try {
      // Step 1: Text Generation
      const prompt = `
주제: "${topic}"
상세 내용: "${content}"
타겟 독자층: "${targetAudience || '일반 대중'}"
텍스트 톤앤매너: "${toneAndManner}"
디자인/이미지 스타일: "${designStyle}"

위 주제와 내용을 바탕으로 SNS(인스타그램/페이스북)에 올릴 매력적인 카드뉴스를 기획해주세요.
총 ${pageCount}장으로 구성해주세요. 타겟 독자층(${targetAudience || '일반 대중'})의 공감을 이끌어낼 수 있는 '${toneAndManner}' 어조로 작성하세요.

각 장마다 다음 내용을 포함해야 합니다:
1. title: 카드뉴스 이미지 정중앙에 크게 들어갈 핵심 문구 (한국어, 짧고 강렬하게)
2. content: 게시글 본문에 들어갈 상세 설명
3. imagePrompt: 이미지 생성 AI를 위한 영문 프롬프트. 
   [중요] 반드시 다음 형식을 따르세요: "A high quality background image of [배경 묘사]. The visual style MUST be ${designStyle}. The image MUST contain the exact Korean text '[title 내용]' written in large, clear, modern typography. DO NOT include any English text."
`;

      const apiKey = getApiKey();
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ['title', 'content', 'imagePrompt'],
            },
          },
        },
      });

      const generatedCards = JSON.parse(textResponse.text || '[]') as CardPage[];
      setCards(generatedCards);
      setLoading(false);

      // Step 2: Image Generation
      if (generatedCards.length > 0) {
        setLoadingImages(true);
        const updatedCards = [...generatedCards];
        
        for (let i = 0; i < updatedCards.length; i++) {
          const card = updatedCards[i];
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: card.imagePrompt,
            config: {
              imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: '1K',
              }
            }
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              const base64 = part.inlineData.data;
              updatedCards[i].imageUrl = `data:image/jpeg;base64,${base64}`;
              setCards([...updatedCards]);
              break;
            }
          }
        }
        setLoadingImages(false);
      }
    } catch (error) {
      console.error('Error in one-click generate:', error);
      alert('생성 중 오류가 발생했습니다.');
      setLoading(false);
      setLoadingImages(false);
    }
  };

  const handleDownloadAll = async () => {
    const imagesToDownload = cards.filter(card => card.imageUrl);
    if (imagesToDownload.length === 0) {
      alert('다운로드할 이미지가 없습니다.');
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("card-news-images");

    for (let i = 0; i < imagesToDownload.length; i++) {
      const card = imagesToDownload[i];
      if (card.imageUrl) {
        const base64Data = card.imageUrl.split(',')[1];
        folder?.file(`card-news-${i + 1}.jpg`, base64Data, { base64: true });
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `혁신AI_카드뉴스_${topic.substring(0, 10)}.zip`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">카드뉴스 생성</h2>
        <p className="text-zinc-400">주제와 내용을 입력하면 매력적인 카드뉴스 텍스트와 맞춤형 배경 이미지를 생성합니다.</p>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              placeholder="예: 직장인을 위한 번아웃 극복 방법 5가지"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">상세 내용</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="카드뉴스에 포함하고 싶은 핵심 내용을 적어주세요"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">타겟 독자층</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="예: 2030 사회초년생"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">텍스트 톤앤매너</label>
            <select
              value={toneAndManner}
              onChange={(e) => setToneAndManner(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="트렌디하고 감각적인">트렌디하고 감각적인</option>
              <option value="진지하고 전문적인">진지하고 전문적인</option>
              <option value="친근하고 발랄한">친근하고 발랄한</option>
              <option value="감성적이고 따뜻한">감성적이고 따뜻한</option>
              <option value="유머러스하고 재치있는">유머러스하고 재치있는</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">디자인/이미지 스타일</label>
            <select
              value={designStyle}
              onChange={(e) => setDesignStyle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="미니멀하고 깔끔한 (Minimal & Clean)">미니멀하고 깔끔한</option>
              <option value="화려하고 다채로운 (Colorful & Vibrant)">화려하고 다채로운</option>
              <option value="감성적인 사진 위주 (Cinematic Photography)">감성적인 사진 위주</option>
              <option value="3D 일러스트레이션 (3D Illustration)">3D 일러스트레이션</option>
              <option value="사이버펑크/네온 (Cyberpunk/Neon)">사이버펑크/네온</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-zinc-300 mb-2">비율</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '1:1' | '3:4')}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="1:1">1:1 (1080 × 1080px)</option>
              <option value="3:4">3:4 (1080 × 1440px)</option>
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-medium text-zinc-300 mb-2">장수</label>
            <select
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}장</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateText}
            disabled={loading || loadingImages || !topic}
            className="w-full md:w-auto bg-zinc-800 text-white hover:bg-zinc-700 px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[50px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            텍스트 생성
          </button>
          <button
            onClick={handleOneClickGenerate}
            disabled={loading || loadingImages || !topic}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-[50px] shadow-lg shadow-purple-500/20"
          >
            {loading || loadingImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            원클릭 생성 (텍스트+이미지)
          </button>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-semibold text-white">생성된 카드뉴스 ({cards.length}장)</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadAll}
                disabled={loadingImages || cards.every(c => !c.imageUrl)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 border border-white/10"
              >
                <Download className="w-4 h-4" />
                전체 다운로드 (.zip)
              </button>
              <button
                onClick={handleGenerateImages}
                disabled={loadingImages}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                {loadingImages ? '이미지 생성 중...' : '배경 이미지 생성하기'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div key={index} className={`bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col relative group ${aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[3/4]'}`}>
                {/* Background Image */}
                {card.imageUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${card.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-zinc-800 z-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-zinc-700" />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-center text-center">
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    {index + 1} / {cards.length}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{card.title}</h4>
                  <p className="text-zinc-200 text-sm leading-relaxed drop-shadow-md bg-black/40 p-3 rounded-lg backdrop-blur-sm">{card.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
