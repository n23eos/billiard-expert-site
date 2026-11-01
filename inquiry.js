'use strict';
(()=>{
 const apiBase=location.hostname==='n23eos.github.io'?'https://billiard.raincoat.cc/':'';
 const $=selector=>document.querySelector(selector);
 const form=$('#inquiry-form'),input=$('#lead-files'),list=$('#file-list'),status=$('#inquiry-status'),submit=form.querySelector('[type=submit]');
 const note=$('#project-note'),contactInput=$('#lead-contact'),consent=$('#lead-consent');
 const modeButtons=[$('#discuss'),$('#describe-project')];
 let files=[],enabled=false,busy=false,completed=false,mode='callback',entryPoint='inquiry',key=crypto.randomUUID(),pending=null;
 const allowed=new Set(['image/jpeg','image/png','image/webp','application/pdf']);
 const message=text=>{status.textContent=text;};
 const invalidate=()=>{if(!busy&&!completed){key=crypto.randomUUID();pending=null;}};
 const fieldError=(field,id,text)=>{field.setAttribute('aria-invalid',String(!!text));$(id).textContent=text;$(id).hidden=!text;};
 function setMode(next,entry,focus=false){
  if(busy||completed)return;
  if(next!==mode)invalidate();mode=next;entryPoint=entry;
  const callback=mode==='callback';
  modeButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===(callback?0:1))));
  $('#project-panel').hidden=false;$('#project-note-group').hidden=callback;
  $('#project-fields').hidden=callback;$('#callback-fields').hidden=!callback;
  contactInput.type=callback?'tel':'text';contactInput.inputMode=callback?'tel':'text';contactInput.autocomplete=callback?'tel':'email';
  contactInput.placeholder=callback?'+7 999 123-45-67':'+7 или ваш email';
  $('#lead-contact-label').textContent=callback?'Телефон *':'Телефон или email *';
  $('#inquiry-title').textContent=callback?'Начнём с короткого разговора':'Расскажите о вашем проекте';
  $('#inquiry-help').textContent=callback?'Оставьте телефон. Дизайн, размеры и материалы обсудим лично.':'Заполните то, что уже знаете. Остальное обсудим вместе.';
  submit.textContent=callback?'Жду звонка ↗︎':'Отправить проект ↗︎';
  fieldError(contactInput,'#contact-error','');
  if(focus)(enabled?contactInput:note).focus({preventScroll:true});
 }
 modeButtons.forEach((button,index)=>button.addEventListener('click',()=>setMode(index?'project':'callback',index?'project-button':'callback-button',true)));
 document.addEventListener('inquiry-open',event=>setMode(event.detail.mode,event.detail.entryPoint,true));
 document.querySelectorAll('a[href="#idea"]').forEach(link=>link.addEventListener('click',()=>{
  if(!busy&&!completed){entryPoint=link.dataset.entry||'inquiry';if(link.dataset.inquiryMode)setMode(link.dataset.inquiryMode,entryPoint);}
 }));
 function renderFiles(){
  list.replaceChildren(...files.map((file,i)=>{const row=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');name.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)} МБ`;remove.type='button';remove.textContent='Удалить';remove.setAttribute('aria-label',`Удалить ${file.name}`);remove.disabled=busy||completed;remove.addEventListener('click',()=>{files.splice(i,1);invalidate();renderFiles();});row.append(name,remove);return row;}));
 }
 input.addEventListener('change',()=>{
  const added=Array.from(input.files);input.value='';
  if(files.length+added.length>5){message('Можно приложить до 5 файлов. Удалите лишние и повторите выбор.');return;}
  if(added.some(f=>!allowed.has(f.type)||! /\.(jpe?g|png|webp|pdf)$/i.test(f.name))){message('Поддерживаются только JPEG, PNG, WebP и PDF.');return;}
  if(added.some(f=>f.size===0||f.size>10*1024*1024)){message('Каждый файл должен быть непустым и не больше 10 МБ.');return;}
  files.push(...added);invalidate();renderFiles();message('Файлы добавлены. Они отправятся вместе с проектом.');
 });
 form.addEventListener('input',invalidate);note.addEventListener('input',invalidate);
 contactInput.addEventListener('input',()=>fieldError(contactInput,'#contact-error',''));
 consent.addEventListener('change',()=>fieldError(consent,'#consent-error',''));
 document.addEventListener('concept-selection-start',invalidate);
 const encode=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,type:file.type,data:String(reader.result).split(',')[1]});reader.onerror=()=>reject(new Error('file'));reader.readAsDataURL(file);});
 async function check(){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const response=await fetch(apiBase+'api/config',{cache:'no-store',signal:controller.signal});const config=await response.json();enabled=response.ok&&config.enabled===true;}catch{enabled=false;}finally{clearTimeout(timer);}
  submit.disabled=!enabled;form.hidden=!enabled;modeButtons.forEach(button=>button.disabled=!enabled);
  $('#inquiry-availability').hidden=enabled;$('.form-heading').hidden=!enabled;
  if(enabled){setMode(mode,entryPoint);}
  else{$('#inquiry-availability').textContent='Онлайн-заявки пока недоступны. Напишите нам напрямую: описание можно скопировать или отправить по email ниже.';$('#project-note-group').hidden=false;}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!enabled||completed)return;
  const contact=contactInput.value.trim(),phone=/^\+?[\d\s()\-]{7,30}$/.test(contact)&&contact.replace(/\D/g,'').length>=7&&contact.replace(/\D/g,'').length<=20;
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  if(!(phone||(mode==='project'&&email))){fieldError(contactInput,'#contact-error',mode==='callback'?'Укажите телефон с кодом страны.':'Укажите телефон с кодом страны или корректный email.');contactInput.focus();return;}
  if(!consent.checked){fieldError(consent,'#consent-error','Подтвердите согласие, чтобы отправить обращение.');consent.focus();return;}
  const submittedConcept=projectModel().id,submittedDescription=projectDescription();
  const selectionControls=Array.from(document.querySelectorAll('#table-range,#prev,#next,.ticks button,#configurator button'));
  const controls=[...form.querySelectorAll('input,button'),...modeButtons,...selectionControls];
  const originalDisabled=controls.map(el=>el.disabled);
  controls.forEach(el=>el.disabled=true);note.readOnly=true;
  busy=true;form.setAttribute('aria-busy','true');renderFiles();
  message(mode==='callback'?'Сохраняем запрос на звонок…':'Подготавливаем файлы и сохраняем проект…');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   if(!pending){
    const value=name=>form.elements.namedItem(name).value.trim();
    const attribution=window.LeadAttribution?.snapshot()||{};
    pending={idempotencyKey:key,contact,requestMode:mode,preferredTime:mode==='callback'?value('preferredTime'):'',name:mode==='project'?value('name'):'',city:mode==='project'?value('city'):'',desiredDate:mode==='project'?value('desiredDate'):'',description:mode==='project'?submittedDescription:(projectModel().configuration||''),conceptId:submittedConcept,consentVersion:'2026-11-01',entryPoint,source:window.LeadAttribution?.safePage(location.href)||location.origin+location.pathname,utm:attribution.latestTouch?.utm||{},attribution,files:mode==='project'?await Promise.all(files.map(encode)):[]};
   }
   const response=await fetch(apiBase+'api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending),signal:controller.signal});
   const result=await response.json();if(!response.ok||!result.leadId||result.saved!==true)throw new Error(result.error||'save');
   message(`Обращение сохранено. Номер: ${result.leadId}.`);submit.textContent='Обращение сохранено';completed=true;
  }catch{message('Не удалось подтвердить сохранение. Ваши данные и файлы остались здесь. Повторите отправку или свяжитесь с нами напрямую.');}
  finally{clearTimeout(timer);note.readOnly=false;busy=false;form.removeAttribute('aria-busy');controls.forEach((el,i)=>el.disabled=(completed&&!selectionControls.includes(el))||originalDisabled[i]);submit.disabled=completed||!enabled;renderFiles();document.dispatchEvent(new Event('inquiry-state-change'));}
 });
 if(new URLSearchParams(location.search).has('inspiration')){mode='project';entryPoint='concept';}
 else if(new URLSearchParams(location.search).has('concept'))entryPoint='concept';
 check();
})();
