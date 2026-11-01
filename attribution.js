'use strict';
(function(root){
 const UTM_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
 const STORE='billiard-lead-attribution-v1';
 function safePage(value){
  try{const url=new URL(value);return /^https?:$/.test(url.protocol)?(url.origin+url.pathname).slice(0,500):'';}catch{return '';}
 }
 function touch(href,referrer,now){
  const url=new URL(href),utm={};
  for(const key of UTM_KEYS){const value=url.searchParams.get(key);if(value)utm[key]=value.slice(0,200);}
  return {landingPage:safePage(href),referrer:safePage(referrer),utm,capturedAt:now};
 }
 function validTouch(value){
  return value&&typeof value.landingPage==='string'&&typeof value.referrer==='string'&&typeof value.capturedAt==='string'&&value.utm&&typeof value.utm==='object';
 }
 function cleanTouch(value){
  const utm={};for(const key of UTM_KEYS)if(typeof value.utm[key]==='string')utm[key]=value.utm[key].slice(0,200);
  return {landingPage:safePage(value.landingPage),referrer:safePage(value.referrer),utm,capturedAt:value.capturedAt.slice(0,40)};
 }
 function capture(href,referrer,storage,now=new Date().toISOString()){
  const current=touch(href,referrer,now);let previous;
  try{previous=JSON.parse(storage?.getItem(STORE)||'null');}catch{}
  const valid=validTouch(previous?.firstTouch)&&validTouch(previous?.latestTouch);
  const external=current.referrer&&new URL(current.referrer).origin!==new URL(href).origin;
  const campaign=Object.keys(current.utm).length>0;
  const result={firstTouch:valid?cleanTouch(previous.firstTouch):current,latestTouch:valid&&!external&&!campaign?cleanTouch(previous.latestTouch):current};
  try{storage?.setItem(STORE,JSON.stringify(result));}catch{}
  return result;
 }
 const api={capture,safePage};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root.document){
  let storage;try{storage=root.sessionStorage;}catch{}
  const context=capture(root.location.href,root.document.referrer,storage);
  root.LeadAttribution={...api,snapshot:()=>JSON.parse(JSON.stringify(context))};
 }
})(typeof window!=='undefined'?window:globalThis);
