# Farallones

Aplicativo demostrativo para el prototipo del Club Campestre Farallones.

## Estructura

- `src/App.jsx`: punto de entrada React.
- `src/components/PrototypeFrame.jsx`: componente de integración del prototipo.
- `src/services/prototypeService.js`: configuración del recurso que se carga.
- `src/services/firebase.js`: conexión Firestore y normalización de productos.
- `src/index.css`: estilos del contenedor React.
- `public/prototype.html`: interfaz completa de la demo.
- `public/prototype.js`: estado, reglas de negocio, acciones y renderizado de la demo.

El prototipo se mantiene como una página independiente para conservar sus tres experiencias (A&B, domingo previsto y mesa al día) y su estado compartido. React se encarga de integrarlo como una superficie aislada, evitando que el HTML imperativo contamine el árbol de componentes.

## Firebase y productos

1. Copia `.env.example` como `.env.local`.
2. Completa la configuración web de Firebase en las variables `VITE_FIREBASE_*`.
3. En Cloud Firestore crea la colección `products` (o cambia `VITE_FIREBASE_PRODUCTS_COLLECTION`).

Cada documento debe tener al menos `name` y `price`. También se aceptan estos alias:

- `nombre` por `name`
- `precio` por `price`
- `categoria` por `category`
- `disponible` por `available`
- `imagen` por `imageUrl`
- `tiempoPreparacion` por `min`
- `opciones` por `options`

Si Firebase no está configurado o la consulta falla, la demo conserva el menú ficticio local y registra el error en la consola.

## Desarrollo

```bash
npm install
npm run dev
```

## Validación

```bash
npm run lint
npm run build
```
