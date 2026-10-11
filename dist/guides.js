'use strict';
(()=>{
 const $=id=>document.getElementById(id),api=window.aquariumGame.guidance,panel=$('guidePanel');
 const tour=[
  {who:'Aydon',title:'Bienvenido a Aquamentum',text:'¡Hola! Soy Aydon. Ruria y yo te acompañaremos a cuidar tus peces y crear tu propio arrecife. Puedes seguir este recorrido o cerrarlo y volver desde Guías.',target:'canvas'},
  {who:'Ruria',title:'La primera comida',text:'Pulsa Alimentar y toca el agua para dejar caer comida. Los peces nadarán hacia ella. Vuelve a pulsar Alimentar para guardar la botellita; compra más en la pestaña Alimento.',target:'feed'},
  {who:'Aydon',title:'Agua limpia, peces felices',text:'Usa Limpiar cuando baje la calidad del agua. Los peces alimentados y con agua limpia crecen y producen monedas. Con Recolectar recoges las monedas que han generado.',target:'scrub'},
  {who:'Ruria',title:'Tu colección',text:'Encima del acuario tienes Peces, Decoración, Alimento, Sustratos y Almacén. Toca una pestaña para abrirla; puedes cerrarla con la X. Cada pez muestra su precio y el nivel que necesitas.',target:'shopTabs'},
  {who:'Ruria',title:'Un arrecife a tu gusto',text:'Compra una decoración y toca la arena para colocarla. Con Decorar puedes arrastrarla, ajustar su tamaño, reflejarla y decidir qué piezas van delante. Toca el nombre del acuario para cambiarlo y elegir sus luces.',target:'edit'},
  {who:'Aydon',title:'Más espacio y aventuras',text:'Ampliar aumenta el espacio y permite hasta 48 peces al tamaño máximo. Desde Amigos puedes añadir compañeros y visitar sus acuarios. El barril abre expediciones que requieren al menos un amigo.',target:'expeditionBarrel'},
  {who:'Ruria',title:'Admira y descubre',text:'Con Admirar acuario verás solo tu tanque. Toca un pez para conocer su nombre científico, origen y hábitat. Usa Salir para volver al juego; puedes acercarte con la rueda o pellizcando con dos dedos.',target:'observe'},
  {who:'Aydon',title:'Tu siguiente paso',text:'Prueba a alimentar a tus peces y revisar tu próximo logro. El ancla aparece cuando hay una temporada activa: sus misiones dan premios especiales. Tu cuenta guarda el progreso en la nube; como invitado se guarda en este navegador.',target:'questTitle'}
 ];
 let steps=[],index=0,timer=null,fullText='',typing=false,sessionKey=null,highlight=null,tourMode=false,speechOwner=null,inlineTimer=null;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function clearHighlight(){highlight?.classList.remove('guide-highlight');highlight=null}
 function stop(){clearInterval(timer);timer=null;typing=false;$('guidePortrait').classList.remove('speaking')}
 function finishText(){stop();$('guideText').textContent=fullText}
 function dismiss(mark=false){stop();clearHighlight();panel.hidden=true;if(mark&&tourMode&&api.ready()&&speechOwner===api.key())api.mark('tourDone');steps=[];tourMode=false}
 function say(step){
  stop();clearHighlight();fullText=step.text;speechOwner=api.key();
  const portrait=$('guidePortrait');portrait.className='guide-portrait '+step.who.toLowerCase();portrait.setAttribute('aria-label',step.who);
  $('guideName').textContent=step.who;$('guideStep').textContent=(steps.length>1?(index+1)+' / '+steps.length+' · ':'')+step.title;
  $('guideLocate').hidden=!step.target;$('guideSkip').hidden=!tourMode;$('guideNext').textContent=index===steps.length-1?'Entendido':'Siguiente';$('guideAnnounce').textContent=step.who+': '+fullText;
  $('guideText').textContent='';panel.hidden=false;
  if(reduced()){finishText();return}let n=0;typing=true;portrait.classList.add('speaking');
  timer=setInterval(()=>{if(panel.hidden||api.key()!==speechOwner||api.observing()){stop();return}n+=3;$('guideText').textContent=fullText.slice(0,n);if(n>=fullText.length)finishText()},25);
 }
 function open(list,tutorial=false){if(!api.ready()||api.observing())return;dismiss();steps=list;index=0;tourMode=tutorial;say(steps[0])}
 function eventStep(){const id=api.season();if(!id)return null;if(id==='valentines')return {who:'Ruria',title:'Enamorados está activo',text:'¡Celebremos el cariño bajo el mar! Abre el ancla y pulsa Participar en Enamorados. Completa las diez misiones para ganar decoraciones especiales del 1 al 28 de febrero de 2027. Tus nuevas acciones cuentan desde que participas y los premios obtenidos se conservan.',target:'eventAnchor'};const hw=id==='halloween';return {who:hw?'Aydon':'Ruria',title:hw?'Halloween está activo':'Navidad está activa',text:hw?'¡El arrecife de medianoche nos espera! Abre el ancla y pulsa Participar en Halloween. Después completa las misiones para ganar decoraciones y desbloquear la payara Colmillo de Plata. Puedes conseguir premios hasta el 31 de octubre; lo ganado se conserva.':'¡Celebremos Navidad bajo el mar! Abre el ancla y pulsa Participar en Navidad. Completa las misiones para conseguir diez decoraciones especiales, del 1 al 31 de diciembre. Los premios que consigas se quedan en tu colección.',target:'eventAnchor'}}
 $('guideHelp').onclick=()=>open(tour,true);
 $('guideNext').onclick=()=>{if(typing){finishText();return}if(index<steps.length-1){index++;say(steps[index])}else dismiss(true)};
 $('guideClose').onclick=$('guideSkip').onclick=()=>dismiss(true);
 $('guideLocate').onclick=()=>{finishText();clearHighlight();highlight=$(steps[index]?.target);if(highlight){highlight.classList.add('guide-highlight');highlight.scrollIntoView({block:'center',behavior:reduced()?'instant':'smooth'});highlight.focus({preventScroll:true})}};
 $('eventAnchor').addEventListener('click',()=>{if(!$('eventPanel').hidden&&!tourMode){const step=eventStep();if(step)open([step])}});
 for(const [id,step] of [['edit',tour[4]],['feed',tour[1]],['observe',tour[6]]])$(id).addEventListener('click',()=>{if(id==='observe'){dismiss();return}if(panel.hidden&&api.ready()&&!api.read()['tip-'+id]){api.mark('tip-'+id);open([step])}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)dismiss(true)});
 window.addEventListener('aquarium-species',e=>{
  clearInterval(inlineTimer);inlineTimer=null;let host=$('speciesGuide');if(!host){host=document.createElement('div');host.id='speciesGuide';host.className='guide-inline';$('speciesFact').after(host)}
  $('speciesFact').hidden=true;const who=['fang','reefshark','arowana'].includes(e.detail.id)?'Aydon':'Ruria';
  host.replaceChildren();const face=document.createElement('div');face.className='guide-portrait '+who.toLowerCase();face.setAttribute('role','img');face.setAttribute('aria-label',who);const copy=document.createElement('div'),name=document.createElement('strong'),text=document.createElement('p');name.textContent=who;text.textContent='';copy.append(name,text);host.append(face,copy);
  const full=e.detail.fact;if(reduced()){text.textContent=full;return}face.classList.add('speaking');let n=0;inlineTimer=setInterval(()=>{if($('speciesCard').hidden){clearInterval(inlineTimer);inlineTimer=null;face.classList.remove('speaking');return}n+=3;text.textContent=full.slice(0,n);if(n>=full.length){clearInterval(inlineTimer);inlineTimer=null;face.classList.remove('speaking')}},25);
 });
 // Wait for account hydration before deciding whether this is a new player.
 setInterval(()=>{
  if(!api.ready()){dismiss();return}if(sessionKey!==api.key()){dismiss();sessionKey=api.key()}
  if(api.observing()){dismiss();return}if(!panel.hidden||document.querySelector('dialog[open]')||!$('shopPanel').hidden||!$('eventPanel').hidden)return;
  const flags=api.read();if(!flags.tourDone&&api.isNew()){open(tour,true);return}
  const season=api.season(),key='season-'+season+'-'+api.year();if(season&&!flags[key]){const step=eventStep();api.mark(key);open([step])}
 },1000);
})();
