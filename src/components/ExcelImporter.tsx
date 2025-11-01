// Component để import sản phẩm từ file Excel
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
  detectColumnMapping,
  importProductsFromExcel,
  getAvailableColumns,
  ColumnMapping,
  ExcelRow,
  ImportResult,
} from '@/lib/excelImport';
import { Product } from '@/types';

interface ExcelImporterProps {
  onImportComplete?: () => void;
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);

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
      const autoMapping = detectColumnMapping(rows);
      setMapping(autoMapping);
      
      // Preview import
      const preview = importProductsFromExcel(rows, autoMapping);
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

  const handleMappingChange = (field: keyof ColumnMapping, column: string) => {
    const newMapping = {
      ...mapping,
      [field]: column === 'none' ? undefined : column,
    };
    
    setMapping(newMapping);
    
    // Re-preview với mapping mới
    if (excelRows.length > 0) {
      const preview = importProductsFromExcel(excelRows, newMapping);
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
      const result = importProductsFromExcel(excelRows, mapping);
      
      clearInterval(progressInterval);
      setImportProgress(100);

      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: result.success ? "Import thành công" : "Import có lỗi",
        description: `Đã tạo: ${result.created}, Cập nhật: ${result.updated}, Bỏ qua: ${result.skipped}${
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
      
      // Refresh products list
      if (onImportComplete) {
        onImportComplete();
      } else {
        // Reload page để hiển thị sản phẩm mới
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setIsImporting(false);
      setImportProgress(0);
      toast({
        title: "Lỗi import",
        description: error instanceof Error ? error.message : 'Không thể import sản phẩm',
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import sản phẩm từ Excel</DialogTitle>
            <DialogDescription>
              Cấu hình mapping các cột Excel với thông tin sản phẩm. Hệ thống đã tự động phát hiện các cột phổ biến.
            </DialogDescription>
          </DialogHeader>

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Đang import sản phẩm...</span>
                <span className="text-sm text-blue-700">{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-blue-600">
                Đang xử lý và lưu {excelRows.length} sản phẩm vào hệ thống...
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Column Mapping */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Cấu hình mapping cột:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Mã sản phẩm (Code/SKU) *</Label>
                  <Select
                    value={mapping.code || 'none'}
                    onValueChange={(value) => handleMappingChange('code', value)}
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
                    value={mapping.name || 'none'}
                    onValueChange={(value) => handleMappingChange('name', value)}
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
                  <Label className="text-xs">Giá (Price)</Label>
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
                  <Label className="text-xs">Tồn kho (Stock)</Label>
                  <Select
                    value={mapping.stock || 'none'}
                    onValueChange={(value) => handleMappingChange('stock', value)}
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
                  <Label className="text-xs">Danh mục (Category)</Label>
                  <Select
                    value={mapping.category || 'none'}
                    onValueChange={(value) => handleMappingChange('category', value)}
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
                  <Label className="text-xs">Mô tả (Description)</Label>
                  <Select
                    value={mapping.description || 'none'}
                    onValueChange={(value) => handleMappingChange('description', value)}
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
                  <Label className="text-xs">Hình ảnh (Image URL)</Label>
                  <Select
                    value={mapping.image || 'none'}
                    onValueChange={(value) => handleMappingChange('image', value)}
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
                * Bắt buộc: Ít nhất phải có "Mã sản phẩm" hoặc "Tên sản phẩm"
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
                      <div className="text-blue-600">Sẽ cập nhật: <strong>{previewResult.updated}</strong></div>
                      <div className="text-yellow-600">Sẽ bỏ qua: <strong>{previewResult.skipped}</strong></div>
                    </div>
                    {previewResult.errors.length > 0 && (
                      <div className="mt-2 text-red-600">
                        <strong>Lỗi ({previewResult.errors.length}):</strong>
                        <ul className="list-disc list-inside mt-1">
                          {previewResult.errors.slice(0, 5).map((err, idx) => (
                            <li key={idx} className="text-xs">{err.error}</li>
                          ))}
                          {previewResult.errors.length > 5 && (
                            <li className="text-xs">... và {previewResult.errors.length - 5} lỗi khác</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Preview Table */}
                {previewResult.products.length > 0 && (
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Mã</TableHead>
                          <TableHead className="text-xs">Tên</TableHead>
                          <TableHead className="text-xs">Giá</TableHead>
                          <TableHead className="text-xs">Tồn</TableHead>
                          <TableHead className="text-xs">Danh mục</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewResult.products.slice(0, 10).map((product, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs">{product.code}</TableCell>
                            <TableCell className="text-xs">{product.name}</TableCell>
                            <TableCell className="text-xs">{product.price.toLocaleString('vi-VN')} đ</TableCell>
                            <TableCell className="text-xs">{product.stock}</TableCell>
                            <TableCell className="text-xs">{product.category || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewResult.products.length > 10 && (
                      <div className="text-xs text-gray-500 p-2 text-center">
                        ... và {previewResult.products.length - 10} sản phẩm khác
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
              disabled={!previewResult || previewResult.total === 0 || isProcessing || isImporting || (!mapping.code && !mapping.name)}
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
                  Import ({previewResult?.total || 0} sản phẩm)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

