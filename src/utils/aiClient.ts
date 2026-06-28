import { GoogleGenAI } from '@google/genai';
import { getApiKey } from './apiKey';

/**
 * 중앙에서 관리하는 모델 ID.
 * - TEXT_MODEL: 텍스트 기획/생성 (Gemini 3 Flash)
 * - IMAGE_MODEL: 이미지 생성 (나노바나나2 / Gemini 3 Pro Image - 최고 품질 + 한국어 텍스트 렌더링)
 */
export const TEXT_MODEL = 'gemini-3-flash-preview';
export const IMAGE_MODEL = 'gemini-3-pro-image-preview';

/** API 키가 아예 설정되지 않은 경우 */
export class NoApiKeyError extends Error {
  constructor(message = 'API 키가 설정되지 않았습니다. 우측 상단에서 API 키를 설정해주세요.') {
    super(message);
    this.name = 'NoApiKeyError';
  }
}

/** API 키가 유효하지 않거나 권한이 없는 경우 */
export class ApiKeyError extends Error {
  constructor(message = 'API 키 오류가 발생했습니다. API 키를 다시 선택해주세요.') {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/** 모델이 (안전 필터 등으로) 이미지를 반환하지 않은 경우 */
export class ImageGenerationError extends Error {
  constructor(message = '이미지를 생성하지 못했습니다. 내용을 조금 바꿔 다시 시도해주세요.') {
    super(message);
    this.name = 'ImageGenerationError';
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function errorText(err: any): string {
  return `${err?.message || err?.toString() || ''}`.toLowerCase();
}

function statusOf(err: any): number {
  return Number(err?.status ?? err?.code ?? err?.response?.status ?? 0);
}

/** API 키 자체가 잘못된 경우 (재시도해도 의미 없음 → 사용자가 키를 다시 설정해야 함) */
function isApiKeyError(err: any): boolean {
  const m = errorText(err);
  const status = statusOf(err);
  if (status === 401 || status === 403) return true;
  return (
    m.includes('requested entity was not found') ||
    m.includes('api key not valid') ||
    m.includes('api_key_invalid') ||
    m.includes('permission_denied') ||
    m.includes('permission denied')
  );
}

/** 일시적인 서버/네트워크 오류 (재시도하면 해결될 가능성이 높음) */
function isRetryable(err: any): boolean {
  const m = errorText(err);
  const status = statusOf(err);
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  return [
    '429',
    '500',
    '502',
    '503',
    '504',
    'overloaded',
    'unavailable',
    'internal error',
    'internal server',
    'deadline',
    'timeout',
    'timed out',
    'fetch failed',
    'network',
    'econnreset',
    'rate limit',
    'quota',
    'try again',
  ].some((s) => m.includes(s));
}

interface RetryOptions {
  retries?: number;
  baseDelay?: number;
}

/**
 * 일시적 오류에 대해 지수 백오프로 재시도한다.
 * - API 키 오류는 즉시 ApiKeyError 로 변환해 던진다.
 * - 재시도 불가능한 오류는 그대로 던진다.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, baseDelay = 1200 } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isApiKeyError(err)) throw new ApiKeyError();
      if (attempt === retries || !isRetryable(err)) throw err;
      // 1.2s, 2.4s, 4.8s (+ 지터) 간격으로 재시도
      const delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
      await sleep(delay);
    }
  }
  throw lastError;
}

/** API 키를 읽어 GoogleGenAI 클라이언트를 생성. 키가 없으면 NoApiKeyError. */
export function getClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) throw new NoApiKeyError();
  return new GoogleGenAI({ apiKey });
}

export type ImageSize = '1K' | '2K' | '4K';

interface GenerateImageOptions {
  prompt: string;
  aspectRatio: string;
  imageSize?: ImageSize;
}

/**
 * 나노바나나2(Gemini 3 Pro Image)로 고품질 이미지를 생성하고 data URL 을 반환한다.
 * 일시적 오류는 자동으로 재시도한다.
 */
export async function generateImage({
  prompt,
  aspectRatio,
  imageSize = '2K',
}: GenerateImageOptions): Promise<string> {
  const ai = getClient();

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }

    // 이미지가 없으면 안전 필터 등으로 차단되었을 가능성 → 재시도 대상 아님
    const reason =
      (response as any)?.candidates?.[0]?.finishReason ||
      (response as any)?.promptFeedback?.blockReason;
    throw new ImageGenerationError(
      reason
        ? `이미지 생성이 차단되었습니다 (${reason}). 내용을 조금 바꿔 다시 시도해주세요.`
        : '이미지를 생성하지 못했습니다. 다시 시도해주세요.'
    );
  });
}

/** 컴포넌트에서 catch 한 오류를 사용자용 메시지로 변환. ApiKeyError 여부도 함께 반환. */
export function describeError(err: any): { message: string; isApiKeyIssue: boolean } {
  if (err instanceof NoApiKeyError) {
    return { message: err.message, isApiKeyIssue: true };
  }
  if (err instanceof ApiKeyError) {
    return { message: err.message, isApiKeyIssue: true };
  }
  if (err instanceof ImageGenerationError) {
    return { message: err.message, isApiKeyIssue: false };
  }
  if (isApiKeyError(err)) {
    return { message: new ApiKeyError().message, isApiKeyIssue: true };
  }
  if (isRetryable(err)) {
    return {
      message: '일시적인 서버 오류로 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
      isApiKeyIssue: false,
    };
  }
  return { message: '생성 중 오류가 발생했습니다. 다시 시도해주세요.', isApiKeyIssue: false };
}
