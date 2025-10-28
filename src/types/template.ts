// Invoice Template Types for Designer

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  border: string;
  background: string;
}

export interface TemplateFont {
  family: string;
  size: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
  };
}

export interface CompanyInfo {
  name: string;
  logo?: string; // base64 or URL
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxCode?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  section: 'header' | 'customer' | 'order' | 'footer';
  order: number;
  visible: boolean;
  required: boolean;
}

export type SectionType = 
  | 'company-header'
  | 'order-number'
  | 'order-info'
  | 'customer-info'
  | 'products-table'
  | 'payment-summary'
  | 'notes'
  | 'footer'
  | 'custom-section';

export interface TemplateSection {
  id: string;
  type: SectionType;
  title?: string;
  order: number;
  visible: boolean;
  columns?: number; // 1 or 2 columns
  fields: string[]; // field IDs to show
  customHtml?: string; // for custom sections
  style?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderTop?: boolean;
    borderBottom?: boolean;
  };
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  company: CompanyInfo;
  colors: TemplateColors;
  font: TemplateFont;
  customFields: CustomField[];
  sections: TemplateSection[];
  layout: {
    pageSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  showBorder: boolean;
  showLogo: boolean;
  showQRCode: boolean;
  footerText?: string;
  createdAt: string;
  updatedAt: string;
}

// Default template
export const DEFAULT_TEMPLATE: InvoiceTemplate = {
  id: 'default',
  name: 'Template mặc định',
  description: 'Template hóa đơn cơ bản',
  isDefault: true,
  company: {
    name: 'Bếp An Huy',
    address: '',
    phone: '1900-xxxx',
    email: '',
    website: '',
  },
  colors: {
    primary: '#2563eb', // blue-600
    secondary: '#64748b', // slate-500
    accent: '#10b981', // green-500
    text: '#1f2937', // gray-800
    textLight: '#6b7280', // gray-500
    border: '#e5e7eb', // gray-200
    background: '#ffffff',
  },
  font: {
    family: 'Arial, sans-serif',
    size: {
      h1: 24,
      h2: 20,
      h3: 16,
      body: 13,
      small: 11,
    },
  },
  customFields: [],
  sections: [
    {
      id: 'company-header',
      type: 'company-header',
      order: 1,
      visible: true,
      columns: 1,
      fields: ['name', 'logo'],
    },
    {
      id: 'order-number',
      type: 'order-number',
      order: 2,
      visible: true,
      columns: 1,
      fields: ['orderNumber', 'status'],
    },
    {
      id: 'order-customer',
      type: 'order-info',
      order: 3,
      visible: true,
      columns: 2,
      fields: ['orderInfo', 'customerInfo'],
    },
    {
      id: 'products',
      type: 'products-table',
      order: 4,
      visible: true,
      columns: 1,
      fields: ['products'],
    },
    {
      id: 'payment',
      type: 'payment-summary',
      order: 5,
      visible: true,
      columns: 1,
      fields: ['payment'],
    },
    {
      id: 'footer',
      type: 'footer',
      order: 6,
      visible: true,
      columns: 1,
      fields: ['footerText'],
    },
  ],
  layout: {
    pageSize: 'A4',
    orientation: 'portrait',
    margin: {
      top: 12,
      right: 15,
      bottom: 12,
      left: 15,
    },
  },
  showBorder: true,
  showLogo: true,
  showQRCode: false,
  footerText: 'Cảm ơn quý khách đã tin tưởng sử dụng sản phẩm của Bếp An Huy!\nĐể được hỗ trợ, vui lòng liên hệ: 1900-xxxx',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

