import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Image as ImageIcon, Key, Download } from 'lucide-react';
import { getApiKey } from '../utils/apiKey';

export default function ImageGenerator() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [artStyle, setArtStyle] = useState('실사 (Photorealistic)');
  const [colorPalette, setColorPalette] = useState('선명하고 다채로운 (Vibrant & Colorful)');
  const [mood, setMood] = useState('밝고 긍정적인 (Bright & Positive)');
  const [lighting, setLighting] = useState('자연광 (Natural Light)');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9'>('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    } catch (e) {
      console.error(e);
      setHasKey(true);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!topic || !content) return;
    setLoading(true);
    setImageUrl(null);
    
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        alert('API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `주제: ${topic}
내용: ${content}
화풍/스타일: ${artStyle}
색감: ${colorPalette}
분위기: ${mood}
조명: ${lighting}

위 주제와 내용을 바탕으로 고품질 이미지를 생성해주세요. 
이미지 안에는 반드시 내용과 관련된 '한국어 텍스트'가 크고 명확하게 포함되어야 합니다. 
지정된 화풍(${artStyle}), 색감(${colorPalette}), 분위기(${mood}), 조명(${lighting})을 엄격하게 반영하여 세련되고 매력적인 스타일로 만들어주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: prompt,
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
          setImageUrl(`data:image/jpeg;base64,${base64}`);
          break;
        }
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      if (error.message?.includes('Requested entity was not found')) {
        alert('API 키 오류. 다시 선택해주세요.');
        setHasKey(false);
      } else {
        alert('이미지 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingKey) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  }

  if (!hasKey) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">이미지 생성</h2>
          <p className="text-zinc-400">나노바나나2 모델을 사용하여 한국어 텍스트가 포함된 고품질 이미지를 생성합니다.</p>
        </div>
        <div className="bg-zinc-900/80 border border-purple-500/30 p-8 rounded-3xl text-center max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">API 키 설정 필요</h3>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            이미지 생성을 위해서는 결제가 설정된 Google Cloud 프로젝트의 API 키가 필요합니다.<br/>
            아래 버튼을 눌러 API 키를 선택해주세요.
          </p>
          <button
            onClick={handleSelectKey}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            API 키 선택하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">이미지 생성</h2>
        <p className="text-zinc-400">주제와 내용을 입력하면 한국어 텍스트가 포함된 매력적인 이미지를 생성합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-5 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">주제 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 봄맞이 세일 이벤트"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">내용 <span className="text-red-400">*</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 전 품목 50% 할인! 지금 바로 확인하세요."
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">화풍/스타일</label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="실사 (Photorealistic)">실사 (Photorealistic)</option>
                <option value="3D 렌더링 (3D Render)">3D 렌더링 (3D Render)</option>
                <option value="일러스트레이션 (Illustration)">일러스트레이션 (Illustration)</option>
                <option value="수채화 (Watercolor)">수채화 (Watercolor)</option>
                <option value="사이버펑크 (Cyberpunk)">사이버펑크 (Cyberpunk)</option>
                <option value="애니메이션 (Anime)">애니메이션 (Anime)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">색감</label>
              <select
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="선명하고 다채로운 (Vibrant & Colorful)">선명하고 다채로운</option>
                <option value="파스텔 톤 (Pastel Tones)">파스텔 톤</option>
                <option value="어둡고 무거운 (Dark & Moody)">어둡고 무거운</option>
                <option value="네온 컬러 (Neon Colors)">네온 컬러</option>
                <option value="흑백 (Black & White)">흑백</option>
                <option value="따뜻한 웜톤 (Warm Tones)">따뜻한 웜톤</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">분위기</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="밝고 긍정적인 (Bright & Positive)">밝고 긍정적인</option>
                <option value="몽환적인 (Dreamy & Ethereal)">몽환적인</option>
                <option value="역동적인 (Dynamic & Energetic)">역동적인</option>
                <option value="차분하고 평화로운 (Calm & Peaceful)">차분하고 평화로운</option>
                <option value="신비로운 (Mysterious)">신비로운</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">조명</label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="자연광 (Natural Light)">자연광 (Natural Light)</option>
                <option value="시네마틱 조명 (Cinematic Lighting)">시네마틱 조명</option>
                <option value="스튜디오 조명 (Studio Lighting)">스튜디오 조명</option>
                <option value="드라마틱한 역광 (Dramatic Backlight)">드라마틱한 역광</option>
                <option value="부드러운 확산광 (Soft Diffused Light)">부드러운 확산광</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">비율</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  aspectRatio === '1:1' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                1:1 (정방형)
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  aspectRatio === '16:9' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                16:9 (가로)
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic || !content}
            className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            {loading ? '생성 중...' : '이미지 생성하기'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white font-medium text-lg animate-pulse">이미지 생성 중...</p>
            </div>
          )}

          {imageUrl ? (
            <div className="relative group w-full flex justify-center">
              <img 
                src={imageUrl} 
                alt="Generated" 
                className={`rounded-xl shadow-2xl object-contain ${aspectRatio === '16:9' ? 'w-full' : 'max-h-[600px]'}`}
              />
              <a
                href={imageUrl}
                download="generated-image.jpg"
                className="absolute bottom-4 right-4 bg-black/70 hover:bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ) : !loading && (
            <div className="text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500">생성된 이미지가 이곳에 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
