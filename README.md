# Farallones

Aplicativo demostrativo para el prototipo del Club Campestre Farallones. Cada perfil inicia sesión con Firebase Authentication y todos comparten en tiempo real el mismo estado guardado en Firebase Realtime Database: lo que hace la cocina lo ve el mesero al instante, lo que confirma el socio le llega a planeación, etc.

## Estructura

- `src/App.jsx`: login y enrutamiento por perfil.
- `src/services/session.js`: inicio y cierre de sesión (Firebase Auth, o modo local si Firebase no está configurado).
- `src/services/firebase.js`: conexión con Firebase Authentication y Realtime Database.
- `src/services/profiles.js`: perfiles demo, sus rutas y las vistas que ve cada uno.
- `src/components/PrototypeFrame.jsx`: puente entre el prototipo (iframe) y Firebase.
- `public/prototype.html` y `public/prototype.js`: interfaz, reglas de negocio y datos iniciales de la demo.
- `database.rules.json` y `firebase.json`: reglas de Realtime Database y configuración de Firebase Hosting.

El prototipo vive en un iframe para conservar su HTML imperativo aislado de React. Cada acción que deben ver los demás perfiles se envía como una lista de operaciones `{ p: ruta, v: valor }` (o `{ p, inc: n }`), que la página principal guarda en Realtime Database en una sola actualización atómica. Firebase devuelve el árbol actualizado a todas las sesiones abiertas.

## Configurar Firebase

1. Copia `.env.example` como `.env.local` y completa la configuración web del proyecto (`VITE_FIREBASE_*`).
2. **Authentication** → Método de acceso → habilita **Correo electrónico/contraseña**.
3. **Realtime Database** → crea la base. Si su URL no es `https://<proyecto>-default-rtdb.firebaseio.com`, defínela en `VITE_FIREBASE_DATABASE_URL`.
4. **Reglas**: publica el contenido de `database.rules.json` (solo usuarios autenticados leen y escriben). Desde la consola: Realtime Database → Reglas, o con la CLI: `npx firebase-tools deploy --only database`.

No hace falta crear datos ni usuarios a mano:

- Las cuentas demo se crean en Authentication la primera vez que alguien ingresa con ellas.
- Si la base está vacía, la primera sesión siembra solo el **menú** (`products`), con todos los platos disponibles. No hay pedidos, confirmaciones, lista de espera ni estados de mesa predeterminados: todas las mesas arrancan libres y todo lo demás se crea desde la app.
- **Planeación** se calcula con lo que hay en Firebase: los comensales previstos salen de las confirmaciones de los socios (`arrivals`), la capacidad de la suma de puestos de las mesas (158) y la producción sugerida reparte esos comensales según los platos que realmente se han pedido (`orders` y `pase`).
- El **mesero** toma pedidos desde el mapa de mesas: elige una mesa (libre, ocupada o que pidió la cuenta) y le toma el pedido. Si la mesa estaba libre, queda ocupada para todos.
- El **Director de A&B** tiene el botón **Reiniciar**, que devuelve la demo al escenario inicial para todos los perfiles y borra todos los pedidos.

## Cuentas demo

Contraseña de todas: `123456`.

| Perfil | Correo | Ve |
| --- | --- | --- |
| Director de A&B | director@farallones.co | Panel de control y cocina (A) |
| Planeación y reservas | planeacion@farallones.co | Planeación de cocina y recepción de mesas (B) |
| Mesero | mesero@farallones.co | App del mesero (A) |
| Socio | socio@farallones.co | App del socio: planear el domingo (B) y carta en la mesa (C) |
| Jefe de pase | pase@farallones.co | Estación de pase (C) |

La sesión vive por pestaña, así que se pueden abrir varios perfiles a la vez en el mismo navegador.

## Datos en Realtime Database

| Ruta | Contenido |
| --- | --- |
| `products/<id>` | Menú y disponibilidad (`st`: `ok`, `few`, `off`; `left`, `since`) |
| `orders/<key>` | Pedidos de cocina (propuesta A) |
| `notices/<key>` | Avisos de platos agotados y su confirmación por el mesero |
| `calls/<key>` | Llamadas del socio al mesero |
| `plan` | Sugerencia de horario enviada y último pedido al almacén (B) |
| `tables/<mesa>` | Estado de cada mesa en recepción (B) |
| `arrivals/<key>` | Familias que confirmaron llegada (B) |
| `waitlist/<key>` | Lista de espera (B) |
| `pase/<key>` | Pedidos desde la carta: lista de chequeo, temperatura, calentado, calificación y devolución (C). De aquí salen los indicadores de calidad del pase |
| `seatings/<key>` | Comensales sentados en cada mesa y a qué hora: es la demanda "real" del panel del director |
| `diners/<uid>` | Mesa en la que está cada socio (la que eligió o, si no, la que le asignó Recepción) |
| `meta` | Fecha de siembra y número de meseros |

En `products` se pueden agregar platos propios desde la consola. Cada uno necesita al menos `name` y `price`, y se aceptan estos alias: `nombre`, `precio`, `categoria`/`category` (por `cat`), `disponible`/`available`, `estado` (por `st`), `tiempoPreparacion` (por `min`), `opciones` (por `options`) y `rapido` (por `fast`). Un menú que ya exista no se reemplaza al sembrar.

Si Firebase no está configurado, la app funciona en modo local con las cuentas demo, pero los cambios no se guardan ni se comparten.

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

## Publicar en Firebase Hosting

```bash
npm run build
npx firebase-tools deploy --only hosting,database
```
