'use strict';

// Tone previews keep the original grain and lighting; they do not simulate wood species.
(function (root) {
 const options = {
  wood: [
   {id:'walnut', label:'Орех', color:'#896044', note:'Тёплый коричневый тон с выразительным рисунком дерева.', matrix:null},
   {id:'light', label:'Светлый тон', color:'#c8ae83', note:'Светлая отделка подчёркивает рисунок и облегчает силуэт.', matrix:[1.05,.20,.88,.16,.67,.10]},
   {id:'dark', label:'Тёмный тон', color:'#342923', note:'Глубокая тонировка для более сдержанного, графичного образа.', matrix:[.46,.015,.38,.012,.32,.01]},
   {id:'cherry', label:'Вишнёвый тон', color:'#682f2a', note:'Красновато-коричневая тонировка дерева.', matrix:[.85,.04,.27,.015,.20,.01]}
  ],
  cloth: [
   {id:'olive', label:'Оливковое', color:'#7b7d53', note:'Приглушённый природный оттенок игрового поля.', matrix:null},
   {id:'green', label:'Зелёное', color:'#235d44', note:'Насыщенный зелёный оттенок игрового поля.', matrix:[.16,.015,.65,.025,.37,.02]},
   {id:'wine', label:'Бордовое', color:'#743342', note:'Тёплый винный оттенок как акцент в интерьере.', matrix:[.70,.025,.18,.012,.29,.02]},
   {id:'blue', label:'Синее', color:'#326281', note:'Глубокий синий оттенок для прохладной палитры.', matrix:[.15,.02,.43,.035,.72,.045]},
   {id:'gray', label:'Серое', color:'#81827e', note:'Нейтральный серый оттенок игрового поля.', matrix:[.72,.06,.73,.06,.70,.06]},
   {id:'sand', label:'Песочное', color:'#b7a079', note:'Мягкий песочный оттенок игрового поля.', matrix:[1,.14,.83,.11,.58,.08]}
  ],
  metal: [
   {id:'bronze', label:'Бронза', color:'#b5996e', note:'Тёплый оттенок металлических деталей.', matrix:null},
   {id:'steel', label:'Сталь', color:'#b6bdc1', note:'Холодный серебристый оттенок металлических деталей.', matrix:[.95,.035,1,.04,1.08,.045]},
   {id:'black', label:'Чёрный', color:'#363839', note:'Тёмные детали с мягкими металлическими бликами.', matrix:[.32,.008,.34,.01,.36,.012]}
  ]
 };
 const configurations = typeof module!=='undefined'&&module.exports ? require('./configurator-models.js') : root.BilliardConfiguratorModels;
 const defaults = configurations[0].defaults;
 const cleanState=(state,model)=>Object.fromEntries(Object.entries(options).map(([group,items])=>[group,items.some(item=>item.id===state?.[group])?state[group]:model.defaults[group]]));
 function selected(state) {
  return Object.fromEntries(Object.entries(options).map(([group,items])=>[group,items.find(item=>item.id===state[group])||items[0]]));
 }
 function summary(state) {
  const items=selected(state);
  return `Дерево: ${items.wood.label.toLowerCase()} · Сукно: ${items.cloth.label.toLowerCase()} · Металл: ${items.metal.label.toLowerCase()}`;
 }
 function matrixValues(tone) {
  if(!tone)return '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0';
  const [r,ro,g,go,b,bo]=tone;
  return [r*.2126,r*.7152,r*.0722,0,ro,g*.2126,g*.7152,g*.0722,0,go,b*.2126,b*.7152,b*.0722,0,bo,0,0,0,1,0].join(' ');
 }
 function matrixFor(model,group,item) {
  if(model.defaults[group]===item.id)return matrixValues(null);
  return matrixValues(model.tones?.[group]?.[item.id]||item.matrix);
 }
 function decodeImage(src) {
  const image=new Image();image.src=src;return image.decode();
 }
 function mount(document,{loadImage=decodeImage}={}) {
  const container=document.querySelector('#configurator');
  if(!container)return;
  let model=configurations[0],request=0,loading=false;
  const states=Object.fromEntries(configurations.map(item=>[item.id,{...item.defaults}]));
  const controls=container.querySelector('.config-controls');
  const output=container.querySelector('#config-summary');
  const status=container.querySelector('#config-model-status');
  const modelButtons=[];
  function render() {
   const state=states[model.id],items=selected(state);
   const locked=!!document.querySelector('#project-note')?.readOnly;
   for(const group of Object.keys(options)) {
    container.querySelector(`#config-${group}-matrix`).setAttribute('values',matrixFor(model,group,items[group]));
    container.querySelector(`#config-${group}-path`).setAttribute('d',model.paths[group]);
    container.querySelector(`#config-${group}-name`).textContent=items[group].label;
    container.querySelector(`#config-${group}-note`).textContent=items[group].note;
   }
   container.querySelector('#config-wood-exclusions').setAttribute('d',model.exclude||'');
   container.querySelectorAll('.config-image image').forEach(image=>image.setAttribute('href',model.image));
   container.querySelector('#config-image-label').textContent=model.name.toUpperCase()+' / ПОДБОР ОТТЕНКОВ';
   container.querySelector('.config-preview').setAttribute('aria-busy',String(loading));
   modelButtons.forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.modelId===model.id));button.disabled=locked;});
   controls.querySelectorAll('[data-config-group]').forEach(button=>{
    button.setAttribute('aria-pressed',String(state[button.dataset.configGroup]===button.dataset.configValue));button.disabled=locked;
   });
   const text=summary(state);
   if(typeof CustomEvent!=='undefined')document.dispatchEvent(new CustomEvent('configuration-change',{detail:{modelId:model.id,state:{...state},name:model.name,summary:text}}));
   output.textContent=model.name+'. '+text;
   container.querySelector('#config-image-description').textContent=`Концептуальная визуализация «${model.name}». ${text}. Цвета показаны приблизительно.`;
   container.querySelector('#config-reset').disabled=locked||loading||Object.keys(defaults).every(group=>state[group]===model.defaults[group]);
   container.querySelector('#config-apply').disabled=locked||loading;
  }
  async function chooseModel(id) {
   if(document.querySelector('#project-note')?.readOnly)return;
   const next=configurations.find(item=>item.id===id);if(!next)return;
   const token=++request;
   if(next.id===model.id){loading=false;status.textContent='';render();return;}
   loading=true;status.textContent=`Загружаем модель «${next.name}»…`;render();
   try{await loadImage(next.image);}catch{
    if(token!==request)return;
    loading=false;status.textContent='Не удалось загрузить модель. Предыдущий стол сохранён. Попробуйте ещё раз.';render();return;
   }
   if(token!==request)return;
   model=next;loading=false;status.textContent='';render();
  }
  for(const item of configurations) {
   const button=document.createElement('button');button.type='button';button.className='config-model';button.dataset.modelId=item.id;
   const thumb=document.createElement('img');thumb.src=item.image;thumb.alt='';thumb.width=192;thumb.height=128;thumb.loading='lazy';
   const label=document.createElement('span');label.textContent=item.name;button.append(thumb,label);
   button.addEventListener('click',()=>chooseModel(item.id));
   container.querySelector('#config-model-options').append(button);modelButtons.push(button);
  }
  for(const [group,items] of Object.entries(options)) {
   const list=container.querySelector(`#config-${group}-options`);
   for(const item of items) {
    const button=document.createElement('button');
    button.type='button';button.className='config-swatch';
    button.dataset.configGroup=group;button.dataset.configValue=item.id;
    button.style.setProperty('--swatch',item.color);
    const chip=document.createElement('span');chip.className='config-chip';chip.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=item.label;
    button.append(chip,label);
    button.addEventListener('click',()=>{if(document.querySelector('#project-note')?.readOnly)return;states[model.id][group]=item.id;render();});
    list.append(button);
   }
  }
  container.querySelector('#config-reset').addEventListener('click',()=>{
   if(loading||document.querySelector('#project-note')?.readOnly)return;
   states[model.id]={...model.defaults};render();
  });
  container.querySelector('#config-apply').addEventListener('click',()=>{
   if(loading||document.querySelector('#project-note')?.readOnly)return;
   document.dispatchEvent(new CustomEvent('configuration-apply',{detail:{modelId:model.id,summary:summary(states[model.id])}}));
  });
  document.addEventListener('configuration-set',async event=>{
   if(document.querySelector('#project-note')?.readOnly)return;
   const next=configurations.find(item=>item.id===event.detail?.modelId)||model;
   states[next.id]=cleanState(event.detail?.state,next);
   await chooseModel(next.id);
  });
  document.addEventListener('inquiry-state-change',render);
  render();controls.hidden=false;container.querySelector('#config-model-picker').hidden=false;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={options,defaults,configurations,selected,summary,matrixValues,matrixFor,mount,cleanState};
 if(root.document)mount(root.document);
})(typeof window!=='undefined'?window:globalThis);
