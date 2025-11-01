import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft, Save, Trash2, Copy, Settings2, Type, Hash, FileText, User, Table,
  DollarSign, AlignVerticalJustifyEnd, Plus, Layers, AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Grid3x3, Lock, Unlock, Eye as EyeIcon, EyeOff, Move, Download,
  FolderOpen, Eye, Keyboard, HelpCircle, X, Check, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ElementStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '600';
  color: string;
  backgroundColor: string;
  padding: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right';
  opacity: number;
}

interface InvoiceElement {
  id: string;
  type: string;
  label: string;
  content: string;
  position: Position;
  size: Size;
  style: ElementStyle;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

interface Component {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  elements: InvoiceElement[];
  createdAt: string;
  thumbnail?: string;
}

// ============================================================================
// COMPONENTS PALETTE
// ============================================================================

const COMPONENTS: Component[] = [
  { id: 'text', label: 'Text', description: 'Add text', icon: Type, category: 'Basic' },
  { id: 'heading', label: 'Heading', description: 'Large heading', icon: Type, category: 'Basic' },
  { id: 'company-name', label: 'Company Name', description: 'Company name', icon: Type, category: 'Company' },
  { id: 'order-number', label: 'Order #', description: 'Order number', icon: Hash, category: 'Order' },
  { id: 'order-info', label: 'Order Info', description: 'Order details', icon: FileText, category: 'Order' },
  { id: 'customer-info', label: 'Customer', description: 'Customer info', icon: User, category: 'Customer' },
  { id: 'products-table', label: 'Products', description: 'Products table', icon: Table, category: 'Content' },
  { id: 'payment-summary', label: 'Payment', description: 'Payment summary', icon: DollarSign, category: 'Content' },
  { id: 'footer', label: 'Footer', description: 'Footer text', icon: AlignVerticalJustifyEnd, category: 'Layout' },
];

// ============================================================================
// DRAGGABLE PALETTE COMPONENT
// ============================================================================

interface PaletteComponentProps {
  component: Component;
  onDragStart: (componentId: string) => void;
}

const PaletteComponent: React.FC<PaletteComponentProps> = ({ component, onDragStart }) => {
  const Icon = component.icon;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('componentId', component.id);
        onDragStart(component.id);
      }}
      className="p-3 border rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all group"
      title={component.description}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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

// ============================================================================
// CANVAS ELEMENT
// ============================================================================

interface CanvasElementProps {
  element: InvoiceElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<InvoiceElement>) => void;
  onUpdateComplete: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isPreviewMode: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onUpdateComplete, 
  onDelete,
  onDuplicate,
  isPreviewMode 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, elX: 0, elY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isPreviewMode) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.position.x,
      elY: element.position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      onUpdate({
        position: {
          x: Math.max(0, dragStartRef.current.elX + dx),
          y: Math.max(0, dragStartRef.current.elY + dy),
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onUpdateComplete();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (element.locked || isPreviewMode) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...element.position };
    const startSize = { ...element.size };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newPos = { ...startPos };
      const newSize = { ...startSize };

      if (direction.includes('e')) {
        newSize.width = Math.max(50, startSize.width + dx);
      }
      if (direction.includes('w')) {
        const newWidth = Math.max(50, startSize.width - dx);
        newPos.x = startPos.x + (startSize.width - newWidth);
        newSize.width = newWidth;
      }
      if (direction.includes('s')) {
        newSize.height = Math.max(30, startSize.height + dy);
      }
      if (direction.includes('n')) {
        const newHeight = Math.max(30, startSize.height - dy);
        newPos.y = startPos.y + (startSize.height - newHeight);
        newSize.height = newHeight;
      }

      onUpdate({ position: newPos, size: newSize });
    };

    const handleMouseUp = () => {
      onUpdateComplete();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  useEffect(() => {
    if (showContextMenu) {
      const handleClick = () => setShowContextMenu(false);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showContextMenu]);

  if (!element.visible && !isPreviewMode) return null;

  const Icon = COMPONENTS.find((c) => c.id === element.type)?.icon || Type;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          zIndex: element.zIndex,
          fontSize: `${element.style.fontSize}px`,
          fontWeight: element.style.fontWeight,
          color: element.style.color,
          backgroundColor: element.style.backgroundColor,
          padding: `${element.style.padding}px`,
          borderWidth: `${element.style.borderWidth}px`,
          borderStyle: 'solid',
          borderColor: element.style.borderColor,
          borderRadius: `${element.style.borderRadius}px`,
          textAlign: element.style.textAlign,
          opacity: element.style.opacity,
          cursor: isPreviewMode ? 'default' : element.locked ? 'not-allowed' : 'move',
        }}
        className={`select-none transition-shadow ${
          !isPreviewMode && isSelected ? 'ring-2 ring-blue-500 shadow-lg' : !isPreviewMode ? 'hover:ring-1 hover:ring-gray-300' : ''
        }`}
        onClick={(e) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          onSelect();
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        <div className="h-full w-full flex items-center overflow-hidden pointer-events-none">
          <div className="flex items-center space-x-2 w-full">
            {!isPreviewMode && <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />}
            <span className="text-sm truncate flex-1">{element.content}</span>
          </div>
        </div>

        {!isPreviewMode && isSelected && !element.locked && (
          <>
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((dir) => (
              <div
                key={dir}
                className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full hover:scale-125 transition-transform pointer-events-auto"
                style={{
                  ...(dir === 'nw' && { top: -6, left: -6, cursor: 'nw-resize' }),
                  ...(dir === 'ne' && { top: -6, right: -6, cursor: 'ne-resize' }),
                  ...(dir === 'sw' && { bottom: -6, left: -6, cursor: 'sw-resize' }),
                  ...(dir === 'se' && { bottom: -6, right: -6, cursor: 'se-resize' }),
                  ...(dir === 'n' && { top: -6, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }),
                  ...(dir === 's' && { bottom: -6, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }),
                  ...(dir === 'e' && { right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' }),
                  ...(dir === 'w' && { left: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' }),
                }}
                onMouseDown={(e) => handleResizeMouseDown(e, dir)}
              />
            ))}
          </>
        )}

        {!isPreviewMode && isSelected && (
          <div className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none flex items-center space-x-1">
            <Icon className="w-3 h-3" />
            <span>{element.label}</span>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[160px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 text-left"
            onClick={() => {
              onDuplicate();
              setShowContextMenu(false);
            }}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            className="w-full px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 text-left"
            onClick={() => {
              onUpdate({ locked: !element.locked });
              onUpdateComplete();
              setShowContextMenu(false);
            }}
          >
            {element.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{element.locked ? 'Unlock' : 'Lock'}</span>
          </button>
          <Separator className="my-1" />
          <button
            className="w-full px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 text-left"
            onClick={() => {
              onDelete();
              setShowContextMenu(false);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdvancedInvoiceBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [elements, setElements] = useState<InvoiceElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<InvoiceElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // ============================================================================
  // LOAD TEMPLATES ON MOUNT
  // ============================================================================

  useEffect(() => {
    loadTemplatesList();
  }, []);

  const loadTemplatesList = () => {
    const saved = localStorage.getItem('invoice_builder_templates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  };

  // ============================================================================
  // HISTORY
  // ============================================================================

  const addToHistory = (newElements: InvoiceElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

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
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Delete
      if (e.key === 'Delete' && selectedId && !isPreviewMode) {
        e.preventDefault();
        deleteElement(selectedId);
      }
      // Escape - deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
        setIsPreviewMode(false);
      }
      // Ctrl+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId && !isPreviewMode) {
        e.preventDefault();
        const element = elements.find(el => el.id === selectedId);
        if (element) duplicateElement(element);
      }
      // Ctrl+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
      // Ctrl+P - Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(!isPreviewMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedId, elements, isPreviewMode]);

  // ============================================================================
  // DRAG & DROP
  // ============================================================================

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const componentId = e.dataTransfer.getData('componentId');
    if (!componentId) return;

    const component = COMPONENTS.find((c) => c.id === componentId);
    if (!component) return;

    const canvas = e.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: InvoiceElement = {
      id: `${componentId}-${Date.now()}`,
      type: componentId,
      label: component.label,
      content: `Enter ${component.label.toLowerCase()}`,
      position: { x: Math.max(0, x - 100), y: Math.max(0, y - 20) },
      size: { 
        width: componentId === 'products-table' ? 600 : 250, 
        height: componentId === 'products-table' ? 200 : 40 
      },
      style: {
        fontSize: componentId === 'heading' ? 28 : componentId === 'footer' ? 11 : 14,
        fontWeight: componentId === 'heading' || componentId === 'company-name' ? 'bold' : 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: 8,
        borderWidth: 0,
        borderColor: '#e5e7eb',
        borderRadius: 0,
        textAlign: componentId === 'footer' ? 'center' : 'left',
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
      title: '✅ Added!',
      description: `${component.label} added to canvas`,
    });
  };

  // ============================================================================
  // ELEMENT OPERATIONS
  // ============================================================================

  const updateElement = (id: string, updates: Partial<InvoiceElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    setSelectedId(null);
    addToHistory(newElements);
    toast({ title: '🗑️ Deleted' });
  };

  const duplicateElement = (element: InvoiceElement) => {
    const newElement: InvoiceElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      position: { x: element.position.x + 20, y: element.position.y + 20 },
      zIndex: elements.length,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
    addToHistory(newElements);
    toast({ title: '📋 Duplicated' });
  };

  const toggleLock = (id: string) => {
    updateElement(id, { locked: !elements.find((el) => el.id === id)?.locked });
    addToHistory(elements);
  };

  const toggleVisibility = (id: string) => {
    updateElement(id, { visible: !elements.find((el) => el.id === id)?.visible });
    addToHistory(elements);
  };

  const alignElement = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    const selected = elements.find((el) => el.id === selectedId);
    if (!selected) return;

    let newX = selected.position.x;
    if (alignment === 'left') newX = 20;
    if (alignment === 'center') newX = (794 - selected.size.width) / 2;
    if (alignment === 'right') newX = 794 - selected.size.width - 20;

    updateElement(selectedId, { position: { ...selected.position, x: newX } });
    addToHistory(elements);
    toast({ title: `Aligned ${alignment}` });
  };

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      elements: JSON.parse(JSON.stringify(elements)),
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('invoice_builder_templates', JSON.stringify(updated));

    setShowSaveDialog(false);
    setTemplateName('');
    toast({ title: '💾 Template saved!', description: templateName });
  };

  const loadTemplate = (template: SavedTemplate) => {
    setElements(JSON.parse(JSON.stringify(template.elements)));
    addToHistory(template.elements);
    setShowLoadDialog(false);
    toast({ title: '📂 Template loaded', description: template.name });
  };

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('invoice_builder_templates', JSON.stringify(updated));
    toast({ title: '🗑️ Template deleted' });
  };

  const clearCanvas = () => {
    if (window.confirm('Clear all elements?')) {
      setElements([]);
      setSelectedId(null);
      addToHistory([]);
      toast({ title: '🗑️ Cleared' });
    }
  };

  // ============================================================================
  // GROUP COMPONENTS
  // ============================================================================

  const groupedComponents = COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, Component[]>);

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
            <h1 className="font-bold text-lg flex items-center">
              Advanced Invoice Builder
              {isPreviewMode && (
                <Badge variant="secondary" className="ml-2">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview Mode
                </Badge>
              )}
            </h1>
            <p className="text-xs text-gray-500">Professional Visual Editor</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
            <Redo2 className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Badge variant="outline" className="bg-blue-50">{elements.length} elements</Badge>
          
          <Button 
            variant={isPreviewMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Preview (Ctrl+P)"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)} title="Load Template">
            <FolderOpen className="w-4 h-4 mr-2" />
            Load
          </Button>
          
          <Button size="sm" onClick={() => setShowSaveDialog(true)} className="bg-blue-600" title="Save (Ctrl+S)">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowHelpDialog(true)} title="Help & Shortcuts">
            <Keyboard className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r flex flex-col flex-shrink-0">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="font-semibold text-sm uppercase text-gray-700 mb-1 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                Components
              </h2>
              <p className="text-xs text-gray-600">Drag & drop to canvas</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {Object.entries(groupedComponents).map(([category, comps]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {comps.map((component) => (
                        <PaletteComponent
                          key={component.id}
                          component={component}
                          onDragStart={setDraggedComponent}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">💡 Quick Tips</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Right-click element for menu</li>
                <li>• Ctrl+D to duplicate</li>
                <li>• Delete to remove</li>
                <li>• Ctrl+P for preview</li>
              </ul>
            </div>
          </div>
        )}

        {/* CENTER - CANVAS */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex flex-col items-center">
            {/* Toolbar */}
            {!isPreviewMode && (
              <div className="mb-4 bg-white rounded-lg shadow-sm border px-4 py-2 flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle Grid"
                >
                  <Grid3x3 className={`w-4 h-4 ${showGrid ? 'text-blue-600' : ''}`} />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => alignElement('left')} disabled={!selectedId} title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alignElement('center')} disabled={!selectedId} title="Align Center">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alignElement('right')} disabled={!selectedId} title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={clearCanvas} title="Clear All">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}

            {/* Canvas */}
            <div
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              className={`bg-white shadow-2xl rounded-lg relative transition-all ${
                draggedComponent && !isPreviewMode ? 'ring-4 ring-blue-300' : ''
              } ${isPreviewMode ? 'shadow-none' : ''}`}
              style={{
                width: '794px',
                height: '1123px',
                backgroundImage: showGrid && !isPreviewMode
                  ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
                  : 'none',
                backgroundSize: showGrid ? '20px 20px' : 'auto',
              }}
              onClick={() => setSelectedId(null)}
            >
              {elements.length === 0 && !isPreviewMode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Move className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Designing</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Drag components from the left sidebar</p>
                    <p className="text-xs text-gray-400 mt-2">Press <kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd> for shortcuts</p>
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
                  onUpdateComplete={() => addToHistory(elements)}
                  onDelete={() => deleteElement(element.id)}
                  onDuplicate={() => duplicateElement(element)}
                  isPreviewMode={isPreviewMode}
                />
              ))}
            </div>

            {isPreviewMode && (
              <div className="mt-4 flex space-x-2">
                <Button onClick={() => setIsPreviewMode(false)} variant="outline">
                  Exit Preview
                </Button>
                <Button onClick={() => toast({ title: 'Export feature coming soon!' })} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        {!isPreviewMode && (
          <div className="w-96 bg-white border-l flex flex-col flex-shrink-0">
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

              {/* PROPERTIES */}
              <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {selectedElement ? (
                      <>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                          <Label className="text-xs font-semibold uppercase text-gray-600">Selected Element</Label>
                          <p className="mt-1 text-sm font-medium flex items-center">
                            {React.createElement(COMPONENTS.find((c) => c.id === selectedElement.type)?.icon || Type, { className: "w-4 h-4 mr-2" })}
                            {selectedElement.label}
                          </p>
                        </div>

                        <Separator />

                        {/* Position & Size */}
                        <Card className="p-3">
                          <Label className="text-xs font-semibold uppercase text-gray-600 mb-3 block">Position & Size</Label>
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
                              <Label className="text-xs">Width</Label>
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
                              <Label className="text-xs">Height</Label>
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

                        {/* Content */}
                        <Card className="p-3">
                          <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">Content</Label>
                          <Input
                            value={selectedElement.content}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            onBlur={() => addToHistory(elements)}
                            placeholder="Enter text..."
                          />
                        </Card>

                        {/* Style */}
                        <Card className="p-3">
                          <Label className="text-xs font-semibold uppercase text-gray-600 mb-3 block">Style</Label>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">Font Size</Label>
                              <Input
                                type="number"
                                value={selectedElement.style.fontSize}
                                onChange={(e) =>
                                  updateElement(selectedElement.id, {
                                    style: { ...selectedElement.style, fontSize: Number(e.target.value) },
                                  })
                                }
                                onBlur={() => addToHistory(elements)}
                                className="h-8 mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Font Weight</Label>
                              <Select
                                value={selectedElement.style.fontWeight}
                                onValueChange={(value: 'normal' | 'bold' | '600') => {
                                  updateElement(selectedElement.id, {
                                    style: { ...selectedElement.style, fontWeight: value },
                                  });
                                  addToHistory(elements);
                                }}
                              >
                                <SelectTrigger className="h-8 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="600">Semi Bold</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Text Align</Label>
                              <div className="flex space-x-1 mt-1">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <Button
                                    key={align}
                                    variant={selectedElement.style.textAlign === align ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                      updateElement(selectedElement.id, {
                                        style: { ...selectedElement.style, textAlign: align },
                                      });
                                      addToHistory(elements);
                                    }}
                                  >
                                    {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                    {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                    {align === 'right' && <AlignRight className="w-4 h-4" />}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Text Color</Label>
                              <div className="flex space-x-2 mt-1">
                                <Input
                                  type="color"
                                  value={selectedElement.style.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, color: e.target.value },
                                    })
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 w-12"
                                />
                                <Input
                                  type="text"
                                  value={selectedElement.style.color}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, color: e.target.value },
                                    })
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 flex-1 font-mono text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Background</Label>
                              <div className="flex space-x-2 mt-1">
                                <Input
                                  type="color"
                                  value={selectedElement.style.backgroundColor}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, backgroundColor: e.target.value },
                                    })
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 w-12"
                                />
                                <Input
                                  type="text"
                                  value={selectedElement.style.backgroundColor}
                                  onChange={(e) =>
                                    updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, backgroundColor: e.target.value },
                                    })
                                  }
                                  onBlur={() => addToHistory(elements)}
                                  className="h-8 flex-1 font-mono text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-xs">Opacity</Label>
                                <span className="text-xs text-gray-500">{Math.round(selectedElement.style.opacity * 100)}%</span>
                              </div>
                              <Slider
                                value={[selectedElement.style.opacity]}
                                onValueChange={([val]) =>
                                  updateElement(selectedElement.id, {
                                    style: { ...selectedElement.style, opacity: val },
                                  })
                                }
                                onValueCommit={() => addToHistory(elements)}
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
                            Duplicate (Ctrl+D)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              toggleLock(selectedElement.id);
                              addToHistory(elements);
                            }}
                          >
                            {selectedElement.locked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                            {selectedElement.locked ? 'Unlock' : 'Lock'}
                          </Button>
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
                        <p className="text-xs text-gray-500 mt-1">Click an element to edit properties</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* LAYERS */}
              <TabsContent value="layers" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {elements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No layers</p>
                        <p className="text-xs mt-1">Add elements to see them here</p>
                      </div>
                    ) : (
                      elements
                        .slice()
                        .sort((a, b) => b.zIndex - a.zIndex)
                        .map((element) => {
                          const Icon = COMPONENTS.find((c) => c.id === element.type)?.icon || Type;
                          return (
                            <div
                              key={element.id}
                              className={`p-3 rounded border cursor-pointer transition-all ${
                                element.id === selectedId ? 'border-blue-500 bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                              } ${!element.visible ? 'opacity-50' : ''}`}
                              onClick={() => setSelectedId(element.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Icon className="w-4 h-4 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{element.label}</p>
                                    <p className="text-xs text-gray-500 truncate">{element.content || 'Empty'}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLock(element.id);
                                    }}
                                  >
                                    {element.locked ? <Lock className="w-3 h-3 text-orange-500" /> : <Unlock className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVisibility(element.id);
                                    }}
                                  >
                                    {element.visible ? <EyeIcon className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-300" />}
                                  </Button>
                                </div>
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
        )}
      </div>

      {/* SAVE DIALOG */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Give your invoice template a name to save it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Template Name</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Restaurant Invoice"
              className="mt-2"
              onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={!templateName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOAD DIALOG */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Select a saved template to load.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] py-4">
            {savedTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No saved templates</p>
                <p className="text-xs mt-1">Create and save a template first</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.elements.length} elements
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this template?')) {
                            deleteTemplate(template.id);
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* HELP DIALOG */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard Shortcuts & Help
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Editing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Delete element</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Delete</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Deselect</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">History</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Undo</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Redo</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Y</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">View</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Preview</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+P</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Interaction</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Context menu</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Right-click</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move element</span>
                    <span className="text-xs text-gray-500">Drag</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="font-semibold text-sm mb-2">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Drag components from the left sidebar to the canvas</li>
                <li>• Right-click on elements for quick actions</li>
                <li>• Use Preview mode (Ctrl+P) to see the final result</li>
                <li>• Save templates to reuse your designs</li>
                <li>• Lock elements to prevent accidental changes</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedInvoiceBuilder;
