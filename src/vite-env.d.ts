/// <reference types="vite/client" />

declare global {
  interface Window {
    oaiq?: (action: string, event: string, data: Record<string, any>) => void;
  }
}
