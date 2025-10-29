# 🚀 HƯỚNG DẪN DEPLOY NHANH - 5 PHÚT

## 🎯 Cách dễ nhất: VERCEL (Khuyến nghị)

### Bước 1: Push code lên GitHub (nếu chưa có)

```bash
# Tạo repository mới trên github.com, sau đó:
git init
git add .
git commit -m "Ready to deploy"
git branch -M main
git remote add origin https://github.com/TÊN_CỦA_BẠN/TÊN_REPO.git
git push -u origin main
```

### Bước 2: Deploy lên Vercel

1. 🌐 Vào: **https://vercel.com/signup**
2. 🔑 Đăng nhập bằng **GitHub**
3. ➕ Click **"Add New..."** → **"Project"**
4. 📦 Chọn repository vừa tạo
5. ⚙️ Vercel tự động detect Vite - **Không cần thay đổi gì**
6. 🚀 Click **"Deploy"**

### ✅ XONG! Chờ 1-2 phút

Web của bạn sẽ có địa chỉ: `https://ten-project.vercel.app`

---

## 🔄 CẬP NHẬT PHIÊN BẢN MỚI

**SIÊU ĐƠN GIẢN** - Chỉ cần push code:

```bash
# Sau khi sửa code:
git add .
git commit -m "Update version 2.0"
git push

# Vercel tự động deploy sau ~30 giây!
```

---

## 🆘 Nếu gặp lỗi 404 khi refresh trang

Không lo, đã có file `vercel.json` fix sẵn rồi! ✅

---

## 🎁 BONUS: Domain miễn phí

- **Vercel**: `your-project.vercel.app`
- **Netlify**: `your-project.netlify.app`

Muốn domain riêng (vd: `bepanhuy.com`)?
- Vào Settings → Domains → Add Domain
- Miễn phí SSL/HTTPS tự động

---

## 📊 LỰA CHỌN KHÁC (nếu không thích Vercel)

### Netlify (giống Vercel)
1. 🌐 https://app.netlify.com
2. Connect GitHub → Chọn repo
3. Build: `npm run build`, Output: `dist`
4. Deploy!

### Cloudflare Pages (nhanh nhất)
1. 🌐 https://pages.cloudflare.com
2. Tương tự như trên

---

## ⚡ TIP: Test trước khi deploy

```bash
# Build và test local:
npm run build
npm run preview

# Mở http://localhost:4173 để xem
```

---

## 🎯 TÓM TẮT

| Bước | Mất thời gian | Khó khăn |
|------|---------------|----------|
| Push lên GitHub | 2 phút | ⭐ |
| Deploy Vercel | 2 phút | ⭐ |
| **TỔNG** | **4 phút** | **Cực dễ** |

### Update sau này:
```bash
git add . && git commit -m "update" && git push
```
**Chỉ 1 dòng lệnh!** 🎉

---

## 📞 Cần giúp?

- Vercel gặp vấn đề: https://vercel.com/docs
- Deploy không thành công: Check file `package.json` có `"build": "vite build"` chưa

**File cấu hình đã sẵn sàng:**
- ✅ `vercel.json` - Fix lỗi React Router
- ✅ `public/_redirects` - Cho Netlify
- ✅ `.github/workflows/deploy.yml` - Cho GitHub Pages (nếu muốn)

---

**CHỈ CẦN 4 PHÚT LÀ WEB ONLINE!** 🚀🔥

