let visitorIdPromise: Promise<string> | null = null;

// FingerprintJSは重いので初期バンドルに含めず、必要になった時点で一度だけ読み込む。
// 同一ページ内の複数呼び出しは同じPromiseを共有する。
export const getVisitorId = (): Promise<string> => {
  if (!visitorIdPromise) {
    visitorIdPromise = import('@fingerprintjs/fingerprintjs')
      .then((FingerprintJS) => FingerprintJS.load())
      .then((agent) => agent.get())
      .then((result) => result.visitorId)
      .catch((error) => {
        visitorIdPromise = null;
        throw error;
      });
  }
  return visitorIdPromise;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '');

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
};
