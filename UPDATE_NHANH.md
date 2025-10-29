# ⚡ HƯỚNG DẪN UPDATE PHIÊN BẢN MỚI

## 🎯 Domain hiện tại
**https://anhuyhoadon-g3gc.vercel.app**

---

## 🚀 CÁCH UPDATE CỰC NHANH (Chọn 1 trong 3)

### ⭐ CÁCH 1: Dùng Script Tự Động (Dễ nhất)

```bash
# Chỉ cần double-click file:
deploy-update.bat

# Chọn [2] → Nhập mô tả → Enter
# Xong! Web tự động update sau 30 giây
```

---

### 📝 CÁCH 2: Dòng Lệnh Nhanh

```bash
git add .
git commit -m "Cập nhật tính năng mới"
git push
```

**Vercel tự động deploy trong 30 giây!** 🎉

---

### 🖱️ CÁCH 3: Một Dòng Lệnh

```bash
git add . && git commit -m "update" && git push
```

Copy & paste vào terminal → Enter → Xong!

---

## 🔄 QUY TRÌNH UPDATE HOÀN CHỈNH

### 1. Test Local (Tùy chọn - nên làm)
```bash
npm run build
npm run preview
# Mở http://localhost:4173 để test
```

### 2. Commit & Push
```bash
git add .
git commit -m "Mô tả thay đổi của bạn"
git push
```

### 3. Chờ Deploy Tự Động
- ⏱️ Thời gian: 30-60 giây
- 🌐 Xem tại: https://anhuyhoadon-g3gc.vercel.app
- 📊 Check status: https://vercel.com/dashboard

---

## 📌 SAU KHI PUSH XONG

### Kiểm tra deploy thành công:
1. Vào https://vercel.com/dashboard
2. Click vào project **anhuyhoadon-g3gc**
3. Xem **"Production Deployment"**:
   - ✅ Status: **Ready** (màu xanh) = Thành công
   - ⏳ Status: **Building** (màu vàng) = Đang deploy
   - ❌ Status: **Error** (màu đỏ) = Có lỗi

### Nếu thành công:
```
✅ Ready
🌐 Domain: anhuyhoadon-g3gc.vercel.app
🔗 Click "Visit" để xem web
```

---

## 🆘 TROUBLESHOOTING

### ❌ Lỗi: "Build failed"
```bash
# Test build local trước:
npm run build

# Nếu lỗi, sửa code rồi push lại
```

### ❌ Lỗi: "git push rejected"
```bash
# Pull code mới từ GitHub trước:
git pull --rebase
git push
```

### ❌ Lỗi: "nothing to commit"
```bash
# Chưa có thay đổi gì!
# Sửa code trước rồi mới push
```

---

## 💡 TIPS & TRICKS

### Xem lịch sử commit:
```bash
git log --oneline -5
```

### Xem file đã thay đổi:
```bash
git status
```

### Rollback về phiên bản cũ:
```bash
git log --oneline     # Xem danh sách commits
git revert <commit-id> # Rollback về commit cụ thể
git push
```

### Xem build logs trên Vercel:
1. Vào dashboard → Click project
2. Click vào deployment
3. Click "Build Logs" để xem chi tiết

---

## 📊 WORKFLOW THỰC TÊ

```
Sửa Code
   ↓
Test Local (npm run build)
   ↓
Git Add + Commit + Push
   ↓
Vercel Tự Động Build (30s)
   ↓
✅ Web Update Thành Công!
```

---

## 🎁 BONUS: Đổi Tên Miền

Tên hiện tại: `anhuyhoadon-g3gc.vercel.app` (khó nhớ)

**Đổi thành tên dễ hơn:**

1. Vào: https://vercel.com/dashboard
2. Settings → General → Project Name
3. Đổi thành: `bepanhuy-invoice` hoặc `bepanhuy`
4. Save → Domain mới: `bepanhuy-invoice.vercel.app` ✅

Chi tiết xem: `DOI_TEN_MIEN_VERCEL.md`

---

## 📞 TÓM TẮT

| Thao tác | Lệnh | Thời gian |
|----------|------|-----------|
| **Test local** | `npm run build && npm run preview` | 1 phút |
| **Update web** | `git add . && git commit -m "update" && git push` | 10 giây |
| **Vercel deploy** | Tự động | 30-60 giây |
| **TỔNG** | - | **~2 phút** |

---

**CHỈ CẦN 1 DÒNG LỆNH LÀ UPDATE XONG! 🚀🔥**

