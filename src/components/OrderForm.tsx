import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Search, X, Calendar, Package, MapPin, FileText, DollarSign, Truck } from "lucide-react";
import { Product, Customer, Order, OrderItem, OrderStatus, OrderNote } from '@/types';
import { getProducts, getCustomers, addOrder, updateOrder, getOrderById, generateOrderNumber } from '@/lib/storage';
import { useToast } from "@/hooks/use-toast";

interface OrderFormProps {
  orderId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ orderId, onSave, onCancel }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Product selection
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  
  // Customer selection
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  
  // Order info
  const [orderNumber] = useState<string>(orderId ? '' : generateOrderNumber());
  const [status, setStatus] = useState<OrderStatus>('new');
  const [assignedTo, setAssignedTo] = useState('');
  const [marketer, setMarketer] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Shipping
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [freeShipping, setFreeShipping] = useState(true);
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  
  // Payment
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount');
  const [shippingFee, setShippingFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [bankTransfer, setBankTransfer] = useState(0);
  const [paid, setPaid] = useState(0);
  
  // Notes
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'easy_print' | 'discussion'>('internal');

  useEffect(() => {
    setProducts(getProducts());
    setCustomers(getCustomers());
    
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = (id: string) => {
    const order = getOrderById(id);
    if (order) {
      setSelectedItems(order.items);
      const customer = customers.find(c => c.id === order.customerId);
      setSelectedCustomer(customer || null);
      setStatus(order.status);
      setAssignedTo(order.assignedTo || '');
      setMarketer(order.marketer || '');
      setTags(order.tags);
      setRecipientName(order.shipping.recipientName);
      setRecipientPhone(order.shipping.recipientPhone);
      setShippingAddress(order.shipping.address);
      setProvince(order.shipping.province);
      setDistrict(order.shipping.district);
      setWard(order.shipping.ward);
      setEstimatedDeliveryDate(order.shipping.estimatedDeliveryDate || '');
      setTrackingNumber(order.shipping.trackingNumber || '');
      setFreeShipping(order.shipping.freeShipping);
      if (order.shipping.dimensions) {
        setDimensions(order.shipping.dimensions);
      }
      setDiscount(order.payment.discount);
      setShippingFee(order.payment.shippingFee);
      setTax(order.payment.tax);
      setAdditionalFee(order.payment.additionalFee);
      setBankTransfer(order.payment.bankTransfer);
      setPaid(order.payment.paid);
      setNotes(order.notes);
    }
  };

  const handleSelectProduct = (product: Product) => {
    const existingItem = selectedItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        productImage: product.image,
        quantity: 1,
        price: product.price,
        discount: 0,
        total: product.price,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    
    toast({
      title: "Đã thêm sản phẩm",
      description: `${product.name} đã được thêm vào đơn hàng`,
    });
  };

  const handleUpdateItem = (itemId: string, field: string, value: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        updated.total = updated.quantity * updated.price - updated.discount;
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setRecipientName(customer.name);
    setRecipientPhone(customer.phone);
    
    if (customer.addresses.length > 0) {
      const defaultAddress = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
      setShippingAddress(defaultAddress.street);
      setProvince(defaultAddress.province);
      setDistrict(defaultAddress.district);
      setWard(defaultAddress.ward);
    }
    
    setIsCustomerDialogOpen(false);
    toast({
      title: "Đã chọn khách hàng",
      description: `Khách hàng: ${customer.name}`,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddNote = () => {
    if (currentNote.trim()) {
      const newNote: OrderNote = {
        id: Date.now().toString(),
        type: noteType,
        content: currentNote,
        createdBy: 'User',
        createdAt: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
      setCurrentNote('');
    }
  };

  // Calculations
  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const itemDiscounts = selectedItems.reduce((sum, item) => sum + item.discount, 0);
  const discountAmount = discountType === 'percent' 
    ? (totalAmount * discount / 100) 
    : discount;
  const taxAmount = (totalAmount - discountAmount) * tax / 100;
  const finalAmount = totalAmount - discountAmount - itemDiscounts + shippingFee + taxAmount + additionalFee - bankTransfer;
  const remaining = finalAmount - paid;
  const cod = remaining;

  const handleSave = () => {
    if (!selectedCustomer) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khách hàng",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất 1 sản phẩm",
        variant: "destructive",
      });
      return;
    }

    const order: Order = {
      id: orderId || Date.now().toString(),
      orderNumber: orderId ? getOrderById(orderId)!.orderNumber : orderNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      items: selectedItems,
      payment: {
        totalAmount,
        discount: discountType === 'percent' ? discount : 0,
        discountAmount,
        shippingFee,
        tax,
        taxAmount,
        additionalFee,
        bankTransfer,
        finalAmount,
        paid,
        remaining,
        cod,
      },
      shipping: {
        estimatedDeliveryDate,
        recipientName,
        recipientPhone,
        address: shippingAddress,
        province,
        district,
        ward,
        trackingNumber,
        dimensions,
        freeShipping,
      },
      notes,
      status,
      assignedTo,
      marketer,
      tags,
      printCount: orderId ? getOrderById(orderId)!.printCount : 0,
      createdAt: orderId ? getOrderById(orderId)!.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (orderId) {
      updateOrder(orderId, order);
      toast({
        title: "Thành công",
        description: "Cập nhật đơn hàng thành công",
      });
    } else {
      addOrder(order);
      toast({
        title: "Thành công",
        description: `Đơn hàng ${orderNumber} đã được tạo`,
      });
    }

    if (onSave) onSave();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {orderId ? `Sửa đơn hàng` : `Tạo đơn hàng mới`}
              </CardTitle>
              {!orderId && <p className="text-sm text-gray-600 mt-1">#{orderNumber}</p>}
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {status === 'new' ? 'Mới' : status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Sản phẩm ({selectedItems.length})
                </CardTitle>
                <Button onClick={() => setIsProductDialogOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SP</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Giảm giá</TableHead>
                      <TableHead>Tổng</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Chưa có sản phẩm nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-20"
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(item.id, 'price', Number(e.target.value))}
                              className="w-28"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => handleUpdateItem(item.id, 'discount', Number(e.target.value))}
                              className="w-24"
                              min="0"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.total.toLocaleString('vi-VN')} đ
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giảm giá</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        min="0"
                      />
                      <Select value={discountType} onValueChange={(v: 'percent' | 'amount') => setDiscountType(v)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">đ</SelectItem>
                          <SelectItem value="percent">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phí vận chuyển</Label>
                    <Input
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      min="0"
                      disabled={freeShipping}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Thuế (%)</Label>
                    <Input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phụ thu</Label>
                    <Input
                      type="number"
                      value={additionalFee}
                      onChange={(e) => setAdditionalFee(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chuyển khoản</Label>
                    <Input
                      type="number"
                      value={bankTransfer}
                      onChange={(e) => setBankTransfer(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Tổng số tiền:</span>
                    <span className="font-medium">{totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">-{(discountAmount + itemDiscounts).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sau giảm giá:</span>
                    <span className="font-medium">{(totalAmount - discountAmount - itemDiscounts).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Cần thanh toán:</span>
                    <span className="text-blue-600">{finalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Đã thanh toán</Label>
                  <Input
                    type="number"
                    value={paid}
                    onChange={(e) => setPaid(Number(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold text-red-600">Còn thiếu:</span>
                  <span className="text-2xl font-bold text-red-600">{remaining.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">COD:</span>
                  <span className="text-xl font-bold">{cod.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Customer & Shipping */}
        <div className="space-y-4">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer ? (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t">
                    <div>
                      <p className="text-gray-600">Tổng</p>
                      <p className="font-bold">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thành công</p>
                      <p className="font-bold text-green-600">{selectedCustomer.successfulOrders}/{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Chi tiêu</p>
                      <p className="font-bold text-blue-600">
                        {(selectedCustomer.totalSpent / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Chọn khách hàng
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Người nhận</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Tên người nhận"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Số điện thoại</Label>
                <Input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Địa chỉ</Label>
                <Textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Địa chỉ chi tiết"
                  className="text-sm"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Phường/Xã</Label>
                <Input
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Phường/Xã"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Quận/Huyện</Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Quận/Huyện"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tỉnh/TP</Label>
                  <Input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Tỉnh/TP"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Dự kiến nhận hàng</Label>
                <Input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Mã vận đơn</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Mã vận đơn"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Kích thước (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                    placeholder="D"
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                    placeholder="R"
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                    placeholder="C"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">NV chăm sóc</Label>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Tên NV"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Marketer</Label>
                <Input
                  value={marketer}
                  onChange={(e) => setMarketer(e.target.value)}
                  placeholder="Tên marketer"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Thẻ tag</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Thêm thẻ"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="internal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="internal" onClick={() => setNoteType('internal')}>Nội bộ</TabsTrigger>
                  <TabsTrigger value="easy_print" onClick={() => setNoteType('easy_print')}>Dễ in</TabsTrigger>
                  <TabsTrigger value="discussion" onClick={() => setNoteType('discussion')}>Trao đổi</TabsTrigger>
                </TabsList>
              </Tabs>
              <Textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddNote} className="w-full">
                Thêm ghi chú
              </Button>
              {notes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {note.type === 'internal' ? 'Nội bộ' : note.type === 'easy_print' ? 'Dễ in' : 'Trao đổi'}
                        </Badge>
                        <span className="text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm space-y-1">
              <p>Trạng thái: <Badge>{status}</Badge></p>
              <p className="font-bold text-lg">Cần thanh toán: {finalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
              )}
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {orderId ? 'Cập nhật' : 'Lưu đơn hàng'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
            <DialogDescription>
              <div className="mt-4">
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString('vi-VN')} đ</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSelectProduct(product)}
                      >
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chọn khách hàng</DialogTitle>
            <DialogDescription>
              <div className="mt-4">
                <Input
                  placeholder="Tìm kiếm khách hàng theo tên hoặc số điện thoại..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.successfulOrders}/{customer.totalOrders}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


