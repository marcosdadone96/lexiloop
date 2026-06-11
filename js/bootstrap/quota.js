// ═══════════════════════════════════════════
// QUOTA / PLAN
// ═══════════════════════════════════════════
function getMonthKey(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()}`;}
function getQuotaUsed(){
  try{const raw=localStorage.getItem('lc_quota');if(!raw)return 0;const q=JSON.parse(raw);return q.month===getMonthKey()?q.used:0;}catch(e){return 0;}
}
function incQuota(){
  const used=getQuotaUsed()+1;
  localStorage.setItem('lc_quota',JSON.stringify({month:getMonthKey(),used}));
  updQuotaUI();
  Auth.pushSync();
}
function isPro(){return typeof S!=='undefined'&&S.plan==='pro';}
function getQuotaMax(){return isPro()?PRO_QUOTA:FREE_QUOTA;}
function canGenerate(){return getQuotaUsed()<getQuotaMax();}
function updQuotaUI(){
  const used=getQuotaUsed(),max=getQuotaMax(),rem=max-used;
  const el=document.getElementById('quotaCount');
  const badge=document.getElementById('planBadgeHome');
  const upgradeBtn=document.getElementById('upgradeBtnHome');
  if(el){
    el.textContent=`${used}/${max} used`;
    el.className='quota-count'+(rem===0?' none':rem<=1?' low':'');
  }
  if(badge) badge.innerHTML=isPro()?'<span class="plan-badge plan-pro">✦ Pro</span>':'<span class="plan-badge plan-free">Free</span>';
  if(upgradeBtn) upgradeBtn.style.display=isPro()?'none':'inline-flex';
  // quota warning on level screen
  const warn=document.getElementById('quotaWarning');
  const btn=document.getElementById('btnStart');
  if(warn&&btn){
    if(!canGenerate()){
      warn.style.display='block';
      warn.textContent=`You've used all ${max} exams this month (pool or AI). Retake a saved exam for free, or upgrade to Pro for 20/month.`;
      btn.disabled=true;
    }else{
      warn.style.display='none';
      if(S.level) btn.disabled=false;
    }
  }
}
function showUpgrade(){document.getElementById('upgradeModal').classList.add('show');}
function closeUpgrade(){document.getElementById('upgradeModal').classList.remove('show');}
function activatePro(){
  alert('Stripe checkout is coming soon.\n\nCreate a free account now — your flashcards and progress sync to the cloud.');
  closeUpgrade();
}
