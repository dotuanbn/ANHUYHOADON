# 🚀 QUY TRÌNH PHÁT TRIỂN AN TOÀN

## ✅ ĐÃ THIẾT LẬP:
- Git đã được khởi tạo
- Phiên bản STABLE đã được commit
- Bạn có thể phát triển an toàn từ bây giờ!

---

## 📋 QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### 1️⃣ **TRƯỚC KHI BẮT ĐẦU PHÁT TRIỂN TÍNH NĂNG MỚI**

Luôn tạo branch mới từ phiên bản stable:

```bash
# Tạo branch cho tính năng mới
git checkout -b feature/ten-tinh-nang

# Ví dụ:
git checkout -b feature/visual-builder
git checkout -b feature/export-excel
git checkout -b feature/customer-management
```

### 2️⃣ **TRONG QUÁ TRÌNH PHÁT TRIỂN**

Commit thường xuyên để lưu tiến độ:

```bash
# Thêm file đã sửa
git add .

# Commit với message rõ ràng
git commit -m "Thêm chức năng drag-and-drop cho visual builder"

# Hoặc commit từng phần
git add src/components/VisualBuilder.tsx
git commit -m "Hoàn thành component VisualBuilder"
```

### 3️⃣ **KHI TÍNH NĂNG MỚI HOẠT ĐỘNG TỐT**

Merge vào branch chính (master):

```bash
# Quay về branch master
git checkout master

# Merge tính năng mới vào
git merge feature/visual-builder

# Xóa branch tính năng (tùy chọn)
git branch -d feature/visual-builder
```

### 4️⃣ **KHI CẦN QUAY LẠI PHIÊN BẢN CŨ**

#### **QUAN TRỌNG - Cứu nguy như trường hợp hôm nay:**

```bash
# Xem danh sách các commit (phiên bản)
git log --oneline

# Kết quả sẽ hiện:
# 9ac8d83 ✅ STABLE VERSION - Full featured...
# abc1234 Thêm visual builder
# def5678 Sửa form

# Quay lại phiên bản stable (KHÔNG MẤT CODE)
git checkout 9ac8d83

# Hoặc tạo branch mới từ phiên bản cũ
git checkout -b backup-stable 9ac8d83
```

---

## 🛡️ CÁC TÌNH HUỐNG THƯỜNG GẶP

### ❌ **Tôi sửa lỗi nhưng app bị crash, không vào được!**

**GIẢI PHÁP:**
```bash
# Bỏ qua tất cả thay đổi chưa commit
git checkout .

# Hoặc quay lại commit trước
git reset --hard HEAD~1
```

### ❌ **Tôi muốn thử nghiệm nhưng sợ làm hỏng!**

**GIẢI PHÁP:**
```bash
# Tạo branch thử nghiệm
git checkout -b experiment/thu-nghiem

# Làm gì cũng được trong branch này!
# Nếu hỏng → xóa branch, không ảnh hưởng gì

# Xóa branch thử nghiệm
git checkout master
git branch -D experiment/thu-nghiem
```

### ❌ **Tôi đang phát triển dở nhưng cần sửa bug gấp!**

**GIẢI PHÁP:**
```bash
# Lưu tạm công việc dở dang
git stash save "Dang lam visual builder"

# Quay về master để sửa bug
git checkout master

# Sửa bug, commit xong...

# Quay lại tiếp tục công việc dở
git checkout feature/visual-builder
git stash pop
```

---

## 🎯 QUY TẮC VÀNG

### ✅ **LUÔN LÀM:**
1. ✅ Commit sau mỗi tính năng nhỏ hoàn thành
2. ✅ Tạo branch mới cho mỗi tính năng lớn
3. ✅ Test kỹ trước khi merge vào master
4. ✅ Viết commit message rõ ràng (tiếng Việt OK!)
5. ✅ Backup định kỳ lên GitHub/GitLab

### ❌ **KHÔNG BAO GIỜ:**
1. ❌ Phát triển trực tiếp trên branch master
2. ❌ Commit code lỗi vào master
3. ❌ Xóa file .git (sẽ mất hết lịch sử!)
4. ❌ Force push khi chưa hiểu rõ

---

## 📚 LỆNH GIT CƠ BẢN

### **XEM TRẠNG THÁI**
```bash
git status              # Xem file nào đã sửa
git log --oneline       # Xem lịch sử commit
git branch              # Xem các branch
git diff                # Xem chi tiết thay đổi
```

### **LÀM VIỆC VỚI BRANCH**
```bash
git branch ten-branch           # Tạo branch mới
git checkout ten-branch         # Chuyển sang branch
git checkout -b ten-branch      # Tạo + chuyển (gộp 2 lệnh trên)
git branch -d ten-branch        # Xóa branch
git merge ten-branch            # Merge branch vào branch hiện tại
```

### **LƯU THAY ĐỔI**
```bash
git add .                       # Thêm tất cả file
git add file.tsx                # Thêm file cụ thể
git commit -m "Message"         # Commit với message
git commit -am "Message"        # Add + commit (file đã tracked)
```

### **QUAY LẠI/HOÀN TÁC**
```bash
git checkout .                  # Bỏ tất cả thay đổi chưa commit
git checkout file.tsx           # Bỏ thay đổi 1 file
git reset --hard HEAD           # Quay về commit hiện tại (mất hết thay đổi)
git reset --hard abc1234        # Quay về commit cụ thể
git revert abc1234              # Tạo commit mới để hủy commit cũ
```

---

## 🌟 VÍ DỤ THỰC TẾ

### **Kịch bản: Phát triển Visual Builder**

```bash
# Ngày 1: Bắt đầu tính năng mới
git checkout -b feature/visual-builder
# Code code code...
git add src/pages/VisualTemplateBuilder.tsx
git commit -m "Tạo cơ bản Visual Builder UI"

# Ngày 2: Tiếp tục phát triển
# Code thêm drag-and-drop...
git add .
git commit -m "Thêm drag-and-drop functionality"

# Ngày 3: Test thành công!
git checkout master
git merge feature/visual-builder
git add .
git commit -m "✅ Hoàn thành Visual Builder - tested OK"

# Ngày 4: Phát triển tiếp tính năng export
git checkout -b feature/export-excel
# ... và cứ thế tiếp tục!
```

---

## 🆘 TRƯỜNG HỢP KHẨN CẤP

### **APP KHÔNG VÀO ĐƯỢC - CẦN QUAY LẠI NGAY!**

```bash
# BƯỚC 1: Xem commit nào stable
git log --oneline

# BƯỚC 2: Copy mã commit stable (ví dụ: 9ac8d83)
# BƯỚC 3: Quay lại ngay
git checkout 9ac8d83

# BƯỚC 4: Refresh browser (Ctrl + Shift + R)
# APP SẼ HOẠT ĐỘNG LẠI!

# BƯỚC 5: Tạo branch từ phiên bản stable để sửa
git checkout -b fix/sua-loi-khong-vao-duoc

# BƯỚC 6: Sau khi sửa xong
git add .
git commit -m "Fix lỗi không vào được app"
git checkout master
git merge fix/sua-loi-khong-vao-duoc
```

---

## 💡 MẸO HAY

1. **Commit thường xuyên** (mỗi 30 phút - 1 giờ)
2. **Branch cho mọi tính năng lớn**
3. **Master luôn là phiên bản chạy được**
4. **Dùng stash khi cần chuyển công việc gấp**
5. **Đọc git log trước khi checkout**

---

## 🎓 HỌC THÊM

- Git cheat sheet: https://education.github.com/git-cheat-sheet-education.pdf
- Git interactive tutorial: https://learngitbranching.js.org/?locale=vi
- Pro Git book (Tiếng Việt): https://git-scm.com/book/vi/v2

---

## ✨ LỢI ÍCH KHI LÀM THEO QUY TRÌNH NÀY

✅ **Không bao giờ mất code**
✅ **Quay lại bất kỳ phiên bản nào**
✅ **Phát triển an toàn, không sợ hỏng**
✅ **Dễ dàng thử nghiệm**
✅ **Teamwork hiệu quả**
✅ **Backup tự động**

---

**Chúc bạn phát triển thành công! 🚀**

*Tạo bởi: AI Assistant | Cập nhật: 28/10/2025*

