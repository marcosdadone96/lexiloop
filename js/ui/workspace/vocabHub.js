// ═══════════════════════════════════════════
// EXAM GOALS
// ═══════════════════════════════════════════
function clearVocabHubFlashcardMode(){
  if(typeof _vocabHub!=='undefined'){
    _vocabHub.flashcardMode=false;
    _vocabHub.activity=null;
    _vocabHub.veFromVocab=false;
  }
}
function exitVocabHubFlashcards(){
  _vocabHub.activity=null;
  _vocabHub.flashcardMode=false;
  refreshVocabHubPanel();
  window.scrollTo({top:0,behavior:'smooth'});
}
function backFromVocabQuiz(){
  _vocabHub.veFromVocab=false;
  const id=S.activeGoalId;
  if(id)openGoalWorkspace(id,'vocabulary');
  else goHome();
}
function setVocabHubFcLang(code,btn){
  S.fcLang=code;
  document.querySelectorAll('#vvFcLangBtns .vt-lb').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderFcSingleView();
}
/** Deck view: when S.deckGoalFilter is set (goal hub), only that language; else ExamProfile filter. Used by renderFC, getSelectedFC, startVE, select*FC. */
function getDeckViewCards(){
  if(S.deckGoalFilter)return(S.flashcards||[]).filter(f=>f.sourceLang===S.deckGoalFilter);
  return typeof ExamProfile!=='undefined'?ExamProfile.filterList(S.flashcards):S.flashcards;
}
function readinessQualLabel(pct){
  if(pct<25)return 'early days';
  if(pct<50)return 'building momentum';
  if(pct<70)return 'on track';
  if(pct<85)return 'getting close';
  return 'well prepared';
}
function readinessEstLabelHtml(pct,hasData){
  if(!hasData)return 'est. <b>—</b>';
  const qual=readinessQualLabel(pct);
  return 'est. <b>'+pct+'% ready</b> · '+qual;
}
function formatGoalDateLine(goal){
  if(goal.examDate){
    const days=daysUntilExam(goal.examDate);
    if(days!==null){
      const d=Math.max(0,days);
      if(d===0)return '◷ Exam is today';
      return '◷ Exam in '+d+' day'+(d===1?'':'s');
    }
  }
  return '◷ No exam date set';
}
function goalCardActionLabel(act){
  if(/exam|mock|practice|weakness|personalized/i.test((act.title||'')+(act.cta||''))){
    return{title:'Start a practice exam',sub:'Your best next step today'};
  }
  return{title:act.title,sub:act.desc};
}
function readinessRingColor(pct){
  if(pct>=70)return'var(--green)';
  if(pct>=60)return'var(--amber,#f59e0b)';
  if(pct>=50)return'var(--orange)';
  return'var(--red)';
}
function readinessRingSvg(pct,hasData){
  const circ=226;
  const off=hasData?Math.round(circ*(1-Math.min(100,Math.max(0,pct))/100)):circ;
  const col=hasData?readinessRingColor(pct):'var(--border)';
  return'<svg width="84" height="84" aria-hidden="true"><circle cx="42" cy="42" r="36" fill="none" stroke="var(--border)" stroke-width="8"/><circle cx="42" cy="42" r="36" fill="none" stroke="'+col+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'"/></svg>';
}
function formatScoreAge(dateStr){
  if(!dateStr)return'recent';
  const d=new Date(dateStr);
  if(isNaN(d.getTime()))return String(dateStr);
  const days=Math.floor((Date.now()-d)/86400000);
  if(days<=0)return'today';
  if(days===1)return'yesterday';
  if(days<7)return days+' days ago';
  if(days<14)return'last week';
  const weeks=Math.floor(days/7);
  if(weeks<5)return weeks+' wks ago';
  return d.toLocaleDateString();
}
const _vocabHub={goalId:null,filter:'all',selectedIds:new Set(),collapsed:new Set(),expanded:new Set(),flashcardMode:false,activity:null,veFromVocab:false};
const VH_POS_ORDER=['noun','verb','adjective','adverb','other'];
const VV_SEMI_OPEN=5;
function vocabHubResolveType(fc,subject){
  if(typeof ManualVocab!=='undefined'&&ManualVocab.inferPos)return ManualVocab.inferPos(fc,subject);
  const t=typeof normWordType==='function'?normWordType(fc.type||fc.pos):'';
  return t||'other';
}
const VV_MIN_CUSTOM=4;
const VV_MIN_DRILL=4;
const VV_MIN_FLASH=1;
function fcTranslation(fc){
  if(!fc)return'';
  if(fc.translation)return fc.translation;
  if(fc.meaning)return fc.meaning;
  const tr=fc.translations&&(fc.translations[S.fcLang]||Object.values(fc.translations||{})[0]);
  return tr||'';
}
function vocabHubStruggling(deck){
  return[...deck].filter(f=>(f.missCount||0)>=1).sort((a,b)=>(b.missCount||0)-(a.missCount||0));
}
function vocabHubStrugglingCount(goal){
  return vocabHubStruggling(deckForGoal(goal)).length;
}
function vocabHubWordStatus(fc){
  if((fc.missCount||0)>=2)return'struggling';
  if(isDue(fc))return'due';
  return'learning';
}
function vocabHubFilteredDeck(goal){
  const deck=deckForGoal(goal);
  if(_vocabHub.filter==='due')return deck.filter(isDue);
  if(_vocabHub.filter==='struggling')return vocabHubStruggling(deck);
  if(_vocabHub.filter==='new')return deck.filter(f=>!f.nextReview&&(f.interval==null||f.interval<=1));
  if(_vocabHub.filter==='mastered')return deck.filter(f=>f.interval&&f.interval>7);
  if(_vocabHub.filter==='difficult')return deck.filter(f=>(f.missCount||0)>=2);
  return deck;
}
function normalizeVocabDeckPos(goal){
  if(typeof ManualVocab==='undefined'||!ManualVocab.enrichFlashcard)return;
  let dirty=false;
  deckForGoal(goal).forEach(f=>{
    const before=f.word+'|'+f.type+'|'+f.gender+'|'+f.article;
    ManualVocab.enrichFlashcard(f,goal.subject);
    const after=f.word+'|'+f.type+'|'+f.gender+'|'+f.article;
    if(before!==after)dirty=true;
  });
  if(dirty)saveFC();
}
function ensureVocabHubState(goal){
  ensureFcIds();
  if(_vocabHub.goalId!==goal.id){
    _vocabHub.goalId=goal.id;
    _vocabHub.filter='all';
    _vocabHub.selectedIds=new Set();
    _vocabHub.collapsed=new Set();
    _vocabHub.expanded=new Set();
    _vocabHub.activity=null;
    _vocabHub.flashcardMode=false;
    deckForGoal(goal).forEach(f=>_vocabHub.selectedIds.add(fcId(f)));
  }
  normalizeVocabDeckPos(goal);
}
function vocabOverviewBreakdown(goal){
  const deck=deckForGoal(goal);
  const counts={noun:0,verb:0,adjective:0,adverb:0,other:0};
  deck.forEach(f=>{
    const t=vocabHubResolveType(f,goal.subject);
    const key=VH_POS_ORDER.includes(t)?t:'other';
    counts[key]++;
  });
  const dueN=dueForGoal(goal).length;
  const parts=[];
  if(counts.noun)parts.push(counts.noun+' noun'+(counts.noun===1?'':'s'));
  if(counts.verb)parts.push(counts.verb+' verb'+(counts.verb===1?'':'s'));
  if(counts.adjective)parts.push(counts.adjective+' adjective'+(counts.adjective===1?'':'s'));
  if(counts.adverb)parts.push(counts.adverb+' adverb'+(counts.adverb===1?'':'s'));
  if(counts.other)parts.push(counts.other+' other');
  const line=parts.length?parts.join(' · '):'No words saved yet';
  return{total:deck.length,due:dueN,line};
}
function fcGenderArticle(fc,subject){
  const sub=subject||fc.sourceLang||'';
  const t=vocabHubResolveType(fc,sub);
  if(t!=='noun')return null;
  let raw=String(fc.gender||fc.article||'').toLowerCase().trim();
  if(!raw&&typeof ManualVocab!=='undefined'&&ManualVocab.parseLeadingArticle){
    const p=ManualVocab.parseLeadingArticle(fc.word,sub);
    if(p.article)raw=p.article;
  }
  if(!raw)return null;
  if(sub==='de'){
    if(raw==='m'||raw==='masc'||raw==='masculine'||raw==='der')return{article:'der',cls:'vv-art--masc'};
    if(raw==='f'||raw==='fem'||raw==='feminine'||raw==='die')return{article:'die',cls:'vv-art--fem'};
    if(raw==='n'||raw==='neut'||raw==='neuter'||raw==='neutral'||raw==='das')return{article:'das',cls:'vv-art--neut'};
    return null;
  }
  if(sub==='es'){
    if(raw==='m'||raw==='masc'||raw==='masculine'||raw==='el')return{article:'el',cls:'vv-art--masc'};
    if(raw==='f'||raw==='fem'||raw==='feminine'||raw==='la')return{article:'la',cls:'vv-art--fem'};
    return null;
  }
  return null;
}
function vocabHubGroupDeck(goal){
  const groups={noun:[],verb:[],adjective:[],adverb:[],other:[]};
  vocabHubFilteredDeck(goal).forEach(f=>{
    const t=vocabHubResolveType(f,goal.subject);
    const key=VH_POS_ORDER.includes(t)?t:'other';
    groups[key].push(f);
  });
  return groups;
}
function toggleVocabHubSection(type){
  if(_vocabHub.collapsed.has(type))_vocabHub.collapsed.delete(type);
  else _vocabHub.collapsed.add(type);
  refreshVocabHubPanel();
}
function expandVocabHubSection(type){
  _vocabHub.expanded.add(type);
  refreshVocabHubPanel();
}
function vocabHubSelectAllInSection(type){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  vocabHubGroupDeck(goal)[type].forEach(f=>_vocabHub.selectedIds.add(fcId(f)));
  refreshVocabHubPanel();
}
function vocabHubDeselectAllInSection(type){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  vocabHubGroupDeck(goal)[type].forEach(f=>_vocabHub.selectedIds.delete(fcId(f)));
  refreshVocabHubPanel();
}
function vocabHubDisplayWord(fc,subject){
  const sub=subject||fc.sourceLang||'';
  if(typeof ManualVocab!=='undefined'&&ManualVocab.parseLeadingArticle){
    const p=ManualVocab.parseLeadingArticle(fc.word,sub);
    if(p.article)return p.word;
  }
  return fc.word;
}
function vocabHubRowHtml(f,goal){
  const id=fcId(f);
  const on=_vocabHub.selectedIds.has(id);
  const tr=fcTranslation(f);
  const art=fcGenderArticle(f,goal.subject);
  const artHtml=art?'<span class="vv-art '+art.cls+'">'+esc(art.article)+'</span>':'';
  const word=vocabHubDisplayWord(f,goal.subject);
  return'<label class="vv-row"><input type="checkbox"'+(on?' checked':'')+' onchange="toggleVocabHubWord(\''+esc(id)+'\')">'+artHtml+'<span class="vv-row-word">'+esc(word)+'</span>'+(tr?'<span class="vv-row-trans">'+esc(tr)+'</span>':'')+'</label>';
}
function vocabHubSectionHtml(type,items,goal){
  if(!items.length)return'';
  const lbl=typeof fcTypeSectionLabel==='function'?fcTypeSectionLabel(type):type;
  const expanded=_vocabHub.expanded.has(type);
  const visible=expanded?items:items.slice(0,VV_SEMI_OPEN);
  const hidden=(!expanded&&items.length>VV_SEMI_OPEN)?items.length-VV_SEMI_OPEN:0;
  const rows=visible.map(f=>vocabHubRowHtml(f,goal)).join('');
  const moreBtn=hidden?'<button type="button" class="vv-more" onclick="expandVocabHubSection(\''+type+'\')">+ '+hidden+' more</button>':'';
  return'<div class="vv-grp vv-col"><div class="vv-ghead"><span class="vv-gh">'+esc(lbl)+' · '+items.length+'</span><button type="button" class="vv-selall" onclick="vocabHubSelectAllInSection(\''+type+'\')">Select all</button></div><div class="vv-rows">'+rows+'</div>'+moreBtn+'</div>';
}
function vocabHubAccordionHtml(goal){
  const groups=vocabHubGroupDeck(goal);
  const parts=VH_POS_ORDER.map(t=>vocabHubSectionHtml(t,groups[t],goal)).filter(Boolean);
  if(!parts.length)return'<p style="font-size:13px;color:var(--text3);margin:0">No words match this filter.</p>';
  return'<div class="vv-cols">'+parts.join('')+'</div>';
}
function vocabHubLegendHtml(goal){
  if(goal.subject==='de')return'<p class="vv-legend">der <b class="art-masc">blue</b> · die <b class="art-fem">red</b> · das <b class="art-neut">green</b></p>';
  if(goal.subject==='es')return'<p class="vv-legend">el <b class="art-masc">blue</b> · la <b class="art-fem">red</b></p>';
  return'';
}
function vocabHubSelNoteHtml(selN,deckLen){
  if(!deckLen)return'';
  let extra=' · all words chosen by default — untick any you don\'t need';
  if(selN<VV_MIN_CUSTOM)extra+=' · pick at least '+VV_MIN_CUSTOM+' for custom exam';
  return'<p class="vv-selnote" id="vocabHubSummary"><b>'+selN+' selected</b>'+extra+'</p>';
}
function vocabHubManualAddHtml(){
  return'<div class="vv-add"><p class="vv-add-lbl">Add a word manually</p><div class="vv-add-row">'+
    '<input class="fc-add-input" id="vvAddWord" placeholder="Word in exam language…" onkeydown="if(event.key===\'Enter\')submitManualVocab(\'hub\')" oninput="clearManualAddHint(\'hub\')">'+
    '<input class="fc-add-input" id="vvAddTrans" placeholder="Translation (if not in library)…" onkeydown="if(event.key===\'Enter\')submitManualVocab(\'hub\')">'+
    '<button type="button" class="btn-sm accent" onclick="submitManualVocab(\'hub\')" style="padding:10px 16px">+ Add</button></div>'+
    '<div id="vvAddHint" class="vv-add-hint" style="display:none"></div>'+
    '<p class="note" style="margin:10px 0 0;font-size:11px">Words are sorted into Nouns, Verbs, Adjectives, etc. Spelling is checked against the word list when available.</p></div>';
}
function vocabHubActionsHtml(selN){
  const canCustom=selN>=VV_MIN_CUSTOM;
  const canFlash=selN>=VV_MIN_FLASH;
  const canDrill=selN>=VV_MIN_DRILL;
  return'<h2 class="vv-act-title">Pick an action — applies to selected words</h2>'+
    '<div class="vv-actions">'+
      '<button type="button" class="vv-act vv-act--hero"'+(canCustom?' onclick="launchVocabHubCustomExam()"':' disabled')+'><span class="vv-act-icon" aria-hidden="true">✦</span><span class="vv-act-name">Custom exam</span><span class="vv-act-desc">From your words</span></button>'+
      '<button type="button" class="vv-act"'+(canFlash?' onclick="launchVocabHubFlashcards()"':' disabled')+'><span class="vv-act-icon" aria-hidden="true">▭</span><span class="vv-act-name">Flashcards</span><span class="vv-act-desc">Spaced review</span></button>'+
      '<button type="button" class="vv-act"'+(canDrill?' onclick="launchVocabHubQuickDrill()"':' disabled')+'><span class="vv-act-icon" aria-hidden="true">⚡</span><span class="vv-act-name">Quick drill</span><span class="vv-act-desc">Fast quiz</span></button>'+
    '</div>'+
    '<div class="vv-actions vv-actions--soon">'+
      '<div class="vv-act vv-act--soon" aria-disabled="true"><span class="vv-act-name">Games <span class="vv-soon-badge">Soon</span></span></div>'+
      '<div class="vv-act vv-act--soon" aria-disabled="true"><span class="vv-act-name">Phrases <span class="vv-soon-badge">Soon</span></span></div>'+
    '</div>';
}
function refreshVocabHubPanel(){
  const goal=getActiveGoal();
  const el=document.getElementById('wsPanelVocabulary');
  if(!goal||!el)return;
  el.innerHTML=renderWsVocabularyHtml(goal);
  if(_vocabHub.activity==='flashcards')renderFcSingleView();
}
function setVocabHubFilter(filter){
  _vocabHub.filter=filter;
  refreshVocabHubPanel();
}
function toggleVocabHubWord(id){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  if(!deckForGoal(goal).some(f=>fcId(f)===id))return;
  if(_vocabHub.selectedIds.has(id))_vocabHub.selectedIds.delete(id);
  else _vocabHub.selectedIds.add(id);
  refreshVocabHubPanel();
}
function vocabHubSelectedIds(goal){
  const deck=deckForGoal(goal);
  return[..._vocabHub.selectedIds].filter(id=>deck.some(f=>fcId(f)===id));
}
function launchVocabHubCustomExam(){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  const ids=vocabHubSelectedIds(goal);
  if(ids.length<4){lcToast('Select at least 4 words.','warn');return;}
  openExamConfigurator(goal.id,ids);
}
function launchVocabHubFlashcards(){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  const ids=vocabHubSelectedIds(goal);
  if(ids.length<VV_MIN_FLASH){lcToast('Select at least '+VV_MIN_FLASH+' word.','warn');return;}
  ensureFcIds();
  _vocabHub.flashcardMode=true;
  _vocabHub.activity='flashcards';
  S.fcSelected=new Set(ids);
  S.fcSingleIdx=0;
  S.fcSingleFlipped=false;
  S.fcTab='all';
  if(typeof ActivityTrack!=='undefined')ActivityTrack.beginSession('flashcards',goal.id,'Flashcard review');
  refreshVocabHubPanel();
  window.scrollTo({top:0,behavior:'smooth'});
}
function launchVocabHubQuickDrill(){
  const goal=S.goals.find(g=>g.id===_vocabHub.goalId);
  if(!goal)return;
  const ids=vocabHubSelectedIds(goal);
  if(ids.length<VV_MIN_DRILL){lcToast('Select at least '+VV_MIN_DRILL+' words for a quiz.','warn');return;}
  S.activeGoalId=goal.id;
  syncGoalToProfile(goal);
  saveGoals();
  ensureFcIds();
  S.fcSelected=new Set(ids);
  _vocabHub.veFromVocab=true;
  if(S.mode==='practice')S.vocabLang=vocabLangFor(goal.subject);
  startVE(false);
}
function launchVocabHubMicroPractice(){launchVocabHubQuickDrill();}
function renderVocabHubFlashcardsHtml(goal){
  const n=vocabHubSelectedIds(goal).length;
  const langBtns=LANGS.map(l=>'<button type="button" class="vt-lb'+(S.fcLang===l.code?' active':'')+'" onclick="setVocabHubFcLang(\''+l.code+'\',this)">'+l.l+'</button>').join('');
  return'<div class="vv-panel vv-panel--fc"><button type="button" class="back-btn" onclick="exitVocabHubFlashcards()">← Word list</button><p class="vv-head">Flashcards · '+n+' word'+(n===1?'':'s')+'</p><p style="font-size:12px;font-weight:600;color:var(--text2);margin:0 0 14px">Tap the card to see the translation in your chosen language.</p><div class="fc-lang-bar" style="margin-bottom:8px"><span class="fc-lang-label">Translation:</span><div class="fc-lang-btns" id="vvFcLangBtns">'+langBtns+'</div></div><div id="vvFcSingle"></div></div>';
}
function renderWsVocabularyHtml(goal){
  if(_vocabHub.activity==='flashcards')return renderVocabHubFlashcardsHtml(goal);
  const deck=deckForGoal(goal);
  const dueN=dueForGoal(goal).length;
  const strugN=vocabHubStrugglingCount(goal);
  const newN=countNewWords(goal);
  const mastN=countMasteredWords(goal);
  const diffN=countDifficultWords(goal);
  const filt=_vocabHub.filter||'all';
  const selN=vocabHubSelectedIds(goal).length;
  const filterChip=(key,lbl,n)=>'<button type="button" class="vv-filter'+(filt===key?' on':'')+'" onclick="setVocabHubFilter(\''+key+'\')">'+lbl+' · '+n+'</button>';
  const filters=filterChip('all','All',deck.length)+filterChip('due','To review',dueN)+filterChip('new','New',newN)+filterChip('mastered','Mastered',mastN)+filterChip('difficult','Difficult',diffN)+filterChip('struggling','Struggling',strugN);
  const actionsHtml=deck.length?vocabHubLegendHtml(goal)+vocabHubActionsHtml(selN)+vocabHubSelNoteHtml(selN,deck.length):'';
  let bodyHtml='';
  if(!deck.length){
    bodyHtml='<p style="font-size:13px;color:var(--text3);margin:0">No words saved yet — add one above or save words during practice exams.</p>';
  }else{
    bodyHtml=vocabHubAccordionHtml(goal);
  }
  return'<div class="vv-panel">'+renderWsVocabKpisHtml(goal)+renderWsVocabCategoriesHtml(goal)+'<p class="ws-seclbl">Smart lists</p><div class="vv-filters">'+filters+'</div>'+vocabHubManualAddHtml()+actionsHtml+bodyHtml+'</div>';
}
