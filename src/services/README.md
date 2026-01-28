# Servicios

Cada dominio de la API tiene su propia carpeta bajo `services/`, con el mismo patrón:

```
services/
├── apiconfig.ts          # Configuración base de axios y helpers (apiGet, apiPost, etc.)
├── paquetes/
│   ├── paquetesService.ts   # Lógica y tipos del dominio
│   └── index.ts             # Re-exporta lo público del servicio
├── reservas/             # Ejemplo para futuros: mismo esquema
│   ├── reservasService.ts
│   └── index.ts
└── ...
```

**Para nuevos servicios:** crear una carpeta `nombreDominio/`, dentro el archivo `nombreDominioService.ts` y un `index.ts` que re-exporte funciones y tipos.
