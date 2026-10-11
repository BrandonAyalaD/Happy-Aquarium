'use strict';
// Las ilustraciones son representaciones artísticas; los datos describen la especie de referencia.
const SPECIES_GUIDE={};
[
 ['sun','Pez payaso','Amphiprion ocellaris','Indopacífico occidental, desde el océano Índico oriental hasta Filipinas y Japón.','Arrecifes y lagunas tropicales poco profundas.','Vive asociado a anémonas que le ofrecen refugio.'],
 ['blue','Cirujano azul','Paracanthurus hepatus','Indopacífico, desde África oriental hasta las islas del Pacífico.','Arrecifes marinos con agua clara y corrientes.','Los jóvenes se refugian entre ramas de coral.'],
 ['rose','Cirujano amarillo','Zebrasoma flavescens','Océano Pacífico, incluidas Hawái y otras islas tropicales.','Arrecifes marinos tropicales.','Su cuerpo aplanado le permite moverse entre los corales.'],
 ['stripe','Pez disco','Symphysodon aequifasciatus','Cuenca del Amazonas, en Sudamérica.','Ríos y zonas inundadas de agua dulce tropical.','Disco fuego es una variedad artística del juego inspirada en peces disco.'],
 ['moon','Betta','Betta splendens','Sudeste asiático, cuenca del Mekong.','Aguas dulces tranquilas, canales y llanuras inundadas.','Construye nidos de burbujas y puede respirar aire.'],
 ['mint','Pez dorado · variedad oranda','Carassius auratus','Asia oriental; las variedades ornamentales se desarrollaron mediante cría.','Agua dulce: lagos, estanques y ríos de corriente lenta.','El oranda es una variedad doméstica del pez dorado, no una especie diferente.'],
 ['royal','Guppy','Poecilia reticulata','Norte de Sudamérica y algunas islas del Caribe.','Arroyos y otros ambientes de agua dulce.','Da a luz crías vivas; el diseño leopardo es una variedad ornamental.'],
 ['pearl','Tetra neón','Paracheirodon innesi','Amazonas occidental, en Sudamérica.','Arroyos de agua dulce tropical.','Su franja brillante contrasta con las aguas de su entorno.'],
 ['emperor','Pez ángel emperador','Pomacanthus imperator','Océanos Índico y Pacífico tropicales.','Lagunas y arrecifes marinos de coral.','Los juveniles tienen un patrón de color diferente al de los adultos.'],
 ['gramma','Gramma real','Gramma loreto','Atlántico occidental tropical y mar Caribe.','Arrecifes marinos, cuevas y salientes rocosos.','Suele permanecer cerca de refugios en el arrecife.'],
 ['reefshark','Tiburón de arrecife de puntas negras','Carcharhinus melanopterus','Indopacífico tropical.','Arrecifes, lagunas y aguas costeras poco profundas.','Las puntas oscuras de sus aletas ayudan a reconocerlo.'],
 ['lionfish','Pez león','Pterois volitans','Indopacífico; introducido en el Atlántico occidental.','Arrecifes y fondos rocosos marinos.','Sus largas espinas contienen veneno y forman parte de su defensa.'],
 ['mandarin','Pez mandarín','Synchiropus splendidus','Pacífico occidental: Filipinas, Indonesia, Australia y áreas cercanas.','Fondos de arrecifes tropicales poco profundos.','Es un pequeño pez que pasa mucho tiempo cerca del fondo.'],
 ['moorish','Ídolo moro','Zanclus cornutus','Indopacífico y Pacífico oriental tropical.','Lagunas y arrecifes marinos.','Su aleta dorsal se prolonga en un filamento característico.'],
 ['puffer','Pez erizo de espinas largas','Diodon holocanthus','Mares tropicales de varias regiones del mundo.','Arrecifes y fondos marinos costeros.','Se infla como defensa; Globo leopardo es el nombre artístico de su diseño.'],
 ['koi','Carpa koi','Cyprinus carpio','Carpa originaria de Eurasia; variedades koi desarrolladas por selección ornamental.','Agua dulce: lagos, estanques y ríos tranquilos.','Koi es una variedad ornamental de la carpa común.'],
 ['arowana','Arowana plateada','Osteoglossum bicirrhosum','Sudamérica, incluidas las cuencas del Amazonas y del Essequibo.','Ríos y lagos de agua dulce tropical.','Nada cerca de la superficie; el macho incuba huevos en su boca.'],
 ['corydora','Corydora de tres líneas','Corydoras trilineatus','Amazonas y drenajes de Surinam, en Sudamérica.','Fondos de ríos y arroyos de agua dulce tropical.','Sus barbillas le ayudan a explorar el fondo. Es la especie de referencia del diseño moteado.'],
 ['butterfly','Pez mariposa de bandas cobrizas','Chelmon rostratus','Pacífico occidental, desde el mar de Andamán hasta Australia.','Arrecifes, costas rocosas y estuarios.','Su hocico alargado es uno de sus rasgos más reconocibles.'],
 ['seahorse','Caballito de mar común','Hippocampus kuda','Indopacífico tropical.','Aguas costeras con vegetación y otros puntos de sujeción.','El macho lleva los huevos en una bolsa incubadora. El tono dorado es una interpretación artística.']
].forEach(([id,common,scientific,origin,habitat,fact])=>SPECIES_GUIDE[id]={common,scientific,origin,habitat,fact,source:'https://www.fishbase.se/summary/'+scientific.replaceAll(' ','-')+'.html'});
SPECIES_GUIDE.mandarin.source='https://animaldiversity.org/accounts/Synchiropus_splendidus/';
SPECIES_GUIDE.fang={common:"Payara · pez vampiro",scientific:"Hydrolycus scomberoides",origin:"Cuenca del río Amazonas, en Sudamérica.",habitat:"Ríos tropicales de agua dulce.",fact:"Es un depredador que se alimenta de otros peces. Sus grandes colmillos inferiores son característicos. Colmillo de Plata es su nombre en Aquamentum.",source:"https://www.fishbase.se/summary/Hydrolycus-scomberoides.html"};
