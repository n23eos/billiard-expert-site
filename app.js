'use strict';

const $=s=>document.querySelector(s);
let current=0, revision=0, inquiryModel=null;
const projectModel=()=>inquiryModel||models[current];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const range=$('#table-range'), main=$('#table-image'), incoming=$('#next-image');
let redrawDetails=()=>{};
function detailLeaderSegment(label,point){
 // Attach to the nearest real edge of the caption, rather than a fixed percentage.
 return [[Math.max(label.left,Math.min(label.right,point.x)),Math.max(label.top,Math.min(label.bottom,point.y))],[point.x,point.y]];
}
function annotate(model){
 const callouts=$('#callouts'),leaders=$('#leaders'),points=$('#detail-points'),tabs=$('#detail-tabs');
 [callouts,leaders,points,tabs].forEach(node=>node.replaceChildren());
 const articles=[],lines=[],buttons=[],tabButtons=[];
 // Keep the upper captions in the same left-to-right order as their detail points.
 const upper=model.features.slice(0,2).map((feature,index)=>({feature,index})).sort((a,b)=>a.feature.point[0]-b.feature.point[0]);
 const slots=new Map(upper.map((entry,slot)=>[entry.index,model.features[slot].label]));
 function activate(index){
  [...buttons,...tabButtons].forEach((node,i)=>node.setAttribute('aria-pressed',String(i%model.features.length===index)));
  const feature=model.features[index];$('#detail-title').textContent=feature.title;
  const crop=$('#detail-crop');crop.style.backgroundImage=`url("${model.image||`assets/${model.id}.webp`}")`;
  crop.style.backgroundPosition=feature.point.map(point=>Math.max(0,Math.min(100,(point*2.5-50)/1.5))+'%').join(' ');
  crop.setAttribute('aria-label',`Фрагмент визуализации: ${feature.title}`);
 }
 model.features.forEach((feature,index)=>{
  const article=document.createElement('article');article.className='callout';const label=slots.get(index)||feature.label;article.style.left=label[0]+'%';article.style.top=label[1]+'%';article.id='feature-'+index;
  const number=document.createElement('span');number.textContent='0'+(index+1);const title=document.createElement('h3');title.textContent=feature.title;const text=document.createElement('p');text.textContent=feature.text;article.append(number,title,text);callouts.append(article);articles.push(article);
  const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('class','leader');leaders.append(line);lines.push(line);
  function makeButton(className){const button=document.createElement('button');button.type='button';button.className=className;button.textContent=String(index+1).padStart(2,'0');button.setAttribute('aria-label',feature.title);button.setAttribute('aria-controls',article.id);button.addEventListener('click',()=>activate(index));button.addEventListener('focus',()=>activate(index));return button;}
  const point=makeButton('detail-point');point.style.left=feature.point[0]+'%';point.style.top=feature.point[1]+'%';points.append(point);buttons.push(point);
  const tab=makeButton('detail-tab');tabs.append(tab);tabButtons.push(tab);
 });
 redrawDetails=()=>{
  const frame=leaders.getBoundingClientRect();
  if(!frame.width||!frame.height)return;
  leaders.setAttribute('viewBox',`0 0 ${frame.width} ${frame.height}`);
  articles.forEach((article,index)=>{
   const textRange=document.createRange();
   textRange.selectNodeContents(article.querySelector(index<2?'p':'h3'));
   const textLines=Array.from(textRange.getClientRects()).filter(rect=>rect.width&&rect.height);
   const rect=textLines[index<2?textLines.length-1:0]||article.getBoundingClientRect();
   const dot=buttons[index].getBoundingClientRect();
   const label={left:rect.left-frame.left,right:rect.right-frame.left,top:rect.top-frame.top,bottom:rect.bottom-frame.top};
   const point={x:(dot.left+dot.right)/2-frame.left,y:(dot.top+dot.bottom)/2-frame.top};
   lines[index].setAttribute('points',detailLeaderSegment(label,point).map(pair=>pair.join(',')).join(' '));
  });
 };
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>redrawDetails());
 activate(0);
}

function describe(index){const m=models[index];current=index;range.value=index;range.style.setProperty('--progress',index/(models.length-1)*100+'%');range.setAttribute('aria-valuetext',m.name);$('#number').textContent=`${String(index+1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;$('#model-name').textContent=m.name;$('#model-material').textContent=m.material;updateInquiry();$('#prev').disabled=index===0;$('#next').disabled=index===models.length-1;document.querySelectorAll('[data-index]').forEach(b=>{b.classList.toggle('selected',+b.dataset.index===index);b.setAttribute('aria-pressed',String(+b.dataset.index===index));});main.alt=m.alt;main.classList.toggle('catalog-photo',!!m.catalog);incoming.classList.toggle('catalog-photo',!!m.catalog);$('.scene-note').textContent=m.reference?'ВИЗУАЛИЗАЦИЯ ПО РЕФЕРЕНСУ · '+m.name.toUpperCase():'КОНЦЕПТУАЛЬНАЯ ВИЗУАЛИЗАЦИЯ';$('#catalog-source').hidden=!m.reference;$('#catalog-source').href=m.source||'#';annotate(m);}
async function select(index){
 document.dispatchEvent(new Event('concept-selection-start'));
 index=Math.max(0,Math.min(models.length-1,index));const token=++revision;const m=models[index];
 // The latest requested model wins, including when images finish loading out of order.
 range.value=index; const img=new Image();img.src=m.image || `assets/${m.id}.webp`;
 try{await img.decode();}catch{if(token===revision){range.value=current;range.setAttribute('aria-valuetext',models[current].name);}return;}
 if(token!==revision)return;
 if($('#project-note').readOnly){range.value=current;return;}
 inquiryModel=null;
 incoming.style.transition='none';incoming.style.opacity=0;incoming.src=img.src;
 describe(index);
 if(reduced.matches){main.src=img.src;return;}
 incoming.getBoundingClientRect();incoming.style.transition='opacity .48s ease';incoming.style.opacity=1;
 setTimeout(()=>{if(token!==revision)return;main.src=img.src;incoming.style.transition='none';incoming.style.opacity=0;},500);
}
range.addEventListener('input',()=>select(+range.value));$('#prev').addEventListener('click',()=>select(+range.value-1));$('#next').addEventListener('click',()=>select(+range.value+1));range.max=models.length-1;
$('.ticks').replaceChildren(...models.map((m,i)=>{const b=document.createElement('button');b.dataset.index=i;b.textContent=m.shortLabel;return b;}));
document.querySelectorAll('[data-index]').forEach(b=>b.addEventListener('click',()=>select(+b.dataset.index)));
$('#discuss').addEventListener('click',()=>{$('#project-panel').hidden=false;$('#chosen').textContent=projectModel().name;});
describe(0);
const initial=models.findIndex(m=>m.id===new URLSearchParams(location.search).get('concept'));
if(initial>0)select(initial);
const inspiration=galleryModels.find(m=>m.id===new URLSearchParams(location.search).get('inspiration'));
if(inspiration){inquiryModel=inspiration;$('#project-panel').hidden=false;updateInquiry();}
function updateInquiry(){
 const m=projectModel();$('#selection').textContent=`Вам близок вариант «${m.name}»?`;$('#chosen').textContent=m.name;
 const config=$('#chosen-configuration');if(config){config.textContent=m.configuration||'';config.hidden=!m.configuration;}
 const preview=$('#inspiration-preview');preview.hidden=!inquiryModel||!!m.configuration;if(inquiryModel&&!m.configuration){preview.src=m.image;preview.alt=m.alt;}updateEmail();
}
function projectDescription(){return [projectModel().configuration,$('#project-note').value.trim()].filter(Boolean).join('\n');}
function projectText(){return `Здравствуйте! Хочу обсудить индивидуальный бильярдный стол.\nНаправление: ${projectModel().name}.\n${projectDescription()}\nИсточник: Бильярд Эксперт / индивидуальный дизайн (billiard-expert-premium).\nСтраница: ${window.LeadAttribution?.safePage(location.href)||location.origin+location.pathname}`;}
function updateEmail(){const email=$('#project-email');if(email)email.href='mailto:info@biliard-expert.ru?subject='+encodeURIComponent('Индивидуальный бильярдный стол')+'&body='+encodeURIComponent(projectText());}
$('#project-note').addEventListener('input',updateEmail);
$('#copy-project').addEventListener('click',async()=>{
 const text=projectText();
 try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Описание скопировано. Отправьте его менеджеру в Telegram.';}
 catch{const field=$('#copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();$('#copy-status').textContent='Автоматическое копирование недоступно. Текст выделен: скопируйте его вручную.';}
 updateEmail();
});

// Recompute after wrapping, font loading, viewport changes and model replacement.
window.addEventListener('resize',()=>redrawDetails());
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>redrawDetails()).observe($('#scene'));
if(document.fonts)document.fonts.ready.then(()=>redrawDetails());

// Restore a configuration chosen on the separate page after the inquiry UI is ready.
window.addEventListener('DOMContentLoaded',()=>{
 const params=new URLSearchParams(location.search);
 const modelId=params.get('configurationModel'),summary=params.get('configuration');
 if(!modelId||!summary||summary.length>500)return;
 if(!models.some(model=>model.id===modelId))return;
 document.dispatchEvent(new CustomEvent('configuration-apply',{detail:{modelId,summary}}));
 params.delete('configurationModel');params.delete('configuration');
 history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash);
});

// Applying a material combination selects its base concept and keeps the visitor's note.
document.addEventListener('configuration-apply',event=>{
 if($('#project-note').readOnly||typeof event.detail?.summary!=='string')return;
 const index=models.findIndex(item=>item.id===event.detail.modelId);if(index<0)return;
 document.dispatchEvent(new Event('concept-selection-start'));
 ++revision;incoming.style.opacity=0;main.src=models[index].image||`assets/${models[index].id}.webp`;
 describe(index);
 inquiryModel={...models[index],configuration:event.detail.summary};updateInquiry();
 $('#project-panel').hidden=false;
 $('#idea').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 document.dispatchEvent(new CustomEvent('inquiry-open',{detail:{mode:'project',entryPoint:'configurator'}}));
});
