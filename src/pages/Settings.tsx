
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Download, Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'BẾP AN HUY',
    address: 'Số 56 Vũ Xuân Thiều, Phúc Đồng, Long Biên, Hà Nội',
    website: 'bepanhuy.vn',
    phone: '024.123.456.789',
    email: '',
    taxCode: '',
    bankAccount: '123456789',
    bankName: 'Vietcombank',
    accountHolder: 'Bếp An Huy'
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: 'HD',
    startNumber: 1,
    taxRate: 10,
    discountRate: 0,
    defaultDueDays: 30,
    notes: 'Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!'
  });

  useEffect(() => {
    const savedCompanyInfo = localStorage.getItem('companyInfo');
    const savedInvoiceSettings = localStorage.getItem('invoiceSettings');
    
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo));
    }
    if (savedInvoiceSettings) {
      setInvoiceSettings(JSON.parse(savedInvoiceSettings));
    }
  }, []);

  const handleSaveCompanyInfo = () => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    toast({
      title: "Đã lưu thông tin công ty",
      description: "Thông tin công ty đã được cập nhật thành công",
    });
  };

  const handleSaveInvoiceSettings = () => {
    localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings));
    toast({
      title: "Đã lưu cài đặt hóa đơn",
      description: "Cài đặt hóa đơn đã được cập nhật thành công",
    });
  };

  const exportData = () => {
    const data = {
      invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      products: JSON.parse(localStorage.getItem('products') || '[]'),
      companyInfo,
      invoiceSettings
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
      description: "Dữ liệu đã được xuất và tải xuống",
    });
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const data = JSON.parse(result);
            
            if (data.invoices) localStorage.setItem('invoices', JSON.stringify(data.invoices));
            if (data.customers) localStorage.setItem('customers', JSON.stringify(data.customers));
            if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
            if (data.companyInfo) {
              localStorage.setItem('companyInfo', JSON.stringify(data.companyInfo));
              setCompanyInfo(data.companyInfo);
            }
            if (data.invoiceSettings) {
              localStorage.setItem('invoiceSettings', JSON.stringify(data.invoiceSettings));
              setInvoiceSettings(data.invoiceSettings);
            }

            toast({
              title: "Nhập dữ liệu thành công",
              description: "Dữ liệu đã được nhập và cập nhật",
            });
          }
        } catch (error) {
          toast({
            title: "Lỗi nhập dữ liệu",
            description: "File không đúng định dạng hoặc bị lỗi",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác!')) {
      localStorage.removeItem('invoices');
      localStorage.removeItem('customers');
      localStorage.removeItem('products');
      localStorage.removeItem('companyInfo');
      localStorage.removeItem('invoiceSettings');
      
      setCompanyInfo({
        name: 'BẾP AN HUY',
        address: 'Số 56 Vũ Xuân Thiều, Phúc Đồng, Long Biên, Hà Nội',
        website: 'bepanhuy.vn',
        phone: '024.123.456.789',
        email: '',
        taxCode: '',
        bankAccount: '123456789',
        bankName: 'Vietcombank',
        accountHolder: 'Bếp An Huy'
      });
      
      setInvoiceSettings({
        prefix: 'HD',
        startNumber: 1,
        taxRate: 10,
        discountRate: 0,
        defaultDueDays: 30,
        notes: 'Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!'
      });

      toast({
        title: "Đã xóa toàn bộ dữ liệu",
        description: "Tất cả dữ liệu đã được xóa và reset về mặc định",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-optimized Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-2 sm:mr-4 p-2">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Quản lý thông tin công ty và cài đặt hóa đơn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Company Information - Mobile Optimized */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Thông tin công ty</CardTitle>
            <CardDescription className="text-sm">Cập nhật thông tin công ty hiển thị trên hóa đơn</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                <Input
                  placeholder="Tên công ty"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <Input
                  placeholder="Số điện thoại"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  placeholder="Email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Website</label>
                <Input
                  placeholder="Website"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                <Input
                  placeholder="Mã số thuế"
                  value={companyInfo.taxCode}
                  onChange={(e) => setCompanyInfo({...companyInfo, taxCode: e.target.value})}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <Input
                placeholder="Địa chỉ"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                <Input
                  placeholder="Số tài khoản"
                  value={companyInfo.bankAccount}
                  onChange={(e) => setCompanyInfo({...companyInfo, bankAccount: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                <Input
                  placeholder="Ngân hàng"
                  value={companyInfo.bankName}
                  onChange={(e) => setCompanyInfo({...companyInfo, bankName: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Chủ tài khoản</label>
                <Input
                  placeholder="Chủ tài khoản"
                  value={companyInfo.accountHolder}
                  onChange={(e) => setCompanyInfo({...companyInfo, accountHolder: e.target.value})}
                  className="text-sm"
                />
              </div>
            </div>
            <Button onClick={handleSaveCompanyInfo} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Lưu thông tin công ty
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Settings - Mobile Optimized */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Cài đặt hóa đơn</CardTitle>
            <CardDescription className="text-sm">Tùy chỉnh cách thức tạo và hiển thị hóa đơn</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tiền tố số HĐ</label>
                <Input
                  placeholder="Tiền tố số HĐ"
                  value={invoiceSettings.prefix}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, prefix: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Số bắt đầu</label>
                <Input
                  placeholder="Số bắt đầu"
                  type="number"
                  value={invoiceSettings.startNumber}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, startNumber: parseInt(e.target.value) || 1})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Hạn thanh toán (ngày)</label>
                <Input
                  placeholder="Hạn thanh toán (ngày)"
                  type="number"
                  value={invoiceSettings.defaultDueDays}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultDueDays: parseInt(e.target.value) || 30})}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Thuế mặc định (%)</label>
                <Input
                  placeholder="Thuế mặc định (%)"
                  type="number"
                  value={invoiceSettings.taxRate}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, taxRate: parseFloat(e.target.value) || 0})}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Giảm giá mặc định (%)</label>
                <Input
                  placeholder="Giảm giá mặc định (%)"
                  type="number"
                  value={invoiceSettings.discountRate}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, discountRate: parseFloat(e.target.value) || 0})}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Ghi chú mặc định</label>
              <Input
                placeholder="Ghi chú mặc định"
                value={invoiceSettings.notes}
                onChange={(e) => setInvoiceSettings({...invoiceSettings, notes: e.target.value})}
                className="text-sm"
              />
            </div>
            <Button onClick={handleSaveInvoiceSettings} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt hóa đơn
            </Button>
          </CardContent>
        </Card>

        {/* Data Management - Mobile Optimized */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Quản lý dữ liệu</CardTitle>
            <CardDescription className="text-sm">Sao lưu, khôi phục và quản lý dữ liệu hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Xuất dữ liệu
              </Button>
              <label className="cursor-pointer w-full sm:w-auto">
                <Button variant="outline" asChild className="w-full">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Nhập dữ liệu
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <Button 
                onClick={clearAllData} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa toàn bộ dữ liệu
              </Button>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg">
              <p><strong>• Xuất dữ liệu:</strong> Tạo file backup chứa tất cả hóa đơn, khách hàng, sản phẩm và cài đặt</p>
              <p><strong>• Nhập dữ liệu:</strong> Khôi phục dữ liệu từ file backup đã xuất trước đó</p>
              <p><strong>• Xóa dữ liệu:</strong> Xóa toàn bộ dữ liệu và reset về trạng thái ban đầu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
