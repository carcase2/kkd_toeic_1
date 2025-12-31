// API 호출 시 user_id를 자동으로 추가하는 헬퍼 함수

export function getApiUrl(endpoint: string, params?: Record<string, string>): string {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const url = new URL(endpoint, window.location.origin);
  
  if (userId) {
    url.searchParams.set('user_id', userId);
  }
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

export function getApiBody(body: Record<string, any>): Record<string, any> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  return {
    ...body,
    user_id: userId || null,
  };
}

export function getUserId(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
}

