# 🎨 Visual Template Builder - Hướng dẫn sử dụng

## 🌟 Tính năng mới - UI kéo thả trực quan

Visual Template Builder là **công cụ thiết kế hóa đơn kéo thả** hoàn toàn mới, giúp bạn:
- ✅ Kéo thả components vào canvas
- ✅ Tùy chỉnh từng element chi tiết
- ✅ Xem trước real-time
- ✅ UI trực quan như các công cụ thiết kế chuyên nghiệp

---

## 🎯 Cách sử dụng

### **1. Truy cập Visual Builder**

```
🔗 http://localhost:5173/visual-builder
```

Hoặc click nút **"Visual Builder"** trên header trang chủ

---

### **2. Giao diện 3 cột**

#### **📦 Bên trái: Component Palette**
Danh sách các components có thể kéo vào canvas:

**BASIC** - Cơ bản:
- 📝 **Text Block**: Thêm text tùy chỉnh
- ➖ **Separator**: Đường kẻ ngang

**COMPANY** - Thông tin công ty:
- 🖼️ **Company Logo**: Logo công ty
- 🏢 **Company Name**: Tên công ty
- ℹ️ **Company Info**: Địa chỉ, SĐT, email

**ORDER** - Thông tin đơn hàng:
- #️⃣ **Order Number**: Số hóa đơn
- 📄 **Order Info**: Ngày tạo, tracking, status

**CUSTOMER** - Thông tin khách hàng:
- 👤 **Customer Info**: Tên, SĐT, địa chỉ KH

**CONTENT** - Nội dung chính:
- 📊 **Products Table**: Bảng sản phẩm
- 💰 **Payment Summary**: Tổng tiền, thanh toán, còn lại
- 📝 **Notes**: Ghi chú đơn hàng

**LAYOUT** - Bố cục:
- 📌 **Footer**: Footer text
- ➕ **Custom Field**: Trường tùy chỉnh

---

#### **🎨 Giữa: Canvas**

Canvas A4 (595px x 842px) - Nơi bạn thiết kế hóa đơn:

**Kéo thả components:**
1. Click giữ component từ palette bên trái
2. Kéo vào canvas giữa màn hình
3. Thả chuột để thêm component

**Thao tác với elements:**
- **Click** vào element để chọn → Properties panel bên phải hiện settings
- **Copy button** (📋): Nhân bản element
- **Delete button** (🗑️): Xóa element
- Element được chọn có border màu xanh

---

#### **⚙️ Bên phải: Properties Panel**

Tùy chỉnh element đang chọn:

**Khi KHÔNG chọn element nào** → Canvas Settings:
- **Page Setup**: Orientation, padding
- **Global Colors**: Primary, Accent, Text, Border colors

**Khi ĐÃ chọn element** → Element Settings:

1. **Element Type**: Loại component
2. **Content**:
   - Show Label: Bật/tắt nhãn
   - Label Text: Text nhãn
   - Text: Nội dung chính
3. **Style**:
   - Font Size (px)
   - Font Weight: Normal / Semibold / Bold
   - Text Align: Left / Center / Right
   - Text Color: Chọn màu chữ
   - Padding (px): Khoảng cách trong
4. **Visibility**:
   - Visible: Hiện/ẩn element

---

### **3. Quy trình thiết kế**

#### **Bước 1: Thêm components cơ bản** (2 phút)
Kéo thả các components theo thứ tự:
1. **Company Logo** → Góc trên trái
2. **Company Name** → Bên cạnh logo
3. **Company Info** → Dưới company name
4. **Order Number** → Góc trên phải
5. **Separator** → Ngăn cách header

#### **Bước 2: Thêm thông tin** (2 phút)
6. **Order Info** → Bên trái
7. **Customer Info** → Bên phải
8. **Separator** → Ngăn cách

#### **Bước 3: Thêm nội dung chính** (1 phút)
9. **Products Table** → Bảng sản phẩm
10. **Payment Summary** → Tổng tiền
11. **Notes** (optional) → Ghi chú
12. **Footer** → Lời cảm ơn

#### **Bước 4: Tùy chỉnh chi tiết** (3-5 phút)
- Click vào từng element
- Điều chỉnh font size, color, align
- Thêm/sửa text content
- Bật/tắt label

#### **Bước 5: Lưu template** (10 giây)
- Click **"Save"** ở góc phải trên
- Template được lưu và sẵn sàng sử dụng

---

## 🎨 Ví dụ thiết kế

### **Template 1: Classic** 📄
```
[Logo] [Company Name]          [#ORDER-001]
       [Company Info]           [Status Badge]
─────────────────────────────────────────────
[Order Info]                [Customer Info]
─────────────────────────────────────────────
[Products Table]
─────────────────────────────────────────────
                        [Payment Summary]
─────────────────────────────────────────────
[Notes]
─────────────────────────────────────────────
              [Footer Text]
```

### **Template 2: Modern** ✨
```
[Company Name] (no logo)                #[ORDER-001]
[Company Info]                          [Status]
════════════════════════════════════════════════

[Customer Info]                    [Order Info]
                                   [Tracking #]

[Products Table]
════════════════════════════════════════════════

                              [Payment Summary]

[Footer with 2-line text]
```

### **Template 3: Minimal** 🎯
```
[Company Name]                          #[ORDER]

[Products Table]
                                [Payment: 5,000,000đ]

[Footer]
```

---

## 💡 Tips & Best Practices

### **Thiết kế:**
1. **Bắt đầu từ trên xuống**: Header → Info → Content → Footer
2. **Sử dụng Separator**: Ngăn cách các section rõ ràng
3. **Alignment**: Company info trái, Order number phải
4. **Hierarchy**: Company Name lớn nhất (24px), tiêu đề 16px, body 13px
5. **Whitespace**: Padding hợp lý (10-15px) để dễ đọc

### **Content:**
1. **Logo**: Max 100x60px để không chiếm quá nhiều không gian
2. **Company Name**: Bold, 22-26px, màu primary
3. **Order Number**: Bold, 18-22px, align right
4. **Products Table**: Luôn là phần lớn nhất
5. **Payment Summary**: Align right, bold cho tổng cộng

### **Colors:**
1. **Primary**: Dùng cho heading quan trọng
2. **Accent**: Dùng cho số tiền, status
3. **Text**: #1f2937 (đen nhạt) dễ đọc
4. **Border**: #e5e7eb (xám nhạt) không chói

### **Performance:**
1. **Không thêm quá nhiều elements** (< 20 là tốt)
2. **Text Block**: Dùng thay vì nhiều custom fields
3. **Copy elements** thay vì tạo mới khi có nhiều fields giống nhau

---

## 🚀 Workflows phổ biến

### **Workflow 1: Thiết kế từ đầu** (10 phút)
1. Truy cập Visual Builder
2. Kéo thả 10-12 components cần thiết
3. Click từng element để tùy chỉnh
4. Điều chỉnh colors ở Canvas Settings
5. Save template

### **Workflow 2: Sửa template hiện có** (5 phút)
1. Load template hiện có (tính năng sắp ra mắt)
2. Click elements cần sửa
3. Thay đổi content/style
4. Save lại

### **Workflow 3: Nhân bản và chỉnh sửa** (3 phút)
1. Load template A
2. Click Copy trên các elements cần nhân bản
3. Sửa nội dung các bản copy
4. Save as new template

---

## ❓ FAQ - Câu hỏi thường gặp

### **Q: Canvas Settings ở đâu?**
A: Khi KHÔNG chọn element nào, Properties Panel bên phải sẽ hiển thị Canvas Settings

### **Q: Làm sao để xóa element?**
A: Click vào element trong canvas, sau đó click nút 🗑️ (Trash) ở góc phải trên element

### **Q: Element có thể chồng lên nhau không?**
A: Hiện tại chưa hỗ trợ absolute positioning. Elements sẽ xếp theo thứ tự từ trên xuống dưới

### **Q: Làm sao để thay đổi thứ tự elements?**
A: Hiện tại elements sắp xếp theo thứ tự thêm vào. Tính năng drag to reorder đang phát triển

### **Q: Template có áp dụng cho tất cả đơn hàng không?**
A: Có! Template sau khi Save sẽ tự động áp dụng cho tất cả đơn hàng

### **Q: Có thể có nhiều templates không?**
A: Hiện tại 1 template active. Tính năng multiple templates đang phát triển

### **Q: Dữ liệu từ đâu?**
A: Dynamic fields (orderNumber, customerName, v.v.) sẽ tự động lấy từ data đơn hàng

### **Q: In hóa đơn có giống preview không?**
A: Có! Template được thiết kế để in đúng như preview trên canvas

---

## 🎯 So sánh với Template Designer cũ

| Tính năng | Template Designer | Visual Builder | Winner |
|-----------|------------------|----------------|---------|
| **UI** | Tabs + Forms | Drag & Drop Canvas | ✅ Visual |
| **Dễ sử dụng** | Trung bình | Rất dễ | ✅ Visual |
| **Tùy chỉnh** | Chi tiết | Chi tiết | 🤝 Ngang nhau |
| **Trực quan** | ❌ Không | ✅ Có | ✅ Visual |
| **Tốc độ** | Nhanh | Trung bình | ✅ Designer |
| **Custom Fields** | ✅ Có | ⏳ Đang phát triển | ✅ Designer |
| **Logo Upload** | ✅ Có | ⏳ Đang phát triển | ✅ Designer |

**Kết luận**: Visual Builder tốt hơn cho **người mới** và **thiết kế trực quan**. Template Designer tốt hơn cho **power users** cần nhiều options.

---

## 🔮 Tính năng sắp ra mắt

- [ ] Drag to reorder elements
- [ ] Absolute positioning (đặt elements tự do)
- [ ] Multi-column layout
- [ ] Logo upload trong builder
- [ ] More element types (Image, QR Code, Barcode)
- [ ] Template library với templates có sẵn
- [ ] Export/Import templates
- [ ] Undo/Redo
- [ ] Keyboard shortcuts
- [ ] Grid & alignment guides
- [ ] Element grouping

---

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc có đề xuất tính năng mới, vui lòng liên hệ!

**Chúc bạn thiết kế hóa đơn đẹp!** 🎨✨

