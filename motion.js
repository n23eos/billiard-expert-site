'use strict';
(()=>{
 const video=document.querySelector('#cinema'),source=video.querySelector('source'),button=document.querySelector('#cinema-toggle'),scene=document.querySelector('#scene'),status=document.querySelector('#cinema-status'),range=document.querySelector('#table-range');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const films={walnut:'assets/walnut-film.mp4',stone:'assets/stone-film.mp4',noir:'assets/noir-film.mp4'};
 let intent=0;
 function stop(){intent++;video.pause();video.currentTime=0;video.hidden=true;scene.classList.remove('cinema-playing');button.textContent='Смотреть в движении ↗';button.setAttribute('aria-pressed','false');}
 function sync(){stop();const model=models[Number(range.value)];const film=model&&films[model.id];button.hidden=!film||preference.matches;if(film&&source.getAttribute('src')!==film){source.src=film;video.poster=model.image||`assets/${model.id}.webp`;video.load();}}
 button.addEventListener('click',async()=>{
  if(!video.paused){stop();return;}
  const token=++intent;
  const model=models[Number(range.value)],film=model&&films[model.id];
  if(!film){stop();return;}
  video.hidden=false;video.currentTime=0;scene.classList.add('cinema-playing');button.textContent='Остановить просмотр';button.setAttribute('aria-pressed','true');status.textContent='';
  try{await video.play();if(token!==intent)video.pause();}catch{if(token===intent){stop();status.textContent='Видео недоступно. Статичный вид стола сохранён.';}}
 });
 video.addEventListener('ended',stop);video.addEventListener('error',stop);
 range.addEventListener('input',stop);
 document.addEventListener('concept-selection-start',stop);
 new MutationObserver(sync).observe(document.querySelector('#model-name'),{childList:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();},{threshold:.15}).observe(scene);
 preference.addEventListener('change',sync);sync();
})();
