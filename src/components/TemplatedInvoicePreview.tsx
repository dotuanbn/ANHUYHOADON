import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Edit } from "lucide-react";
import { Order } from '@/types';
import { getOrderById, updateOrder } from '@/lib/storage';
import { getActiveTemplate } from '@/lib/templateStorage';
import { InvoiceTemplate } from '@/types/template';
import { useToast } from "@/hooks/use-toast";

const TemplatedInvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);

  useEffect(() => {
    const activeTemplate = getActiveTemplate();
    setTemplate(activeTemplate);
    
    if (id) {
      const loadedOrder = getOrderById(id);
      if (loadedOrder) {
        setOrder(loadedOrder);
      } else {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy đơn hàng",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [id]);

  const handlePrint = () => {
    if (order && template) {
      updateOrder(order.id, { printCount: order.printCount + 1 });
      setOrder({ ...order, printCount: order.printCount + 1 });
      window.print();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipping: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      new: 'Mới',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
      returned: 'Trả hàng',
    };
    return texts[status] || status;
  };

  if (!order || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const customFieldsBySection = {
    header: template.customFields.filter(f => f.section === 'header' && f.visible),
    order: template.customFields.filter(f => f.section === 'order' && f.visible),
    customer: template.customFields.filter(f => f.section === 'customer' && f.visible),
    footer: template.customFields.filter(f => f.section === 'footer' && f.visible),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Action Bar - Hidden on Print */}
      <div className="bg-white shadow-sm border-b print-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate(`/invoice/edit/${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 mr-2" />
                In đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content with Template */}
      <style>
        {`
          @media print {
            .templated-invoice {
              font-family: ${template.font.family};
              color: ${template.colors.text};
            }
            .templated-invoice .primary-color { color: ${template.colors.primary}; }
            .templated-invoice .accent-color { color: ${template.colors.accent}; }
            .templated-invoice .text-light { color: ${template.colors.textLight}; }
            .templated-invoice h1 { font-size: ${template.font.size.h1}px; }
            .templated-invoice h2 { font-size: ${template.font.size.h2}px; }
            .templated-invoice h3 { font-size: ${template.font.size.h3}px; }
            .templated-invoice .body-text { font-size: ${template.font.size.body}px; }
            .templated-invoice .small-text { font-size: ${template.font.size.small}px; }
            .templated-invoice .template-border {
              border: ${template.showBorder ? `1px solid ${template.colors.border}` : 'none'};
            }
          }
        `}
      </style>

      <div 
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 invoice-container templated-invoice" 
        ref={printRef}
        style={{ fontFamily: template.font.family }}
      >
        <Card className="print-no-shadow template-border">
          <CardHeader className="space-y-4 print-compact-header print-header">
            {/* Company Header with Logo */}
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                {template.showLogo && template.company.logo && (
                  <img 
                    src={template.company.logo} 
                    alt="Company Logo" 
                    className="max-h-24 max-w-[220px] object-contain"
                  />
                )}
                <div>
                  <h1 
                    className="font-bold primary-color"
                    style={{ 
                      fontSize: `${template.font.size.h1}px`,
                      color: template.colors.primary
                    }}
                  >
                    {template.company.name}
                  </h1>
                  {template.company.address && (
                    <p className="text-sm text-light mt-1" style={{ color: template.colors.textLight }}>
                      {template.company.address}
                    </p>
                  )}
                  <div className="text-sm text-light mt-1" style={{ color: template.colors.textLight }}>
                    {template.company.phone && <span>☎ {template.company.phone}</span>}
                    {template.company.email && <span className="ml-3">✉ {template.company.email}</span>}
                  </div>
                  {template.company.website && (
                    <p className="text-sm text-light" style={{ color: template.colors.textLight }}>
                      🌐 {template.company.website}
                    </p>
                  )}
                  {template.company.taxCode && (
                    <p className="text-sm text-light" style={{ color: template.colors.textLight }}>
                      MST: {template.company.taxCode}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p 
                  className="text-2xl font-bold invoice-number"
                  style={{ fontSize: `${template.font.size.h2}px` }}
                >
                  #{order.orderNumber}
                </p>
                <Badge className={`${getStatusColor(order.status)} mt-2`}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>

            {/* Custom Fields - Header */}
            {customFieldsBySection.header.length > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {customFieldsBySection.header.map((field) => (
                  <div key={field.id}>
                    <span className="text-light" style={{ color: template.colors.textLight }}>
                      {field.label}:
                    </span>
                    <span className="ml-2 font-medium">{field.value || '-'}</span>
                  </div>
                ))}
              </div>
            )}

            <Separator style={{ backgroundColor: template.colors.border }} />

            {/* Order Info & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <div>
                <h3 
                  className="font-semibold mb-3 border-b pb-1"
                  style={{ 
                    fontSize: `${template.font.size.h3}px`,
                    borderColor: template.colors.border
                  }}
                >
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-2" style={{ fontSize: `${template.font.size.body}px` }}>
                  <div className="flex justify-between">
                    <span style={{ color: template.colors.textLight }}>Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {order.shipping.estimatedDeliveryDate && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Dự kiến giao:</span>
                      <span className="font-medium">
                        {new Date(order.shipping.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.shipping.trackingNumber && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Mã vận đơn:</span>
                      <span className="font-medium">{order.shipping.trackingNumber}</span>
                    </div>
                  )}
                  {order.assignedTo && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>NV chăm sóc:</span>
                      <span className="font-medium">{order.assignedTo}</span>
                    </div>
                  )}
                  
                  {/* Custom Fields - Order */}
                  {customFieldsBySection.order.map((field) => (
                    <div key={field.id} className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>{field.label}:</span>
                      <span className="font-medium">{field.value || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 
                  className="font-semibold mb-3 border-b pb-1"
                  style={{ 
                    fontSize: `${template.font.size.h3}px`,
                    borderColor: template.colors.border
                  }}
                >
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-4" style={{ fontSize: `${template.font.size.body}px` }}>
                  <div className="space-y-2">
                    <div>
                      <span className="block" style={{ color: template.colors.textLight }}>Tên:</span>
                      <p className="font-semibold">{order.customerName}</p>
                    </div>
                    <div>
                      <span className="block" style={{ color: template.colors.textLight }}>Số điện thoại:</span>
                      <p className="font-semibold">{order.customerPhone}</p>
                    </div>
                    
                    {/* Custom Fields - Customer (left) */}
                    {customFieldsBySection.customer.slice(0, Math.ceil(customFieldsBySection.customer.length / 2)).map((field) => (
                      <div key={field.id}>
                        <span className="block" style={{ color: template.colors.textLight }}>{field.label}:</span>
                        <p className="font-medium">{field.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="block" style={{ color: template.colors.textLight }}>Địa chỉ giao hàng:</span>
                      <p className="font-medium leading-relaxed">
                        {order.shipping.address}, {order.shipping.ward}, {order.shipping.district}, {order.shipping.province}
                      </p>
                    </div>
                    
                    {/* Custom Fields - Customer (right) */}
                    {customFieldsBySection.customer.slice(Math.ceil(customFieldsBySection.customer.length / 2)).map((field) => (
                      <div key={field.id}>
                        <span className="block" style={{ color: template.colors.textLight }}>{field.label}:</span>
                        <p className="font-medium">{field.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 print-compact">
            {/* Products Table */}
            <div className="print-products-section">
              <h3 
                className="font-semibold mb-2"
                style={{ fontSize: `${template.font.size.h3}px` }}
              >
                Sản phẩm
              </h3>
              <Table 
                className="invoice-table"
                style={{ 
                  fontSize: `${template.font.size.body}px`,
                  borderColor: template.colors.border
                }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Mã SP</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Giảm giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right currency">
                        {item.price.toLocaleString('vi-VN')} đ
                      </TableCell>
                      <TableCell className="text-right currency">
                        {item.discount > 0 ? `-${item.discount.toLocaleString('vi-VN')} đ` : '-'}
                      </TableCell>
                      <TableCell className="text-right currency font-medium">
                        {item.total.toLocaleString('vi-VN')} đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator style={{ backgroundColor: template.colors.border }} />

            {/* Payment & Footer Section */}
            <div className="print-payment-section">
              {/* Payment Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2" style={{ fontSize: `${template.font.size.body}px` }}>
                  <div className="flex justify-between">
                    <span style={{ color: template.colors.textLight }}>Tổng tiền hàng:</span>
                    <span className="currency">{order.payment.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  {order.payment.discountAmount > 0 && (
                    <div className="flex justify-between" style={{ color: template.colors.accent }}>
                      <span>Giảm giá:</span>
                      <span className="currency">-{order.payment.discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  {order.payment.shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Phí vận chuyển:</span>
                      <span className="currency">{order.payment.shippingFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  {order.payment.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Thuế ({order.payment.tax}%):</span>
                      <span className="currency">{order.payment.taxAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  {order.payment.additionalFee > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Phụ thu:</span>
                      <span className="currency">{order.payment.additionalFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  {order.payment.bankTransfer > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: template.colors.textLight }}>Chuyển khoản:</span>
                      <span className="currency">-{order.payment.bankTransfer.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}

                  <Separator style={{ backgroundColor: template.colors.border }} />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="currency" style={{ color: template.colors.primary }}>
                      {order.payment.finalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: template.colors.textLight }}>Đã thanh toán:</span>
                    <span className="currency" style={{ color: template.colors.accent }}>
                      {order.payment.paid.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {order.payment.remaining > 0 && (
                    <>
                      <div className="flex justify-between text-lg font-bold">
                        <span style={{ color: '#dc2626' }}>Còn thiếu:</span>
                        <span className="currency" style={{ color: '#dc2626' }}>
                          {order.payment.remaining.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: template.colors.textLight }}>COD:</span>
                        <span className="currency font-medium">
                          {order.payment.cod.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {order.notes.length > 0 && (
                <>
                  <Separator className="my-3" style={{ backgroundColor: template.colors.border }} />
                  <div>
                    <h3 className="font-semibold mb-2" style={{ fontSize: `${template.font.size.h3}px` }}>
                      Ghi chú
                    </h3>
                    <div className="space-y-1">
                      {order.notes
                        .filter(note => note.type === 'easy_print' || note.type === 'discussion')
                        .map((note) => (
                          <div 
                            key={note.id} 
                            className="p-3 rounded"
                            style={{ 
                              backgroundColor: `${template.colors.border}33`,
                              fontSize: `${template.font.size.body}px`
                            }}
                          >
                            <p>{note.content}</p>
                            <p 
                              className="text-xs mt-1"
                              style={{ 
                                color: template.colors.textLight,
                                fontSize: `${template.font.size.small}px`
                              }}
                            >
                              {new Date(note.createdAt).toLocaleString('vi-VN')} - {note.createdBy}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* Custom Fields - Footer */}
              {customFieldsBySection.footer.length > 0 && (
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  {customFieldsBySection.footer.map((field) => (
                    <div key={field.id}>
                      <span style={{ color: template.colors.textLight }}>{field.label}:</span>
                      <span className="ml-2 font-medium">{field.value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <Separator className="my-3" style={{ backgroundColor: template.colors.border }} />
              <div 
                className="text-center"
                style={{ 
                  fontSize: `${template.font.size.small}px`,
                  color: template.colors.textLight
                }}
              >
                {template.footerText?.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplatedInvoicePreview;

