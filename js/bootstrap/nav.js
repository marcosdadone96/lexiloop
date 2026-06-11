// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const SCREENS=['homeScreen','goalWorkspaceScreen','examConfigScreen','oralPracticeScreen','profileSetupScreen','loadingScreen','examScreen','resultsScreen','mistakeReviewScreen','flashcardScreen','vocabExamScreen'];
function getActiveScreenId(){
  for(const id of SCREENS){
    const el=document.getElementById(id);
    if(el&&el.style.display==='block')return id;
  }
  return null;
}
function _navExitVocabFlashcards(){
  if(typeof _vocabHub!=='undefined'){
    _vocabHub.activity=null;
    _vocabHub.flashcardMode=false;
  }
  if(typeof refreshVocabHubPanel==='function')refreshVocabHubPanel();
  window.scrollTo({top:0,behavior:'smooth'});
}
function _navCleanupDeckHub(){
  if(typeof clearVocabHubFlashcardMode==='function')clearVocabHubFlashcardMode();
  if(S.fcSelected)S.fcSelected.clear();
  S.deckGoalFilter=null;
}
function resolveNavBack(){
  const screen=getActiveScreenId();
  if(screen==='goalWorkspaceScreen'&&typeof _vocabHub!=='undefined'&&_vocabHub.activity==='flashcards'){
    return{label:'Vocabulary',go:_navExitVocabFlashcards};
  }
  if(screen==='goalWorkspaceScreen'){
    return{label:'Dashboard',go:goHome};
  }
  if(screen==='examConfigScreen'){
    return{label:'Exams',go(){
      showExamConfigFootbar(false);
      const gid=typeof _examConfig!=='undefined'?_examConfig.goalId:null;
      if(gid&&typeof openGoalWorkspace==='function')openGoalWorkspace(gid,'exams');
      else goHome();
    }};
  }
  if(screen==='oralPracticeScreen'){
    return{label:'Exams',go(){
      const gid=typeof _oralSession!=='undefined'?_oralSession.goalId:null;
      if(gid&&typeof openGoalWorkspace==='function')openGoalWorkspace(gid,'exams');
      else if(typeof backToWorkspace==='function')backToWorkspace('exams');
      else goHome();
    }};
  }
  if(screen==='flashcardScreen'){
    if(S.deckGoalFilter&&S.activeGoalId){
      return{label:'Vocabulary',go(){
        _navCleanupDeckHub();
        openGoalWorkspace(S.activeGoalId,'vocabulary');
      }};
    }
    return{label:'Dashboard',go(){
      _navCleanupDeckHub();
      goHome();
    }};
  }
  if(screen==='mistakeReviewScreen'){
    return{label:'Progress',go(){backToWorkspace('progress');}};
  }
  if(screen==='resultsScreen'){
    return{label:'Exams',go(){backToWorkspace('exams');}};
  }
  if(screen==='vocabExamScreen'){
    if(typeof _vocabHub!=='undefined'&&_vocabHub.veFromVocab){
      return{label:'Vocabulary',go(){
        _vocabHub.veFromVocab=false;
        const id=S.activeGoalId;
        if(id)openGoalWorkspace(id,'vocabulary');
        else goHome();
      }};
    }
    return{label:'Deck',go(){goFlashcards();}};
  }
  if(screen==='profileSetupScreen'){
    return{label:'Dashboard',go:goHome};
  }
  return{label:'Dashboard',go:goHome};
}
function navBackLabel(){
  return resolveNavBack().label;
}
function navBack(){
  resolveNavBack().go();
}
function renderNavBackBtn(label){
  const lbl=label||navBackLabel();
  return'<button type="button" class="back-btn nav-back-btn" onclick="navBack()">← '+esc(lbl)+'</button>';
}
function syncWorkspaceBackBtn(){
  const wsBack=document.querySelector('#goalWorkspaceScreen > .nav-back-btn');
  if(!wsBack)return;
  const hide=typeof _vocabHub!=='undefined'&&_vocabHub.activity==='flashcards';
  wsBack.style.display=hide?'none':'';
}
function syncNavBackLabels(){
  const screen=getActiveScreenId();
  if(!screen)return;
  const root=document.getElementById(screen);
  if(!root)return;
  const lbl=navBackLabel();
  root.querySelectorAll('.nav-back-btn').forEach(btn=>{btn.textContent='← '+lbl;});
  if(screen==='goalWorkspaceScreen'){
    syncWorkspaceBackBtn();
    const panel=document.getElementById('wsPanelVocabulary');
    if(panel&&typeof _vocabHub!=='undefined'&&_vocabHub.activity==='flashcards'){
      panel.querySelectorAll('.nav-back-btn').forEach(btn=>{btn.textContent='← Vocabulary';});
    }
  }
}
function show(id){
  document.getElementById(id).style.display='block';
  syncNavBackLabels();
}
function hide(id){document.getElementById(id).style.display='none';}
function hideAll(){flushOpenStudySession();SCREENS.forEach(hide);stopTimer();showExamConfigFootbar(false);}
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
function setExamMode(m){
  S.mode=normalizeMode(m);
  if(S.mode==='practice')S.vocabLang=vocabLangFor(S.subject);
}
