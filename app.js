'use strict';
const $=id=>document.getElementById(id);
let loans=[
 {name:'Cash Credit',amount:1200,rate:10.5},
 {name:'WCDL',amount:800,rate:9},
 {name:'ICD',amount:500,rate:11}
];
let lastResult=null;
const n=id=>Math.max(0,Number($(id).value)||0);
const money=x=>'₹ '+(Number(x)||0).toLocaleString('en-IN',{maximumFractionDigits:2})+' lakh';
const rateFmt=x=>(x||0).toFixed(3)+'%';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderLoans(){
 const host=$('loan-list');host.innerHTML='';
 loans.forEach((loan,i)=>{
  const div=document.createElement('div');div.className='loan';
  div.innerHTML=`<div class="loan-head"><b>General borrowing ${i+1}</b><button type="button" data-remove="${i}" ${loans.length===1?'disabled':''}>Remove</button></div>
  <div class="loan-grid">
   <label>Loan name<input data-index="${i}" data-key="name" value="${esc(loan.name)}"></label>
   <label>Average outstanding (₹ lakh)<input type="number" min="0" data-index="${i}" data-key="amount" value="${loan.amount}"></label>
   <label>Annual interest rate (%)<input type="number" min="0" step=".01" data-index="${i}" data-key="rate" value="${loan.rate}"></label>
  </div>`;
  host.appendChild(div);
 });
}
renderLoans();
$('loan-list').addEventListener('input',e=>{
 const i=Number(e.target.dataset.index),key=e.target.dataset.key;
 if(key&&loans[i])loans[i][key]=key==='name'?e.target.value:Math.max(0,Number(e.target.value)||0);
});
$('loan-list').addEventListener('click',e=>{
 if(e.target.dataset.remove!==undefined){loans.splice(Number(e.target.dataset.remove),1);renderLoans();}
});
$('add-loan').addEventListener('click',()=>{loans.push({name:'New borrowing',amount:0,rate:0});renderLoans();});
function navigate(id){
 document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==id));
 document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
function line(label,value){return `<div class="line"><span>${label}</span><b>${value}</b></div>`;}
function calculate(){
 const specificAmount=n('specific-amount'),specificRate=n('specific-rate'),specificMonths=Math.min(12,n('specific-months'));
 const investment=n('investment-income'),other=n('other-costs'),taxExcluded=n('tax-excluded');
 const specificGross=specificAmount*specificRate/100*specificMonths/12;
 const generalPrincipal=loans.reduce((s,l)=>s+l.amount,0);
 const generalInterest=loans.reduce((s,l)=>s+l.amount*l.rate/100,0)+other;
 const capitalisationRate=generalPrincipal?generalInterest/generalPrincipal*100:0;
 const project=n('project-expenditure'),projectMonths=Math.min(12,n('project-months'));
 const weightedExpenditure=project*projectMonths/12;
 const indasGeneral=weightedExpenditure*capitalisationRate/100;
 const indasSpecific=Math.max(0,specificGross-investment);
 const indasTotal=indasGeneral+indasSpecific;
 const icdsPool=Math.max(0,generalInterest-taxExcluded);
 const averageQualifying=n('average-qualifying'),averageTotal=n('average-total');
 const ratio=averageTotal?averageQualifying/averageTotal:0;
 const icdsGeneral=icdsPool*ratio;
 const icdsSpecific=specificGross;
 const icdsTotal=icdsGeneral+icdsSpecific;
 lastResult={generalPrincipal,generalInterest,capitalisationRate,weightedExpenditure,indasGeneral,indasSpecific,indasTotal,specificGross,investment,icdsPool,averageQualifying,averageTotal,ratio,icdsGeneral,icdsSpecific,icdsTotal,project,projectMonths};
 $('indas-output').innerHTML=`<div class="result-grid"><div class="metric"><span>Illustrative general borrowing rate</span><strong>${rateFmt(capitalisationRate)}</strong></div><div class="metric"><span>Illustrative total capitalisation</span><strong>${money(indasTotal)}</strong></div></div>${line('Specific borrowing (net of investment income)',money(indasSpecific))}${line('General borrowing',money(indasGeneral))}${line('Weighted qualifying expenditure',money(weightedExpenditure))}${line('General borrowing pool',money(generalPrincipal))}`;
 $('indas-teaching').innerHTML=`<div class="steps">
 <p><b>Step 1 — Annual general borrowing costs.</b><br>${loans.map(l=>`${esc(l.name)}: ${money(l.amount)} × ${l.rate}% = ${money(l.amount*l.rate/100)}`).join('<br>')}<br>Other entered costs: ${money(other)}.<br>Total general borrowing costs: <b>${money(generalInterest)}</b>.</p>
 <p><b>Step 2 — Capitalisation rate.</b><br>${money(generalInterest)} ÷ ${money(generalPrincipal)} × 100 = <b>${rateFmt(capitalisationRate)}</b>.</p>
 <p><b>Step 3 — Time-weight expenditure.</b><br>${money(project)} × ${projectMonths}/12 = <b>${money(weightedExpenditure)}</b>.</p>
 <p><b>Step 4 — Apply the rate.</b><br>${money(weightedExpenditure)} × ${rateFmt(capitalisationRate)} = <b>${money(indasGeneral)}</b>.</p>
 <p><b>Step 5 — Specific borrowing.</b><br>${money(specificAmount)} × ${specificRate}% × ${specificMonths}/12 = ${money(specificGross)} gross interest. Less temporary investment income of ${money(investment)} = <b>${money(indasSpecific)}</b>.</p>
 <p><b>Step 6 — Total.</b><br>${money(indasGeneral)} + ${money(indasSpecific)} = <b>${money(indasTotal)}</b>.</p>
 <p class="muted">This is a simplified teaching illustration. It assumes all stated periods and expenditure qualify, constant full-year general borrowing balances, no overlapping specific funding, no suspensions and no further adjustments. A complete computation needs date-wise schedules, eligibility tests and the overall borrowing-cost ceiling.</p></div>`;
 $('icds-output').innerHTML=`<div class="result-grid"><div class="metric"><span>Average asset ratio</span><strong>${(ratio*100).toFixed(2)}%</strong></div><div class="metric"><span>Illustrative total capitalisation</span><strong>${money(icdsTotal)}</strong></div></div>${line('Specific borrowing cost',money(icdsSpecific))}${line('General borrowing cost',money(icdsGeneral))}${line('General borrowing pool after entered exclusion',money(icdsPool))}`;
 $('icds-teaching').innerHTML=`<div class="steps">
 <p><b>Step 1 — General borrowing cost pool.</b><br>${money(generalInterest)} gross costs less user-entered excluded costs of ${money(taxExcluded)} = <b>${money(icdsPool)}</b>.</p>
 <p><b>Step 2 — Average cost ratio.</b><br>${money(averageQualifying)} ÷ ${money(averageTotal)} = <b>${(ratio*100).toFixed(2)}%</b>.</p>
 <p><b>Step 3 — Apply the ratio.</b><br>${money(icdsPool)} × ${(ratio*100).toFixed(2)}% = <b>${money(icdsGeneral)}</b>.</p>
 <p><b>Step 4 — Specific borrowing illustration.</b><br>${money(specificAmount)} × ${specificRate}% × ${specificMonths}/12 = <b>${money(specificGross)}</b>.</p>
 <p><b>Step 5 — Total.</b><br>${money(icdsGeneral)} + ${money(icdsSpecific)} = <b>${money(icdsTotal)}</b>.</p>
 <p class="muted">This is deliberately provisional. ICDS IX prescribes asset-specific methods for average costs and different commencement/cessation rules. This prototype does not yet build those averages from an asset register. The tax treatment of specific borrowing must be checked against the notified ICDS and the facts.</p></div>`;
 const diff=indasTotal-icdsTotal;
 $('reconcile-output').innerHTML=`<div class="result-grid"><div class="metric"><span>Ind AS 23 illustration</span><strong>${money(indasTotal)}</strong></div><div class="metric"><span>ICDS IX illustration</span><strong>${money(icdsTotal)}</strong></div></div><div class="metric"><span>Ind AS less ICDS</span><strong>${diff>=0?'+':''}${money(diff)}</strong></div>`;
 $('reconcile-teaching').innerHTML=`<div class="steps"><p><b>1. Different general borrowing methods.</b><br>Ind AS uses a capitalisation rate applied to time-weighted qualifying expenditure. ICDS IX uses a prescribed average-cost ratio.</p><p><b>2. Different specific borrowing treatment.</b><br>Ind AS 23 deducts income from temporary investment of specific borrowings in determining eligible capitalisation. Do not automatically carry this treatment into ICDS IX.</p><p><b>3. Different qualifying asset and period rules.</b><br>Definitions, commencement and cessation rules need asset-by-asset analysis.</p><p><b>Illustrative difference:</b> ${diff>=0?money(diff)+' higher under Ind AS.':money(Math.abs(diff))+' higher under ICDS.'} This is not automatically the final taxable-income adjustment. Consider tax actual cost, depreciation and deferred tax implications separately.</p></div>`;
 navigate('reconcile');
}
$('calculate').addEventListener('click',calculate);
