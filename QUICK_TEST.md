# ⚡ QUICK TEST - 30 GIÂY

## 🚀 URL

```
http://localhost:5173/invoice-builder
```

---

## 🔥 REFRESH NGAY!

**BẤM**: `Ctrl+Shift+R` (Hard Refresh)

---

## ✅ TEST TRONG 30 GIÂY

### 1️⃣ Kéo (10 giây)
```
Sidebar trái → Component "Text" → Click và GIỮ chuột → Kéo sang canvas
```
**✅ Thấy**: Cursor đổi thành dấu "copy" icon

### 2️⃣ Thả (10 giây)
```
Đang kéo → Di vào canvas (trắng) → Thả chuột
```
**✅ Thấy**: Element xuất hiện với icon 📝 và text "Enter text"

### 3️⃣ Di chuyển (10 giây)
```
Click element → Kéo element
```
**✅ Thấy**: Element di chuyển theo chuột, có viền xanh + 8 nút tròn

---

## 🎯 NẾU HOẠT ĐỘNG

Bạn sẽ thấy:
- ✅ Component có thể kéo
- ✅ Canvas highlight khi drag over (viền xanh)
- ✅ Element xuất hiện khi thả
- ✅ Element có thể di chuyển
- ✅ Element có thể resize (kéo 8 nút tròn)

---

## 🐛 NẾU KHÔNG HOẠT ĐỘNG

### Check 1: Browser Cache
```
Ctrl+Shift+R (hard refresh)
```

### Check 2: Console Errors
```
F12 → Console tab → Có error đỏ không?
```

### Check 3: Dev Server
```
Terminal → Server có chạy không? (xem line "Local: http://localhost:5173/")
```

### Check 4: Components Draggable
```
F12 → Console → Gõ:
document.querySelectorAll('[draggable="true"]').length
→ Phải ra số 9
```

---

## 💡 THAY ĐỔI CHÍNH

### ❌ Trước
- Dùng `@dnd-kit/core`
- Phức tạp, nhiều bugs

### ✅ Bây giờ
- **Native HTML5 Drag & Drop**
- Đơn giản, ổn định, chắc chắn hoạt động!

---

## 🎨 FEATURES

- [x] Drag & Drop (Native HTML5)
- [x] Move elements (Mouse events)
- [x] Resize (8 handles)
- [x] Properties panel
- [x] Layers panel
- [x] Undo/Redo (Ctrl+Z/Y)
- [x] Save/Load
- [x] Lock/Unlock
- [x] Show/Hide
- [x] Duplicate
- [x] Delete (Delete key)
- [x] Align tools

---

# ✨ REFRESH VÀ KÉO THẢ NGAY!

**Ctrl+Shift+R → Kéo "Text" → Thả vào canvas → ✅ Hoạt động!**


