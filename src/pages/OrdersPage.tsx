import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, ArrowLeft, Eye, Edit, Printer, MoreVertical, CheckCircle, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Order, OrderStatus } from '@/types';
import { getOrders, updateOrder } from '@/lib/storage';
import { getAvailableTransitions, transitionOrderStatus, getStatusLabel, getStatusColor } from '@/lib/orderLogic';
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const loadedOrders = getOrders();
    // Sort by creation date, newest first
    setOrders(loadedOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleStatusTransition = (orderId: string, newStatus: OrderStatus) => {
    const result = transitionOrderStatus(orderId, newStatus);
    if (result.success) {
      toast({
        title: "Thành công",
        description: result.message,
      });
      loadOrders();
    } else {
      toast({
        title: "Lỗi",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      new: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      confirmed: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      processing: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      shipping: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      delivered: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      returned: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      new: 'Mới',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
      returned: 'Trả hàng',
    };
    return texts[status];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.payment.finalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 p-2 sm:p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý đơn hàng</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Tổng đơn</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Đơn mới</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.new}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Đang xử lý</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.processing}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Đã giao</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Doanh thu</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-base sm:text-lg">Danh sách đơn hàng</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Tổng cộng: {filteredOrders.length} đơn hàng</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-40 text-sm">
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipping">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 px-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có đơn hàng nào
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 space-y-2 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{order.orderNumber}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                      <Badge variant="outline">{order.items.length} SP</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="font-bold text-blue-600 text-sm">
                        {order.payment.finalAmount.toLocaleString('vi-VN')} đ
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoice/${order.id}`)}
                          className="h-7 px-2"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoice/edit/${order.id}`)}
                          className="h-7 px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 px-2">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getAvailableTransitions(order).map((transition) => (
                              <DropdownMenuItem
                                key={transition.to}
                                onClick={() => handleStatusTransition(order.id, transition.to)}
                                className="cursor-pointer text-xs"
                              >
                                {transition.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => window.print()}
                              className="cursor-pointer text-xs"
                            >
                              <Printer className="w-3 h-3 mr-2" />
                              In đơn hàng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Số đơn hàng</TableHead>
                    <TableHead className="text-xs sm:text-sm">Khách hàng</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Số điện thoại</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Ngày tạo</TableHead>
                    <TableHead className="text-xs sm:text-sm">Sản phẩm</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tổng tiền</TableHead>
                    <TableHead className="text-xs sm:text-sm">Trạng thái</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.orderNumber}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.customerName}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{order.customerPhone}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline" className="text-xs">{order.items.length} SP</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {order.payment.finalAmount.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/invoice/${order.id}`)}
                              title="Xem chi tiết"
                              className="h-7 sm:h-8 px-2 sm:px-3"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/invoice/edit/${order.id}`)}
                              title="Chỉnh sửa"
                              className="h-7 sm:h-8 px-2 sm:px-3"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" title="Thao tác khác" className="h-7 sm:h-8 px-2 sm:px-3">
                                  <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {getAvailableTransitions(order).map((transition) => (
                                  <DropdownMenuItem
                                    key={transition.to}
                                    onClick={() => handleStatusTransition(order.id, transition.to)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                  >
                                    {transition.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem
                                  onClick={() => window.print()}
                                  className="cursor-pointer text-xs sm:text-sm"
                                >
                                  <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  In đơn hàng
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  );
};

export default OrdersPage;


