# Acuario Feliz

Juego de acuario en español con peces animados, alimentación con el mouse, decoración editable, tienda, crianza, logros y evento de Halloween.

## Jugar

La página pública se publica desde `dist/` mediante GitHub Pages. Para probar localmente sirve esa carpeta con cualquier servidor HTTP; no necesita compilación.

## Cuentas y partidas en la nube

El juego incluye registro con correo y contraseña, confirmación por correo, recuperación de contraseña, sesión persistente y guardado automático cada 15 segundos. Los invitados conservan su partida en el navegador. Cada cuenta tiene una copia local independiente y su propia partida en Supabase.

Para activarlo:

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard). Elige el plan que prefieras; no hacen falta servicios de pago para la configuración inicial.
2. Ejecuta `supabase/schema.sql` en el SQL Editor del proyecto.
3. En Authentication → URL Configuration configura la dirección pública del juego como Site URL y añádela a Redirect URLs. Para desarrollo, permite también `http://127.0.0.1:4173/`.
4. Mantén activo Email/password y la confirmación de correo. Para una audiencia pública, configura un proveedor SMTP y revisa los límites de envío de correo del proyecto.
5. Copia la Project URL y la **publishable key** (o la clave pública `anon`) a `dist/cloud-config.js`. Estos valores son públicos. **Nunca copies `service_role`, `sb_secret_…` ni contraseñas a este archivo o al repositorio.**
6. Guarda los cambios y súbelos a `main`. En el repositorio, Settings → Pages → Source debe ser **GitHub Actions**. El flujo `.github/workflows/pages.yml` publica `dist/`.

La tabla utiliza Row Level Security para que cada usuario solo lea su partida. Las escrituras pasan por una función que comprueba el usuario y la revisión actual. Si dos dispositivos guardan versiones diferentes, se solicita elegir la copia antes de reemplazarla. Ante una desconexión, se conserva la copia local pendiente y se reintenta; espera el estado “Partida guardada en la nube” antes de cambiar de dispositivo.

Al entrar a una cuenta nueva puedes conservar explícitamente la partida de invitado o comenzar de cero. Al salir, vuelve la partida de invitado. No se transfieren partidas entre cuentas automáticamente.

## Verificación tras conectar Supabase

- Registrar y confirmar dos cuentas distintas; comprobar que sus monedas, peces y decoraciones son independientes.
- Jugar en una cuenta, esperar la confirmación de guardado y abrirla en otro navegador/dispositivo.
- Abrir la misma cuenta en dos dispositivos, guardar cambios en ambos y comprobar el selector de versiones.
- Desconectar Internet, jugar, reconectar y verificar el guardado pendiente.
- Probar la recuperación de contraseña desde el correo.

El juego es casual: las monedas y misiones se calculan en el cliente. No se debe usar esta economía para pagos, premios de valor real o clasificaciones competitivas sin validación adicional en servidor.

Consulta `LEEME.md` para las mecánicas y `ASSETS.md` para la procedencia de los diseños.
