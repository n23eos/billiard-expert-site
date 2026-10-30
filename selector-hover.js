'use strict';
function attachSelectorHover({range,buttons,container,select,isFinePointer,setTimer=setTimeout,clearTimer=clearTimeout}){
 let timer=null,pending=null;
 const listeners=[];
 function on(node,event,fn){node.addEventListener(event,fn);listeners.push(()=>node.removeEventListener(event,fn));}
 function cancel(){if(timer!==null)clearTimer(timer);timer=null;pending=null;}
 function available(event){return isFinePointer()&&event.pointerType==='mouse'&&!event.buttons&&!range.disabled;}
 function schedule(index,event){
  if(!available(event))return;
  if(index===pending)return;
  cancel();
  if(index===Number(range.value))return;
  pending=index;
  timer=setTimer(()=>{timer=null;pending=null;if(!range.disabled&&isFinePointer())select(index);},90);
 }
 function move(event){
  if(!available(event))return;
  const rect=range.getBoundingClientRect(),min=Number(range.min),max=Number(range.max);
  if(rect.width<=20)return;
  // Native range reserves half of its 20 px thumb at each end.
  const progress=Math.max(0,Math.min(1,(event.clientX-rect.left-10)/(rect.width-20)));
  schedule(Math.round(min+progress*(max-min)),event);
 }
 on(range,'pointerenter',move);on(range,'pointermove',move);
 buttons.forEach((button,index)=>on(button,'pointerenter',event=>{if(!button.disabled)schedule(index,event);}));
 on(container,'pointerleave',cancel);on(container,'pointerdown',cancel);on(container,'keydown',cancel);
 return ()=>{cancel();listeners.forEach(remove=>remove());};
}
if(typeof module!=='undefined'&&module.exports){module.exports={attachSelectorHover};}
else{
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 attachSelectorHover({range:document.querySelector('#table-range'),buttons:Array.from(document.querySelectorAll('.ticks button')),container:document.querySelector('.scene-slider'),select,isFinePointer:()=>finePointer.matches});
}
