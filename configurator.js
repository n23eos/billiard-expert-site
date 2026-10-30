'use strict';

// Tone previews keep the original grain and lighting; they do not simulate wood species.
(function (root) {
 const options = {
  wood: [
   {id:'walnut', label:'Орех', color:'#896044', note:'Тёплый коричневый тон с выразительным рисунком дерева.', matrix:null},
   {id:'light', label:'Светлый тон', color:'#c8ae83', note:'Светлая отделка подчёркивает рисунок и облегчает силуэт.', matrix:[1.05,.20,.88,.16,.67,.10]},
   {id:'dark', label:'Тёмный тон', color:'#342923', note:'Глубокая тонировка для более сдержанного, графичного образа.', matrix:[.46,.015,.38,.012,.32,.01]}
  ],
  cloth: [
   {id:'olive', label:'Оливковое', color:'#7b7d53', note:'Приглушённый природный оттенок игрового поля.', matrix:null},
   {id:'green', label:'Зелёное', color:'#235d44', note:'Насыщенный зелёный оттенок игрового поля.', matrix:[.16,.015,.65,.025,.37,.02]},
   {id:'wine', label:'Бордовое', color:'#743342', note:'Тёплый винный оттенок как акцент в интерьере.', matrix:[.70,.025,.18,.012,.29,.02]},
   {id:'blue', label:'Синее', color:'#326281', note:'Глубокий синий оттенок для прохладной палитры.', matrix:[.15,.02,.43,.035,.72,.045]}
  ],
  metal: [
   {id:'bronze', label:'Бронза', color:'#b5996e', note:'Тёплый оттенок металлических деталей.', matrix:null},
   {id:'steel', label:'Сталь', color:'#b6bdc1', note:'Холодный серебристый оттенок металлических деталей.', matrix:[.95,.035,1,.04,1.08,.045]},
   {id:'black', label:'Чёрный', color:'#363839', note:'Тёмные детали с мягкими металлическими бликами.', matrix:[.32,.008,.34,.01,.36,.012]}
  ]
 };
 const defaults = {wood:'walnut', cloth:'olive', metal:'bronze'};
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
 function mount(document) {
  const container=document.querySelector('#configurator');
  if(!container)return;
  let state={...defaults};
  const controls=container.querySelector('.config-controls');
  const output=container.querySelector('#config-summary');
  function render() {
   const items=selected(state);
   for(const group of Object.keys(options)) {
    container.querySelector(`#config-${group}-matrix`).setAttribute('values',matrixValues(items[group].matrix));
    container.querySelector(`#config-${group}-name`).textContent=items[group].label;
    container.querySelector(`#config-${group}-note`).textContent=items[group].note;
   }
   controls.querySelectorAll('[data-config-group]').forEach(button=>button.setAttribute('aria-pressed',String(state[button.dataset.configGroup]===button.dataset.configValue)));
   const text=summary(state);
   output.textContent=text;
   container.querySelector('#config-image-description').textContent=`Концептуальная визуализация стола. ${text}. Цвета показаны приблизительно.`;
   container.querySelector('#config-reset').disabled=Object.keys(defaults).every(group=>state[group]===defaults[group]);
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
    button.addEventListener('click',()=>{state[group]=item.id;render();});
    list.append(button);
   }
  }
  container.querySelector('#config-reset').addEventListener('click',()=>{state={...defaults};render();});
  container.querySelector('#config-apply').addEventListener('click',()=>{
   document.dispatchEvent(new CustomEvent('configuration-apply',{detail:{summary:summary(state)}}));
  });
  render();controls.hidden=false;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={options,defaults,selected,summary,matrixValues,mount};
 if(root.document)mount(root.document);
})(typeof window!=='undefined'?window:globalThis);
