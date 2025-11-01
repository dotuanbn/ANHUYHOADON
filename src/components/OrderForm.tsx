import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Product, Customer, Order, OrderItem, OrderStatus, OrderNote, InvoiceSettings, DiscountType, Address } from '@/types';
import { getProducts, getCustomers, addOrder, updateOrder, getOrderById, generateOrderNumber, addCustomer } from '@/lib/storage';
import { getInvoiceSettings } from '@/lib/settings';
import { useToast } from "@/hooks/use-toast";
import { getAvailableTransitions, transitionOrderStatus, getStatusLabel, getStatusColor, autoSuggestNextAction, calculateOrderHealth } from '@/lib/orderLogic';

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
  const [orderNumber, setOrderNumber] = useState<string>(() => (orderId ? '' : generateOrderNumber()));
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
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const [shippingFee, setShippingFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [bankTransfer, setBankTransfer] = useState(0);
  const [paid, setPaid] = useState(0);
  
  // Notes
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'easy_print' | 'discussion'>('internal');

  const applySettingsDefaults = useCallback((settings: InvoiceSettings) => {
    setStatus(settings.orderDefaults.status);
    setAssignedTo(settings.orderDefaults.assignedTo);
    setMarketer(settings.orderDefaults.marketer);
    setTags([...settings.orderDefaults.tags]);

    setRecipientName(settings.shippingDefaults.recipientName);
    setRecipientPhone(settings.shippingDefaults.recipientPhone);
    setShippingAddress(settings.shippingDefaults.address);
    setProvince(settings.shippingDefaults.province);
    setDistrict(settings.shippingDefaults.district);
    setWard(settings.shippingDefaults.ward);
    setEstimatedDeliveryDate(settings.shippingDefaults.estimatedDeliveryDate);
    setTrackingNumber(settings.shippingDefaults.trackingNumber);
    setFreeShipping(settings.shippingDefaults.freeShipping);
    setDimensions({
      length: settings.shippingDefaults.dimensions.length,
      width: settings.shippingDefaults.dimensions.width,
      height: settings.shippingDefaults.dimensions.height,
    });

    setDiscount(settings.paymentDefaults.discountValue);
    setDiscountType(settings.paymentDefaults.discountType);
    setShippingFee(settings.paymentDefaults.shippingFee);
    setTax(settings.paymentDefaults.taxRate);
    setAdditionalFee(settings.paymentDefaults.additionalFee);
    setBankTransfer(settings.paymentDefaults.bankTransfer);
    setPaid(settings.paymentDefaults.paid);

    const defaultNotes: OrderNote[] = [];
    const timestamp = Date.now();
    const nowISO = new Date().toISOString();

    if (settings.notesDefaults.internal.trim()) {
      defaultNotes.push({
        id: `${timestamp}-internal`,
        type: 'internal',
        content: settings.notesDefaults.internal,
        createdBy: 'System default',
        createdAt: nowISO,
      });
    }

    if (settings.notesDefaults.easyPrint.trim()) {
      defaultNotes.push({
        id: `${timestamp + 1}-easy`,
        type: 'easy_print',
        content: settings.notesDefaults.easyPrint,
        createdBy: 'System default',
        createdAt: nowISO,
      });
    }

    if (settings.notesDefaults.discussion.trim()) {
      defaultNotes.push({
        id: `${timestamp + 2}-discussion`,
        type: 'discussion',
        content: settings.notesDefaults.discussion,
        createdBy: 'System default',
        createdAt: nowISO,
      });
    }

    setNotes(defaultNotes);
  }, []);

  const parseAddressComponents = useCallback((input: string) => {
    const result = {
      street: '',
      ward: '',
      district: '',
      province: '',
    };

    const trimmed = input.trim();
    if (!trimmed) {
      return result;
    }

    const tokens = trimmed.split(',').map(token => token.trim()).filter(Boolean);

    if (tokens.length >= 4) {
      result.street = tokens.slice(0, tokens.length - 3).join(', ');
      result.ward = tokens[tokens.length - 3];
      result.district = tokens[tokens.length - 2];
      result.province = tokens[tokens.length - 1];
    } else {
      result.street = tokens[0] || trimmed;
      if (tokens.length === 3) {
        result.district = tokens[1];
        result.province = tokens[2];
      } else if (tokens.length === 2) {
        result.district = tokens[1];
      }
    }

    const extract = (regex: RegExp) => {
      const match = trimmed.match(regex);
      if (!match) return '';

      return match[0]
        .replace(/^[\s,;-]+/, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const wardMatch = extract(/(phường|phường|phuong|p\.|xã|xa|x\.)[\s\p{L}0-9]+/giu);
    if (wardMatch) {
      result.ward = wardMatch;
    }

    const districtMatch = extract(/(quận|quan|q\.|huyện|huyen|h\.)[\s\p{L}0-9]+/giu);
    if (districtMatch) {
      result.district = districtMatch;
    }

    const provinceMatch = extract(/(tỉnh|tinh|thành phố|thanh pho|tp\.?|tp)[\s\p{L}0-9]+/giu);
    if (provinceMatch) {
      result.province = provinceMatch;
    }

    return result;
  }, []);

  const buildFullAddress = (
    streetValue: string,
    wardValue: string,
    districtValue: string,
    provinceValue: string
  ) => {
    return [streetValue, wardValue, districtValue, provinceValue]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(', ');
  };

  const handleAddressBlur = useCallback(() => {
    if (!shippingAddress.trim()) {
      return;
    }

    const parsed = parseAddressComponents(shippingAddress);

    if (parsed.street && parsed.street !== shippingAddress) {
      setShippingAddress(parsed.street);
    }

    if (parsed.ward) {
      setWard(parsed.ward);
    }

    if (parsed.district) {
      setDistrict(parsed.district);
    }

    if (parsed.province) {
      setProvince(parsed.province);
    }
  }, [shippingAddress, ward, district, province, parseAddressComponents]);

  useEffect(() => {
    setProducts(getProducts());
    setCustomers(getCustomers());

    const settings = getInvoiceSettings();

    if (orderId) {
      loadOrder(orderId);
    } else {
      applySettingsDefaults(settings);
    }
  }, [orderId, applySettingsDefaults]);

  const loadOrder = (id: string) => {
    const order = getOrderById(id);
    if (order) {
      setOrderNumber(order.orderNumber);
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
    setRecipientPhone(customer.phone || '');
    
    if (customer.addresses.length > 0) {
      const defaultAddress = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
      setShippingAddress(defaultAddress.fullAddress || defaultAddress.street);
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
  const taxAmount = (totalAmount - discountAmount - itemDiscounts) * tax / 100;
  const finalAmount = totalAmount - discountAmount - itemDiscounts + shippingFee + taxAmount + additionalFee - bankTransfer;
  const remaining = Math.max(0, finalAmount - paid);
  const cod = remaining;

  // Smart payment logic: Auto-update status when payment is complete
  useEffect(() => {
    if (orderId && remaining <= 0 && paid > 0 && finalAmount > 0) {
      // If order is fully paid and status is not delivered, suggest moving to delivered
      if (status !== 'delivered' && status !== 'cancelled' && status !== 'returned') {
        // Don't auto-change, but we could show a suggestion
      }
    }
  }, [orderId, remaining, paid, finalAmount, status]);

  // Auto-calculate final amount when payment inputs change
  useEffect(() => {
    if (paid > finalAmount && finalAmount > 0) {
      // Don't allow paying more than final amount
      setPaid(finalAmount);
    }
  }, [paid, finalAmount]);

  const handleSave = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất 1 sản phẩm",
        variant: "destructive",
      });
      return;
    }

    if (!orderNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã đơn hàng",
        variant: "destructive",
      });
      return;
    }

    let customerRecord = selectedCustomer;
    let createdCustomer: Customer | null = null;

    const parsedAddress = parseAddressComponents(shippingAddress);
    const streetComponent = parsedAddress.street || shippingAddress;
    const wardComponent = ward || parsedAddress.ward;
    const districtComponent = district || parsedAddress.district;
    const provinceComponent = province || parsedAddress.province;
    const fullAddress = buildFullAddress(streetComponent, wardComponent, districtComponent, provinceComponent);

    if (!customerRecord) {
      if (!recipientName.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên người nhận hoặc chọn khách hàng",
          variant: "destructive",
        });
        return;
      }

      const timestamp = Date.now().toString();
      const newAddress: Address = {
        id: `${timestamp}-addr`,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        province: provinceComponent,
        district: districtComponent,
        ward: wardComponent,
        street: streetComponent,
        fullAddress: fullAddress || streetComponent,
        isDefault: true,
      };

      const newCustomer: Customer = {
        id: timestamp,
        name: recipientName.trim(),
        phone: recipientPhone.trim(),
        email: '',
        addresses: [newAddress],
        totalOrders: 0,
        successfulOrders: 0,
        totalSpent: 0,
        notes: '',
        referralCode: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addCustomer(newCustomer);
      setCustomers((prev) => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer);
      customerRecord = newCustomer;
      createdCustomer = newCustomer;
    }

    const effectiveRecipientName = recipientName.trim() || customerRecord!.name;
    const effectiveRecipientPhone = recipientPhone.trim() || customerRecord!.phone || '';

    const order: Order = {
      id: orderId || Date.now().toString(),
      orderNumber: orderNumber.trim(),
      customerId: customerRecord!.id,
      customerName: effectiveRecipientName,
      customerPhone: effectiveRecipientPhone,
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
        recipientName: effectiveRecipientName,
        recipientPhone: effectiveRecipientPhone,
        address: fullAddress || shippingAddress,
        province: provinceComponent,
        district: districtComponent,
        ward: wardComponent,
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
      if (createdCustomer) {
        toast({
          title: "Đã lưu khách hàng mới",
          description: `${createdCustomer.name} đã được thêm vào danh sách khách hàng`,
        });
      }
      toast({
        title: "Thành công",
        description: `Đơn hàng ${orderNumber} đã được tạo`,
      });
    }

    if (onSave) onSave();
  };

  const filteredProducts = useMemo(() => {
    const term = productSearchTerm.trim().toLowerCase();
    if (!term) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.code.toLowerCase().includes(term)
    );
  }, [products, productSearchTerm]);

  const productSuggestions = useMemo(() => filteredProducts.slice(0, 8), [filteredProducts]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearchTerm.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term) ||
      (customer.phone ? customer.phone.includes(customerSearchTerm) : false)
    );
  }, [customers, customerSearchTerm]);

  const handleAddProductFromSuggestion = (product: Product) => {
    handleSelectProduct(product);
    setProductSearchTerm('');
  };

  const handleProductSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredProducts.length > 0) {
        handleAddProductFromSuggestion(filteredProducts[0]);
      }
    }
  };

  const currentOrderForTransitions: Order | null = useMemo(() => {
    if (!orderId) return null;
    const order = getOrderById(orderId);
    if (!order) return null;
    
    return {
      ...order,
      status,
      items: selectedItems,
      payment: {
        ...order.payment,
        paid,
        remaining,
      },
      shipping: {
        ...order.shipping,
        recipientName,
        recipientPhone,
        address: shippingAddress,
        province,
        district,
        ward,
      },
    };
  }, [orderId, status, selectedItems, paid, remaining, recipientName, recipientPhone, shippingAddress, province, district, ward]);

  const StatusTransitionButtons: React.FC<{
    orderId: string;
    currentStatus: OrderStatus;
    onStatusChange: (newStatus: OrderStatus) => void;
    compact?: boolean;
  }> = ({ orderId, currentStatus, onStatusChange, compact = false }) => {
    const { toast } = useToast();
    const order = orderId ? (currentOrderForTransitions || getOrderById(orderId)) : null;
    
    if (!order) return null;
    
    const transitions = getAvailableTransitions(order);
    const suggestion = autoSuggestNextAction(order);
    
    if (transitions.length === 0 && !suggestion) return null;
    
    return (
      <div className={`flex flex-wrap gap-2 ${compact ? 'flex-col' : ''}`}>
        {transitions.map((transition) => (
          <Button
            key={transition.to}
            size={compact ? 'sm' : 'default'}
            onClick={() => {
              const result = transitionOrderStatus(orderId, transition.to);
              if (result.success) {
                toast({
                  title: "Thành công",
                  description: result.message,
                });
                onStatusChange(transition.to);
              } else {
                toast({
                  title: "Lỗi",
                  description: result.message,
                  variant: "destructive",
                });
              }
            }}
            className={transition.color || 'bg-gray-600 hover:bg-gray-700'}
          >
            {transition.label}
          </Button>
        ))}
        {suggestion && transitions.length === 0 && (
          <p className="text-xs text-gray-500 italic">{suggestion}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl truncate">
                {orderId ? `Sửa đơn hàng` : `Tạo đơn hàng mới`}
              </CardTitle>
              {orderNumber && <p className="text-xs sm:text-sm text-gray-600 mt-1">#{orderNumber}</p>}
            </div>
            <div className="flex flex-col items-start sm:items-end space-y-2 w-full sm:w-auto">
              <Badge className={`text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 border ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </Badge>
              {orderId && (
                <StatusTransitionButtons
                  orderId={orderId}
                  currentStatus={status}
                  onStatusChange={(newStatus) => {
                    setStatus(newStatus);
                    if (orderId) loadOrder(orderId);
                  }}
                />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left column - Products */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Products Section */}
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="truncate">Sản phẩm ({selectedItems.length})</span>
                </CardTitle>
                <Button onClick={() => setIsProductDialogOpen(true)} size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Thêm sản phẩm</span>
                  <span className="sm:hidden">Thêm</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thêm sản phẩm nhanh</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    onKeyDown={handleProductSearchKeyDown}
                    placeholder="Nhập tên hoặc mã sản phẩm..."
                    className="pl-9 text-sm"
                  />
                </div>
                {productSearchTerm.trim() !== '' && (
                  <div className="mt-2 border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto divide-y">
                    {productSuggestions.length > 0 ? (
                      productSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleAddProductFromSuggestion(product)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.code}</p>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {product.price.toLocaleString('vi-VN')} đ
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs sm:text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp</div>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Mã SP</TableHead>
                        <TableHead className="text-xs sm:text-sm">Tên sản phẩm</TableHead>
                        <TableHead className="text-xs sm:text-sm">SL</TableHead>
                        <TableHead className="text-xs sm:text-sm">Đơn giá</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Giảm giá</TableHead>
                        <TableHead className="text-xs sm:text-sm">Tổng</TableHead>
                        <TableHead className="text-xs sm:text-sm"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                            Chưa có sản phẩm nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">{item.productCode}</TableCell>
                            <TableCell className="text-xs sm:text-sm break-words">{item.productName}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                className="w-16 sm:w-20 text-xs sm:text-sm"
                                min="1"
                              />
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleUpdateItem(item.id, 'price', Number(e.target.value))}
                                className="w-24 sm:w-28 text-xs sm:text-sm"
                                min="0"
                              />
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                              <Input
                                type="number"
                                value={item.discount}
                                onChange={(e) => handleUpdateItem(item.id, 'discount', Number(e.target.value))}
                                className="w-20 sm:w-24 text-xs sm:text-sm"
                                min="0"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {item.total.toLocaleString('vi-VN')} đ
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Giảm giá</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        min="0"
                        className="text-sm flex-1"
                      />
                      <Select value={discountType} onValueChange={(v: DiscountType) => setDiscountType(v)}>
                        <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
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
                    <Label className="text-xs sm:text-sm">Phí vận chuyển</Label>
                    <Input
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      min="0"
                      disabled={freeShipping}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Thuế (%)</Label>
                    <Input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Phụ thu</Label>
                    <Input
                      type="number"
                      value={additionalFee}
                      onChange={(e) => setAdditionalFee(Number(e.target.value))}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Chuyển khoản</Label>
                    <Input
                      type="number"
                      value={bankTransfer}
                      onChange={(e) => setBankTransfer(Number(e.target.value))}
                      min="0"
                      className="text-sm"
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
        <div className="space-y-3 sm:space-y-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {selectedCustomer ? (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{selectedCustomer.name}</p>
                      {selectedCustomer.phone && (
                        <p className="text-xs sm:text-sm text-gray-600">{selectedCustomer.phone}</p>
                      )}
                      {selectedCustomer.email && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                      className="flex-shrink-0 h-7 sm:h-8 w-7 sm:w-8 p-0"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Chọn khách hàng
                  </Button>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 text-center">
                    Có thể bỏ qua bước này và nhập trực tiếp thông tin người nhận ở phần bên dưới. Hệ thống sẽ tự lưu khách hàng mới sau khi bạn lưu đơn.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Người nhận</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Tên người nhận"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Số điện thoại</Label>
                <Input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Địa chỉ</Label>
                <Textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  onBlur={handleAddressBlur}
                  placeholder="Nhập địa chỉ chi tiết..."
                  className="text-sm"
                  rows={2}
                />
                <p className="text-[10px] sm:text-[11px] text-gray-500">
                  Ví dụ: "123 Đường ABC, Phường 5, Quận 3, TP HCM". Hệ thống sẽ tự điền Phường/Quận/Tỉnh nếu có thể nhận diện.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Phường/Xã</Label>
                <Input
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Phường/Xã"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Quận/Huyện</Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Quận/Huyện"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Tỉnh/TP</Label>
                  <Input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Tỉnh/TP"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Dự kiến nhận hàng</Label>
                <Input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Mã vận đơn</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Mã vận đơn"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Kích thước (cm)</Label>
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
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Mã đơn hàng</Label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="VD: DH251028000044"
                  className="text-sm"
                />
              </div>
              {orderId && (
                <div className="space-y-2 pb-3 border-b">
                  <Label className="text-xs sm:text-sm font-semibold">Chuyển trạng thái</Label>
                  <StatusTransitionButtons
                    orderId={orderId}
                    currentStatus={status}
                    onStatusChange={(newStatus) => {
                      setStatus(newStatus);
                      loadOrder(orderId);
                    }}
                    compact={true}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Trạng thái</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipping">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="returned">Trả hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">NV chăm sóc</Label>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Tên NV"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Marketer</Label>
                <Input
                  value={marketer}
                  onChange={(e) => setMarketer(e.target.value)}
                  placeholder="Tên marketer"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Thẻ tag</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Thêm thẻ"
                    className="text-sm flex-1"
                  />
                  <Button size="sm" onClick={handleAddTag} className="flex-shrink-0">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
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
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3">
              <Tabs defaultValue="internal">
                <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
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
              <Button size="sm" onClick={handleAddNote} className="w-full sm:w-auto text-xs sm:text-sm">
                Thêm ghi chú
              </Button>
              {notes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-2 sm:p-3 bg-gray-50 rounded text-xs sm:text-sm">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {note.type === 'internal' ? 'Nội bộ' : note.type === 'easy_print' ? 'Dễ in' : 'Trao đổi'}
                        </Badge>
                        <span className="text-gray-500 text-[10px] sm:text-xs whitespace-nowrap">
                          {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="break-words">{note.content}</p>
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
        <CardContent className="px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm space-y-1 w-full sm:w-auto">
              <p className="flex items-center gap-2 flex-wrap">
                <span>Trạng thái:</span>
                <Badge className="text-xs sm:text-sm">{getStatusLabel(status)}</Badge>
              </p>
              <p className="font-bold text-base sm:text-lg">Cần thanh toán: {finalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto text-xs sm:text-sm">
                  Hủy
                </Button>
              )}
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm">
                {orderId ? 'Cập nhật' : 'Lưu đơn hàng'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Chọn sản phẩm</DialogTitle>
            <DialogDescription>
              <div className="mt-4">
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="text-sm"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="block sm:hidden space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">Mã: {product.code}</p>
                    <p className="text-sm font-semibold text-blue-600">{product.price.toLocaleString('vi-VN')} đ</p>
                    <p className="text-xs text-gray-500">Tồn kho: {product.stock}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full sm:w-auto text-xs"
                  >
                    Chọn
                  </Button>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Mã</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tên sản phẩm</TableHead>
                    <TableHead className="text-xs sm:text-sm">Giá</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tồn kho</TableHead>
                    <TableHead className="text-xs sm:text-sm"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{product.code}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{product.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{product.price.toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell className="text-xs sm:text-sm">{product.stock}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectProduct(product)}
                          className="text-xs"
                        >
                          Chọn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Chọn khách hàng</DialogTitle>
            <DialogDescription>
              <div className="mt-4">
                <Input
                  placeholder="Tìm kiếm khách hàng theo tên hoặc số điện thoại..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="text-sm"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="block sm:hidden space-y-2">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.phone || '-'}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {customer.successfulOrders}/{customer.totalOrders}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full sm:w-auto text-xs"
                  >
                    Chọn
                  </Button>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Tên</TableHead>
                    <TableHead className="text-xs sm:text-sm">Số điện thoại</TableHead>
                    <TableHead className="text-xs sm:text-sm">Đơn hàng</TableHead>
                    <TableHead className="text-xs sm:text-sm"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{customer.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{customer.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {customer.successfulOrders}/{customer.totalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectCustomer(customer)}
                          className="text-xs"
                        >
                          Chọn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


