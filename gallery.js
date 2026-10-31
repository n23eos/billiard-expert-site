'use strict';
const allConcepts=[...galleryModels,...models];
const categoryFor=model=>model.category;
function renderGallery(filter){
 const visible=allConcepts.filter(m=>filter==='all'||categoryFor(m)===filter);
 const cards=visible.map(m=>{
  const article=document.createElement('article');article.className='concept-card';
  const a=document.createElement('a');a.href=`concept.html?id=${encodeURIComponent(m.id)}&filter=${encodeURIComponent(filter)}`;
  a.addEventListener('click',()=>{try{sessionStorage.setItem('gallery-scroll',JSON.stringify({filter,y:window.scrollY}))}catch{}});
  const img=document.createElement('img');img.src=m.image||`assets/${m.id}.webp`;img.alt=m.alt;img.loading='lazy';img.width=1536;img.height=1024;
  const kind=document.createElement('span');kind.className='eyebrow';kind.textContent=m.reference?'ВИЗУАЛИЗАЦИЯ ПО РЕФЕРЕНСУ':'КОНЦЕПТ';
  const h=document.createElement('h2');h.textContent=m.name;const p=document.createElement('p');p.textContent=m.material;
  const link=document.createElement('span');link.className='card-link';link.textContent='Рассмотреть концепт ↗︎';a.append(img,kind,h,p,link);article.append(a);return article;
 });
 document.querySelector('#gallery').replaceChildren(...cards);document.querySelector('#gallery-count').textContent=`Показано ${visible.length} из ${allConcepts.length}`;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
}
const requestedFilter=new URLSearchParams(location.search).get('filter');
const initialFilter=['all','modern','classic'].includes(requestedFilter)?requestedFilter:'all';
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{try{sessionStorage.removeItem('gallery-scroll')}catch{};const url=new URL(location.href);url.searchParams.set('filter',b.dataset.filter);history.replaceState(null,'',url);renderGallery(b.dataset.filter)}));
renderGallery(initialFilter);
try{
 const saved=JSON.parse(sessionStorage.getItem('gallery-scroll')||'null');
 if(saved&&['all','modern','classic'].includes(saved.filter)&&Number.isFinite(saved.y)){
  sessionStorage.removeItem('gallery-scroll');
  if(saved.filter===initialFilter) requestAnimationFrame(()=>window.scrollTo(0,saved.y));
 }
}catch{try{sessionStorage.removeItem('gallery-scroll')}catch{}}
