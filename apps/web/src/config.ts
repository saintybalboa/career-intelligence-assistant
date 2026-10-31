const getApiUrl = (): string => {
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';
};

export const config = {
  apiUrl: getApiUrl(),
} as const;
