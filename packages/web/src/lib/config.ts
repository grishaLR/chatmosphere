/** Backend API base URL. Empty in dev (Vite proxy), full URL in production. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? '';
