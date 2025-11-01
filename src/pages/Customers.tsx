import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, ArrowLeft, Eye, Loader2, Save, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Customer, Address } from '@/types';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getOrdersByCustomer } from '@/lib/storage';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    notes: '',
    referralCode: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const loadedCustomers = getCustomers();
    setCustomers(loadedCustomers);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      const defaultAddress = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        province: defaultAddress?.province || '',
        district: defaultAddress?.district || '',
        ward: defaultAddress?.ward || '',
        street: defaultAddress?.street || '',
        notes: customer.notes || '',
        referralCode: customer.referralCode || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        notes: '',
        referralCode: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tên khách hàng",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const addressParts = [
        formData.street.trim(),
        formData.ward.trim(),
        formData.district.trim(),
        formData.province.trim(),
      ].filter(part => part.length > 0);

      const fullAddress = addressParts.join(', ');

    const address: Address = {
      id: Date.now().toString(),
      recipientName: formData.name,
        recipientPhone: formData.phone || '',
      province: formData.province,
      district: formData.district,
      ward: formData.ward,
      street: formData.street,
        fullAddress: fullAddress,
      isDefault: true,
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        referralCode: formData.referralCode,
        addresses: [address],
      });
      toast({
        title: "Thành công",
        description: "Cập nhật khách hàng thành công",
      });
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        addresses: [address],
        totalOrders: 0,
        successfulOrders: 0,
        totalSpent: 0,
        notes: formData.notes,
        referralCode: formData.referralCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addCustomer(newCustomer);
      toast({
        title: "Thành công",
        description: "Thêm khách hàng thành công",
      });
    }

    loadCustomers();
    handleCloseDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    setIsDeleting(id);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      deleteCustomer(id);
      loadCustomers();
      toast({
        title: "Thành công",
        description: "Xóa khách hàng thành công",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(normalizedSearch) ||
    (customer.phone ? customer.phone.includes(searchTerm) : false) ||
    customer.email?.toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 p-2 sm:p-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-base sm:text-lg">Danh sách khách hàng</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Tổng cộng: {customers.length} khách hàng</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full text-sm"
                  />
                </div>
                <Button 
                  onClick={() => handleOpenDialog()} 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 px-3">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có khách hàng nào
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-3 space-y-2 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{customer.name}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-600 mt-1">{customer.phone}</p>
                        )}
                        {customer.email && (
                          <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {customer.successfulOrders}/{customer.totalOrders} đơn
                        </Badge>
                      </div>
                      <p className="font-medium text-blue-600">
                        {customer.totalSpent.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(customer)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-700 h-7 px-2"
                        disabled={isDeleting === customer.id || isDeleting !== null}
                      >
                        {isDeleting === customer.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Tên khách hàng</TableHead>
                    <TableHead className="text-xs sm:text-sm">Số điện thoại</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-xs sm:text-sm">Đơn hàng</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tổng chi tiêu</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Không có khách hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{customer.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{customer.phone || '-'}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{customer.email || '-'}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline" className="text-xs">
                            {customer.successfulOrders}/{customer.totalOrders}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {customer.totalSpent.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              className="h-7 sm:h-8 px-2 sm:px-3"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(customer)}
                              className="h-7 sm:h-8 px-2 sm:px-3"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700 h-7 sm:h-8 px-2 sm:px-3"
                              disabled={isDeleting === customer.id || isDeleting !== null}
                            >
                              {isDeleting === customer.id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingCustomer ? 'Cập nhật thông tin khách hàng' : 'Nhập thông tin khách hàng mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm">Tên khách hàng *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0358776696"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: email@example.com"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-xs sm:text-sm">Địa chỉ</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="VD: Số 123, Đường ABC"
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-xs sm:text-sm">Phường/Xã</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="VD: Xã Đa Tốn"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-xs sm:text-sm">Quận/Huyện</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="VD: Huyện Gia Lâm"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-xs sm:text-sm">Tỉnh/Thành phố</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="VD: Hà Nội"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-xs sm:text-sm">Mã giới thiệu</Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  placeholder="Mã giới thiệu (nếu có)"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs sm:text-sm">Ghi chú</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về khách hàng"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog} 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : editingCustomer ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Thêm
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin khách hàng</DialogTitle>
            <DialogDescription>Chi tiết về khách hàng và lịch sử mua hàng</DialogDescription>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Tên khách hàng</Label>
                  <p className="font-medium">{viewingCustomer.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Số điện thoại</Label>
                  <p className="font-medium">{viewingCustomer.phone || '-'}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium">{viewingCustomer.email || '-'}</p>
              </div>

              {viewingCustomer.addresses.length > 0 && (
                <div>
                  <Label className="text-gray-600">Địa chỉ</Label>
                  <p className="font-medium">{viewingCustomer.addresses[0].fullAddress}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-gray-600">Tổng đơn hàng</Label>
                  <p className="text-2xl font-bold text-blue-600">{viewingCustomer.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Thành công</Label>
                  <p className="text-2xl font-bold text-green-600">{viewingCustomer.successfulOrders}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Tổng chi tiêu</Label>
                  <p className="text-lg font-bold text-purple-600">
                    {viewingCustomer.totalSpent.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              {viewingCustomer.lastOrderDate && (
                <div>
                  <Label className="text-gray-600">Lần mua cuối</Label>
                  <p className="font-medium">
                    {new Date(viewingCustomer.lastOrderDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {viewingCustomer.notes && (
                <div>
                  <Label className="text-gray-600">Ghi chú</Label>
                  <p className="font-medium">{viewingCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
