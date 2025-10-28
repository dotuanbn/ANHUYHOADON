
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, TrendingUp, DollarSign, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [dateRange, setDateRange] = useState('thisMonth');

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Calculate statistics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const monthlyData = invoices.reduce((acc, invoice) => {
    if (invoice.status === 'paid') {
      const month = new Date(invoice.date).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + invoice.total;
    }
    return acc;
  }, {});

  const exportData = () => {
    const csvContent = [
      ['Số HĐ', 'Khách hàng', 'Ngày', 'Tổng tiền', 'Trạng thái'],
      ...invoices.map(inv => [
        inv.invoiceNumber,
        inv.customerName,
        inv.date,
        inv.total,
        inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'pending' ? 'Chờ thanh toán' : 'Quá hạn'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-hoa-don-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
                <p className="text-gray-600">Xem báo cáo doanh thu và thống kê hóa đơn</p>
              </div>
            </div>
            <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalRevenue.toLocaleString()} đ
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chờ thanh toán</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingAmount.toLocaleString()} đ
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quá hạn</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueAmount.toLocaleString()} đ
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng hóa đơn</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>Biểu đồ doanh thu các tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(monthlyData).map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{month}</span>
                  <span className="text-lg font-bold text-green-600">
                    {(revenue as number).toLocaleString()} đ
                  </span>
                </div>
              ))}
              {Object.keys(monthlyData).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu doanh thu
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Hóa đơn gần đây</CardTitle>
            <CardDescription>Danh sách 10 hóa đơn mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Số HĐ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Khách hàng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Số tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((invoice, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">{invoice.customerName}</td>
                      <td className="py-3 px-4">{invoice.date}</td>
                      <td className="py-3 px-4 font-medium">{invoice.total?.toLocaleString()} đ</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {invoice.status === 'paid' ? 'Đã thanh toán' :
                           invoice.status === 'pending' ? 'Chờ thanh toán' : 'Quá hạn'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có hóa đơn nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
