import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, useDroppable, useDraggable } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Save, Eye, Trash2, Copy, Settings2,
  Type, Hash, FileText, User, Table, DollarSign, AlignVerticalJustifyEnd, Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Types
interface TemplateElement {
  id: string;
  type: string;
  label: string;
  content: string;
  order: number;
}

// Draggable Component Item
const DraggableComponent = ({ id, label, description, icon: Icon }: any) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg hover:border-blue-400 cursor-move transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Canvas Droppable Area
const CanvasDropzone = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`w-full h-full transition-all ${isOver ? 'bg-blue-50' : ''}`}
    >
      {children}
    </div>
  );
};

const COMPONENTS = [
  { id: 'company-name', label: 'Company Name', description: 'Add company name', icon: Type },
  { id: 'order-number', label: 'Order Number', description: 'Add order number', icon: Hash },
  { id: 'order-info', label: 'Order Info', description: 'Date, status, tracking', icon: FileText },
  { id: 'customer-info', label: 'Customer Info', description: 'Customer details', icon: User },
  { id: 'products-table', label: 'Products Table', description: 'Products list', icon: Table },
  { id: 'payment-summary', label: 'Payment Summary', description: 'Total, paid, remaining', icon: DollarSign },
  { id: 'footer', label: 'Footer', description: 'Footer text', icon: AlignVerticalJustifyEnd },
];

const VisualTemplateBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas') {
      const componentType = active.id as string;
      const component = COMPONENTS.find(c => c.id === componentType);
      
      if (component) {
        const newElement: TemplateElement = {
          id: `${componentType}-${Date.now()}`,
          type: componentType,
          label: component.label,
          content: `Enter ${component.label.toLowerCase()}`,
          order: elements.length,
        };
        
        setElements([...elements, newElement]);
        
        toast({
          title: "Element added",
          description: `${component.label} has been added to canvas`,
        });
      }
    }
    
    setActiveId(null);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
    toast({
      title: "Element deleted",
      description: "Element has been removed",
    });
  };

  const handleDuplicateElement = (element: TemplateElement) => {
    const newElement: TemplateElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      order: elements.length,
    };
    setElements([...elements, newElement]);
    toast({
      title: "Element duplicated",
      description: "Element has been duplicated",
    });
  };

  const handleUpdateContent = (id: string, content: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, content } : el));
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, content });
    }
  };

  const handleSave = () => {
    toast({
      title: "Template saved",
      description: `Saved ${elements.length} elements successfully`,
    });
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
              <h1 className="font-semibold text-lg">Visual Template Builder</h1>
              <p className="text-xs text-gray-500">Drag & Drop Invoice Designer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {elements.length} elements
            </Badge>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Palette */}
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-sm uppercase text-gray-600 mb-1">Components</h2>
              <p className="text-xs text-gray-500">Drag components to canvas</p>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {COMPONENTS.map((component) => (
                  <DraggableComponent key={component.id} {...component} />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
              <CanvasDropzone>
                <div className="bg-white shadow-xl rounded-lg p-8 min-h-[800px]">
                  {elements.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                        <Plus className="w-12 h-12 text-blue-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Start Building
                      </h3>
                      <p className="text-sm text-gray-500">
                        Drag components from the left panel to build your invoice template
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {elements
                        .sort((a, b) => a.order - b.order)
                        .map((element) => {
                          const Component = COMPONENTS.find(c => c.id === element.type);
                          const Icon = Component?.icon || Type;
                          const isSelected = selectedElement?.id === element.id;
                          
                          return (
                            <div
                              key={element.id}
                              onClick={() => setSelectedElement(element)}
                              className={`
                                relative p-4 rounded-lg border-2 transition-all cursor-pointer
                                ${isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`
                                    w-8 h-8 rounded flex items-center justify-center
                                    ${isSelected ? 'bg-blue-200' : 'bg-gray-100'}
                                  `}>
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{element.label}</p>
                                    <p className="text-xs text-gray-600 mt-1">{element.content}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicateElement(element);
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteElement(element.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CanvasDropzone>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-96 bg-white border-l flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-gray-600" />
                <h2 className="font-semibold text-sm uppercase text-gray-600">
                  {selectedElement ? 'Element Settings' : 'Settings'}
                </h2>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {selectedElement ? (
                  <>
                    <div>
                      <Label className="text-xs font-semibold uppercase text-gray-600">
                        Element Type
                      </Label>
                      <p className="mt-1 text-sm font-medium">{selectedElement.label}</p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">
                        Content
                      </Label>
                      <div>
                        <Label htmlFor="content" className="text-sm">Text Content</Label>
                        <Input
                          id="content"
                          value={selectedElement.content}
                          onChange={(e) => handleUpdateContent(selectedElement.id, e.target.value)}
                          placeholder="Enter content"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs font-semibold uppercase text-gray-600 mb-2 block">
                        Actions
                      </Label>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDuplicateElement(selectedElement)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate Element
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteElement(selectedElement.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Element
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Settings2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">No element selected</p>
                    <p className="text-xs text-gray-500">
                      Click on an element in the canvas to edit its properties
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="p-3 rounded-lg border-2 border-blue-400 bg-blue-50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center">
                {React.createElement(
                  COMPONENTS.find(c => c.id === activeId)?.icon || Type,
                  { className: 'w-4 h-4 text-blue-700' }
                )}
              </div>
              <p className="text-sm font-medium">
                {COMPONENTS.find(c => c.id === activeId)?.label}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VisualTemplateBuilder;
