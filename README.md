# BestCode - Secure Authentication & Cryptography Module

Dự án này là một hệ thống xác thực bảo mật cao (Secure Auth) và bộ công cụ mã hóa (BestCode Tools), được xây dựng tuân thủ tiêu chuẩn **NIST SP 800-63B**.

## 🚀 Tính năng nổi bật

### 1. Bảo mật Xác thực (Secure Authentication)
-   **Blacklist thông minh**: Tích hợp **108,000+** mật khẩu phổ biến (RockYou, Top 200).
-   **Tiered Rate Limiting (Chặn phân cấp)**:
    -   Sai 2 lần: Khóa **30s**.
    -   Sai 3 lần: Khóa **60s**.
    -   Sai 4 lần: Khóa **120s**.
    -   Sai 5 lần: Khóa **5 phút**.
-   **Password Strength Meter**: Đánh giá thời gian thực bằng thư viện `zxcvbn`.
-   **Argon2 Hashing**: Lưu trữ mật khẩu an toàn với thuật toán memory-hard.

### 2. Bộ công cụ Mã hóa (Crypto Tools)
Giao diện **Retro dCode Style** tích hợp các công cụ học tập:
-   **Mã hóa Caesar**: Dịch chuyển k tự.
-   **Mã hóa Vigenère**: Dùng từ khóa (Key).
-   **Hàm băm (Hashing)**: MD5, SHA-1, SHA-256.

## 🛠 Công nghệ sử dụng
-   **Backend**: Node.js, Express.js.
-   **Security**: `argon2`, `zxcvbn`, `express-rate-limit`.
-   **Frontend**: HTML5, CSS3 (Retro Style), Vanilla JS.
-   **Data**: JSON (In-memory / File-based blacklist).

## 📦 Cài đặt và Chạy

1.  Cài đặt dependencies:
    ```bash
    npm install
    ```

2.  Cấu hình Database (Optional - Mặc định chạy In-Memory cho Demo):
    -   Tạo file `.env` nếu cần kết nối MongoDB thật.

3.  Chạy server:
    ```bash
    npm start
    ```
    Truy cập: `http://localhost:3001`

## 🐳 Docker Support
```bash
docker build -t bestcode-auth .
docker run -p 3001:3001 bestcode-auth
```
