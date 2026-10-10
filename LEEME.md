# Acuario Feliz

Juego individual de navegador inspirado en el cuidado y colección de acuarios. Usa los diseños de peces y decoraciones proporcionados por el usuario.

## Jugar

Abre `dist/index.html` en un navegador moderno, o usa la vista previa local. Pulsa Alimentar para activar la botellita, mueve el mouse y haz clic dentro del agua: gastarás una porción y caerán cinco granitos. Los peces nadan hacia ellos y mejoran su alimentación al comer. Pulsa Alimentar otra vez o Escape para terminar. Limpia el agua, recolecta monedas, compra especies y completa logros para subir de nivel. Selecciona un pez para nombrarlo, entrenarlo, criar o venderlo.

Incluye 10 especies, 10 decoraciones nuevas, almacén de objetos, movimiento de decoraciones, 3 paisajes, hasta 5 acuarios ampliables, 19 logros y un minijuego de entrenamiento con 7 mejoras por pez.

Para criar necesitas dos adultos de la misma especie, alimentación de al menos 60%, limpieza de al menos 60%, capacidad libre y monedas. Cada pareja espera tres minutos entre crías.

Compra decoraciones y haz clic en la arena para colocarlas. El botón Decorar permite arrastrarlas; al hacer clic puedes guardarlas en el almacén.

El menú ☰ ofrece alimento, cambio de paisaje, nombre del acuario y exportación/importación de partidas JSON. El guardado usa almacenamiento del navegador, sin cuentas, sincronización ni funciones sociales. Exporta antes de cambiar de navegador o borrar sus datos.

Al regresar se simulan hasta ocho horas. Los peces no mueren por abandono. Las tipografías web son opcionales y tienen alternativas locales.

## Archivos

`dist/index.html`, `dist/style.css` y `dist/game.js` forman el juego completo, sin dependencias de compilación.


Los diez diseños de peces suministrados se prepararon con ImageGen integrado para extraer el fondo transparente. La animación usa ondulación de cola y cuerpo durante el nado y acelera al perseguir comida. Las partidas anteriores siguen siendo compatibles.


## Alimento, música y tesoro
Compra paquetes de 25, 50 o 150 porciones en la pestaña Alimento. La música ambiental procedural se activa y desactiva con el botón Música. Empieza apagada y no necesita archivos de audio ni conexión.
Haz clic en el cofre dorado del acuario para recibir 200 monedas y 25 porciones una vez al día, según la fecha de Ciudad de México. La recompensa es compartida entre todos tus acuarios. Los ingresos de los peces se siguen recogiendo con Recolectar.
Ver todos los logros muestra las 19 metas y permite recoger cada recompensa disponible.
Las decoraciones previas se sustituyen automáticamente por piezas nuevas equivalentes, conservando posiciones y objetos del almacén. El volcán produce burbujas y brillo, la concha respira suavemente y el coral se balancea.


## Editar decoraciones
Pulsa Decorar y selecciona una pieza en el acuario o en la lista del editor. Arrástrala para moverla. Ajusta el tamaño entre 40 % y 200 %, refleja horizontalmente y cambia su orden con Una capa atrás/delante o Al fondo/frente. La lista permite seleccionar piezas ocultas detrás de otras. Guardar en almacén conserva el tamaño y reflejo para la siguiente colocación. Los cambios se guardan automáticamente.

## Arena y piedras
En la pestaña Sustratos puedes volver a la arena natural o comprar piedras de río (120 monedas), perladas (160), rosas, turquesas o violetas (180 cada una), y arcoíris (250). Cada compra desbloquea el sustrato para toda tu partida; cada acuario puede usar uno distinto. Cambiar entre los que ya tienes es gratis. La selección y la colección se guardan y se incluyen al exportar. Las texturas se dibujan en canvas con grano, luces, sombras y perspectiva.

## Halloween: el arrecife de medianoche
Abre Eventos activos y pulsa Participar. El evento está activo sin fecha de cierre por ahora. Las acciones nuevas de todos tus acuarios cuentan desde ese momento. Las diez misiones entregan las diez decoraciones exclusivas al Almacén; se reclaman una sola vez. Las tareas son alimentar, limpiar, recolectar monedas, comprar alimento, colocar decoraciones, entrenar, comprar peces, abrir el cofre en dos días distintos y criar. Al reclamar las diez recompensas desbloqueas Colmillo de Plata. Pulsa Recibir en este acuario cuando haya espacio; si está lleno el pez queda pendiente. El pez único puede renombrarse y entrenarse, y se conserva sin venta ni reproducción. Todo el progreso se incluye en el guardado y la exportación.

Las decoraciones conservan los controles de tamaño, reflejo y capas. El caldero emite burbujas verdes; las calabazas tienen luz pulsante; la casa, el cementerio y los huesos emiten destellos fantasmales; el ánfora tiene murciélagos; el árbol y las velas del barco se balancean. El pez tiene ondulación procedural y busca la comida.

## Amigos y expediciones

En Amigos encontrarás tu código personal. Compártelo con tu familia para enviar y aceptar solicitudes y visitar sus acuarios. Puedes desactivar las visitas desde tu perfil.

Pulsa el barril junto a la pecera, invita de uno a cuatro amigos y espera a que acepten. Con dos o más participantes el anfitrión puede zarpar. El viaje dura 15 minutos; cada jugador puede salir una vez cada 24 horas. Más participantes aumentan las posibilidades de peces y la cantidad de monedas o comida. Consulta Premios y probabilidades dentro del barril. Los peces ganados esperan en reserva si tu acuario está lleno.

## Espacio, nombre e iluminación

Ampliar aumenta la capacidad de 8 a 24 peces en cinco tamaños. Cada ampliación aumenta el espacio del mundo en 25% del tamaño original. La cámara muestra todo el tanque: peces y decoraciones se ven proporcionalmente más pequeños. Usa Acercar y las flechas para decorar con precisión y Ver todo para volver a la vista completa, sin barras de desplazamiento. Las ampliaciones anteriores reciben el espacio automáticamente.

En Nombre e iluminación puedes renombrar cada acuario, encender o apagar luces, elegir seis tonos o un color personalizado y ajustar su intensidad. Los cambios se guardan por acuario, también en la nube. Tus amigos ven las luces al visitarte.
