/* ============================================================
   APP.JS — logic chạy bài trắc nghiệm cho quiz.html
   ============================================================ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Xáo trộn thứ tự đáp án của 1 câu hỏi, giữ đúng ánh xạ đáp án đúng
function shuffleQuestionOptions(q) {
  const paired = q.options.map((opt, i) => ({ text: opt, correct: q.correct.includes(i) }));
  const shuffled = shuffle(paired);
  return {
    id: q.id,
    type: q.type,
    question: q.question,
    options: shuffled.map(p => p.text),
    correct: shuffled.reduce((acc, p, i) => (p.correct ? acc.concat(i) : acc), []),
  };
}

// Cấu hình từng môn học: dữ liệu câu hỏi, nhãn, trang quay về.
const SUBJECTS = {
  lichsu: {
    label: 'Lịch sử 12',
    icon: '📜',
    data: () => (typeof QUIZ_DATA_LICHSU !== 'undefined' ? QUIZ_DATA_LICHSU : []),
    homeHref: 'lichsu.html',
    unitLabel: 'Bài',
  },
  tinhoc: {
    label: 'Tin học 12',
    icon: '💻',
    data: () => (typeof QUIZ_DATA_TINHOC !== 'undefined' ? QUIZ_DATA_TINHOC : []),
    homeHref: 'tinhoc.html',
    unitLabel: 'Chuyên đề',
  },
};

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { lesson: p.get('lesson') || '', subject: p.get('subject') || 'lichsu' };
}

function buildQuizQuestions(lessonParam, subjectKey) {
  const subject = SUBJECTS[subjectKey] || SUBJECTS.lichsu;
  const DATA = subject.data();
  let lessonTitle = '';
  let lessonKey = lessonParam;
  let pool = [];

  if (lessonParam === 'all') {
    lessonTitle = `Ôn tập tổng hợp — Toàn bộ ${subject.label}`;
    DATA.forEach(l => pool = pool.concat(l.questions));
    lessonKey = 'all';
  } else if (lessonParam === 'random40') {
    lessonTitle = 'Trộn ngẫu nhiên 40 câu';
    let all = [];
    DATA.forEach(l => all = all.concat(l.questions));
    pool = shuffle(all).slice(0, 40);
    lessonKey = 'random40';
  } else {
    const num = parseInt(lessonParam, 10);
    const lesson = DATA.find(l => l.num === num);
    if (!lesson) return null;
    lessonTitle = `${subject.unitLabel} ${lesson.num}: ${lesson.title}`;
    pool = lesson.questions;
    lessonKey = String(num);
  }

  const questions = shuffle(pool).map(shuffleQuestionOptions);
  return { lessonTitle, lessonKey, questions, subjectKey };
}

const state = {
  quiz: null,
  index: 0,
  answers: {}, // qid -> array of selected option indices
  submitted: false,
};

function applySubjectChrome(subjectKey) {
  const subject = SUBJECTS[subjectKey] || SUBJECTS.lichsu;
  const topbar = document.getElementById('quizTopbar');
  const sub = document.getElementById('quizBrandSub');
  if (topbar) topbar.classList.toggle('theme-blue', subjectKey === 'tinhoc');
  if (sub) sub.textContent = `${subject.icon} ${subject.label} — Trắc nghiệm`;
}

function renderApp() {
  renderHeaderRight();
  if (!requireAuthOrRedirect()) return;

  const { lesson, subject } = getParams();
  const subjectCfg = SUBJECTS[subject] || SUBJECTS.lichsu;
  applySubjectChrome(subject);
  if (!lesson) {
    document.getElementById('appRoot').innerHTML = emptyState('Thiếu thông tin bài học.', subjectCfg.homeHref, 'Quay về trang chủ');
    return;
  }
  if (!state.quiz) {
    const built = buildQuizQuestions(lesson, subject);
    if (!built || built.questions.length === 0) {
      document.getElementById('appRoot').innerHTML = emptyState('Không tìm thấy bài học này.', subjectCfg.homeHref, 'Quay về trang chủ');
      return;
    }
    state.quiz = built;
  }
  renderQuizScreen();
}

function emptyState(msg, href, label) {
  return `<div class="card empty-state"><p>${msg}</p><a class="btn btn-primary" href="${href}">${label}</a></div>`;
}

function renderQuizScreen() {
  const { lessonTitle, questions, subjectKey } = state.quiz;
  const subjCls = subjectKey === 'tinhoc' ? ' tinhoc' : '';
  const total = questions.length;
  const answeredCount = Object.keys(state.answers).length;
  const root = document.getElementById('appRoot');

  if (state.submitted) {
    renderResultScreen();
    return;
  }

  const q = questions[state.index];
  const selected = state.answers[q.id] || [];

  root.innerHTML = `
    <div class="card${subjCls}">
      <div class="quiz-head">
        <h2>${lessonTitle}</h2>
        <span class="qcounter">Câu ${state.index + 1} / ${total} · Đã làm ${answeredCount}/${total}</span>
      </div>
      <div class="progress-bar" style="margin-bottom:18px"><i style="width:${(answeredCount/total)*100}%"></i></div>

      <div class="question-card${subjCls}">
        <div class="qtext">Câu ${state.index + 1}. ${q.question}</div>
        ${q.type === 'multi' ? '<span class="multi-hint">✔ Câu hỏi có thể có nhiều đáp án đúng — hãy chọn tất cả đáp án đúng</span>' : ''}
        <div class="options">
          ${q.options.map((opt, i) => {
            const isSel = selected.includes(i);
            const letter = String.fromCharCode(65 + i);
            return `
            <label class="option${subjCls} ${isSel ? 'selected' : ''}" onclick="toggleOption(event, ${q.id}, ${i}, '${q.type}')">
              <input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="q${q.id}" ${isSel ? 'checked' : ''} />
              <span class="letter">${letter}.</span>
              <span>${opt}</span>
            </label>`;
          }).join('')}
        </div>
      </div>

      <div class="dots">
        ${questions.map((qq, i) => `
          <button class="dot${subjCls} ${i === state.index ? 'current' : ''} ${state.answers[qq.id] ? 'answered' : ''}" onclick="goTo(${i})">${i + 1}</button>
        `).join('')}
      </div>

      <div class="nav-row">
        <button class="btn btn-ghost" ${state.index === 0 ? 'disabled' : ''} onclick="goTo(${state.index - 1})">← Câu trước</button>
        <div class="spacer"></div>
        ${state.index < total - 1
          ? `<button class="btn btn-primary${subjCls}" onclick="goTo(${state.index + 1})">Câu tiếp →</button>`
          : `<button class="btn btn-primary${subjCls}" onclick="submitQuiz()">✅ Nộp bài</button>`
        }
      </div>
    </div>
  `;
}

function toggleOption(evt, qid, idx, type) {
  evt.preventDefault();
  const cur = state.answers[qid] ? state.answers[qid].slice() : [];
  if (type === 'multi') {
    const pos = cur.indexOf(idx);
    if (pos >= 0) cur.splice(pos, 1);
    else cur.push(idx);
    state.answers[qid] = cur;
  } else {
    state.answers[qid] = [idx];
  }
  renderQuizScreen();
}

function goTo(i) {
  const total = state.quiz.questions.length;
  if (i < 0 || i >= total) return;
  state.index = i;
  renderQuizScreen();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sa = a.slice().sort().join(',');
  const sb = b.slice().sort().join(',');
  return sa === sb;
}

function submitQuiz() {
  const total = state.quiz.questions.length;
  const answeredCount = Object.keys(state.answers).length;
  if (answeredCount < total) {
    const ok = confirm(`Bạn mới trả lời ${answeredCount}/${total} câu. Bạn có chắc muốn nộp bài không?`);
    if (!ok) return;
  }
  state.submitted = true;

  let score = 0;
  state.quiz.questions.forEach(q => {
    const sel = state.answers[q.id] || [];
    if (arraysEqual(sel, q.correct)) score++;
  });
  state.score = score;

  recordAttempt(state.quiz.subjectKey, state.quiz.lessonKey, score, total);
  renderQuizScreen();
}

function renderResultScreen() {
  const { questions, lessonTitle, subjectKey } = state.quiz;
  const subjCls = subjectKey === 'tinhoc' ? ' tinhoc' : '';
  const subjectCfg = SUBJECTS[subjectKey] || SUBJECTS.lichsu;
  const total = questions.length;
  const score = state.score;
  const pct = Math.round((score / total) * 100);
  const root = document.getElementById('appRoot');

  let verdict = 'Cần cố gắng thêm 💪';
  if (pct >= 90) verdict = 'Xuất sắc! 🏆';
  else if (pct >= 70) verdict = 'Khá tốt! 👍';
  else if (pct >= 50) verdict = 'Trung bình, ôn thêm nhé 📘';

  const accent = subjectKey === 'tinhoc' ? 'var(--blue)' : 'var(--red)';
  const accentDark = subjectKey === 'tinhoc' ? 'var(--blue-dark)' : 'var(--red-dark)';
  root.innerHTML = `
    <div class="card${subjCls}">
      <div class="result-hero">
        <div style="font-weight:700;color:var(--muted)">${lessonTitle}</div>
        <div class="score" style="color:${accent}">${score}<small>/${total}</small></div>
        <div style="font-weight:700;font-size:1.1rem;margin-top:6px">${verdict}</div>
      </div>
      <div class="result-bar"><i style="width:${pct}%"></i></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px">
        <button class="btn btn-primary${subjCls}" onclick="retryQuiz()">🔁 Làm lại bài này</button>
        <a class="btn btn-ghost" href="${subjectCfg.homeHref}">${subjectCfg.icon} Về ${subjectCfg.label}</a>
        <a class="btn btn-ghost" href="index.html">🏠 Trang chủ Ôn tập 12</a>
      </div>
    </div>

    <div class="card${subjCls}" style="margin-top:18px">
      <h2 style="margin-top:0;color:${accentDark};font-size:1.05rem">Xem lại đáp án</h2>
      ${questions.map((q, i) => {
        const sel = state.answers[q.id] || [];
        const isCorrect = arraysEqual(sel, q.correct);
        return `
        <div class="review-item">
          <div class="qtext">Câu ${i + 1}. ${q.question} <span class="badge ${isCorrect ? 'ok' : 'bad'}">${isCorrect ? 'Đúng' : 'Sai'}</span></div>
          ${q.options.map((opt, oi) => {
            const isAns = q.correct.includes(oi);
            const isSel = sel.includes(oi);
            let cls = '';
            if (isAns) cls = 'correct';
            else if (isSel && !isAns) cls = 'wrong';
            return `<div class="ans-row"><span style="min-width:18px">${isAns ? '✔' : (isSel ? '✘' : '')}</span><span class="${cls ? 'badge ' + (cls==='correct'?'ok':'bad') : ''}" style="${cls ? '' : 'color:var(--muted)'}">${opt}</span></div>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  `;
}

function retryQuiz() {
  const lessonKey = state.quiz.lessonKey;
  state.quiz = null;
  state.index = 0;
  state.answers = {};
  state.submitted = false;
  renderApp();
}

renderApp();
