
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
}

interface InvoicesListProps {
  invoices: Invoice[];
}

const InvoicesList = ({ invoices }: InvoicesListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return 'Nháp';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Danh sách hóa đơn</CardTitle>
            <CardDescription className="text-sm">Quản lý tất cả hóa đơn của bạn</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="w-full sm:w-auto">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Chưa có hóa đơn nào</h3>
            <p className="text-sm text-gray-500 mb-4">Bắt đầu bằng cách tạo hóa đơn đầu tiên của bạn</p>
            <Button onClick={() => navigate('/invoice/new')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hóa đơn mới
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: Card Layout */}
            <div className="block sm:hidden space-y-4">
              {filteredInvoices.map((invoice, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{invoice.invoiceNumber}</h4>
                        <p className="text-xs text-gray-600">{invoice.customerName}</p>
                      </div>
                      <Badge className={`${getStatusColor(invoice.status)} text-xs`}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Ngày tạo:</span>
                        <p className="font-medium">{invoice.date}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tổng tiền:</span>
                        <p className="font-medium text-blue-600">{invoice.total?.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/invoice/${index}`)}
                        className="flex-1 text-xs"
                      >
                        Xem
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/invoice/edit/${index}`)}
                        className="flex-1 text-xs"
                      >
                        Sửa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Số hóa đơn</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Khách hàng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày tạo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tổng tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">{invoice.customerName}</td>
                      <td className="py-3 px-4">{invoice.date}</td>
                      <td className="py-3 px-4 font-medium">{invoice.total?.toLocaleString('vi-VN')} đ</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/invoice/${index}`)}
                          >
                            Xem
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/invoice/edit/${index}`)}
                          >
                            Sửa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesList;
