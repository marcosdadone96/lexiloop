/* LexiCoil production features: server quota, exam pool, Stripe, PDF, speaking AI */

(function () {
  if (typeof S === 'undefined') return;

  S.plan = S.plan || 'guest';
  S.quotaUsed = S.quotaUsed || 0;
  S.quotaMax = S.quotaMax || 2;
  S.fcTypeFilter = S.fcTypeFilter || 'all';
  S.examSource = S.examSource || null;

  window.pickExamTopic = async function (subject, level) {
    if (typeof LexiCoilEngine !== 'undefined' && typeof LexiCoilEngine.pickTopic === 'function') {
      const topic = await LexiCoilEngine.pickTopic(subject, level);
      if (topic) return topic;
    }
    if (typeof KnowledgeEngine !== 'undefined' && typeof KnowledgeEngine.pickRandomTopic === 'function') {
      return KnowledgeEngine.pickRandomTopic(subject, level);
    }
    throw new Error('Topic resolver not available');
  };

  window.applyUserFromServer = function (user) {
    if (!user) return;
    const plan = user.guest ? 'guest' : (user.pro || user.plan === 'pro') ? 'pro' : user.plan || 'free';
    const avatar = (user.name || user.email || '?')[0].toUpperCase();
    if (typeof saveUser === 'function') {
      saveUser({
        name: user.name || 'User',
        email: user.email,
        avatar,
        plan: plan === 'guest' ? 'free' : plan,
        memberSince: user.memberSince || null,
      });
    }
    applyServerQuota({
      used: user.quota?.used,
      max: user.quota?.max,
      plan,
    });
  };

  window.applyServerQuota = function (data) {
    if (data.plan) {
      S.plan = data.plan === 'pro' ? 'pro' : data.plan === 'guest' ? 'guest' : data.plan || 'free';
      if (S.user) {
        S.user.plan = S.plan === 'pro' ? 'pro' : S.plan === 'guest' ? 'free' : S.plan;
        if (typeof saveUser === 'function') saveUser(S.user);
      }
    }
    if (S.plan === 'pro') S.quotaMax = PRO_QUOTA;
    else if (S.plan === 'guest') S.quotaMax = FREE_QUOTA;
    else S.quotaMax = FREE_QUOTA;
    if (typeof data.used === 'number') {
      S.quotaUsed = Math.max(0, Math.min(data.used, S.quotaMax));
    }
    localStorage.setItem(
      'lc_quota',
      JSON.stringify({ month: getMonthKey(), used: S.quotaUsed, max: S.quotaMax, plan: S.plan }),
    );
    if (typeof updQuotaUI === 'function') updQuotaUI();
    if (typeof refreshUserDropdown === 'function') refreshUserDropdown();
  };

  window.getQuotaUsed = function () {
    if (typeof S.quotaUsed === 'number' && S.quotaUsed > 0) return S.quotaUsed;
    try {
      const raw = localStorage.getItem('lc_quota');
      if (!raw) return S.quotaUsed || 0;
      const q = JSON.parse(raw);
      return q.month === getMonthKey() ? (q.used || 0) : 0;
    } catch {
      return S.quotaUsed || 0;
    }
  };

  window.isPro = function () {
    return S.plan === 'pro';
  };

  window.getQuotaMax = function () {
    return S.quotaMax || (isPro() ? PRO_QUOTA : FREE_QUOTA);
  };

  window.canGenerate = function () {
    return getQuotaUsed() < getQuotaMax();
  };

  window.incQuota = async function () {
    if (typeof commitExamQuota === 'function') {
      try {
        await commitExamQuota();
      } catch (e) {
        if (e.code === 'quota_exceeded') throw e;
      }
      return;
    }
    applyServerQuota({ used: getQuotaUsed() + 1, plan: S.plan });
    if (typeof Auth !== 'undefined') Auth.pushSync();
  };

  window.updQuotaUI = function () {
    const used = getQuotaUsed();
    const max = getQuotaMax();
    const rem = max - used;
    const el = document.getElementById('quotaCount');
    const badge = document.getElementById('planBadgeHome');
    const upgradeBtn = document.getElementById('upgradeBtnHome');
    const homeHint = document.getElementById('quotaHomeHint');
    const guest = typeof Auth !== 'undefined' && Auth.isGuest && Auth.isGuest();

    if (el) {
      el.textContent = guest ? `${used}/${max} guest tries` : `${used}/${max} used`;
      el.className = 'quota-count' + (rem === 0 ? ' none' : rem <= 1 ? ' low' : '');
    }
    if (badge) {
      const lbl =
        S.plan === 'pro'
          ? '<span class="plan-badge plan-pro">Pro</span>'
          : guest
            ? '<span class="plan-badge plan-free">Guest</span>'
            : '<span class="plan-badge plan-free">Free</span>';
      badge.innerHTML = lbl;
    }
    if (upgradeBtn) upgradeBtn.style.display = isPro() ? 'none' : 'inline-flex';

    if (homeHint) {
      const quotaNote = 'Each delivered exam counts ? generated or reused from the pool.';
      if (isPro()) {
        homeHint.textContent = `${rem} / ${max} exams remaining this month. ${quotaNote}`;
      } else if (!canGenerate()) {
        homeHint.textContent =
          `You've used your ${max} free exams this month. ${quotaNote} Upgrade to Pro for 20/month, or retake a saved exam (free).`;
      } else {
        homeHint.textContent = guest
          ? `${rem} exam${rem === 1 ? '' : 's'} left as guest. ${quotaNote} Create a free account for monthly quota.`
          : `${rem} exam${rem === 1 ? '' : 's'} remaining this month. ${quotaNote}`;
      }
    }

    const warn = document.getElementById('quotaWarning');
    const btn = document.getElementById('btnStart');
    if (warn && btn) {
      if (!canGenerate()) {
        warn.style.display = 'block';
        warn.textContent = guest
          ? 'Guest limit reached. Create a free account to keep progress and generate more exams.'
          : `You've used all ${max} exams this month (pool or AI). Retake a saved exam for free, or upgrade to Pro for 20/month.`;
        btn.disabled = true;
      } else {
        warn.style.display = 'none';
        if (S.level) btn.disabled = false;
      }
    }
  };

  window.showQuotaExceededModal = function (err) {
    const used = err?.used ?? getQuotaUsed();
    const max = err?.max ?? getQuotaMax();
    const plan = err?.plan || S.plan;
    const msg = document.getElementById('quotaExceededMsg');
    if (msg) {
      msg.innerHTML =
        plan === 'guest'
          ? `You've used all <b>${max}</b> guest exam generations on this device.<br>Create a free account for 2 exams/month synced across devices.`
          : `You've used <b>${used}/${max}</b> exams this month (pool or AI).<br>Upgrade to Pro for 20/month, or retake a saved exam without using quota.`;
    }
    document.getElementById('quotaExceededModal')?.classList.add('show');
  };

  window.closeQuotaExceeded = function () {
    document.getElementById('quotaExceededModal')?.classList.remove('show');
  };

  window.setLoaderStep = function (title, sub) {
    const t = document.getElementById('loaderTitle');
    const s = document.getElementById('loaderSub');
    if (t) t.textContent = title;
    if (s) s.textContent = sub;
  };

  window.generateExam = async function () {
    S.isDemo = false;
    S.examSource = null;
    S.answers = {};
    S.gapAnswers = {};
    S.quickMod = null;
    hideAll();
    show('loadingScreen');

    try {
      if (!canGenerate()) {
        hideAll();
        show('levelScreen');
        showQuotaExceededModal({ used: getQuotaUsed(), max: getQuotaMax(), plan: S.plan });
        return;
      }

      if (typeof QuestionLibrary !== 'undefined' && QuestionLibrary.hasLibrary(S.subject, S.level)) {
        setLoaderStep('Assembling exam\u2026', 'Building from question library\u2026');
        try {
          const raw = await QuestionLibrary.buildExam(S.subject, S.level);
          const normalized = typeof normalizeExam === 'function' ? normalizeExam(raw) : raw;
          if (
            normalized &&
            (typeof isExamRenderable !== 'function' || isExamRenderable(normalized)) &&
            (typeof lcExamPassesValidator !== 'function' || lcExamPassesValidator(normalized))
          ) {
            if (typeof commitExamQuota === 'function') await commitExamQuota();
            S.examData = normalized;
            S.examSource = 'question-library';
            renderExam();
            return;
          }
        } catch (qlErr) {
          console.warn('[exam] question library build failed:', qlErr);
        }
      }

      if (typeof ExamLibrary !== 'undefined' && ExamLibrary.hasLibrary(S.subject, S.level)) {
        setLoaderStep('Loading exam\u2026', 'Picking from static exam library\u2026');
        const raw = await ExamLibrary.pickExam(S.subject, S.level);
        const normalized = typeof normalizeExam === 'function' ? normalizeExam(raw) : raw;
        if (!normalized || (typeof isExamRenderable === 'function' && !isExamRenderable(normalized))) {
          throw new Error('The exam library entry is incomplete.');
        }
        if (typeof commitExamQuota === 'function') await commitExamQuota();
        S.examData = normalized;
        S.examSource = 'library';
        renderExam();
        return;
      }

      if (typeof fetchExamFromPool === 'function') {
        setLoaderStep('Checking exam pool\u2026', 'Looking for a shared cached exam\u2026');
        try {
          const pooled = await fetchExamFromPool(S.subject, S.level);
          if (pooled?.found && pooled.exam) {
            const normalized = typeof normalizeExam === 'function' ? normalizeExam(pooled.exam) : pooled.exam;
            if (
              normalized &&
              (typeof isExamRenderable !== 'function' || isExamRenderable(normalized)) &&
              (typeof lcExamPassesValidator !== 'function' || lcExamPassesValidator(normalized))
            ) {
              if (typeof commitExamQuota === 'function') await commitExamQuota();
              S.examData = normalized;
              S.examData.topic = pooled.topic || normalized.topic || 'Shared exam';
              S.examData.poolSource = true;
              S.examSource = 'pool';
              renderExam();
              return;
            }
          }
        } catch (poolErr) {
          console.warn('[exam] pool fetch failed:', poolErr);
        }
      }

      if (typeof QuestionLibrary !== 'undefined' && QuestionLibrary.hasLibrary(S.subject, S.level)) {
        hideAll();
        show('levelScreen');
        if (typeof showToast === 'function') {
          showToast('Could not assemble an exam from the question library. Please try again.', 'warn', 5000);
        } else {
          alert('Could not assemble an exam from the question library. Please try again.');
        }
        return;
      }

      const topic = await pickExamTopic(S.subject, S.level);
      if (!canGenerate()) {
        hideAll();
        show('levelScreen');
        const avail = typeof ExamLibrary !== 'undefined' ? ExamLibrary.availableLevels(S.subject) : [];
        const langLbl =
          typeof SubjectMeta !== 'undefined'
            ? SubjectMeta.langName(S.subject)
            : S.subject === 'de'
              ? 'German'
              : S.subject === 'es'
                ? 'Spanish'
                : 'English';
        const hint = avail.length ? `\n\nAvailable library levels (${langLbl}): ${avail.join(', ')}` : '';
        if (typeof showToast === 'function') showToast(`No exam library for ${S.level} yet.${hint.replace(/\n/g, ' ')}`, 'warn', 5000);
        else alert(`No exam library available for ${S.level} yet.${hint}`);
        return;
      }
      setLoaderStep('Generating with AI\u2026', 'Starting exam generation\u2026');
      let raw;
      try {
        raw = await generateExamChunks(topic, (s) => setLoaderStep('Generating with AI\u2026', s));
      } catch (e) {
        if (e.code === 'exam_low_quality' || e.code === 'exam_invalid') {
          setLoaderStep('Improving quality\u2026', 'Regenerating with stricter prompts\u2026');
          raw = await generateExamChunks(topic, (s) => setLoaderStep('Improving quality\u2026', s));
        } else {
          throw e;
        }
      }
      const normalized = typeof normalizeExam === 'function' ? normalizeExam(raw) : raw;
      if (!normalized || (typeof isExamRenderable === 'function' && !isExamRenderable(normalized))) {
        throw new Error('AI returned an incomplete exam. Please try again.');
      }
      if (typeof lcExamPassesValidator === 'function' && !lcExamPassesValidator(normalized)) {
        const e = new Error('AI returned an exam with invalid answer keys. Please try again.');
        e.code = 'exam_invalid';
        throw e;
      }
      if (typeof lcValidateExamOnServer === 'function') {
        const srv = await lcValidateExamOnServer(normalized);
        if (!srv.valid) {
          const e = new Error('Generated exam failed answer-key validation.');
          e.code = 'exam_invalid';
          throw e;
        }
      }
      setLoaderStep('Processing\u2026', 'Almost ready\u2026');
      S.examData = normalized;
      S.examData.topic = topic;
      S.examSource = 'ai';
      if (typeof contributeExamToPool === 'function') {
        contributeExamToPool(S.subject, S.level, topic, S.examData).catch(() => {});
      }
      renderExam();
    } catch (e) {
      if (typeof showExamError === 'function') { showExamError(e); return; }
      hideAll();
      show('levelScreen');
      if (e.code === 'quota_exceeded') {
        showQuotaExceededModal(e);
        return;
      }
      if (e.code === 'timeout' || e.code === 'gateway_timeout') {
        if (typeof showToast === 'function') showToast('Exam generation timed out. Please try again.', 'warn', 5000);
        else alert('Exam generation timed out.\n\nPlease try again in a moment.');
        return;
      }
      const msg = String(e.message || 'Unknown error');
      if (/json|parse|unterminated/i.test(msg)) {
        if (typeof showToast === 'function') showToast('AI returned incomplete data. Please try again.', 'error', 5000);
        else alert('Error generating exam.\n\nThe AI returned incomplete data. Please try again ? it usually works on the second attempt.');
        return;
      }
      if (e.code === 'exam_low_quality') {
        if (typeof showToast === 'function') showToast('AI returned low-quality content. Please try again.', 'warn', 5000);
        else alert('Error generating exam.\n\nThe AI returned low-quality content. Please try again.');
        return;
      }
      if (e.code === 'exam_invalid') {
        if (typeof showToast === 'function') showToast('AI returned invalid answer keys. Please try again.', 'warn', 5000);
        else alert('Error generating exam.\n\nThe AI returned invalid answer keys. Please try again.');
        return;
      }
      if (typeof showToast === 'function') showToast(msg, 'error', 5000);
      else alert('Error generating exam.\n\n' + msg);
    }
  };

  window.generateDemoExam = function () {
    window.location.href = '/demo';
  };

  window.activatePro = async function () {
    if (typeof Auth !== 'undefined' && Auth.isGuest()) {
      closeUpgrade();
      switchTab('login');
      if (typeof showAuthOverlay === 'function') showAuthOverlay();
      setAMsg('Sign in or register to upgrade to Pro.');
      return;
    }
    if (!localStorage.getItem('lc_token')) {
      closeUpgrade();
      if (typeof showAuthOverlay === 'function') showAuthOverlay();
      return;
    }
    try {
      await startStripeCheckout();
    } catch (e) {
      if (typeof showToast === 'function') {
        showToast(e.message === 'login_required' ? 'Please sign in first.' : 'Checkout failed. Try again later.', 'error');
      } else {
        alert(e.message === 'login_required' ? 'Please sign in first.' : 'Checkout failed. Try again later.');
      }
    }
  };

  async function waitForProActivation(maxAttempts = 16, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      await Auth.bootstrap();
      if (isPro() && getQuotaMax() >= PRO_QUOTA) return true;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return isPro() && getQuotaMax() >= PRO_QUOTA;
  }

  window.handleUrlParams = async function () {
    const p = new URLSearchParams(location.search);
    if (p.get('upgraded') === '1') {
      const sessionId = p.get('session_id') || '';
      history.replaceState({}, '', location.pathname);
      let activated = false;
      if (sessionId && typeof confirmStripePurchase === 'function') {
        try {
          await confirmStripePurchase(sessionId);
          activated = true;
        } catch (e) {
          console.warn('[upgrade] stripe-confirm failed, falling back to webhook poll:', e.message || e);
        }
      }
      if (!activated) activated = await waitForProActivation();
      updUserBtn();
      updQuotaUI();
      if (typeof refreshUserDropdown === 'function') refreshUserDropdown();
      if (activated) {
        if (typeof showToast === 'function') showToast("You're now Pro ? 20 exam generations this month.", 'success', 5000);
        else alert("You're now Pro! You have 20 exam generations this month.");
      } else {
        const pending = 'Payment received. Pro activation is still processing ? refresh in a few seconds if needed.';
        if (typeof showToast === 'function') showToast(pending, 'warn', 6000);
        else alert(pending);
      }
    }
    if (p.get('cancelled') === '1') {
      history.replaceState({}, '', location.pathname);
      const el = document.getElementById('quotaHomeHint');
      if (el) el.textContent = 'Upgrade cancelled. You can upgrade anytime from the home screen.';
    }
    const resetToken = p.get('reset');
    if (resetToken) {
      history.replaceState({}, '', location.pathname);
      if (typeof showResetPasswordForm === 'function') showResetPasswordForm(resetToken);
    }
  };

  window.normWordType = function (pos) {
    const p = String(pos || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    if (p.startsWith('noun') || p === 'n') return 'noun';
    if (p.startsWith('verb') || p === 'v') return 'verb';
    if (p.startsWith('adj')) return 'adjective';
    if (p.startsWith('adv')) return 'adverb';
    if (p.startsWith('phrase')) return 'phrase';
    return 'other';
  };

  window.typeBadge = function (t) {
    const map = {
      noun: ['noun', 'var(--blue)'],
      verb: ['verb', 'var(--orange)'],
      adjective: ['adj', 'var(--green)'],
      adverb: ['adv', 'var(--purple)'],
      phrase: ['phrase', 'var(--text3)'],
      other: ['other', 'var(--text3)'],
    };
    const [lbl, col] = map[t] || map.other;
    return `<span class="fc-type-badge" style="color:${col};border-color:${col}">${lbl}</span>`;
  };

  window.setFcTypeFilter = function (t, btn) {
    S.fcTypeFilter = t;
    document.querySelectorAll('.fc-type-filter').forEach((b) => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderFC(false);
  };

  window.filterCardsByType = function (cards) {
    if (!S.fcTypeFilter || S.fcTypeFilter === 'all') return cards;
    if (S.fcTypeFilter === 'other') {
      return cards.filter((fc) => !['noun', 'verb', 'adjective'].includes(normWordType(fc.type || fc.pos)));
    }
    return cards.filter((fc) => normWordType(fc.type || fc.pos) === S.fcTypeFilter);
  };

  const FC_TYPE_ORDER = { noun: 0, verb: 1, adjective: 2, adverb: 3, phrase: 4, other: 5 };

  window.sortFlashcardsByType = function (cards) {
    return [...cards].sort((a, b) => {
      const ta = FC_TYPE_ORDER[normWordType(a.type || a.pos)] ?? 5;
      const tb = FC_TYPE_ORDER[normWordType(b.type || b.pos)] ?? 5;
      if (ta !== tb) return ta - tb;
      return String(a.word || '').localeCompare(String(b.word || ''), undefined, { sensitivity: 'base' });
    });
  };

  window.fcTypeSectionLabel = function (t) {
    const map = {
      noun: 'Nouns',
      verb: 'Verbs',
      adjective: 'Adjectives',
      adverb: 'Adverbs',
      phrase: 'Phrases',
      other: 'Other',
    };
    return map[t] || 'Other';
  };

  window.buildSpeakingEvalPrompt = function (part, transcript, isDE) {
    const board = isDE ? 'Goethe-Institut' : 'Cambridge Assessment English';
    const cert = S.examData?.official?.certificate || S.level;
    return `You are a certified ${board} examiner evaluating a spoken response at level ${S.level} (${cert}).
Evaluate strictly according to the official speaking rubric.
Reply ONLY with valid JSON.

Task: ${part.situation || ''}
Points: ${(part.points || []).join('; ')}
Candidate transcript:
${transcript}

Model answer reference:
${part.modelAnswer || ''}

Return JSON:
{"criteria":[{"name":"Task Achievement","score":0-5,"comment":"..."},{"name":"Vocabulary Range","score":0-5,"comment":"..."},{"name":"Grammar Accuracy","score":0-5,"comment":"..."},{"name":"Coherence & Fluency","score":0-5,"comment":"..."}],"totalScore":0-100,"passed":true,"overallFeedback":"...","strongPoints":["..."],"improvements":["..."],"correctedVersion":"..."}`;
  };

  window.evalSpeakingWithAI = async function (parts, isDE) {
    const out = [];
    for (const p of parts) {
      const txt = document.getElementById(p.fieldId)?.value.trim() || '';
      if (!txt) {
        out.push({ ...gradeSpeaking(p, '', isDE), part: p, ai: false });
        continue;
      }
      try {
        const raw = await callAI(buildSpeakingEvalPrompt(p, txt, isDE), 1200, { consumeQuota: false });
        const data = JSON.parse(raw.replace(/```json|```/g, '').trim());
        out.push({
          part: p,
          ai: true,
          score: data.totalScore || 0,
          passed: data.passed,
          criteria: data.criteria || [],
          overallFeedback: data.overallFeedback,
          strongPoints: data.strongPoints || [],
          improvements: data.improvements || [],
          correctedVersion: data.correctedVersion,
          transcript: txt,
        });
      } catch (_) {
        out.push({ ...gradeSpeaking(p, txt, isDE), part: p, ai: false });
      }
    }
    return out;
  };

  window.renderSpeakingResultsHtml = function (evals, isDE) {
    if (!evals?.length) return '';
    return evals
      .map((sp) => {
        const title =
          sp.part?.teil != null
            ? `${isDE ? 'Sprechen' : 'Speaking'} ? ${isDE ? 'Teil' : 'Part'} ${sp.part.teil}`
            : isDE
              ? 'Sprechen'
              : 'Speaking';
        let h = `<div class="speaking-eval-block"><h3 style="font-size:14px;margin-bottom:12px">${title}${sp.ai ? ' <span style="font-size:10px;color:var(--purple)">AI evaluated</span>' : ''}</h3>`;
        if (sp.criteria?.length) {
          sp.criteria.forEach((c) => {
            const pct = Math.round(((c.score || 0) / 5) * 100);
            h += `<div class="speak-crit-row"><span style="min-width:130px;font-weight:600">${esc(c.name)}</span><div class="speak-crit-bar"><div class="speak-crit-fill" style="width:${pct}%"></div></div><span style="font-family:'DM Mono',monospace;font-size:12px">${c.score || 0}/5</span></div><p style="font-size:11px;color:var(--text3);margin:-4px 0 10px 0">${esc(c.comment || '')}</p>`;
          });
        } else if (sp.note) {
          h += `<p style="font-size:13px;color:var(--text2)">${esc(sp.note)}</p>`;
        }
        if (sp.overallFeedback) h += `<p style="font-size:13px;color:var(--text2);margin-top:8px">${esc(sp.overallFeedback)}</p>`;
        if (sp.strongPoints?.length) {
          h += `<p style="font-size:11px;font-weight:700;color:var(--green);margin-top:10px">Strengths</p><ul style="font-size:12px;color:var(--text2);padding-left:18px;margin:4px 0 10px">${sp.strongPoints.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
        }
        if (sp.improvements?.length) {
          h += `<p style="font-size:11px;font-weight:700;color:var(--orange);margin-top:4px">Improvements</p><ul style="font-size:12px;color:var(--text2);padding-left:18px;margin:4px 0 10px">${sp.improvements.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
        }
        if (sp.correctedVersion && sp.transcript) {
          h += `<p style="font-size:11px;font-weight:700;color:var(--text3);margin-top:8px;text-transform:uppercase;letter-spacing:.06em">Corrected version</p><div class="corr-diff readable-text" style="font-size:13px;line-height:1.7">${highlightCorrectedDiff(sp.transcript, sp.correctedVersion)}</div>`;
        } else if (sp.correctedVersion) {
          h += `<p style="font-size:11px;font-weight:700;color:var(--text3);margin-top:8px">Corrected version</p><div class="readable-text" style="font-size:13px">${esc(sp.correctedVersion)}</div>`;
        }
        h += '</div>';
        return h;
      })
      .join('');
  };

  window.highlightCorrectedDiff = function (original, corrected) {
    const oWords = String(original || '').split(/\s+/);
    const cWords = String(corrected || '').split(/\s+/);
    return cWords
      .map((w, i) => {
        const ow = oWords[i] || '';
        if (w.toLowerCase() !== ow.toLowerCase()) return `<mark>${esc(w)}</mark>`;
        return esc(w);
      })
      .join(' ');
  };

  window.buildPdfHtml = function (score, mods, d, isDE, correction, speakingParts) {
    const name = S.user?.name || 'Candidate';
    const cert = d.official?.certificate || '';
    const topic = d.topic || '';
    const passed = score >= 70 ? (isDE ? 'BESTANDEN' : 'PASSED') : isDE ? 'NICHT BESTANDEN' : 'NOT PASSED';
    const modNames = {
      lesen: isDE ? 'Lesen' : 'Reading',
      horen: isDE ? 'H?rverstehen' : 'Listening',
      gapfill: 'Gap-Fill',
      schreiben: isDE ? 'Schreiben' : 'Writing',
      sprechen: isDE ? 'Sprechen' : 'Speaking',
    };
    let html = `<div class="pdf-doc"><div class="pdf-page"><h1>LexiCoil</h1><p>${new Date().toLocaleDateString()}</p><h2>${esc(name)}</h2><p>${esc(cert)} ? ${esc(d.level)} ? ${esc(topic)}</p><p><strong>Overall: ${score}% ? ${passed}</strong></p><table class="pdf-table">`;
    Object.entries(mods).forEach(([k, v]) => {
      if (v != null) html += `<tr><td>${esc(modNames[k] || k)}</td><td>${v}%</td></tr>`;
    });
    html += '</table></div>';
    if (correction?.parts) {
      correction.parts.forEach((block) => {
        html += `<div class="pdf-page pdf-page-break"><h3>${esc(block.title)}</h3>`;
        block.items.forEach((it) => {
          html += `<p>${it.ok ? '?' : '?'} ${esc(it.q)}<br>Yours: ${esc(it.yours)}${it.ok ? '' : '<br>Correct: ' + esc(it.correct)}</p>`;
        });
        html += '</div>';
      });
    }
    if (speakingParts?.length) {
      speakingParts.forEach((sp) => {
        html += `<div class="pdf-page pdf-page-break"><h3>${isDE ? 'Sprechen' : 'Speaking'}</h3>`;
        if (sp.transcript) html += `<p><strong>Your answer:</strong> ${esc(sp.transcript)}</p>`;
        if (sp.criteria) {
          sp.criteria.forEach((c) => {
            html += `<p>${esc(c.name)}: ${c.score}/5 ? ${esc(c.comment)}</p>`;
          });
        }
        if (sp.correctedVersion) html += `<p><strong>Corrected:</strong> ${esc(sp.correctedVersion)}</p>`;
        html += `<p>${esc(sp.overallFeedback || sp.note || '')}</p></div>`;
      });
    }
    const weak = Object.entries(mods)
      .filter(([, v]) => v != null)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([k]) => modNames[k] || k);
    html += `<div class="pdf-page pdf-page-break"><h3>Recommendations</h3><p>Based on your results in ${esc(weak.join(', ') || 'all modules')}, we recommend practicing: demo exams, flashcard review, and targeted exercises in your weakest modules.</p></div></div>`;
    return html;
  };

  window.downloadCorrectionPdf = function (score, mods, d, isDE, correction, speakingParts) {
    if (!isPro()) {
      if (typeof showToast === 'function') showToast('PDF reports are a Pro feature. Upgrade to download.', 'warn', 4500);
      else alert('PDF reports are a Pro feature. Upgrade to Pro to download.');
      if (typeof showUpgrade === 'function') showUpgrade();
      return;
    }
    const box = document.getElementById('pdf-export-container');
    if (!box) return;
    box.innerHTML = buildPdfHtml(score, mods, d, isDE, correction, speakingParts);
    box.style.display = 'block';
    window.print();
    setTimeout(() => {
      box.innerHTML = '';
      box.style.display = 'none';
    }, 500);
  };

  const origInit = window.init;
  window.init = async function () {
    await origInit();
    await handleUrlParams();
  };
  if (window.initPromise) {
    window.initPromise = window.initPromise.then(() => handleUrlParams());
  }
})();
