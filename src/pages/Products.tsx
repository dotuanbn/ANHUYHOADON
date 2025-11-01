import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Search, ArrowLeft, Filter, X, Image as ImageIcon, XCircle, ChevronLeft, ChevronRight, Upload, Loader2, Save, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product } from '@/types';
import { getProducts, addProduct, updateProduct, deleteProduct, initializeSampleData } from '@/lib/storage';
import { useToast } from "@/hooks/use-toast";
import { ExcelImporter } from '@/components/ExcelImporter';
import { Badge } from "@/components/ui/badge";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriceRange, setFilterPriceRange] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Image zoom dialog state
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    image: '',
  });

  // Parse image URLs from string
  const parseImageUrls = (imageString?: string): string[] => {
    if (!imageString) return [];
    return imageString.split(/[,\n]/).map(url => url.trim()).filter(Boolean);
  };

  // Join image URLs back to string
  const joinImageUrls = (urls: string[]): string => {
    return urls.filter(Boolean).join(', ');
  };

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = products
      .map(p => p.category)
      .filter((cat): cat is string => Boolean(cat));
    return Array.from(new Set(cats)).sort();
  }, [products]);

  useEffect(() => {
    initializeSampleData();
    loadProducts();
  }, []);

  const loadProducts = () => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        code: product.code,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        description: product.description || '',
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        code: '',
        name: '',
        price: 0,
        stock: 0,
        category: '',
        description: '',
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || formData.price <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      if (editingProduct) {
        updateProduct(editingProduct.id, formData);
        toast({
          title: "Thành công",
          description: "Cập nhật sản phẩm thành công",
        });
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addProduct(newProduct);
        toast({
          title: "Thành công",
          description: "Thêm sản phẩm thành công",
        });
      }

      loadProducts();
      handleCloseDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    setIsDeleting(id);

    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      deleteProduct(id);
      loadProducts();
      toast({
        title: "Thành công",
        description: "Xóa sản phẩm thành công",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

      // Price range filter
      let matchesPrice = true;
      if (filterPriceRange !== 'all') {
        switch (filterPriceRange) {
          case 'under-1m':
            matchesPrice = product.price < 1000000;
            break;
          case '1m-5m':
            matchesPrice = product.price >= 1000000 && product.price < 5000000;
            break;
          case '5m-10m':
            matchesPrice = product.price >= 5000000 && product.price < 10000000;
            break;
          case '10m-20m':
            matchesPrice = product.price >= 10000000 && product.price < 20000000;
            break;
          case 'over-20m':
            matchesPrice = product.price >= 20000000;
            break;
        }
      }

      // Stock filter
      let matchesStock = true;
      if (filterStock !== 'all') {
        switch (filterStock) {
          case 'in-stock':
            matchesStock = product.stock > 0;
            break;
          case 'out-of-stock':
            matchesStock = product.stock === 0;
            break;
          case 'low-stock':
            matchesStock = product.stock > 0 && product.stock < 10;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
  }, [products, searchTerm, filterCategory, filterPriceRange, filterStock]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterPriceRange, filterStock]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Convert image file to base64 data URL
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Không thể đọc file'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle image file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    setIsUploadingImages(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / totalFiles) * 100;
        
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Loại file không hợp lệ",
            description: `File "${file.name}" không phải là hình ảnh hợp lệ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size
        if (file.size > maxSize) {
          toast({
            title: "File quá lớn",
            description: `File "${file.name}" quá lớn. Kích thước tối đa: 5MB`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to data URL
        setUploadProgress(progress - 10);
        const dataUrl = await convertFileToDataURL(file);
        uploadedUrls.push(dataUrl);
        setUploadProgress(progress);
      }

      // Add uploaded images to form
      if (uploadedUrls.length > 0) {
        const currentUrls = parseImageUrls(formData.image);
        const newUrls = [...currentUrls, ...uploadedUrls];
        setFormData({
          ...formData,
          image: joinImageUrls(newUrls),
        });
        
        toast({
          title: "Upload thành công",
          description: `Đã thêm ${uploadedUrls.length} hình ảnh`,
        });
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploadingImages(false);
        setUploadProgress(0);
      }, 500);

      // Reset input
      event.target.value = '';
    } catch (error) {
      setIsUploadingImages(false);
      setUploadProgress(0);
      toast({
        title: "Lỗi upload",
        description: error instanceof Error ? error.message : 'Không thể upload hình ảnh',
        variant: "destructive",
      });
    }
  };

  const hasActiveFilters = filterCategory !== 'all' || filterPriceRange !== 'all' || filterStock !== 'all' || searchTerm !== '';

  // Product Image Component với hover zoom
  const ProductImage = ({ imageUrl, alt, className = "w-12 h-12" }: { imageUrl: string | null; alt: string; className?: string }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const imageRef = React.useRef<HTMLDivElement>(null);
    const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
    
    if (!imageUrl || imageError) {
      return (
        <div className={`${className} bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs cursor-default`}>
          No img
        </div>
      );
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
      setIsHovering(true);
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setPreviewPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 16,
        });
      }
    };

    return (
      <div 
        ref={imageRef}
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={imageUrl}
          alt={alt}
          className={`${className} object-cover rounded border border-gray-200 cursor-pointer transition-all duration-200`}
          onError={() => setImageError(true)}
          loading="lazy"
          onClick={() => setZoomedImage({ url: imageUrl, alt })}
        />
        
        {/* Thumbnail preview on hover - hiển thị như trong hình */}
        {isHovering && (
          <div 
            className="fixed z-[100] pointer-events-none"
            style={{
              left: `${previewPosition.left}px`,
              top: `${previewPosition.top}px`,
              transform: 'translateY(-50%)',
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-3 w-64 h-64 flex items-center justify-center relative">
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain"
                onError={() => setImageError(true)}
              />
              {/* Arrow pointer bên trái */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white"></div>
                <div className="absolute -left-[1px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-gray-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 p-2 sm:p-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg">Danh sách sản phẩm</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Tổng cộng: {products.length} sản phẩm • Hiển thị: {filteredProducts.length} sản phẩm
                    {filteredProducts.length > 0 && (
                      <span className="hidden sm:inline ml-2">
                        • Trang {currentPage}/{totalPages} 
                        ({((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)})
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial order-2 sm:order-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className={showFilters ? "bg-blue-50 border-blue-300" : ""}
                      size="sm"
                    >
                      <Filter className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Bộ lọc</span>
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                          {[filterCategory !== 'all', filterPriceRange !== 'all', filterStock !== 'all'].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                    <ExcelImporter onImportComplete={loadProducts} />
                    <Button 
                      onClick={() => handleOpenDialog()} 
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Thêm sản phẩm</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Smart Filters */}
              {showFilters && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4 px-3 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs mb-2 block">Danh mục</Label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả danh mục</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs mb-2 block">Khoảng giá</Label>
                        <Select value={filterPriceRange} onValueChange={setFilterPriceRange}>
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả mức giá</SelectItem>
                            <SelectItem value="under-1m">Dưới 1 triệu</SelectItem>
                            <SelectItem value="1m-5m">1 triệu - 5 triệu</SelectItem>
                            <SelectItem value="5m-10m">5 triệu - 10 triệu</SelectItem>
                            <SelectItem value="10m-20m">10 triệu - 20 triệu</SelectItem>
                            <SelectItem value="over-20m">Trên 20 triệu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs mb-2 block">Tình trạng tồn kho</Label>
                        <Select value={filterStock} onValueChange={setFilterStock}>
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="in-stock">Còn hàng</SelectItem>
                            <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                            <SelectItem value="low-stock">Sắp hết (&lt;10)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          disabled={!hasActiveFilters}
                          className="w-full text-sm h-9"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Xóa bộ lọc
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 px-3">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có sản phẩm nào
                </div>
              ) : (
                paginatedProducts.map((product) => {
                  const imageUrls = parseImageUrls(product.image);
                  const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
                  return (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2 bg-white">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <ProductImage imageUrl={firstImageUrl} alt={product.name} className="w-16 h-16" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{product.code}</p>
                          {product.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="font-bold text-blue-600 text-sm">
                            {product.price.toLocaleString('vi-VN')} đ
                          </p>
                          <Badge 
                            variant={product.stock === 0 ? "destructive" : product.stock < 10 ? "secondary" : "default"}
                            className="text-xs mt-1"
                          >
                            Tồn: {product.stock}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                            className="h-7 px-2"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 h-7 px-2"
                            disabled={isDeleting === product.id || isDeleting !== null}
                          >
                            {isDeleting === product.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-xs sm:text-sm">Hình ảnh</TableHead>
                    <TableHead className="text-xs sm:text-sm">Mã SP</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tên sản phẩm</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Danh mục</TableHead>
                    <TableHead className="text-xs sm:text-sm">Giá</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tồn kho</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => {
                      const imageUrls = parseImageUrls(product.image);
                      const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
                      return (
                        <TableRow 
                          key={product.id}
                          className="group-row"
                        >
                          <TableCell className="relative">
                            <ProductImage imageUrl={firstImageUrl} alt={product.name} />
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{product.code}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{product.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                            {product.category ? (
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{product.price.toLocaleString('vi-VN')} đ</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge 
                              variant={product.stock === 0 ? "destructive" : product.stock < 10 ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1 sm:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(product)}
                                disabled={isDeleting === product.id}
                                className="h-7 sm:h-8 px-2 sm:px-3"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700 h-7 sm:h-8 px-2 sm:px-3"
                                disabled={isDeleting === product.id || isDeleting !== null}
                              >
                                {isDeleting === product.id ? (
                                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                  <Select 
                    value={itemsPerPage.toString()} 
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / trang</SelectItem>
                      <SelectItem value="25">25 / trang</SelectItem>
                      <SelectItem value="50">50 / trang</SelectItem>
                      <SelectItem value="100">100 / trang</SelectItem>
                      <SelectItem value="200">200 / trang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Trước</span>
                      </Button>
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {totalPages > 5 && (
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className={currentPage === totalPages ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          {totalPages}
                        </Button>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingProduct ? 'Cập nhật thông tin sản phẩm' : 'Nhập thông tin sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs sm:text-sm">Mã sản phẩm *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: GARDE820"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs sm:text-sm">Danh mục</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="VD: Máy rửa bát"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Máy rửa bát KF-GARDE820"
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs sm:text-sm">Giá (đ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                    required
                    min="0"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-xs sm:text-sm">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Quản lý hình ảnh sản phẩm</Label>
                <div className="space-y-3">
                  {/* Upload và Input URL */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Upload file button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-input"
                        disabled={isUploadingImages}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                        className="w-full sm:w-auto"
                        disabled={isUploadingImages}
                      >
                        {isUploadingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tải ({Math.round(uploadProgress)}%)
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Tải ảnh từ máy
                          </>
                        )}
                      </Button>
                    </label>

                    {/* Input để thêm URL mới */}
                    <div className="flex gap-2 flex-1">
                      <Input
                        id="image-url-input"
                        placeholder="Nhập URL hình ảnh và nhấn Enter hoặc click Thêm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const newUrl = input.value.trim();
                            if (newUrl) {
                              const currentUrls = parseImageUrls(formData.image);
                              if (!currentUrls.includes(newUrl)) {
                                setFormData({
                                  ...formData,
                                  image: joinImageUrls([...currentUrls, newUrl]),
                                });
                                input.value = '';
                              } else {
                                toast({
                                  title: "URL đã tồn tại",
                                  description: "URL này đã được thêm vào danh sách",
                                  variant: "destructive",
                                });
                              }
                            }
                          }
                        }}
                        className="flex-1"
                        disabled={isUploadingImages}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById('image-url-input') as HTMLInputElement;
                          const newUrl = input?.value.trim();
                          if (newUrl) {
                            const currentUrls = parseImageUrls(formData.image);
                            if (!currentUrls.includes(newUrl)) {
                              setFormData({
                                ...formData,
                                image: joinImageUrls([...currentUrls, newUrl]),
                              });
                              input.value = '';
                            } else {
                              toast({
                                title: "URL đã tồn tại",
                                description: "URL này đã được thêm vào danh sách",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        disabled={isUploadingImages}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Thêm URL
                      </Button>
                    </div>
                  </div>

                  {/* Upload progress */}
                  {isUploadingImages && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Đang xử lý và tải ảnh lên hệ thống... ({Math.round(uploadProgress)}%)
                      </p>
                    </div>
                  )}

                  {/* Danh sách ảnh đã thêm */}
                  {formData.image && parseImageUrls(formData.image).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Hình ảnh đã thêm ({parseImageUrls(formData.image).length}):</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {parseImageUrls(formData.image).map((url, idx) => (
                          <div key={idx} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                              <img
                                src={url}
                                alt={`Ảnh ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setZoomedImage({ url, alt: `Ảnh ${idx + 1}` })}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentUrls = parseImageUrls(formData.image);
                                  const newUrls = currentUrls.filter((_, i) => i !== idx);
                                  setFormData({
                                    ...formData,
                                    image: joinImageUrls(newUrls),
                                  });
                                  toast({
                                    title: "Đã xóa ảnh",
                                    description: "Ảnh đã được xóa khỏi danh sách",
                                  });
                                }}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Xóa ảnh này"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              {/* Badge số thứ tự */}
                              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                {idx + 1}
                              </div>
                            </div>
                            {/* URL preview */}
                            <p className="text-xs text-gray-500 truncate mt-1" title={url}>
                              {url.length > 30 ? `${url.substring(0, 30)}...` : url}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        💡 Ảnh đầu tiên sẽ được hiển thị trong danh sách sản phẩm. Click vào ảnh để xem lớn, hover vào nút X để xóa.
                      </p>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!formData.image || parseImageUrls(formData.image).length === 0) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Chưa có hình ảnh nào</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tải ảnh từ máy tính hoặc nhập URL để thêm ảnh
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog} 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : editingProduct ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Thêm
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>

        {/* Image Zoom Dialog */}
        <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            {zoomedImage && (
              <>
                <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle className="text-sm font-medium text-gray-600">
                    {zoomedImage.alt}
                  </DialogTitle>
                </DialogHeader>
                <div className="relative px-6 pb-6">
                  <img
                    src={zoomedImage.url}
                    alt={zoomedImage.alt}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Yzk3YTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5L4buBdGggxJHhu4NuIG7hu5kgxJHhu4NuIGLhu5k8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                <DialogFooter className="px-6 pb-6">
                  <Button variant="outline" onClick={() => setZoomedImage(null)}>
                    Đóng
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  export default Products;

