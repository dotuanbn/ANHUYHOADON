// Visual Template Builder Types

export type ElementType = 
  | 'logo'
  | 'company-name'
  | 'company-info'
  | 'order-number'
  | 'order-info'
  | 'customer-info'
  | 'products-table'
  | 'payment-summary'
  | 'notes'
  | 'footer'
  | 'custom-field'
  | 'separator'
  | 'text-block';

export interface InvoiceElement {
  id: string;
  type: ElementType;
  label: string;
  icon: string;
  
  // Position & Size
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number | 'auto' | 'full';
    height: number | 'auto';
  };
  
  // Style
  style: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'semibold';
    color?: string;
    backgroundColor?: string;
    padding?: number;
    margin?: number;
    textAlign?: 'left' | 'center' | 'right';
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
  };
  
  // Content
  content?: {
    text?: string;
    placeholder?: string;
    field?: string; // field name for dynamic data
    showLabel?: boolean;
    labelText?: string;
  };
  
  // Visibility
  visible: boolean;
  printOnly?: boolean;
  
  // Order
  order: number;
}

export interface VisualTemplate {
  id: string;
  name: string;
  description?: string;
  
  // Canvas settings
  canvas: {
    width: number; // A4 = 210mm
    height: number; // A4 = 297mm
    unit: 'mm' | 'px';
    orientation: 'portrait' | 'landscape';
    backgroundColor: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  // Elements in canvas
  elements: InvoiceElement[];
  
  // Global styles
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    borderColor: string;
    fontFamily: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Component Palette Items
export interface PaletteItem {
  type: ElementType;
  label: string;
  icon: string;
  description: string;
  category: 'basic' | 'company' | 'order' | 'customer' | 'content' | 'layout';
  defaultElement: Partial<InvoiceElement>;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // Basic
  {
    type: 'text-block',
    label: 'Text Block',
    icon: 'Type',
    description: 'Add custom text',
    category: 'basic',
    defaultElement: {
      style: { fontSize: 14, textAlign: 'left' },
      content: { text: 'Enter your text', showLabel: false },
      visible: true,
    },
  },
  {
    type: 'separator',
    label: 'Separator',
    icon: 'Minus',
    description: 'Horizontal line',
    category: 'basic',
    defaultElement: {
      style: { borderWidth: 1, borderColor: '#e5e7eb' },
      size: { width: 'full', height: 1 },
      visible: true,
    },
  },
  
  // Company
  {
    type: 'logo',
    label: 'Company Logo',
    icon: 'Image',
    description: 'Upload company logo',
    category: 'company',
    defaultElement: {
      size: { width: 100, height: 60 },
      visible: true,
      content: { placeholder: 'Upload logo' },
    },
  },
  {
    type: 'company-name',
    label: 'Company Name',
    icon: 'Building',
    description: 'Company name heading',
    category: 'company',
    defaultElement: {
      style: { fontSize: 24, fontWeight: 'bold', textAlign: 'left' },
      content: { text: 'Company Name', field: 'companyName' },
      visible: true,
    },
  },
  {
    type: 'company-info',
    label: 'Company Info',
    icon: 'Info',
    description: 'Address, phone, email',
    category: 'company',
    defaultElement: {
      style: { fontSize: 12, textAlign: 'left' },
      visible: true,
    },
  },
  
  // Order
  {
    type: 'order-number',
    label: 'Order Number',
    icon: 'Hash',
    description: 'Invoice/Order number',
    category: 'order',
    defaultElement: {
      style: { fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
      content: { text: '#ORDER-001', field: 'orderNumber', showLabel: true, labelText: 'Order #' },
      visible: true,
    },
  },
  {
    type: 'order-info',
    label: 'Order Info',
    icon: 'FileText',
    description: 'Date, status, tracking',
    category: 'order',
    defaultElement: {
      style: { fontSize: 13, textAlign: 'left' },
      visible: true,
    },
  },
  
  // Customer
  {
    type: 'customer-info',
    label: 'Customer Info',
    icon: 'User',
    description: 'Customer details',
    category: 'customer',
    defaultElement: {
      style: { fontSize: 13, textAlign: 'left' },
      visible: true,
    },
  },
  
  // Content
  {
    type: 'products-table',
    label: 'Products Table',
    icon: 'Table',
    description: 'Products/Services list',
    category: 'content',
    defaultElement: {
      style: { fontSize: 12 },
      size: { width: 'full', height: 'auto' },
      visible: true,
    },
  },
  {
    type: 'payment-summary',
    label: 'Payment Summary',
    icon: 'DollarSign',
    description: 'Total, paid, remaining',
    category: 'content',
    defaultElement: {
      style: { fontSize: 13, textAlign: 'right' },
      visible: true,
    },
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: 'StickyNote',
    description: 'Order notes',
    category: 'content',
    defaultElement: {
      style: { fontSize: 12, textAlign: 'left' },
      visible: true,
    },
  },
  
  // Layout
  {
    type: 'footer',
    label: 'Footer',
    icon: 'AlignBottom',
    description: 'Footer text',
    category: 'layout',
    defaultElement: {
      style: { fontSize: 11, textAlign: 'center', color: '#6b7280' },
      content: { text: 'Thank you for your business!' },
      visible: true,
    },
  },
  {
    type: 'custom-field',
    label: 'Custom Field',
    icon: 'Plus',
    description: 'Add custom field',
    category: 'layout',
    defaultElement: {
      style: { fontSize: 13, textAlign: 'left' },
      content: { showLabel: true, labelText: 'Custom Field', text: 'Value' },
      visible: true,
    },
  },
];

