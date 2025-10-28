import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Save, Eye, Copy, Trash2, Plus, Upload, Download,
  Palette, Type, Layout, Settings, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InvoiceTemplate, CustomField } from '@/types/template';
import {
  getTemplates,
  getTemplateById,
  updateTemplate,
  addTemplate,
  deleteTemplate,
  duplicateTemplate,
  setActiveTemplate,
  getActiveTemplate
} from '@/lib/templateStorage';
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TemplateDesigner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loaded = getTemplates();
    setTemplates(loaded);
    const active = getActiveTemplate();
    setCurrentTemplate(active);
    setLogoPreview(active.company.logo || '');
  };

  const handleSave = () => {
    if (!currentTemplate) return;
    
    updateTemplate(currentTemplate.id, currentTemplate);
    setActiveTemplate(currentTemplate.id);
    toast({
      title: "Thành công",
      description: "Template đã được lưu",
    });
    loadTemplates();
  };

  const handleCreateNew = () => {
    const newTemplate: InvoiceTemplate = {
      ...currentTemplate!,
      id: `template_${Date.now()}`,
      name: `Template ${templates.length + 1}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTemplate(newTemplate);
    setCurrentTemplate(newTemplate);
    setActiveTemplate(newTemplate.id);
    toast({
      title: "Thành công",
      description: "Đã tạo template mới",
    });
    loadTemplates();
  };

  const handleDuplicate = () => {
    if (!currentTemplate) return;
    const duplicated = duplicateTemplate(currentTemplate.id, `${currentTemplate.name} (Copy)`);
    setCurrentTemplate(duplicated);
    toast({
      title: "Thành công",
      description: "Đã nhân bản template",
    });
    loadTemplates();
  };

  const handleDelete = () => {
    if (!currentTemplate || currentTemplate.id === 'default') {
      toast({
        title: "Lỗi",
        description: "Không thể xóa template mặc định",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('Bạn có chắc muốn xóa template này?')) {
      deleteTemplate(currentTemplate.id);
      const remaining = getTemplates();
      setCurrentTemplate(remaining[0]);
      toast({
        title: "Thành công",
        description: "Đã xóa template",
      });
      loadTemplates();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      if (currentTemplate) {
        setCurrentTemplate({
          ...currentTemplate,
          company: {
            ...currentTemplate.company,
            logo: base64,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomField = () => {
    if (!currentTemplate) return;
    
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      label: 'Trường tùy chỉnh',
      value: '',
      type: 'text',
      section: 'order',
      order: currentTemplate.customFields.length,
      visible: true,
      required: false,
    };
    
    setCurrentTemplate({
      ...currentTemplate,
      customFields: [...currentTemplate.customFields, newField],
    });
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomField>) => {
    if (!currentTemplate) return;
    
    setCurrentTemplate({
      ...currentTemplate,
      customFields: currentTemplate.customFields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const handleDeleteCustomField = (id: string) => {
    if (!currentTemplate) return;
    
    setCurrentTemplate({
      ...currentTemplate,
      customFields: currentTemplate.customFields.filter(f => f.id !== id),
    });
  };

  if (!currentTemplate) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Template Designer</h1>
                <p className="text-sm text-gray-600">Tùy chỉnh giao diện hóa đơn</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/invoice/preview')}>
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
              <Button variant="outline" onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo mới
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Template List */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates</CardTitle>
                <CardDescription>Chọn hoặc tạo template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                      currentTemplate.id === template.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setCurrentTemplate(template);
                      setLogoPreview(template.company.logo || '');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs mt-1">Mặc định</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Thao tác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" onClick={handleDuplicate} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Nhân bản
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete} 
                  className="w-full text-red-600"
                  disabled={currentTemplate.id === 'default'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="col-span-9">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="company" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="company">
                      <FileText className="w-4 h-4 mr-2" />
                      Công ty
                    </TabsTrigger>
                    <TabsTrigger value="colors">
                      <Palette className="w-4 h-4 mr-2" />
                      Màu sắc
                    </TabsTrigger>
                    <TabsTrigger value="fonts">
                      <Type className="w-4 h-4 mr-2" />
                      Font chữ
                    </TabsTrigger>
                    <TabsTrigger value="fields">
                      <Plus className="w-4 h-4 mr-2" />
                      Trường tùy chỉnh
                    </TabsTrigger>
                    <TabsTrigger value="layout">
                      <Layout className="w-4 h-4 mr-2" />
                      Bố cục
                    </TabsTrigger>
                  </TabsList>

                  {/* Company Tab */}
                  <TabsContent value="company" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Tên công ty</Label>
                        <Input
                          value={currentTemplate.company.name}
                          onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            company: { ...currentTemplate.company, name: e.target.value }
                          })}
                          placeholder="VD: Bếp An Huy"
                        />
                      </div>

                      <div>
                        <Label>Logo công ty</Label>
                        <div className="mt-2 space-y-2">
                          {logoPreview && (
                            <div className="border rounded p-4 bg-gray-50">
                              <img src={logoPreview} alt="Logo" className="max-h-32 mx-auto" />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                          <p className="text-xs text-gray-500">Chọn ảnh logo (PNG, JPG, tối đa 2MB)</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Số điện thoại</Label>
                          <Input
                            value={currentTemplate.company.phone}
                            onChange={(e) => setCurrentTemplate({
                              ...currentTemplate,
                              company: { ...currentTemplate.company, phone: e.target.value }
                            })}
                            placeholder="1900-xxxx"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={currentTemplate.company.email}
                            onChange={(e) => setCurrentTemplate({
                              ...currentTemplate,
                              company: { ...currentTemplate.company, email: e.target.value }
                            })}
                            placeholder="info@company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Địa chỉ</Label>
                        <Textarea
                          value={currentTemplate.company.address}
                          onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            company: { ...currentTemplate.company, address: e.target.value }
                          })}
                          placeholder="Địa chỉ công ty"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Website</Label>
                        <Input
                          value={currentTemplate.company.website}
                          onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            company: { ...currentTemplate.company, website: e.target.value }
                          })}
                          placeholder="www.company.com"
                        />
                      </div>

                      <div>
                        <Label>Mã số thuế</Label>
                        <Input
                          value={currentTemplate.company.taxCode}
                          onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            company: { ...currentTemplate.company, taxCode: e.target.value }
                          })}
                          placeholder="0123456789"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Colors Tab */}
                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(currentTemplate.colors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: value }} />
                                {value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                              <HexColorPicker
                                color={value}
                                onChange={(color) => setCurrentTemplate({
                                  ...currentTemplate,
                                  colors: { ...currentTemplate.colors, [key]: color }
                                })}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Fonts Tab */}
                  <TabsContent value="fonts" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Font chữ</Label>
                        <Select
                          value={currentTemplate.font.family}
                          onValueChange={(value) => setCurrentTemplate({
                            ...currentTemplate,
                            font: { ...currentTemplate.font, family: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                            <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                            <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                            <SelectItem value="Georgia, serif">Georgia</SelectItem>
                            <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(currentTemplate.font.size).map(([key, value]) => (
                          <div key={key}>
                            <Label className="capitalize">{key}</Label>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) => setCurrentTemplate({
                                ...currentTemplate,
                                font: {
                                  ...currentTemplate.font,
                                  size: { ...currentTemplate.font.size, [key]: Number(e.target.value) }
                                }
                              })}
                              min="8"
                              max="48"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Custom Fields Tab */}
                  <TabsContent value="fields" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Trường tùy chỉnh</h3>
                        <p className="text-sm text-gray-600">Thêm các trường thông tin bổ sung</p>
                      </div>
                      <Button onClick={handleAddCustomField} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm trường
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {currentTemplate.customFields.map((field) => (
                        <Card key={field.id}>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Tên trường</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                                  placeholder="VD: Người giao hàng"
                                />
                              </div>
                              <div>
                                <Label>Loại</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value: any) => handleUpdateCustomField(field.id, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Vị trí hiển thị</Label>
                                <Select
                                  value={field.section}
                                  onValueChange={(value: any) => handleUpdateCustomField(field.id, { section: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="header">Header</SelectItem>
                                    <SelectItem value="order">Thông tin đơn</SelectItem>
                                    <SelectItem value="customer">Thông tin KH</SelectItem>
                                    <SelectItem value="footer">Footer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end space-x-2">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={field.visible}
                                    onCheckedChange={(checked) => handleUpdateCustomField(field.id, { visible: checked })}
                                  />
                                  <Label className="text-sm">Hiển thị</Label>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCustomField(field.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {currentTemplate.customFields.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Chưa có trường tùy chỉnh nào</p>
                          <p className="text-sm">Click "Thêm trường" để tạo mới</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Layout Tab */}
                  <TabsContent value="layout" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Kích thước trang</Label>
                          <Select
                            value={currentTemplate.layout.pageSize}
                            onValueChange={(value: 'A4' | 'Letter') => setCurrentTemplate({
                              ...currentTemplate,
                              layout: { ...currentTemplate.layout, pageSize: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Hướng trang</Label>
                          <Select
                            value={currentTemplate.layout.orientation}
                            onValueChange={(value: 'portrait' | 'landscape') => setCurrentTemplate({
                              ...currentTemplate,
                              layout: { ...currentTemplate.layout, orientation: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Dọc</SelectItem>
                              <SelectItem value="landscape">Ngang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Lề trang (mm)</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                          {Object.entries(currentTemplate.layout.margin).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs capitalize">{key}</Label>
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => setCurrentTemplate({
                                  ...currentTemplate,
                                  layout: {
                                    ...currentTemplate.layout,
                                    margin: { ...currentTemplate.layout.margin, [key]: Number(e.target.value) }
                                  }
                                })}
                                min="0"
                                max="50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Hiển thị logo</Label>
                          <Switch
                            checked={currentTemplate.showLogo}
                            onCheckedChange={(checked) => setCurrentTemplate({
                              ...currentTemplate,
                              showLogo: checked
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Hiển thị viền</Label>
                          <Switch
                            checked={currentTemplate.showBorder}
                            onCheckedChange={(checked) => setCurrentTemplate({
                              ...currentTemplate,
                              showBorder: checked
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Hiển thị QR Code</Label>
                          <Switch
                            checked={currentTemplate.showQRCode}
                            onCheckedChange={(checked) => setCurrentTemplate({
                              ...currentTemplate,
                              showQRCode: checked
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Text Footer</Label>
                        <Textarea
                          value={currentTemplate.footerText}
                          onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            footerText: e.target.value
                          })}
                          rows={3}
                          placeholder="Lời cảm ơn hoặc thông tin liên hệ"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;

