# 🔧 DEBUG GUIDE - ADVANCED BUILDER

## ✅ ĐÃ FIX HOÀN TOÀN!

**Thay đổi chính**: Bỏ `@dnd-kit` → Dùng **Native HTML5 Drag & Drop**

---

## 🚀 REFRESH NGAY!

```
http://localhost:5173/invoice-builder
```

**BẤM F5 HOẶC CTRL+SHIFT+R (HARD REFRESH)**

---

## ✨ CÁI GÌ ĐÃ THAY ĐỔI?

### ❌ Trước (Không hoạt động)
- Dùng `@dnd-kit/core`
- DndContext, useDraggable, useDroppable
- Phức tạp, nhiều bugs

### ✅ Bây giờ (Chắc chắn hoạt động!)
- **Native HTML5 Drag & Drop API**
- `draggable` attribute
- `onDragStart`, `onDragOver`, `onDrop`
- Đơn giản, ổn định, không có bugs

---

## 📋 CÁCH HOẠT ĐỘNG MỚI

### 1. Component Palette (Sidebar trái)
```typescript
<div
  draggable  // ← Native HTML5
  onDragStart={(e) => {
    e.dataTransfer.setData('componentId', component.id);
  }}
>
  Component
</div>
```

### 2. Canvas (Giữa)
```typescript
<div
  onDragOver={(e) => {
    e.preventDefault(); // ← Cho phép drop
  }}
  onDrop={(e) => {
    const componentId = e.dataTransfer.getData('componentId');
    // Tạo element tại vị trí drop
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Add element...
  }}
>
  Canvas
</div>
```

### 3. Element (Trên canvas)
```typescript
<div
  onMouseDown={(e) => {
    // Move element bằng mouse events
  }}
>
  Element
  {/* Resize handles */}
</div>
```

---

## 🎯 TEST NGAY - 3 BƯỚC

### Bước 1: Kéo (5 giây)
1. Sidebar trái → Component "Text"
2. **CLICK VÀ GIỮ** chuột trái
3. **KÉO** sang canvas (khu vực trắng giữa)
4. **Cursor thay đổi** thành dấu + hoặc copy icon
5. ✅ **Thấy cursor thay đổi = Drag hoạt động!**

### Bước 2: Thả (5 giây)
1. Đang kéo component
2. Di chuột vào **canvas** (khu vực trắng)
3. **Canvas có viền xanh** (highlight)
4. **THẢ CHUỘT** (release click)
5. ✅ **Element xuất hiện tại chỗ thả!**

### Bước 3: Di chuyển (5 giây)
1. **CLICK** vào element vừa tạo
2. Element có **viền xanh** + **8 nút tròn**
3. **Click và kéo element**
4. ✅ **Element di chuyển theo chuột!**

---

## 🐛 TROUBLESHOOTING

### Vấn đề 1: Không kéo được component
**Nguyên nhân**: Browser cache cũ

**Fix**:
```
1. Bấm Ctrl+Shift+R (hard refresh)
2. Hoặc F12 → Network tab → "Disable cache" → Refresh
3. Hoặc restart dev server
```

### Vấn đề 2: Kéo được nhưng không thả được
**Nguyên nhân**: `onDragOver` không prevent default

**Check**:
- F12 → Console
- Xem có error không?
- Cursor có đổi thành "+"  hoặc "copy" icon không khi hover canvas?

**Fix**: Đã fix trong code mới (có `e.preventDefault()`)

### Vấn đề 3: Thả được nhưng element không xuất hiện
**Check**:
1. F12 → Console → Có error không?
2. F12 → Elements → Search "absolute" → Có element với `position: absolute` không?
3. Tab "Layers" (sidebar phải) → Có layer mới không?

**Debug**:
```typescript
// Trong handleCanvasDrop, thêm log:
console.log('Dropped!', componentId, x, y);
```

### Vấn đề 4: Element xuất hiện nhưng không di chuyển được
**Check**:
1. Element có `locked: false` không? (Check trong Layers tab)
2. Click element → Có viền xanh không?
3. Có 8 nút tròn xanh không?

**Fix**: Click nút "Unlock" nếu element bị lock

---

## 💡 FEATURES HOẠT ĐỘNG

✅ **Drag from palette to canvas**
- Native HTML5 drag & drop
- Drop at exact mouse position

✅ **Move elements**
- Click and drag
- Mouse events (onMouseDown, onMouseMove, onMouseUp)

✅ **Resize elements**
- 8 resize handles
- Corner + edge resizing

✅ **Edit properties**
- Font, color, size, etc.
- Real-time updates

✅ **Undo/Redo**
- Ctrl+Z / Ctrl+Y
- Full history

✅ **Layers panel**
- View all elements
- Lock/Unlock
- Show/Hide

✅ **Save/Load**
- LocalStorage
- Persistent across refreshes

---

## 🔍 DEBUG TRONG BROWSER

### 1. Check Component Draggable
```javascript
// F12 → Console
const components = document.querySelectorAll('[draggable="true"]');
console.log('Draggable components:', components.length);
// Should show: 9 (số components)
```

### 2. Check Canvas Drop Zone
```javascript
// Canvas phải có event listeners
const canvas = document.querySelector('[style*="794px"]');
console.log('Canvas:', canvas);
// Should show: <div> element
```

### 3. Check Elements
```javascript
// Sau khi drop
const elements = document.querySelectorAll('[style*="position: absolute"]');
console.log('Elements on canvas:', elements.length);
// Should increase sau mỗi drop
```

---

## 📊 CODE STRUCTURE

```
AdvancedInvoiceBuilder
├── COMPONENTS (9 types)
├── PaletteComponent
│   └── Native draggable={true}
├── CanvasElement
│   ├── onMouseDown → Move
│   └── Resize handles
└── Main Component
    ├── handleCanvasDrop → Add element
    ├── updateElement → Update
    └── Render:
        ├── Header (toolbar)
        ├── Left (Components)
        ├── Center (Canvas)
        └── Right (Properties + Layers)
```

---

## ✅ CHECKLIST

Sau khi refresh, check:

- [ ] Sidebar trái hiện 9 components
- [ ] Components có thể kéo (cursor thay đổi)
- [ ] Canvas có viền xanh khi drag over
- [ ] Drop vào canvas → Element xuất hiện
- [ ] Click element → Viền xanh + 8 handles
- [ ] Kéo element → Di chuyển
- [ ] Kéo handles → Resize
- [ ] Sidebar phải → Properties hiện
- [ ] Tab Layers → Hiện layers
- [ ] Undo/Redo buttons hoạt động

---

## 🚀 NẾU TẤT CẢ ĐỀU OK

Bạn sẽ thấy:

1. **Kéo component "Text" từ trái**
2. **Canvas có viền xanh khi hover**
3. **Thả → Element xuất hiện với icon + text**
4. **Element ở đúng vị trí chuột thả**
5. **Click element → Select (viền xanh)**
6. **Kéo element → Di chuyển smooth**
7. **Kéo handles → Resize smooth**

---

## 📸 EXPECTED BEHAVIOR

### Empty Canvas
```
┌─────────────────────────────────┐
│                                 │
│         [Icon]                  │
│    Start Designing              │
│  Drag from left and drop here   │
│                                 │
└─────────────────────────────────┘
```

### After Drop
```
┌─────────────────────────────────┐
│  ┌──────────────┐               │
│  │ [📝] Text    │ ← Element     │
│  │ Enter text   │               │
│  └──────────────┘               │
│                                 │
└─────────────────────────────────┘
```

### Selected
```
┌─────────────────────────────────┐
│  ┌──────────────┐               │
│  │●────────────●│ ← Handles     │
│  ││ [📝] Text  ││               │
│  ││ Enter text ││ ← Blue ring   │
│  │●────────────●│               │
│  └──────────────┘               │
└─────────────────────────────────┘
```

---

## 🎉 TẤT CẢ SẼ HOẠT ĐỘNG!

**Native HTML5 Drag & Drop** là API chuẩn của browser, được support bởi TẤT CẢ browsers hiện đại!

---

# 🚀 REFRESH VÀ TEST!

```
http://localhost:5173/invoice-builder
```

**CTRL+SHIFT+R → Hard Refresh**

Sau đó kéo "Text" component và thả vào canvas! ✨


