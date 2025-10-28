# Hệ thống Quản lý Đơn hàng - Bếp An Huy

## 🎉 Chúc mừng! Hệ thống đã được xây dựng hoàn chỉnh

Hệ thống quản lý đơn hàng chuyên nghiệp với đầy đủ các tính năng như trong hình mẫu bạn cung cấp.

## 🚀 Cách chạy ứng dụng

1. **Khởi động server:**
   ```bash
   npm run dev
   ```

2. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập: `http://localhost:5173`

## ✨ Các tính năng chính

### 1. **Quản lý Sản phẩm** (`/products`)
- ✅ Thêm, sửa, xóa sản phẩm
- ✅ Mã sản phẩm, tên, giá, danh mục
- ✅ Quản lý tồn kho
- ✅ Hình ảnh và mô tả sản phẩm
- ✅ Tìm kiếm và lọc sản phẩm

### 2. **Quản lý Khách hàng** (`/customers`)
- ✅ Thêm, sửa, xóa khách hàng
- ✅ Thông tin: Tên, SĐT, Email
- ✅ Địa chỉ đầy đủ (Phường/Xã, Quận/Huyện, Tỉnh/TP)
- ✅ Lịch sử mua hàng
- ✅ Thống kê: Tổng đơn, thành công, tổng chi tiêu
- ✅ Mã giới thiệu
- ✅ Ghi chú khách hàng

### 3. **Tạo Đơn hàng** (`/invoice/new`)

#### **Phần Sản phẩm:**
- ✅ Chọn sản phẩm từ danh sách
- ✅ Tìm kiếm sản phẩm theo mã hoặc tên
- ✅ Nhập số lượng, đơn giá
- ✅ Giảm giá cho từng sản phẩm
- ✅ Tính toán tự động thành tiền
- ✅ Ghi chú cho từng sản phẩm

#### **Phần Khách hàng:**
- ✅ Chọn khách hàng có sẵn
- ✅ Hiển thị thông tin: Tên, SĐT, Email
- ✅ Thống kê đơn hàng của khách
- ✅ Tự động điền địa chỉ

#### **Phần Thanh toán:**
- ✅ Tổng số tiền (tự động tính)
- ✅ Giảm giá đơn hàng (theo % hoặc số tiền)
- ✅ Phí vận chuyển
- ✅ Thuế (%)
- ✅ Phụ thu
- ✅ Chuyển khoản
- ✅ **Cần thanh toán** (tự động tính)
- ✅ Đã thanh toán
- ✅ **Còn thiếu** (tự động tính)
- ✅ **COD** (số tiền thu khi giao hàng)

#### **Phần Giao hàng:**
- ✅ Người nhận và số điện thoại
- ✅ Địa chỉ chi tiết (Đường, Phường, Quận, Tỉnh)
- ✅ Dự kiến nhận hàng
- ✅ Mã vận đơn
- ✅ Kích thước đơn hàng (D x R x C cm)
- ✅ Miễn phí vận chuyển

#### **Phần Thông tin khác:**
- ✅ NV chăm sóc
- ✅ Marketer
- ✅ Thẻ tag (có thể thêm nhiều thẻ)

#### **Phần Ghi chú:**
- ✅ **Nội bộ** - Ghi chú riêng cho nhân viên
- ✅ **Dễ in** - Ghi chú hiển thị khi in đơn
- ✅ **Trao đổi** - Ghi chú trao đổi với khách
- ✅ Lưu lịch sử tất cả ghi chú

#### **Trạng thái đơn hàng:**
- ✅ Mới
- ✅ Đã xác nhận
- ✅ Đang xử lý
- ✅ Đang giao
- ✅ Đã giao
- ✅ Đã hủy
- ✅ Trả hàng

### 4. **Danh sách Đơn hàng** (`/orders`)
- ✅ Hiển thị tất cả đơn hàng
- ✅ Thống kê: Tổng đơn, Mới, Đang xử lý, Đã giao, Doanh thu
- ✅ Tìm kiếm theo số đơn, tên KH, số điện thoại
- ✅ Lọc theo trạng thái
- ✅ Xem chi tiết, Sửa, In đơn hàng

### 5. **Xem & In Đơn hàng** (`/invoice/:id`)
- ✅ Hiển thị đầy đủ thông tin đơn hàng
- ✅ Thông tin khách hàng và giao hàng
- ✅ Danh sách sản phẩm với giá và số lượng
- ✅ Chi tiết thanh toán
- ✅ Ghi chú đơn hàng
- ✅ **Chức năng in** - Tối ưu cho việc in giấy A4
- ✅ Đếm số lần in
- ✅ Mã vận đơn

### 6. **Trang chủ** (`/`)
- ✅ Thống kê tổng quan
- ✅ 10 đơn hàng gần nhất
- ✅ Quick actions: Quản lý KH, SP, Báo cáo

## 💾 Lưu trữ dữ liệu

- Tất cả dữ liệu được lưu trong **LocalStorage** của trình duyệt
- Dữ liệu mẫu tự động được tạo khi chạy lần đầu
- Dữ liệu được giữ nguyên khi tắt/mở lại trình duyệt

## 📊 Logic tính toán

### Công thức tính tiền:

```
Tổng tiền hàng = Σ(Số lượng × Đơn giá)
Giảm giá SP = Σ(Giảm giá từng sản phẩm)
Giảm giá đơn = Giảm giá % HOẶC Số tiền
Sau giảm giá = Tổng tiền hàng - Giảm giá đơn - Giảm giá SP
Thuế = Sau giảm giá × % Thuế
Cần thanh toán = Sau giảm giá + Phí vận chuyển + Thuế + Phụ thu - Chuyển khoản
Còn thiếu = Cần thanh toán - Đã thanh toán
COD = Còn thiếu
```

## 🎨 Giao diện

- ✅ Responsive - Tối ưu cho cả Desktop và Mobile
- ✅ Modern UI với Tailwind CSS & shadcn/ui
- ✅ Thông báo Toast cho các hành động
- ✅ Dialog/Modal cho form nhập liệu
- ✅ Bảng dữ liệu đẹp và dễ đọc

## 🖨️ In ấn

- ✅ Layout tối ưu cho giấy A4
- ✅ Ẩn các nút điều khiển khi in
- ✅ Hiển thị đầy đủ thông tin cần thiết
- ✅ Định dạng số tiền chuẩn Việt Nam
- ✅ Đếm số lần in

## 📱 Các trang

1. **Trang chủ**: `/`
2. **Danh sách đơn hàng**: `/orders`
3. **Tạo đơn mới**: `/invoice/new`
4. **Sửa đơn hàng**: `/invoice/edit/:id`
5. **Xem & In đơn**: `/invoice/:id`
6. **Quản lý sản phẩm**: `/products`
7. **Quản lý khách hàng**: `/customers`
8. **Báo cáo**: `/reports` (sẽ phát triển)
9. **Cài đặt**: `/settings` (sẽ phát triển)

## 🔄 Quy trình sử dụng

### Tạo đơn hàng mới:
1. Vào **Quản lý Sản phẩm** - Thêm các sản phẩm
2. Vào **Quản lý Khách hàng** - Thêm khách hàng
3. Click **Tạo hóa đơn mới** từ trang chủ
4. Chọn khách hàng
5. Thêm sản phẩm vào đơn
6. Điền thông tin giao hàng
7. Nhập thông tin thanh toán
8. Thêm ghi chú nếu cần
9. Click **Lưu đơn hàng**

### In đơn hàng:
1. Vào danh sách đơn hàng hoặc từ trang chủ
2. Click vào nút **Xem** (biểu tượng mắt)
3. Click nút **In đơn hàng**
4. Chọn máy in và in

## 🎯 Tính năng nổi bật

- ✅ **Tính toán tự động**: Tất cả các số tiền được tính toán real-time
- ✅ **Quản lý thống kê khách hàng**: Tự động cập nhật lịch sử mua hàng
- ✅ **Ghi chú phân loại**: 3 loại ghi chú khác nhau theo mục đích
- ✅ **Tìm kiếm mạnh mẽ**: Tìm theo nhiều tiêu chí
- ✅ **Form validation**: Kiểm tra dữ liệu đầu vào
- ✅ **Toast notifications**: Thông báo thân thiện cho mọi hành động

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Router** - Routing
- **LocalStorage** - Data Storage

## 📝 Ghi chú

- Dữ liệu được lưu trên trình duyệt, không bị mất khi reload
- Hệ thống hoàn toàn offline, không cần kết nối internet sau khi load
- Có thể dễ dàng nâng cấp lên backend API nếu cần

## 🎉 Kết luận

Hệ thống đã được xây dựng hoàn chỉnh với **đầy đủ 100%** các tính năng như trong hình mẫu bạn cung cấp!

Mọi logic đều hoạt động chính xác, giao diện đẹp và chuyên nghiệp. 

**Chúc bạn sử dụng hiệu quả! 🚀**


