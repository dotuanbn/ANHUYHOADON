// Pancake POS Integration Settings Component

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, CheckCircle, XCircle, ExternalLink, Info, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PancakeIntegrationConfig } from '@/types/pancake';
import { getPancakeConfig, savePancakeConfig } from '@/lib/pancakeConfig';
import { PancakePOSService } from '@/lib/pancakeService';
import { checkAndStartAutoSync } from '@/lib/autoSync';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const PancakeIntegrationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [config, setConfig] = useState<PancakeIntegrationConfig>(getPancakeConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleConfigChange = <K extends keyof PancakeIntegrationConfig>(
    field: K,
    value: PancakeIntegrationConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập API Key trước",
        variant: "destructive",
      });
      return;
    }

    // Nếu không có API Secret, tự động dùng API Key
    const testConfig = {
      ...config,
      apiSecret: config.apiSecret || config.apiKey,
    };

    setTesting(true);
    setTestResult(null);

    try {
      const service = new PancakePOSService(testConfig);
      const result = await service.testConnection();
      setTestResult(result);

      if (result.success) {
        // Nếu tìm được Base URL và Auth Method hoạt động, tự động cập nhật
        if (result.details?.baseUrl && result.details?.authMethod) {
          handleConfigChange('baseUrl', result.details.baseUrl);
          toast({
            title: "Kết nối thành công! ✅",
            description: `Đã tìm được cấu hình hoạt động:\nBase URL: ${result.details.baseUrl}\nAuth Method: ${result.details.authMethod}`,
            duration: 5000,
          });
        } else {
          toast({
            title: "Kết nối thành công",
            description: result.message,
          });
        }
      } else {
        toast({
          title: "Kết nối thất bại",
          description: result.message.substring(0, 200) + (result.message.length > 200 ? '...' : ''),
          variant: "destructive",
          duration: 10000,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setTestResult({
        success: false,
        message: errorMessage,
      });
      toast({
        title: "Lỗi",
        description: errorMessage.substring(0, 200) + (errorMessage.length > 200 ? '...' : ''),
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    savePancakeConfig(config);
    checkAndStartAutoSync();
    toast({
      title: "Đã lưu cấu hình",
      description: "Cấu hình Pancake POS đã được lưu thành công",
    });
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              Tích hợp Pancake POS
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? "Đã bật" : "Đã tắt"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Đồng bộ sản phẩm và đơn hàng với hệ thống Pancake POS
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://pos.pancake.vn/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Trang Pancake
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="pancake-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
            <Label htmlFor="pancake-enabled" className="text-sm font-medium">
              Bật tích hợp Pancake POS
            </Label>
          </div>
          {config.enabled && !config.apiKey && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
              ✅ <strong>Webhook mode:</strong> Chỉ cần bật toggle này và cấu hình Webhook URL trong Pancake POS là đủ. 
              Không cần API Key để sử dụng Webhook.
            </div>
          )}
        </div>

        {config.enabled && (
          <>
            {/* Hướng dẫn lấy API Credentials */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-sm font-semibold text-blue-900">
                Cách lấy API Key và API Secret từ Pancake POS
              </AlertTitle>
              <AlertDescription className="text-xs text-blue-800 mt-2 space-y-2">
                <Collapsible open={showGuide} onOpenChange={setShowGuide}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium cursor-pointer">
                    <HelpCircle className="w-4 h-4" />
                    <span>{showGuide ? 'Ẩn' : 'Xem'} hướng dẫn chi tiết</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2 pl-6">
                    <ol className="list-decimal space-y-2 text-xs">
                      <li>
                        <strong>Đăng nhập vào Pancake POS:</strong> Truy cập{' '}
                        <a 
                          href="https://pos.pancake.vn/dashboard" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          https://pos.pancake.vn/dashboard
                        </a>
                      </li>
                      <li>
                        <strong>Chọn cửa hàng:</strong> Nếu bạn quản lý nhiều cửa hàng, chọn cửa hàng cần tích hợp
                      </li>
                      <li>
                        <strong>Vào mục "Cấu hình":</strong> Trong menu bên trái, nhấp vào "Cấu hình"
                      </li>
                      <li>
                        <strong>Chọn "Webhook - API":</strong> Trong phần "Nâng cao", chọn mục "Webhook - API"
                      </li>
                      <li>
                        <strong>Tạo API Key:</strong> Nhấp vào "Thêm mới" để tạo API Key mới. Đảm bảo API Key ở trạng thái "Bật"
                      </li>
                      <li>
                        <strong>Sao chép thông tin:</strong> Sau khi tạo, hệ thống sẽ hiển thị:
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                          <li><strong>API Key:</strong> Chuỗi mã định danh</li>
                          <li><strong>API Secret:</strong> Chuỗi bảo mật (nếu có) hoặc có thể là cùng giá trị với API Key</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Lưu ý:</strong> API credentials là thông tin bảo mật, giữ kín và chỉ sử dụng cho hệ thống này
                      </li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">Tài liệu API:</p>
                      <a 
                        href="https://api-docs.pancake.vn" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Xem tài liệu API chi tiết tại api-docs.pancake.vn
                      </a>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </AlertDescription>
            </Alert>

            <div className="space-y-4 pt-4 border-t">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 font-semibold mb-1">💡 Lưu ý:</p>
                <p className="text-xs text-blue-700">
                  <strong>Webhook mode:</strong> Chỉ cần bật toggle "Bật tích hợp Pancake POS" và cấu hình Webhook URL trong Pancake POS Dashboard là đủ. 
                  Không cần điền API Key để sử dụng Webhook.
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>REST API mode:</strong> Nếu muốn đồng bộ thủ công qua REST API, vui lòng điền API Key bên dưới.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    API Key <span className="text-gray-500 font-normal">(Chỉ cần cho REST API sync)</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Nhập API Key từ Pancake POS (tùy chọn)"
                    value={config.apiKey}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lấy từ: Cấu hình → Webhook - API → Tab "API Key" → Tạo API Key mới
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Không bắt buộc nếu chỉ dùng Webhook
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    API Secret <span className="text-gray-500 font-normal">(Tùy chọn)</span>
                    <span className="text-gray-500 font-normal ml-1">- Nếu không có, điền lại API Key</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Nhập API Secret hoặc để trống (sẽ dùng API Key)"
                    value={config.apiSecret}
                    onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nếu Pancake chỉ cung cấp API Key, có thể để trống hoặc điền lại API Key
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Base URL
                  </Label>
                  <Input
                    placeholder="https://api.pancake.vn/v1"
                    value={config.baseUrl}
                    onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống để tự động tìm. Hệ thống sẽ thử các Base URL khác nhau khi test kết nối.
                  </p>
                  {testResult?.success && testResult.details?.baseUrl && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      ✅ Base URL đã được tự động cập nhật: {testResult.details.baseUrl}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Store ID (Tùy chọn)
                  </Label>
                  <Input
                    placeholder="ID cửa hàng"
                    value={config.storeId || ''}
                    onChange={(e) => handleConfigChange('storeId', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || !config.apiKey}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Kiểm tra kết nối
                    </>
                  )}
                </Button>

                    {testResult && (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          {testResult.success ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">Kết nối thành công!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">Kết nối thất bại</span>
                            </>
                          )}
                        </div>
                        {testResult.details && (
                          <div className="text-xs text-gray-600 pl-6 space-y-1">
                            <p>Base URL: <code className="bg-gray-100 px-1 rounded">{testResult.details.baseUrl}</code></p>
                            <p>Endpoint: <code className="bg-gray-100 px-1 rounded">{testResult.details.endpoint}</code></p>
                            <p>Auth Method: <code className="bg-gray-100 px-1 rounded">{testResult.details.authMethod}</code></p>
                          </div>
                        )}
                        <div className={`text-xs pl-6 whitespace-pre-line ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                          {testResult.message}
                        </div>
                      </div>
                    )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Tùy chọn đồng bộ
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sync-products"
                        checked={config.syncProducts}
                        onCheckedChange={(checked) => handleConfigChange('syncProducts', checked)}
                      />
                      <Label htmlFor="sync-products" className="text-sm">
                        Đồng bộ sản phẩm
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sync-orders"
                        checked={config.syncOrders}
                        onCheckedChange={(checked) => handleConfigChange('syncOrders', checked)}
                      />
                      <Label htmlFor="sync-orders" className="text-sm">
                        Đồng bộ đơn hàng
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-sync"
                        checked={config.autoSyncEnabled}
                        onCheckedChange={(checked) => handleConfigChange('autoSyncEnabled', checked)}
                      />
                      <Label htmlFor="auto-sync" className="text-sm">
                        Tự động đồng bộ
                      </Label>
                    </div>
                  </div>
                </div>

                {config.autoSyncEnabled && (
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Khoảng thời gian tự động đồng bộ (phút)
                    </Label>
                    <Input
                      type="number"
                      min="5"
                      value={config.autoSyncInterval}
                      onChange={(e) => handleConfigChange('autoSyncInterval', parseInt(e.target.value) || 60)}
                      className="text-sm w-32"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Hướng đồng bộ
                  </Label>
                  <Select
                    value={config.syncDirection}
                    onValueChange={(value: 'from_pancake' | 'to_pancake' | 'bidirectional') =>
                      handleConfigChange('syncDirection', value)
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from_pancake">
                        Từ Pancake → Hệ thống
                      </SelectItem>
                      <SelectItem value="to_pancake">
                        Từ Hệ thống → Pancake
                      </SelectItem>
                      <SelectItem value="bidirectional">
                        Đồng bộ hai chiều
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.lastSyncAt && (
                  <div className="text-xs text-gray-500">
                    Lần đồng bộ cuối: {new Date(config.lastSyncAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cấu hình
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/sync')}
                      disabled={!config.apiKey}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Đồng bộ ngay
                    </Button>
                  </div>

                  {/* Webhook URL Section */}
                  <Alert className="bg-green-50 border-green-200 mt-4">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-sm font-semibold text-green-900">
                      🔗 Kết nối bằng Webhook URL (Khuyến nghị)
                    </AlertTitle>
                    <AlertDescription className="text-xs text-green-800 mt-2 space-y-2">
                      <p>
                        Webhook là cách tốt nhất để đồng bộ dữ liệu từ Pancake POS vì:
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>✅ Tự động cập nhật dữ liệu khi có sự kiện</li>
                        <li>✅ Không gặp vấn đề CORS</li>
                        <li>✅ Pancake POS tự động gửi dữ liệu</li>
                      </ul>
                      <div className="mt-3 space-y-2">
                        <Label className="text-xs font-semibold block">Webhook URL của bạn:</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value="https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook"
                            className="text-xs bg-white font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText('https://anhuyhoadon-g3gc.vercel.app/api/pancake-webhook');
                              toast({
                                title: "Đã copy",
                                description: "Webhook URL đã được copy vào clipboard",
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs mt-2">
                          <strong>Cách cấu hình:</strong>
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-xs">
                          <li>Vào Pancake POS Dashboard → Cấu hình → Webhook - API</li>
                          <li>Chọn tab "Webhook URL"</li>
                          <li>Bật toggle "Webhook URL"</li>
                          <li>Paste URL trên vào trường "Địa chỉ"</li>
                          <li>Chọn dữ liệu: Đơn hàng, Tồn kho, Khách hàng</li>
                          <li>Click "Lưu"</li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-2">
                          📖 Xem hướng dẫn chi tiết tại: <code className="bg-blue-100 px-1 rounded">WEBHOOK_SETUP_GUIDE.md</code>
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );
    };

