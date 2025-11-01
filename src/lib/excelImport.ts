// Utility để parse và import sản phẩm từ file Excel
import * as XLSX from 'xlsx';
import { Product } from '@/types';
import { addProduct, updateProduct, getProducts } from '@/lib/storage';

export interface ExcelRow {
  [key: string]: any;
}

export interface ColumnMapping {
  code?: string;
  name?: string;
  price?: string;
  stock?: string;
  category?: string;
  description?: string;
  image?: string;
}

export interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  products: Product[];
}

// Parse file Excel thành array of objects
export const parseExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Không thể đọc file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          reject(new Error('Không tìm thấy sheet trong file Excel'));
          return;
        }
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, // Convert numbers to strings để xử lý dễ hơn
          defval: '' // Default value cho empty cells
        }) as ExcelRow[];

        resolve(jsonData);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Lỗi khi parse file Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Auto-detect column mapping từ header row
export const detectColumnMapping = (rows: ExcelRow[]): ColumnMapping => {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const mapping: ColumnMapping = {};

  // Tìm các cột phổ biến
  const columnNames = Object.keys(firstRow);
  
  // Mapping patterns cho các cột thường gặp
  const codePatterns = ['mã', 'code', 'sku', 'id', 'mã sản phẩm', 'mã sp', 'product_code'];
  const namePatterns = ['tên', 'name', 'tên sản phẩm', 'tên sp', 'product name', 'product_name'];
  const pricePatterns = ['giá', 'price', 'giá bán', 'price sale', 'giá tiền', 'sale_price', 'retail_price'];
  const stockPatterns = ['tồn', 'stock', 'tồn kho', 'inventory', 'số lượng', 'quantity', 'qty'];
  const categoryPatterns = ['danh mục', 'category', 'loại', 'type', 'nhóm', 'group'];
  const descriptionPatterns = ['mô tả', 'description', 'ghi chú', 'note', 'notes', 'desc'];
  const imagePatterns = ['hình', 'image', 'ảnh', 'img', 'url', 'link', 'image_url'];

  const findColumn = (patterns: string[]): string | undefined => {
    return columnNames.find(col => 
      patterns.some(pattern => 
        col.toLowerCase().includes(pattern.toLowerCase())
      )
    );
  };

  const codeCol = findColumn(codePatterns);
  const nameCol = findColumn(namePatterns);
  const priceCol = findColumn(pricePatterns);
  const stockCol = findColumn(stockPatterns);
  const categoryCol = findColumn(categoryPatterns);
  const descriptionCol = findColumn(descriptionPatterns);
  const imageCol = findColumn(imagePatterns);

  if (codeCol) mapping.code = codeCol;
  if (nameCol) mapping.name = nameCol;
  if (priceCol) mapping.price = priceCol;
  if (stockCol) mapping.stock = stockCol;
  if (categoryCol) mapping.category = categoryCol;
  if (descriptionCol) mapping.description = descriptionCol;
  if (imageCol) mapping.image = imageCol;

  return mapping;
};

// Convert Excel row thành Product
export const convertRowToProduct = (
  row: ExcelRow,
  mapping: ColumnMapping,
  rowIndex: number
): { product: Product | null; error: string | null } => {
  try {
    // Lấy giá trị từ các cột được map
    const getValue = (col: string | undefined): string => {
      if (!col) return '';
      const value = row[col];
      return value ? String(value).trim() : '';
    };

    const code = getValue(mapping.code);
    const name = getValue(mapping.name);
    const priceStr = getValue(mapping.price);
    const stockStr = getValue(mapping.stock);
    const category = getValue(mapping.category);
    const description = getValue(mapping.description);
    const image = getValue(mapping.image);

    // Validate required fields
    if (!code && !name) {
      return {
        product: null,
        error: `Dòng ${rowIndex + 2}: Thiếu mã sản phẩm hoặc tên sản phẩm`
      };
    }

    // Parse price - xử lý nhiều format
    let price = 0;
    if (priceStr) {
      // Remove currency symbols, spaces, và các ký tự không phải số
      const cleanPrice = priceStr
        .replace(/[^\d.,-]/g, '') // Giữ lại số, dấu chấm, phẩy, dấu trừ
        .replace(/,/g, '.'); // Thay dấu phẩy bằng dấu chấm
      price = parseFloat(cleanPrice) || 0;
      if (price < 0) price = 0;
    }

    // Parse stock
    let stock = 0;
    if (stockStr) {
      const cleanStock = stockStr.replace(/[^\d-]/g, '');
      stock = parseInt(cleanStock) || 0;
      if (stock < 0) stock = 0;
    }

    // Generate ID nếu không có code
    const productCode = code || `SP${Date.now()}${rowIndex}`;
    const productId = `excel_${productCode}_${Date.now()}_${rowIndex}`;

    const product: Product = {
      id: productId,
      code: productCode,
      name: name || code || `Sản phẩm ${rowIndex + 1}`,
      price,
      stock,
      category: category || undefined,
      description: description || undefined,
      image: image || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { product, error: null };
  } catch (error) {
    return {
      product: null,
      error: `Dòng ${rowIndex + 2}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
    };
  }
};

// Import products từ Excel với mapping
export const importProductsFromExcel = (
  rows: ExcelRow[],
  mapping: ColumnMapping
): ImportResult => {
  const result: ImportResult = {
    success: true,
    total: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    products: [],
  };

  const existingProducts = getProducts();
  const productMap = new Map(existingProducts.map(p => [p.code, p]));

  rows.forEach((row, index) => {
    // Skip empty rows
    const hasData = Object.values(row).some(val => val && String(val).trim());
    if (!hasData) {
      result.skipped++;
      return;
    }

    const { product, error } = convertRowToProduct(row, mapping, index);

    if (error) {
      result.errors.push({ row: index + 2, error }); // +2 vì Excel bắt đầu từ row 2 (row 1 là header)
      result.skipped++;
      return;
    }

    if (!product) {
      result.skipped++;
      return;
    }

    // Kiểm tra sản phẩm đã tồn tại chưa
    const existing = productMap.get(product.code);
    
    if (existing) {
      // Update existing product
      updateProduct(existing.id, {
        ...product,
        id: existing.id,
        createdAt: existing.createdAt, // Giữ nguyên createdAt
      });
      result.updated++;
    } else {
      // Create new product
      addProduct(product);
      productMap.set(product.code, product);
      result.created++;
    }

    result.products.push(product);
  });

  result.success = result.errors.length === 0 || result.created + result.updated > 0;

  return result;
};

// Get available columns from Excel rows
export const getAvailableColumns = (rows: ExcelRow[]): string[] => {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
};

