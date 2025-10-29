import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, Package, Settings, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, initializeSampleData } from '@/lib/storage';
import { Order } from '@/types';

const Index = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    initializeSampleData();
    const loadedOrders = getOrders();
    setOrders(loadedOrders.slice(0, 10));
  }, []);

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'new' || o.status === 'confirmed' || o.status === 'processing').length,
    overdue: orders.filter(o => o.payment.remaining > 0).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bếp An Huy</h1>
              <p className="text-base text-gray-600">Hệ thống quản lý hóa đơn</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/invoice/new')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tạo hóa đơn mới
              </Button>
              <Button variant="outline" onClick={() => navigate('/invoice-builder')} className="border-purple-200 hover:bg-purple-50">
                <Settings className="w-4 h-4 mr-2" />
                Invoice Builder 
              </Button>
              <Button variant="outline" onClick={() => navigate('/visual-builder')}>
                <Edit className="w-4 h-4 mr-2" />
                Simple Builder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-t-4 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Tất cả đơn hàng</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-t-4 border-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đã thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-gray-500 mt-1">Hoàn thành</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-t-4 border-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đang xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Chờ xử lý</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-t-4 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Còn nợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-gray-500 mt-1">Chưa thanh toán</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/invoice/new')}
              >
                <Plus className="w-8 h-8 text-blue-600" />
                <span className="text-sm">Tạo đơn mới</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/orders')}
              >
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-sm">Danh sách đơn</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/customers')}
              >
                <Users className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Khách hàng</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/products')}
              >
                <Package className="w-8 h-8 text-orange-600" />
                <span className="text-sm">Sản phẩm</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có đơn hàng</h3>
                <p className="text-gray-500 mb-6">Tạo đơn hàng đầu tiên của bạn</p>
                <Button onClick={() => navigate('/invoice/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đơn hàng mới
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName} - {order.customerPhone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-lg font-bold text-blue-600">{order.payment.finalAmount.toLocaleString('vi-VN')} đ</p>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/invoice/edit/${order.id}`)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/invoice/${order.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
