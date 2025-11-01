# 🚀 IMPLEMENTATION PLAN - FIGMA-LIKE BUILDER

## 🎯 HIỆN TẠI

Tôi sẽ implement **Phase 1: Drawing Tools** với các công cụ cơ bản:

---

## 📋 PHASE 1: DRAWING TOOLS

### Tools cần implement:

#### 1. **Select Tool (V)** ✅ Đã có
- Click to select
- Drag to move
- Multi-select with Shift

#### 2. **Rectangle Tool (R)** 🆕
- Click & drag to draw
- Shift+Drag for square
- Settings: fill, stroke, corner radius

#### 3. **Circle Tool (O)** 🆕
- Click & drag to draw
- Shift+Drag for perfect circle
- Settings: fill, stroke

#### 4. **Line Tool (L)** 🆕
- Click & drag to draw
- Shift+Drag for 45° angles
- Settings: stroke width, color, style

#### 5. **Text Tool (T)** 🔄 Improve
- Click to add text
- Rich formatting
- Font settings

---

## 🏗️ ARCHITECTURE

### New Component Structure:

```typescript
// Base
interface BaseElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'table' | 'custom';
  position: { x: number; y: number };
  size: { width: number; height: number };
  // ... common properties
}

// Shape-specific
interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  fill: {
    color: string;
    opacity: number;
  };
  stroke: {
    color: string;
    width: number;
    style: 'solid' | 'dashed';
  };
  cornerRadius?: number; // rectangle only
}

// Line-specific
interface LineElement extends BaseElement {
  type: 'line';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  stroke: {
    color: string;
    width: number;
    style: 'solid' | 'dashed';
  };
}
```

---

## 🎨 UI CHANGES

### 1. Tool Toolbar (Left)
```
┌──────────┐
│ [V] Select│ ← Currently active
│ [R] Rect  │
│ [O] Circle│
│ [L] Line  │
│ [T] Text  │
│ [I] Image │
│ [⊞] Table │
└──────────┘
```

### 2. Canvas Interaction
```
- Select Tool: Normal interaction (đã có)
- Draw Tools: Click & drag to create shape
- Text Tool: Click to place text
```

### 3. Properties Panel (Right)
```
Based on selected tool/element:

Rectangle:
  - Fill Color
  - Fill Opacity
  - Stroke Color
  - Stroke Width
  - Corner Radius

Circle:
  - Fill Color
  - Fill Opacity
  - Stroke Color
  - Stroke Width

Line:
  - Stroke Color
  - Stroke Width
  - Stroke Style (solid/dashed)
  - Arrow Start/End

Text:
  - Content
  - Font Family
  - Font Size
  - Font Weight
  - Color
  - Alignment
```

---

## 🔄 DATA BINDING - PHASE 4

### Table Element với API Binding:

```typescript
interface TableElementWithBinding extends BaseElement {
  type: 'table';
  // ... table config
  dataBinding?: {
    enabled: boolean;
    source: {
      type: 'api' | 'database';
      endpoint?: string; // for API
      query?: string; // for database
    };
    mapping: {
      column: string; // column ID
      field: string; // API response field
      transform?: string; // optional JS transform function
    }[];
    refreshInterval?: number; // ms
  };
}
```

### UI cho Data Binding:
```
Properties Panel → Data Tab:

[✓] Enable Data Binding

Source Type: [API ▼]
Endpoint: [/api/orders/{{orderId}}/items]

Column Mapping:
┌────────────┬──────────────┬──────────┐
│ Column     │ API Field    │ Transform│
├────────────┼──────────────┼──────────┤
│ Product    │ product_name │          │
│ Quantity   │ qty          │          │
│ Price      │ price        │ currency │
│ Total      │ total        │ currency │
└────────────┴──────────────┴──────────┘

[Test Connection] [Apply]
```

---

## 💡 IMPLEMENTATION APPROACH

### Option 1: Viết lại từ đầu ⭐ RECOMMENDED
**Pros:**
- Clean architecture
- Better organized
- Easier to add features
- Better performance

**Cons:**
- Mất features hiện tại tạm thời
- Cần migrate lại

### Option 2: Extend hiện tại
**Pros:**
- Giữ features đã có
- Ít work hơn

**Cons:**
- Code messy hơn
- Harder to maintain
- Limitations

---

## 🎯 QUYẾT ĐỊNH

Tôi sẽ:

1. **Giữ file hiện tại** (`AdvancedInvoiceBuilder.tsx`)
2. **Tạo file mới** (`FigmaLikeBuilder.tsx`) với architecture mới
3. **Route mới** `/figma-builder`
4. User có thể dùng cả 2 versions

---

## 📅 TIMELINE

### Ngay bây giờ (2-3 giờ):
```
1. Tạo FigmaLikeBuilder.tsx với base structure
2. Implement Rectangle Tool
3. Implement Circle Tool
4. Implement Line Tool
5. Tool Toolbar UI
6. Basic properties panel
```

### Sau đó (1-2 giờ):
```
1. Improve Text Tool
2. Component-specific settings
3. Polish interactions
```

### Cuối cùng (2-3 giờ):
```
1. Data Binding UI
2. API integration
3. Table data binding
4. Testing
```

**TOTAL: 5-8 giờ coding**

---

## 🤔 CÂU HỎI CHO BẠN

### 1. Approach nào?
- [ ] **Option A**: Tạo file mới `/figma-builder` (RECOMMENDED)
- [ ] **Option B**: Extend file hiện tại

### 2. Priority features?
Rank 1-5 (1 = highest):
- [ ] Drawing Tools (Rectangle, Circle, Line)
- [ ] Component-specific settings
- [ ] Data Binding (API/Database)
- [ ] Advanced tools (Pen, Boolean)
- [ ] Layer effects

### 3. Timeline?
- [ ] **Fast**: Chỉ core features (2-3 ngày)
- [ ] **Complete**: Tất cả features (1-2 tuần)

---

## 💬 TÔI SUGGEST

**Approach:** Option A - File mới  
**Priority:** 
1. Drawing Tools ⭐⭐⭐⭐⭐
2. Component settings ⭐⭐⭐⭐
3. Data Binding ⭐⭐⭐⭐
4. Advanced tools ⭐⭐⭐
5. Effects ⭐⭐

**Timeline:** Fast iteration
- Ngày 1: Drawing Tools
- Ngày 2: Component settings + Polish
- Ngày 3: Data Binding
- Ngày 4+: Advanced features

---

## 🚀 READY TO START?

Tôi sẽ bắt đầu code ngay khi bạn confirm! 

**Tôi có thể code liên tục và không dừng cho đến khi hoàn thành tất cả!** 💪

Bạn muốn tôi:
1. ✅ Bắt đầu luôn với Option A (file mới)
2. ⏸️ Chờ bạn review plan trước

Chọn nào? 🎯





