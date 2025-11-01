# 📋 HƯỚNG DẪN SETUP WEBHOOK HOÀN CHỈNH

## ✅ Đã hoàn thành:

1. ✅ **Webhook Endpoint**: `/api/pancake-webhook`
2. ✅ **Queue API**: `/api/webhook-queue` (GET)
3. ✅ **Processed API**: `/api/webhook-processed` (POST)
4. ✅ **Webhook Processor**: Tự động poll và xử lý webhook data
5. ✅ **Auto-sync**: Tự động lưu vào localStorage

## 🚀 CÁC BƯỚC SETUP:

### Bước 1: Tạo bảng trong Supabase

1. **Vào Supabase Dashboard**: https://supabase.com/dashboard
2. **Chọn project**: `gbyeednwkfmiajwzwdzc`
3. **Vào SQL Editor**
4. **Chạy script**: Copy nội dung từ file `supabase/webhook_queue.sql` và chạy

Hoặc chạy trực tiếp:
```sql
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  store_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_processed ON webhook_queue(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_created_at ON webhook_queue(created_at DESC);
```

### Bước 2: Cấu hình Environment Variables (nếu cần)

Trong Vercel Dashboard:
1. Vào **Settings** → **Environment Variables**
2. Thêm (nếu chưa có):
   - `VITE_SUPABASE_URL`: `https://gbyeednwkfmiajwzwdzc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (đã có trong code)
   - `SUPABASE_SERVICE_ROLE_KEY`: (nếu cần, lấy từ Supabase Dashboard)

### Bước 3: Deploy lên Vercel

```bash
git add .
git commit -m "Add webhook processing system"
git push
```

### Bước 4: Cấu hình Webhook trong Pancake POS

1. **Vào Pancake POS Dashboard**
2. **Vào**: Cấu hình → Webhook - API
3. **Chọn tab**: "Webhook URL"
4. **Bật toggle**: "Webhook URL"
5. **Điền Địa chỉ**: 
   ```
   https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook
   ```
6. **Chọn Đối tác**: Có thể để trống hoặc "Custom"
7. **Chọn Dữ liệu**: 
   - ✅ Đơn hàng (Order)
   - ✅ Tồn kho (Inventory)
   - ✅ Khách hàng (Customer)
8. **Request Headers** (tùy chọn):
   - Key: `X-API-Key`
   - Value: `c35fe62e0ea24b3580d9910a1a6c3525`
9. **Email thông báo lỗi**: Thêm email của bạn
10. **Click**: "Lưu"

## 🔄 CÁCH HOẠT ĐỘNG:

### Flow 1: Webhook nhận dữ liệu
```
Pancake POS → Webhook Endpoint → Supabase (webhook_queue)
```

### Flow 2: Frontend xử lý dữ liệu
```
Frontend → Poll API → Lấy webhook data → Xử lý → Lưu localStorage → Đánh dấu processed
```

### Các Event được hỗ trợ:

1. **`product.created`** / **`product.updated`**
   - Tự động thêm/cập nhật sản phẩm vào localStorage

2. **`order.created`** / **`order.updated`**
   - Tự động thêm/cập nhật đơn hàng
   - Tự động tạo khách hàng nếu chưa có

3. **`customer.created`** / **`customer.updated`**
   - Tự động thêm/cập nhật khách hàng

4. **`inventory.updated`**
   - Tự động cập nhật tồn kho sản phẩm

## ⚙️ CẤU HÌNH:

### Thay đổi polling interval:
Trong `src/App.tsx`, thay đổi số `5000` (milliseconds):
```typescript
webhookProcessor.startPolling(5000); // 5 giây
```

### Bật/tắt webhook processing:
Webhook processor tự động bật khi:
- Pancake integration được bật trong Settings
- Ứng dụng được load

## 📊 MONITORING:

### Xem webhook logs:
1. **Vercel Dashboard** → **Functions** → `pancake-webhook`
2. Xem logs để debug

### Xem webhook queue:
1. **Supabase Dashboard** → **Table Editor** → `webhook_queue`
2. Xem các webhook đã nhận và trạng thái processed

## 🐛 TROUBLESHOOTING:

### Webhook không nhận được dữ liệu:
1. Kiểm tra webhook URL trong Pancake POS Dashboard
2. Kiểm tra logs trong Vercel Dashboard
3. Test webhook endpoint bằng Postman:
   ```bash
   POST https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook
   Content-Type: application/json
   
   {
     "event": "order.created",
     "data": { ... }
   }
   ```

### Dữ liệu không được xử lý:
1. Kiểm tra Supabase table `webhook_queue` có dữ liệu không
2. Kiểm tra console trong browser (F12)
3. Kiểm tra network tab xem API calls có thành công không

### Bảng webhook_queue chưa tồn tại:
- Chạy SQL script trong `supabase/webhook_queue.sql`
- Hoặc tạo bảng thủ công trong Supabase Dashboard

## ✅ TEST WEBHOOK:

### Test thủ công:
1. Tạo test order trong Pancake POS
2. Kiểm tra Supabase table `webhook_queue` có record mới không
3. Kiểm tra localStorage có dữ liệu mới không (F12 → Application → Local Storage)

### Test API:
```bash
# Lấy pending webhooks
curl https://anhuyhoadon-g3gc.vercel.app/api/webhook-queue?processed=false

# Đánh dấu processed
curl -X POST https://anhuyhoadon-g3gc.vercel.app/api/webhook-processed \
  -H "Content-Type: application/json" \
  -d '{"ids": ["uuid-here"]}'
```

## 🎉 HOÀN TẤT!

Sau khi setup xong:
- ✅ Pancake POS sẽ tự động gửi dữ liệu đến webhook
- ✅ Frontend sẽ tự động poll và xử lý
- ✅ Dữ liệu sẽ tự động được lưu vào localStorage
- ✅ Bạn sẽ thấy sản phẩm, đơn hàng, khách hàng tự động cập nhật!

