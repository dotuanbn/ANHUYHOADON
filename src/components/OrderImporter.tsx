// Component để import đơn hàng từ file Excel
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  parseExcelFile,
  detectOrderColumnMapping,
  previewOrdersFromExcel,
  importOrdersFromExcel,
  getAvailableColumns,
  OrderColumnMapping,
  ExcelRow,
  ImportOrderResult,
} from '@/lib/orderImport';

interface OrderImporterProps {
  onImportComplete?: () => void;
}

export const OrderImporter: React.FC<OrderImporterProps> = ({ onImportComplete }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<OrderColumnMapping>({});
  const [previewResult, setPreviewResult] = useState<ImportOrderResult | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Lỗi định dạng file",
        description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const rows = await parseExcelFile(file);
      
      if (rows.length === 0) {
        toast({
          title: "File trống",
          description: "File Excel không chứa dữ liệu",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setExcelRows(rows);
      const columns = getAvailableColumns(rows);
      setAvailableColumns(columns);
      
      // Auto-detect mapping
      const autoMapping = detectOrderColumnMapping(rows);
      setMapping(autoMapping);
      
      // Preview import (không lưu vào database)
      const preview = previewOrdersFromExcel(rows, autoMapping);
      setPreviewResult(preview);
      
      setIsOpen(true);
      toast({
        title: "Đã tải file thành công",
        description: `Tìm thấy ${rows.length} dòng dữ liệu`,
      });
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast({
        title: "Lỗi đọc file",
        description: error instanceof Error ? error.message : 'Không thể đọc file Excel',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMappingChange = (field: keyof OrderColumnMapping, column: string) => {
    const newMapping = {
      ...mapping,
      [field]: column === 'none' ? undefined : column,
    };
    
    setMapping(newMapping);
    
    // Re-preview với mapping mới (không lưu vào database)
    if (excelRows.length > 0) {
      const preview = previewOrdersFromExcel(excelRows, newMapping);
      setPreviewResult(preview);
    }
  };

  const handleImport = async () => {
    if (!previewResult) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress for better UX
      const totalRows = excelRows.length;
      let processed = 0;

      const progressInterval = setInterval(() => {
        processed += Math.ceil(totalRows / 20);
        if (processed < totalRows) {
          setImportProgress((processed / totalRows) * 90);
        } else {
          clearInterval(progressInterval);
        }
      }, 50);

      // Actual import
      const result = importOrdersFromExcel(excelRows, mapping);
      
      clearInterval(progressInterval);
      setImportProgress(100);

      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: result.success ? "Import thành công" : "Import có lỗi",
        description: `Đã tạo: ${result.created}, Bỏ qua: ${result.skipped}${
          result.errors.length > 0 ? `, Lỗi: ${result.errors.length}` : ''
        }`,
        variant: result.success ? "default" : "destructive",
        duration: 5000,
      });

      // Close dialog và reset
      setIsOpen(false);
      setExcelRows([]);
      setMapping({});
      setPreviewResult(null);
      setIsImporting(false);
      setImportProgress(0);
      
      // Refresh orders list
      if (onImportComplete) {
        onImportComplete();
      } else {
        // Reload page để hiển thị đơn hàng mới
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setIsImporting(false);
      setImportProgress(0);
      toast({
        title: "Lỗi import",
        description: error instanceof Error ? error.message : 'Không thể import đơn hàng',
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setExcelRows([]);
    setMapping({});
    setPreviewResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <label className="cursor-pointer">
        <Button variant="outline" asChild className="w-full sm:w-auto" disabled={isProcessing}>
          <span>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang đọc file...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Import từ Excel
              </>
            )}
          </span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
      </label>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import đơn hàng từ Excel</DialogTitle>
            <DialogDescription>
              Cấu hình mapping các cột Excel với thông tin đơn hàng. Hệ thống đã tự động phát hiện các cột phổ biến từ POS Pancake.
              <br />
              <span className="text-xs text-blue-600 mt-1 block">
                💡 Hỗ trợ import đơn hàng từ POS Pancake và các hệ thống khác. Mỗi dòng trong Excel sẽ tạo một đơn hàng.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Đang import đơn hàng...</span>
                <span className="text-sm text-blue-700">{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-blue-600">
                Đang xử lý và lưu {excelRows.length} đơn hàng vào hệ thống...
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Column Mapping */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Cấu hình mapping cột:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Số đơn hàng</Label>
                  <Select
                    value={mapping.orderNumber || 'none'}
                    onValueChange={(value) => handleMappingChange('orderNumber', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tên khách hàng *</Label>
                  <Select
                    value={mapping.customerName || 'none'}
                    onValueChange={(value) => handleMappingChange('customerName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Số điện thoại *</Label>
                  <Select
                    value={mapping.customerPhone || 'none'}
                    onValueChange={(value) => handleMappingChange('customerPhone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Mã sản phẩm *</Label>
                  <Select
                    value={mapping.productCode || 'none'}
                    onValueChange={(value) => handleMappingChange('productCode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tên sản phẩm *</Label>
                  <Select
                    value={mapping.productName || 'none'}
                    onValueChange={(value) => handleMappingChange('productName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Số lượng</Label>
                  <Select
                    value={mapping.quantity || 'none'}
                    onValueChange={(value) => handleMappingChange('quantity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Giá</Label>
                  <Select
                    value={mapping.price || 'none'}
                    onValueChange={(value) => handleMappingChange('price', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tổng tiền</Label>
                  <Select
                    value={mapping.totalAmount || 'none'}
                    onValueChange={(value) => handleMappingChange('totalAmount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Giảm giá</Label>
                  <Select
                    value={mapping.discount || 'none'}
                    onValueChange={(value) => handleMappingChange('discount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Phí ship</Label>
                  <Select
                    value={mapping.shippingFee || 'none'}
                    onValueChange={(value) => handleMappingChange('shippingFee', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Địa chỉ</Label>
                  <Select
                    value={mapping.address || 'none'}
                    onValueChange={(value) => handleMappingChange('address', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tỉnh/Thành phố</Label>
                  <Select
                    value={mapping.province || 'none'}
                    onValueChange={(value) => handleMappingChange('province', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Quận/Huyện</Label>
                  <Select
                    value={mapping.district || 'none'}
                    onValueChange={(value) => handleMappingChange('district', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Phường/Xã</Label>
                  <Select
                    value={mapping.ward || 'none'}
                    onValueChange={(value) => handleMappingChange('ward', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Trạng thái</Label>
                  <Select
                    value={mapping.status || 'none'}
                    onValueChange={(value) => handleMappingChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Ghi chú</Label>
                  <Select
                    value={mapping.notes || 'none'}
                    onValueChange={(value) => handleMappingChange('notes', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                * Bắt buộc: Ít nhất phải có "Tên khách hàng" hoặc "Số điện thoại", và "Mã sản phẩm" hoặc "Tên sản phẩm"
              </p>
            </div>

            {/* Preview Result */}
            {previewResult && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Xem trước kết quả import:</h3>
                
                <Alert className={previewResult.success ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Tổng số dòng: <strong>{previewResult.total}</strong></div>
                      <div className="text-green-600">Sẽ tạo mới: <strong>{previewResult.created}</strong></div>
                      <div className="text-yellow-600">Sẽ bỏ qua: <strong>{previewResult.skipped}</strong></div>
                    </div>
                    {previewResult.errors.length > 0 && (
                      <div className="mt-2 text-red-600">
                        <strong>Lỗi ({previewResult.errors.length}):</strong>
                        <div className="max-h-32 overflow-y-auto mt-1">
                          <ul className="list-disc list-inside">
                            {previewResult.errors.slice(0, 10).map((err, idx) => (
                              <li key={idx} className="text-xs">{err.error}</li>
                            ))}
                            {previewResult.errors.length > 10 && (
                              <li className="text-xs font-semibold">... và {previewResult.errors.length - 10} lỗi khác</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Preview Table */}
                {previewResult.orders.length > 0 && (
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Số đơn</TableHead>
                          <TableHead className="text-xs">Khách hàng</TableHead>
                          <TableHead className="text-xs">Sản phẩm</TableHead>
                          <TableHead className="text-xs">Tổng tiền</TableHead>
                          <TableHead className="text-xs">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewResult.orders.slice(0, 10).map((order, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs">{order.orderNumber}</TableCell>
                            <TableCell className="text-xs">{order.customerName}</TableCell>
                            <TableCell className="text-xs">{order.items[0]?.productName || '-'}</TableCell>
                            <TableCell className="text-xs">{order.payment.finalAmount.toLocaleString('vi-VN')} đ</TableCell>
                            <TableCell className="text-xs">{order.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewResult.orders.length > 10 && (
                      <div className="text-xs text-gray-500 p-2 text-center">
                        ... và {previewResult.orders.length - 10} đơn hàng khác
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isImporting}>
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={!previewResult || previewResult.total === 0 || isProcessing || isImporting || (!mapping.customerName && !mapping.customerPhone) || (!mapping.productCode && !mapping.productName)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang import ({Math.round(importProgress)}%)...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import ({previewResult?.total || 0} đơn hàng)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

