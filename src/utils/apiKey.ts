export const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;
  }

  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore process is not defined error
  }

  return '';
};
