# Ôn tập 12 — Trắc nghiệm Lịch sử & Tin học

Website ôn tập trắc nghiệm cho học sinh khối 12, gồm **2 môn học**:

- **📜 Lịch sử 12** — Bài 1–17 (trừ Bài 14), 601 câu hỏi, chuyển thể tự động từ bộ
  tài liệu "Câu hỏi trả lời ngắn".
- **💻 Tin học 12** — 6 chuyên đề (Trí tuệ nhân tạo, Mạng máy tính & giao thức,
  Chia sẻ tài nguyên LAN, Văn hoá ứng xử trên mạng, HTML cơ bản, HTML nâng cao),
  113 câu hỏi, chuyển thể từ đề cương ôn tập cuối học kỳ 1.

Chạy hoàn toàn bằng HTML/CSS/JavaScript thuần (không cần cài đặt gì), phù hợp
để host miễn phí trên **GitHub Pages**.

## 1. Tính năng

- Trang chủ là **nơi chọn môn học** — dùng chung 1 tài khoản cho cả 2 môn.
- Đăng ký / Đăng nhập tài khoản (lưu trong trình duyệt — xem mục "Giới hạn kỹ thuật" bên dưới).
- Mỗi môn có bộ bài học/chuyên đề riêng, đúng số câu hỏi như trong tài liệu gốc.
- Chế độ "Ôn tập tổng hợp" (toàn bộ câu hỏi của môn) và "Trộn ngẫu nhiên 40 câu", áp dụng riêng cho từng môn.
- Câu hỏi và đáp án được xáo trộn ngẫu nhiên mỗi lần làm bài.
- Có câu hỏi 1 đáp án đúng, câu hỏi nhiều đáp án đúng, và câu hỏi "Đúng/Sai nhiều ý" (môn Tin học — chọn tất cả ý đúng).
- Chấm điểm, xem lại đáp án đúng/sai sau khi nộp bài.
- Lưu lại điểm cao nhất từng bài/chuyên đề **cho từng môn riêng biệt**, cho mỗi tài khoản.
- Gửi email thông báo về Gmail của bạn mỗi khi có người đăng ký tài khoản mới (cần cấu hình EmailJS — xem mục 3).
- Trang Hồ sơ cá nhân: đổi ảnh đại diện (chọn icon có sẵn hoặc tải ảnh lên), họ tên, lớp/trường, tiểu sử, mục tiêu học tập.
- Lịch sử luyện tập trong hồ sơ hiển thị **cả 2 môn**, có biểu tượng phân biệt (📜/💻).
- **Quên mật khẩu**: gửi mã xác thực 6 số qua email người dùng đã đăng ký, tự xác thực và đặt mật khẩu mới (cần cấu hình thêm 1 template EmailJS — xem mục 4).
- Chế độ Giao diện tối (Dark mode), bấm biểu tượng 🌙 ở góc trên bên phải — áp dụng cho mọi trang.
- Giao diện riêng cho từng môn: Lịch sử (đỏ – vàng), Tin học (xanh dương), giúp dễ phân biệt khi đang ôn tập môn nào.
- Danh sách bài học/chuyên đề được nhóm theo chủ đề lớn cho dễ theo dõi.

## 2. Cách đưa lên GitHub Pages

1. Tạo một repository mới trên GitHub (ví dụ: `on-tap-12`).
2. Copy toàn bộ nội dung thư mục này (index.html, lichsu.html, tinhoc.html, quiz.html, profile.html, css/, js/, README.md) vào repository đó.
3. Commit & push lên GitHub.
4. Vào **Settings → Pages** của repository, chọn source là branch `main`, thư mục `/ (root)`.
5. Sau 1–2 phút, trang sẽ có địa chỉ dạng: `https://<ten-tai-khoan>.github.io/<ten-repo>/`.

Vì đây là trang web tĩnh (không có máy chủ/backend), bạn không cần cấu hình
gì thêm để website hoạt động — đăng ký/đăng nhập/làm bài đều chạy được ngay.
Phần cấu hình EmailJS ở mục 3 là **tuỳ chọn thêm**, chỉ cần nếu bạn muốn nhận
email mỗi khi có người đăng ký tài khoản mới.

## 3. Cấu hình gửi email thông báo khi có người đăng ký (EmailJS)

Vì GitHub Pages chỉ phục vụ file tĩnh, không thể tự gửi email từ máy chủ.
Giải pháp khả thi và miễn phí là dùng dịch vụ **EmailJS** (gửi email thẳng
từ JavaScript phía trình duyệt, không cần backend).

Các bước cấu hình (khoảng 5–10 phút, làm 1 lần duy nhất):

1. Truy cập https://www.emailjs.com và **Sign Up** (có gói miễn phí, đủ dùng cho vài trăm email/tháng).
2. Vào **Email Services → Add New Service**, chọn Gmail, đăng nhập và cho phép kết nối với Gmail `phmduc9002@gmail.com` của bạn. Sau khi tạo xong, bạn sẽ có một **Service ID** (ví dụ: `service_abc1234`).
3. Vào **Email Templates → Create New Template**. Đặt nội dung mẫu, ví dụ:
   - To Email: `{{to_email}}`
   - Subject: `Có tài khoản mới đăng ký - {{username}}`
   - Nội dung:
     ```
     Có người vừa đăng ký tài khoản mới trên website Ôn tập 12:

     Họ tên: {{fullname}}
     Tên đăng nhập: {{username}}
     Email: {{email}}
     Thời gian đăng ký: {{registered_at}}
     ```
   - Lưu lại, bạn sẽ có một **Template ID** (ví dụ: `template_xyz789`).
4. Vào **Account → General**, lấy **Public Key** của bạn (ví dụ: `AbCdEfGhIjKlMnOp`).
5. Mở file `js/auth.js`, tìm đoạn:
   ```js
   const EMAILJS_CONFIG = {
     PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
     SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
     TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
     ADMIN_EMAIL: "phmduc9002@gmail.com",
   };
   ```
   và thay 3 dòng đầu bằng Public Key / Service ID / Template ID bạn vừa lấy được. Giữ nguyên `ADMIN_EMAIL` (hoặc đổi sang email khác nếu muốn).
6. Commit & push lại lên GitHub. Từ lúc này, mỗi khi có người đăng ký tài khoản mới trên trang, bạn sẽ nhận được 1 email thông báo.

## 4. Cấu hình gửi mã xác thực "Quên mật khẩu" (template EmailJS thứ 2)

Tính năng "Quên mật khẩu" cần gửi mã xác thực đến **email của người dùng**
(khác với email thông báo đăng ký ở mục 3 là gửi cho bạn). Vì nội dung và
người nhận khác nhau, bạn cần tạo **thêm 1 template EmailJS mới**:

1. Vào **Email Templates → Create New Template**, chọn mẫu bất kỳ (ví dụ "Contact Us") rồi bấm **Create Template**.
2. Sửa lại:
   - To Email: `{{to_email}}`
   - Subject: `Mã xác thực đặt lại mật khẩu - {{username}}`
   - Nội dung:
     ```
     Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản {{username}}
     trên website Ôn tập 12.

     Mã xác thực của bạn là: {{code}}

     Mã có hiệu lực trong {{expires_in}}. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.
     ```
3. Lưu lại, bạn sẽ có thêm 1 **Template ID** mới (khác với template thông báo đăng ký ở mục 3).
4. Mở file `js/auth.js`, tìm dòng:
   ```js
   OTP_TEMPLATE_ID: "YOUR_EMAILJS_OTP_TEMPLATE_ID",
   ```
   và thay bằng Template ID vừa tạo.
5. Commit & push lại lên GitHub.

Nếu chưa cấu hình mục này, tính năng "Quên mật khẩu" vẫn chạy (tạo mã, lưu vào
tài khoản) nhưng sẽ **không gửi được email** chứa mã cho người dùng — người
dùng cần liên hệ bạn để được hỗ trợ lấy lại mật khẩu trong trường hợp đó.

**Lưu ý quan trọng:** vì tài khoản chỉ được lưu trong `localStorage` của từng
trình duyệt (xem mục 5), tính năng "Quên mật khẩu" chỉ hoạt động khi người
dùng thao tác **trên đúng trình duyệt/thiết bị** mà họ đã đăng ký tài khoản.
Nếu đổi sang trình duyệt hoặc thiết bị khác, hệ thống sẽ báo "không tìm thấy
tài khoản này trên trình duyệt hiện tại".

Nếu bạn **chưa muốn cấu hình EmailJS ngay**, trang vẫn hoạt động đầy đủ bình
thường (đăng ký/đăng nhập/làm bài), chỉ là sẽ không có email thông báo được
gửi đi — và bạn sẽ thấy dòng cảnh báo nhỏ trong Console trình duyệt (F12),
không ảnh hưởng đến người dùng.

## 5. Giới hạn kỹ thuật cần biết (quan trọng)

Vì đây là một trang web **thuần tĩnh** (static site), chạy hoàn toàn trên
trình duyệt, không có máy chủ và không có cơ sở dữ liệu thật sự, nên:

- **Tài khoản được lưu trong `localStorage` của từng trình duyệt**, nghĩa là:
  - Nếu một người đăng ký tài khoản trên điện thoại, rồi mở bằng máy tính khác,
    tài khoản đó sẽ **không đăng nhập được** trên máy khác (vì dữ liệu không
    đồng bộ giữa các thiết bị/trình duyệt).
  - Nếu người dùng xoá dữ liệu trình duyệt (clear site data) thì tài khoản sẽ mất.
  - Bạn (chủ trang) **không có một nơi tập trung để xem danh sách tất cả tài khoản
    đã đăng ký** — cách duy nhất để biết có người đăng ký là qua email thông báo
    (mục 3) gửi về Gmail của bạn.
- Mật khẩu được băm (hash) đơn giản trước khi lưu, nhưng đây **không phải mã hoá
  bảo mật cấp sản xuất (production-grade)**. Không nên dùng cho dữ liệu nhạy cảm
  hoặc thu phí thật.
- Tiến độ của mỗi môn được lưu riêng biệt trong cùng 1 tài khoản (ví dụ
  `lichsu:5` và `tinhoc:5` là 2 mục khác nhau), nên không bị trùng/ghi đè lẫn nhau
  dù 2 môn đều có "Bài/Chuyên đề số 5".

**Nếu sau này bạn cần tài khoản thật sự dùng chung được trên mọi thiết bị** (có
cơ sở dữ liệu trung tâm), cách làm phổ biến và vẫn miễn phí là dùng
**Firebase Authentication + Firestore** của Google (có thể tích hợp thêm vào
đúng các file `js/auth.js` này). Đây là bước nâng cấp tuỳ chọn, không bắt buộc
để trang hoạt động.

## 6. Cấu trúc thư mục

```
├── index.html          # Trang chủ: chọn môn học + đăng nhập/đăng ký/quên mật khẩu
├── lichsu.html          # Trang môn Lịch sử: danh sách bài học + tiến độ
├── tinhoc.html          # Trang môn Tin học: danh sách chuyên đề + tiến độ
├── quiz.html            # Trang làm bài trắc nghiệm (dùng chung cho cả 2 môn, qua ?subject=)
├── profile.html         # Trang hồ sơ cá nhân (avatar, tiểu sử, đổi mật khẩu, lịch sử cả 2 môn)
├── css/style.css        # Giao diện chung (đỏ-vàng cho Lịch sử, xanh dương cho Tin học, có dark mode)
├── js/
│   ├── data.js           # Dữ liệu 601 câu hỏi Lịch sử 12 (QUIZ_DATA_LICHSU, LESSON_GROUPS_LICHSU)
│   ├── data_tinhoc.js    # Dữ liệu 113 câu hỏi Tin học 12 (QUIZ_DATA_TINHOC, LESSON_GROUPS_TINHOC)
│   ├── auth.js           # Đăng ký / đăng nhập / hồ sơ / quên mật khẩu / gửi email / dark mode
│   └── app.js            # Logic làm bài, chấm điểm, xem lại đáp án (dùng chung cho cả 2 môn)
└── README.md
```

## 7. Nguồn dữ liệu & cách sinh câu hỏi

- **Lịch sử 12**: chuyển thể tự động từ file tài liệu gốc "TRỌN BỘ CÂU HỎI TRẢ
  LỜI NGẮN — LỊCH SỬ 12" (Bài 1–17, trừ Bài 14 không có trong tài liệu gốc). Với
  mỗi câu hỏi gốc, đáp án đúng được giữ nguyên theo tài liệu; các đáp án nhiễu
  (phương án sai) được chọn ngẫu nhiên từ chính các đáp án khác trong cùng bài
  học (hoặc toàn bộ tài liệu nếu bài học không đủ dữ liệu), để đảm bảo cùng chủ
  đề/giai đoạn lịch sử. Một số câu có nhiều ý đúng (dạng liệt kê) được chuyển
  thành câu hỏi "chọn tất cả đáp án đúng".
- **Tin học 12**: chuyển thể từ "Đề cương ôn tập cuối học kỳ 1 — Tin học 12",
  gồm 2 phần trắc nghiệm có sẵn đáp án chuẩn trong tài liệu (không sinh đáp án
  tự động): 68 câu trắc nghiệm 1 đáp án đúng (A/B/C/D) và 45 câu "Đúng/Sai"
  (mỗi câu có 4 ý a/b/c/d, chuyển thành câu hỏi "chọn tất cả ý ĐÚNG"). Phần tự
  luận/bài tập tình huống của tài liệu gốc không phù hợp với hình thức trắc
  nghiệm nên không được đưa vào website.

Vì các phương án nhiễu của môn Lịch sử được sinh tự động, giáo viên/học sinh nên
đọc kỹ lại từng câu trước khi dùng để kiểm tra chính thức; đây là công cụ hỗ trợ
ôn tập, không thay thế tài liệu giáo khoa chính thức.
