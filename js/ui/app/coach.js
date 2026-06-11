function updBadges(){
  const fc=getProfileFlashcards();
  const due=fc.filter(f=>isDue(f)).length;
  const fcLbl=fc.length+(fc.length===1?' word':' words');
  const b=document.getElementById('fcCountBadge');if(b)b.textContent=fcLbl;
  const dt=document.getElementById('fcTabDue');if(dt)dt.textContent='Due for Review'+(due?` (${due})`:'');
  renderProfileBar();renderCoachDashboard();
  const home=document.getElementById('homeScreen');
  const ws=document.getElementById('goalWorkspaceScreen');
  if(home?.style.display==='block')renderHomeScreen();
  else if(ws?.style.display==='block')renderGoalWorkspace();
}
function getPreparingFor(){
  if(typeof ExamProfile!=='undefined'){const l=ExamProfile.getActiveLabel();if(l!=='Choose your exam')return l;}
  if(S.subject&&S.level)return certLbl(S.subject,S.level);
  const hist=getProfileHistory();
  if(hist.length){const h=hist[0];return certLbl(h.lang,h.level);}
  return 'Choose your exam';
}
function getWeakAreas(){
  const topicScores={};
  getProfileHistory().forEach(h=>{if(!h.topic)return;(topicScores[h.topic]=topicScores[h.topic]||[]).push(h.score);});
  const weak=Object.entries(topicScores).map(([topic,scores])=>({topic,avg:scores.reduce((a,b)=>a+b,0)/scores.length})).filter(x=>x.avg<70).sort((a,b)=>a.avg-b.avg).slice(0,3).map(x=>x.topic);
  if(weak.length)return weak;
  const dueWords=getProfileFlashcards().filter(f=>isDue(f)).slice(0,3).map(f=>f.word);
  if(dueWords.length)return dueWords;
  return [];
}
function getScoreTrend(){
  const hist=getProfileHistory();
  if(hist.length<2)return null;
  const a=hist[0].score,b=hist[1].score;
  return a-b;
}
function workspaceAction(tab,fn){
  return ()=>{
    const goal=getActiveGoal()||S.goals[0];
    if(!goal){showAddGoalWizard();return;}
    openGoalWorkspace(goal.id,tab);
    if(fn)fn(goal);
  };
}
function getRecommendedActionForGoal(goal){
  if(!goal)return{title:'Set your first exam goal',desc:'Choose the certification you are preparing for.',cta:'Add goal →',run:()=>showAddGoalWizard()};
  const fc=deckForGoal(goal);
  const hist=historyForGoal(goal);
  const due=dueForGoal(goal).length;
  if(due>=3)return{title:'Review due flashcards',desc:due+' words need review before your next exam.',cta:'Review now →',run:()=>{prepGoalContext(goal);openGoalWorkspace(goal.id,'vocabulary');openDeckHub(goal.id);setFcTab('due');}};
  if(fc.length>=5)return{title:'Take a personalized exam',desc:'Built from '+fc.length+' words in your deck.',cta:'Generate exam →',run:()=>{prepGoalContext(goal);openGoalWorkspace(goal.id,'exams');openExamConfigurator(goal.id);}};
  if(!hist.length)return{title:'Take your first mock exam',desc:'Start with a realistic '+goalLabel(goal)+' practice test.',cta:'Start now →',run:()=>{prepGoalContext(goal);openGoalWorkspace(goal.id,'exams');launchGoalExam('official',{goalId:goal.id});}};
  const last=hist[0];
  if(typeof QuestionLibrary!=='undefined'&&QuestionLibrary.hasLibrary(goal.subject,goal.level)&&typeof AnalyticsStore!=='undefined'&&AnalyticsStore.getWeakGrammarTags(goal,1).length){
    const tag=AnalyticsStore.getWeakGrammarTags(goal,1)[0];
    return{title:'Target your weakest grammar',desc:'Focus on '+tag.replace(/^g-[^-]+-[^-]+-/,'')+'.',cta:'Weakness exam →',run:()=>{prepGoalContext(goal);generateWeaknessExam(goal.id);}};
  }
  if(last.score<70)return{title:'Practice your weak areas',desc:'Last score: '+last.score+'% on '+last.topic+'.',cta:'Practice again →',run:()=>{prepGoalContext(goal);openGoalWorkspace(goal.id,'exams');launchGoalExam('practice',{goalId:goal.id});}};
  return{title:'Take a mock exam',desc:'Keep your momentum — you are improving steadily.',cta:'Start exam →',run:()=>{prepGoalContext(goal);openGoalWorkspace(goal.id,'exams');launchGoalExam('official',{goalId:goal.id});}};
}
function getRecommendedAction(){
  return getRecommendedActionForGoal(getActiveGoal()||S.goals[0]);
}
let _coachAction=null;
function renderCoachDashboard(){
  const activeGoal=dashboardGoal();
  const histLen=activeGoal?historyForGoal(activeGoal).length:getProfileHistory().length;
  const weakEl=document.getElementById('coachWeakAreas');
  if(weakEl){
    const areas=activeGoal?getWeakAreasForGoal(activeGoal):getWeakAreas();
    weakEl.innerHTML=areas.length?areas.map(a=>'<li>'+esc(a)+'</li>').join(''):'<li class="weak-empty">Complete a practice exam to identify weak areas</li>';
  }
  const act=activeGoal?getRecommendedActionForGoal(activeGoal):getRecommendedAction();_coachAction=act.run;
  const t=document.getElementById('coachActionTitle');if(t)t.textContent=act.title;
  const d=document.getElementById('coachActionDesc');if(d)d.textContent=act.desc;
  const c=document.getElementById('coachActionCta');if(c)c.textContent=act.cta;
  const se=document.getElementById('coachStatExams');if(se)se.textContent=histLen;
  const sv=document.getElementById('coachStatVocab');if(sv)sv.textContent=activeGoal?deckForGoal(activeGoal).length:getProfileFlashcards().length;
  const st=document.getElementById('coachStatTrend');
  if(st){const tr=getScoreTrend();if(tr===null)st.textContent='—';else{st.textContent=(tr>=0?'+':'')+tr+'%';st.classList.toggle('up',tr>=0);}}
}
function runRecommendedAction(){if(_coachAction)_coachAction();}
function setNavActive(section){
  document.querySelectorAll('.app-nav__item[data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===section));
}
function startMockExam(mode){
  const goal=getActiveGoal()||S.goals[0];
  if(goal){launchGoalExam(mode||S.mode||'official',{goalId:goal.id});return;}
  showAddGoalWizard();
}
