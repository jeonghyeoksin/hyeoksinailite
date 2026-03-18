import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Video as VideoIcon, Key } from 'lucide-react';

export default function VideoGenerator() {
  const [subject, setSubject] = useState('');
  const [action, setAction] = useState('');
  const [environment, setEnvironment] = useState('');
  const [cameraMovement, setCameraMovement] = useState('고정된 카메라 (Static Camera)');
  const [lighting, setLighting] = useState('시네마틱 조명 (Cinematic Lighting)');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
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
        // Fallback if not in AI Studio environment
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
        setHasKey(true); // Assume success to avoid race condition
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!subject) return;
    setLoading(true);
    setVideoUrl(null);
    setStatus('비디오 생성 요청 중...');
    
    try {
      // Re-initialize to pick up the selected API key
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fullPrompt = `${subject}가 ${environment}에서 ${action}하는 모습. 카메라 워크: ${cameraMovement}. 조명 및 분위기: ${lighting}. 고품질, 8k 해상도, 사실적인 렌더링.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: fullPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      setStatus('비디오 생성 중... (몇 분 정도 소요될 수 있습니다)');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        setStatus('비디오 다운로드 중...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('');
      } else {
        throw new Error('비디오 URL을 찾을 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      if (error.message?.includes('Requested entity was not found')) {
        setStatus('API 키 오류. 다시 선택해주세요.');
        setHasKey(false);
      } else {
        setStatus('비디오 생성 중 오류가 발생했습니다.');
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
          <h2 className="text-3xl font-bold text-white mb-2">동영상 생성</h2>
          <p className="text-zinc-400">Veo 모델을 사용하여 고품질 동영상을 생성합니다.</p>
        </div>
        <div className="bg-zinc-900/80 border border-purple-500/30 p-8 rounded-3xl text-center max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">API 키 설정 필요</h3>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            동영상 생성을 위해서는 결제가 설정된 Google Cloud 프로젝트의 API 키가 필요합니다.<br/>
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
        <h2 className="text-3xl font-bold text-white mb-2">동영상 생성</h2>
        <p className="text-zinc-400">프롬프트를 입력하면 Veo 모델이 멋진 동영상을 만들어냅니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-5 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">주제/피사체 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 네온 홀로그램 고양이"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">동작/움직임</label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="예: 최고 속도로 달리는 모습"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">배경/환경</label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="예: 비 내리는 사이버펑크 도시"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">카메라 워크</label>
              <select
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="고정된 카메라 (Static Camera)">고정된 카메라</option>
                <option value="천천히 줌인 (Slow Zoom In)">천천히 줌인</option>
                <option value="빠르게 패닝 (Fast Panning)">빠르게 패닝</option>
                <option value="드론 샷/공중 촬영 (Drone Shot)">드론 샷/공중 촬영</option>
                <option value="피사체 추적 (Tracking Shot)">피사체 추적</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">조명/스타일</label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="시네마틱 조명 (Cinematic Lighting)">시네마틱 조명</option>
                <option value="네온/사이버펑크 (Neon/Cyberpunk)">네온/사이버펑크</option>
                <option value="자연광/골든 아워 (Golden Hour)">자연광/골든 아워</option>
                <option value="어둡고 미스터리한 (Dark & Moody)">어둡고 미스터리한</option>
                <option value="스튜디오 조명 (Studio Lighting)">스튜디오 조명</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">비율</label>
            <div className="grid grid-cols-2 gap-4">
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
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  aspectRatio === '9:16' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                9:16 (세로)
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !subject}
            className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <VideoIcon className="w-5 h-5" />}
            {loading ? '생성 중...' : '동영상 생성하기'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-3xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white font-medium text-lg animate-pulse">{status}</p>
              <p className="text-zinc-400 text-sm mt-2">이 작업은 몇 분 정도 소요될 수 있습니다.</p>
            </div>
          )}

          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop
              className={`rounded-xl shadow-2xl max-h-[600px] ${aspectRatio === '16:9' ? 'w-full' : 'h-full'}`}
            />
          ) : !loading && (
            <div className="text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500">생성된 동영상이 이곳에 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
