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
import { getCompanyInfo } from '@/lib/settings';
import { useToast } from "@/hooks/use-toast";

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const companyInfo = getCompanyInfo();

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 p-2 sm:p-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/invoice/edit/${id}`)}
                className="w-full sm:w-auto text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              <Button 
                onClick={handlePrint} 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                In đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 invoice-container" ref={printRef}>
        <Card className="print-no-shadow">
          <CardHeader className="space-y-4 print-compact-header print-header px-3 sm:px-6">
            {/* Company Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Logo */}
                {companyInfo.logo ? (
                  <div className="flex-shrink-0">
                    <img
                      src={companyInfo.logo}
                      alt={companyInfo.name || "Logo công ty"}
                      className="max-h-16 sm:max-h-20 max-w-[150px] sm:max-w-[200px] object-contain"
                      style={{ 
                        maxHeight: '60px',
                        width: 'auto',
                        height: 'auto'
                      }}
                      onError={(e) => {
                        // Fallback nếu logo không load được
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600 truncate">
                      {companyInfo.name || "Bếp An Huy"}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Hệ thống quản lý đơn hàng</p>
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-xl sm:text-2xl font-bold invoice-number">#{order.orderNumber}</p>
                <Badge className={`${getStatusColor(order.status)} mt-2`}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Order Info & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Order Info - Bên trái */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-3 border-b pb-1">Thông tin đơn hàng</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {order.shipping.estimatedDeliveryDate && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-600">Dự kiến giao:</span>
                      <span className="font-medium">
                        {new Date(order.shipping.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.shipping.trackingNumber && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-600">Mã vận đơn:</span>
                      <span className="font-medium">{order.shipping.trackingNumber}</span>
                    </div>
                  )}
                  {order.assignedTo && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-600">NV chăm sóc:</span>
                      <span className="font-medium">{order.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info - Bên phải */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-3 border-b pb-1">Thông tin khách hàng</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600 block">Tên:</span>
                    <p className="font-semibold break-words">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Số điện thoại:</span>
                    <p className="font-semibold">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Địa chỉ giao hàng:</span>
                    <p className="font-medium leading-relaxed break-words">
                      {order.shipping.address}, {order.shipping.ward}, {order.shipping.district}, {order.shipping.province}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 print-compact px-3 sm:px-6">
            {/* Products Table */}
            <div className="print-products-section">
              <h3 className="font-semibold text-sm sm:text-base mb-2">Sản phẩm</h3>
              <div className="overflow-x-auto">
                <Table className="invoice-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs sm:text-sm">STT</TableHead>
                      <TableHead className="text-xs sm:text-sm">Mã SP</TableHead>
                      <TableHead className="text-xs sm:text-sm">Tên sản phẩm</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">SL</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Đơn giá</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Giảm giá</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center text-xs sm:text-sm">{index + 1}</TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{item.productCode}</TableCell>
                        <TableCell className="text-xs sm:text-sm break-words">{item.productName}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right currency text-xs sm:text-sm">
                          {item.price.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell className="text-right currency text-xs sm:text-sm hidden sm:table-cell">
                          {item.discount > 0 ? `-${item.discount.toLocaleString('vi-VN')} đ` : '-'}
                        </TableCell>
                        <TableCell className="text-right currency font-medium text-xs sm:text-sm">
                          {item.total.toLocaleString('vi-VN')} đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Payment & Footer Section */}
            <div className="print-payment-section">
              {/* Payment Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span className="currency">{order.payment.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {order.payment.discountAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span className="currency">-{order.payment.discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.shippingFee > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="currency">{order.payment.shippingFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.taxAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Thuế ({order.payment.tax}%):</span>
                    <span className="currency">{order.payment.taxAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.additionalFee > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Phụ thu:</span>
                    <span className="currency">{order.payment.additionalFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {order.payment.bankTransfer > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Chuyển khoản:</span>
                    <span className="currency">-{order.payment.bankTransfer.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="currency text-blue-600">{order.payment.finalAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="currency text-green-600">{order.payment.paid.toLocaleString('vi-VN')} đ</span>
                </div>

                {order.payment.remaining > 0 && (
                  <>
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span className="text-red-600">Còn thiếu:</span>
                      <span className="currency text-red-600">{order.payment.remaining.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
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
                    <h3 className="font-semibold text-sm sm:text-base mb-2">Ghi chú</h3>
                    <div className="space-y-1">
                      {order.notes
                        .filter(note => note.type === 'easy_print' || note.type === 'discussion')
                        .map((note) => (
                          <div key={note.id} className="p-2 sm:p-3 bg-gray-50 rounded text-xs sm:text-sm">
                            <p className="break-words">{note.content}</p>
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
