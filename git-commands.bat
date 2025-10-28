@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:MENU
cls
echo ========================================
echo   BẾP AN HUY - GIT COMMANDS
echo ========================================
echo.
echo 📋 CHỌN CHỨC NĂNG:
echo.
echo  1. 📊 Xem trạng thái (git status)
echo  2. 📜 Xem lịch sử (git log)
echo  3. 🌿 Xem danh sách branch
echo.
echo  4. 💾 Lưu thay đổi (commit)
echo  5. 🔀 Tạo branch mới
echo  6. 🔄 Chuyển branch
echo  7. 🔗 Merge branch
echo.
echo  8. ⏮️  Quay lại phiên bản stable
echo  9. 🗑️  Bỏ tất cả thay đổi chưa commit
echo.
echo  0. ❌ Thoát
echo.
echo ========================================
set /p choice="Nhập số: "

if "%choice%"=="1" goto STATUS
if "%choice%"=="2" goto LOG
if "%choice%"=="3" goto BRANCHES
if "%choice%"=="4" goto COMMIT
if "%choice%"=="5" goto NEW_BRANCH
if "%choice%"=="6" goto SWITCH_BRANCH
if "%choice%"=="7" goto MERGE
if "%choice%"=="8" goto RESTORE_STABLE
if "%choice%"=="9" goto DISCARD
if "%choice%"=="0" goto EXIT
goto MENU

:STATUS
cls
echo ========================================
echo   📊 TRẠNG THÁI HIỆN TẠI
echo ========================================
echo.
git status
echo.
pause
goto MENU

:LOG
cls
echo ========================================
echo   📜 LỊCH SỬ COMMIT
echo ========================================
echo.
git log --oneline -20
echo.
echo (Hiển thị 20 commit gần nhất)
echo.
pause
goto MENU

:BRANCHES
cls
echo ========================================
echo   🌿 DANH SÁCH BRANCH
echo ========================================
echo.
git branch -a
echo.
echo (* = branch hiện tại)
echo.
pause
goto MENU

:COMMIT
cls
echo ========================================
echo   💾 LƯU THAY ĐỔI
echo ========================================
echo.
git status
echo.
set /p message="Nhập message cho commit: "
git add .
git commit -m "!message!"
echo.
echo ✅ Đã commit thành công!
echo.
pause
goto MENU

:NEW_BRANCH
cls
echo ========================================
echo   🔀 TẠO BRANCH MỚI
echo ========================================
echo.
echo Ví dụ tên branch:
echo   - feature/visual-builder
echo   - fix/invoice-print
echo   - experiment/test-new-ui
echo.
set /p branchname="Nhập tên branch mới: "
git checkout -b !branchname!
echo.
echo ✅ Đã tạo và chuyển sang branch: !branchname!
echo.
pause
goto MENU

:SWITCH_BRANCH
cls
echo ========================================
echo   🔄 CHUYỂN BRANCH
echo ========================================
echo.
echo Danh sách branch:
git branch
echo.
set /p targetbranch="Nhập tên branch muốn chuyển: "
git checkout !targetbranch!
echo.
echo ✅ Đã chuyển sang branch: !targetbranch!
echo.
pause
goto MENU

:MERGE
cls
echo ========================================
echo   🔗 MERGE BRANCH
echo ========================================
echo.
echo Branch hiện tại:
git branch --show-current
echo.
echo Danh sách branch:
git branch
echo.
set /p sourcebranch="Nhập tên branch muốn merge VÀO branch hiện tại: "
git merge !sourcebranch!
echo.
echo ✅ Đã merge !sourcebranch! vào branch hiện tại!
echo.
pause
goto MENU

:RESTORE_STABLE
cls
echo ========================================
echo   ⏮️  QUAY LẠI PHIÊN BẢN STABLE
echo ========================================
echo.
echo ⚠️  CẢNH BÁO: Thao tác này sẽ quay lại phiên bản stable
echo.
git log --oneline -10
echo.
echo Phiên bản STABLE là commit đầu tiên (dưới cùng)
echo.
set /p confirm="Bạn có chắc muốn quay lại phiên bản stable? (y/n): "
if /i "!confirm!"=="y" (
    git checkout master
    echo ✅ Đã quay về branch master (stable^)
) else (
    echo ❌ Đã hủy
)
echo.
pause
goto MENU

:DISCARD
cls
echo ========================================
echo   🗑️  BỎ TẤT CẢ THAY ĐỔI
echo ========================================
echo.
echo ⚠️  CẢNH BÁO: Thao tác này sẽ xóa HẾT thay đổi chưa commit!
echo.
git status
echo.
set /p confirm="Bạn có CHẮC CHẮN muốn bỏ tất cả thay đổi? (y/n): "
if /i "!confirm!"=="y" (
    git checkout .
    echo ✅ Đã bỏ tất cả thay đổi!
) else (
    echo ❌ Đã hủy
)
echo.
pause
goto MENU

:EXIT
cls
echo.
echo ========================================
echo   Cảm ơn bạn đã sử dụng!
echo   Bếp An Huy - Invoice System
echo ========================================
echo.
exit

endlocal

