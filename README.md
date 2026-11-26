# Trắc nghiệm Lịch sử 12 — Bài 1 đến Bài 17

Website trắc nghiệm ôn tập Lịch sử 12, chuyển thể tự động từ bộ tài liệu
"Câu hỏi trả lời ngắn" (601 câu hỏi, 16 bài học có nội dung: Bài 1–13, 15–17).
Chạy hoàn toàn bằng HTML/CSS/JavaScript thuần (không cần cài đặt gì), phù hợp
để host miễn phí trên **GitHub Pages**.

## 1. Tính năng

- Đăng ký / Đăng nhập tài khoản (lưu trong trình duyệt — xem mục "Giới hạn kỹ thuật" bên dưới).
- 16 bài học, mỗi bài có đúng số câu hỏi như trong tài liệu gốc (từ 15 đến 100 câu/bài).
- Chế độ "Ôn tập tổng hợp" (toàn bộ 601 câu) và "Trộn ngẫu nhiên 40 câu".
- Câu hỏi và đáp án được xáo trộn ngẫu nhiên mỗi lần làm bài.
- Có cả câu hỏi 1 đáp án đúng và câu hỏi nhiều đáp án đúng (ghi rõ trên câu hỏi).
- Chấm điểm, xem lại đáp án đúng/sai sau khi nộp bài.
- Lưu lại điểm cao nhất từng bài cho mỗi tài khoản.
- Gửi email thông báo về Gmail của bạn mỗi khi có người đăng ký tài khoản mới (cần cấu hình EmailJS — xem mục 3).

## 2. Cách đưa lên GitHub Pages

1. Tạo một repository mới trên GitHub (ví dụ: `trac-nghiem-lich-su-12`).
2. Copy toàn bộ nội dung thư mục này (index.html, quiz.html, css/, js/, README.md) vào repository đó.
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
     Có người vừa đăng ký tài khoản mới trên website Trắc nghiệm Lịch sử 12:

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

Nếu bạn **chưa muốn cấu hình EmailJS ngay**, trang vẫn hoạt động đầy đủ bình
thường (đăng ký/đăng nhập/làm bài), chỉ là sẽ không có email thông báo được
gửi đi — và bạn sẽ thấy dòng cảnh báo nhỏ trong Console trình duyệt (F12),
không ảnh hưởng đến người dùng.

## 4. Giới hạn kỹ thuật cần biết (quan trọng)

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

**Nếu sau này bạn cần tài khoản thật sự dùng chung được trên mọi thiết bị** (có
cơ sở dữ liệu trung tâm), cách làm phổ biến và vẫn miễn phí là dùng
**Firebase Authentication + Firestore** của Google (có thể tích hợp thêm vào
đúng các file `js/auth.js` này). Đây là bước nâng cấp tuỳ chọn, không bắt buộc
để trang hoạt động.

## 5. Cấu trúc thư mục

```
├── index.html        # Trang đăng nhập/đăng ký + danh sách bài học
├── quiz.html          # Trang làm bài trắc nghiệm
├── css/style.css      # Giao diện
├── js/
│   ├── data.js         # Dữ liệu 601 câu hỏi trắc nghiệm (tự sinh từ tài liệu gốc)
│   ├── auth.js         # Đăng ký / đăng nhập / gửi email thông báo
│   └── app.js          # Logic làm bài, chấm điểm, xem lại đáp án
└── README.md
```

## 6. Nguồn dữ liệu & cách sinh câu hỏi

Dữ liệu trắc nghiệm được chuyển thể tự động từ file tài liệu gốc "TRỌN BỘ CÂU
HỎI TRẢ LỜI NGẮN — LỊCH SỬ 12" (Bài 1–17, trừ Bài 14 không có trong tài liệu
gốc). Với mỗi câu hỏi gốc, đáp án đúng được giữ nguyên theo tài liệu; các đáp
án nhiễu (phương án sai) được chọn ngẫu nhiên từ chính các đáp án khác trong
cùng bài học (hoặc toàn bộ tài liệu nếu bài học không đủ dữ liệu), để đảm bảo
cùng chủ đề/giai đoạn lịch sử, tăng tính thử thách khi ôn tập. Một số câu có
nhiều ý đúng (dạng liệt kê) được chuyển thành câu hỏi "chọn tất cả đáp án đúng".

Vì các phương án nhiễu được sinh tự động, giáo viên/học sinh nên đọc kỹ lại
từng câu trước khi dùng để kiểm tra chính thức; đây là công cụ hỗ trợ ôn tập,
không thay thế tài liệu giáo khoa chính thức.
