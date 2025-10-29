import React, { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Copy,
  Settings2,
  Type,
  Hash,
  FileText,
  User,
  Table,
  DollarSign,
  AlignBottom,
  Plus,
  Layers,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Download,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Minus,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Types
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Style {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

interface InvoiceElement {
  id: string;
  type: string;
  label: string;
  content: string;
  position: Position;
  size: Size;
  style: Style;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

interface HistoryState {
  elements: InvoiceElement[];
}

// Component Palette
const COMPONENTS = [
  { id: 'text', label: 'Text', description: 'Add text', icon: Type, category: 'Basic' },
  { id: 'heading', label: 'Heading', description: 'Large heading', icon: Type, category: 'Basic' },
  { id: 'divider', label: 'Divider', description: 'Horizontal line', icon: Minus, category: 'Basic' },
  { id: 'logo', label: 'Logo', description: 'Company logo', icon: ImageIcon, category: 'Company' },
  { id: 'company-name', label: 'Company Name', description: 'Company name', icon: Type, category: 'Company' },
  { id: 'order-number', label: 'Order #', description: 'Order number', icon: Hash, category: 'Order' },
  { id: 'order-info', label: 'Order Info', description: 'Order details', icon: FileText, category: 'Order' },
  { id: 'customer-info', label: 'Customer', description: 'Customer info', icon: User, category: 'Customer' },
  { id: 'products-table', label: 'Products', description: 'Products table', icon: Table, category: 'Content' },
  { id: 'payment-summary', label: 'Payment', description: 'Payment summary', icon: DollarSign, category: 'Content' },
  { id: 'footer', label: 'Footer', description: 'Footer text', icon: AlignBottom, category: 'Layout' },
];

// Draggable Component from Palette
const PaletteComponent = ({ component }: { component: typeof COMPONENTS[0] }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${component.id}`,
    data: component,
  });

  const Icon = component.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{component.label}</p>
          <p className="text-xs text-gray-500 truncate">{component.description}</p>
        </div>
      </div>
    </div>
  );
};

// Canvas Element (free-form positioned)
const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}: {
  element: InvoiceElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<InvoiceElement>) => void;
  onDelete: () => void;
  scale: number;
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0 });

  const handleMouseDownMove = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.position.x,
      elY: element.position.y,
      elW: element.size.width,
      elH: element.size.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startPos.current.x) / scale;
      const dy = (e.clientY - startPos.current.y) / scale;
      onUpdate({
        position: {
          x: Math.max(0, startPos.current.elX + dx),
          y: Math.max(0, startPos.current.elY + dy),
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDownResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.position.x,
      elY: element.position.y,
      elW: element.size.width,
      elH: element.size.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startPos.current.x) / scale;
      const dy = (e.clientY - startPos.current.y) / scale;

      let newPos = { ...element.position };
      let newSize = { ...element.size };

      if (direction.includes('e')) newSize.width = Math.max(50, startPos.current.elW + dx);
      if (direction.includes('w')) {
        newSize.width = Math.max(50, startPos.current.elW - dx);
        newPos.x = startPos.current.elX + (startPos.current.elW - newSize.width);
      }
      if (direction.includes('s')) newSize.height = Math.max(30, startPos.current.elH + dy);
      if (direction.includes('n')) {
        newSize.height = Math.max(30, startPos.current.elH - dy);
        newPos.x = startPos.current.elY + (startPos.current.elH - newSize.height);
      }

      onUpdate({ position: newPos, size: newSize });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!element.visible) return null;

  const Icon = COMPONENTS.find((c) => c.id === element.type)?.icon || Type;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: element.zIndex,
        ...element.style,
      }}
      className={`
        transition-shadow cursor-move
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300'}
        ${element.locked ? 'cursor-not-allowed opacity-60' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDownMove}
    >
      {/* Content */}
      <div className="h-full flex items-center">
        <div className="flex items-center space-x-2 px-2">
          <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />
          <span className="text-sm truncate" style={{ fontSize: element.style.fontSize }}>
            {element.content}
          </span>
        </div>
      </div>

      {/* Resize Handles (only when selected) */}
      {isSelected && !element.locked && (
        <>
          {/* Corners */}
          {['nw', 'ne', 'sw', 'se'].map((dir) => (
            <div
              key={dir}
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-grab"
              style={{
                ...(dir.includes('n') ? { top: -6 } : { bottom: -6 }),
                ...(dir.includes('w') ? { left: -6 } : { right: -6 }),
                cursor: `${dir}-resize`,
              }}
              onMouseDown={(e) => handleMouseDownResize(e, dir)}
            />
          ))}
          {/* Edges */}
          {['n', 's', 'e', 'w'].map((dir) => (
            <div
              key={dir}
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full"
              style={{
                ...(dir === 'n' && { top: -6, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }),
                ...(dir === 's' && { bottom: -6, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }),
                ...(dir === 'e' && { right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' }),
                ...(dir === 'w' && { left: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' }),
              }}
              onMouseDown={(e) => handleMouseDownResize(e, dir)}
            />
          ))}
        </>
      )}

      {/* Label (when selected) */}
      {isSelected && (
        <div className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {element.label}
        </div>
      )}
    </div>
  );
};

// Main Component
const AdvancedInvoiceBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [elements, setElements] = useState<InvoiceElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);

  const selectedElement = elements.find((el) => el.id === selectedId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // History management
  const addToHistory = (newElements: InvoiceElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: JSON.parse(JSON.stringify(newElements)) });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1].elements)));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1].elements)));
    }
  };

  // Drag & Drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'canvas') {
      const componentType = (active.id as string).replace('palette-', '');
      const component = COMPONENTS.find((c) => c.id === componentType);

      if (component) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dropX = (event.activatorEvent as PointerEvent).clientX - rect.left;
        const dropY = (event.activatorEvent as PointerEvent).clientY - rect.top;

        const newElement: InvoiceElement = {
          id: `${componentType}-${Date.now()}`,
          type: componentType,
          label: component.label,
          content: `Enter ${component.label.toLowerCase()}`,
          position: { x: dropX / scale, y: dropY / scale },
          size: { width: 200, height: 40 },
          style: {
            fontSize: componentType === 'heading' ? 24 : 14,
            fontWeight: componentType === 'heading' ? 'bold' : 'normal',
            color: '#000000',
            backgroundColor: 'transparent',
            padding: 8,
            borderWidth: 0,
            borderColor: '#e5e7eb',
            borderRadius: 0,
            textAlign: 'left',
            opacity: 1,
          },
          locked: false,
          visible: true,
          zIndex: elements.length,
        };

        const newElements = [...elements, newElement];
        setElements(newElements);
        setSelectedId(newElement.id);
        addToHistory(newElements);

        toast({
          title: 'Element added',
          description: `${component.label} added to canvas`,
        });
      }
    }
  };

  // Element operations
  const updateElement = (id: string, updates: Partial<InvoiceElement>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(newElements);
  };

  const saveToHistory = () => {
    addToHistory(elements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    setSelectedId(null);
    addToHistory(newElements);
    toast({ title: 'Element deleted' });
  };

  const duplicateElement = (element: InvoiceElement) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      position: { x: element.position.x + 20, y: element.position.y + 20 },
      zIndex: elements.length,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
    addToHistory(newElements);
    toast({ title: 'Element duplicated' });
  };

  // Alignment tools
  const alignElements = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedId) return;
    
    const selected = elements.find(el => el.id === selectedId);
    if (!selected) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    let newPosition = { ...selected.position };

    switch (alignment) {
      case 'left':
        newPosition.x = 0;
        break;
      case 'center':
        newPosition.x = (canvasRect.width / scale - selected.size.width) / 2;
        break;
      case 'right':
        newPosition.x = canvasRect.width / scale - selected.size.width;
        break;
      case 'top':
        newPosition.y = 0;
        break;
      case 'middle':
        newPosition.y = (canvasRect.height / scale - selected.size.height) / 2;
        break;
      case 'bottom':
        newPosition.y = canvasRect.height / scale - selected.size.height;
        break;
    }

    updateElement(selectedId, { position: newPosition });
    saveToHistory();
  };

  // Canvas droppable
  const { setNodeRef: setCanvasRef } = useDroppable({ id: 'canvas' });

  // Group components by category
  const groupedComponents = COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof COMPONENTS>);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-bold text-lg">Advanced Invoice Builder</h1>
              <p className="text-xs text-gray-500">Drag & Drop Invoice Designer - Figma Style</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Undo/Redo */}
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Zoom */}
            <Button variant="outline" size="sm" onClick={() => setScale(Math.max(0.25, scale - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="min-w-[60px] justify-center">
              {Math.round(scale * 100)}%
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setScale(Math.min(2, scale + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScale(1)}>
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Badge variant="outline" className="bg-blue-50">
              {elements.length} elements
            </Badge>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Components Palette */}
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-sm uppercase text-gray-600 mb-1 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Components
              </h2>
              <p className="text-xs text-gray-500">Drag to canvas</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {Object.entries(groupedComponents).map(([category, comps]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
                    <div className="space-y-2">
                      {comps.map((component) => (
                        <PaletteComponent key={component.id} component={component} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="flex flex-col items-center">
              {/* Toolbar */}
              <div className="mb-4 bg-white rounded-lg shadow-sm border px-4 py-2 flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
                  <Grid3x3 className={`w-4 h-4 ${showGrid ? 'text-blue-600' : ''}`} />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alignElements('left')}
                  disabled={!selectedId}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alignElements('center')}
                  disabled={!selectedId}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alignElements('right')}
                  disabled={!selectedId}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Canvas */}
              <div
                ref={(node) => {
                  setCanvasRef(node);
                  canvasRef.current = node;
                }}
                className="bg-white shadow-2xl rounded-lg relative"
                style={{
                  width: `${794 * scale}px`, // A4 width in pixels at 96 DPI
                  height: `${1123 * scale}px`, // A4 height in pixels at 96 DPI
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  backgroundImage: showGrid
                    ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
                    : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto',
                }}
                onClick={() => setSelectedId(null)}
              >
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Move className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Designing</h3>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Drag components from the left panel and drop them anywhere on the canvas
                      </p>
                    </div>
                  </div>
                )}

                {elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => setSelectedId(element.id)}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                    onDelete={() => deleteElement(element.id)}
                    scale={scale}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties & Layers */}
          <div className="w-96 bg-white border-l flex flex-col">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="properties">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="layers">
                  <Layers className="w-4 h-4 mr-2" />
                  Layers
                </TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent value="properties" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {selectedElement ? (
                      <>
                        <div>
                          <h3 className="font-semibold text-sm mb-3">{selectedElement.label}</h3>

                          {/* Position */}
                          <Card className="p-3 mb-4">
                            <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">
                              Position & Size
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">X</Label>
                                <Input
                                  type="number"
                                  value={Math.round(selectedElement.position.x)}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      position: { ...selectedElement.position, x: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Y</Label>
                                <Input
                                  type="number"
                                  value={Math.round(selectedElement.position.y)}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      position: { ...selectedElement.position, y: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Width</Label>
                                <Input
                                  type="number"
                                  value={Math.round(selectedElement.size.width)}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      size: { ...selectedElement.size, width: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Height</Label>
                                <Input
                                  type="number"
                                  value={Math.round(selectedElement.size.height)}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      size: { ...selectedElement.size, height: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </Card>

                          {/* Content */}
                          <Card className="p-3 mb-4">
                            <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">
                              Content
                            </Label>
                            <Input
                              value={selectedElement.content}
                              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                              onBlur={saveToHistory}
                              placeholder="Enter content"
                            />
                          </Card>

                          {/* Style */}
                          <Card className="p-3 mb-4">
                            <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">Style</Label>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs">Font Size</Label>
                                <Input
                                  type="number"
                                  value={selectedElement.style.fontSize || 14}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, fontSize: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  className="h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Text Color</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    type="color"
                                    value={selectedElement.style.color || '#000000'}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        style: { ...selectedElement.style, color: e.target.value },
                                      })
                                    }
                                    onBlur={saveToHistory}
                                    className="h-8 w-12"
                                  />
                                  <Input
                                    type="text"
                                    value={selectedElement.style.color || '#000000'}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        style: { ...selectedElement.style, color: e.target.value },
                                      })
                                    }
                                    onBlur={saveToHistory}
                                    className="h-8 flex-1 font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Background</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    type="color"
                                    value={selectedElement.style.backgroundColor || '#ffffff'}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        style: { ...selectedElement.style, backgroundColor: e.target.value },
                                      })
                                    }
                                    onBlur={saveToHistory}
                                    className="h-8 w-12"
                                  />
                                  <Input
                                    type="text"
                                    value={selectedElement.style.backgroundColor || '#ffffff'}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        style: { ...selectedElement.style, backgroundColor: e.target.value },
                                      })
                                    }
                                    onBlur={saveToHistory}
                                    className="h-8 flex-1 font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Border Width</Label>
                                <Input
                                  type="number"
                                  value={selectedElement.style.borderWidth || 0}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, borderWidth: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  min="0"
                                  className="h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Border Radius</Label>
                                <Input
                                  type="number"
                                  value={selectedElement.style.borderRadius || 0}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, borderRadius: Number(e.target.value) },
                                    })
                                  }
                                  onBlur={saveToHistory}
                                  min="0"
                                  className="h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Opacity</Label>
                                <Slider
                                  value={[selectedElement.style.opacity || 1]}
                                  onValueChange={([val]) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, opacity: val },
                                    })
                                  }
                                  onValueCommit={saveToHistory}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </Card>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => duplicateElement(selectedElement)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => deleteElement(selectedElement.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <Settings2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">No element selected</p>
                        <p className="text-xs text-gray-500">Click an element to edit its properties</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Layers Tab */}
              <TabsContent value="layers" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {elements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No layers yet</p>
                      </div>
                    ) : (
                      elements
                        .sort((a, b) => b.zIndex - a.zIndex)
                        .map((element) => {
                          const Icon = COMPONENTS.find((c) => c.id === element.type)?.icon || Type;
                          return (
                            <div
                              key={element.id}
                              className={`p-3 rounded border cursor-pointer transition-all ${
                                element.id === selectedId ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedId(element.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Icon className="w-4 h-4 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{element.label}</p>
                                    <p className="text-xs text-gray-500 truncate">{element.content}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateElement(element.id, { visible: !element.visible });
                                  }}
                                >
                                  {element.visible ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3 opacity-30" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default AdvancedInvoiceBuilder;

