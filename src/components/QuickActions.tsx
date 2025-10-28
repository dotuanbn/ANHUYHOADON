
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/customers')}>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center text-blue-600 text-sm sm:text-base">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Quản lý khách hàng
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Thêm, sửa, xóa thông tin khách hàng
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center text-green-600 text-sm sm:text-base">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Quản lý sản phẩm
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Quản lý danh mục sản phẩm và dịch vụ
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center text-purple-600 text-sm sm:text-base">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Báo cáo
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Xem báo cáo doanh thu và thống kê
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default QuickActions;
