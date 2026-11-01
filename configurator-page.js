'use strict';
(function(){
 let selection=null;
 const palettes={natural:{wood:'walnut',cloth:'olive',metal:'bronze'},graphic:{wood:'dark',cloth:'gray',metal:'steel'},warm:{wood:'cherry',cloth:'sand',metal:'bronze'}};
 const $=selector=>document.querySelector(selector);
 const params=new URLSearchParams(location.search);
 function showTab(group){
  document.querySelectorAll('[data-tab]').forEach(button=>{
   const active=button.dataset.tab===group;
   button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
   $('#panel-'+button.dataset.tab).hidden=!active;
  });
 }
 document.querySelectorAll('[data-tab]').forEach(button=>{
  button.addEventListener('click',()=>showTab(button.dataset.tab));
  button.addEventListener('keydown',event=>{
   const groups=['wood','cloth','metal'],index=groups.indexOf(button.dataset.tab);
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3;
   showTab(groups[next]);$('#tab-'+groups[next]).focus();
  });
 });
 function compareOff(){ $('.config-preview').classList.remove('show-original');$('#config-compare').setAttribute('aria-pressed','false'); }
 document.addEventListener('configuration-change',event=>{
  selection=event.detail;compareOff();
  $('#config-selection').textContent=selection.name+' · '+selection.summary;
  $('#config-preset').value=Object.keys(palettes).find(id=>Object.keys(palettes[id]).every(group=>palettes[id][group]===selection.state[group]))||'';$('#config-share-status').textContent='';$('#config-share-url').hidden=true;
  const query=new URLSearchParams({model:selection.modelId,...selection.state});
  // Keep attribution parameters while the visitor edits their shareable selection.
  for(const [key,value] of params)if(key.startsWith('utm_'))query.set(key,value);
  history.replaceState(null,'',location.pathname+'?'+query.toString());
 });
 $('#config-preset').addEventListener('change',event=>{
  const state=palettes[event.target.value];if(!state)return;
  document.dispatchEvent(new CustomEvent('configuration-set',{detail:{modelId:selection?.modelId||'walnut',state}}));
 });
 $('#config-compare').addEventListener('click',()=>{
  const original=$('.config-preview').classList.toggle('show-original');$('#config-compare').setAttribute('aria-pressed',String(original));
 });
 $('#config-share').addEventListener('click',async()=>{
  // A shared link contains design choices only, with no advertising identifiers.
  const link=new URL(location.pathname,location.origin);
  link.search=new URLSearchParams({model:selection.modelId,...selection.state}).toString();
  try{await navigator.clipboard.writeText(link.href);$('#config-share-status').textContent='Ссылка скопирована';}
  catch{$('#config-share-url').hidden=false;$('#config-share-url').value=link.href;$('#config-share-url').select();$('#config-share-status').textContent='Скопируйте ссылку из поля';}
 });
 document.addEventListener('configuration-apply',event=>{
  const query=new URLSearchParams({configurationModel:event.detail.modelId,configuration:event.detail.summary});
  location.href='index.html?'+query.toString()+'#idea';
 });
 document.dispatchEvent(new CustomEvent('configuration-set',{detail:{modelId:params.get('model')||'walnut',state:Object.fromEntries(['wood','cloth','metal'].map(group=>[group,params.get(group)]))}}));
})();
