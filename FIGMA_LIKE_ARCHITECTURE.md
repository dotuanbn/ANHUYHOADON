# 🎨 FIGMA-LIKE INVOICE BUILDER - ARCHITECTURE

## 🎯 MỤC TIÊU

Xây dựng **Professional Design System** cho Invoice Builder với:
1. ✅ Drawing Tools (Rectangle, Circle, Line, Pen Tool, etc.)
2. ✅ Component-specific Settings
3. ✅ Data Binding System (kết nối database/API)
4. ✅ Advanced Features (như Figma)

---

## 📐 ARCHITECTURE TỔNG THỂ

```
┌─────────────────────────────────────────────────────────┐
│                    INVOICE BUILDER                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  TOOLBAR   │  │   CANVAS     │  │   PROPERTIES   │  │
│  │            │  │              │  │                │  │
│  │ Drawing    │  │  Elements    │  │  Component-    │  │
│  │ Tools:     │  │  Layer:      │  │  Specific      │  │
│  │ • Select   │  │  • Shapes    │  │  Settings      │  │
│  │ • Rect     │  │  • Text      │  │                │  │
│  │ • Circle   │  │  • Tables    │  │  + Data        │  │
│  │ • Line     │  │  • Images    │  │    Binding     │  │
│  │ • Pen      │  │  • Lines     │  │                │  │
│  │ • Text     │  │              │  │                │  │
│  └────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ DRAWING TOOLS

### 1. Select Tool (V)
```typescript
- Click to select
- Drag to move
- Shift+Click for multi-select
- Cmd+Click to add/remove from selection
```

### 2. Rectangle Tool (R)
```typescript
- Click & drag to draw
- Shift+Drag for square
- Alt+Drag from center
- Settings: fill, stroke, corner radius
```

### 3. Circle/Ellipse Tool (O)
```typescript
- Click & drag to draw
- Shift+Drag for perfect circle
- Alt+Drag from center
- Settings: fill, stroke, arc angle
```

### 4. Line Tool (L)
```typescript
- Click & drag to draw
- Shift+Drag for 45° angles
- Settings: stroke width, style (solid/dashed), arrows
```

### 5. Pen Tool (P) - Bezier Curves
```typescript
- Click to add points
- Click & drag for curves
- Close path with first point
- Settings: fill, stroke, smooth/corner points
```

### 6. Text Tool (T)
```typescript
- Click to add text
- Click & drag for text box
- Rich text formatting
- Settings: font, size, weight, alignment, etc.
```

### 7. Image Tool (I)
```typescript
- Click & drag to place
- Upload or URL
- Settings: fit (cover/contain), filters, opacity
```

---

## 🎛️ COMPONENT-SPECIFIC SETTINGS

### Base Element (All)
```typescript
interface BaseElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number; // degrees
  opacity: number; // 0-1
  locked: boolean;
  visible: boolean;
  zIndex: number;
  name: string;
}
```

### Shape Element (Rectangle, Circle, etc.)
```typescript
interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle' | 'ellipse' | 'polygon';
  fill: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: Gradient;
    image?: string;
  };
  stroke: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    dashArray?: number[];
  };
  cornerRadius?: number; // for rectangle
  sides?: number; // for polygon
}
```

### Line/Path Element
```typescript
interface PathElement extends BaseElement {
  type: 'line' | 'path';
  points: { x: number; y: number; }[];
  stroke: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    cap: 'butt' | 'round' | 'square';
    join: 'miter' | 'round' | 'bevel';
  };
  arrows?: {
    start?: boolean;
    end?: boolean;
    style: 'arrow' | 'circle' | 'square';
  };
  closed?: boolean;
}
```

### Text Element
```typescript
interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  autoResize: boolean;
  maxWidth?: number;
}
```

### Table Element
```typescript
interface TableElement extends BaseElement {
  type: 'table';
  columns: {
    id: string;
    label: string;
    width: number;
    alignment: 'left' | 'center' | 'right';
    dataBinding?: string; // API field name
  }[];
  rows: {
    id: string;
    cells: {
      columnId: string;
      content: string;
      style?: CellStyle;
    }[];
  }[];
  style: {
    headerBg: string;
    headerColor: string;
    rowBg: string;
    rowAltBg?: string; // alternating rows
    borderColor: string;
    borderWidth: number;
    padding: number;
  };
  dataBinding?: {
    source: 'api' | 'database' | 'manual';
    endpoint?: string;
    query?: string;
    mapping: Record<string, string>;
  };
}
```

### Image Element
```typescript
interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  fit: 'contain' | 'cover' | 'fill' | 'scale-down';
  filters: {
    brightness: number; // 0-200
    contrast: number; // 0-200
    saturation: number; // 0-200
    blur: number; // 0-20
    grayscale: boolean;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

---

## 🔌 DATA BINDING SYSTEM

### 1. Data Source Types
```typescript
type DataSource = 
  | { type: 'manual'; data: any }
  | { type: 'api'; endpoint: string; method: 'GET' | 'POST' }
  | { type: 'database'; table: string; query: string }
  | { type: 'json'; url: string };
```

### 2. Binding Configuration
```typescript
interface DataBinding {
  elementId: string;
  source: DataSource;
  mapping: {
    elementField: string; // e.g., 'content', 'src', 'cells[0].content'
    dataPath: string; // e.g., 'customer.name', 'items[0].price'
    transform?: (value: any) => any; // optional transformer
  }[];
  refreshInterval?: number; // auto-refresh in ms
}
```

### 3. Example: Table với API
```typescript
const tableBinding: DataBinding = {
  elementId: 'products-table-123',
  source: {
    type: 'api',
    endpoint: '/api/orders/{{orderId}}/items',
    method: 'GET'
  },
  mapping: [
    {
      elementField: 'rows',
      dataPath: 'items',
      transform: (items) => items.map(item => ({
        id: item.id,
        cells: [
          { columnId: 'name', content: item.product_name },
          { columnId: 'qty', content: item.quantity.toString() },
          { columnId: 'price', content: formatCurrency(item.price) },
          { columnId: 'total', content: formatCurrency(item.total) }
        ]
      }))
    }
  ]
};
```

### 4. Example: Text với Database
```typescript
const textBinding: DataBinding = {
  elementId: 'customer-name-456',
  source: {
    type: 'database',
    table: 'customers',
    query: 'SELECT name FROM customers WHERE id = {{customerId}}'
  },
  mapping: [
    {
      elementField: 'content',
      dataPath: 'name',
      transform: (name) => `Khách hàng: ${name}`
    }
  ]
};
```

---

## 🎨 ADVANCED FEATURES

### 1. Layer Effects
```typescript
interface LayerEffects {
  shadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
  }[];
  blur?: {
    type: 'gaussian' | 'motion';
    radius: number;
  };
  gradient?: {
    type: 'linear' | 'radial' | 'angular';
    stops: { position: number; color: string; }[];
    angle?: number; // for linear
  };
}
```

### 2. Boolean Operations
```typescript
type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

function performBoolean(
  shape1: ShapeElement,
  shape2: ShapeElement,
  operation: BooleanOperation
): ShapeElement {
  // Complex SVG path manipulation
  // Returns new combined shape
}
```

### 3. Path Editing
```typescript
interface PathPoint {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'mirrored';
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

function editPath(path: PathElement, pointIndex: number, newPoint: PathPoint) {
  // Update path with new point
}
```

### 4. Smart Guides & Snapping
```typescript
interface SnappingConfig {
  enabled: boolean;
  snapToObjects: boolean;
  snapToGrid: boolean;
  snapToGuides: boolean;
  threshold: number; // pixels
}
```

---

## 🏗️ IMPLEMENTATION PHASES

### Phase 1: Drawing Tools (Week 1-2)
- [ ] Select Tool với multi-select
- [ ] Rectangle Tool
- [ ] Circle/Ellipse Tool
- [ ] Line Tool
- [ ] Basic Pen Tool
- [ ] Text Tool
- [ ] Toolbar UI

### Phase 2: Advanced Tools (Week 3)
- [ ] Advanced Pen Tool (bezier curves)
- [ ] Image Tool
- [ ] Shape manipulation
- [ ] Path editing
- [ ] Boolean operations

### Phase 3: Component Settings (Week 4)
- [ ] Component-specific properties panels
- [ ] Table configuration
- [ ] Advanced text formatting
- [ ] Image filters
- [ ] Layer effects

### Phase 4: Data Binding (Week 5-6)
- [ ] Data source configuration UI
- [ ] Field mapping UI
- [ ] API integration
- [ ] Database integration
- [ ] Real-time data updates
- [ ] Template variables

### Phase 5: Polish & Features (Week 7-8)
- [ ] Smart guides
- [ ] Auto-layout
- [ ] Component variants
- [ ] Styles system
- [ ] Export improvements
- [ ] Collaboration features

---

## 🎯 PRIORITIES

### Must Have (P0):
1. ✅ Select Tool
2. ✅ Rectangle Tool
3. ✅ Circle Tool
4. ✅ Text Tool
5. ✅ Component-specific settings
6. ✅ Basic data binding (API)

### Should Have (P1):
1. ⚠️ Line Tool
2. ⚠️ Image Tool
3. ⚠️ Table data binding
4. ⚠️ Path editing
5. ⚠️ Layer effects

### Nice to Have (P2):
1. ⏳ Advanced Pen Tool
2. ⏳ Boolean operations
3. ⏳ Smart guides
4. ⏳ Auto-layout
5. ⏳ Collaboration

---

## 💭 TECHNICAL DECISIONS

### Canvas Rendering
```
Option 1: HTML/CSS (Current)
✅ Pros: Easy, good for text, responsive
❌ Cons: Limited for complex shapes

Option 2: SVG
✅ Pros: Vector, scalable, good for shapes
❌ Cons: Performance with many elements

Option 3: Canvas (HTML5)
✅ Pros: Best performance
❌ Cons: No DOM, harder text rendering

DECISION: Hybrid approach
- SVG for shapes/paths
- HTML for text/tables
- Canvas for effects/previews
```

### Data Binding
```
Option 1: Direct API calls
✅ Simple
❌ No caching, coupling

Option 2: Redux/State Management
✅ Centralized, cacheable
❌ More complex

Option 3: React Query
✅ Best of both, auto-caching
✅ Easy to use

DECISION: React Query + Context
```

---

## 🚀 GETTING STARTED

### Step 1: Tôi sẽ implement Phase 1 trước
```
1. Drawing Tools (Rectangle, Circle, Line, Text)
2. Tool Toolbar
3. Basic component settings
```

### Step 2: Sau đó Phase 4
```
1. Data Binding UI
2. API integration
3. Table data binding
```

### Step 3: Polish
```
1. Layer effects
2. Advanced tools
3. Export features
```

---

## 📊 ESTIMATED TIMELINE

```
Phase 1 (Drawing Tools):        2-3 days
Phase 2 (Advanced Tools):       2 days
Phase 3 (Component Settings):   1-2 days
Phase 4 (Data Binding):         3-4 days
Phase 5 (Polish):              2-3 days

TOTAL: ~2 weeks full development
```

---

## 💡 NEXT STEPS

Tôi sẽ bắt đầu với **Phase 1: Drawing Tools**

1. ✅ Rectangle Tool
2. ✅ Circle Tool  
3. ✅ Line Tool
4. ✅ Text Tool (improved)
5. ✅ Tool Toolbar
6. ✅ Component-specific settings

Bạn có muốn tôi bắt đầu implement ngay không? Tôi có thể code liên tục cho đến khi hoàn thành! 🚀






