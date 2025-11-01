import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { OrderForm } from "./OrderForm";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface InvoiceFormProps {
  isEdit?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 p-2 sm:p-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isEdit ? 'Sửa đơn hàng' : 'Tạo đơn hàng mới'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <OrderForm
          orderId={isEdit ? id : undefined}
          onSave={() => navigate('/')}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
