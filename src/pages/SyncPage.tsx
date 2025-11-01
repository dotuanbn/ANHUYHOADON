// Sync Page for Pancake POS integration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getPancakeConfig } from '@/lib/pancakeConfig';
import { PancakeSyncService } from '@/lib/pancakeSync';
import { SyncResult, SyncProgress } from '@/types/pancake';
import { savePancakeConfig } from '@/lib/pancakeConfig';

const SyncPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    processed: 0,
    current: '',
    status: 'idle',
  });
  const [productsResult, setProductsResult] = useState<SyncResult | null>(null);
  const [ordersResult, setOrdersResult] = useState<SyncResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncResult[]>([]);

  useEffect(() => {
    const config = getPancakeConfig();
    if (!config.enabled) {
      toast({
        title: "Chưa cấu hình",
        description: "Vui lòng bật tích hợp Pancake POS trong Settings trước",
        variant: "destructive",
      });
      navigate('/settings');
      return;
    }
    
    // Nếu đang dùng webhook, không cần API Key
    // Webhook tự động hoạt động, không cần ấn đồng bộ
    if (!config.apiKey) {
      toast({
        title: "Đang sử dụng Webhook",
        description: "Webhook tự động đồng bộ dữ liệu. Không cần ấn đồng bộ thủ công.",
        duration: 5000,
      });
    }
  }, [navigate, toast]);

  const handleSync = async (type: 'products' | 'orders' | 'all') => {
    const config = getPancakeConfig();
    if (!config.enabled) {
      toast({
        title: "Lỗi",
        description: "Tích hợp Pancake POS chưa được bật",
        variant: "destructive",
      });
      return;
    }

    // Nếu không có API Key, đang dùng webhook mode
    if (!config.apiKey) {
      toast({
        title: "Đang sử dụng Webhook",
        description: "Webhook tự động đồng bộ dữ liệu từ Pancake POS. " +
          "Nếu bạn muốn đồng bộ thủ công qua REST API, vui lòng cấu hình API Key trong Settings.",
        variant: "default",
        duration: 8000,
      });
      return;
    }

    // Kiểm tra API Secret (có thể để trống)
    if (!config.apiSecret && config.apiKey) {
      // Tự động dùng API Key làm API Secret
      config.apiSecret = config.apiKey;
    }

    setSyncing(true);
    setProgress({
      total: 0,
      processed: 0,
      current: 'Đang khởi động đồng bộ...',
      status: 'syncing',
      startTime: new Date().toISOString(),
    });

    try {
      const syncConfig = {
        ...config,
        // Nếu không có API Secret, tự động dùng API Key
        apiSecret: config.apiSecret || config.apiKey,
      };

      const syncService = new PancakeSyncService(syncConfig, (progress) => {
        setProgress(progress);
      });

      if (type === 'products' || type === 'all') {
        const result = await syncService.syncProducts();
        setProductsResult(result);
        setSyncHistory((prev) => [result, ...prev.slice(0, 9)]);

        const config = getPancakeConfig();
        savePancakeConfig({
          ...config,
          lastSyncAt: result.timestamp,
        });

        if (result.success) {
          toast({
            title: "Đồng bộ sản phẩm thành công",
            description: result.message,
          });
        } else {
          toast({
            title: "Đồng bộ sản phẩm có lỗi",
            description: result.message,
            variant: "destructive",
          });
        }
      }

      if (type === 'orders' || type === 'all') {
        const result = await syncService.syncOrders();
        setOrdersResult(result);
        setSyncHistory((prev) => [result, ...prev.slice(0, 9)]);

        const config = getPancakeConfig();
        savePancakeConfig({
          ...config,
          lastSyncAt: result.timestamp,
        });

        if (result.success) {
          toast({
            title: "Đồng bộ đơn hàng thành công",
            description: result.message,
          });
        } else {
          toast({
            title: "Đồng bộ đơn hàng có lỗi",
            description: result.message,
            variant: "destructive",
          });
        }
      }

      setProgress((prev) => ({
        ...prev,
        status: 'completed',
      }));
    } catch (error) {
      setProgress((prev) => ({
        ...prev,
        status: 'error',
      }));
      toast({
        title: "Lỗi đồng bộ",
        description: error instanceof Error ? error.message : 'Lỗi không xác định',
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)} phút`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/settings')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Đồng bộ Pancake POS</h1>
                <p className="text-sm text-gray-600">Đồng bộ sản phẩm và đơn hàng từ Pancake POS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Webhook Status */}
        {!getPancakeConfig().apiKey && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5" />
                🔗 Webhook đang hoạt động
              </CardTitle>
              <CardDescription className="text-green-700">
                Dữ liệu sẽ tự động được đồng bộ từ Pancake POS qua Webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Webhook URL đã được cấu hình trong Pancake POS</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Hệ thống tự động poll và xử lý dữ liệu mỗi 5 giây</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Không cần ấn đồng bộ thủ công - dữ liệu sẽ tự động xuất hiện khi Pancake POS gửi webhook</p>
                </div>
                <div className="mt-4 p-3 bg-white rounded border border-green-300">
                  <p className="text-xs font-semibold text-green-900 mb-1">Webhook URL của bạn:</p>
                  <code className="text-xs bg-green-100 px-2 py-1 rounded block break-all">
                    https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook
                  </code>
                </div>
                <p className="mt-3 text-xs text-green-600">
                  💡 Để đồng bộ thủ công qua REST API, vui lòng cấu hình API Key trong Settings
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Actions (REST API) */}
        <Card>
          <CardHeader>
            <CardTitle>Đồng bộ thủ công (REST API)</CardTitle>
            <CardDescription>
              {!getPancakeConfig().apiKey 
                ? "⚠️ Cần cấu hình API Key trong Settings để sử dụng tính năng đồng bộ thủ công qua REST API"
                : "Chọn loại dữ liệu muốn đồng bộ qua REST API"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleSync('products')}
                disabled={syncing || !getPancakeConfig().apiKey}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Package className="w-8 h-8 text-blue-600" />
                <span>Đồng bộ Sản phẩm</span>
              </Button>
              <Button
                onClick={() => handleSync('orders')}
                disabled={syncing || !getPancakeConfig().apiKey}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <span>Đồng bộ Đơn hàng</span>
              </Button>
              <Button
                onClick={() => handleSync('all')}
                disabled={syncing || !getPancakeConfig().apiKey}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <RefreshCw className={`w-8 h-8 ${syncing ? 'animate-spin' : ''}`} />
                <span>Đồng bộ Tất cả</span>
              </Button>
            </div>
            {!getPancakeConfig().apiKey && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                <p className="font-semibold mb-1">ℹ️ Lưu ý:</p>
                <p>Bạn đang sử dụng Webhook mode. Webhook tự động đồng bộ dữ liệu, không cần ấn đồng bộ thủ công.</p>
                <p className="mt-2 text-xs">Để sử dụng tính năng đồng bộ thủ công qua REST API, vui lòng cấu hình API Key trong Settings.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {syncing && (
          <Card>
            <CardHeader>
              <CardTitle>Tiến trình đồng bộ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{progress.current || 'Đang xử lý...'}</span>
                  <span>
                    {progress.total > 0
                      ? `${progress.processed}/${progress.total} (${Math.round((progress.processed / progress.total) * 100)}%)`
                      : 'Đang tải...'}
                  </span>
                </div>
                <Progress
                  value={progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Result */}
          {productsResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Kết quả đồng bộ Sản phẩm
                  {productsResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{productsResult.message}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Đã xử lý:</span>
                    <span className="font-semibold ml-2">{productsResult.itemsProcessed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đã tạo:</span>
                    <span className="font-semibold ml-2 text-green-600">{productsResult.itemsCreated}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đã cập nhật:</span>
                    <span className="font-semibold ml-2 text-blue-600">{productsResult.itemsUpdated}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bỏ qua:</span>
                    <span className="font-semibold ml-2 text-yellow-600">{productsResult.itemsSkipped}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Thời gian: {formatDuration(productsResult.duration)} •{' '}
                  {new Date(productsResult.timestamp).toLocaleString('vi-VN')}
                </div>
                {productsResult.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs font-semibold text-red-800 mb-1">Lỗi:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {productsResult.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>• {error.message}</li>
                      ))}
                      {productsResult.errors.length > 5 && (
                        <li>... và {productsResult.errors.length - 5} lỗi khác</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Orders Result */}
          {ordersResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Kết quả đồng bộ Đơn hàng
                  {ordersResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{ordersResult.message}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Đã xử lý:</span>
                    <span className="font-semibold ml-2">{ordersResult.itemsProcessed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đã tạo:</span>
                    <span className="font-semibold ml-2 text-green-600">{ordersResult.itemsCreated}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đã cập nhật:</span>
                    <span className="font-semibold ml-2 text-blue-600">{ordersResult.itemsUpdated}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bỏ qua:</span>
                    <span className="font-semibold ml-2 text-yellow-600">{ordersResult.itemsSkipped}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Thời gian: {formatDuration(ordersResult.duration)} •{' '}
                  {new Date(ordersResult.timestamp).toLocaleString('vi-VN')}
                </div>
                {ordersResult.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs font-semibold text-red-800 mb-1">Lỗi:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {ordersResult.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>• {error.message}</li>
                      ))}
                      {ordersResult.errors.length > 5 && (
                        <li>... và {ordersResult.errors.length - 5} lỗi khác</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sync History */}
        {syncHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đồng bộ</CardTitle>
              <CardDescription>Các lần đồng bộ gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncHistory.map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.type === 'products' ? (
                        <Package className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{result.type === 'products' ? 'Sản phẩm' : 'Đơn hàng'}</p>
                        <p className="text-xs text-gray-500">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Thành công' : 'Lỗi'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SyncPage;

