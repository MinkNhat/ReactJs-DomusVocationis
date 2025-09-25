## Domus Vocationis - Hệ thống quản lý tổ chức hoạt động từ thiện

Domus Vocationis ([tongvietbuong.online](tongvietbuong.online)) là website hỗ trợ quản lý hoạt động của các tổ chức từ thiện với giao diện thân thiện, đơn giản. Người dùng có thể dễ dàng quản lý thông tin cá nhân, theo dõi lịch trình hoạt động đã đăng ký, nhận thông báo và tham gia các bài khảo sát để đóng góp ý kiến cá nhân. Hệ thống giúp ban quản trị quản lý thông tin một cách tập trung, minh bạch và tiện lợi hơn, đồng thời hỗ trợ phân quyền linh động, giúp việc phân chia công việc trở nên dễ dàng và hiệu quả.

## Cài đặt và chạy hệ thống tại máy cá nhân

1. **Clone repository**  
   Clone repository về máy

2. **Cài đặt các thư viện cần thiết**  
   Cài đặt các thư viện cần thiết bằng lệnh

   ```bash
   npm install
   ```

3. **Tạo file môi trường .env**  
   Tạo file môi trường .env.development với nội dung:

   ```bash
   NODE_ENV=development
   PORT=3000
   VITE_BACKEND_URL=<default = http://localhost:8080>
   VITE_ACL_ENABLE=true
   VITE_USER_CREATE_DEFAULT_PASSWORD=<default password when import user>
   ```

4. **Cài đặt các thư viện cần thiết**  
   Chạy ứng dụng và truy cập tại http://localhost:3000

   ```bash
   npm run dev
   ```
