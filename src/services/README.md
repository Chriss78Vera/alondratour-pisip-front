# Servicios

Cada dominio de la API tiene su propia carpeta bajo `services/`, con el mismo patrón:

```
services/
├── apiconfig.ts          # Configuración base de axios y helpers (apiGet, apiPost, etc.)
├── oauth/                # Login, loginToken, logout, getToken
├── usuarios/             # getUserInformation (GET auth/usuario?tokenAuth=...)
├── paquetes/             # getAllPaquetes, getPaisesYCiudadesDistintos, buscarPaquetesPorPaisYCiudad, create*
├── vuelos/               # createVuelo (POST vuelos)
├── agencias/             # createAgencia (POST agencias)
├── reservas/             # createReserva (POST reservas)
├── pasajeros/            # createPasajero (POST pasajeros)
└── ...
```

**Para nuevos servicios:** crear una carpeta `nombreDominio/`, dentro el archivo `nombreDominioService.ts` y un `index.ts` que re-exporte funciones y tipos.
