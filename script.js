'use strict';
const PRODUCTS = {
 chpt:{name:'CHPT.9 Pore Clear Serum',file:'chpt.jpg',tip:'依產品說明使用並沖洗。'},
 ihada:{name:'IHADA 美白保濕化妝水',file:'ihada.jpg',tip:'輕拍全臉，補充肌膚水分。'},
 melano:{name:'Melano CC 維 C 化妝水',file:'melano-cc.jpg',tip:'洗臉後輕拍全臉，接續保濕。'},
 cream:{name:'Sungboon Editor 綠番茄 NMN 乳霜',file:'green-tomato-cream.jpg',tip:'取適量輕柔塗抹，為保養鎖住水分。'},
 pink:{name:'Quality 1st Derma Laser ULTHERA R 粉色精華',file:'ulthera-r.jpg',tip:'保留產品，尚未安排固定使用日。'},
 ampoule:{name:'Sungboon Editor 綠番茄毛孔安瓶',file:'green-tomato-ampoule.jpg',tip:'化妝水後使用，輕按至吸收。'},
 gold:{name:'Quality 1st VC MAX ULTHERA 金色精華',file:'vc-max.jpg',tip:'保留產品，尚未安排固定使用日。'},
 retinol:{name:'Innisfree Retinol Cica Repair Ampoule 50mL',file:'retinol.jpg',tip:'依產品說明使用，留意肌膚耐受狀況。'},
 muji:{name:'MUJI Clear Care All-in-One Gel',file:'muji-gel.jpg',tip:'保留產品，尚未安排固定使用日。'},
 mask:{name:'Timeless Truth 浸潤補水黑面膜（藍色包裝）',file:'blue-mask.jpg',tip:'敷用時間依包裝說明，取下後接續乳霜。'},
 goldmask:{name:'Timeless Truth 浸潤補水黑面膜（藍色包裝）',file:'blue-mask.jpg',tip:'保留產品，尚未安排固定使用日。'},
 yaman:{name:'YA-MAN Photo Plus Deep Lift 美容儀',file:'yaman.jpg',tip:'依原廠說明搭配適用介質。'},
 biore:{name:'Biore 防曬乳（款式待確認）',file:'biore.jpg',tip:'依產品說明足量塗抹，外出時適時補擦。'}
};
const ROUTINES={
 c:{title:'早 C 保養',symbol:'☀',description:'以清爽的維 C 保養，開啟今天的好氣色。',steps:[['water'],['melano'],['ampoule','optional'],['cream'],['biore']]},
 hydrate:{title:'保濕保養',symbol:'◌',description:'輕盈補水，讓肌膚舒服地迎接新的一天。',steps:[['water'],['ihada'],['ampoule','optional'],['cream'],['biore']]},
 a:{title:'A 醇保養',symbol:'☾',description:'慢下來，留一點時間給晚間的細緻保養。',steps:[['wash'],['ihada'],['retinol'],['cream']]},
 pore:{title:'CHPT 毛孔保養',symbol:'✧',description:'依照產品步驟，溫柔照顧毛孔與肌膚。',steps:[['chpt'],['wash','after'],['ihada'],['cream']]},
 daily:{title:'YA-MAN DAILY',symbol:'✳',description:'每日模式的小儀式，依原廠說明照顧肌膚。',steps:[['wash'],['yaman','daily'],['ihada'],['cream']]},
 repair:{title:'保濕修護',symbol:'◌',description:'簡單補水、好好保濕，今晚讓肌膚喘口氣。',steps:[['wash'],['ihada'],['ampoule'],['cream']]},
 special:{title:'YA-MAN SPECIAL',symbol:'✧',description:'為自己留一段專屬的美容儀保養時間。',steps:[['wash'],['yaman','special'],['ihada'],['cream']]},
 mask:{title:'面膜保養',symbol:'❋',description:'以補水面膜，為一週畫下柔軟的句點。',steps:[['wash'],['mask'],['cream']]}
};
const DEFAULT={am:['c','hydrate','c','hydrate','c','hydrate','c'],pm:['a','pore','daily','repair','special','daily','mask']};
const KEY='my-skincare-calendar-v1';
const DAYS=['一','二','三','四','五','六','日'];
const $=s=>document.querySelector(s);
function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT));}
function validPlan(value){return value && ['am','pm'].every(p=>Array.isArray(value[p]) && value[p].length===7 && [...new Set(DEFAULT[p])].every(id=>value[p].filter(x=>x===id).length===DEFAULT[p].filter(x=>x===id).length));}
let plan=cloneDefault(), storageOK=true;
try{const saved=localStorage.getItem(KEY);if(saved){const parsed=JSON.parse(saved);if(validPlan(parsed))plan=parsed;}}catch{storageOK=false;}
function taiwanNow(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));const date=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day));return {date,index:(date.getUTCDay()+6)%7,hour:+parts.hour,key:`${parts.year}-${parts.month}-${parts.day}`};}
let today=taiwanNow(), selected=today.index, period=today.hour<18?'am':'pm', editPeriod=period, firstDay=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(plan));storageOK=true;}catch{storageOK=false;}updateStorage();}
function updateStorage(){$('#storage-status').textContent=storageOK?'排程會自動保存在這個瀏覽器':'瀏覽器無法儲存；本次調整只會保留到頁面關閉。';}
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function warningText(){const sensitive=id=>id==='a'||id==='pore';const pairs=[];for(let i=0;i<7;i++)if(sensitive(plan.pm[i])&&sensitive(plan.pm[(i+1)%7]))pairs.push(`週${DAYS[i]}與週${DAYS[(i+1)%7]}`);return pairs.length?`溫柔提醒：${pairs.join('、')}的晚間安排為相鄰的 A 醇／CHPT 日，請留意肌膚反應，視需要拉開間隔。`:'';}
function render(){today=taiwanNow();$('#date').textContent=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(today.date)+' · 台灣時間';$('#month').textContent=`${today.date.getUTCFullYear()} 年 ${today.date.getUTCMonth()+1} 月`;
 const monday=new Date(today.date);monday.setUTCDate(monday.getUTCDate()-today.index);
 $('#week').replaceChildren(...DAYS.map((day,i)=>{const date=new Date(monday);date.setUTCDate(date.getUTCDate()+i);const button=document.createElement('button');button.className=i===selected?'active':'';button.setAttribute('aria-pressed',String(i===selected));button.setAttribute('aria-label',`週${day}，${date.getUTCMonth()+1}月${date.getUTCDate()}日${i===today.index?'，今天':''}`);button.innerHTML=`<span>週${day}</span><strong>${date.getUTCDate()}</strong>${i===today.index?'<i class="today-dot"></i>':''}`;button.onclick=()=>{selected=i;render();};return button;}));
 document.querySelectorAll('[data-period]').forEach(b=>{b.classList.toggle('active',b.dataset.period===period);b.setAttribute('aria-pressed',String(b.dataset.period===period));});
 const routine=ROUTINES[plan[period][selected]];
 $('#routine').innerHTML=`<div class="hero ${period}"><div><p class="eyebrow">週${DAYS[selected]} · ${period==='am'?'早上的清新儀式':'晚上的溫柔時光'}</p><h2>${routine.title}</h2><p class="description">${routine.description}</p></div></div>`;
 $('#step-count').textContent=`${String(routine.steps.length).padStart(2,'0')} 個步驟 · 依序使用`;
 $('#steps').replaceChildren(...routine.steps.map(([id,variant],i)=>{const card=document.createElement('article');card.className='product-card';const image=document.createElement('div');image.className='product-image';const info=document.createElement('div');info.className='product-info';let name,tip;
 if(id==='wash'||id==='water'){name=id==='water'?'清水洗臉':'洗臉';tip=variant==='after'?'依 CHPT 產品說明及需要清潔。':id==='water'?'以清水輕柔洗淨，開始今天的保養。':'溫和清潔後，輕輕按乾臉部。';image.classList.add('clean');image.textContent='≈';image.setAttribute('aria-hidden','true');}
 else{const product=PRODUCTS[id];name=product.name;tip=product.tip;if(id==='yaman'){name=variant==='special'?'YA-MAN D×LIFT':'YA-MAN DAILY';tip='依原廠說明操作，搭配原廠指定的適用介質。';}
 const placeholder=document.createElement('div');placeholder.className='placeholder';placeholder.innerHTML='<span class="bottle" aria-hidden="true"></span>';const label=document.createElement('small');label.textContent=product.name;placeholder.append(label);image.append(placeholder);const img=document.createElement('img');img.alt=product.name;img.hidden=true;img.onload=()=>{img.hidden=false;placeholder.hidden=true;};img.onerror=()=>{img.hidden=true;placeholder.hidden=false;};img.src='images/'+product.file;image.append(img);}
 info.innerHTML=`<div class="step-kicker">步驟 ${String(i+1).padStart(2,'0')}${variant==='optional'?'<span class="optional">可省略</span>':''}</div><h3></h3><p></p>`;info.querySelector('h3').textContent=name;info.querySelector('p').textContent=tip;card.append(image,info);return card;}));
 const warning=warningText();$('#warning').hidden=!warning;$('#warning').textContent=warning;updateStorage();}
function renderEditor(){document.querySelectorAll('[data-edit-period]').forEach(b=>{b.classList.toggle('active',b.dataset.editPeriod===editPeriod);b.setAttribute('aria-pressed',String(b.dataset.editPeriod===editPeriod));});$('#edit-days').replaceChildren(...DAYS.map((d,i)=>{const card=document.createElement('div');card.className='day-card'+(firstDay===i?' selected':'');card.dataset.day=i;card.innerHTML=`<button class="day-select" aria-pressed="${firstDay===i}"><span>週${d}</span>${ROUTINES[plan[editPeriod][i]].title}</button><button class="drag-handle" aria-label="拖曳週${d}的保養安排">⠿</button>`;card.querySelector('.day-select').onclick=()=>{if(firstDay===null){firstDay=i;renderEditor();$('#edit-status').textContent=`已選週${d}，請選另一天交換（再點一次可取消）。`;}else if(firstDay===i){firstDay=null;renderEditor();}else swap(firstDay,i);};card.querySelector('.drag-handle').addEventListener('pointerdown',e=>startDrag(e,i));return card;}));if(firstDay===null)$('#edit-status').textContent='選擇第一天，或拖動把手。';}
function swap(a,b){if(a===b)return;[plan[editPeriod][a],plan[editPeriod][b]]=[plan[editPeriod][b],plan[editPeriod][a]];firstDay=null;save();render();renderEditor();const message=`已交換週${DAYS[a]}與週${DAYS[b]}${storageOK?'，已自動儲存':'；目前無法儲存'}`;$('#edit-status').textContent=message+(warningText()?'。'+warningText():'');notify(message);}
let drag=null;
function startDrag(event,index){if(event.button!==0||drag)return;event.preventDefault();const handle=event.currentTarget;handle.setPointerCapture(event.pointerId);drag={index,handle,pointer:event.pointerId,x:event.clientX,y:event.clientY,target:null,ghost:null};handle.addEventListener('pointermove',moveDrag);handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',cancelDrag);handle.addEventListener('lostpointercapture',cancelDrag);}
function moveDrag(event){if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();if(!drag.ghost&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<5)return;if(!drag.ghost){drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.textContent=`週${DAYS[drag.index]} · ${ROUTINES[plan[editPeriod][drag.index]].title}`;$('#editor').append(drag.ghost);document.querySelector(`[data-day="${drag.index}"]`).classList.add('drag-source');}drag.ghost.style.left=Math.min(event.clientX+12,window.innerWidth-200)+'px';drag.ghost.style.top=(event.clientY-25)+'px';const dialog=$('#editor'),rect=dialog.getBoundingClientRect();if(event.clientY>rect.bottom-65)dialog.scrollTop+=10;else if(event.clientY<rect.top+65)dialog.scrollTop-=10;const card=document.elementFromPoint(event.clientX,event.clientY)?.closest('.day-card');drag.target=card?+card.dataset.day:null;document.querySelectorAll('.day-card').forEach(c=>c.classList.toggle('drop-target',+c.dataset.day===drag.target&&drag.target!==drag.index));}
function cleanupDrag(){if(!drag)return;const old=drag;drag=null;old.ghost?.remove();['pointermove','pointerup','pointercancel','lostpointercapture'].forEach((name,i)=>old.handle.removeEventListener(name,[moveDrag,endDrag,cancelDrag,cancelDrag][i]));if(old.handle.hasPointerCapture(old.pointer))old.handle.releasePointerCapture(old.pointer);document.querySelectorAll('.day-card').forEach(c=>c.classList.remove('drop-target','drag-source'));}
function endDrag(){if(!drag)return;const {index,target,ghost}=drag;cleanupDrag();if(ghost&&target!==null&&target!==index)swap(index,target);}
function cancelDrag(){cleanupDrag();}
function closeEditor(){cleanupDrag();$('#editor').close();}
$('#edit').onclick=()=>{editPeriod=period;firstDay=null;renderEditor();$('#editor').showModal();document.body.classList.add('editing');};$('#close').onclick=closeEditor;$('#done').onclick=closeEditor;$('#editor').addEventListener('close',()=>{cleanupDrag();document.body.classList.remove('editing');$('#edit').focus();});$('#editor').addEventListener('cancel',cleanupDrag);
 document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{period=b.dataset.period;render();});document.querySelectorAll('[data-edit-period]').forEach(b=>b.onclick=()=>{cancelDrag();editPeriod=b.dataset.editPeriod;firstDay=null;renderEditor();});$('#today').onclick=()=>{today=taiwanNow();selected=today.index;period=today.hour<18?'am':'pm';render();};$('#reset').onclick=()=>{if(confirm('確定恢復全部早上與晚上的預設排程？此操作會取代目前的交換設定。')){cancelDrag();plan=cloneDefault();firstDay=null;save();render();renderEditor();notify('已恢復預設排程');}};
function refreshDate(){const now=taiwanNow();if(now.key!==today.key){selected=now.index;period=now.hour<18?'am':'pm';render();}}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDate();});setInterval(refreshDate,60000);window.addEventListener('storage',event=>{if(event.key===KEY){try{const value=event.newValue?JSON.parse(event.newValue):cloneDefault();if(validPlan(value)){cancelDrag();plan=value;firstDay=null;render();if($('#editor').open)renderEditor();}}catch{}}});render();
