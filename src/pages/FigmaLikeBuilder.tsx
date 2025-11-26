import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Square, Circle, Minus, Type as TypeIcon, MousePointer, 
  Image as ImageIcon, Table, Save, Eye, Trash2, Layers, Grid3x3,
  Undo2, Redo2, Settings2, Download, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'image' | 'table';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface BaseElement {
  id: string;
  type: string;
  position: Position;
  size: Size;
  rotation: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  name: string;
}

interface FillStyle {
  color: string;
  opacity: number;
}

interface StrokeStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  fill: FillStyle;
  stroke: StrokeStyle;
  cornerRadius?: number; // for rectangle
}

interface LineElement extends BaseElement {
  type: 'line';
  startPoint: Position;
  endPoint: Position;
  stroke: StrokeStyle;
}

interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

type Element = ShapeElement | LineElement | TextElement;

// ============================================================================
// TOOLS
// ============================================================================

const TOOLS = [
  { id: 'select' as ToolType, icon: MousePointer, label: 'Select', shortcut: 'V' },
  { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle' as ToolType, icon: Circle, label: 'Circle', shortcut: 'O' },
  { id: 'line' as ToolType, icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'text' as ToolType, icon: TypeIcon, label: 'Text', shortcut: 'T' },
];

// ============================================================================
// CANVAS ELEMENT COMPONENT
// ============================================================================

interface CanvasElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Element>) => void;
  scale: number;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ element, isSelected, onSelect, onUpdate, scale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.position.x,
      elY: element.position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.current.x) / scale;
      const dy = (e.clientY - dragStart.current.y) / scale;
      
      onUpdate({
        position: {
          x: Math.max(0, dragStart.current.elX + dx),
          y: Math.max(0, dragStart.current.elY + dy),
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

  if (!element.visible) return null;

  // Render based on type
  const renderElement = () => {
    if (element.type === 'rectangle') {
      const rect = element as ShapeElement;
      return (
        <rect
          x={0}
          y={0}
          width={element.size.width}
          height={element.size.height}
          fill={rect.fill.color}
          fillOpacity={rect.fill.opacity}
          stroke={rect.stroke.color}
          strokeWidth={rect.stroke.width}
          strokeDasharray={rect.stroke.style === 'dashed' ? '5,5' : rect.stroke.style === 'dotted' ? '2,2' : undefined}
          rx={rect.cornerRadius || 0}
          ry={rect.cornerRadius || 0}
          className="pointer-events-auto"
        />
      );
    }

    if (element.type === 'circle') {
      const circle = element as ShapeElement;
      const rx = element.size.width / 2;
      const ry = element.size.height / 2;
      return (
        <ellipse
          cx={rx}
          cy={ry}
          rx={rx}
          ry={ry}
          fill={circle.fill.color}
          fillOpacity={circle.fill.opacity}
          stroke={circle.stroke.color}
          strokeWidth={circle.stroke.width}
          strokeDasharray={circle.stroke.style === 'dashed' ? '5,5' : circle.stroke.style === 'dotted' ? '2,2' : undefined}
          className="pointer-events-auto"
        />
      );
    }

    if (element.type === 'line') {
      const line = element as LineElement;
      return (
        <line
          x1={0}
          y1={0}
          x2={element.size.width}
          y2={element.size.height}
          stroke={line.stroke.color}
          strokeWidth={line.stroke.width}
          strokeDasharray={line.stroke.style === 'dashed' ? '5,5' : line.stroke.style === 'dotted' ? '2,2' : undefined}
          className="pointer-events-auto"
        />
      );
    }

    if (element.type === 'text') {
      const text = element as TextElement;
      return (
        <foreignObject x={0} y={0} width={element.size.width} height={element.size.height}>
          <div
            style={{
              fontFamily: text.fontFamily,
              fontSize: `${text.fontSize}px`,
              fontWeight: text.fontWeight,
              color: text.color,
              textAlign: text.textAlign,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
            className="pointer-events-auto"
          >
            {text.content}
          </div>
        </foreignObject>
      );
    }

    return null;
  };

  return (
    <g
      transform={`translate(${element.position.x}, ${element.position.y}) rotate(${element.rotation})`}
      style={{ cursor: element.locked ? 'not-allowed' : 'move' }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      
      {isSelected && !element.locked && (
        <>
          {/* Selection outline */}
          <rect
            x={-2}
            y={-2}
            width={element.size.width + 4}
            height={element.size.height + 4}
            fill="none"
            stroke="#0066FF"
            strokeWidth={2 / scale}
            pointerEvents="none"
          />
          
          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se'].map((corner) => {
            const x = corner.includes('e') ? element.size.width : 0;
            const y = corner.includes('s') ? element.size.height : 0;
            return (
              <rect
                key={corner}
                x={x - 4}
                y={y - 4}
                width={8}
                height={8}
                fill="white"
                stroke="#0066FF"
                strokeWidth={1.5 / scale}
                className="cursor-pointer"
              />
            );
          })}
        </>
      )}
    </g>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FigmaLikeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);

  // State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Position | null>(null);
  const [tempElement, setTempElement] = useState<Element | null>(null);
  const [history, setHistory] = useState<Element[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const scale = 1;

  const selectedElement = elements.find((el) => el.id === selectedId);

  // ============================================================================
  // HISTORY
  // ============================================================================

  const addToHistory = useCallback((newElements: Element[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex])));
      toast({ title: '↩️ Undo' });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex])));
      toast({ title: '↪️ Redo' });
    }
  };

  // ============================================================================
  // DRAWING HANDLERS
  // ============================================================================

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'select') return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    setDrawStart({ x, y });

    // Create temporary element based on tool
    const id = `${activeTool}-${Date.now()}`;
    let newElement: Element;

    if (activeTool === 'rectangle') {
      newElement = {
        id,
        type: 'rectangle',
        position: { x, y },
        size: { width: 0, height: 0 },
        rotation: 0,
        locked: false,
        visible: true,
        zIndex: elements.length,
        name: 'Rectangle',
        fill: { color: '#E0E7FF', opacity: 1 },
        stroke: { color: '#4F46E5', width: 2, style: 'solid' },
        cornerRadius: 0,
      } as ShapeElement;
    } else if (activeTool === 'circle') {
      newElement = {
        id,
        type: 'circle',
        position: { x, y },
        size: { width: 0, height: 0 },
        rotation: 0,
        locked: false,
        visible: true,
        zIndex: elements.length,
        name: 'Circle',
        fill: { color: '#DBEAFE', opacity: 1 },
        stroke: { color: '#3B82F6', width: 2, style: 'solid' },
      } as ShapeElement;
    } else if (activeTool === 'line') {
      newElement = {
        id,
        type: 'line',
        position: { x, y },
        size: { width: 0, height: 0 },
        rotation: 0,
        locked: false,
        visible: true,
        zIndex: elements.length,
        name: 'Line',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },
        stroke: { color: '#000000', width: 2, style: 'solid' },
      } as LineElement;
    } else if (activeTool === 'text') {
      newElement = {
        id,
        type: 'text',
        position: { x, y },
        size: { width: 200, height: 40 },
        rotation: 0,
        locked: false,
        visible: true,
        zIndex: elements.length,
        name: 'Text',
        content: 'Enter text',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: '#000000',
        textAlign: 'left',
      } as TextElement;

      // Text doesn't need drawing, add immediately
      const newElements = [...elements, newElement];
      setElements(newElements);
      setSelectedId(id);
      addToHistory(newElements);
      setActiveTool('select');
      return;
    } else {
      return;
    }

    setTempElement(newElement);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart || !tempElement) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    const width = currentX - drawStart.x;
    const height = currentY - drawStart.y;

    // Update temp element
    const updated = {
      ...tempElement,
      position: {
        x: width < 0 ? currentX : drawStart.x,
        y: height < 0 ? currentY : drawStart.y,
      },
      size: {
        width: Math.abs(width),
        height: Math.abs(height),
      },
    };

    setTempElement(updated);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !tempElement) return;

    // Only add if size is meaningful
    if (tempElement.size.width > 5 && tempElement.size.height > 5) {
      const newElements = [...elements, tempElement];
      setElements(newElements);
      setSelectedId(tempElement.id);
      addToHistory(newElements);
      
      toast({
        title: '✅ Added',
        description: `${tempElement.name} created`,
      });
    }

    setIsDrawing(false);
    setDrawStart(null);
    setTempElement(null);
    setActiveTool('select');
  };

  // ============================================================================
  // ELEMENT OPERATIONS
  // ============================================================================

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    setSelectedId(null);
    addToHistory(newElements);
    toast({ title: '🗑️ Deleted' });
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'o' || e.key === 'O') setActiveTool('circle');
      if (e.key === 'l' || e.key === 'L') setActiveTool('line');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Delete
      if (e.key === 'Delete' && selectedId) {
        e.preventDefault();
        deleteElement(selectedId);
      }

      // Escape
      if (e.key === 'Escape') {
        setSelectedId(null);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="font-bold text-lg">Figma-Like Builder</h1>
            <p className="text-xs text-gray-500">Drawing Tools & Visual Design</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="outline">{elements.length} elements</Badge>
          <Button size="sm" className="bg-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - TOOLS */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-2 flex-shrink-0">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* CENTER - CANVAS */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-white shadow-2xl rounded-lg relative">
              <svg
                ref={svgRef}
                width={794}
                height={1123}
                style={{
                  backgroundImage: showGrid
                    ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
                    : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto',
                }}
                className="rounded-lg"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={() => activeTool === 'select' && setSelectedId(null)}
              >
                {/* Render all elements */}
                {elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => setSelectedId(element.id)}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                    scale={scale}
                  />
                ))}

                {/* Render temp element while drawing */}
                {tempElement && (
                  <CanvasElement
                    element={tempElement}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    scale={scale}
                  />
                )}

                {/* Empty state */}
                {elements.length === 0 && !tempElement && (
                  <foreignObject x={0} y={0} width={794} height={1123}>
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Square className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Drawing</h3>
                        <p className="text-sm text-gray-500">Select a tool and click & drag</p>
                        <p className="text-xs text-gray-400 mt-2">
                          <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> Rectangle • 
                          <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">O</kbd> Circle • 
                          <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">L</kbd> Line
                        </p>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - PROPERTIES */}
        <div className="w-80 bg-white border-l flex flex-col flex-shrink-0">
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

            <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {selectedElement ? (
                    <>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                        <Label className="text-xs font-semibold uppercase text-gray-600">Selected</Label>
                        <p className="mt-1 text-sm font-medium">{selectedElement.name}</p>
                      </div>

                      <Separator />

                      {/* Position & Size */}
                      <Card className="p-3">
                        <Label className="text-xs font-semibold uppercase text-gray-600 mb-3 block">
                          Transform
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
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
                              onBlur={() => addToHistory(elements)}
                              className="h-8 mt-1"
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
                              onBlur={() => addToHistory(elements)}
                              className="h-8 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">W</Label>
                            <Input
                              type="number"
                              value={Math.round(selectedElement.size.width)}
                              onChange={(e) =>
                                updateElement(selectedElement.id, {
                                  size: { ...selectedElement.size, width: Number(e.target.value) },
                                })
                              }
                              onBlur={() => addToHistory(elements)}
                              className="h-8 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">H</Label>
                            <Input
                              type="number"
                              value={Math.round(selectedElement.size.height)}
                              onChange={(e) =>
                                updateElement(selectedElement.id, {
                                  size: { ...selectedElement.size, height: Number(e.target.value) },
                                })
                              }
                              onBlur={() => addToHistory(elements)}
                              className="h-8 mt-1"
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Shape-specific properties */}
                      {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
                        <Card className="p-3">
                          <Label className="text-xs font-semibold uppercase text-gray-600 mb-3 block">
                            Fill & Stroke
                          </Label>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">Fill Color</Label>
                              <div className="flex space-x-2 mt-1">
                                <Input
                                  type="color"
                                  value={(selectedElement as ShapeElement).fill.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      fill: { ...(selectedElement as ShapeElement).fill, color: e.target.value },
                                    } as Partial<ShapeElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 w-12"
                                />
                                <Input
                                  type="text"
                                  value={(selectedElement as ShapeElement).fill.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      fill: { ...(selectedElement as ShapeElement).fill, color: e.target.value },
                                    } as Partial<ShapeElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 flex-1 font-mono text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Stroke Color</Label>
                              <div className="flex space-x-2 mt-1">
                                <Input
                                  type="color"
                                  value={(selectedElement as ShapeElement).stroke.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      stroke: { ...(selectedElement as ShapeElement).stroke, color: e.target.value },
                                    } as Partial<ShapeElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 w-12"
                                />
                                <Input
                                  type="text"
                                  value={(selectedElement as ShapeElement).stroke.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      stroke: { ...(selectedElement as ShapeElement).stroke, color: e.target.value },
                                    } as Partial<ShapeElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 flex-1 font-mono text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Stroke Width</Label>
                              <Input
                                type="number"
                                value={(selectedElement as ShapeElement).stroke.width}
                                onChange={(e) =>
                                  updateElement(selectedElement.id, {
                                    stroke: { ...(selectedElement as ShapeElement).stroke, width: Number(e.target.value) },
                                  } as Partial<ShapeElement>)
                                }
                                onBlur={() => addToHistory(elements)}
                                className="h-8 mt-1"
                                min="0"
                              />
                            </div>

                            {selectedElement.type === 'rectangle' && (
                              <div>
                                <Label className="text-xs">Corner Radius</Label>
                                <Input
                                  type="number"
                                  value={(selectedElement as ShapeElement).cornerRadius || 0}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      cornerRadius: Number(e.target.value),
                                    } as Partial<ShapeElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 mt-1"
                                  min="0"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* Text-specific properties */}
                      {selectedElement.type === 'text' && (
                        <>
                          <Card className="p-3">
                            <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">
                              Content
                            </Label>
                            <Input
                              value={(selectedElement as TextElement).content}
                              onChange={(e) =>
                                updateElement(selectedElement.id, {
                                  content: e.target.value,
                                } as Partial<TextElement>)
                              }
                              onBlur={() => addToHistory(elements)}
                            />
                          </Card>

                          <Card className="p-3">
                            <Label className="text-xs font-semibold uppercase text-gray-600 mb-3 block">
                              Typography
                            </Label>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs">Font Size</Label>
                                <Input
                                  type="number"
                                  value={(selectedElement as TextElement).fontSize}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      fontSize: Number(e.target.value),
                                    } as Partial<TextElement>)
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 mt-1"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Color</Label>
                                <div className="flex space-x-2 mt-1">
                                  <Input
                                    type="color"
                                    value={(selectedElement as TextElement).color}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        color: e.target.value,
                                      } as Partial<TextElement>)
                                    }
                                    onBlur={() => addToHistory(elements)}
                                    className="h-8 w-12"
                                  />
                                  <Input
                                    type="text"
                                    value={(selectedElement as TextElement).color}
                                    onChange={(e) =>
                                      updateElement(selectedElement.id, {
                                        color: e.target.value,
                                      } as Partial<TextElement>)
                                    }
                                    onBlur={() => addToHistory(elements)}
                                    className="h-8 flex-1 font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => deleteElement(selectedElement.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete (Del)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Settings2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-600 font-medium">No element selected</p>
                      <p className="text-xs text-gray-500 mt-1">Select an element to edit properties</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="layers" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {elements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No layers</p>
                    </div>
                  ) : (
                    elements
                      .slice()
                      .sort((a, b) => b.zIndex - a.zIndex)
                      .map((element) => (
                        <div
                          key={element.id}
                          className={`p-3 rounded border cursor-pointer transition-all ${
                            element.id === selectedId ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedId(element.id)}
                        >
                          <p className="font-medium text-sm">{element.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{element.type}</p>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FigmaLikeBuilder;









