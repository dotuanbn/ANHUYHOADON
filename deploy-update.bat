@echo off
chcp 65001 >nul
echo ================================
echo 🚀 DEPLOY/UPDATE WEB
echo ================================
echo.

:menu
echo Chọn hành động:
echo [1] Build và test local (xem trước)
echo [2] Update lên server (git push)
echo [3] Deploy lần đầu (hướng dẫn)
echo [4] Thoát
echo.
set /p choice="Nhập số (1-4): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto push
if "%choice%"=="3" goto deploy
if "%choice%"=="4" goto end
goto menu

:build
echo.
echo 📦 Đang build project...
call npm run build
if errorlevel 1 (
    echo ❌ Build thất bại! Kiểm tra lỗi ở trên.
    pause
    goto menu
)
echo.
echo ✅ Build thành công!
echo 🌐 Khởi động preview server...
echo.
echo Mở trình duyệt tại: http://localhost:4173
echo Nhấn Ctrl+C để dừng server
echo.
call npm run preview
goto menu

:push
echo.
set /p message="Nhập mô tả thay đổi (Enter = 'Update'): "
if "%message%"=="" set message=Update

echo.
echo 📝 Commit và push...
git add .
git commit -m "%message%"
git push

if errorlevel 1 (
    echo.
    echo ⚠️ Có thể cần setup Git remote trước.
    echo Chạy: git remote add origin https://github.com/USERNAME/REPO.git
    pause
    goto menu
)

echo.
echo ✅ Đã push lên GitHub!
echo 🚀 Vercel/Netlify sẽ tự động deploy trong ~30 giây
echo.
echo Kiểm tra tại dashboard:
echo - Vercel: https://vercel.com/dashboard
echo - Netlify: https://app.netlify.com
echo.
pause
goto menu

:deploy
echo.
echo 📖 HƯỚNG DẪN DEPLOY LẦN ĐẦU:
echo.
echo 1. Tạo repository trên GitHub: https://github.com/new
echo.
echo 2. Setup Git (nếu chưa):
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/USERNAME/REPO.git
echo    git push -u origin main
echo.
echo 3. Deploy với Vercel (khuyến nghị):
echo    - Vào: https://vercel.com
echo    - Đăng nhập bằng GitHub
echo    - Click "Add New Project"
echo    - Chọn repository
echo    - Click "Deploy"
echo.
echo 4. SAU NÀY chỉ cần chạy script này và chọn [2]!
echo.
pause
goto menu

:end
echo.
echo 👋 Tạm biệt!
exit /b 0

