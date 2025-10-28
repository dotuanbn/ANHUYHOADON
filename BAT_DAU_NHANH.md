# 🚀 BẮT ĐẦU NHANH - GIT CHO BẾP AN HUY

## ✅ ĐÃ THIẾT LẬP:
- ✅ Git đã được khởi tạo
- ✅ Phiên bản STABLE đã được commit (có thể quay lại bất kỳ lúc nào!)
- ✅ Bạn đã an toàn để phát triển!

---

## 🎯 3 CÁCH SỬ DỤNG GIT

### 1️⃣ **CÁCH ĐỂN NHẤT** (Khuyên dùng cho người mới)
**Chạy file `git-commands.bat`** (double-click vào file)
- Giao diện menu tiếng Việt
- Chọn số để thực hiện lệnh
- Không cần nhớ lệnh!

### 2️⃣ **CÁCH NHANH** (3 lệnh cơ bản)
```bash
# Mỗi ngày làm việc:
git checkout -b feature/tinh-nang-moi     # Tạo branch mới
git add .                                  # Thêm file
git commit -m "Hoàn thành tính năng"      # Lưu
```

### 3️⃣ **CÁCH CHUYÊN NGHIỆP** (Đọc tài liệu đầy đủ)
- Xem file `QUY_TRINH_PHAT_TRIEN.md` - Hướng dẫn chi tiết
- Xem file `GIT_QUICK_REFERENCE.md` - Tra cứu lệnh

---

## 📚 TÀI LIỆU HƯỚNG DẪN

### 📖 **QUY_TRINH_PHAT_TRIEN.md**
- Quy trình làm việc hàng ngày
- Các tình huống thường gặp
- Ví dụ thực tế
- **→ ĐỌC FILE NÀY ĐẦU TIÊN!**

### 📋 **GIT_QUICK_REFERENCE.md**
- Tất cả lệnh Git
- Cheat sheet đầy đủ
- Tình huống khẩn cấp
- **→ Để tra cứu khi cần!**

### 💻 **git-commands.bat**
- Menu tiếng Việt
- Dễ sử dụng
- **→ Cho người không quen terminal!**

---

## ⚡ QUY TRÌNH HÀNG NGÀY (COPY & PASTE)

### **BUỔI SÁNG - BẮT ĐẦU LÀM VIỆC**
```bash
# Tạo branch mới cho tính năng hôm nay
git checkout -b feature/ten-tinh-nang
```

### **TRONG NGÀY - LƯU THƯỜNG XUYÊN**
```bash
# Mỗi 1-2 giờ hoặc sau khi hoàn thành 1 phần nhỏ
git add .
git commit -m "Mô tả ngắn gọn những gì vừa làm"
```

### **CUỐI NGÀY - MERGE VÀO MASTER**
```bash
# Nếu tính năng hoạt động tốt
git checkout master
git merge feature/ten-tinh-nang
```

---

## 🆘 LỆNH CỨU NGUY

### **App không vào được! Cần quay lại ngay!**
```bash
git checkout master
# Refresh browser (Ctrl + Shift + R)
```

### **Sửa nhầm, muốn bỏ tất cả!**
```bash
git checkout .
# Refresh browser
```

### **Xem các phiên bản đã lưu**
```bash
git log --oneline
```

---

## 💡 LƯU Ý QUAN TRỌNG

### ✅ **NÊN LÀM:**
- ✅ Commit thường xuyên (mỗi 1-2 giờ)
- ✅ Tạo branch mới cho mỗi tính năng lớn
- ✅ Test kỹ trước khi merge vào master
- ✅ Viết commit message rõ ràng

### ❌ **KHÔNG NÊN:**
- ❌ Code trực tiếp trên branch master
- ❌ Commit code lỗi vào master
- ❌ Quên commit (1 ngày không commit = nguy hiểm!)

---

## 🎓 HỌC GIT - ROADMAP

### **Tuần 1: Cơ bản (Đủ dùng)**
- `git status` - Xem trạng thái
- `git add .` - Thêm file
- `git commit -m "..."` - Lưu
- `git checkout master` - Quay về master

### **Tuần 2: Branch (Quan trọng)**
- `git checkout -b ten-branch` - Tạo branch
- `git branch` - Xem branch
- `git merge ten-branch` - Merge branch

### **Tuần 3: Lịch sử**
- `git log --oneline` - Xem lịch sử
- `git checkout abc1234` - Quay về commit cũ

### **Tuần 4+: Nâng cao**
- `git stash` - Cất tạm
- `git rebase` - Sắp xếp lại lịch sử
- Đọc thêm trong `GIT_QUICK_REFERENCE.md`

---

## 📞 TRỢ GIÚP

### **Gặp vấn đề?**
1. Mở file `QUY_TRINH_PHAT_TRIEN.md`
2. Tìm phần "🆘 TRƯỜNG HỢP KHẨN CẤP"
3. Hoặc chạy `git-commands.bat` → chọn tùy chọn phù hợp

### **Muốn học thêm?**
- Git interactive: https://learngitbranching.js.org/?locale=vi
- Pro Git book (Tiếng Việt): https://git-scm.com/book/vi/v2

---

## 🎯 VÍ DỤ THỰC TẾ - COPY & PASTE

### **Kịch bản: Phát triển Visual Builder**
```bash
# Ngày 1: Bắt đầu
git checkout -b feature/visual-builder
# ... code UI cơ bản ...
git add .
git commit -m "Tạo UI cơ bản cho Visual Builder"

# Ngày 2: Thêm tính năng
# ... code drag-and-drop ...
git add .
git commit -m "Thêm drag-and-drop"

# Ngày 3: Hoàn thành & test OK
git checkout master
git merge feature/visual-builder
# Visual Builder đã được thêm vào master!

# Ngày 4: Phát triển tính năng mới
git checkout -b feature/export-excel
# ... và tiếp tục!
```

### **Kịch bản: Sửa bug gấp**
```bash
# Đang code Visual Builder dở...
git stash save "Visual Builder dang lam"

# Chuyển sang sửa bug
git checkout master
git checkout -b hotfix/sua-loi-in
# ... sửa bug ...
git add .
git commit -m "Fix lỗi in hóa đơn"

# Merge bug fix
git checkout master
git merge hotfix/sua-loi-in

# Quay lại tiếp tục Visual Builder
git checkout feature/visual-builder
git stash pop
# Tiếp tục code!
```

---

## 🌟 LỢI ÍCH CỦA GIT

### **Trước khi dùng Git:**
❌ Code lỗi → app crash → không biết quay lại đâu
❌ Muốn thử tính năng mới → sợ làm hỏng
❌ Làm dở muốn chuyển việc → không biết lưu như thế nào
❌ Mất code → khóc!

### **Sau khi dùng Git:**
✅ Code lỗi → `git checkout master` → về ngay phiên bản stable
✅ Thử tính năng mới → tạo branch riêng → hỏng thì xóa branch
✅ Làm dở → `git stash` → chuyển việc → `git stash pop` → tiếp tục
✅ Không bao giờ mất code → mọi phiên bản đều được lưu!

---

## 🚀 HÀNH ĐỘNG NGAY BÂY GIỜ

### **Bước 1: Tạo branch test**
```bash
git checkout -b test/thu-git
```

### **Bước 2: Sửa file bất kỳ**
- Mở file `README.md`
- Thêm dòng: `# Test Git`
- Lưu file

### **Bước 3: Commit**
```bash
git add .
git commit -m "Test Git lần đầu"
```

### **Bước 4: Quay về master**
```bash
git checkout master
```

### **Bước 5: Kiểm tra**
- Mở file `README.md` → dòng `# Test Git` biến mất!
- Quay lại branch test:
```bash
git checkout test/thu-git
```
- Mở `README.md` → dòng `# Test Git` xuất hiện lại!

**→ VẬY LÀ BẠN ĐÃ HIỂU GIT RỒI!** 🎉

---

**Chúc bạn phát triển thành công! 🚀**

*Cập nhật: 28/10/2025*

