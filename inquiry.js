'use strict';
(()=>{
 const form=document.querySelector('#inquiry-form');
 const input=document.querySelector('#lead-files'),list=document.querySelector('#file-list'),status=document.querySelector('#inquiry-status'),submit=form.querySelector('[type=submit]');
 let files=[],enabled=false,busy=false,key=crypto.randomUUID();
 const allowed=new Set(['image/jpeg','image/png','image/webp','application/pdf']);
 const message=text=>{status.textContent=text;};
 function renderFiles(){
  list.replaceChildren(...files.map((file,i)=>{const row=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');name.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)} МБ`;remove.type='button';remove.textContent='Удалить';remove.setAttribute('aria-label',`Удалить ${file.name}`);remove.disabled=busy;remove.addEventListener('click',()=>{files.splice(i,1);key=crypto.randomUUID();renderFiles();});row.append(name,remove);return row;}));
 }
 input.addEventListener('change',()=>{
  const added=Array.from(input.files);input.value='';
  if(files.length+added.length>5){message('Можно приложить до 5 файлов. Удалите лишние и повторите выбор.');return;}
  if(added.some(f=>!allowed.has(f.type)||! /\.(jpe?g|png|webp|pdf)$/i.test(f.name))){message('Поддерживаются только JPEG, PNG, WebP и PDF.');return;}
  if(added.some(f=>f.size===0||f.size>10*1024*1024)){message('Каждый файл должен быть непустым и не больше 10 МБ.');return;}
  files.push(...added);key=crypto.randomUUID();renderFiles();message('Файлы добавлены. Они отправятся вместе с проектом.');
 });
 form.addEventListener('input',()=>{if(!busy)key=crypto.randomUUID();});
 document.querySelector('#project-note').addEventListener('input',()=>{if(!busy)key=crypto.randomUUID();});
 document.addEventListener('concept-selection-start',()=>{if(!busy)key=crypto.randomUUID();});
 const encode=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,type:file.type,data:String(reader.result).split(',')[1]});reader.onerror=()=>reject(new Error('file'));reader.readAsDataURL(file);});
 async function check(){try{const response=await fetch('api/config',{cache:'no-store'});const config=await response.json();enabled=response.ok&&config.enabled===true;}catch{enabled=false;}submit.disabled=!enabled;message(enabled?'Отправка доступна. Обязателен только контакт и согласие.':'Онлайн-отправка пока не подключена. Напишите нам в Telegram, по email или позвоните по контактам ниже.');}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!enabled)return;
  const contact=form.elements.contact.value.trim();
  if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^\+?[\d\s()\-]{7,30}$/.test(contact)&&contact.replace(/\D/g,'').length>=7)){message('Укажите телефон с кодом страны или корректный email.');form.elements.contact.focus();return;}
  if(!document.querySelector('#lead-consent').checked){message('Для отправки нужно согласие на обработку данных.');document.querySelector('#lead-consent').focus();return;}
  const submittedConcept=projectModel().id,submittedDescription=projectDescription(), note=document.querySelector('#project-note');
  const selectionControls=Array.from(document.querySelectorAll('#table-range,#prev,#next,.ticks button,#configurator button'));
  const originalDisabled=selectionControls.map(el=>el.disabled);
  selectionControls.forEach(el=>el.disabled=true);note.readOnly=true;
  busy=true;submit.disabled=true;form.setAttribute('aria-busy','true');renderFiles();
  const controls=Array.from(form.querySelectorAll('input'));controls.forEach(el=>el.disabled=true);
  message('Подготавливаем файлы и сохраняем проект…');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   const payload={idempotencyKey:key,contact,name:form.elements.namedItem('name').value.trim(),city:form.elements.city.value.trim(),description:submittedDescription,conceptId:submittedConcept,consentVersion:'2026-10-29',files:await Promise.all(files.map(encode))};
   const response=await fetch('api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const result=await response.json();if(!response.ok||!result.leadId||result.saved!==true)throw new Error(result.error||'save');
   message(`Проект сохранён. Номер обращения: ${result.leadId}.`);submit.textContent='Проект сохранён';enabled=false;
  }catch{message('Не удалось подтвердить сохранение. Ваши данные и файлы остались здесь. Повторите отправку или свяжитесь с нами напрямую.');}
  finally{clearTimeout(timer);note.readOnly=false;selectionControls.forEach((el,i)=>el.disabled=originalDisabled[i]);if(projectModel().id!==submittedConcept)key=crypto.randomUUID();busy=false;form.removeAttribute('aria-busy');controls.forEach(el=>el.disabled=false);submit.disabled=!enabled;renderFiles();document.dispatchEvent(new Event('inquiry-state-change'));}
 });check();
})();
