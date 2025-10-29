# 🚀 DEPLOY QUICK REFERENCE

## ⚡ Lần đầu tiên (chỉ 1 lần)

### Windows:
```bash
# 1. Push lên GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 2. Deploy: https://vercel.com → Import repo
```

### Hoặc dùng script tự động:
```bash
deploy-update.bat     # Windows
./deploy-update.sh    # Mac/Linux
```

---

## 🔄 Update phiên bản mới (sau này)

### Cách 1: Tự động (Windows)
```bash
deploy-update.bat
# Chọn [2] → Nhập mô tả → Enter
```

### Cách 2: Manual
```bash
git add .
git commit -m "Update v2.0"
git push
# Vercel/Netlify tự động deploy!
```

### Cách 3: Một dòng lệnh
```bash
git add . && git commit -m "update" && git push
```

---

## 📦 Build & Test Local

```bash
npm run build        # Build production
npm run preview      # Xem tại localhost:4173
```

---

## 🌐 Deploy Platforms

| Platform | URL Setup | Thời gian |
|----------|-----------|-----------|
| **Vercel** | https://vercel.com | 2 phút |
| **Netlify** | https://netlify.com | 2 phút |
| **Cloudflare** | https://pages.cloudflare.com | 3 phút |

### Setup chung cho tất cả:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 18

---

## 🔧 Files quan trọng

✅ Đã có sẵn:
- `vercel.json` - Fix React Router cho Vercel
- `public/_redirects` - Fix React Router cho Netlify  
- `.github/workflows/deploy.yml` - GitHub Pages auto-deploy
- `deploy-update.bat` - Script Windows
- `deploy-update.sh` - Script Mac/Linux

---

## 🆘 Troubleshooting

### Lỗi: "Failed to compile"
```bash
npm run build    # Kiểm tra lỗi
```

### Lỗi: 404 khi refresh trang
- ✅ Đã fix bằng `vercel.json` và `_redirects`

### Lỗi: Git push rejected
```bash
git pull --rebase origin main
git push
```

---

## 📱 Kết quả

Sau khi deploy thành công:
- 🌐 URL: `https://your-project.vercel.app`
- 🔒 HTTPS: Tự động
- ⚡ CDN: Toàn cầu
- 🔄 Auto-deploy: Mỗi lần push

---

## 💡 Pro Tips

1. **Preview URL**: Mỗi branch/PR có URL riêng để test
2. **Environment Variables**: Add trong Dashboard → Settings
3. **Custom Domain**: Settings → Domains (miễn phí)
4. **Analytics**: Built-in trên Vercel/Netlify

---

**TÓM TẮT: Push code = Tự động deploy! 🎉**

