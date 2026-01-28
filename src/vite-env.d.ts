/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALONDRA_BACKEND_URL?: string;
  // más variables de entorno aquí si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
