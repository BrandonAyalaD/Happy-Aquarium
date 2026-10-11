'use strict';
const EXTRA_FISH=[
 {id:'zebrapleco',name:'Pleco cebra',price:880,level:5,grow:420,rate:16,swimDepth:.72,swimSpeed:.65},
 {id:'rainbow',name:'Arcoíris de Boeseman',price:380,level:3,grow:285,rate:8},
 {id:'redtail',name:'Bagre de cola roja',price:2250,level:10,grow:660,rate:37,swimDepth:.62,swimSpeed:.8},
 {id:'ramirezi',name:'Ramirezi dorado',price:750,level:5,grow:390,rate:14},
 {id:'archer',name:'Pez arquero',price:1300,level:7,grow:510,rate:24,swimDepth:.26},
 {id:'banggai',name:'Cardenal de Banggai',price:1050,level:6,grow:465,rate:19,swimSpeed:.75},
 {id:'cherrybarb',name:'Barbo cereza',price:210,level:2,grow:225,rate:5},
 {id:'sailfin',name:'Molly de aleta vela',price:330,level:3,grow:270,rate:7},
 {id:'clownloach',name:'Locha payaso',price:980,level:6,grow:450,rate:18,swimDepth:.65},
 {id:'motororay',name:'Raya motoro',price:3400,level:12,grow:780,rate:50,swimDepth:.75,swimSpeed:.65,displayScale:1.15}
];
const VALENTINE_DECOR_NAMES=['Arco del corazón','Pabellón de las perlas','Puente de los enamorados','Conchas del cariño','Cisnes del arrecife','Castillo de las rosas','Ánforas entrelazadas','Flecha de coral','Mensaje en una botella','Caballitos del amor'];
const VALENTINE_MISSIONS=[
 {key:'fed',goal:3,title:'Un gesto de cariño',text:'Alimenta a tus peces 3 veces.'},
 {key:'cleaned',goal:2,title:'Un hogar para compartir',text:'Limpia un acuario 2 veces.'},
 {key:'collected',goal:3,title:'Perlas de amistad',text:'Recolecta monedas 3 veces.'},
 {key:'foodBought',goal:1,title:'La despensa del cariño',text:'Compra alimento 1 vez.'},
 {key:'decorated',goal:3,title:'Un refugio especial',text:'Coloca decoraciones 3 veces.'},
 {key:'trained',goal:1,title:'Una sorpresa de burbujas',text:'Completa 1 entrenamiento.'},
 {key:'bought',goal:2,title:'Nuevos compañeros',text:'Compra 2 peces.'},
 {key:'dailyClaims',goal:3,title:'Tres días de ilusión',text:'Abre el cofre diario en 3 días distintos.'},
 {key:'bred',goal:1,title:'La familia del arrecife',text:'Cría 1 pez.'},
 {key:'fed',goal:25,title:'Un mes de cuidados',text:'Alimenta a tus peces 25 veces.'}
];
[
 ['zebrapleco','Pleco cebra','Hypancistrus zebra','Río Xingu, Brasil.','Fondos de agua dulce tropical, con refugios entre rocas.','El macho cuida los huevos depositados en cuevas.'],
 ['rainbow','Pez arcoíris de Boeseman','Melanotaenia boesemani','Lagos de la península de Bird’s Head, Nueva Guinea occidental.','Agua dulce tropical con vegetación.','El contraste azul y naranja inspira el diseño de esta ilustración.'],
 ['redtail','Bagre de cola roja','Phractocephalus hemioliopterus','Cuencas del Amazonas y del Orinoco, en Sudamérica.','Ríos y lagos tropicales de agua dulce.','Se reconoce por su cola rojiza y sus largas barbillas.'],
 ['ramirezi','Cíclido ramirezi','Mikrogeophagus ramirezi','Cuenca del Orinoco, en Venezuela y Colombia.','Agua dulce tropical, cerca del fondo.','Ramirezi dorado es una interpretación ornamental de esta especie.'],
 ['archer','Pez arquero de bandas','Toxotes jaculatrix','Asia tropical y norte de Australia.','Estuarios, manglares y aguas dulces o salobres.','Puede lanzar chorros de agua para derribar insectos.'],
 ['banggai','Cardenal de Banggai','Pterapogon kauderni','Islas Banggai, Indonesia.','Aguas marinas tropicales poco profundas.','El macho incuba los huevos en su boca.'],
 ['cherrybarb','Barbo cereza','Puntius titteya','Sri Lanka.','Arroyos de agua dulce tropical.','Su color rojizo da origen a su nombre común.'],
 ['sailfin','Molly de aleta vela','Poecilia latipinna','Sureste de Estados Unidos y costas de México.','Aguas dulces y salobres costeras.','La gran aleta dorsal del macho parece una vela; la ilustración muestra una variedad moteada.'],
 ['clownloach','Locha payaso','Chromobotia macracanthus','Sumatra y Borneo, en Indonesia.','Ríos y zonas inundables de agua dulce.','Sus bandas oscuras contrastan con su color naranja.'],
 ['motororay','Raya motoro','Potamotrygon motoro','Cuencas fluviales de Sudamérica.','Fondos de ríos de agua dulce tropical.','Su cuerpo en forma de disco lleva manchas redondeadas; esta ilustración toma la especie como referencia.']
].forEach(([id,common,scientific,origin,habitat,fact])=>SPECIES_GUIDE[id]={common,scientific,origin,habitat,fact,source:'https://www.fishbase.se/summary/'+scientific.replaceAll(' ','-')+'.html'});

const VALENTINE_ASPECTS=[1,1,1,1,1,1,1,1,1,1];
