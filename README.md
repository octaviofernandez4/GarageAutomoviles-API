# El Garage Automóviles — API

Backend (Node + Express + MongoDB) para [El Garage Automóviles](https://github.com/octaviofernandez4/GarageAutomoviles).

## Setup

```
npm install
cp .env.example .env   # completar MONGODB_URI, PORT, CLIENT_ORIGIN
npm run seed            # carga los vehículos de ejemplo
npm run dev
```

## Endpoints

- `GET /api/health`
- `GET /api/vehicles`
- `POST /api/trade-in`

## Variables de entorno

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión a MongoDB |
| `PORT` | Puerto del servidor (default 5000) |
| `CLIENT_ORIGIN` | Origen permitido por CORS (URL del frontend) |
