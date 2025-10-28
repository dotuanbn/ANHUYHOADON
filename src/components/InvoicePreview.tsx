import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, Edit } from "lucide-react";
import { Order } from '@/types';
import { getOrderById, updateOrder } from '@/lib/storage';
import { useToast } from "@/hooks/use-toast";

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
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
    if (order) {
      // Increment print count
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

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

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 invoice-container" ref={printRef}>
        <Card className="print-no-shadow">
          <CardHeader className="space-y-4 print-compact-header print-header">
            {/* Company Header */}
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-blue-600">Bếp An Huy</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Hệ thống quản lý đơn hàng</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold invoice-number">#{order.orderNumber}</p>
                <Badge className={`${getStatusColor(order.status)} mt-2`}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Order Info & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info - Bên trái */}
              <div>
                <h3 className="font-semibold text-base mb-3 border-b pb-1">Thông tin đơn hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {order.shipping.estimatedDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dự kiến giao:</span>
                      <span className="font-medium">
                        {new Date(order.shipping.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.shipping.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã vận đơn:</span>
                      <span className="font-medium">{order.shipping.trackingNumber}</span>
                    </div>
                  )}
                  {order.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">NV chăm sóc:</span>
                      <span className="font-medium">{order.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info - Bên phải */}
              <div>
                <h3 className="font-semibold text-base mb-3 border-b pb-1">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tên + SĐT - Cột trái */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 block">Tên:</span>
                      <p className="font-semibold">{order.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Số điện thoại:</span>
                      <p className="font-semibold">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  {/* Địa chỉ - Cột phải */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 block">Địa chỉ giao hàng:</span>
                      <p className="font-medium leading-relaxed">
                        {order.shipping.address}, {order.shipping.ward}, {order.shipping.district}, {order.shipping.province}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 print-compact">
            {/* Products Table */}
            <div className="print-products-section">
              <h3 className="font-semibold text-base mb-2">Sản phẩm</h3>
              <Table className="invoice-table">
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

            <Separator className="my-3" />

            {/* Payment & Footer Section - Luôn đi cùng nhau */}
            <div className="print-payment-section">
              {/* Payment Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span className="currency">{order.payment.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {order.payment.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span className="currency">-{order.payment.discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.shippingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="currency">{order.payment.shippingFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế ({order.payment.tax}%):</span>
                    <span className="currency">{order.payment.taxAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.additionalFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phụ thu:</span>
                    <span className="currency">{order.payment.additionalFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.bankTransfer > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chuyển khoản:</span>
                    <span className="currency">-{order.payment.bankTransfer.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="currency text-blue-600">{order.payment.finalAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="currency text-green-600">{order.payment.paid.toLocaleString('vi-VN')} đ</span>
                </div>

                {order.payment.remaining > 0 && (
                  <>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-red-600">Còn thiếu:</span>
                      <span className="currency text-red-600">{order.payment.remaining.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD:</span>
                      <span className="currency font-medium">{order.payment.cod.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </>
                )}
                </div>
              </div>

              {/* Notes */}
              {order.notes.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <h3 className="font-semibold text-base mb-2">Ghi chú</h3>
                    <div className="space-y-1">
                      {order.notes
                        .filter(note => note.type === 'easy_print' || note.type === 'discussion')
                        .map((note) => (
                          <div key={note.id} className="p-3 bg-gray-50 rounded text-sm">
                            <p>{note.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.createdAt).toLocaleString('vi-VN')} - {note.createdBy}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <Separator className="my-3" />
              <div className="text-center text-xs text-gray-600">
                <p>Cảm ơn quý khách đã tin tưởng sử dụng sản phẩm của Bếp An Huy!</p>
                <p className="mt-1">Để được hỗ trợ, vui lòng liên hệ: 1900-xxxx</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoicePreview;
