'use strict';
const allConcepts=[...galleryModels,...models];
const params=new URLSearchParams(location.search);
const id=params.get('id');
const model=allConcepts.find(m=>m.id===id);
const root=document.querySelector('.concept-detail');
const back=document.querySelector('#back-to-gallery');
const filter=['all','modern','classic'].includes(params.get('filter'))?params.get('filter'):'all';
back.href=`concepts.html?filter=${encodeURIComponent(filter)}`;
function renderUnknown(){
 document.title='Концепт не найден · Бильярд Эксперт';
 root.innerHTML='<div class="concept-detail-copy"><span class="eyebrow">БИБЛИОТЕКА ИДЕЙ</span><h1>Концепт<br><em>не найден.</em></h1><p>Вернитесь в библиотеку и выберите другое направление для обсуждения.</p><a class="text-link" href="'+back.href+'">Вернуться ко всем концептам ↗</a></div>';
}
function render(){
 document.title=`${model.name} · Концепт стола · Бильярд Эксперт`;
 const image=model.image||`assets/${model.id}.webp`;
 const features=Array.isArray(model.features)&&model.features.length?`<div class="concept-features"><span class="eyebrow">ОСОБЕННОСТИ НАПРАВЛЕНИЯ</span>${model.features.map((feature,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><h3>${feature.title}</h3><p>${feature.text}</p></article>`).join('')}</div>`:'';
 root.innerHTML=`<div class="concept-detail-grid"><div class="concept-detail-image-wrap"><img class="concept-detail-image" src="${image}" alt="${model.alt}" width="1536" height="1024"><p class="concept-image-error" hidden>Изображение временно недоступно. Вы всё равно можете обсудить это направление.</p><small>Концептуальная визуализация для обсуждения проекта</small></div><div class="concept-detail-copy"><span class="eyebrow">${model.galleryOnly?'КОНЦЕПТ ДЛЯ ВДОХНОВЕНИЯ':'НАПРАВЛЕНИЕ ДИЗАЙНА'}</span><h1>${model.name}</h1><p class="concept-material">${model.material}</p><p>Силуэт, материалы и детали можно адаптировать под интерьер, размеры помещения и требования к игре. Итоговое решение формируется после консультации и технического проектирования.</p><a class="cta" href="index.html?${model.galleryOnly?'inspiration':'concept'}=${encodeURIComponent(model.id)}#idea">Обсудить этот концепт <span>↗</span></a></div></div>${features}`;
 const contactCta=document.querySelector('.contact-strip .text-link');
 if(contactCta) contactCta.href=`index.html?${model.galleryOnly?'inspiration':'concept'}=${encodeURIComponent(model.id)}#idea`;
 const imageElement=root.querySelector('.concept-detail-image');
 const imageError=root.querySelector('.concept-image-error');
 imageElement.addEventListener('error',()=>{imageElement.hidden=true;imageError.hidden=false},{once:true});
}
if(model)render();else renderUnknown();
