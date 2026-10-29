const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORAGE_KEY='pautang-github-data-v1';
const emptyData=()=>({clients:[],loans:[],payments:[],loan_additions:[],cash_transactions:[],collectibles:[],loan_rate_changes:[],loan_interest_overrides:[]});
const state={page:'dashboard',data:emptyData(),installPrompt:null};
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const peso=centavos=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format((Number(centavos)||0)/100);
const cents=value=>Math.round((Number(value)||0)*100);
const today=()=>new Date().toISOString().slice(0,10);
const now=()=>new Date().toISOString();
const dateLong=value=>new Intl.DateTimeFormat('en-PH',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));
const uid=()=>crypto.randomUUID();
const toast=message=>{const element=$('#toast');element.textContent=message;element.classList.add('show');setTimeout(()=>element.classList.remove('show'),2600)};
const openModal=html=>{$('#modal-body').innerHTML=html;$('#modal').showModal()};
const closeModal=()=>$('#modal').close();

function loadData(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved&&typeof saved==='object')state.data={...emptyData(),...saved};
  }catch{state.data=emptyData()}
}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.data))}
function sortedByDate(items,dateField){return [...items].sort((a,b)=>String(a[dateField]).localeCompare(String(b[dateField]))||String(a.created_at).localeCompare(String(b.created_at)))}

function loanSnapshot(loan){
  const additions=sortedByDate(state.data.loan_additions.filter(item=>item.loan_id===loan.id),'addition_date');
  const payments=sortedByDate(state.data.payments.filter(item=>item.loan_id===loan.id),'payment_date');
  const timeline=[...additions.map(item=>({date:item.addition_date,order:0,item,type:'addition'})),...payments.map(item=>({date:item.payment_date,order:1,item,type:'payment'}))].sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order);
  let balance=Number(loan.total_payable_centavos??loan.principal_centavos),paid=0,totalPrincipal=Number(loan.principal_centavos),totalPayable=Number(loan.total_payable_centavos??loan.principal_centavos);
  const events=[];
  for(const entry of timeline){
    if(entry.type==='addition'){
      const amount=Number(entry.item.payable_centavos??entry.item.principal_centavos);balance+=amount;totalPrincipal+=Number(entry.item.principal_centavos);totalPayable+=amount;
      events.push({type:'addition',date:entry.date,amount_centavos:amount,principal_centavos:Number(entry.item.principal_centavos),balance_centavos:balance,notes:entry.item.notes||''});
    }else{
      const applied=Math.min(balance,Math.max(0,Number(entry.item.amount_centavos)));balance-=applied;paid+=applied;
      events.push({type:'payment',date:entry.date,amount_centavos:applied,balance_centavos:balance,payment_id:entry.item.id});
    }
  }
  return {balance_centavos:balance,payments_centavos:paid,total_principal_centavos:totalPrincipal,total_payable_centavos:totalPayable,events};
}
function loansWithDetails(){return state.data.loans.map(loan=>({...loan,client_name:state.data.clients.find(client=>client.id===loan.client_id)?.full_name||'Client',snapshot:loanSnapshot(loan)})).sort((a,b)=>b.start_date.localeCompare(a.start_date))}
function dashboardData(){
  const loans=loansWithDetails(),outstanding=loans.reduce((sum,loan)=>sum+loan.snapshot.balance_centavos,0),collected=loans.reduce((sum,loan)=>sum+loan.snapshot.payments_centavos,0),principalReleased=loans.reduce((sum,loan)=>sum+loan.snapshot.total_principal_centavos,0);
  const cash=type=>state.data.cash_transactions.filter(item=>item.type===type).reduce((sum,item)=>sum+Number(item.amount_centavos),0);
  const capital=cash('capital'),income=cash('income'),expenses=cash('expense'),withdrawals=cash('withdrawal');
  const cashBalance=capital+income+collected-expenses-withdrawals-principalReleased,withBalance=loans.filter(loan=>loan.snapshot.balance_centavos>0).length;
  return {outstanding,collected,cash_balance:cashBalance,total_fund:cashBalance+outstanding,loans_recorded:loans.length,loans_with_balance:withBalance,loans_fully_paid:loans.length-withBalance};
}

function render(){
  const names={dashboard:'Overview',clients:'Clients',loans:'Loans',cash:'Cash ledger'};
  $('#page-title').textContent=names[state.page];$$('nav button').forEach(button=>button.classList.toggle('active',button.dataset.page===state.page));
  ({dashboard:renderDashboard,clients:renderClients,loans:renderLoans,cash:renderCash}[state.page])();
}
function renderDashboard(){
  const d=dashboardData(),openRate=d.loans_recorded?Math.round(d.loans_with_balance/d.loans_recorded*100):0,portfolio=d.collected+d.outstanding,collectionRate=portfolio?Math.round(d.collected/portfolio*100):0,average=d.loans_with_balance?Math.round(d.outstanding/d.loans_with_balance):0,fullyPaidRate=d.loans_recorded?Math.round(d.loans_fully_paid/d.loans_recorded*100):0;
  $('#content').innerHTML=`<section class="hero"><div class="label">Total fund</div><div class="amount">${peso(d.total_fund)}</div><div class="hero-row"><div><span class="label">Total loaned out</span><strong>${peso(d.outstanding)}</strong></div><div><span class="label">Cash on hand</span><strong>${peso(d.cash_balance)}</strong></div></div><div class="loan-stats"><div><strong>${d.loans_recorded}</strong><span>Loans recorded</span></div><div><strong>${d.loans_with_balance}</strong><span>Still have balances</span></div><div><strong>${d.loans_fully_paid}</strong><span>Fully paid</span></div></div></section><section class="analyst-card"><div class="analyst-icon">✦</div><div><p class="eyebrow">AI ANALYST</p><h2>Portfolio summary</h2><p><strong>${peso(d.outstanding)}</strong> remains loaned out across ${d.loans_with_balance} account${d.loans_with_balance===1?'':'s'}. ${d.loans_fully_paid} of ${d.loans_recorded} loans are fully paid.</p><p class="muted">${openRate}% of recorded loans still have a balance. Cash on hand is ${peso(d.cash_balance)}, bringing total funds to ${peso(d.total_fund)}.</p></div></section><section class="analytics-card"><p class="eyebrow">AI ANALYTICS</p><h2>Performance indicators</h2><div class="analytics-grid"><div><span>Collection progress</span><strong>${collectionRate}%</strong></div><div><span>Average open balance</span><strong>${peso(average)}</strong></div><div><span>Fully paid rate</span><strong>${fullyPaidRate}%</strong></div></div><div class="progress-track"><span style="width:${collectionRate}%"></span></div><p class="muted">${peso(d.collected)} has been collected from ${peso(portfolio)} in recorded loan value.</p></section>`;
}

const clientLoanCount=id=>state.data.loans.filter(loan=>loan.client_id===id).length;
const clientListHtml=clients=>clients.length?clients.map(client=>`<article class="card clickable" data-client="${client.id}"><div class="row"><strong>${esc(client.full_name)}</strong><span><strong>${clientLoanCount(client.id)}</strong> <span class="muted">loan${clientLoanCount(client.id)===1?'':'s'}</span></span></div></article>`).join(''):'<div class="empty">No matching clients.</div>';
function renderClients(){
  const clients=[...state.data.clients].sort((a,b)=>a.full_name.localeCompare(b.full_name));
  $('#content').innerHTML=`<label class="client-search"><span>⌕</span><input id="client-search" type="search" autocomplete="off" placeholder="Search clients…"></label><div class="list" id="client-results">${clients.length?clientListHtml(clients):'<div class="empty">No clients yet. Add the first borrower.</div>'}</div><button class="fab" id="add">+</button>`;
  $('#add').onclick=()=>clientForm();$('#client-search').oninput=event=>{const query=event.target.value.trim().toLowerCase();$('#client-results').innerHTML=clientListHtml(query?clients.filter(client=>client.full_name.toLowerCase().includes(query)):clients)};
  $('#client-results').onclick=event=>{const card=event.target.closest('[data-client]');if(card)clientForm(state.data.clients.find(client=>client.id===card.dataset.client))};
}
function clientForm(client={}){
  openModal(`<h2>${client.id?'Edit':'New'} client</h2><form id="client-form" class="form-grid"><label>Full name<input name="full_name" required value="${esc(client.full_name||'')}"></label><button class="primary">Save client</button>${client.id&&!clientLoanCount(client.id)?'<button type="button" class="secondary danger" id="delete-client">Delete client</button>':''}</form>`);
  $('#client-form').onsubmit=event=>{event.preventDefault();const name=new FormData(event.target).get('full_name').trim().replace(/\s+/g,' ');if(name.length<2)return toast('Client name is required');if(state.data.clients.some(item=>item.id!==client.id&&item.full_name.toLowerCase()===name.toLowerCase()))return toast('This client already exists');if(client.id)client.full_name=name;else state.data.clients.push({id:uid(),full_name:name,phone:'',address:'',email:'',notes:'',created_at:now(),updated_at:now()});saveData();closeModal();toast('Saved successfully');render()};
  if($('#delete-client'))$('#delete-client').onclick=()=>{if(confirm(`Delete ${client.full_name}?`)){state.data.clients=state.data.clients.filter(item=>item.id!==client.id);saveData();closeModal();render()}};
}

const loanListHtml=loans=>loans.length?loans.map(loan=>`<article class="card clickable" data-loan="${loan.id}"><div class="card-top"><div class="grow"><strong>${esc(loan.client_name)}</strong><small>Loaned ${dateLong(loan.start_date)}</small></div>${loan.snapshot.balance_centavos===0?`<button class="delete-inline" data-delete-loan="${loan.id}">Delete</button>`:''}</div><div class="row" style="margin-top:14px"><span class="muted">Remaining payable</span><span class="money">${peso(loan.snapshot.balance_centavos)}</span></div></article>`).join(''):'<div class="empty">No matching loans.</div>';
function renderLoans(){
  const loans=loansWithDetails();$('#content').innerHTML=`<label class="client-search"><span>⌕</span><input id="loan-search" type="search" autocomplete="off" placeholder="Search loans by client…"></label><div class="list" id="loan-results">${loans.length?loanListHtml(loans):'<div class="empty">No loans yet.</div>'}</div><button class="fab" id="add">+</button>`;
  $('#add').onclick=loanForm;$('#loan-search').oninput=event=>{const query=event.target.value.trim().toLowerCase();$('#loan-results').innerHTML=loanListHtml(query?loans.filter(loan=>loan.client_name.toLowerCase().includes(query)):loans)};
  $('#loan-results').onclick=event=>{const remove=event.target.closest('[data-delete-loan]');if(remove){event.stopPropagation();deleteLoan(remove.dataset.deleteLoan);return}const card=event.target.closest('[data-loan]');if(card)loanDetail(card.dataset.loan)};
}
function loanForm(){
  const available=state.data.clients.filter(client=>!state.data.loans.some(loan=>loan.client_id===client.id));if(!state.data.clients.length){toast('Add a client first');state.page='clients';return render()}if(!available.length)return toast('Every client already has a loan. Open a loan and tap Add loan.');
  openModal(`<h2>New loan</h2><form id="loan-form" class="form-grid"><label>Client<select name="client_id" required>${available.map(client=>`<option value="${client.id}">${esc(client.full_name)}</option>`).join('')}</select></label><label>Amount loaned (₱)<input name="principal" type="number" min="0.01" step="0.01" inputmode="decimal" required></label><label>Loan start date<input name="start_date" type="date" value="${today()}" required></label><button class="primary">Create loan</button></form>`);
  $('#loan-form').onsubmit=event=>{event.preventDefault();const form=Object.fromEntries(new FormData(event.target)),principal=cents(form.principal),timestamp=now();state.data.loans.push({id:uid(),client_id:form.client_id,principal_centavos:principal,total_payable_centavos:principal,start_date:form.start_date,initial_monthly_rate_bps:0,status:'active',purpose:'',notes:'',created_at:timestamp,updated_at:timestamp});saveData();closeModal();toast('Saved successfully');render()};
}
function loanDetail(id){
  const loan=loansWithDetails().find(item=>item.id===id),events=[...loan.snapshot.events].reverse();openModal(`<p class="eyebrow">LOAN DETAILS</p><h2>${esc(loan.client_name)}</h2><p class="muted">Started ${dateLong(loan.start_date)} · Total loaned ${peso(loan.snapshot.total_principal_centavos)}</p><div class="card"><span class="muted">Remaining payable</span><div class="detail-total">${peso(loan.snapshot.balance_centavos)}</div><div class="row"><small class="muted">Payments received</small><strong>${peso(loan.snapshot.payments_centavos)}</strong></div></div><div class="grid"><button class="primary" id="pay">Add payment</button><button class="secondary" id="add-loan">Add loan</button></div><div class="section-head"><h2>Loan history</h2></div><div class="list">${events.length?events.map(event=>`<div class="card row"><div class="grow"><strong>${event.type==='addition'?'Additional loan':'Payment'}</strong><small>${dateLong(event.date)}</small></div><span class="money ${event.type==='payment'?'positive':'negative'}">${event.type==='payment'?'-':'+'}${peso(event.amount_centavos)}</span></div>`).join(''):'<div class="empty">No payments or additional loans yet.</div>'}</div>`);$('#pay').onclick=()=>paymentForm(loan);$('#add-loan').onclick=()=>additionForm(loan);
}
function paymentForm(loan){openModal(`<h2>Record payment</h2><p class="muted">${esc(loan.client_name)} · Balance ${peso(loan.snapshot.balance_centavos)}</p><form id="payment-form" class="form-grid"><label>Amount (₱)<input name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" required></label><label>Payment date<input name="payment_date" type="date" value="${today()}" required></label><button class="primary">Save payment</button></form>`);$('#payment-form').onsubmit=event=>{event.preventDefault();const form=Object.fromEntries(new FormData(event.target));state.data.payments.push({id:uid(),loan_id:loan.id,amount_centavos:cents(form.amount),payment_date:form.payment_date,method:'cash',reference:'',notes:'',created_at:now()});saveData();closeModal();toast('Saved successfully');render()}}
function additionForm(loan){openModal(`<h2>Add another loan</h2><p class="muted">${esc(loan.client_name)} · This will increase the current loan balance.</p><form id="addition-form" class="form-grid"><label>Additional amount loaned (₱)<input name="principal" type="number" min="0.01" step="0.01" inputmode="decimal" required></label><label>Date added<input name="addition_date" type="date" value="${today()}" min="${loan.start_date}" required></label><button class="primary">Add to loan</button></form>`);$('#addition-form').onsubmit=event=>{event.preventDefault();const form=Object.fromEntries(new FormData(event.target)),amount=cents(form.principal);state.data.loan_additions.push({id:uid(),loan_id:loan.id,principal_centavos:amount,payable_centavos:amount,addition_date:form.addition_date,notes:'',created_at:now()});saveData();closeModal();toast('Saved successfully');render()}}
function deleteLoan(id){if(!confirm('Delete this fully paid loan and its payment history?'))return;state.data.loans=state.data.loans.filter(item=>item.id!==id);state.data.payments=state.data.payments.filter(item=>item.loan_id!==id);state.data.loan_additions=state.data.loan_additions.filter(item=>item.loan_id!==id);saveData();render()}

function renderCash(){const items=[...state.data.cash_transactions].sort((a,b)=>b.transaction_date.localeCompare(a.transaction_date));$('#content').innerHTML=`<div class="list">${items.length?items.map(item=>`<article class="card row clickable" data-transaction="${item.id}"><div class="grow"><strong>${esc(item.description||item.category||item.type)}</strong><small>${dateLong(item.transaction_date)} · ${esc(item.type)} · Tap to edit</small></div><span class="money ${['income','capital'].includes(item.type)?'positive':'negative'}">${['income','capital'].includes(item.type)?'+':'-'}${peso(item.amount_centavos)}</span></article>`).join(''):'<div class="empty">No cash transactions yet.</div>'}</div><button class="fab" id="add">+</button>`;$$('[data-transaction]').forEach(element=>element.onclick=()=>transactionForm(state.data.cash_transactions.find(item=>item.id===element.dataset.transaction)));$('#add').onclick=()=>transactionForm()}
function transactionForm(item={}){const selected=type=>item.type===type?' selected':'';openModal(`<h2>${item.id?'Edit':'Add'} cash transaction</h2><form id="cash-form" class="form-grid"><label>Type<select name="type"><option value="capital"${selected('capital')}>Capital added</option><option value="income"${selected('income')}>Other income</option><option value="expense"${selected('expense')}>Expense</option><option value="withdrawal"${selected('withdrawal')}>Owner withdrawal</option></select></label><label>Amount (₱)<input name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" required value="${item.id?(item.amount_centavos/100).toFixed(2):''}"></label><label>Date<input name="transaction_date" type="date" value="${item.transaction_date||today()}" required></label><button class="primary">Save transaction</button>${item.id?'<button type="button" class="secondary danger" id="delete-transaction">Delete transaction</button>':''}</form>`);$('#cash-form').onsubmit=event=>{event.preventDefault();const form=Object.fromEntries(new FormData(event.target));if(item.id)Object.assign(item,{type:form.type,amount_centavos:cents(form.amount),transaction_date:form.transaction_date});else state.data.cash_transactions.push({id:uid(),type:form.type,amount_centavos:cents(form.amount),transaction_date:form.transaction_date,category:'',description:'',created_at:now()});saveData();closeModal();toast('Saved successfully');render()};if($('#delete-transaction'))$('#delete-transaction').onclick=()=>{if(confirm('Delete this cash transaction?')){state.data.cash_transactions=state.data.cash_transactions.filter(entry=>entry.id!==item.id);saveData();closeModal();render()}}}

function backupForm(){
  openModal(`<p class="eyebrow">BACKUP & RESTORE</p><h2>Export or import</h2><p class="muted">Records stay on this phone. Export backups regularly.</p><div class="backup-actions"><section class="backup-choice"><h3>Export backup</h3><p class="muted">Download a copy of all business records.</p><button class="primary" id="export-backup">Export backup</button></section><section class="backup-choice"><h3>Import backup</h3><p class="muted">Import a Version 1.31 backup. This replaces records currently stored on this phone.</p><input id="backup-file" type="file" accept="application/json,.json"><button class="secondary danger" id="import-backup" disabled>Import backup</button></section></div>`);
  $('#export-backup').onclick=()=>{const backup={format:'pautang-backup',version:1,app_version:'1.31-github',exported_at:now(),data:state.data},url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=`pautang-backup-${today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exported')};
  $('#backup-file').onchange=event=>{$('#import-backup').disabled=!event.target.files?.length};
  $('#import-backup').onclick=async()=>{const file=$('#backup-file').files?.[0];if(!file||!confirm('Import this backup? It will replace all records currently stored on this phone.'))return;try{const backup=JSON.parse(await file.text()),names=Object.keys(emptyData());if(backup?.format!=='pautang-backup'||backup.version!==1||!backup.data||!names.every(name=>Array.isArray(backup.data[name])))throw new Error('This is not a valid Pautang backup file.');state.data={...emptyData(),...Object.fromEntries(names.map(name=>[name,backup.data[name]]))};saveData();closeModal();toast('Backup restored');state.page='dashboard';render()}catch(error){toast(error instanceof SyntaxError?'The selected file is not valid JSON.':error.message)}};
}

const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent),isStandalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.installPrompt=event;$('#install').classList.remove('hidden')});
window.addEventListener('appinstalled',()=>{$('#install').classList.add('hidden');state.installPrompt=null;toast('Pautang installed')});
if(isIos&&!isStandalone)$('#install').classList.remove('hidden');
$('#install').onclick=async()=>{if(state.installPrompt){await state.installPrompt.prompt();state.installPrompt=null;return}if(isIos)openModal(`<h2>Add Pautang to Home Screen</h2><div class="install-steps"><p><strong>1.</strong> Open in Safari.</p><p><strong>2.</strong> Tap Share.</p><p><strong>3.</strong> Tap Add to Home Screen.</p><p><strong>4.</strong> Tap Add.</p></div>`)};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
window.addEventListener('offline',()=>{$('#sync-status').textContent='Offline mode — records are saved on this phone';$('#sync-status').classList.remove('hidden')});
window.addEventListener('online',()=>$('#sync-status').classList.add('hidden'));
if(!navigator.onLine)window.dispatchEvent(new Event('offline'));
$$('nav button').forEach(button=>button.onclick=()=>{state.page=button.dataset.page;render()});$('#backup').onclick=backupForm;
loadData();render();
