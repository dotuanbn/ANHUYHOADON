# 🚀 HƯỚNG DẪN DEPLOY WEB MIỄN PHÍ

## Phương án 1: Deploy với VERCEL (Khuyến nghị ⭐⭐⭐⭐⭐)

### Bước 1: Chuẩn bị Git Repository
```bash
# Nếu chưa có Git repo, khởi tạo:
git init
git add .
git commit -m "Initial commit"

# Push lên GitHub (tạo repo mới trên github.com trước)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy lên Vercel
1. Truy cập: https://vercel.com
2. Đăng ký/đăng nhập bằng **GitHub account**
3. Click **"Add New..."** → **"Project"**
4. **Import** repository GitHub của bạn
5. Vercel sẽ tự động nhận diện Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

### ✅ Xong! Web của bạn đã online

**URL mẫu**: `https://your-project-name.vercel.app`

### 🔄 Update phiên bản mới (Siêu đơn giản!)
```bash
# Chỉ cần push code lên GitHub là Vercel tự động deploy:
git add .
git commit -m "Update features"
git push
```
**Vercel sẽ tự động build và deploy trong ~30 giây!**

---

## Phương án 2: Deploy với NETLIFY (Khuyến nghị ⭐⭐⭐⭐⭐)

### Bước 1: Chuẩn bị (giống Vercel)
Đảm bảo code đã push lên GitHub.

### Bước 2: Deploy lên Netlify
1. Truy cập: https://app.netlify.com
2. Đăng ký/đăng nhập bằng **GitHub account**
3. Click **"Add new site"** → **"Import an existing project"**
4. Chọn **GitHub** và authorize
5. Chọn repository của bạn
6. Cấu hình build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Click **"Deploy site"**

### ✅ Xong! Web của bạn đã online

**URL mẫu**: `https://your-project-name.netlify.app`

### 🔄 Update phiên bản mới
```bash
# Tương tự Vercel, chỉ cần push code:
git add .
git commit -m "Update features"
git push
```

---

## Phương án 3: Deploy với CLOUDFLARE PAGES (Miễn phí, nhanh)

### Bước 1: Truy cập Cloudflare Pages
1. Đăng ký tại: https://pages.cloudflare.com
2. Click **"Create a project"**
3. Connect với **GitHub**

### Bước 2: Cấu hình
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### ✅ Deploy tự động khi push code

---

## Phương án 4: GitHub Pages (Miễn phí nhưng cần config thêm)

### Cần thêm file cấu hình để hỗ trợ React Router

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Sau đó enable GitHub Pages trong Settings → Pages → Source: gh-pages branch

---

## 📊 So sánh các phương án

| Platform | Dễ setup | Tốc độ | Tự động deploy | Domain miễn phí | Khuyến nghị |
|----------|----------|---------|----------------|-----------------|-------------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | ✅ | ✅ | **Tốt nhất** |
| **Netlify** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | ✅ | ✅ | **Tốt nhất** |
| **Cloudflare Pages** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ✅ | ✅ | Rất tốt |
| **GitHub Pages** | ⭐⭐⭐ | ⚡⚡ | ✅ | ✅ | Tốt |

---

## 🎯 Khuyến nghị cuối cùng

### Chọn **VERCEL** nếu:
- Bạn muốn setup nhanh nhất (1 click)
- Có nhu cầu scale sau này
- Muốn analytics miễn phí

### Chọn **NETLIFY** nếu:
- Bạn muốn nhiều tính năng miễn phí (forms, functions)
- Interface thân thiện hơn
- Muốn dễ config hơn

---

## ⚙️ Các bước quan trọng sau khi deploy

### 1. Setup Environment Variables (nếu cần)
Trong Vercel/Netlify dashboard:
- Settings → Environment Variables
- Thêm các biến môi trường như `VITE_SUPABASE_URL`, etc.

### 2. Custom Domain (tùy chọn)
- Vercel/Netlify đều hỗ trợ connect custom domain miễn phí
- Settings → Domains → Add custom domain

### 3. Preview Deployments
- Mỗi Pull Request sẽ tự động tạo preview URL
- Test trước khi merge vào main

---

## 🆘 Troubleshooting

### Lỗi build thất bại:
```bash
# Test build locally trước:
npm run build
npm run preview
```

### Lỗi 404 khi refresh trang (React Router):
**Vercel**: Tạo file `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Netlify**: Tạo file `public/_redirects`:
```
/*    /index.html   200
```

### Lỗi environment variables:
- Đảm bảo prefix với `VITE_` trong Vite projects
- Restart deployment sau khi thêm env vars

---

## 📞 Hỗ trợ thêm

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy

---

**Lưu ý**: Với setup này, bạn chỉ cần `git push` là web tự động update! 🎉

