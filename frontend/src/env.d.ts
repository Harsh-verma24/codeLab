// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  // Add other env variables here as you add them
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}