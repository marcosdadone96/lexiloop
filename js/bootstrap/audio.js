// ═══════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════
let curUtt=null;
function speak(text,lang){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();curUtt=null;const u=new SpeechSynthesisUtterance(text);u.lang=lang||'en-GB';u.rate=0.88;u.onend=()=>{curUtt=null;};curUtt=u;window.speechSynthesis.speak(u);}
function speakBtn(ew,lang,btn){const word=decodeURIComponent(ew);if(window.speechSynthesis?.speaking){window.speechSynthesis.cancel();if(btn){btn.classList.remove('playing');btn.textContent='🔊';}return;}speak(word,lang);if(btn){btn.classList.add('playing');btn.textContent='■';}const ck=setInterval(()=>{if(!window.speechSynthesis?.speaking){clearInterval(ck);if(btn){btn.classList.remove('playing');btn.textContent='🔊';}}},300);}
