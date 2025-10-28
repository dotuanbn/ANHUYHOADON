
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Settings, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bếp An Huy</h1>
            <p className="text-sm sm:text-base text-gray-600">Hệ thống quản lý hóa đơn</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={() => navigate('/invoice/new')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hóa đơn mới
            </Button>
            <Button variant="outline" onClick={() => navigate('/visual-builder')} className="w-full sm:w-auto">
              <Palette className="w-4 h-4 mr-2" />
              Visual Builder
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')} className="w-full sm:w-auto">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
