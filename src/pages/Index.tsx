import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Package, Settings, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, initializeSampleData } from '@/lib/storage';
import { Order } from '@/types';
import { getStatusLabel, getStatusColor } from '@/lib/orderLogic';
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">Bếp An Huy</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Hệ thống quản lý hóa đơn</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/invoice/new')} 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Tạo hóa đơn mới</span>
                <span className="xs:hidden">Tạo mới</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')} 
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Cài đặt hệ thống</span>
                <span className="xs:hidden">Cài đặt</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-t-4 border-blue-500 dark:border-blue-400">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 hidden sm:block">Tất cả đơn hàng</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-t-4 border-green-500 dark:border-green-400">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Đã thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.paid}</div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 hidden sm:block">Hoàn thành</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-t-4 border-yellow-500 dark:border-yellow-400">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Đang xử lý</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 hidden sm:block">Chờ xử lý</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-t-4 border-red-500 dark:border-red-400">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Còn nợ</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 hidden sm:block">Chưa thanh toán</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg mb-6 sm:mb-8 border dark:border-gray-700">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/invoice/new')}
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Tạo đơn mới</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/orders')}
              >
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Danh sách đơn</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/customers')}
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Khách hàng</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/products')}
              >
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Sản phẩm</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-300" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Cài đặt</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Chưa có đơn hàng</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">Tạo đơn hàng đầu tiên của bạn</p>
                <Button onClick={() => navigate('/invoice/new')} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đơn hàng mới
                </Button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-3 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <p className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-gray-100">{order.orderNumber}</p>
                        <Badge className={getStatusColor(order.status)} className="w-fit">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{order.customerName} - {order.customerPhone}</p>
                      {order.payment.remaining > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Còn nợ: {order.payment.remaining.toLocaleString('vi-VN')} đ
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">{order.payment.finalAmount.toLocaleString('vi-VN')} đ</p>
                        {order.payment.remaining > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-300">Đã trả: {order.payment.paid.toLocaleString('vi-VN')} đ</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex-1 sm:flex-initial text-xs sm:text-sm" 
                          onClick={() => navigate(`/invoice/edit/${order.id}`)}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Sửa</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-initial text-xs sm:text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" 
                          onClick={() => navigate(`/invoice/${order.id}`)}
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Xem</span>
                        </Button>
                      </div>
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
