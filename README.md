# Aquamentum

Juego de acuario en español con peces animados, alimentación con el mouse, decoración editable, tienda, crianza, logros y evento de Halloween.

## Jugar

[Abrir el juego](https://brandonayalad.github.io/Happy-Aquarium/). Se publica desde `dist/` mediante GitHub Pages. Para probar localmente sirve esa carpeta con cualquier servidor HTTP; no necesita compilación.

## Cuentas y partidas en la nube

El juego incluye registro con correo y contraseña, sesión persistente y guardado automático cada 15 segundos. Los invitados conservan su partida en el navegador. Cada cuenta tiene una copia local independiente y su propia partida en Supabase. En este proyecto el propietario autorizó el registro inmediato sin confirmar el correo para jugar en familia. La recuperación de contraseña por correo está pendiente de configurar SMTP; `passwordRecovery: false` muestra esa limitación en el juego.

Para activarlo:

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard). Elige el plan que prefieras; no hacen falta servicios de pago para la configuración inicial.
2. Ejecuta `supabase/schema.sql` y después `supabase/social.sql` en el SQL Editor del proyecto.
3. En Authentication → URL Configuration configura la dirección pública del juego como Site URL y añádela a Redirect URLs. Para desarrollo, permite también `http://127.0.0.1:4173/`.
4. Mantén activo Email/password. Para verificar los correos y habilitar recuperación de contraseñas, configura un proveedor SMTP, activa Confirm email en Supabase y cambia `passwordRecovery` a `true` en `dist/cloud-config.js`.
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

## Amigos y expediciones

Abre Amigos, elige un nombre y comparte tu código AF. La otra persona envía una solicitud y debes aceptarla. Solo amigos aceptados pueden visitar la última versión guardada de tus acuarios; puedes desactivar las visitas en tu perfil. Las visitas son de solo lectura.

El barril junto al acuario abre Expediciones. Invita de uno a cuatro amigos; deben aceptar y el anfitrión pulsa Zarpar. Cada viaje dura 15 minutos y cada jugador puede salir una vez cada 24 horas. El reloj, participantes y sorteo se validan en Supabase. Puedes cerrar el juego y reclamar al volver. Cada participante recibe un premio independiente y no puede reclamarlo dos veces.

| Participantes | Monedas | Alimento | Guppy leopardo | Pez vampiro |
| --- | --- | --- | --- | --- |
| 2 | 65%: 350 | 30%: 35 porciones | 4% | 1% |
| 3 | 62%: 400 | 30%: 40 porciones | 6% | 2% |
| 4 | 58%: 450 | 30%: 45 porciones | 8% | 4% |
| 5 | 54%: 500 | 30%: 50 porciones | 10% | 6% |

Los peces ganados quedan en reserva hasta que elijas un acuario con espacio. Las tablas sociales tienen RLS y se accede mediante funciones que comprueban la sesión y amistad. `supabase/tests/social.sql` ejecuta pruebas de integración dentro de una transacción que revierte sus datos.

## Espacio, nombre e iluminación

Ampliar aumenta la capacidad de 8 a 24 peces en cinco tamaños. Cada ampliación aumenta el espacio del mundo en 25% del tamaño original. La cámara muestra todo el tanque: peces y decoraciones se ven proporcionalmente más pequeños. Usa Acercar y las flechas para decorar con precisión y Ver todo para volver a la vista completa, sin barras de desplazamiento. Las ampliaciones anteriores reciben el espacio automáticamente.

En Nombre e iluminación puedes renombrar cada acuario, encender o apagar luces, elegir seis tonos o un color personalizado y ajustar su intensidad. Los cambios se guardan por acuario, también en la nube. Tus amigos ven las luces al visitarte.


## Temporadas y navegación del acuario
Halloween está disponible del 1 al 31 de octubre y Navidad del 1 al 31 de diciembre, inclusive, cada año según America/Mexico_City. Fuera de estas fechas no se puede participar ni reclamar premios nuevos. Los premios obtenidos permanecen en la partida; el pez de Halloween ya desbloqueado puede recibirse fuera de temporada. Cada temporada inicia sus propias misiones al participar, sin contar acciones anteriores, y reinicia misiones al participar en un año nuevo. Navidad da diez decoraciones exclusivas.

El calendario usa la fecha del dispositivo; como la economía local del juego, no es una protección contra partidas manipuladas o cambios de reloj.

Las 10 nuevas especies están en la tienda durante todo el año (20 especies normales en total). Se compran con monedas del juego según el nivel. Incluyen tiburón, pez león, mandarín, ídolo moro, globo, koi, arowana, corydora, mariposa y caballito de mar. El nado se anima en canvas y las decoraciones navideñas tienen balanceo, destellos y luz suave.

PC: rueda sobre el agua para zoom de 1× a 3×, arrastrar para desplazar la vista ampliada. Celular: pellizcar con dos dedos para acercar/alejar y mover el punto de vista; con un dedo, arrastrar para explorar. Un toque sigue seleccionando peces, alimentando o colocando una pieza según el modo. En Decorar, arrastrar una pieza la mueve; usa dos dedos para mover la cámara sin mover la pieza. Los botones Acercar y Ver todo siguen disponibles.


## Interfaz Aquamentum
La tienda y el almacén se abren como paneles compactos sobre el acuario mediante las cinco pestañas superiores; se cierran con ×, Escape o tocando la pestaña abierta. El ancla lateral aparece únicamente si hay un evento activo y muestra solo esa temporada. El nombre del tanque abre su personalización de nombre e iluminación. Las claves de guardado y cuentas se conservan.
