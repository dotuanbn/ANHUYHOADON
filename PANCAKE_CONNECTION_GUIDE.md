# 📋 HƯỚNG DẪN KẾT NỐI PANCAKE POS API

## ✅ Thông tin đã có:
- **API Key**: `c35fe62e0ea24b3580d9910a1a6c3525`
- **Store ID**: `100053861`

## 🔧 Cấu hình trong Settings:

### 1. Bật tích hợp Pancake POS
- Vào **Settings** → **Tích hợp Pancake POS**
- Bật switch **"Bật tích hợp Pancake POS"**

### 2. Điền thông tin:
- **API Key**: `c35fe62e0ea24b3580d9910a1a6c3525`
- **API Secret**: Để trống (sẽ tự động dùng API Key)
- **Base URL**: Để trống (hệ thống sẽ tự động tìm Base URL đúng)
- **Store ID**: `100053861`

### 3. Kiểm tra kết nối:
- Click nút **"Kiểm tra kết nối"**
- Hệ thống sẽ tự động:
  - ✅ Thử các Base URL khác nhau
  - ✅ Thử các phương thức authentication khác nhau
  - ✅ Tìm endpoint hoạt động
  - ✅ Tự động cập nhật Base URL và Auth Method khi tìm được

### 4. Nếu thành công:
- Base URL sẽ được tự động cập nhật vào trường Base URL
- Thông báo hiển thị chi tiết về Base URL và Auth Method đã tìm được
- Có thể bắt đầu đồng bộ ngay

### 5. Nếu thất bại:
- Xem chi tiết lỗi trong phần kết quả test
- Kiểm tra lại API Key và Store ID
- Thử các Base URL khác nhau thủ công nếu cần

## 🔍 Các Base URL hệ thống sẽ thử:
1. `https://api.pancake.vn/v1`
2. `https://api.pancake.vn`
3. `https://pos.pancake.vn/api/v1`
4. `https://pos.pancake.vn/api`
5. `https://openapi.pancake.vn/v1`

## 🔐 Các phương thức Authentication sẽ thử:
1. Bearer Token (Authorization: Bearer {API_KEY})
2. API Key Header (X-API-Key: {API_KEY})
3. API Key + Secret (X-API-Key + X-API-Secret)
4. API Key + Store ID (X-API-Key + X-Store-ID)
5. Bearer + Store ID (Authorization + X-Store-ID)
6. Default (Bearer + API Secret + Store ID)

## 🚀 Sau khi kết nối thành công:
- Click **"Lưu cấu hình"**
- Click **"Đồng bộ ngay"** để bắt đầu đồng bộ sản phẩm và đơn hàng

## 📝 Lưu ý:
- Hệ thống sử dụng proxy trong development để bypass CORS
- Base URL và Auth Method sẽ được tự động lưu khi tìm được cách kết nối thành công
- Có thể bật **"Tự động đồng bộ"** để hệ thống tự động đồng bộ theo khoảng thời gian đã cấu hình

