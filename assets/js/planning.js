(() => {
 "use strict";
 const rail=document.getElementById('schedule-rail');
 const cards=document.getElementById('schedule-cards');
 if(!rail||!cards)return;
 const fmt=s=>new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s+'T12:00:00'));
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function viewReport(date){
   window.dispatchEvent(new CustomEvent('seg:open-report',{detail:{id:date}}));
 }
 function render(data){
   rail.replaceChildren();cards.replaceChildren();
   data.phases.forEach((phase,i)=>{
     const btn=document.createElement('button');btn.className='schedule-step';btn.type='button';
     btn.innerHTML=`<span class="schedule-dot">${String(i+1).padStart(2,'0')}</span><strong>${safe(phase.label)}</strong>`;
     btn.setAttribute('aria-label',`Accéder à l'étape : ${phase.label}`);
     btn.addEventListener('click',()=>document.getElementById('phase-'+phase.id)?.scrollIntoView({behavior:'smooth',block:'start'}));
     rail.append(btn);
     const card=document.createElement('article');card.className='schedule-card documented-phase';card.id='phase-'+phase.id;
     const recent=[...phase.dates].sort().reverse();
     const period=`${fmt(phase.dates[0])} — ${fmt(phase.dates[phase.dates.length-1])}`;
     card.innerHTML=`<div class="documented-visual"><img loading="lazy" src="${safe(phase.cover.src)}" alt="${safe(phase.cover.alt)}"><span class="documented-number">ÉTAPE ${String(i+1).padStart(2,'0')}</span></div>
     <div class="documented-content"><p class="documented-period">${safe(period)}</p><h4>${safe(phase.label)}</h4><p class="schedule-description">${safe(phase.description)}</p>
     <div class="documented-metrics"><span><strong>${phase.reportCount}</strong> reportages associés</span><span><strong>${phase.photoCount}</strong> photos dans ces reportages</span>${phase.has360?'<span>◎ Immersion 360° disponible</span>':''}</div>
     <p class="documented-detail-title">Consulter un relevé daté</p><div class="documented-dates"></div>
     <div class="documented-actions"><button type="button" class="documented-open">Voir le dernier reportage ↗</button>${phase.has360?'<a href="#immersion">Explorer les vues 360° ↗</a>':''}</div></div>`;
     card.querySelector('.documented-open').addEventListener('click',()=>viewReport(recent[0]));
     const datesEl=card.querySelector('.documented-dates');
     recent.forEach(date=>{const b=document.createElement('button');b.type='button';b.textContent=fmt(date);b.setAttribute('aria-label','Ouvrir le reportage du '+fmt(date));b.addEventListener('click',()=>viewReport(date));datesEl.append(b);});
     cards.append(card);
   });
 }
 fetch('data/etapes-documentees.json?v=25.5',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(render).catch(err=>{console.error(err);cards.textContent='Les étapes documentées sont momentanément indisponibles.';});
})();
