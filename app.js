'use strict';

const $=s=>document.querySelector(s);
let current=0, revision=0, inquiryModel=null;
const projectModel=()=>inquiryModel||models[current];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const range=$('#table-range'), main=$('#table-image'), incoming=$('#next-image');
function annotate(model){
 $('#callouts').replaceChildren(); $('#leaders').replaceChildren();
 model.features.forEach((f,i)=>{
  const a=document.createElement('article');a.className='callout';a.style.left=f.label[0]+'%';a.style.top=f.label[1]+'%';
  const n=document.createElement('span');n.textContent='0'+(i+1);const h=document.createElement('h3');h.textContent=f.title;const p=document.createElement('p');p.textContent=f.text;a.append(n,h,p);$('#callouts').append(a);
  const ns='http://www.w3.org/2000/svg';const line=document.createElementNS(ns,'polyline');line.setAttribute('class','leader');const [x,y]=[f.point[0]*12,f.point[1]*8];const [ex,ey]=[f.end[0]*12,f.end[1]*8];line.setAttribute('points',`${x},${y} ${ex},${ey} ${ex+(f.label[0]<50?-70:70)},${ey}`);$('#leaders').append(line);
  const dot=document.createElementNS(ns,'circle');dot.setAttribute('class','dot');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',4);$('#leaders').append(dot);
  const marker=document.createElementNS(ns,'text');marker.setAttribute('class','mobile-marker');marker.setAttribute('x',x);marker.setAttribute('y',y);marker.textContent=i+1;$('#leaders').append(marker);
 });
}
function describe(index){const m=models[index];current=index;range.value=index;range.style.setProperty('--progress',index/(models.length-1)*100+'%');range.setAttribute('aria-valuetext',m.name);$('#number').textContent=`${String(index+1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;$('#model-name').textContent=m.name;$('#model-material').textContent=m.material;updateInquiry();$('#prev').disabled=index===0;$('#next').disabled=index===models.length-1;document.querySelectorAll('[data-index]').forEach(b=>{b.classList.toggle('selected',+b.dataset.index===index);b.setAttribute('aria-pressed',String(+b.dataset.index===index));});main.alt=m.alt;main.classList.toggle('catalog-photo',!!m.catalog);incoming.classList.toggle('catalog-photo',!!m.catalog);$('.scene-note').textContent=m.reference?'ВИЗУАЛИЗАЦИЯ ПО РЕФЕРЕНСУ · '+m.name.toUpperCase():'КОНЦЕПТУАЛЬНАЯ ВИЗУАЛИЗАЦИЯ';$('#catalog-source').hidden=!m.reference;$('#catalog-source').href=m.source||'#';annotate(m);}
async function select(index){
 document.dispatchEvent(new Event('concept-selection-start'));
 index=Math.max(0,Math.min(models.length-1,index));const token=++revision;const m=models[index];
 // The latest requested model wins, including when images finish loading out of order.
 range.value=index; const img=new Image();img.src=m.image || `assets/${m.id}.webp`;
 try{await img.decode();}catch{if(token===revision){range.value=current;range.setAttribute('aria-valuetext',models[current].name);}return;}
 if(token!==revision)return;
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
$('#discuss').addEventListener('click',()=>{$('#project-panel').hidden=false;$('#chosen').textContent=projectModel().name;$('#project-note').focus();});
describe(0);
const initial=models.findIndex(m=>m.id===new URLSearchParams(location.search).get('concept'));
if(initial>0)select(initial);
const inspiration=galleryModels.find(m=>m.id===new URLSearchParams(location.search).get('inspiration'));
if(inspiration){inquiryModel=inspiration;$('#project-panel').hidden=false;updateInquiry();}
function updateInquiry(){
 const m=projectModel();$('#selection').textContent=`Вам близок вариант «${m.name}»?`;$('#chosen').textContent=m.name;
 const preview=$('#inspiration-preview');preview.hidden=!inquiryModel;if(inquiryModel){preview.src=m.image;preview.alt=m.alt;}updateEmail();
}
function projectText(){return `Здравствуйте! Хочу обсудить индивидуальный бильярдный стол.\nНаправление: ${projectModel().name}.\n${$('#project-note').value.trim()}\nИсточник: сайт индивидуального дизайна Бильярд Эксперт.`;}
function updateEmail(){const email=$('#project-email');if(email)email.href='mailto:info@biliard-expert.ru?subject='+encodeURIComponent('Индивидуальный бильярдный стол')+'&body='+encodeURIComponent(projectText());}
$('#project-note').addEventListener('input',updateEmail);
$('#copy-project').addEventListener('click',async()=>{
 const text=projectText();
 try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Описание скопировано. Отправьте его менеджеру в Telegram.';}
 catch{const field=$('#copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();$('#copy-status').textContent='Автоматическое копирование недоступно. Текст выделен: скопируйте его вручную.';}
 updateEmail();
});
