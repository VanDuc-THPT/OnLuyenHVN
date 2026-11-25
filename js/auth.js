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
     thông báo về Gmail phamvanduclop91@gmail.com, trang dùng dịch vụ
     miễn phí EmailJS (https://www.emailjs.com). Bạn cần tự tạo 1 tài
     khoản EmailJS (miễn phí) và điền 3 thông số vào config bên dưới:
     EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID.
     Hướng dẫn chi tiết từng bước có trong README.md.
   - Nếu chưa cấu hình EmailJS, trang vẫn hoạt động bình thường (đăng
     ký/đăng nhập/làm bài), chỉ là sẽ KHÔNG gửi được email thông báo.
   ============================================================ */

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
  SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
  TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
  ADMIN_EMAIL: "phamvanduclop91@gmail.com",
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

function recordAttempt(lessonKey, score, total) {
  const session = getSession();
  if (!session) return;
  const users = getUsers();
  const user = users[session.username];
  if (!user) return;
  if (!user.progress) user.progress = {};
  if (!user.history) user.history = [];
  const prev = user.progress[lessonKey];
  const pct = total ? score / total : 0;
  if (!prev || pct > prev.bestScore / prev.total) {
    user.progress[lessonKey] = { bestScore: score, total, lastAt: new Date().toISOString() };
  }
  user.history.unshift({ lessonKey, score, total, at: new Date().toISOString() });
  user.history = user.history.slice(0, 50);
  users[session.username] = user;
  saveUsers(users);
}
