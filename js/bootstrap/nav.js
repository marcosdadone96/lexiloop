// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const SCREENS=['homeScreen','goalWorkspaceScreen','examConfigScreen','modeChooserScreen','profileSetupScreen','levelScreen','loadingScreen','examScreen','resultsScreen','mistakeReviewScreen','flashcardScreen','vocabExamScreen'];
function show(id){document.getElementById(id).style.display='block';}
function hide(id){document.getElementById(id).style.display='none';}
function hideAll(){flushOpenStudySession();SCREENS.forEach(hide);stopTimer();showExamConfigFootbar(false);showModeChooserFootbar(false);}
function goHome(){
  if(!requireAppAuth())return;
  clearVocabHubFlashcardMode();
  hideAll();
  show('homeScreen');
  setNavActive('dashboard');
  updateWorkspaceUrl(null);
  if(S.goals.length===1){
    S.activeGoalId=S.goals[0].id;
    syncGoalToProfile(S.goals[0]);
  }
  updBadges();
  updQuotaUI();
  renderHomeScreen();
  window.scrollTo({top:0,behavior:'smooth'});
}
async function selectSubject(s){if(!requireAppAuth())return;S.subject=s;if(S.mode==='practice')S.vocabLang=typeof SubjectMeta!=='undefined'?SubjectMeta.vocabLang(s):(s==='de'?'en':'es');hideAll();show('levelScreen');renderLevels();if(typeof ExamLibrary!=='undefined'&&ExamLibrary.discoverLevels){try{await ExamLibrary.discoverLevels(s);}catch(_){}}renderLevels();updQuotaUI();window.scrollTo({top:0,behavior:'smooth'});}
function goFlashcards(clearGoalFilter){
  const goal=getActiveGoal()||S.goals[0];
  if(goal){
    if(clearGoalFilter!==false)S.deckGoalFilter=goal.subject;
    openDeckHub(goal.id);
    return;
  }
  hideAll();show('flashcardScreen');
  S.deckGoalFilter=null;
  renderDeckHub();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goHistory(){
  const goal=getActiveGoal()||S.goals[0];
  if(goal){openGoalWorkspace(goal.id,'progress');return;}
  goHome();
}
function backFromLevelScreen(){
  const goal=getActiveGoal();
  if(goal)openGoalWorkspace(goal.id,'exams');
  else goHome();
}
function renderLevels(){
  const ey=document.getElementById('lvlEyebrow');
  if(ey)ey.textContent=typeof SubjectMeta!=='undefined'?SubjectMeta.eyebrow(S.subject):(S.subject==='de'?'Goethe-Institut · A1–C2':'Cambridge CEFR · A1–C2');
  document.getElementById('levelsGrid').innerHTML=LEVELS[S.subject].map(l=>`<div class="level-card" id="lc_${l.code}" onclick="pickLevel('${l.code}')"><div class="lc-code">${l.code}</div><div class="lc-name">${l.name}</div><div class="lc-desc">${l.desc}</div><div class="lc-time">⏱ ${l.time} min</div></div>`).join('');
  S.level=null;
  document.getElementById('btnStart').disabled=true;
}
function pickLevel(c){
  S.level=c;
  if(typeof ExamProfile!=='undefined'&&S.subject)ExamProfile.createProfile(S.subject,c);
  const match=S.goals.find(g=>g.subject===S.subject&&g.level===c);
  if(match){
    GoalStore.setActive(match.id);
  }else{
    const sameSub=S.goals.find(g=>g.subject===S.subject);
    if(sameSub){
      sameSub.level=c;
      GoalStore.applyContext(sameSub);
      GoalStore.save();
      GoalStore.ensureSlugs();
    }else if(!S.goals.length){
      try{localStorage.setItem('lc_goal',JSON.stringify({subject:S.subject,level:c}));}catch(e){}
    }
  }
  document.querySelectorAll('.level-card').forEach(x=>x.classList.remove('selected'));
  document.getElementById('lc_'+c)?.classList.add('selected');
  document.getElementById('btnStart').disabled=!canGenerate();
  renderCoachDashboard();
  const demoBtn=document.getElementById('btnDemo');
  if(demoBtn)demoBtn.style.display='none';
}
function selectMode(m){
  S.mode=normalizeMode(m);
  if(S.mode==='practice')S.vocabLang=vocabLangFor(S.subject);
  const off=document.getElementById('modeOfficial');
  const pr=document.getElementById('modePractice');
  if(off)off.classList.toggle('selected',S.mode==='official');
  if(pr)pr.classList.toggle('selected',S.mode==='practice');
}
