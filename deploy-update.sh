#!/bin/bash

# Script deploy/update cho Linux/Mac

echo "================================"
echo "🚀 DEPLOY/UPDATE WEB"
echo "================================"
echo

show_menu() {
    echo "Chọn hành động:"
    echo "[1] Build và test local (xem trước)"
    echo "[2] Update lên server (git push)"
    echo "[3] Deploy lần đầu (hướng dẫn)"
    echo "[4] Thoát"
    echo
    read -p "Nhập số (1-4): " choice
    
    case $choice in
        1) build_and_preview ;;
        2) push_update ;;
        3) show_deploy_guide ;;
        4) exit 0 ;;
        *) echo "Lựa chọn không hợp lệ!"; show_menu ;;
    esac
}

build_and_preview() {
    echo
    echo "📦 Đang build project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo
        echo "✅ Build thành công!"
        echo "🌐 Khởi động preview server..."
        echo
        echo "Mở trình duyệt tại: http://localhost:4173"
        echo "Nhấn Ctrl+C để dừng server"
        echo
        npm run preview
    else
        echo "❌ Build thất bại! Kiểm tra lỗi ở trên."
        read -p "Nhấn Enter để tiếp tục..."
    fi
    
    show_menu
}

push_update() {
    echo
    read -p "Nhập mô tả thay đổi (Enter = 'Update'): " message
    message=${message:-Update}
    
    echo
    echo "📝 Commit và push..."
    git add .
    git commit -m "$message"
    git push
    
    if [ $? -eq 0 ]; then
        echo
        echo "✅ Đã push lên GitHub!"
        echo "🚀 Vercel/Netlify sẽ tự động deploy trong ~30 giây"
        echo
        echo "Kiểm tra tại dashboard:"
        echo "- Vercel: https://vercel.com/dashboard"
        echo "- Netlify: https://app.netlify.com"
        echo
    else
        echo
        echo "⚠️ Có thể cần setup Git remote trước."
        echo "Chạy: git remote add origin https://github.com/USERNAME/REPO.git"
    fi
    
    read -p "Nhấn Enter để tiếp tục..."
    show_menu
}

show_deploy_guide() {
    echo
    echo "📖 HƯỚNG DẪN DEPLOY LẦN ĐẦU:"
    echo
    echo "1. Tạo repository trên GitHub: https://github.com/new"
    echo
    echo "2. Setup Git (nếu chưa):"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/USERNAME/REPO.git"
    echo "   git push -u origin main"
    echo
    echo "3. Deploy với Vercel (khuyến nghị):"
    echo "   - Vào: https://vercel.com"
    echo "   - Đăng nhập bằng GitHub"
    echo "   - Click 'Add New Project'"
    echo "   - Chọn repository"
    echo "   - Click 'Deploy'"
    echo
    echo "4. SAU NÀY chỉ cần chạy script này và chọn [2]!"
    echo
    read -p "Nhấn Enter để tiếp tục..."
    show_menu
}

# Kiểm tra Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ Không tìm thấy npm. Vui lòng cài đặt Node.js trước."
    exit 1
fi

# Kiểm tra Git
if ! command -v git &> /dev/null; then
    echo "❌ Không tìm thấy git. Vui lòng cài đặt Git trước."
    exit 1
fi

# Chạy menu
show_menu

