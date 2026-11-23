/// <reference types="vite/client" />
/// <reference types="vue-router/auto-routes" />

// ค่า VITE_* ถูกฝังลง bundle เป็นข้อมูล public ห้ามใส่ secret (ดู docs/secrets.md)
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string
  readonly VITE_BUILD_MODE: string
  readonly VITE_API_BASE_URL: string
  // เว้นว่างไว้ = ไม่ใช้ LINE LIFF login
  readonly VITE_LIFF_ID: string
}

// ฝังตอน build จาก `define` ใน vite.config.ts (ISO string)
declare const __APP_BUILD_TIME__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
