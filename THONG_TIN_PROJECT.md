# 📦 THÔNG TIN PROJECT

## 🏢 TÊN DỰ ÁN
**Bếp An Huy - Hệ thống quản lý hóa đơn**

---

## 🌐 THÔNG TIN QUAN TRỌNG

### Domain Production
```
https://anhuyhoadon-g3gc.vercel.app
```
👆 **Copy link này để share!**

### Repository GitHub
```
https://github.com/dotuanbn/ANHUYHOADON
```

### Vercel Dashboard
```
https://vercel.com/dashboard
```

---

## 🚀 TRẠNG THÁI

- ✅ **Deploy**: Thành công
- ✅ **Platform**: Vercel
- ✅ **Auto-deploy**: Đã bật
- ✅ **HTTPS**: Tự động
- ✅ **CDN**: Toàn cầu

---

## 🔄 UPDATE WEB (Quy trình chính)

### Bước 1: Sửa code
Mở VS Code → Sửa file cần thiết

### Bước 2: Deploy (Chọn 1 trong 2 cách)

**Cách A: Script tự động** ⭐ Khuyến nghị
```bash
# Double-click:
deploy-update.bat

# Chọn [2] → Nhập mô tả → Enter
```

**Cách B: Thủ công**
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

### Bước 3: Chờ deploy
- ⏱️ Thời gian: 30-60 giây
- 🌐 Xem kết quả: https://anhuyhoadon-g3gc.vercel.app
- 📊 Kiểm tra: https://vercel.com/dashboard

---

## 📚 TÀI LIỆU HƯỚNG DẪN

| File | Mô tả | Khi nào đọc |
|------|-------|-------------|
| **SAU_KHI_DEPLOY.md** | Tổng quan sau deploy | ⭐ Đọc đầu tiên |
| **UPDATE_NHANH.md** | Hướng dẫn update chi tiết | Khi cần update |
| **CHEATSHEET.md** | Bảng tra cứu nhanh | Tham khảo nhanh |
| **DOI_TEN_MIEN_VERCEL.md** | Đổi tên miền | Nếu muốn đổi domain |
| **DEPLOY_NHANH.md** | Hướng dẫn deploy | Đã xong rồi |
| **deploy-update.bat** | Script tự động | ⭐ Dùng file này! |

---

## 💻 TECH STACK

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **State**: React Hook Form + Zod
- **Backend**: Supabase (nếu có)
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions + Vercel Auto-deploy

---

## 📁 CẤU TRÚC DỰ ÁN

```
bepanhuy-invoice-main/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── public/                 # Static files
├── deploy-update.bat       # Script deploy/update ⭐
├── vercel.json            # Vercel config
└── package.json           # Dependencies
```

---

## 🔧 LỆNH CƠ BẢN

### Development
```bash
npm run dev          # Chạy dev server (localhost:5173)
npm run build        # Build production
npm run preview      # Preview build (localhost:4173)
```

### Git
```bash
git status           # Xem trạng thái
git log --oneline    # Xem lịch sử commit
git pull             # Pull code mới từ GitHub
git push             # Push code lên GitHub
```

---

## 🆘 TROUBLESHOOTING

### Web không update sau khi push?
```bash
# Kiểm tra trạng thái deploy trên Vercel
# Xóa cache trình duyệt: Ctrl + Shift + R
```

### Lỗi build failed?
```bash
# Test build local:
npm run build

# Sửa lỗi rồi push lại
```

### Lỗi git push rejected?
```bash
git pull --rebase
git push
```

---

## 📞 LIÊN HỆ & HỖ TRỢ

- **Owner**: dotuanbn
- **GitHub**: https://github.com/dotuanbn/ANHUYHOADON
- **Vercel**: https://vercel.com/dashboard

---

## 📊 METRICS

### Deployment Info
- **First Deploy**: 29/10/2025
- **Latest Deploy**: Tự động update
- **Deploy Count**: Check tại Vercel Dashboard
- **Status**: 🟢 Online

### Performance
- **Load Time**: < 2s (Vercel CDN)
- **SSL**: ✅ Automatic
- **Uptime**: 99.9% (Vercel SLA)

---

## 🎯 NEXT STEPS

- [ ] Test tất cả tính năng trên production
- [ ] Share domain với team/khách hàng
- [ ] Setup monitoring (nếu cần)
- [ ] Đổi tên miền cho dễ nhớ (tùy chọn)
- [ ] Add custom domain (tùy chọn, cần mua domain)

---

## 💡 TIPS

1. **Luôn test local** trước khi push: `npm run build && npm run preview`
2. **Commit message rõ ràng**: Giúp dễ tracking sau này
3. **Check Vercel dashboard** sau mỗi lần push
4. **Backup code**: GitHub đã tự động backup rồi
5. **Document changes**: Ghi chú thay đổi quan trọng

---

**🎉 PROJECT ĐÃ SẴN SÀNG SỬ DỤNG! 🚀**

