const _examConfig={goalId:null,selectedIds:new Set(),skills:new Set(['lesen','horen']),step:1};
function showExamConfigFootbar(visible){
  const fb=document.getElementById('examConfigFootbar');
  if(fb)fb.style.display=visible?'flex':'none';
}
function openExamConfigurator(goalId,preselectedIds){
  const goal=S.goals.find(g=>g.id===goalId);
  if(!goal)return;
  S.activeGoalId=goalId;
  syncGoalToProfile(goal);
  saveGoals();
  _examConfig.goalId=goalId;
  _examConfig.skills=new Set(['lesen','horen']);
  _examConfig.step=1;
  _examConfig.selectedIds=new Set();
  const deck=deckForGoal(goal);
  if(preselectedIds&&preselectedIds.length){
    preselectedIds.forEach(id=>{if(deck.some(f=>fcId(f)===id))_examConfig.selectedIds.add(id);});
  }
  if(_examConfig.selectedIds.size<4){
    deck.forEach(f=>{if(isDue(f))_examConfig.selectedIds.add(fcId(f));});
    if(_examConfig.selectedIds.size<4)deck.forEach(f=>_examConfig.selectedIds.add(fcId(f)));
  }
  hideAll();
  show('examConfigScreen');
  showExamConfigFootbar(true);
  renderExamConfigurator();
  window.scrollTo({top:0,behavior:'smooth'});
}
function backFromExamConfig(){
  showExamConfigFootbar(false);
  _examConfig.step=1;
  if(_examConfig.goalId)openGoalWorkspace(_examConfig.goalId,'vocabulary');
  else goHome();
}
function examConfigNavBack(){
  if(_examConfig.step===2){_examConfig.step=1;renderExamConfigurator();return;}
  backFromExamConfig();
}
function examConfigFootAction(){
  if(_examConfig.step===1){
    if(_examConfig.skills.size<1){lcToast('Select at least one exam part.','warn');return;}
    _examConfig.step=2;
    renderExamConfigurator();
    return;
  }
  submitExamConfig();
}
function toggleConfigWord(id){
  if(_examConfig.selectedIds.has(id))_examConfig.selectedIds.delete(id);
  else _examConfig.selectedIds.add(id);
  renderExamConfigurator();
}
function selectAllDueConfig(){
  const goal=S.goals.find(g=>g.id===_examConfig.goalId);
  if(!goal)return;
  deckForGoal(goal).forEach(f=>{if(isDue(f))_examConfig.selectedIds.add(fcId(f));});
  renderExamConfigurator();
}
function toggleConfigSkill(skill){
  if(skill==='schreiben'||skill==='sprechen')return;
  if(_examConfig.skills.has(skill)){
    if(_examConfig.skills.size<=1)return;
    _examConfig.skills.delete(skill);
  }else _examConfig.skills.add(skill);
  renderExamConfigurator();
}
function configSkillSummary(skills,subject){
  const ui=typeof examUiStrings==='function'?examUiStrings(subject==='de'?'de':subject==='es'?'es':'en'):{reading:'Reading',listening:'Listening',writing:'Writing',speaking:'Speaking'};
  const parts=[];
  if(skills.has('lesen'))parts.push(ui.reading);
  if(skills.has('horen'))parts.push(ui.listening);
  if(skills.has('schreiben'))parts.push(ui.writing);
  if(skills.has('sprechen'))parts.push(ui.speaking);
  return parts.join(' + ')||'—';
}
function estimateConfigQuestions(nWords,nSkills){
  return Math.max(4,nWords*nSkills);
}
function renderExamConfigurator(){
  const goal=S.goals.find(g=>g.id===_examConfig.goalId);
  const el=document.getElementById('examConfigContent');
  if(!goal||!el)return;
  const isDE=goal.subject==='de';
  const isES=goal.subject==='es';
  const ui=typeof examUiStrings==='function'?examUiStrings(isDE?'de':isES?'es':'en'):{reading:'Reading',listening:'Listening',writing:'Writing',speaking:'Speaking'};
  const deck=deckForGoal(goal);
  const dueN=dueForGoal(goal).length;
  const selN=_examConfig.selectedIds.size;
  const step=_examConfig.step||1;
  const backLbl=document.getElementById('examConfigBackBtn');
  if(backLbl)backLbl.innerHTML=(step===2?'← Back':'← ')+esc(step===2?'Choose part':goalLabel(goal));
  const stepsBar='<div class="exam-config-steps"><span class="exam-config-step'+(step===1?' on':'')+'">1 · Exam part</span><span class="exam-config-step'+(step===2?' on':'')+'">2 · Words</span></div>';
  const partCard=(key,title,sub)=>{
    const on=_examConfig.skills.has(key);
    return'<div class="exam-config-part-card'+(on?' on':'')+'" onclick="toggleConfigSkill(\''+key+'\')"><span class="n">'+esc(title)+'<small>'+esc(sub)+'</small></span><span class="tk"></span></div>';
  };
  let body='';
  if(step===1){
    body=`
    <h1 class="exam-config-h1">What do you want to build?</h1>
    <p class="exam-config-lede">Choose one or more parts for your <b>${esc(goalLabel(goal))}</b> personalized exam.</p>
    ${partCard('lesen',ui.reading,'Reading comprehension with your vocabulary')}
    ${partCard('horen',ui.listening,'Listening tasks with your vocabulary')}
    <p class="exam-config-hint">Grammar gap-fill and writing prompts are not available for personalized exams yet.</p>`;
  }else{
    const chips=deck.map(f=>{
      const id=fcId(f);
      const on=_examConfig.selectedIds.has(id);
      const due=isDue(f);
      return'<span class="exam-config-chip'+(on?' on':'')+'" onclick="toggleConfigWord(\''+esc(id)+'\')"><span class="tk">'+(on?'✓':'')+'</span>'+(due?'<span class="due-dot"></span>':'')+esc(f.word)+'</span>';
    }).join('');
    const chipsHtml=deck.length?'<div class="exam-config-chips">'+chips+'</div><p class="exam-config-hint">● amber dot = due for review today</p>':'<p class="exam-config-hint">No words in this deck yet. Save words during a practice exam first.</p>';
    const skillLbl=configSkillSummary(_examConfig.skills,goal.subject);
    body=`
    <h1 class="exam-config-h1">Your word selection</h1>
    <p class="exam-config-lede">Parts: <b>${esc(skillLbl)}</b>. Tap words to add or remove.</p>
    <p class="exam-config-seclbl"><span>Words to include · ${selN} selected</span>${dueN>0?'<button type="button" class="exam-config-cta" onclick="selectAllDueConfig()">Select all due ('+dueN+') →</button>':''}</p>
    <div class="exam-config-panel">${chipsHtml}</div>`;
  }
  el.innerHTML=stepsBar+body;
  const summary=document.getElementById('examConfigSummary');
  const genBtn=document.getElementById('examConfigGenerateBtn');
  const skillLbl=configSkillSummary(_examConfig.skills,goal.subject);
  const qEst=estimateConfigQuestions(selN,_examConfig.skills.size);
  if(summary){
    if(step===1)summary.innerHTML=esc(skillLbl)+' · pick at least one part';
    else summary.innerHTML='<b>'+selN+' word'+(selN===1?'':'s')+'</b> · '+esc(skillLbl)+' · ~'+qEst+' questions';
  }
  if(genBtn){
    if(step===1){
      genBtn.disabled=_examConfig.skills.size<1;
      genBtn.textContent='Continue →';
    }else{
      genBtn.disabled=selN<4||_examConfig.skills.size<1||!canGenerate();
      genBtn.textContent=canGenerate()?'Generate exam →':'Quota used — upgrade';
    }
  }
}
function submitExamConfig(){
  const goal=S.goals.find(g=>g.id===_examConfig.goalId);
  if(!goal)return;
  const words=deckForGoal(goal).filter(f=>_examConfig.selectedIds.has(fcId(f))).map(f=>f.word);
  const skills=[..._examConfig.skills];
  if(words.length<4){lcToast('Select at least 4 words.','warn');return;}
  if(skills.length<1){lcToast('Select at least one skill.','warn');return;}
  if(!canGenerate()){showUpgrade();return;}
  showExamConfigFootbar(false);
  generatePersonalExam(words,skills,_examConfig.goalId);
}
const _modeChooser={goalId:null,mode:'official'};
function showModeChooserFootbar(visible){
  const fb=document.getElementById('modeChooserFootbar');
  if(fb)fb.style.display=visible?'flex':'none';
}
function openModeChooser(goalId){
  const goal=S.goals.find(g=>g.id===goalId);
  if(!goal)return;
  S.activeGoalId=goalId;
  syncGoalToProfile(goal);
  saveGoals();
  _modeChooser.goalId=goalId;
  _modeChooser.mode='official';
  hideAll();
  show('modeChooserScreen');
  showModeChooserFootbar(true);
  renderModeChooser();
  window.scrollTo({top:0,behavior:'smooth'});
}
function backFromModeChooser(){
  showModeChooserFootbar(false);
  if(_modeChooser.goalId)openGoalWorkspace(_modeChooser.goalId,'exams');
  else goHome();
}
function selectModeChooser(mode){
  _modeChooser.mode=mode;
  renderModeChooser();
}
function renderModeChooser(){
  const goal=S.goals.find(g=>g.id===_modeChooser.goalId);
  const el=document.getElementById('modeChooserContent');
  if(!goal||!el)return;
  const isDE=goal.subject==='de';
  const m=_modeChooser.mode;
  const back=document.getElementById('modeChooserBackBtn');
  if(back)back.innerHTML='← '+esc(goalLabel(goal));
  const exWord=isDE?'Maßnahmen':'measures';
  const exLine=isDE
    ?`Die <span class="vocab-word vocab-marked">${exWord}</span> zur Nachhaltigkeit seien noch nicht ausreichend.`
    :`The <span class="vocab-word vocab-marked">${exWord}</span> for sustainability are still not sufficient.`;
  el.innerHTML=`
    <h1 class="exam-config-h1" style="margin-bottom:14px">Take a practice exam — choose your mode</h1>
    <div class="mode-ex-grid" style="margin-bottom:18px">
      <div class="mode-opt${m==='official'?' sel':''}" onclick="selectModeChooser('official')">
        <div class="mode-opt-top"><h3>Official mode</h3><span class="mode-opt-dot"></span></div>
        <ul><li>Timer running, like an official sitting</li><li>No translations, no hints</li><li>Tap words to mark them — reviewed after</li></ul>
      </div>
      <div class="mode-opt${m==='practice'?' sel':''}" onclick="selectModeChooser('practice')">
        <div class="mode-opt-top"><h3>Practice mode</h3><span class="mode-opt-dot"></span></div>
        <ul><li>No timer, study at your pace</li><li>Tap a word for instant translation</li><li>Saves straight to your deck</li></ul>
      </div>
    </div>
    <p class="exam-config-seclbl">Same question · how each mode behaves</p>
    <div class="mode-ex-grid">
      <div class="mode-ex off">
        <div class="mode-ex-h"><span>OFFICIAL</span><span class="timer-val" style="font-size:12px">28:14</span></div>
        <div class="mode-ex-b">
          <p class="mode-ex-q">${exLine}</p>
          <div class="mode-markmsg">"${exWord}" marked — reviewed &amp; saved on the results screen. No translation now.</div>
        </div>
      </div>
      <div class="mode-ex prac">
        <div class="mode-ex-h"><span>PRACTICE</span><span style="font-size:10px;color:var(--text3)">No timer</span></div>
        <div class="mode-ex-b">
          <p class="mode-ex-q">Die <span class="vocab-word vocab-saved">${exWord}</span> zur Nachhaltigkeit…</p>
          <div class="mode-pop"><div class="mode-pop-w">${exWord}</div><div class="mode-pop-t">${isDE?'Maßnahmen, Schritte':'measures, steps'}</div><div class="mode-pop-s">✓ Saved to your deck</div></div>
        </div>
      </div>
    </div>`;
  const sum=document.getElementById('modeChooserSummary');
  const hasOfficial=!!(S._officialInProgress?.examData);
  if(sum){
    sum.innerHTML=m==='official'&&hasOfficial
      ?'Starting in <b>Official mode</b> · a timed exam in progress will be ended'
      :`Starting in <b>${m==='official'?'Official':'Practice'} mode</b>`;
  }
}
async function startExamFromModeChooser(){
  const goal=S.goals.find(g=>g.id===_modeChooser.goalId);
  if(!goal)return;
  if(!canGenerate()){showUpgrade();return;}
  const mode=_modeChooser.mode;
  if(mode==='official')abortOfficialInProgress();
  S.mode=mode;
  S.subject=goal.subject;
  S.level=goal.level;
  syncGoalToProfile(goal);
  if(mode==='practice')S.vocabLang=vocabLangFor(goal.subject);
  selectMode(mode);
  initExamSession(mode);
  showModeChooserFootbar(false);
  await generateExam();
}
function openDeckHub(goalId,options){
  const goal=S.goals.find(g=>g.id===goalId);
  if(!goal)return;
  const fromVocabHub=!!(options&&options.fromVocabHub);
  if(!fromVocabHub){
    clearVocabHubFlashcardMode();
    S.fcSelected.clear();
  }
  S.activeGoalId=goalId;
  S.deckGoalFilter=goal.subject;
  S.fcSingleIdx=0;
  S.fcSingleFlipped=false;
  syncGoalToProfile(goal);
  saveGoals();
  hideAll();
  show('flashcardScreen');
  renderDeckHub();
  window.scrollTo({top:0,behavior:'smooth'});
}
function backFromDeckHub(){
  const id=S.activeGoalId;
  clearVocabHubFlashcardMode();
  S.fcSelected.clear();
  S.deckGoalFilter=null;
  if(id)openGoalWorkspace(id,'vocabulary');
  else goHome();
}
function renderDeckHub(){
  const inHub=!!S.deckGoalFilter;
  const goal=getActiveGoal();
  const nav=document.getElementById('fcHubNav');
  const head=document.getElementById('fcHubHeader');
  const ways=document.getElementById('fcHubWays');
  const wordsLbl=document.getElementById('fcHubWordsLbl');
  const foot=document.getElementById('fcHubFootnote');
  const legacy=document.getElementById('fcLegacyTop');
  if(nav)nav.style.display=inHub?'block':'none';
  if(head)head.style.display=inHub?'block':'none';
  if(ways)ways.style.display='none';
  if(wordsLbl)wordsLbl.style.display=inHub?'block':'none';
  if(foot)foot.style.display=inHub?'block':'none';
  if(legacy)legacy.style.display=inHub?'none':'block';
  const es=document.getElementById('fcExamSec');
  const ps=document.getElementById('fcPersonalSec');
  if(es)es.style.display=inHub?'none':(getDeckViewCards().length>0?'block':'none');
  if(ps)ps.style.display=inHub?'none':(getDeckViewCards().length>0?'block':'none');
  if(!inHub||!goal){renderFC(false);return;}
  const lbl=document.getElementById('fcHubBackLbl');
  if(lbl)lbl.textContent=goalLabel(goal);
  const title=document.getElementById('fcHubTitle');
  if(title)title.textContent='Your difficult words — '+goalLabel(goal);
  const deck=deckForGoal(goal);
  const due=dueForGoal(goal).length;
  const ctx=document.getElementById('fcHubCtx');
  if(ctx)ctx.innerHTML=deck.length+' word'+(deck.length===1?'':'s')+' saved'+(due>0?' · <b>'+due+' due for review today</b>':'');
  if(ways){
    const dueBadge=due>0?`<span class="badge-due">${due} due</span>`:'';
    ways.innerHTML=`
      <div class="deck-way${due>0?' accent':''}" onclick="setFcTab('study')">
        <h3>Flashcards ${dueBadge}</h3>
        <p>Spaced-repetition review. Rate each word and we schedule the next.</p>
        <span class="deck-way-cta">Review due →</span>
      </div>
      <div class="deck-way">
        <h3>Quiz</h3>
        <p>Multiple-choice on your words. Text or audio. Updates your review schedule.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button type="button" class="btn-sm accent" onclick="deckHubStartQuiz(false)">Text quiz →</button>
          <button type="button" class="btn-sm" onclick="deckHubStartQuiz(true)">🔊 Audio quiz</button>
        </div>
      </div>
      <div class="deck-way soon">
        <h3>Words in sentences <span class="badge-soon">Soon</span></h3>
        <p>Fill the gap or write your own sentence, checked by AI.</p>
      </div>
      <div class="deck-way soon">
        <h3>Match game <span class="badge-soon">Soon</span></h3>
        <p>Pair words with meanings against the clock.</p>
      </div>`;
  }
  if(foot){
    const other=goal.subject==='de'?'Cambridge':'Goethe';
    foot.textContent='Flashcards and quiz work today. Sentences and the match game are in development. This deck shows only your '+goalLabel(goal)+' words — your '+other+' words live in that goal\'s deck.';
  }
  const ta=document.getElementById('fcTabAll');
  const td=document.getElementById('fcTabDue');
  if(ta)ta.textContent='All · '+deck.length;
  if(td)td.textContent='Due · '+due;
  renderFC(false);
}
function deckHubStartQuiz(audio){
  const deck=getDeckViewCards();
  if(deck.length<4){lcToast('You need at least 4 words in this deck for a quiz.','warn');return;}
  ensureFcIds();
  S.fcSelected.clear();
  deck.forEach(f=>S.fcSelected.add(fcId(f)));
  startVE(audio);
}
function renderProfileBar(){
  const el=document.getElementById('profileBarExam');
  const demo=document.getElementById('profileBarDemo');
  const goal=getActiveGoal();
  const onWs=document.getElementById('goalWorkspaceScreen')?.style.display==='block';
  if(el){
    if(onWs&&goal)el.textContent=goalLabel(goal);
    else el.textContent=typeof ExamProfile!=='undefined'?ExamProfile.getActiveLabel():getPreparingFor();
  }
  if(demo)demo.style.display='none';
}
function showProfileSetup(){
  hideAll();show('profileSetupScreen');S.profileCert=S.subject||null;S.profileLevel=S.level||null;
  document.querySelectorAll('#profileCertGrid .setup-card').forEach(c=>c.classList.toggle('selected',c.dataset.subject===S.profileCert));
  renderProfileSwitcher();renderProfileLevelGrid();window.scrollTo({top:0,behavior:'smooth'});
}
function renderProfileSwitcher(){
  const box=document.getElementById('profileSwitcher');
  if(!box||typeof ExamProfile==='undefined')return;
  const profiles=ExamProfile.getProfiles();
  if(profiles.length<2){box.style.display='none';box.innerHTML='';return;}
  const active=ExamProfile.getActiveId();
  box.style.display='block';
  box.innerHTML=`<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">Your exam profiles</div>
    <div class="profile-switch-list">${profiles.map(p=>`<div class="profile-switch-item${p.id===active?' active':''}" onclick="switchExamProfile('${p.id}')"><div><div class="profile-switch-item__label">${esc(p.label)}</div><div class="profile-switch-item__meta">${p.id===active?'Active profile':'Switch to this profile'}</div></div><span style="font-size:11px;font-weight:700;color:var(--accent)">${p.id===active?'✓':''}</span></div>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin:18px 0 10px">Or add another certification</div>`;
}
function switchExamProfile(id){
  if(typeof ExamProfile==='undefined')return;
  ExamProfile.setActiveProfile(id);
  const p=ExamProfile.getActive();
  if(p){S.subject=p.subject;S.level=p.level;}
  updBadges();goHome();lcToast('Switched to '+ExamProfile.getActiveLabel(),'success');
}
function selectProfileCert(sub,el){
  S.profileCert=sub;document.querySelectorAll('#profileCertGrid .setup-card').forEach(c=>c.classList.remove('selected'));
  if(el)el.classList.add('selected');renderProfileLevelGrid();
}
function renderProfileLevelGrid(){
  const grid=document.getElementById('profileLevelGrid');
  const btn=document.getElementById('btnProfileSave');
  if(!grid||!S.profileCert)return;
  grid.innerHTML=LEVELS[S.profileCert].map(l=>`<div class="level-card${S.profileLevel===l.code?' selected':''}" onclick="selectProfileLevel('${l.code}')"><div class="lc-code">${l.code}</div><div class="lc-name">${l.name}</div></div>`).join('');
  if(btn)btn.disabled=!S.profileLevel;
}
function selectProfileLevel(code){
  S.profileLevel=code;renderProfileLevelGrid();
}
function saveExamProfile(){
  if(!S.profileCert||!S.profileLevel)return;
  if(typeof ExamProfile!=='undefined')ExamProfile.createProfile(S.profileCert,S.profileLevel);
  S.subject=S.profileCert;S.level=S.profileLevel;
  goHome();lcToast('Preparing for '+ExamProfile.getActiveLabel(),'success');
}
function userMenuProfile(){closeUserMenu();showProfileSetup();}
