import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, ArrowLeft, Eye } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tên khách hàng",
        variant: "destructive",
      });
      return;
    }

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
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      deleteCustomer(id);
      loadCustomers();
      toast({
        title: "Thành công",
        description: "Xóa khách hàng thành công",
      });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Danh sách khách hàng</CardTitle>
                <CardDescription>Tổng cộng: {customers.length} khách hàng</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khách hàng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
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
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.successfulOrders}/{customer.totalOrders}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer.totalSpent.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Cập nhật thông tin khách hàng' : 'Nhập thông tin khách hàng mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên khách hàng *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0358776696"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Địa chỉ</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="VD: Số 123, Đường ABC"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="VD: Xã Đa Tốn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="VD: Huyện Gia Lâm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="VD: Hà Nội"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Mã giới thiệu</Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  placeholder="Mã giới thiệu (nếu có)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về khách hàng"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingCustomer ? 'Cập nhật' : 'Thêm'}
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
