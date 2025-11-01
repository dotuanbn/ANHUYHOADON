# 🔗 HƯỚNG DẪN TÍCH HỢP WEBHOOK PANCAKE POS

## ✅ Có thể kết nối bằng Webhook URL!

Webhook là cách tốt hơn để đồng bộ dữ liệu từ Pancake POS vì:
- ✅ Pancake POS tự động gửi dữ liệu khi có sự kiện (đơn hàng mới, cập nhật tồn kho, etc.)
- ✅ Không cần gọi API trực tiếp
- ✅ Dữ liệu được cập nhật real-time
- ✅ Không gặp vấn đề CORS

## 📋 CÁCH THIẾT LẬP WEBHOOK

### Bước 1: Tạo Webhook Endpoint

Bạn có 2 lựa chọn:

#### Option A: Sử dụng Vercel Serverless Functions (Khuyến nghị)

1. **Tạo file**: `api/pancake-webhook.ts` trong project
2. **Deploy lên Vercel**: Vercel sẽ tự động tạo endpoint
3. **URL sẽ là**: `https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook`

#### Option B: Sử dụng ngrok để test local (Development)

1. **Cài đặt ngrok**: 
   ```bash
   npm install -g ngrok
   # hoặc download từ https://ngrok.com
   ```

2. **Chạy ngrok**:
   ```bash
   ngrok http 5173
   ```

3. **Lấy URL**: Ngrok sẽ cung cấp URL như `https://abc123.ngrok.io`
4. **Webhook URL**: `https://abc123.ngrok.io/api/pancake-webhook`

### Bước 2: Cấu hình trong Pancake POS Dashboard

1. **Đăng nhập** vào Pancake POS Dashboard
2. **Vào**: Cấu hình → Webhook - API
3. **Chọn tab**: "Webhook URL"
4. **Bật toggle**: "Webhook URL"
5. **Điền Địa chỉ**: 
   - Production: `https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook`
   - Development: `https://your-ngrok-url.ngrok.io/api/pancake-webhook`
6. **Chọn Đối tác**: Có thể để trống hoặc chọn "Custom"
7. **Chọn Dữ liệu**: 
   - ✅ Đơn hàng (Order)
   - ✅ Tồn kho (Inventory)
   - ✅ Khách hàng (Customer)
8. **Request Headers** (nếu cần):
   - Key: `X-API-Key`
   - Value: `c35fe62e0ea24b3580d9910a1a6c3525`
9. **Email thông báo lỗi**: Thêm email của bạn để nhận thông báo nếu webhook fail
10. **Click**: "Lưu"

### Bước 3: Test Webhook

1. **Tạo test order** trong Pancake POS
2. **Kiểm tra logs** trong Vercel Dashboard hoặc ngrok interface
3. **Xem dữ liệu** đã được nhận và xử lý chưa

## 🔧 CẤU TRÚC WEBHOOK PAYLOAD

Pancake POS sẽ gửi payload với format:

```json
{
  "event": "order.created" | "order.updated" | "product.created" | "product.updated" | "customer.created" | "customer.updated" | "inventory.updated",
  "data": {
    // Dữ liệu đơn hàng/sản phẩm/khách hàng
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "store_id": "100053861"
}
```

## 📝 CÁC EVENT CÓ THỂ NHẬN

- `order.created` - Đơn hàng mới được tạo
- `order.updated` - Đơn hàng được cập nhật
- `product.created` - Sản phẩm mới được tạo
- `product.updated` - Sản phẩm được cập nhật
- `customer.created` - Khách hàng mới được tạo
- `customer.updated` - Khách hàng được cập nhật
- `inventory.updated` - Tồn kho được cập nhật

## 🚀 IMPLEMENTATION

Tôi đã tạo:
1. ✅ `src/lib/pancakeWebhook.ts` - Handler để xử lý webhook payload
2. ✅ `api/pancake-webhook.ts` - Vercel Serverless Function endpoint

## ⚠️ LƯU Ý

1. **Production URL**: Sau khi deploy lên Vercel, URL sẽ là:
   ```
   https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook
   ```

2. **Security**: Nên thêm verification signature để đảm bảo webhook đến từ Pancake POS

3. **Error Handling**: Pancake POS sẽ gửi email nếu webhook fail, hãy kiểm tra và fix lỗi

4. **Testing**: Dùng ngrok để test local trước khi deploy

## 🔄 SO SÁNH WEBHOOK vs REST API

| | Webhook | REST API |
|---|---|---|
| **Hướng** | Pancake → Hệ thống | Hệ thống → Pancake |
| **Real-time** | ✅ Có | ❌ Phải polling |
| **CORS** | ✅ Không có vấn đề | ❌ Có thể gặp CORS |
| **Setup** | Cần server endpoint | Cần API Key |
| **Dữ liệu** | Tự động gửi | Phải gọi API |

## ✅ KẾT LUẬN

**Webhook là cách tốt nhất** để tích hợp với Pancake POS vì:
- Không cần lo về CORS
- Dữ liệu được cập nhật tự động
- Pancake POS sẽ gửi dữ liệu khi có sự kiện

Hãy thiết lập webhook endpoint và cấu hình trong Pancake POS Dashboard!

