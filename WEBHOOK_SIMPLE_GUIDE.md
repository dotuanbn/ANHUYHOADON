# 📋 HƯỚNG DẪN SỬ DỤNG WEBHOOK - KHÔNG CẦN API KEY

## ✅ QUAN TRỌNG:

**Webhook hoạt động tự động và KHÔNG CẦN API Key!**

Khi bạn đã cấu hình Webhook URL trong Pancake POS:
- ✅ **KHÔNG CẦN** điền API Key trong Settings
- ✅ **KHÔNG CẦN** ấn nút "Đồng bộ"
- ✅ Dữ liệu sẽ **TỰ ĐỘNG** được đồng bộ khi Pancake POS gửi webhook

## 🔄 WEBHOOK vs REST API:

### Webhook Mode (Khuyến nghị) ✅
- **Cần gì**: Chỉ cần bật toggle "Bật tích hợp Pancake POS" và cấu hình Webhook URL trong Pancake POS
- **Hoạt động**: Tự động, Pancake POS gửi dữ liệu khi có sự kiện
- **Cần API Key**: ❌ KHÔNG
- **Cần ấn đồng bộ**: ❌ KHÔNG

### REST API Mode
- **Cần gì**: API Key + API Secret + ấn nút đồng bộ
- **Hoạt động**: Thủ công, bạn phải ấn nút để đồng bộ
- **Cần API Key**: ✅ CÓ
- **Cần ấn đồng bộ**: ✅ CÓ

## 📝 CÁCH CẤU HÌNH WEBHOOK (Đơn giản nhất):

### Bước 1: Bật tích hợp trong Settings
1. Vào **Settings** → **Tích hợp Pancake POS**
2. **Bật toggle**: "Bật tích hợp Pancake POS"
3. **KHÔNG CẦN** điền API Key nếu chỉ dùng Webhook
4. Click **"Lưu cấu hình"**

### Bước 2: Cấu hình Webhook trong Pancake POS
1. Vào **Pancake POS Dashboard** → **Cấu hình** → **Webhook - API**
2. Chọn tab **"Webhook URL"**
3. **Bật toggle**: "Webhook URL"
4. **Điền địa chỉ**: `https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook`
5. **Chọn dữ liệu**: 
   - ✅ Đơn hàng
   - ✅ Tồn kho
   - ✅ Khách hàng
6. Click **"Lưu"**

### Bước 3: Xong!
- ✅ Webhook đã hoạt động
- ✅ Dữ liệu sẽ tự động được đồng bộ
- ✅ Không cần làm gì thêm!

## 🎯 KHI NÀO DÙNG WEBHOOK vs REST API:

### Dùng Webhook khi:
- ✅ Bạn muốn tự động đồng bộ dữ liệu
- ✅ Bạn không muốn phải ấn nút đồng bộ
- ✅ Bạn không có hoặc không muốn điền API Key
- ✅ Pancake POS hỗ trợ Webhook

### Dùng REST API khi:
- ✅ Bạn muốn đồng bộ thủ công theo yêu cầu
- ✅ Bạn muốn kiểm soát khi nào đồng bộ
- ✅ Bạn có API Key từ Pancake POS
- ✅ Bạn muốn đồng bộ dữ liệu cũ

## 🔍 KIỂM TRA WEBHOOK HOẠT ĐỘNG:

### Cách 1: Xem trong Console (F12)
- Mở Browser Console (F12)
- Xem log: `✅ Processed X webhook(s)`

### Cách 2: Tạo test order trong Pancake POS
- Tạo đơn hàng mới trong Pancake POS
- Đợi 5-10 giây
- Kiểm tra xem đơn hàng có xuất hiện trong hệ thống không

### Cách 3: Xem Supabase Dashboard
- Vào Supabase Dashboard → Table Editor → `webhook_queue`
- Xem các webhook đã nhận và trạng thái processed

## ⚠️ LƯU Ý:

1. **Webhook tự động hoạt động**: Không cần ấn đồng bộ, dữ liệu sẽ tự động xuất hiện

2. **Polling interval**: Hệ thống poll mỗi 5 giây để lấy webhook data mới

3. **Nếu không thấy dữ liệu**: 
   - Kiểm tra webhook URL trong Pancake POS đã đúng chưa
   - Kiểm tra toggle "Webhook URL" đã bật chưa
   - Kiểm tra logs trong Vercel Dashboard

4. **Có thể dùng cả 2**: Bạn có thể dùng cả Webhook (tự động) và REST API (thủ công) cùng lúc

## 🎉 KẾT LUẬN:

**Với Webhook, bạn chỉ cần:**
1. ✅ Bật toggle trong Settings
2. ✅ Cấu hình Webhook URL trong Pancake POS
3. ✅ Xong! Dữ liệu tự động đồng bộ

**KHÔNG CẦN:**
- ❌ API Key
- ❌ API Secret
- ❌ Ấn nút đồng bộ
- ❌ Làm gì thêm!

Hãy thử tạo một đơn hàng mới trong Pancake POS và xem nó tự động xuất hiện trong hệ thống của bạn! 🚀

