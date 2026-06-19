'use strict';

/* Cockpit de Aquisição v4 — Kaptar+. Reusa a API do server; dark/gold sob a
   Doutrina de Direção de Arte. Despacho NUNCA é reconstruído pelo auto-refresh
   (corrige o bug da seleção de variantes). */

const S = { data:null, selectedKey:null, activeJobId:null, jobTimer:null,
            segments:new Set(), queue:[], view:'prospect', map:null, marker:null,
            lastDispatchKey:null, editing:false };

const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function brl(v){ if(v===null||v===undefined||v===''||!Number.isFinite(Number(v))) return null; return 'R$ '+Number(v).toLocaleString('pt-BR'); }
function shortDate(v){ if(!v) return '—'; const d=new Date(v); return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(d); }
function initials(n){ return (n||'?').trim().charAt(0).toUpperCase()||'?'; }

async function api(path,opts={}){ const r=await fetch(path,{headers:{'content-type':'application/json'},...opts}); const p=await r.json().catch(()=>({})); if(!r.ok) throw new Error(p.error||`Erro ${r.status}`); return p; }
function toast(msg){ const n=$('#toast'); n.textContent=msg; n.classList.add('show'); clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove('show'),3600); }

/* ── Segmentos (ICP) ── */
const SEG_GROUPS = [
  { t:'Saúde & Estética', items:['Clínica de estética','Dermatologia','Clínica odontológica','Fisioterapia','Nutricionista'] },
  { t:'Serviços profissionais', items:['Advocacia','Contabilidade','Corretora de seguros','Arquitetura'] },
  { t:'Pet', items:['Pet shop','Clínica veterinária'] },
];
function renderSegments(){
  $('#segments').innerHTML = SEG_GROUPS.map(g=>`
    <div class="grp"><div class="grp-t">${esc(g.t)}</div>
      <div class="chips">${g.items.map(i=>`<button class="chip" data-seg="${esc(i)}">${esc(i)}</button>`).join('')}</div>
    </div>`).join('');
  $$('#segments .chip').forEach(el=>el.addEventListener('click',()=>{
    const seg=el.dataset.seg;
    if(S.segments.has(seg)){ S.segments.delete(seg); el.classList.remove('on'); }
    else { S.segments.add(seg); el.classList.add('on'); }
    $('#seg-count').textContent = S.segments.size;
  }));
}

/* ── Mapa (território) ── */
function initMap(){
  if(!window.L){ $('#map').innerHTML='<div style="padding:20px;color:#8a8a8a;font-size:13px">mapa indisponível (offline)</div>'; return; }
  S.map = L.map('map',{zoomControl:false,attributionControl:false,scrollWheelZoom:false}).setView([-15.78,-47.92],4);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(S.map);
  S.map.on('click', async e=>{
    const {lat,lng}=e.latlng;
    if(S.marker) S.marker.setLatLng(e.latlng);
    else S.marker=L.circleMarker(e.latlng,{radius:8,color:'#c9a55c',fillColor:'#c9a55c',fillOpacity:.9,weight:2}).addTo(S.map);
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`);
      const j=await r.json(); const a=j.address||{};
      const city=a.suburb||a.city||a.town||a.village||a.municipality||a.county||'';
      const uf=a.state||'';
      const label=[city,uf].filter(Boolean).join(', ');
      if(label){ $('#f-city').value=label; $('#geo-echo').textContent=label; $('#maplabel').textContent='território · '+(city||uf).toLowerCase(); }
    }catch(_){ $('#geo-echo').textContent=`${lat.toFixed(2)}, ${lng.toFixed(2)}`; }
  });
}

/* ── Navegação ── */
function setView(view){
  S.view=view;
  $$('.nav a').forEach((a,i)=>{ const on=a.dataset.view===view; a.classList.toggle('on',on); if(on) $('#navInd').style.transform=`translateY(${i*45}px)`; });
  $$('.view').forEach(v=>v.classList.remove('on'));
  $('#view-'+view).classList.add('on');
  if(view==='pipeline'){ renderBoard(); renderDispatch(); }
  if(view==='metrics') renderMetrics();
  if(view==='config') renderConfig();
  if(view==='prospect' && S.map) setTimeout(()=>S.map.invalidateSize(),200);
}

/* ── Funil ── */
const LANES=[
  {name:'Descobertos',steps:['discovered','qualified','pending_approval']},
  {name:'Enviados',steps:['sent']},
  {name:'Follow-up',steps:['followup_1','followup_2']},
  {name:'Responderam',steps:['replied','demo_sent','call_offered']},
  {name:'Fechamento',steps:['closed']},
];
const STEP_PT={sent:'enviado',followup_1:'follow-up 1',followup_2:'follow-up 2',replied:'respondeu',demo_sent:'demo',call_offered:'call',closed:'fechado',discovered:'descoberto',qualified:'qualificado',pending_approval:'aprovação'};
const DISCOVERY_STEPS=['discovered','qualified','pending_approval'];

function enrichLeads(data){
  const pipe=data.pipeline||{};
  const contacts=(pipe.contacts||[]).map(c=>({...c,id:c.key}));
  const pendings=(data.pending&&data.pending.items)||[];
  const mkey=o=>String(o.whatsapp||'').replace(/\D/g,'')||String(o.domain||'').toLowerCase()||String(o.name||'').toLowerCase();
  const byKey={}; contacts.forEach(c=>{byKey[mkey(c)]=c;});
  pendings.forEach(pi=>{
    const m=pi.message||{}; const msg=m.whatsapp_version||m.body||'';
    const variants=Array.isArray(m.variants)?m.variants:null; const recommended=m.recommended||null;
    const hit=byKey[mkey(pi)];
    if(hit){ hit.message=msg; hit.messageVariants=variants; hit.recommended=recommended; hit.pendingIndex=pi.index; hit.channel=pi.channel; }
    else contacts.push({ id:'pending:'+pi.index, key:'pending:'+pi.index, name:pi.name, domain:pi.domain, segment:pi.segment, whatsapp:pi.whatsapp, website:pi.website, score:pi.score, main_problem:pi.main_problem, step:'pending_approval', tier:'mass', message:msg, messageVariants:variants, recommended, pendingIndex:pi.index, channel:pi.channel });
  });
  return contacts;
}

function entryHtml(c){
  const ht=c.tier==='high-touch'; const sel=c.key===S.selectedKey?' on':'';
  const variant=c.variantChosen||c.variant ? `<span class="abmark a">${esc(c.variantChosen||c.variant)}</span>` : '<span class="abmark">—</span>';
  let infoLine,status;
  if(DISCOVERY_STEPS.includes(c.step)){
    infoLine = c.message ? '<div class="eval"><s>✎ copy pronta</s></div>' : '<div class="eval"><s>copy pendente</s></div>';
    status = `<span class="ew">${esc(STEP_PT[c.step]||c.step||'')}</span>`;
  } else {
    const val=brl(c.value); infoLine = val?`<div class="eval">${esc(val)}<s>/mês</s></div>`:'';
    status = ht&&c.nextActionAt ? `<span class="ew due">ação · ${esc(shortDate(c.nextActionAt))}</span>` : `<span class="ew">${esc(STEP_PT[c.step]||c.step||'')}</span>`;
  }
  return `<div class="entry${ht?' lead':''}${sel}" data-key="${esc(c.key)}">
    <div class="en">${ht?'<span class="crown">♛</span> ':''}${esc(c.name||c.domain||'Lead')}</div>
    <div class="es">${esc(c.segment||c.domain||'')}</div>${infoLine}
    <div class="ef">${status}${variant}</div></div>`;
}

function renderBoard(){
  if(!S.data) return;
  const all=enrichLeads(S.data); const board=$('#board');
  board.innerHTML=LANES.map(lane=>{
    const inLane=all.filter(c=>lane.steps.includes(c.step));
    const items=inLane.length?inLane.map(entryHtml).join(''):'<div class="col-empty">—</div>';
    return `<div class="led-col"><div class="led-top"><span class="nm">${lane.name}</span><span class="ct mono">${inLane.length}</span></div><div class="led-list">${items}</div></div>`;
  }).join('');
  board.querySelectorAll('.entry').forEach(el=>el.addEventListener('click',()=>{ S.selectedKey=el.dataset.key; renderDispatch(true); renderBoard(); }));
}

function selectedLead(){
  if(!S.data) return null; const all=enrichLeads(S.data);
  if(S.selectedKey){ const f=all.find(c=>c.key===S.selectedKey); if(f) return f; }
  const ht=(S.data.pipeline.highTouch||[])[0];
  if(ht){ const f=all.find(c=>c.key===ht.key); if(f) return f; }
  return all[0]||null;
}
function plannedOutputs(){
  const o=(S.data&&S.data.settings&&S.data.settings.outputs)||{};
  const map={diagnosis:'diagnóstico',demo:'demo',landing:'landing',email:'e-mail',followup:'follow-up'};
  return Object.entries(map).filter(([k])=>o[k]).map(([,v])=>v);
}
function dispatchHeader(lead,kicker){
  const ht=lead.tier==='high-touch';
  return `<div class="dsp-h"><div class="top"><span>${kicker}</span><span>${ht?'♛ high-touch':'tier massa'}</span></div>
    <div class="who"><div class="seal">${esc(initials(lead.name))}</div>
      <div><h3>${esc(lead.name||lead.domain||'Lead')}</h3><div class="sub">${esc(lead.segment||lead.domain||lead.whatsapp||'')}</div></div></div>
    <div class="chips-h"><span class="chip-h ${ht?'gold':''}">${ht?'high-touch':'massa'}</span>
      <span class="chip-h">${esc(STEP_PT[lead.step]||lead.step||'—')}</span>
      ${lead.channel?`<span class="chip-h blue">${esc(lead.channel)}</span>`:''}</div></div>`;
}

// Só re-renderiza o despacho quando o lead muda (force) — nunca por cima da edição.
function renderDispatch(force){
  const box=$('#dispatch'); const lead=selectedLead();
  if(!lead){ box.innerHTML=`<div class="dsp-empty"><span class="big-q">"De onde vem o próximo cliente?"</span>Pipeline vazio. Rode uma prospecção — os leads aparecem aqui com a copy de 1º contato pronta.</div>`; S.lastDispatchKey=null; return; }
  if(!force && lead.key===S.lastDispatchKey) return; // não clobber
  S.selectedKey=lead.key; S.lastDispatchKey=lead.key;
  if(DISCOVERY_STEPS.includes(lead.step)) renderFirstContact(lead); else renderDeal(lead);
}

function renderFirstContact(lead){
  const gate=S.data.pipeline.canSend;
  const variants=(lead.messageVariants&&lead.messageVariants.length>1)?lead.messageVariants:null;
  const rec=lead.recommended||{};
  S._variantChosen=variants?(variants[0].id||'A'):null;
  S._variantMsgs=variants?variants.map(v=>v.whatsapp_version):[];

  const copyBlock=variants
    ? `<div class="dsp-lab">Copy de 1º contato <b>3 variantes · A/B</b></div>
       <div class="vlist" id="copy-variants">${variants.map((v,i)=>`
         <div class="v${i===0?' on':''}" data-idx="${i}" data-id="${esc(v.id||'')}">
           <div class="vrow"><span class="vt"><span class="mk"></span> ${esc(v.id||'·')} · ${esc(v.angle||'')}</span></div>
           <div class="body-q">${esc(v.whatsapp_version)}</div></div>`).join('')}</div>`
    : `<div class="dsp-lab">Copy de 1º contato <b>do Copy Engine</b></div>
       <div class="cpnote">Variante única — rode uma prospecção nova para gerar as 3.</div>`;

  const pkg=[]; if(rec.diagnosis) pkg.push('diagnóstico'); if(rec.video) pkg.push('vídeo');
  plannedOutputs().forEach(o=>{ if(!pkg.includes(o)) pkg.push(o); });
  const initial=variants?variants[0].whatsapp_version:lead.message;

  $('#dispatch').innerHTML=dispatchHeader(lead,'Despacho — 1º contato')+
    `<div class="dsp-b">${copyBlock}
      <div class="dsp-lab" style="margin-top:16px">Mensagem final · editável</div>
      <textarea class="ed" id="f-copy" placeholder="Sem link, sem pitch, termina em pergunta.">${esc(initial||'')}</textarea>
      <div class="dsp-lab" style="margin-top:16px">Pacote planejado · após resposta${rec.reason?` <b>${esc(rec.reason)}</b>`:''}</div>
      <div class="pkg">${pkg.length?pkg.map(o=>`<span class="pkgtag on">${esc(o)}</span>`).join(''):'<span class="pkgtag">nenhum — só conversa</span>'}</div></div>
    <div class="dsp-f"><span class="gate"><i class="${gate?'':'blocked'}"></i> ${gate?'GATE OK':'BLOQUEADO'}</span>
      <button class="bsm" id="b-savecopy"${lead.pendingIndex==null?' disabled':''}>Salvar copy</button>
      <button class="bsm gold" id="b-approve">Aprovar lote →</button></div>`;

  // Seleção de variante via índice em estado (sem data-attribute frágil).
  $$('#copy-variants .v').forEach(el=>el.addEventListener('click',()=>{
    $$('#copy-variants .v').forEach(x=>x.classList.remove('on'));
    el.classList.add('on');
    const idx=Number(el.dataset.idx);
    $('#f-copy').value=S._variantMsgs[idx]||'';
    S._variantChosen=el.dataset.id;
  }));
  const ta=$('#f-copy'); if(ta){ ta.addEventListener('focus',()=>S.editing=true); ta.addEventListener('blur',()=>S.editing=false); }
  if(lead.pendingIndex!=null) $('#b-savecopy').addEventListener('click',()=>saveCopy(lead));
  $('#b-approve').addEventListener('click',approveBatch);
}

function renderDeal(lead){
  const ht=lead.tier==='high-touch'; const gate=S.data.pipeline.canSend;
  $('#dispatch').innerHTML=dispatchHeader(lead,'Despacho — negócio')+
    `<div class="dsp-b"><div class="dsp-lab">Valor do negócio</div>
      <div class="row2"><input id="f-value" type="number" placeholder="MRR R$/mês" value="${lead.value??''}">
        <input id="f-plan" type="number" placeholder="Total do plano" value="${lead.planValue??''}"></div>
      <div class="dsp-lab" style="margin-top:16px">Ação agendada <b>${ht?'high-touch':''}</b></div>
      <div class="field" style="margin:0"><input id="f-date" type="date" value="${esc((lead.nextActionAt||'').slice(0,10))}"></div>
      <textarea class="ed" id="f-draft" style="margin-top:14px" placeholder="Rascunho da próxima mensagem.">${esc(lead.nextActionDraft||'')}</textarea></div>
    <div class="dsp-f"><span class="gate"><i class="${gate?'':'blocked'}"></i> ${gate?'GATE OK':'BLOQUEADO'}</span>
      <button class="bsm" id="b-tier">${ht?'Rebaixar':'Promover ♛'}</button>
      <button class="bsm gold" id="b-save">Salvar</button></div>`;
  $('#b-save').addEventListener('click',()=>saveLead(lead.key,false));
  $('#b-tier').addEventListener('click',()=>saveLead(lead.key,true));
}

async function saveCopy(lead){
  try{ const message={whatsapp_version:$('#f-copy').value}; if(S._variantChosen) message.variantChosen=S._variantChosen;
    await api(`/api/pending/${lead.pendingIndex}`,{method:'PATCH',body:JSON.stringify({message})});
    toast('Copy salva'); await refresh(); }catch(e){ toast(e.message); }
}
async function approveBatch(){
  if(window.prompt('Digite ENVIAR para disparar o lote aprovado de 1º contato:')!=='ENVIAR') return;
  try{ await startJob('/api/approved/send',{dryRun:false,confirm:'ENVIAR',usePanelSchedule:true}); }catch(e){ toast(e.message); }
}
async function saveLead(key,toggleTier){
  const lead=selectedLead(); const body={key};
  const v=$('#f-value').value,p=$('#f-plan').value;
  if(v!=='') body.value=Number(v); if(p!=='') body.planValue=Number(p);
  body.nextActionAt=$('#f-date').value||null; body.nextActionDraft=$('#f-draft').value;
  if(toggleTier) body.tier=lead.tier==='high-touch'?'mass':'high-touch';
  try{ await api('/api/lead',{method:'POST',body:JSON.stringify(body)}); toast(toggleTier?'Tier atualizado':'Lead salvo'); S.lastDispatchKey=null; await refresh(); renderDispatch(true); }catch(e){ toast(e.message); }
}

/* ── Pipeline stats ── */
function renderStats(){
  const pipe=S.data.pipeline; const val=pipe.value||{mrr:0,deals:0};
  const replied=(pipe.counts&&pipe.counts.replied)||0;
  const cards=[
    {k:'MRR em jogo',v:brl(val.mrr)||'R$ 0',gold:1,s:`${val.deals} negócio(s)`},
    {k:'Responderam',v:replied,s:'aguardando você'},
    {k:'Follow-ups devidos',v:pipe.dueFollowups,s:pipe.awaitingReply?`${pipe.awaitingReply} p/ reconciliar`:'rascunhos prontos'},
    {k:'High-touch',v:pipe.highTouchDue,s:'ação agendada'},
    {k:'Envios hoje',v:`${pipe.remainingToday}/${pipe.dailyCap}`,s:pipe.canSend?'gate liberado':'bloqueado'},
  ];
  $('#pipe-top').innerHTML=cards.map(c=>`<div class="stat"><div class="k">${c.k}</div><div class="v${c.gold?' gold':''}">${esc(String(c.v))}</div><div class="s">${esc(c.s)}</div></div>`).join('');
}

/* ── Métricas (só dado real de /api/state; grafo de interesse vem do CLI) ── */
function renderMetrics(){
  if(!S.data) return; const pipe=S.data.pipeline; const val=pipe.value||{mrr:0,deals:0};
  const counts=pipe.counts||{};
  const cards=[
    {k:'Total no pipeline',v:pipe.total,src:'/api/state'},
    {k:'MRR em jogo',v:brl(val.mrr)||'R$ 0',src:'soma real'},
    {k:'Descobertos',v:(counts.discovered||0)+(counts.qualified||0)+(counts.pending_approval||0),src:'pipeline'},
    {k:'Enviados',v:counts.sent||0,src:'pipeline'},
    {k:'Responderam',v:counts.replied||0,src:'pipeline'},
    {k:'Fechados',v:counts.closed||0,src:'pipeline'},
    {k:'Alcance não-seguidores',v:'—',muted:1,src:'insights:aquisicao'},
    {k:'Cliques no link da bio',v:'—',muted:1,src:'insights:aquisicao'},
    {k:'Retenção média (reels)',v:'—',muted:1,src:'insights:aquisicao'},
  ];
  $('#mgrid').innerHTML=cards.map(c=>`<div class="mcard"><div class="k">${c.k}</div><div class="v${c.muted?' muted':''}">${esc(String(c.v))}</div><div class="src">fonte · ${esc(c.src)}</div></div>`).join('');
}

/* ── Config ── */
function renderConfig(){
  if(!S.data) return; const o=(S.data.settings&&S.data.settings.outputs)||{}; const sc=(S.data.settings&&S.data.settings.schedule)||{};
  const outs=[['whatsapp','WhatsApp','canal principal de 1º contato'],['email','E-mail','canal secundário'],['diagnosis','Diagnóstico','isca após resposta'],['demo','Demo','após resposta'],['landing','Landing','após resposta'],['followup','Follow-up','D+2 / D+5 automático']];
  $('#cfg').innerHTML=
    `<div class="cfg-row"><div><div class="t">Janela personalizada</div><div class="d">Permite envio fora do horário comercial padrão</div></div>
       <div class="toggle ${sc.enabled?'on':''}" data-sched></div></div>`+
    outs.map(([k,t,d])=>`<div class="cfg-row"><div><div class="t">${t}</div><div class="d">${d}</div></div>
       <div class="toggle ${o[k]?'on':''}" data-out="${k}"></div></div>`).join('')+
    `<button class="btn ghost" id="cfg-save" style="margin-top:20px">Salvar configurações</button>`;
  $$('#cfg .toggle').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('on')));
  $('#cfg-save').addEventListener('click',async()=>{
    const outputs={}; $$('#cfg .toggle[data-out]').forEach(el=>{ outputs[el.dataset.out]=el.classList.contains('on'); });
    const schedule={...sc,enabled:$('#cfg .toggle[data-sched]').classList.contains('on')};
    try{ await api('/api/settings',{method:'PUT',body:JSON.stringify({...S.data.settings,outputs,schedule})}); toast('Configurações salvas'); await refresh(); }catch(e){ toast(e.message); }
  });
}

/* ── Render geral (NÃO toca no despacho) ── */
function render(data){
  const pipe=data.pipeline; const val=pipe.value||{mrr:0,deals:0};
  $('#mrr').innerHTML=`MRR em jogo · <b>${esc(brl(val.mrr)||'R$ 0')}</b>`;
  const dot=$('#live-dot'),lab=$('#live-label');
  dot.className=pipe.canSend?'':'blocked';
  lab.textContent=pipe.canSend?`WhatsApp · ${pipe.remainingToday}/${pipe.dailyCap} envios`:'envio bloqueado';
  $('#quota-r').textContent=pipe.canSend?`gate: ok`:`gate: bloqueado`;
  if(S.view==='pipeline'){ renderStats(); renderBoard(); renderDispatch(false); }
  if(S.view==='metrics') renderMetrics();
}

function paintJob(j){ $('#joblog').style.display='block'; $('#job-status').textContent=j.status||'—'; const log=$('#job-log'); log.textContent=(j.logs||[]).map(l=>l.line).join('\n')||'Aguardando logs…'; log.scrollTop=log.scrollHeight; }

async function refresh(){
  try{ const data=await api('/api/state'); S.data=data; render(data); }
  catch(e){ $('#live-label').textContent='offline'; $('#live-dot').className='blocked'; }
}

/* ── Jobs + fila de segmentos ── */
async function startJob(path,body){ const j=await api(path,{method:'POST',body:JSON.stringify(body)}); S.activeJobId=j.id; paintJob(j); pollJob(); }
function pollJob(){
  clearInterval(S.jobTimer);
  S.jobTimer=setInterval(async()=>{
    if(!S.activeJobId) return;
    try{ const j=await api(`/api/jobs/${S.activeJobId}`); paintJob(j);
      if(j.status!=='running'){ clearInterval(S.jobTimer); S.activeJobId=null; await refresh();
        if(S.queue.length){ startNextInQueue(); } else { toast(j.status==='finished'?'Prospecção concluída':'Job falhou'); }
      }
    }catch(e){ toast(e.message); }
  },1500);
}
function startNextInQueue(){
  if(!S.queue.length) return;
  const seg=S.queue.shift(); const city=$('#f-city').value.trim();
  const query=city?`${seg} ${city}`:seg;
  const minScore=Number($('#f-score').value)||4, maxLeads=Number($('#f-max').value)||10, channel=$('#f-channel').value;
  toast(`Buscando: ${seg}${city?' · '+city:''}`);
  startJob('/api/campaigns/start',{query,maxLeads,minScore,channel}).catch(e=>toast(e.message));
}
function startProspect(){
  if(S.activeJobId){ toast('Já há uma busca em andamento'); return; }
  if(!S.segments.size){ toast('Escolha ao menos um segmento'); return; }
  S.queue=[...S.segments]; startNextInQueue();
}

function bindProspect(){
  $('#btn-prospect').addEventListener('click',startProspect);
  $('#f-city').addEventListener('input',e=>$('#geo-echo').textContent=e.target.value.trim()||'—');
  $('#f-score').addEventListener('input',e=>$('#score-val').textContent=e.target.value);
  $('#f-max').addEventListener('input',e=>$('#max-val').textContent=e.target.value);
}

function tick(){ $('#clock').textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date()).toUpperCase(); }

function init(){
  $$('.nav a').forEach(a=>a.addEventListener('click',()=>setView(a.dataset.view)));
  renderSegments(); bindProspect(); initMap();
  tick(); setInterval(tick,30000);
  refresh(); setInterval(refresh,5000);
}
init();
