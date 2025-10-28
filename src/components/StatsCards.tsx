
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Tổng hóa đơn</CardTitle>
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Đã thanh toán</CardTitle>
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full"></div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.paid}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Chờ thanh toán</CardTitle>
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-yellow-500 rounded-full"></div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Quá hạn</CardTitle>
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.overdue}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
