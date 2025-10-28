# 🎨 Hướng dẫn sử dụng Invoice Designer

## 🎯 Tính năng đã hoàn thành 100%

### ✅ **Full Invoice Designer** - Cấp độ 3
Hệ thống tùy chỉnh hóa đơn hoàn chỉnh với khả năng:
- ✅ Upload logo công ty
- ✅ Tùy chỉnh màu sắc (7 màu độc lập)
- ✅ Tùy chỉnh font chữ và kích thước
- ✅ Thêm trường tùy chỉnh không giới hạn
- ✅ Điều chỉnh layout & lề trang
- ✅ Quản lý nhiều templates
- ✅ Áp dụng template cho tất cả đơn hàng
- ✅ In hóa đơn với template đã tùy chỉnh

---

## 🚀 Cách sử dụng

### **Bước 1: Truy cập Template Designer**

Có 2 cách:
1. Click nút **"Tùy chỉnh HĐ"** trên header trang chủ
2. Truy cập trực tiếp: `http://localhost:5173/template-designer`

---

### **Bước 2: Tùy chỉnh Template**

#### **Tab 📄 Công ty**

**Thông tin cơ bản:**
1. **Tên công ty**: Nhập tên công ty (VD: Bếp An Huy)
2. **Logo**:
   - Click "Choose File"
   - Chọn ảnh logo (PNG/JPG, tối đa 2MB)
   - Logo hiển thị preview ngay lập tức
   - Logo sẽ xuất hiện ở góc trên trái hóa đơn

3. **Thông tin liên hệ**:
   - Số điện thoại (VD: 1900-xxxx)
   - Email (VD: info@company.com)
   - Địa chỉ công ty
   - Website
   - Mã số thuế

---

#### **Tab 🎨 Màu sắc**

Tùy chỉnh 7 màu cho hóa đơn:

1. **Primary** (Màu chủ đạo):
   - Dùng cho: Tên công ty, Tổng cộng
   - Mặc định: #2563eb (xanh dương)

2. **Secondary** (Màu phụ):
   - Dùng cho: Các yếu tố phụ
   - Mặc định: #64748b (xám)

3. **Accent** (Màu nhấn):
   - Dùng cho: Đã thanh toán, số tiền giảm giá
   - Mặc định: #10b981 (xanh lá)

4. **Text** (Màu chữ chính):
   - Dùng cho: Nội dung chính
   - Mặc định: #1f2937 (đen nhạt)

5. **Text Light** (Màu chữ nhạt):
   - Dùng cho: Label, ghi chú
   - Mặc định: #6b7280 (xám nhạt)

6. **Border** (Màu viền):
   - Dùng cho: Viền bảng, separator
   - Mặc định: #e5e7eb (xám nhạt)

7. **Background** (Màu nền):
   - Dùng cho: Nền hóa đơn
   - Mặc định: #ffffff (trắng)

**Cách đổi màu:**
- Click vào ô màu
- Chọn màu từ color picker
- Màu thay đổi ngay lập tức

---

#### **Tab ✏️ Font chữ**

**Font Family:**
- Arial (Sans-serif) - Mặc định
- Times New Roman (Serif)
- Courier New (Monospace)
- Georgia (Serif)
- Verdana (Sans-serif)

**Font Sizes (px):**
- **H1**: Tiêu đề lớn nhất (Tên công ty) - Mặc định: 24px
- **H2**: Tiêu đề cấp 2 (Số đơn hàng) - Mặc định: 20px
- **H3**: Tiêu đề nhỏ (Section titles) - Mặc định: 16px
- **Body**: Nội dung chính - Mặc định: 13px
- **Small**: Chữ nhỏ (Footer, notes) - Mặc định: 11px

---

#### **Tab ➕ Trường tùy chỉnh**

Thêm các trường thông tin bổ sung:

**Cách thêm:**
1. Click **"Thêm trường"**
2. Điền thông tin:
   - **Tên trường**: VD: "Người giao hàng", "Mã đơn vị", "Ghi chú đặc biệt"
   - **Loại dữ liệu**:
     - Text: Chữ thường
     - Number: Số
     - Date: Ngày tháng
     - Textarea: Văn bản dài
   - **Vị trí hiển thị**:
     - Header: Ở đầu hóa đơn
     - Thông tin đơn: Cùng với ngày tạo, mã vận đơn...
     - Thông tin KH: Cùng với tên, SĐT khách hàng...
     - Footer: Ở cuối hóa đơn
   - **Hiển thị**: ON/OFF toggle
3. Click **Lưu**

**Quản lý:**
- Click icon **Trash** để xóa trường
- Toggle **Hiển thị** để ẩn/hiện trường mà không xóa

**Ví dụ trường tùy chỉnh:**
- Người giao hàng (Text) → Vị trí: Thông tin đơn
- Mã chi nhánh (Text) → Vị trí: Header
- Ghi chú nội bộ (Textarea) → Vị trí: Footer
- Số hợp đồng (Text) → Vị trí: Thông tin đơn
- Ngày hẹn giao (Date) → Vị trí: Thông tin đơn

---

#### **Tab 📐 Bố cục**

**Cài đặt trang:**
1. **Kích thước trang**:
   - A4 (210 x 297 mm) - Phổ biến ở Việt Nam
   - Letter (8.5 x 11 inch) - Phổ biến ở Mỹ

2. **Hướng trang**:
   - Dọc (Portrait) - Mặc định
   - Ngang (Landscape)

3. **Lề trang (mm)**:
   - Top: Lề trên (Mặc định: 12mm)
   - Right: Lề phải (Mặc định: 15mm)
   - Bottom: Lề dưới (Mặc định: 12mm)
   - Left: Lề trái (Mặc định: 15mm)

**Hiển thị:**
- **Hiển thị logo**: ON/OFF - Ẩn/hiện logo công ty
- **Hiển thị viền**: ON/OFF - Ẩn/hiện viền ngoài hóa đơn
- **Hiển thị QR Code**: ON/OFF - Ẩn/hiện mã QR (feature tương lai)

**Text Footer:**
Nhập lời cảm ơn hoặc thông tin liên hệ ở cuối hóa đơn.
VD:
```
Cảm ơn quý khách đã tin tưởng sử dụng sản phẩm của Bếp An Huy!
Để được hỗ trợ, vui lòng liên hệ: 1900-xxxx
```

---

### **Bước 3: Lưu Template**

Sau khi tùy chỉnh xong:
1. Click nút **"Lưu"** ở góc phải trên
2. Template được lưu và **tự động áp dụng** cho tất cả đơn hàng mới

---

### **Bước 4: Quản lý Templates**

#### **Tạo template mới:**
1. Click **"Tạo mới"**
2. Một template copy từ template hiện tại được tạo
3. Tên mặc định: "Template 2", "Template 3"...
4. Tùy chỉnh template mới
5. Click **"Lưu"**

#### **Nhân bản template:**
1. Chọn template muốn nhân bản từ sidebar
2. Click **"Nhân bản"**
3. Template copy được tạo với tên "(Copy)"
4. Tùy chỉnh và lưu

#### **Xóa template:**
1. Chọn template muốn xóa
2. Click **"Xóa"**
3. Xác nhận xóa
4. **Lưu ý**: Không xóa được template mặc định

#### **Chuyển đổi template:**
- Click vào template khác trong sidebar
- Template được load ngay lập tức
- Click "Lưu" để áp dụng cho đơn hàng

---

### **Bước 5: Xem kết quả**

#### **Xem trước:**
1. Click nút **"Xem trước"** trong Template Designer
2. Hoặc tạo/xem một đơn hàng bất kỳ
3. Vào chi tiết đơn hàng để xem template đã áp dụng

#### **In hóa đơn:**
1. Vào chi tiết đơn hàng (click vào đơn từ danh sách)
2. Click **"In đơn hàng"**
3. Hóa đơn hiển thị với:
   - Logo công ty (nếu bật)
   - Màu sắc đã tùy chỉnh
   - Font chữ đã chọn
   - Trường tùy chỉnh (nếu có)
   - Footer text

---

## 🎨 Use Cases & Examples

### **Case 1: Công ty cao cấp - Template sang trọng**
```
✅ Logo: Upload logo công ty
✅ Primary Color: #1a1a1a (Đen)
✅ Accent Color: #d4af37 (Vàng gold)
✅ Font: Georgia (Serif - sang trọng)
✅ Font Size H1: 28px (lớn hơn)
✅ Hiển thị viền: ON
✅ Footer: "Thank you for choosing our premium service"
```

### **Case 2: Công ty công nghệ - Template hiện đại**
```
✅ Logo: Logo tech startup
✅ Primary Color: #6366f1 (Indigo)
✅ Accent Color: #10b981 (Green)
✅ Font: Verdana (Sans-serif - hiện đại)
✅ Font Size: Mặc định
✅ Hiển thị viền: OFF (flat design)
✅ Trường tùy chỉnh: "Project Code", "Developer"
```

### **Case 3: Nhà hàng - Template ấm áp**
```
✅ Logo: Logo nhà hàng
✅ Primary Color: #dc2626 (Red)
✅ Accent Color: #f97316 (Orange)
✅ Font: Arial (dễ đọc)
✅ Font Size Body: 14px (lớn hơn)
✅ Trường tùy chỉnh: "Bàn số", "Phục vụ bởi", "Giờ vào"
✅ Footer: "Hẹn gặp lại quý khách!"
```

### **Case 4: Xây dựng - Template chuyên nghiệp**
```
✅ Logo: Logo công ty xây dựng
✅ Primary Color: #0369a1 (Blue dark)
✅ Accent Color: #f59e0b (Amber)
✅ Font: Arial
✅ Trường tùy chỉnh: 
   - "Số hợp đồng" (Header)
   - "Người giám sát" (Thông tin đơn)
   - "Địa điểm công trình" (Thông tin đơn)
✅ Footer: "Cam kết chất lượng - Uy tín hàng đầu"
```

---

## 📊 Tích hợp với Đơn hàng

### **Template tự động áp dụng:**
- ✅ Khi tạo đơn hàng mới
- ✅ Khi xem đơn hàng cũ
- ✅ Khi in hóa đơn
- ✅ Template active được sử dụng cho TẤT CẢ đơn hàng

### **Trường tùy chỉnh:**
Hiện tại trường tùy chỉnh được định nghĩa trong template nhưng:
- Giá trị mặc định: rỗng hoặc giá trị trong template
- **Tương lai**: Sẽ cho phép nhập giá trị cho từng đơn hàng

---

## 💡 Tips & Best Practices

### **Logo:**
- Dùng PNG với nền trong suốt
- Kích thước đề xuất: 200x80px hoặc tỷ lệ tương tự
- File size < 500KB để load nhanh

### **Màu sắc:**
- Chọn màu có độ tương phản tốt với nền trắng
- Primary color nên nổi bật nhưng không chói
- Text Light color đủ nhạt nhưng vẫn đọc được
- Test in thử để đảm bảo màu hiển thị tốt khi in

### **Font chữ:**
- Arial/Verdana: Dễ đọc, phù hợp đa số
- Times New Roman: Trang trọng, phù hợp văn bản chính thức
- Courier New: Dùng cho mã số, số hóa đơn

### **Font size:**
- Body không nên < 12px (khó đọc khi in)
- H1 không nên > 30px (quá lớn)
- Small không nên < 10px (quá nhỏ)

### **Trường tùy chỉnh:**
- Chỉ thêm trường thực sự cần thiết
- Tên trường ngắn gọn, rõ ràng
- Đặt đúng vị trí để layout cân đối

### **Layout:**
- A4 Portrait phù hợp cho hầu hết trường hợp
- Lề 12-15mm là an toàn cho máy in
- Lề quá nhỏ có thể bị cắt khi in

---

## 🔧 Troubleshooting

### **Logo không hiển thị:**
- Kiểm tra file ảnh có hợp lệ không
- Kiểm tra "Hiển thị logo" đã bật chưa
- Thử upload lại ảnh

### **Màu không đổi:**
- Nhớ click "Lưu" sau khi đổi màu
- Reload trang xem đơn hàng

### **Template không áp dụng:**
- Kiểm tra đã click "Lưu" chưa
- Template vừa lưu là template active
- Xem lại đơn hàng (F5)

### **Font size quá lớn/nhỏ:**
- Điều chỉnh từng loại font riêng
- Xem trước trước khi in
- Khuyến nghị: Body 12-14px, H1 22-26px

---

## 🎯 Kết luận

Bây giờ bạn có:
- ✅ Hệ thống Invoice Designer đầy đủ
- ✅ Tùy chỉnh HOÀN TOÀN giao diện hóa đơn
- ✅ Upload logo riêng
- ✅ Đổi màu sắc toàn bộ
- ✅ Thêm trường tùy chỉnh không giới hạn
- ✅ Quản lý nhiều templates
- ✅ In hóa đơn chuyên nghiệp

**Hãy thử nghiệm và tạo template phù hợp với thương hiệu của bạn!** 🚀

---

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần thêm tính năng, vui lòng liên hệ!

