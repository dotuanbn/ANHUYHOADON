# 🎯 HƯỚNG DẪN SỬ DỤNG - PHIÊN BẢN 2.0

## 🚀 REFRESH NGAY ĐỂ XEM TÍNH NĂNG MỚI!

```
http://localhost:5173/invoice-builder
```

**BẤM F5 HOẶC CTRL+R**

---

## ⭐ 5 TÍNH NĂNG MỚI QUAN TRỌNG

### 1. 👁️ **XEM TRƯỚC (PREVIEW MODE)**

**Tại sao cần?** Xem invoice như khách hàng sẽ thấy - không có giao diện chỉnh sửa

**Cách dùng:**
```
Cách 1: Click nút "Preview" trên header
Cách 2: Bấm Ctrl+P

→ Sidebar biến mất
→ Grid biến mất  
→ Handles biến mất
→ Chỉ thấy nội dung thực!

Thoát: Click "Exit Preview" hoặc bấm Esc
```

**Khi nào dùng:**
- Sau khi thiết kế xong, muốn xem kết quả
- Trước khi save template
- Để check layout có đẹp không

---

### 2. 💾 **LƯU TEMPLATE**

**Tại sao cần?** Tạo 1 lần, dùng mãi mãi - không mất công thiết kế lại

**Cách lưu:**
```
1. Thiết kế invoice xong
2. Click nút "Save" (hoặc Ctrl+S)
3. Nhập tên template (VD: "Hóa đơn Nhà hàng")
4. Click "Save Template"
5. ✅ Đã lưu vào trình duyệt!
```

**Lưu ý:**
- Templates lưu trong trình duyệt (LocalStorage)
- Không mất khi tắt browser
- Có thể lưu nhiều templates

---

### 3. 📂 **TẢI TEMPLATE**

**Tại sao cần?** Dùng lại thiết kế đã lưu, tiết kiệm thời gian

**Cách tải:**
```
1. Click nút "Load"
2. Thấy grid các templates đã lưu
3. Click vào template muốn dùng
4. ✅ Load ngay lập tức!
```

**Xóa template:**
```
1. Click "Load"  
2. Click nút X (góc phải) trên template
3. Confirm
4. ✅ Đã xóa!
```

---

### 4. 🖱️ **MENU CHUỘT PHẢI (CONTEXT MENU)**

**Tại sao cần?** Actions nhanh không cần tìm buttons

**Cách dùng:**
```
1. Right-click vào element trên canvas
2. Thấy menu với options:
   - Duplicate (copy)
   - Lock/Unlock
   - Delete (xóa)
3. Click option muốn dùng
4. ✅ Thực hiện ngay!
```

**Tips:**
- Nhanh hơn tìm buttons ở sidebar
- Giữ chuột gần element đang chỉnh

---

### 5. ⌨️ **PHÍM TẮT (KEYBOARD SHORTCUTS)**

**Tại sao cần?** Làm việc NHANH HƠN 10 LẦN

**Shortcuts quan trọng:**
```
Ctrl+Z       →  Hoàn tác (Undo)
Ctrl+Y       →  Làm lại (Redo)
Ctrl+D       →  Copy element
Ctrl+S       →  Lưu template
Ctrl+P       →  Xem trước
Delete       →  Xóa element
Esc          →  Bỏ chọn / Thoát preview
```

**Xem tất cả shortcuts:**
```
Click nút keyboard icon (⌨️) trên header
```

---

## 🎯 WORKFLOW HOÀN CHỈNH

### Lần đầu tạo template (5-10 phút)

```
Bước 1: THIẾT KẾ
  1.1. Kéo "Heading" từ sidebar trái
  1.2. Thả vào canvas → Gõ "HÓA ĐƠN"
  1.3. Resize cho to
  1.4. Align Center (button ở toolbar)
  
  1.5. Kéo "Company Name" → Gõ tên công ty
  1.6. Kéo "Customer" → Gõ "Khách hàng:"
  1.7. Kéo "Products" → Table sản phẩm
  1.8. Kéo "Payment" → Tổng thanh toán
  1.9. Kéo "Footer" → Gõ "Cảm ơn quý khách"

Bước 2: CHỈNH SỬA
  2.1. Click element → Sidebar phải → Properties
  2.2. Đổi font size, màu, v.v.
  2.3. Move & resize để đẹp
  2.4. Lock các element header/footer

Bước 3: XEM TRƯỚC
  3.1. Bấm Ctrl+P
  3.2. Check xem đẹp chưa
  3.3. Bấm Esc để quay lại edit nếu cần

Bước 4: LƯU TEMPLATE
  4.1. Bấm Ctrl+S
  4.2. Gõ "Template Nhà Hàng"
  4.3. Save
  4.4. ✅ XONG!
```

### Lần sau dùng template (30 giây)

```
1. Vào builder
2. Click "Load"
3. Chọn "Template Nhà Hàng"
4. ✅ Load xong!
5. Chỉ cần sửa nội dung (tên khách, sản phẩm, giá)
6. Ctrl+P để xem
7. Export (coming soon) hoặc screenshot
```

---

## 💡 10 TIPS LÀM VIỆC HIỆU QUẢ

### 1. **Dùng shortcuts thay vì chuột**
```
Ctrl+D thay vì click "Duplicate"
Delete thay vì click "Delete"
Ctrl+P thay vì click "Preview"
→ Nhanh hơn 5x!
```

### 2. **Right-click cho actions nhanh**
```
Right-click → Duplicate → Done!
Không cần select → tìm sidebar → click button
```

### 3. **Lock elements đã xong**
```
Header/Footer thiết kế xong → Lock ngay
→ Tránh di chuyển nhầm khi edit phần khác
```

### 4. **Duplicate thay vì tạo mới**
```
Có element với style đẹp?
→ Ctrl+D để copy
→ Sửa nội dung
→ Tiết kiệm thời gian style lại!
```

### 5. **Preview thường xuyên**
```
Edit xong 1 phần → Ctrl+P để check
→ Phát hiện lỗi sớm
→ Dễ sửa hơn
```

### 6. **Đặt tên template rõ ràng**
```
❌ "Template 1"
✅ "Hóa đơn Nhà hàng - Theme Xanh"
✅ "Invoice Khách sạn - A4"
→ Dễ tìm sau này!
```

### 7. **Save nhiều versions**
```
Design 3 variations?
→ Save 3 templates:
  - "Invoice v1 - Minimalist"
  - "Invoice v2 - Colorful"  
  - "Invoice v3 - Professional"
→ Test và chọn version tốt nhất!
```

### 8. **Dùng Grid để align**
```
Grid (nút ⊞) giúp align chính xác
→ Elements thẳng hàng đẹp mắt
```

### 9. **Layers panel để manage nhiều elements**
```
Nhiều elements chồng chéo?
→ Tab "Layers" ở sidebar phải
→ Click layer để select element
→ Lock/Hide không cần nữa
```

### 10. **Học shortcuts bằng Help dialog**
```
Quên shortcut nào?
→ Click nút ⌨️ trên header
→ Xem tất cả shortcuts
→ Đóng và dùng ngay!
```

---

## 🎨 CÁC ELEMENT THƯỜNG DÙNG

### Cho Invoice nhà hàng:
```
1. Heading → "HÓA ĐƠN" (to, bold, center)
2. Company Name → Tên nhà hàng (bold)
3. Order # → Số order
4. Customer → Tên + SĐT khách
5. Products Table → Món ăn + Giá
6. Payment → Tổng cộng (to, bold)
7. Footer → "Cảm ơn quý khách" (small, center)
```

### Cho Invoice dịch vụ:
```
1. Heading → "PHIẾU DỊCH VỤ"
2. Company Name → Tên công ty
3. Order Info → Ngày, giờ dịch vụ
4. Customer → Thông tin khách hàng
5. Products Table → Các dịch vụ
6. Payment → Tổng thanh toán
7. Footer → "Hotline: 0123456789"
```

---

## 🚨 TROUBLESHOOTING

### Vấn đề: Không thấy button "Preview"
**Fix**: Refresh browser (F5) để load code mới

### Vấn đề: Save template nhưng không thấy khi Load
**Fix**: 
1. Check xem có nhập tên template không
2. Check browser storage (F12 → Application → Local Storage)
3. Thử save lại với tên khác

### Vấn đề: Template bị mất sau khi clear browser data
**Lý do**: Templates lưu trong browser (LocalStorage)
**Solution**: 
- Không clear browser data nếu muốn giữ templates
- Hoặc export templates ra file (feature coming soon)

### Vấn đề: Shortcuts không hoạt động
**Check**:
1. Có đang focus vào input field không? (Esc để thoát)
2. Có element nào được select không? (Esc để deselect)
3. Restart browser nếu cần

### Vấn đề: Context menu không xuất hiện
**Check**:
1. Đang ở Preview mode không? (Esc để thoát)
2. Right-click đúng vào element chưa?
3. Element có bị lock không?

---

## 📊 SO SÁNH: TRƯỚC VS SAU

### ❌ Trước (Version 1.0)
- Thiết kế xong → Không xem được preview
- Không lưu được → Phải làm lại mỗi lần
- Actions phải tìm buttons → Chậm
- Không có shortcuts → Chỉ dùng chuột
- UX cơ bản → Thiếu polish

### ✅ Sau (Version 2.0)
- **Ctrl+P** → Xem preview ngay
- **Ctrl+S** → Lưu template → Dùng mãi
- **Right-click** → Actions nhanh
- **7 shortcuts** → Làm việc nhanh hơn
- **Professional UX** → Smooth, đẹp mắt

---

## 🎯 THỰC HÀNH NGAY (15 PHÚT)

### Bài tập 1: Tạo invoice đơn giản (5 phút)
```
1. Add Heading "HÓA ĐƠN"
2. Add Customer "Khách hàng: Nguyễn Văn A"
3. Add Payment "Tổng: 500,000đ"
4. Ctrl+P để xem
5. ✅ Done!
```

### Bài tập 2: Test shortcuts (3 phút)
```
1. Add element
2. Ctrl+D → Check duplicated
3. Delete → Check deleted  
4. Ctrl+Z → Check undo
5. ✅ Quen shortcuts!
```

### Bài tập 3: Save & Load template (5 phút)
```
1. Tạo invoice (dùng bài tập 1)
2. Ctrl+S → Save "My First Template"
3. Clear canvas (button Trash)
4. Click "Load" → Chọn template
5. ✅ Load lại thành công!
```

### Bài tập 4: Context menu (2 phút)
```
1. Add element
2. Right-click
3. Chọn "Duplicate"
4. Right-click element mới
5. Chọn "Delete"
6. ✅ Quen context menu!
```

---

## 🎉 KẾT LUẬN

### Bây giờ bạn có thể:
✅ Thiết kế invoice chuyên nghiệp
✅ Xem trước kết quả (Preview)
✅ Lưu templates để dùng lại
✅ Làm việc nhanh với shortcuts
✅ Dùng right-click menu
✅ Quản lý layers hiệu quả

### Workflow hiệu quả:
```
Tạo 1 lần → Save template → Reuse mãi mãi
→ Tiết kiệm 90% thời gian!
```

---

## 🚀 BẮT ĐẦU NGAY!

```
http://localhost:5173/invoice-builder
```

**F5 → Làm theo bài tập 1 → 5 phút có invoice đầu tiên! 🎨**

---

**💡 Nhớ: Bấm nút ⌨️ để xem shortcuts khi quên!**









