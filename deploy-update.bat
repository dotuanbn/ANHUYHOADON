@echo off
chcp 65001 >nul
echo ================================
echo 🚀 BẾP AN HUY - DEPLOY/UPDATE
echo ================================
echo Domain: https://anhuyhoadon-g3gc.vercel.app
echo.

:menu
echo Chọn hành động:
echo [1] Build và test local (xem trước)
echo [2] Update lên Vercel (git push - tự động deploy)
echo [3] Kiểm tra git status
echo [4] Xem hướng dẫn đổi tên miền
echo [5] Thoát
echo.
set /p choice="Nhập số (1-5): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto push
if "%choice%"=="3" goto status
if "%choice%"=="4" goto domain
if "%choice%"=="5" goto end
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
echo 📝 Đang commit và push lên GitHub...
git add .
git commit -m "%message%"
git push

if errorlevel 1 (
    echo.
    echo ⚠️ Push thất bại! Thử pull trước:
    git pull --rebase
    git push
    pause
    goto menu
)

echo.
echo ✅ Đã push lên GitHub thành công!
echo.
echo 🚀 Vercel đang tự động deploy...
echo ⏱️  Chờ khoảng 30-60 giây
echo.
echo 🌐 Xem kết quả tại:
echo    https://anhuyhoadon-g3gc.vercel.app
echo.
echo 📊 Kiểm tra trạng thái deploy:
echo    https://vercel.com/dashboard
echo.
pause
goto menu

:status
echo.
echo 📋 Trạng thái Git hiện tại:
echo ================================
git status
echo.
echo 📦 Commit gần nhất:
git log -1 --oneline
echo.
echo 🌿 Branch hiện tại:
git branch --show-current
echo.
pause
goto menu

:domain
echo.
echo 🌐 HƯỚNG DẪN ĐỔI TÊN MIỀN
echo ================================
echo.
echo Tên miền hiện tại:
echo   anhuyhoadon-g3gc.vercel.app ❌ (khó nhớ)
echo.
echo Đề xuất tên mới:
echo   bepanhuy-invoice.vercel.app ✅
echo   bepanhuy.vercel.app ✅
echo   anhuy-hoadon.vercel.app ✅
echo.
echo CÁCH ĐỔI (2 phút):
echo 1. Vào: https://vercel.com/dashboard
echo 2. Click vào project "anhuyhoadon-g3gc"
echo 3. Settings → General → Project Name
echo 4. Đổi thành tên mới → Save
echo.
echo Chi tiết xem file: DOI_TEN_MIEN_VERCEL.md
echo.
pause
goto menu

:end
echo.
echo ================================
echo 💡 MẸO NHANH:
echo ================================
echo Sau này muốn update web:
echo 1. Sửa code
echo 2. Chạy file này và chọn [2]
echo 3. Chờ 30 giây → Web tự động update!
echo.
echo Đơn giản vậy thôi! 🎉
echo ================================
echo.
echo 👋 Tạm biệt!
timeout /t 3 >nul
exit /b 0

