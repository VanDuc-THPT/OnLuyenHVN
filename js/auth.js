/* ============================================================
   AUTH.JS — Đăng ký / Đăng nhập (lưu trên localStorage của trình duyệt)
   + Gửi thông báo tài khoản mới qua EmailJS về Gmail của chủ sở hữu.

   LƯU Ý QUAN TRỌNG (đọc README.md để biết chi tiết):
   - Đây là trang web tĩnh (chạy trên GitHub Pages), không có máy chủ
     (server) và không có cơ sở dữ liệu thật, nên tài khoản được lưu
     trong localStorage của TỪNG trình duyệt (không đồng bộ giữa các
     thiết bị). Đây là cách khả thi duy nhất để có "đăng ký/đăng nhập"
     trên một trang web thuần tĩnh.
   - Để mỗi lần có người đăng ký tài khoản mới, hệ thống gửi một email
     thông báo về Gmail phmduc9002@gmail.com, trang dùng dịch vụ
     miễn phí EmailJS (https://www.emailjs.com). Bạn cần tự tạo 1 tài
     khoản EmailJS (miễn phí) và điền 3 thông số vào config bên dưới:
     EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID.
     Hướng dẫn chi tiết từng bước có trong README.md.
   - Nếu chưa cấu hình EmailJS, trang vẫn hoạt động bình thường (đăng
     ký/đăng nhập/làm bài), chỉ là sẽ KHÔNG gửi được email thông báo.
   ============================================================ */

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "WnftjXnK5hrToE7H4",
  SERVICE_ID: "service_lny4xt8",
  TEMPLATE_ID: "template_p1m3qbw",
  // Template riêng để gửi MÃ XÁC THỰC quên mật khẩu cho người dùng (khác với
  // template thông báo đăng ký ở trên). Tạo thêm 1 template mới trong EmailJS
  // rồi dán Template ID vào đây — xem hướng dẫn trong README.md mục "Quên mật khẩu".
  OTP_TEMPLATE_ID: "template_ijt85pv",
  ADMIN_EMAIL: "phmduc9002@gmail.com",
};

const AUTH_USERS_KEY = "ls12_users_v1";
const AUTH_SESSION_KEY = "ls12_session_v1";

function emailjsIsConfigured() {
  return (
    EMAILJS_CONFIG.PUBLIC_KEY &&
    !EMAILJS_CONFIG.PUBLIC_KEY.startsWith("YOUR_") &&
    EMAILJS_CONFIG.SERVICE_ID &&
    !EMAILJS_CONFIG.SERVICE_ID.startsWith("YOUR_") &&
    EMAILJS_CONFIG.TEMPLATE_ID &&
    !EMAILJS_CONFIG.TEMPLATE_ID.startsWith("YOUR_")
  );
}

// khởi tạo EmailJS nếu thư viện đã được nạp và đã cấu hình khóa
function initEmailJsIfNeeded() {
  if (emailjsIsConfigured() && window.emailjs && !window.__emailjsInited) {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    window.__emailjsInited = true;
  }
}

function sendRegistrationEmail(user) {
  initEmailJsIfNeeded();
  if (!emailjsIsConfigured() || !window.emailjs) {
    console.warn(
      "[EmailJS] Chưa cấu hình hoặc chưa nạp thư viện EmailJS — bỏ qua gửi email thông báo đăng ký."
    );
    return Promise.resolve({ skipped: true });
  }
  const params = {
    to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
    username: user.username,
    email: user.email,
    fullname: user.fullname || "(không nhập)",
    registered_at: new Date().toLocaleString("vi-VN"),
  };
  return window.emailjs
    .send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, params)
    .then((res) => {
      console.log("[EmailJS] Đã gửi email thông báo đăng ký thành công.", res);
      return res;
    })
    .catch((err) => {
      console.error("[EmailJS] Gửi email thông báo thất bại:", err);
      throw err;
    });
}

// Hash mật khẩu đơn giản (KHÔNG phải mã hoá bảo mật thật sự — chỉ để demo,
// tránh lưu mật khẩu dạng thuần văn bản tuyệt đối trong localStorage).
function simpleHash(str) {
  let h1 = 0xdeadbeef ^ str.length,
    h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
  } catch (e) {
    return null;
  }
}
function setSession(username) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username }));
}
function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function currentUser() {
  const s = getSession();
  if (!s) return null;
  const users = getUsers();
  return users[s.username] || null;
}

function requireAuthOrRedirect() {
  if (!currentUser()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function registerUser({ username, email, fullname, password }) {
  username = (username || "").trim();
  email = (email || "").trim();
  fullname = (fullname || "").trim();

  if (!username || !email || !password) {
    return { ok: false, error: "Vui lòng điền đầy đủ thông tin bắt buộc." };
  }
  if (username.length < 3) {
    return { ok: false, error: "Tên đăng nhập phải có ít nhất 3 ký tự." };
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return {
      ok: false,
      error: "Tên đăng nhập chỉ gồm chữ, số, dấu chấm và gạch dưới.",
    };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Email không hợp lệ." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 4 ký tự." };
  }

  const users = getUsers();
  const key = username.toLowerCase();
  if (users[key]) {
    return { ok: false, error: "Tên đăng nhập này đã tồn tại." };
  }
  const user = {
    username,
    email,
    fullname,
    avatar: "", // emoji ký tự hoặc dataURL ảnh do người dùng tự chọn/tải lên
    bio: "",
    schoolClass: "",
    goal: "",
    passHash: simpleHash(password),
    createdAt: new Date().toISOString(),
    progress: {}, // { lessonNum: { bestScore, total, lastAt } }
    history: [], // [{lessonNum, score, total, at}]
  };
  users[key] = user;
  saveUsers(users);
  setSession(key);

  // gửi email thông báo (không chặn luồng nếu lỗi)
  sendRegistrationEmail(user).catch(() => {});

  return { ok: true, user };
}

function loginUser({ username, password }) {
  username = (username || "").trim().toLowerCase();
  const users = getUsers();
  const user = users[username];
  if (!user || user.passHash !== simpleHash(password || "")) {
    return { ok: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }
  setSession(username);
  return { ok: true, user };
}

function logoutUser() {
  clearSession();
  window.location.href = "index.html";
}

function updateProfile(fields) {
  const session = getSession();
  if (!session) return { ok: false, error: "Chưa đăng nhập." };
  const users = getUsers();
  const user = users[session.username];
  if (!user) return { ok: false, error: "Không tìm thấy tài khoản." };

  if (fields.fullname !== undefined) user.fullname = fields.fullname.trim();
  if (fields.bio !== undefined) user.bio = fields.bio.trim().slice(0, 300);
  if (fields.schoolClass !== undefined) user.schoolClass = fields.schoolClass.trim();
  if (fields.goal !== undefined) user.goal = fields.goal.trim();
  if (fields.avatar !== undefined) user.avatar = fields.avatar;
  if (fields.email !== undefined && fields.email.trim()) {
    if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
      return { ok: false, error: "Email không hợp lệ." };
    }
    user.email = fields.email.trim();
  }

  users[session.username] = user;
  saveUsers(users);
  return { ok: true, user };
}

function changePassword({ oldPassword, newPassword }) {
  const session = getSession();
  if (!session) return { ok: false, error: "Chưa đăng nhập." };
  const users = getUsers();
  const user = users[session.username];
  if (!user) return { ok: false, error: "Không tìm thấy tài khoản." };
  if (user.passHash !== simpleHash(oldPassword || "")) {
    return { ok: false, error: "Mật khẩu hiện tại không đúng." };
  }
  if (!newPassword || newPassword.length < 4) {
    return { ok: false, error: "Mật khẩu mới phải có ít nhất 4 ký tự." };
  }
  user.passHash = simpleHash(newPassword);
  users[session.username] = user;
  saveUsers(users);
  return { ok: true };
}

/* ---------- Quên mật khẩu (gửi mã xác thực qua email người dùng) ---------- */

function genOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 chữ số
}

function findUserByUsernameOrEmail(input) {
  const q = (input || "").trim().toLowerCase();
  if (!q) return null;
  const users = getUsers();
  if (users[q]) return { key: q, user: users[q] };
  for (const key in users) {
    if (users[key].email && users[key].email.toLowerCase() === q) {
      return { key, user: users[key] };
    }
  }
  return null;
}

function otpIsConfigured() {
  return (
    emailjsIsConfigured() &&
    EMAILJS_CONFIG.OTP_TEMPLATE_ID &&
    !EMAILJS_CONFIG.OTP_TEMPLATE_ID.startsWith("YOUR_")
  );
}

function sendOtpEmail(user, code) {
  initEmailJsIfNeeded();
  if (!otpIsConfigured() || !window.emailjs) {
    console.warn(
      "[EmailJS] Template mã xác thực (OTP_TEMPLATE_ID) chưa được cấu hình — không gửi được mã."
    );
    return Promise.reject(new Error("otp_not_configured"));
  }
  const params = {
    to_email: user.email,
    username: user.username,
    code: code,
    expires_in: "10 phút",
  };
  return window.emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.OTP_TEMPLATE_ID, params);
}

// Bước 1: tạo mã, lưu kèm hạn dùng vào đúng tài khoản, gửi email cho người dùng
function requestPasswordReset(usernameOrEmail) {
  const found = findUserByUsernameOrEmail(usernameOrEmail);
  if (!found) {
    return Promise.resolve({
      ok: false,
      error: "Không tìm thấy tài khoản này trên trình duyệt hiện tại.",
    });
  }
  if (!found.user.email) {
    return Promise.resolve({
      ok: false,
      error: "Tài khoản này chưa có email để gửi mã xác thực.",
    });
  }
  const code = genOtpCode();
  const users = getUsers();
  users[found.key].resetCode = {
    codeHash: simpleHash(code),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  saveUsers(users);

  return sendOtpEmail(found.user, code)
    .then(() => ({ ok: true, email: found.user.email }))
    .catch(() => ({ ok: true, email: found.user.email, emailFailed: true }));
}

function verifyResetCode(usernameOrEmail, code) {
  const found = findUserByUsernameOrEmail(usernameOrEmail);
  if (!found || !found.user.resetCode) {
    return { ok: false, error: "Chưa có yêu cầu đặt lại mật khẩu nào, hãy gửi mã trước." };
  }
  if (Date.now() > found.user.resetCode.expiresAt) {
    return { ok: false, error: "Mã xác thực đã hết hạn, vui lòng bấm gửi lại mã." };
  }
  if (found.user.resetCode.codeHash !== simpleHash((code || "").trim())) {
    return { ok: false, error: "Mã xác thực không đúng." };
  }
  return { ok: true };
}

// Bước 2: xác thực mã rồi đặt mật khẩu mới
function resetPasswordWithCode(usernameOrEmail, code, newPassword) {
  const v = verifyResetCode(usernameOrEmail, code);
  if (!v.ok) return v;
  if (!newPassword || newPassword.length < 4) {
    return { ok: false, error: "Mật khẩu mới phải có ít nhất 4 ký tự." };
  }
  const found = findUserByUsernameOrEmail(usernameOrEmail);
  const users = getUsers();
  users[found.key].passHash = simpleHash(newPassword);
  delete users[found.key].resetCode;
  saveUsers(users);
  return { ok: true };
}

/* ---------- Giao diện tối (dark mode) — áp dụng cho mọi trang ---------- */

const THEME_KEY = "ls12_theme_v1";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = saved === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem(THEME_KEY, "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem(THEME_KEY, "dark");
  }
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
}

initTheme();

const AVATAR_PRESETS = ["🦉", "🐯", "🦅", "🐲", "🦁", "🐼", "🦊", "🐸", "🌟", "📚", "⚔️", "🏯"];

// Trả về HTML avatar: ảnh tải lên (dataURL), hoặc emoji, hoặc chữ cái đầu tên
function avatarHtml(user, size) {
  size = size || 36;
  const label = (user.fullname || user.username || "?").trim()[0] || "?";
  let inner;
  if (user.avatar && user.avatar.startsWith("data:image")) {
    inner = `<img src="${user.avatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
  } else if (user.avatar) {
    inner = `<span style="font-size:${Math.round(size * 0.58)}px;line-height:1">${user.avatar}</span>`;
  } else {
    inner = `<span style="font-weight:800;font-size:${Math.round(size * 0.42)}px">${label.toUpperCase()}</span>`;
  }
  return `<div class="avatar-circle" style="width:${size}px;height:${size}px">${inner}</div>`;
}

// Thu nhỏ + nén ảnh người dùng chọn thành dataURL nhỏ gọn để lưu localStorage
function fileToSmallDataUrl(file, maxSize) {
  maxSize = maxSize || 160;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Header dùng chung cho mọi trang đã đăng nhập (avatar bấm vào đi tới hồ sơ)
function renderHeaderRight() {
  const user = currentUser();
  const el = document.getElementById("headerRight");
  if (!el) return;
  if (user) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <a href="profile.html" class="user-chip" style="text-decoration:none;color:inherit">
          ${avatarHtml(user, 30)}
          <span>${user.fullname || user.username}</span>
        </a>
        <button class="btn btn-outline" onclick="logoutUser()">Đăng xuất</button>
      </div>`;
  } else {
    el.innerHTML = "";
  }
}

// Namespace theo môn học để tránh trùng số bài giữa các môn (VD bài 1 Lịch sử
// và chuyên đề 1 Tin học). Dữ liệu cũ (trước khi có nhiều môn) không có tiền tố
// môn học — mặc định hiểu là "lichsu" khi hiển thị lại (xem progressKeyLabel).
function recordAttempt(subjectKey, lessonKey, score, total) {
  subjectKey = subjectKey || "lichsu";
  const session = getSession();
  if (!session) return;
  const users = getUsers();
  const user = users[session.username];
  if (!user) return;
  if (!user.progress) user.progress = {};
  if (!user.history) user.history = [];
  const key = subjectKey + ":" + lessonKey;
  const prev = user.progress[key];
  const pct = total ? score / total : 0;
  if (!prev || pct > prev.bestScore / prev.total) {
    user.progress[key] = { bestScore: score, total, lastAt: new Date().toISOString() };
  }
  user.history.unshift({ subject: subjectKey, lessonKey, score, total, at: new Date().toISOString() });
  user.history = user.history.slice(0, 50);
  users[session.username] = user;
  saveUsers(users);
}

// Đọc tiến độ 1 bài/chuyên đề của 1 môn học cụ thể, dùng ở trang danh sách bài học.
function subjectLessonProgress(user, subjectKey, lessonNum) {
  if (!user || !user.progress) return null;
  return user.progress[subjectKey + ":" + lessonNum] || null;
}

// Gom thống kê tiến độ của user theo 1 môn học (dùng cho hero/stat-row của từng môn).
function subjectStats(user, subjectKey, lessonCount) {
  let done = 0, totalPct = 0;
  if (user && user.progress) {
    Object.keys(user.progress).forEach(k => {
      if (k.indexOf(subjectKey + ":") === 0 && k !== subjectKey + ":all" && k !== subjectKey + ":random40") {
        const p = user.progress[k];
        done++;
        totalPct += p.bestScore / p.total;
      }
    });
  }
  return { done, avgPct: done ? Math.round((totalPct / done) * 100) : 0, lessonCount };
}
