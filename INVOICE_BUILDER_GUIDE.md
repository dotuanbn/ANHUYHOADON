# 🎨 HƯỚNG DẪN SỬ DỤNG INVOICE BUILDER

## 🚀 Giới thiệu

**Advanced Invoice Builder** là công cụ thiết kế hóa đơn trực quan giống **Figma**, cho phép bạn:

- ✅ **Kéo thả tự do** - Đặt elements bất kỳ đâu trên canvas
- ✅ **Resize elements** - Thay đổi kích thước linh hoạt
- ✅ **Styling đầy đủ** - Màu sắc, font, borders, opacity
- ✅ **Layers panel** - Quản lý tất cả elements
- ✅ **Undo/Redo** - Hoàn tác mọi thao tác
- ✅ **Align tools** - Căn chỉnh tự động
- ✅ **Real-time preview** - Xem trước ngay lập tức

---

## 🎯 Truy cập Invoice Builder

### Từ trang chủ:
```
http://localhost:4173/
```
Click button **"Invoice Builder"** (màu tím) ở góc trên bên phải

### Hoặc truy cập trực tiếp:
```
http://localhost:4173/invoice-builder
```

---

## 📚 HƯỚNG DẪN SỬ DỤNG

### 1️⃣ COMPONENTS PALETTE (Bảng chọn thành phần)

**Vị trí**: Sidebar bên trái

**Các components có sẵn**:

#### 📦 Basic
- **Text** - Text thường
- **Heading** - Tiêu đề lớn
- **Divider** - Đường kẻ ngang

#### 🏢 Company  
- **Logo** - Logo công ty
- **Company Name** - Tên công ty

#### 📝 Order
- **Order #** - Số đơn hàng
- **Order Info** - Thông tin đơn hàng

#### 👤 Customer
- **Customer** - Thông tin khách hàng

#### 📊 Content
- **Products** - Bảng sản phẩm
- **Payment** - Tổng thanh toán

#### 🎨 Layout
- **Footer** - Chân trang

**Cách sử dụng**:
1. Chọn component muốn thêm
2. **Kéo** từ sidebar
3. **Thả** vào canvas (vùng trắng chính giữa)

---

### 2️⃣ CANVAS (Khu vực thiết kế)

**Vị trí**: Giữa màn hình

**Kích thước**: A4 (794 x 1123 pixels)

#### Thao tác trên Canvas:

##### Thêm element:
- Kéo component từ palette → thả vào canvas

##### Di chuyển element:
- Click và kéo element đến vị trí mới

##### Resize element:
- Click chọn element
- Kéo các **resize handles** (chấm tròn màu xanh):
  - **4 góc** - Resize cả chiều rộng và cao
  - **4 cạnh** - Resize theo chiều dọc/ngang

##### Chọn element:
- Click vào element để chọn
- Element được chọn có **viền xanh**
- Click vào canvas trống để bỏ chọn

---

### 3️⃣ TOOLBAR (Thanh công cụ)

**Vị trí**: Phía trên canvas

#### Công cụ có sẵn:

**🔲 Grid Toggle**
- Bật/tắt lưới hỗ trợ căn chỉnh

**📐 Alignment Tools**
- **Align Left** - Căn trái
- **Align Center** - Căn giữa
- **Align Right** - Căn phải

**🔍 Zoom Controls**
- **Zoom Out** - Thu nhỏ
- **Zoom In** - Phóng to
- **Fit** - Reset về 100%

**↩️ History**
- **Undo** - Hoàn tác (Ctrl+Z)
- **Redo** - Làm lại (Ctrl+Y)

---

### 4️⃣ PROPERTIES PANEL (Bảng thuộc tính)

**Vị trí**: Sidebar bên phải → Tab "Properties"

**Chỉnh sửa element đã chọn**:

#### 📍 Position & Size
- **X, Y** - Vị trí trên canvas
- **Width, Height** - Kích thước element

#### 📝 Content
- **Text content** - Nội dung hiển thị

#### 🎨 Style
- **Font Size** - Kích thước chữ (px)
- **Text Color** - Màu chữ
- **Background** - Màu nền
- **Border Width** - Độ dày viền (px)
- **Border Radius** - Bo tròn góc (px)
- **Opacity** - Độ trong suốt (0-1)

#### ⚡ Actions
- **Duplicate** - Nhân bản element
- **Delete** - Xóa element

---

### 5️⃣ LAYERS PANEL (Bảng lớp)

**Vị trí**: Sidebar bên phải → Tab "Layers"

**Chức năng**:
- Hiển thị **tất cả elements** trên canvas
- Sắp xếp theo **z-index** (lớp trên cùng ở đầu)
- Click vào layer để **chọn element**
- Icon **mắt** để ẩn/hiện element

---

## 🎯 WORKFLOW THIẾT KẾ THỰC TẾ

### Bước 1: Thêm Header
```
1. Kéo "Logo" vào góc trên trái
2. Resize logo: 100 x 60 px
3. Kéo "Company Name" vào cạnh logo
4. Edit content: "Bếp An Huy"
5. Tăng font size: 24px, bold
```

### Bước 2: Thêm Order Info
```
1. Kéo "Order #" vào góc trên phải
2. Align Right
3. Edit content: "#DH-001"
4. Kéo "Order Info" vào dưới Order #
```

### Bước 3: Thêm Customer Info
```
1. Kéo "Customer" vào phía dưới header
2. Position: X=0, Y=120
3. Width: 350px
```

### Bước 4: Thêm Products Table
```
1. Kéo "Products" vào giữa canvas
2. Position: Y=200
3. Width: Full (750px)
```

### Bước 5: Thêm Payment Summary
```
1. Kéo "Payment" vào cuối trang
2. Align Right
3. Style: Background=#f0f9ff (xanh nhạt)
```

### Bước 6: Thêm Footer
```
1. Kéo "Footer" xuống cuối cùng
2. Align Center
3. Edit content: "Cảm ơn quý khách!"
4. Font size: 12px, color=#888
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Phím | Chức năng |
|------|-----------|
| `Ctrl + Z` | Undo (Hoàn tác) |
| `Ctrl + Y` | Redo (Làm lại) |
| `Delete` | Xóa element đã chọn |
| `Ctrl + D` | Duplicate element |
| `Escape` | Bỏ chọn |
| `Arrow Keys` | Di chuyển element (1px) |
| `Shift + Arrow` | Di chuyển element (10px) |

---

## 💡 TIPS & TRICKS

### 1. Căn chỉnh nhanh
- Dùng **Grid** để căn chỉnh chính xác
- Dùng **Alignment tools** cho layout đều

### 2. Duplicate nhanh
- Chọn element → Click **Duplicate**
- Element mới sẽ offset 20px so với gốc

### 3. Resize chính xác
- Nhập số trực tiếp trong **Properties Panel**
- Kéo handles để resize tự do

### 4. Layers management
- Elements mới luôn nằm **trên cùng**
- Click vào layer để select nhanh
- Ẩn elements không cần thiết

### 5. Styling tips
- Dùng **opacity** để tạo hiệu ứng mờ
- **Border Radius** để bo góc đẹp
- **Background color** để highlight sections

---

## 🎨 MẪU THIẾT KẾ

### Mẫu 1: Modern Minimal
```
- Background: White
- Header: Logo + Company Name (Left align)
- Order #: Top right, large, blue
- Clean dividers
- Products table: Simple borders
- Payment: Right align, highlight background
- Footer: Center, small text
```

### Mẫu 2: Corporate Professional
```
- Header background: Blue gradient
- Company info: Left sidebar
- Products: Full width table
- Payment box: Bordered, shadow
- Footer: Full width, gray background
```

### Mẫu 3: Creative Colorful
```
- Logo: Large, center top
- Diagonal separators
- Colored section backgrounds
- Payment: Highlight box
- Footer: Pattern background
```

---

## 🔧 TROUBLESHOOTING

### ❌ Không kéo được element?
- Check xem element có **locked** không
- Thử zoom về 100%
- Refresh trang

### ❌ Resize không chính xác?
- Dùng **Properties Panel** để nhập số
- Check xem có đang zoom không

### ❌ Element bị mất?
- Check **Layers Panel** xem có ẩn không
- Có thể đang bị đè bởi element khác (z-index)
- Dùng **Undo** để khôi phục

### ❌ Không thấy changes?
- Element có thể có **opacity = 0**
- Check **visibility** trong Layers

---

## 📊 SO SÁNH CÁC BUILDER

| Feature | Simple Builder | Invoice Builder (Mới) |
|---------|----------------|---------------------|
| Drag & Drop | Vertical only | ✅ Free-form |
| Resize | ❌ | ✅ Full support |
| Positioning | Auto | ✅ Manual (pixel-perfect) |
| Styling | Basic | ✅ Advanced |
| Layers | ❌ | ✅ Full panel |
| Undo/Redo | ❌ | ✅ Full history |
| Alignment | ❌ | ✅ Multiple tools |
| Grid | ❌ | ✅ Toggle on/off |

**👉 Khuyến nghị: Dùng Invoice Builder cho design phức tạp!**

---

## 🚀 NEXT STEPS

Các tính năng sẽ được thêm:

- [ ] **Real-time Preview** - Xem với data thật
- [ ] **Export to PDF** - Xuất PDF chất lượng cao
- [ ] **Export to PNG** - Xuất hình ảnh
- [ ] **Templates Library** - Thư viện mẫu có sẵn
- [ ] **Collaboration** - Làm việc nhóm
- [ ] **Auto-save** - Tự động lưu
- [ ] **Version History** - Lịch sử phiên bản

---

## 📞 HỖ TRỢ

- **Docs**: Xem file này
- **GitHub Issues**: Report bugs
- **Demo**: Video hướng dẫn (coming soon)

---

**💜 Chúc bạn thiết kế hóa đơn đẹp!** 🎉

