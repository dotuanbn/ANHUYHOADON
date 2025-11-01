
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Download, Upload, Trash2, Loader2, CheckCircle, ImageIcon, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getCompanyInfo,
  saveCompanyInfo,
  resetCompanyInfo,
  getInvoiceSettings,
  saveInvoiceSettings,
  resetInvoiceSettings,
  getDefaultInvoiceSettings,
  getDefaultCompanyInfo,
  formatOrderNumber,
  syncOrderCounterWithSettings,
} from "@/lib/settings";
import { CompanyInfo, InvoiceSettings, DiscountType, OrderStatus } from "@/types";

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Mới' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'returned', label: 'Hoàn hàng' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'YYMMDD', label: 'YYMMDD (240901)' },
  { value: 'YYYYMMDD', label: 'YYYYMMDD (20240901)' },
  { value: 'YYMM', label: 'YYMM (2409)' },
  { value: 'YYYYMM', label: 'YYYYMM (202409)' },
  { value: 'YYYY', label: 'YYYY (2024)' },
];

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'amount', label: 'Số tiền cố định' },
  { value: 'percent', label: 'Phần trăm (%)' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialCompanyInfo = getCompanyInfo();
  const initialInvoiceSettings = getInvoiceSettings();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(initialInvoiceSettings);
  const [tagsInput, setTagsInput] = useState(initialInvoiceSettings.orderDefaults.tags.join(', '));

  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const numberingPreview = useMemo(
    () => formatOrderNumber(invoiceSettings, invoiceSettings.numbering.nextNumber),
    [invoiceSettings]
  );

  // Convert file to base64 data URL
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Không thể đọc file'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Loại file không hợp lệ",
        description: "Chỉ chấp nhận: JPG, PNG, GIF, WEBP, SVG",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File quá lớn",
        description: "Kích thước tối đa: 2MB",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    setIsUploadingLogo(true);

    try {
      const dataUrl = await convertFileToDataURL(file);
      setCompanyInfo({
        ...companyInfo,
        logo: dataUrl,
      });
      
      toast({
        title: "Upload logo thành công",
        description: "Logo đã được thêm vào hệ thống",
      });
    } catch (error) {
      toast({
        title: "Lỗi upload",
        description: error instanceof Error ? error.message : 'Không thể upload logo',
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setCompanyInfo({
      ...companyInfo,
      logo: undefined,
    });
    toast({
      title: "Đã xóa logo",
      description: "Logo đã được xóa khỏi hệ thống",
    });
  };

  const handleCompanyChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNumbering = (updates: Partial<InvoiceSettings['numbering']>) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        ...updates,
      },
    }));
  };

  const updatePaymentDefaults = (updates: Partial<InvoiceSettings['paymentDefaults']>) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      paymentDefaults: {
        ...prev.paymentDefaults,
        ...updates,
      },
    }));
  };

  const updateShippingDefaults = (updates: Partial<InvoiceSettings['shippingDefaults']>) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      shippingDefaults: {
        ...prev.shippingDefaults,
        ...updates,
        dimensions: {
          ...prev.shippingDefaults.dimensions,
          ...(updates.dimensions ?? {}),
        },
      },
    }));
  };

  const updateShippingDimension = (
    dimension: 'length' | 'width' | 'height',
    value: number
  ) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      shippingDefaults: {
        ...prev.shippingDefaults,
        dimensions: {
          ...prev.shippingDefaults.dimensions,
          [dimension]: value,
        },
      },
    }));
  };

  const updateOrderDefaults = (updates: Partial<InvoiceSettings['orderDefaults']>) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      orderDefaults: {
        ...prev.orderDefaults,
        ...updates,
      },
    }));
  };

  const updateNotesDefaults = (updates: Partial<InvoiceSettings['notesDefaults']>) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      notesDefaults: {
        ...prev.notesDefaults,
        ...updates,
      },
    }));
  };

  const handleSaveCompanyInfo = async () => {
    setIsSavingCompany(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      saveCompanyInfo(companyInfo);
      setCompanyInfo(getCompanyInfo());
      toast({
        title: "Đã lưu thông tin công ty",
        description: "Thông tin công ty đã được cập nhật thành công",
      });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveInvoiceSettings = async () => {
    setIsSavingSettings(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sanitizedTags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const pendingSettings: InvoiceSettings = {
        ...invoiceSettings,
        orderDefaults: {
          ...invoiceSettings.orderDefaults,
          tags: sanitizedTags,
        },
      };

      saveInvoiceSettings(pendingSettings);
      syncOrderCounterWithSettings(pendingSettings.numbering.nextNumber);

      const refreshedSettings = getInvoiceSettings();
      setInvoiceSettings(refreshedSettings);
      setTagsInput(refreshedSettings.orderDefaults.tags.join(', '));

      toast({
        title: "Đã lưu cài đặt hóa đơn",
        description: "Các giá trị mặc định sẽ áp dụng cho hóa đơn mới",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = {
        orders: JSON.parse(window.localStorage.getItem('orders') || '[]'),
        customers: JSON.parse(window.localStorage.getItem('customers') || '[]'),
        products: JSON.parse(window.localStorage.getItem('products') || '[]'),
        companyInfo,
        invoiceSettings,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bep-an-huy-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Xuất dữ liệu thành công",
        description: "Tệp sao lưu đã được tải xuống",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input để có thể import lại cùng file nếu cần
    const input = event.target;

    // Kiểm tra định dạng file
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Lỗi định dạng file",
        description: "Vui lòng chọn file JSON (.json)",
        variant: "destructive",
      });
      input.value = '';
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Không thể đọc nội dung file');
        }

        // Parse JSON
        let data: any;
        try {
          data = JSON.parse(result);
        } catch (parseError) {
          throw new Error('File JSON không hợp lệ. Vui lòng kiểm tra lại file.');
        }

        // Validate cấu trúc dữ liệu cơ bản
        if (!data || typeof data !== 'object') {
          throw new Error('Dữ liệu trong file không hợp lệ');
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Import dữ liệu
        let importedCount = 0;
        const importedItems: string[] = [];

        if (data.orders && Array.isArray(data.orders)) {
          window.localStorage.setItem('orders', JSON.stringify(data.orders));
          importedItems.push(`${data.orders.length} đơn hàng`);
          importedCount++;
        }

        if (data.customers && Array.isArray(data.customers)) {
          window.localStorage.setItem('customers', JSON.stringify(data.customers));
          importedItems.push(`${data.customers.length} khách hàng`);
          importedCount++;
        }

        if (data.products && Array.isArray(data.products)) {
          window.localStorage.setItem('products', JSON.stringify(data.products));
          importedItems.push(`${data.products.length} sản phẩm`);
          importedCount++;
        }

        if (data.companyInfo && typeof data.companyInfo === 'object') {
          // Normalize companyInfo với default values
          const defaultCompanyInfo = getDefaultCompanyInfo();
          const normalizedCompanyInfo: CompanyInfo = {
            ...defaultCompanyInfo,
            ...data.companyInfo,
          };
          saveCompanyInfo(normalizedCompanyInfo);
          setCompanyInfo(getCompanyInfo());
          importedItems.push('thông tin công ty');
          importedCount++;
        }

        if (data.invoiceSettings && typeof data.invoiceSettings === 'object') {
          // Normalize invoiceSettings với default values để đảm bảo có đầy đủ cấu trúc
          const defaultSettings = getDefaultInvoiceSettings();
          const normalizedSettings: InvoiceSettings = {
            numbering: {
              ...defaultSettings.numbering,
              ...(data.invoiceSettings.numbering || {}),
            },
            paymentDefaults: {
              ...defaultSettings.paymentDefaults,
              ...(data.invoiceSettings.paymentDefaults || {}),
            },
            shippingDefaults: {
              ...defaultSettings.shippingDefaults,
              ...(data.invoiceSettings.shippingDefaults || {}),
              dimensions: {
                ...defaultSettings.shippingDefaults.dimensions,
                ...(data.invoiceSettings.shippingDefaults?.dimensions || {}),
              },
            },
            orderDefaults: {
              ...defaultSettings.orderDefaults,
              ...(data.invoiceSettings.orderDefaults || {}),
              tags: Array.isArray(data.invoiceSettings.orderDefaults?.tags)
                ? data.invoiceSettings.orderDefaults.tags
                : defaultSettings.orderDefaults.tags,
            },
            notesDefaults: {
              ...defaultSettings.notesDefaults,
              ...(data.invoiceSettings.notesDefaults || {}),
            },
          };
          
          saveInvoiceSettings(normalizedSettings);
          const refreshedSettings = getInvoiceSettings();
          setInvoiceSettings(refreshedSettings);
          setTagsInput(refreshedSettings.orderDefaults.tags.join(', '));
          syncOrderCounterWithSettings(refreshedSettings.numbering.nextNumber);
          importedItems.push('cài đặt hóa đơn');
          importedCount++;
        }

        // Reset input
        input.value = '';

        if (importedCount === 0) {
          toast({
            title: "Không có dữ liệu hợp lệ",
            description: "File không chứa dữ liệu có thể import",
            variant: "destructive",
          });
          setIsImporting(false);
          return;
        }

        toast({
          title: "Nhập dữ liệu thành công",
          description: `Đã import: ${importedItems.join(', ')}. Vui lòng refresh trang để xem dữ liệu mới.`,
          duration: 5000,
        });

        setIsImporting(false);

        // Tự động refresh sau 1 giây để hiển thị dữ liệu mới
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        console.error('Import error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        
        // Reset input
        input.value = '';
        setIsImporting(false);

        toast({
          title: "Lỗi nhập dữ liệu",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    reader.onerror = () => {
      input.value = '';
      setIsImporting(false);
      toast({
        title: "Lỗi đọc file",
        description: "Không thể đọc file. Vui lòng thử lại.",
        variant: "destructive",
      });
    };

    reader.readAsText(file, 'UTF-8');
  };

  const clearAllData = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác!')) {
      return;
    }

    setIsClearing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      window.localStorage.removeItem('orders');
      window.localStorage.removeItem('customers');
      window.localStorage.removeItem('products');
      window.localStorage.removeItem('companyInfo');
      window.localStorage.removeItem('invoiceSettings');

      const resetInfo = resetCompanyInfo();
      const resetSettings = resetInvoiceSettings();
      syncOrderCounterWithSettings(resetSettings.numbering.nextNumber);

      setCompanyInfo(resetInfo);
      setInvoiceSettings(resetSettings);
      setTagsInput(resetSettings.orderDefaults.tags.join(', '));

      toast({
        title: "Đã xóa toàn bộ dữ liệu",
        description: "Hệ thống đã được đưa về trạng thái ban đầu",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-2 sm:mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Cài đặt hệ thống</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hidden sm:block">
                  Quản lý thông tin công ty và các giá trị mặc định của hóa đơn
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Thông tin công ty</CardTitle>
            <CardDescription className="text-sm">
              Cập nhật các thông tin hiển thị trên hóa đơn và mẫu in
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            {/* Logo Upload Section */}
            <div className="space-y-3 border-b pb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Logo công ty
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Logo Preview */}
                {companyInfo.logo ? (
                  <div className="relative group">
                    <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      <img
                        src={companyInfo.logo}
                        alt="Logo công ty"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa logo"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload-input"
                      disabled={isUploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload-input')?.click()}
                      disabled={isUploadingLogo}
                      className="w-full sm:w-auto"
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {companyInfo.logo ? 'Thay đổi logo' : 'Tải logo lên'}
                        </>
                      )}
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Logo sẽ hiển thị ở góc trái trên cùng của hóa đơn. 
                    <br />
                    Định dạng: JPG, PNG, GIF, WEBP, SVG (tối đa 2MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên công ty</label>
                <Input
                  placeholder="Tên công ty"
                  value={companyInfo.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                <Input
                  placeholder="Số điện thoại"
                  value={companyInfo.phone}
                  onChange={(e) => handleCompanyChange('phone', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <Input
                  placeholder="Email"
                  value={companyInfo.email}
                  onChange={(e) => handleCompanyChange('email', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <Input
                  placeholder="Website"
                  value={companyInfo.website}
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã số thuế</label>
                <Input
                  placeholder="Mã số thuế"
                  value={companyInfo.taxCode}
                  onChange={(e) => handleCompanyChange('taxCode', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <Textarea
                placeholder="Địa chỉ đầy đủ"
                value={companyInfo.address}
                onChange={(e) => handleCompanyChange('address', e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tài khoản</label>
                <Input
                  placeholder="Số tài khoản"
                  value={companyInfo.bankAccount}
                  onChange={(e) => handleCompanyChange('bankAccount', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngân hàng</label>
                <Input
                  placeholder="Ngân hàng"
                  value={companyInfo.bankName}
                  onChange={(e) => handleCompanyChange('bankName', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chủ tài khoản</label>
                <Input
                  placeholder="Chủ tài khoản"
                  value={companyInfo.accountHolder}
                  onChange={(e) => handleCompanyChange('accountHolder', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
                <Button onClick={handleSaveCompanyInfo} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSavingCompany}>
                  {isSavingCompany ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thông tin công ty
                    </>
                  )}
                </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Cài đặt mã hóa đơn</CardTitle>
            <CardDescription className="text-sm">
              Tùy chỉnh cấu trúc mã và trình tự đánh số hóa đơn
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiền tố</label>
                <Input
                  placeholder="VD: DH"
                  value={invoiceSettings.numbering.prefix}
                  onChange={(e) => updateNumbering({ prefix: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hậu tố</label>
                <Input
                  placeholder="VD: -A"
                  value={invoiceSettings.numbering.suffix}
                  onChange={(e) => updateNumbering({ suffix: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ dài số thứ tự</label>
                <Input
                  type="number"
                  min={2}
                  value={invoiceSettings.numbering.padding}
                  onChange={(e) => {
                    const value = Math.max(2, parseInt(e.target.value, 10) || 2);
                    updateNumbering({ padding: value });
                  }}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiếp theo</label>
                <Input
                  type="number"
                  min={1}
                  value={invoiceSettings.numbering.nextNumber}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value, 10) || 1);
                    updateNumbering({ nextNumber: value });
                  }}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Định dạng ngày</label>
                <Select
                  value={invoiceSettings.numbering.dateFormat}
                  onValueChange={(value) => updateNumbering({ dateFormat: value as InvoiceSettings['numbering']['dateFormat'] })}
                  disabled={!invoiceSettings.numbering.includeDate}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Chọn định dạng" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-slate-50">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Thêm ngày vào mã hóa đơn</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Bỏ chọn nếu chỉ muốn dùng số tăng dần</p>
              </div>
              <Switch
                checked={invoiceSettings.numbering.includeDate}
                onCheckedChange={(checked) => updateNumbering({ includeDate: checked })}
              />
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Xem trước:</strong> {numberingPreview}</p>
              <p className="text-xs text-gray-500 mt-1">
                Mã được cấu thành từ tiền tố + (ngày nếu bật) + số thứ tự đã được thêm số 0 bên trái
              </p>
            </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveInvoiceSettings} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm" disabled={isSavingSettings}>
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu cài đặt mã hóa đơn
                      </>
                    )}
                  </Button>
                </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Giá trị mặc định cho hóa đơn mới</CardTitle>
            <CardDescription className="text-sm">
              Thiết lập các giá trị được tự động điền khi tạo hóa đơn/đơn hàng mới
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Thanh toán & chiết khấu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại chiết khấu</label>
                  <Select
                    value={invoiceSettings.paymentDefaults.discountType}
                    onValueChange={(value) => updatePaymentDefaults({ discountType: value as DiscountType })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCOUNT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá trị chiết khấu</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.discountValue}
                    onChange={(e) => updatePaymentDefaults({ discountValue: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thuế mặc định (%)</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.taxRate}
                    onChange={(e) => updatePaymentDefaults({ taxRate: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phí vận chuyển</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.shippingFee}
                    onChange={(e) => updatePaymentDefaults({ shippingFee: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phụ thu</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.additionalFee}
                    onChange={(e) => updatePaymentDefaults({ additionalFee: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đã chuyển khoản</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.bankTransfer}
                    onChange={(e) => updatePaymentDefaults({ bankTransfer: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đã thanh toán</label>
                  <Input
                    type="number"
                    value={invoiceSettings.paymentDefaults.paid}
                    onChange={(e) => updatePaymentDefaults({ paid: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t pt-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Thông tin giao hàng & khách nhận</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên người nhận</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.recipientName}
                    onChange={(e) => updateShippingDefaults({ recipientName: e.target.value })}
                    className="text-sm"
                    placeholder="Để trống nếu nhập tay"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.recipientPhone}
                    onChange={(e) => updateShippingDefaults({ recipientPhone: e.target.value })}
                    className="text-sm"
                    placeholder="Để trống nếu nhập tay"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ giao hàng</label>
                <Textarea
                  rows={2}
                  value={invoiceSettings.shippingDefaults.address}
                  onChange={(e) => updateShippingDefaults({ address: e.target.value })}
                  className="text-sm"
                  placeholder="Số nhà, đường..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phường/Xã</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.ward}
                    onChange={(e) => updateShippingDefaults({ ward: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quận/Huyện</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.district}
                    onChange={(e) => updateShippingDefaults({ district: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tỉnh/Thành phố</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.province}
                    onChange={(e) => updateShippingDefaults({ province: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-lg px-4 py-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Miễn phí vận chuyển mặc định</p>
                    <Switch
                      checked={invoiceSettings.shippingDefaults.freeShipping}
                      onCheckedChange={(checked) => updateShippingDefaults({ freeShipping: checked })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Nếu bật, phí vận chuyển sẽ bị khóa ở mức 0 khi tạo đơn mới.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày giao dự kiến</label>
                  <Input
                    type="date"
                    value={invoiceSettings.shippingDefaults.estimatedDeliveryDate}
                    onChange={(e) => updateShippingDefaults({ estimatedDeliveryDate: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã vận đơn</label>
                  <Input
                    value={invoiceSettings.shippingDefaults.trackingNumber}
                    onChange={(e) => updateShippingDefaults({ trackingNumber: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dài (cm)</label>
                  <Input
                    type="number"
                    value={invoiceSettings.shippingDefaults.dimensions.length}
                    onChange={(e) => updateShippingDimension('length', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rộng (cm)</label>
                  <Input
                    type="number"
                    value={invoiceSettings.shippingDefaults.dimensions.width}
                    onChange={(e) => updateShippingDimension('width', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cao (cm)</label>
                  <Input
                    type="number"
                    value={invoiceSettings.shippingDefaults.dimensions.height}
                    onChange={(e) => updateShippingDimension('height', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t pt-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái mặc định</label>
                  <Select
                    value={invoiceSettings.orderDefaults.status}
                    onValueChange={(value) => updateOrderDefaults({ status: value as OrderStatus })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhân viên phụ trách</label>
                  <Input
                    value={invoiceSettings.orderDefaults.assignedTo}
                    onChange={(e) => updateOrderDefaults({ assignedTo: e.target.value })}
                    className="text-sm"
                    placeholder="Tên nhân viên"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marketer</label>
                  <Input
                    value={invoiceSettings.orderDefaults.marketer}
                    onChange={(e) => updateOrderDefaults({ marketer: e.target.value })}
                    className="text-sm"
                    placeholder="Tên marketer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags mặc định</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTagsInput(value);
                    updateOrderDefaults({
                      tags: value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    });
                  }}
                  className="text-sm"
                  placeholder="Ví dụ: Khách lẻ, Nội bộ"
                />
                <p className="text-xs text-gray-500 mt-1">Nhập các tag, cách nhau bởi dấu phẩy. Các tag này tự động gắn vào đơn mới.</p>
              </div>
            </section>

            <section className="space-y-4 border-t pt-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Ghi chú mặc định</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
                  <Textarea
                    rows={4}
                    value={invoiceSettings.notesDefaults.internal}
                    onChange={(e) => updateNotesDefaults({ internal: e.target.value })}
                    className="text-sm"
                    placeholder="Tự động thêm vào tab ghi chú nội bộ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Ghi chú dễ in</label>
                  <Textarea
                    rows={4}
                    value={invoiceSettings.notesDefaults.easyPrint}
                    onChange={(e) => updateNotesDefaults({ easyPrint: e.target.value })}
                    className="text-sm"
                    placeholder="Xuất hiện ở tab ghi chú dễ in"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Ghi chú trao đổi</label>
                  <Textarea
                    rows={4}
                    value={invoiceSettings.notesDefaults.discussion}
                    onChange={(e) => updateNotesDefaults({ discussion: e.target.value })}
                    className="text-sm"
                    placeholder="Dùng cho ghi chú trao đổi với khách"
                  />
                </div>
              </div>
            </section>

                <div className="flex justify-end">
                  <Button onClick={handleSaveInvoiceSettings} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm" disabled={isSavingSettings}>
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu tất cả cài đặt mặc định
                      </>
                    )}
                  </Button>
                </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Quản lý dữ liệu</CardTitle>
            <CardDescription className="text-sm">
              Sao lưu, khôi phục hoặc làm sạch dữ liệu hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xuất...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Xuất dữ liệu
                      </>
                    )}
                  </Button>
                  <label className="cursor-pointer w-full sm:w-auto">
                    <Button variant="outline" asChild className="w-full" disabled={isImporting}>
                      <span>
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang nhập...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Nhập dữ liệu
                          </>
                        )}
                      </span>
                    </Button>
                    <input type="file" accept=".json" onChange={importData} className="hidden" disabled={isImporting} />
                  </label>
                  <Button
                    onClick={clearAllData}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa toàn bộ dữ liệu
                      </>
                    )}
                  </Button>
                </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p><strong>• Xuất dữ liệu:</strong> Tạo tệp JSON chứa đơn hàng, khách hàng, sản phẩm và cài đặt</p>
              <p><strong>• Nhập dữ liệu:</strong> Phục hồi dữ liệu từ tệp backup trước đó</p>
              <p><strong>• Xóa dữ liệu:</strong> Dọn sạch toàn bộ dữ liệu và đưa hệ thống về trạng thái ban đầu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
