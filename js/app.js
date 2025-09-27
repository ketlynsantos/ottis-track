
const DATA={projects:[
{id:"CL-3421",country:"Chile",city:"Santiago",client:"Edifício Andes",stage:"Instalação",orderDate:"2025-07-01",handover:"2025-09-01",
 milestones:[{name:"Engenharia",planned:"2025-07-05",actual:"2025-07-05"},{name:"Fabricação",planned:"2025-07-20",actual:"2025-07-18"},{name:"Entrega em Obra",planned:"2025-08-01",actual:"2025-08-02"},{name:"Instalação",planned:"2025-08-18",actual:"2025-08-19"},{name:"Testes",planned:"2025-08-27",actual:null},{name:"Handover",planned:"2025-09-01",actual:null}],budget:100,actualCost:104,quality:[{id:"NC-01",severity:"Alta",status:"Aberta",title:"Ajuste de nivelamento do poço",due:"2025-08-22"},{id:"NC-02",severity:"Média",status:"Em Progresso",title:"Proteção de cabos",due:"2025-08-25"},{id:"NC-03",severity:"Baixa",status:"Resolvida",title:"Acabamento de botoeira",due:"2025-08-15"}],fpy:0.92},
{id:"BR-5510",country:"Brasil",city:"São Paulo",client:"Torre Atlântica",stage:"Fabricação",orderDate:"2025-06-20",handover:"2025-09-10",
 milestones:[{name:"Engenharia",planned:"2025-06-28",actual:"2025-06-29"},{name:"Fabricação",planned:"2025-07-20",actual:"2025-07-26"},{name:"Entrega em Obra",planned:"2025-08-05",actual:"2025-08-06"},{name:"Instalação",planned:"2025-08-25",actual:null},{name:"Testes",planned:"2025-09-05",actual:null},{name:"Handover",planned:"2025-09-10",actual:null}],budget:180,actualCost:187,quality:[{id:"NC-04",severity:"Média",status:"Aberta",title:"Ancoragem de guia",due:"2025-08-28"}],fpy:0.9},
{id:"AR-1207",country:"Argentina",city:"Rosario",client:"Puerto Norte",stage:"Testes",orderDate:"2025-06-30",handover:"2025-09-05",
 milestones:[{name:"Engenharia",planned:"2025-07-03",actual:"2025-07-03"},{name:"Fabricação",planned:"2025-07-18",actual:"2025-07-17"},{name:"Entrega em Obra",planned:"2025-08-01",actual:"2025-08-01"},{name:"Instalação",planned:"2025-08-18",actual:"2025-08-17"},{name:"Testes",planned:"2025-08-30",actual:"2025-08-29"},{name:"Handover",planned:"2025-09-05",actual:null}],budget:120,actualCost:118,quality:[],fpy:0.95}
]};

function q(s,r=document){return r.querySelector(s)};function qa(s,r=document){return [...r.querySelectorAll(s)]}
function fmtPct(n){return (n*100).toFixed(0)+"%"}
function daysBetween(a,b){if(!a||!b)return null;return Math.round((new Date(b)-new Date(a))/(1000*60*60*24));}
function onTimePct(ms){const v=ms.filter(m=>m.actual!=null);if(!v.length)return 0;let on=0;v.forEach(m=>{if(new Date(m.actual)<=new Date(m.planned))on+=1});return on/v.length}
function leadTime(p){return daysBetween(p.orderDate,p.handover)}
function costVariance(p){return (p.actualCost-p.budget)/p.budget}
function scheduleStatus(p){
  const ot = onTimePct(p.milestones); // fraction 0..1
  if(ot>=0.9) return {label:"No prazo", cls:"on"};
  if(ot>=0.7) return {label:"Em risco", cls:"risk"};
  return {label:"Atrasado", cls:"delay"};
}
function statusBadge(stage){const s=stage.toLowerCase();if(s.includes("handover"))return "done";if(s.includes("fabr")||s.includes("inst")||s.includes("test"))return "inprogress";return "inprogress"}

function renderKPIs(el, projs){
  const all = projs.flatMap(p=>p.milestones);
  const onTime = onTimePct(all);
  const avgLead = Math.round(projs.reduce((a,p)=>a+(leadTime(p)||0),0)/projs.length);
  const avgCV = projs.reduce((a,p)=>a+costVariance(p),0)/projs.length;
  const avgFPY = projs.reduce((a,p)=>a+p.fpy,0)/projs.length;
  el.innerHTML = `
    <div class="card kpi"><h3>Marcos no prazo</h3><div class="value">${fmtPct(onTime)}</div><div class="delta">média geral</div></div>
    <div class="card kpi"><h3>Lead Time Médio</h3><div class="value">${avgLead} dias</div><div class="delta">pedido → entrega</div></div>
    <div class="card kpi"><h3>Variação de custo</h3><div class="value">${(avgCV*100).toFixed(1)}%</div><div class="delta">orçado × realizado</div></div>
    <div class="card kpi"><h3>Primeiro passe (FPY)</h3><div class="value">${fmtPct(avgFPY)}</div><div class="delta">sem retrabalho</div></div>`;
}

function renderTable(tbody, projs){
  tbody.innerHTML = projs.map(p=>{
    const ot = fmtPct(onTimePct(p.milestones));
    const lt = leadTime(p) ?? "—";
    const sch = scheduleStatus(p);
    return `<tr>
      <td><a href="projeto.html?id=${encodeURIComponent(p.id)}">${p.id}</a></td>
      <td>${p.country}</td>
      <td>${p.client}</td>
      <td>${p.stage}</td>
      <td class="num">${ot}</td>
      <td class="num">${lt}d</td>
      <td><span class="chip ${sch.cls}">${sch.label}</span></td>
    </tr>`;
  }).join("");
}

function getProject(id){return DATA.projects.find(p=>p.id===id)}
function renderProject(p){
  if(!p){q("#project").innerHTML="<div class='card'>Projeto não encontrado.</div>";return;}
  q("#p-title").textContent=`${p.client} — ${p.city}/${p.country} (${p.id})`;
  q("#p-stage").textContent=p.stage; q("#p-stage").className="badge "+statusBadge(p.stage);
  q("#p-ot").textContent=fmtPct(onTimePct(p.milestones));
  q("#p-lt").textContent=(leadTime(p)||"—")+" dias";
  q("#p-cv").textContent=((costVariance(p))*100).toFixed(1)+"%";
  q("#p-fpy").textContent=fmtPct(p.fpy);
  const tl=q("#timeline"); tl.innerHTML=p.milestones.map(m=>{
    let cls="item"; if(m.actual && new Date(m.actual)<=new Date(m.planned))cls+=" done";
    if(m.actual && new Date(m.actual)>new Date(m.planned))cls+=" delay"; if(!m.actual)cls+=" risk";
    return `<div class="${cls}"><strong>${m.name}</strong><div class="small">Planejado: ${m.planned||"—"} • Real: ${m.actual||"—"}</div></div>`;
  }).join("");
  q("#cost-line").textContent=`Orçado: ${p.budget} • Realizado: ${p.actualCost}`;
  const delta=Math.round(((p.actualCost-p.budget)/p.budget)*1000)/10; q("#cost-delta").textContent=`Δ ${delta}%`;
  const fill=Math.min(100,Math.max(2,Math.round((p.actualCost/p.budget)*100))); q("#cost-bar .fill").style.width=fill+"%";
  const ql=q("#quality"); ql.innerHTML=(p.quality.length? p.quality.map(qc=>`<div class="card"><div><strong>${qc.id}</strong> • Gravidade: ${qc.severity} • Status: ${qc.status}</div><div class="small">${qc.title} • Prazo: ${qc.due}</div></div>`).join("") : `<div class="card">Sem Não Conformidades.</div>`);
}
function openModal(){q("#nc-dialog").showModal()} function closeModal(){q("#nc-dialog").close(); showToast("Registro salvo")}
function showToast(msg){const t=q(".toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2000)}
function tabTo(n){qa(".tab").forEach(e=>e.classList.remove("active")); qa(".tabpanel").forEach(e=>e.style.display="none"); q(`[data-tab='${n}']`).classList.add("active"); q(`#panel-${n}`).style.display="block"}
const STEPS=["Pedido","Fabricação","Entrega","Instalação","Testes","Handover"];
function renderPortal(p){
  q("#portal-title").textContent=`${p.client} — ${p.city}/${p.country}`;
  const idx=STEPS.findIndex(s=>s.toLowerCase().includes(p.stage.toLowerCase().slice(0,4)))||0;
  q("#steps").innerHTML = STEPS.map((s,i)=>`<div class="step ${i<=idx?"done":""}"><div class="dot"></div><div>${s}</div></div>`).join("");
  q("#fb-form").addEventListener("submit",e=>{e.preventDefault();showToast("Feedback enviado. Obrigado!"); e.target.reset();});
}
window.OTApp={DATA,renderKPIs,renderTable,getProject,renderProject,openModal,closeModal,tabTo,renderPortal};


// --- Feedback dataset ---
const FEEDBACK = [{"id": "fb1", "projectId": "BR-5510", "project": "Torre Atlântica", "country": "Brasil", "city": "São Paulo", "nps": 9, "csat": 5, "date": "2025-08-19", "comment": "Elevador ficou lindo, prazo ok."}, {"id": "fb2", "projectId": "BR-5510", "project": "Torre Atlântica", "country": "Brasil", "city": "São Paulo", "nps": 4, "csat": 3, "date": "2025-08-10", "comment": "Comunicação ok, aguardando entrega."}, {"id": "fb3", "projectId": "CL-3421", "project": "Edifício Andes", "country": "Chile", "city": "Santiago", "nps": 2, "csat": 2, "date": "2025-08-05", "comment": "Atraso na instalação."}, {"id": "fb4", "projectId": "AR-1207", "project": "Puerto Norte", "country": "Argentina", "city": "Rosario", "nps": 10, "csat": 5, "date": "2025-08-21", "comment": "Equipe muito atenciosa. Instalação rápida."}, {"id": "fb5", "projectId": "CL-3421", "project": "Edifício Andes", "country": "Chile", "city": "Santiago", "nps": 7, "csat": 4, "date": "2025-08-18", "comment": "Tudo dentro do esperado."}, {"id": "fb6", "projectId": "AR-1207", "project": "Puerto Norte", "country": "Argentina", "city": "Rosario", "nps": 6, "csat": 3, "date": "2025-08-15", "comment": "Pequenos ajustes, mas resolvido."}];


function npsScore(rows){
  if(!rows.length) return 0;
  let pro=0, det=0;
  rows.forEach(r=>{ if(r.nps>=9) pro++; else if(r.nps<=6) det++; });
  return Math.round(((pro/rows.length)-(det/rows.length))*100);
}
function avgCsat(rows){ if(!rows.length) return 0; return (rows.reduce((a,r)=>a+r.csat,0)/rows.length).toFixed(1); }
function dist0to10(rows){
  const arr = Array.from({length:11},()=>0);
  rows.forEach(r=>{ if(r.nps>=0 && r.nps<=10) arr[r.nps]++; });
  return arr;
}
function tagFor(n){ if(n>=9) return ["Promotor","pro"]; if(n<=6) return ["Detrator","det"]; return ["Neutro","neu"]; }


function renderFeedbackDashboard(){
  // Toolbar
  const selCountry = q("#fb-country");
  const selProject = q("#fb-project");
  const selPeriod = q("#fb-period");
  // Build filters
  const countries = [...new Set(FEEDBACK.map(f=>f.country))].sort();
  selCountry.innerHTML = '<option value="Todos">Todos</option>' + countries.map(c=>`<option>${c}</option>`).join('');
  const projects = [...new Set(FEEDBACK.map(f=>f.project))].sort();
  selProject.innerHTML = '<option value="Todos">Todos</option>' + projects.map(p=>`<option>${p}</option>`).join('');
  // Filter function
  function apply(){
    let rows = FEEDBACK.slice();
    if(selCountry.value!=='Todos'){ rows = rows.filter(r=>r.country===selCountry.value); }
    if(selProject.value!=='Todos'){ rows = rows.filter(r=>r.project===selProject.value); }
    const p = selPeriod.value; // 30, 90, 365, all
    if(p!=='all'){
      const days = parseInt(p,10);
      const now = new Date('2025-08-25'); // static reference for demo
      rows = rows.filter(r=> (now - new Date(r.date)) / (1000*60*60*24) <= days );
    }
    // KPIs
    q("#kpi-nps .val").textContent = npsScore(rows) + '%';
    q("#kpi-csat .val").textContent = avgCsat(rows);
    q("#kpi-total .val").textContent = rows.length;
    const pro = rows.filter(r=>r.nps>=9).length;
    const det = rows.filter(r=>r.nps<=6).length;
    q("#kpi-split .val").textContent = `${pro}↑ / ${det}↓`;
    // Bars
    const d = dist0to10(rows);
    const max = Math.max(1, ...d);
    const bars = d.map((v,i)=>{
      let t='neu'; if(i<=6) t='det'; if(i>=9) t='pro';
      const h = Math.round((v/max)*100);
      return `<div class='bar' data-t='${t}' title='${i}: ${v}' style='height:${h}%' ></div>`;
    }).join('');
    q("#bar-container").innerHTML = bars;
    // Comments
    const list = rows.sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,8).map(r=>{
      const [label, cls] = tagFor(r.nps);
      return `<div class="comment">
        <div class="meta"><span class="tag ${cls}">${label}</span> <span>${r.date}</span> <span>•</span> <span>${r.project} — ${r.city}/${r.country}</span> <span>•</span> <span>NPS ${r.nps}, CSAT ${r.csat}</span></div>
        <div class="body">${r.comment}</div>
      </div>`;
    }).join('');
    q("#comments").innerHTML = list || '<div class="card">Sem feedbacks no período.</div>';
  }
  selCountry.onchange=apply; selProject.onchange=apply; selPeriod.onchange=apply;
  apply();
}
