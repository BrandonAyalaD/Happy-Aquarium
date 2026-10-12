# Peces

Preparados con la herramienta integrada ImageGen a partir de las diez imágenes del usuario. Archivos finales: `dist/assets/fish-1.png` a `fish-10.png`, en el orden de los archivos originales numerados del 1 al 10.

Prompt aplicado por separado a cada imagen:

> Use case: background-extraction. Edit target: the supplied fish image. Remove ONLY the turquoise background and output this exact single fish on actual transparent alpha. Preserve its exact species, colors, scales, eye, silhouette, pose and right-facing orientation, including all delicate translucent fins. No redesign, no text, no shadow, no new objects. Center the complete fish in a tight square image with a small transparent margin. This is a game sprite.

En el reintento de los peces 9 y 10 se usó la misma instrucción abreviada: retirar únicamente el fondo turquesa, conservar pez, colores, aletas, silueta, escamas y ojo; transparencia real, pez completo centrado, sin rediseño, texto ni sombras.

La animación es procedural en el canvas del juego, a partir de cada imagen: ondulación de la cola, balanceo y mayor velocidad al buscar alimento. No se trata de modelos 3D ni de sprites con fotogramas dibujados individualmente.

# Decoraciones

Diez imágenes aportadas por el usuario, preparadas con ImageGen integrado (modo de edición) y guardadas como `dist/assets/decor-1.png` a `decor-10.png`, siguiendo la numeración original.

Instrucciones de edición aplicadas individualmente: retirar el fondo turquesa y la sombra del suelo; conservar el objeto completo, sus colores, detalles, forma y perspectiva; usar transparencia real, también en los huecos; no añadir texto ni rediseñar. Para el volcán se retiraron las burbujas de la imagen para generarlas mediante animación en el juego.

Orden: arco de arrecife, raíz, cueva, naufragio, ánfora, pagoda, volcán, puente, concha y jardín de coral.

Animación procedural: burbujas y brillo en el volcán, burbujas en el naufragio, balanceo suave del coral y movimiento de la concha. El cofre diario se dibuja con CSS y tiene brillo y apertura animada. La música se genera con Web Audio y no utiliza grabaciones externas.


# Evento Halloween

Assets preparados con ImageGen integrado, modo edición, a partir de las once imágenes del usuario. Archivos en `dist/assets/halloween-decor-1.png` a `halloween-decor-10.png`, siguiendo la numeración original, y `halloween-fish.png`.

Prompt base para las decoraciones:

> Use case: background-extraction. Edit target: supplied Halloween aquarium ornament. Remove ONLY underwater cyan background, water, ground and cast ground shadow. Preserve the exact complete object, details, colors, shape, perspective. Actual transparent alpha, including all open holes. Single centered game sprite with small transparent margin. No redesign, no text, no new objects.

Para el caldero se añadió:

> Remove floating bubbles above the cauldron; preserve green potion and cauldron. Bubbles will be animated in code.

Prompt para el pez:

> Use case: background-extraction. Edit target: supplied silver fang fish. Remove ONLY underwater cyan background, water, ground and cast ground shadow. Preserve the exact complete object, details, colors, shape, perspective, fins, silver scales, eye, long fangs and right-facing pose. Actual transparent alpha, including all open holes. Single centered game sprite with small transparent margin. No redesign, no text, no new objects.

Animaciones implementadas en canvas: luz pulsante, burbujas verdes, murciélagos, destellos fantasmales, balanceo del árbol y barco, ondulación del pez y búsqueda de comida. Las recompensas se entregan por misiones y se guardan con la partida.



## Navidad y diez especies nuevas (10 de octubre de 2026)
Veinte recortes preparados con ImageGen integrado, uno por cada diseño suministrado. Archivos finales: dist/assets/christmas-decor-1.png a christmas-decor-10.png y dist/assets/new-fish-1.png a new-fish-10.png, según el número en el archivo original. Se conserva transparencia real y se optimiza el tamaño a un máximo de 512 píxeles, conservando proporciones.

Prompt de decoraciones: “Use case: background-extraction. Edit target: the supplied Christmas decoration. Extract this exact ornament for an aquarium game. Remove blue water, distant scenery, rays and all sandy floor, including background visible through openings. Preserve entire decoration, shells, pearls, seaweed, coral, gems, wood and colors unchanged. Actual transparent background, centered with tight useful framing and small margin. No floor or background shadows, no text.” El árbol recibió la misma instrucción específica para ramas y estrella.

Prompt de peces: “Use case: background-extraction. Edit target: the supplied fish. Extract this exact fish for an aquarium game. Remove all blue water, rays and background, including spaces between fins and spines. Preserve entire fish anatomy, colors, texture and details. Orient fish facing RIGHT (mirror horizontally if it faces left), preserve pose. Actual transparent background, centered, tightly framed with small margin, no text, no extra subjects.”

Las animaciones son procedurales, no modelos 3D ni secuencias de fotogramas independientes.

Aydon y Ruria: retratos preparados a partir de los diseños proporcionados por el usuario. Dos expresiones por personaje para la animación de diálogo, en assets/guides.png.

Diez peces extra y diez decoraciones de enamorados preparados con transparencia a partir de las imágenes del usuario del 11 de octubre de 2026. Archivos extra-fish-1..10.png y valentine-decor-1..10.png. Las imágenes son interpretaciones artísticas; las fichas usan especies de referencia con enlaces a FishBase.

Fondos del acuario: seis paisajes proporcionados por el usuario el 11 de octubre de 2026, optimizados como background-0..5.webp. Se mantiene su proporción con recorte central; la arena natural conserva el suelo de la imagen y otros sustratos usan una transición suave.
