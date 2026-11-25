/* ═══════════════════════════════════════════
   TON 618 — site interactions
   ═══════════════════════════════════════════ */
(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ───────── year ───────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ───────── nav: scroll state + progress ───────── */
  const nav = $('#nav');
  const progress = $('#progress');
  let scrollTick = false;

  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 24);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      scrollTick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ───────── mobile menu ───────── */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks?.addEventListener('click', e => {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeMenu();
  });

  /* ───────── scroll reveal ───────── */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ═══════════════════════════════════════════
     WORD BANK
     ═══════════════════════════════════════════ */
  const WORDS = [
    /* A1 */
    { level: 'A1', word: 'always', ipa: '/ˈɔːlweɪz/', pos: 'adverb', def: 'Every time, without exception.', ex: 'She always drinks tea in the morning.' },
    { level: 'A1', word: 'borrow', ipa: '/ˈbɒrəʊ/', pos: 'verb', def: 'To take something and return it later.', ex: 'Can I borrow your pen for a minute?' },
    { level: 'A1', word: 'early', ipa: '/ˈɜːli/', pos: 'adjective', def: 'Before the usual or expected time.', ex: 'I wake up early on Mondays.' },
    { level: 'A1', word: 'hungry', ipa: '/ˈhʌŋɡri/', pos: 'adjective', def: 'Wanting or needing to eat.', ex: "I'm hungry — is dinner ready?" },
    { level: 'A1', word: 'neighbour', ipa: '/ˈneɪbə/', pos: 'noun', def: 'A person who lives near you.', ex: 'Our neighbour has a very loud dog.' },
    { level: 'A1', word: 'quiet', ipa: '/ˈkwaɪət/', pos: 'adjective', def: 'Making little or no noise.', ex: 'The library is wonderfully quiet.' },

    /* A2 */
    { level: 'A2', word: 'arrive', ipa: '/əˈraɪv/', pos: 'verb', def: 'To reach a place, especially at the end of a journey.', ex: 'We arrived just before the rain.' },
    { level: 'A2', word: 'decide', ipa: '/dɪˈsaɪd/', pos: 'verb', def: 'To choose something after thinking about it.', ex: 'We decided to stay home.' },
    { level: 'A2', word: 'expensive', ipa: '/ɪkˈspensɪv/', pos: 'adjective', def: 'Costing a lot of money.', ex: 'That restaurant is a little too expensive.' },
    { level: 'A2', word: 'healthy', ipa: '/ˈhelθi/', pos: 'adjective', def: 'Good for your body or mind.', ex: 'Walking every day is a healthy habit.' },
    { level: 'A2', word: 'improve', ipa: '/ɪmˈpruːv/', pos: 'verb', def: 'To become better, or to make something better.', ex: 'My English improved a lot this year.' },
    { level: 'A2', word: 'invite', ipa: '/ɪnˈvaɪt/', pos: 'verb', def: 'To ask someone to come to an event or place.', ex: 'They invited us to dinner.' },

    /* B1 */
    { level: 'B1', word: 'achieve', ipa: '/əˈtʃiːv/', pos: 'verb', def: 'To succeed in doing something after effort.', ex: 'She achieved her goal of running a marathon.' },
    { level: 'B1', word: 'confident', ipa: '/ˈkɒnfɪdənt/', pos: 'adjective', def: 'Sure about your own ability or judgment.', ex: 'He feels confident speaking in meetings.' },
    { level: 'B1', word: 'manage', ipa: '/ˈmænɪdʒ/', pos: 'verb', def: 'To succeed in doing something difficult.', ex: 'I managed to finish before noon.' },
    { level: 'B1', word: 'opportunity', ipa: '/ˌɒpəˈtjuːnəti/', pos: 'noun', def: 'A chance to do something good or useful.', ex: 'This job is a great opportunity.' },
    { level: 'B1', word: 'reliable', ipa: '/rɪˈlaɪəbl/', pos: 'adjective', def: 'Able to be trusted to do what you promise.', ex: "She's the most reliable person on the team." },
    { level: 'B1', word: 'struggle', ipa: '/ˈstrʌɡl/', pos: 'verb', def: 'To try hard to do something difficult.', ex: 'I struggle with phrasal verbs.' },

    /* B2 */
    { level: 'B2', word: 'ambiguous', ipa: '/æmˈbɪɡjuəs/', pos: 'adjective', def: 'Open to more than one interpretation.', ex: 'His answer was deliberately ambiguous.' },
    { level: 'B2', word: 'elaborate', ipa: '/ɪˈlæbəreɪt/', pos: 'verb', def: 'To explain something in more detail.', ex: 'Could you elaborate on that point?' },
    { level: 'B2', word: 'inevitable', ipa: '/ɪnˈevɪtəbl/', pos: 'adjective', def: 'Certain to happen and impossible to avoid.', ex: 'Change is inevitable.' },
    { level: 'B2', word: 'persuade', ipa: '/pəˈsweɪd/', pos: 'verb', def: 'To make someone believe or do something.', ex: 'She persuaded me to apply.' },
    { level: 'B2', word: 'resilient', ipa: '/rɪˈzɪliənt/', pos: 'adjective', def: 'Able to recover quickly from difficulty.', ex: 'Kids are remarkably resilient.' },
    { level: 'B2', word: 'subtle', ipa: '/ˈsʌtl/', pos: 'adjective', def: 'Not obvious; delicate and easy to miss.', ex: "There's a subtle difference between the two words." },

    /* C1 */
    { level: 'C1', word: 'articulate', ipa: '/ɑːˈtɪkjələt/', pos: 'adjective', def: 'Able to express ideas clearly and effectively.', ex: "She's an articulate speaker." },
    { level: 'C1', word: 'conscientious', ipa: '/ˌkɒnʃiˈenʃəs/', pos: 'adjective', def: 'Careful to do things well and correctly.', ex: 'A conscientious student checks her work twice.' },
    { level: 'C1', word: 'ephemeral', ipa: '/ɪˈfemərəl/', pos: 'adjective', def: 'Lasting for a very short time.', ex: 'Fame can be ephemeral.' },
    { level: 'C1', word: 'meticulous', ipa: '/məˈtɪkjələs/', pos: 'adjective', def: 'Extremely careful about small details.', ex: 'He keeps meticulous notes.' },
    { level: 'C1', word: 'nuance', ipa: '/ˈnjuːɑːns/', pos: 'noun', def: 'A slight difference in meaning or feeling.', ex: 'Translators have to capture every nuance.' },
    { level: 'C1', word: 'ubiquitous', ipa: '/juːˈbɪkwɪtəs/', pos: 'adjective', def: 'Present or found everywhere.', ex: 'Smartphones are ubiquitous these days.' }
  ];

  const SPEAKER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/></svg>';

  const grid = $('#wordGrid');
  const filters = $('#wordFilters');

  function cardHTML(w) {
    return `<article class="word-card" data-level="${w.level}" tabindex="0" aria-label="${w.word}. Press Enter to reveal the meaning.">
      <div class="word-inner">
        <div class="word-face word-front">
          <div class="word-top">
            <span class="word-level">${w.level}</span>
            <button class="speak" type="button" data-word="${w.word}" aria-label="Hear the word ${w.word}">${SPEAKER_ICON}</button>
          </div>
          <div class="word-main">
            <span class="word-term">${w.word}</span>
            <span class="word-ipa">${w.ipa}</span>
          </div>
          <div class="word-bottom">
            <span class="word-pos">${w.pos}</span>
            <span>Tap to flip</span>
          </div>
        </div>
        <div class="word-face word-back">
          <span class="word-back-label">Meaning</span>
          <p class="word-def">${w.def}</p>
          <p class="word-example">“${w.ex}”</p>
        </div>
      </div>
    </article>`;
  }

  const cards = [];

  if (grid) {
    grid.innerHTML = WORDS.map(cardHTML).join('');
    cards.push(...$$('.word-card', grid));

    const showLevel = level => {
      cards.forEach(c => {
        c.hidden = c.dataset.level !== level;
        c.classList.remove('is-flipped');
      });
    };
    showLevel('A1');

    filters?.addEventListener('click', e => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter', filters).forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      showLevel(btn.dataset.level);
    });

    grid.addEventListener('click', e => {
      const speakBtn = e.target.closest('.speak');
      if (speakBtn) {
        speak(speakBtn.dataset.word, speakBtn);
        return;
      }
      const card = e.target.closest('.word-card');
      if (card) card.classList.toggle('is-flipped');
    });

    grid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('.speak')) return;
      const card = e.target.closest('.word-card');
      if (!card) return;
      e.preventDefault();
      card.classList.toggle('is-flipped');
    });
  }

  /* ───────── speech ───────── */
  const canSpeak = 'speechSynthesis' in window;

  function speak(text, btn) {
    if (!canSpeak) {
      if (btn) {
        btn.classList.add('is-speaking');
        setTimeout(() => btn.classList.remove('is-speaking'), 600);
      }
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.86;
    utter.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => v.lang === 'en-US' && /Samantha|Google US English|Ava|Allison|Alex/i.test(v.name)) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en'));
    if (pick) utter.voice = pick;

    if (btn) {
      btn.classList.add('is-speaking');
      const clear = () => btn.classList.remove('is-speaking');
      utter.addEventListener('end', clear);
      utter.addEventListener('error', clear);
      setTimeout(clear, 2500);
    }
    window.speechSynthesis.speak(utter);
  }

  /* ═══════════════════════════════════════════
     MICRO-LESSON QUIZ
     ═══════════════════════════════════════════ */
  const QUIZ = [
    {
      q: 'Which word means “to move slowly, without a clear purpose”?',
      options: ['drift', 'achieve', 'invite', 'elaborate'],
      answer: 0,
      right: 'Exactly. To drift is to move with no fixed direction.',
      wrong: 'Not quite — the answer is “drift”: to move slowly with no clear purpose.'
    },
    {
      q: '“She was ___ about the details — nothing escaped her.”',
      options: ['hungry', 'meticulous', 'ubiquitous', 'early'],
      answer: 1,
      right: 'Yes. Meticulous means extremely careful about small details.',
      wrong: 'Close, but it is “meticulous” — extremely careful about detail.'
    },
    {
      q: 'What does “ephemeral” mean?',
      options: ['Lasting a very short time', 'Extremely expensive', 'Easy to understand', 'Impossible to avoid'],
      answer: 0,
      right: 'Right. Ephemeral things fade almost as soon as they appear.',
      wrong: 'Not this time. “Ephemeral” means lasting for a very short time.'
    },
    {
      q: '“Could you ___ on that point?” Which word fits?',
      options: ['borrow', 'arrive', 'elaborate', 'persuade'],
      answer: 2,
      right: 'Yes. To elaborate is to explain something in more detail.',
      wrong: 'The word you want is “elaborate” — to explain in more detail.'
    }
  ];

  const quizBody = $('#quizBody');
  const quizQuestion = $('#quizQuestion');
  const quizOptions = $('#quizOptions');
  const quizFeedback = $('#quizFeedback');
  const quizNext = $('#quizNext');
  const quizCount = $('#quizCount');
  const quizBar = $('#quizBar');
  const quizScore = $('#quizScore');
  const quizResult = $('#quizResult');
  const resultScore = $('#resultScore');
  const resultTitle = $('#resultTitle');
  const resultText = $('#resultText');
  const quizRestart = $('#quizRestart');

  let qi = 0;
  let score = 0;
  let answered = false;
  const LETTERS = ['A', 'B', 'C', 'D'];

  function renderQuestion() {
    if (!quizBody) return;
    const item = QUIZ[qi];
    answered = false;

    quizBody.hidden = false;
    quizResult.hidden = true;
    quizCount.textContent = `Question ${qi + 1} of ${QUIZ.length}`;
    quizBar.style.width = `${((qi + 1) / QUIZ.length) * 100}%`;
    quizQuestion.textContent = item.q;
    quizFeedback.textContent = '';
    quizScore.textContent = score > 0 ? `${score} correct` : '';
    quizNext.disabled = true;
    quizNext.innerHTML = qi === QUIZ.length - 1
      ? 'See result <span aria-hidden="true">→</span>'
      : 'Next <span aria-hidden="true">→</span>';

    quizOptions.innerHTML = item.options.map((opt, i) =>
      `<button class="quiz-option" type="button" data-index="${i}">
        <span class="opt-letter">${LETTERS[i]}</span>
        <span>${opt}</span>
      </button>`
    ).join('');

    quizQuestion.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 380, easing: 'cubic-bezier(.22,.75,.24,1)' }
    );
  }

  quizOptions?.addEventListener('click', e => {
    const btn = e.target.closest('.quiz-option');
    if (!btn || answered) return;
    answered = true;

    const item = QUIZ[qi];
    const chosen = Number(btn.dataset.index);
    const all = $$('.quiz-option', quizOptions);
    all.forEach(b => { b.disabled = true; });

    if (chosen === item.answer) {
      score++;
      btn.classList.add('is-correct');
      quizFeedback.textContent = item.right;
    } else {
      btn.classList.add('is-wrong');
      const correctBtn = all[item.answer];
      if (correctBtn) correctBtn.classList.add('is-correct');
      all.forEach(b => {
        if (b !== btn && b !== correctBtn) b.classList.add('is-dim');
      });
      quizFeedback.textContent = item.wrong;
    }

    quizScore.textContent = `${score} correct`;
    quizNext.disabled = false;
    quizNext.focus({ preventScroll: true });
  });

  quizNext?.addEventListener('click', () => {
    if (qi < QUIZ.length - 1) {
      qi++;
      renderQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    quizBody.hidden = true;
    quizResult.hidden = false;
    quizCount.textContent = 'Lesson complete';
    quizBar.style.width = '100%';
    resultScore.textContent = String(score);

    const messages = [
      { title: 'Everyone starts drifting.', text: 'Zero is a starting point, not a verdict. In orbit, these words will come back in three days — and they will stick.' },
      { title: 'The pull has begun.', text: 'One word landed. The other three are already in your review queue, waiting for their next pass.' },
      { title: 'You are in the gravity well.', text: 'Halfway there. A few more orbits and these words start arriving without translation.' },
      { title: 'Nicely pulled in.', text: 'Three out of four. One small gap, one quick review, and this set is yours.' },
      { title: 'Perfect orbit.', text: 'Four for four. This is exactly how the 618 start to feel like yours.' }
    ];
    const m = messages[score] || messages[0];
    resultTitle.textContent = m.title;
    resultText.textContent = m.text;
    quizRestart.focus({ preventScroll: true });
  }

  quizRestart?.addEventListener('click', () => {
    qi = 0;
    score = 0;
    renderQuestion();
  });

  if (quizOptions) renderQuestion();

  /* ═══════════════════════════════════════════
     FAQ
     ═══════════════════════════════════════════ */
  $$('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      $$('.faq-item').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
