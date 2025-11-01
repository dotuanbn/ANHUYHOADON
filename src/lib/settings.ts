import { CompanyInfo, InvoiceSettings, DiscountType, OrderStatus } from '@/types';

const COMPANY_INFO_KEY = 'companyInfo';
const INVOICE_SETTINGS_KEY = 'invoiceSettings';
const ORDER_COUNTER_KEY = 'orderCounter';

const BASE_COMPANY_INFO: CompanyInfo = {
  name: 'BẾP AN HUY',
  address: 'Số 56 Vũ Xuân Thiều, Phúc Đồng, Long Biên, Hà Nội',
  website: 'bepanhuy.vn',
  phone: '024.123.456.789',
  email: '',
  taxCode: '',
  bankAccount: '123456789',
  bankName: 'Vietcombank',
  accountHolder: 'Bếp An Huy',
};

const BASE_INVOICE_SETTINGS: InvoiceSettings = {
  numbering: {
    prefix: 'DH',
    suffix: '',
    includeDate: true,
    dateFormat: 'YYMMDD',
    padding: 6,
    nextNumber: 1,
  },
  paymentDefaults: {
    discountType: 'amount',
    discountValue: 0,
    taxRate: 0,
    shippingFee: 0,
    additionalFee: 0,
    bankTransfer: 0,
    paid: 0,
  },
  shippingDefaults: {
    recipientName: '',
    recipientPhone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    freeShipping: true,
    estimatedDeliveryDate: '',
    trackingNumber: '',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
  },
  orderDefaults: {
    status: 'new',
    assignedTo: '',
    marketer: '',
    tags: [],
  },
  notesDefaults: {
    internal: '',
    easyPrint: '',
    discussion: '',
  },
};

const cloneCompanyInfo = (info: CompanyInfo): CompanyInfo => ({
  name: info.name,
  address: info.address,
  website: info.website,
  phone: info.phone,
  email: info.email,
  taxCode: info.taxCode,
  bankAccount: info.bankAccount,
  bankName: info.bankName,
  accountHolder: info.accountHolder,
  logo: info.logo,
});

const cloneInvoiceSettings = (settings: InvoiceSettings): InvoiceSettings => ({
  numbering: { ...settings.numbering },
  paymentDefaults: { ...settings.paymentDefaults },
  shippingDefaults: {
    ...settings.shippingDefaults,
    dimensions: { ...settings.shippingDefaults.dimensions },
  },
  orderDefaults: {
    ...settings.orderDefaults,
    tags: [...settings.orderDefaults.tags],
  },
  notesDefaults: { ...settings.notesDefaults },
});

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return fallback;
};

const sanitizeString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const sanitizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => sanitizeString(tag).trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeDiscountType = (value: unknown): DiscountType => {
  return value === 'percent' ? 'percent' : 'amount';
};

const VALID_DATE_FORMATS = new Set(['YYMMDD', 'YYYYMMDD', 'YYMM', 'YYYYMM', 'YYYY']);

const mergeInvoiceSettings = (
  base: InvoiceSettings,
  overrides?: Partial<InvoiceSettings>
): InvoiceSettings => {
  const merged = cloneInvoiceSettings(base);

  if (!overrides) {
    return merged;
  }

  if (overrides.numbering) {
    merged.numbering = {
      ...merged.numbering,
      ...overrides.numbering,
    };
  }

  if (overrides.paymentDefaults) {
    merged.paymentDefaults = {
      ...merged.paymentDefaults,
      ...overrides.paymentDefaults,
    };
  }

  if (overrides.shippingDefaults) {
    merged.shippingDefaults = {
      ...merged.shippingDefaults,
      ...overrides.shippingDefaults,
      dimensions: {
        ...merged.shippingDefaults.dimensions,
        ...(overrides.shippingDefaults.dimensions ?? {}),
      },
    };
  }

  if (overrides.orderDefaults) {
    merged.orderDefaults = {
      ...merged.orderDefaults,
      ...overrides.orderDefaults,
      tags:
        overrides.orderDefaults.tags !== undefined
          ? sanitizeTags(overrides.orderDefaults.tags)
          : merged.orderDefaults.tags,
    };
  }

  if (overrides.notesDefaults) {
    merged.notesDefaults = {
      ...merged.notesDefaults,
      ...overrides.notesDefaults,
    };
  }

  return merged;
};

const normalizeInvoiceSettings = (settings: InvoiceSettings): InvoiceSettings => {
  const normalized = cloneInvoiceSettings(settings);

  normalized.numbering.prefix = sanitizeString(normalized.numbering.prefix, '');
  normalized.numbering.suffix = sanitizeString(normalized.numbering.suffix, '');
  normalized.numbering.includeDate = toBoolean(normalized.numbering.includeDate, true);
  normalized.numbering.dateFormat = VALID_DATE_FORMATS.has(normalized.numbering.dateFormat)
    ? normalized.numbering.dateFormat
    : 'YYMMDD';
  normalized.numbering.padding = Math.max(2, Math.floor(toNumber(normalized.numbering.padding, 6)));
  normalized.numbering.nextNumber = Math.max(1, Math.floor(toNumber(normalized.numbering.nextNumber, 1)));

  normalized.paymentDefaults.discountType = normalizeDiscountType(normalized.paymentDefaults.discountType);
  normalized.paymentDefaults.discountValue = toNumber(normalized.paymentDefaults.discountValue, 0);
  normalized.paymentDefaults.taxRate = toNumber(normalized.paymentDefaults.taxRate, 0);
  normalized.paymentDefaults.shippingFee = toNumber(normalized.paymentDefaults.shippingFee, 0);
  normalized.paymentDefaults.additionalFee = toNumber(normalized.paymentDefaults.additionalFee, 0);
  normalized.paymentDefaults.bankTransfer = toNumber(normalized.paymentDefaults.bankTransfer, 0);
  normalized.paymentDefaults.paid = toNumber(normalized.paymentDefaults.paid, 0);

  normalized.shippingDefaults.recipientName = sanitizeString(normalized.shippingDefaults.recipientName, '');
  normalized.shippingDefaults.recipientPhone = sanitizeString(normalized.shippingDefaults.recipientPhone, '');
  normalized.shippingDefaults.address = sanitizeString(normalized.shippingDefaults.address, '');
  normalized.shippingDefaults.ward = sanitizeString(normalized.shippingDefaults.ward, '');
  normalized.shippingDefaults.district = sanitizeString(normalized.shippingDefaults.district, '');
  normalized.shippingDefaults.province = sanitizeString(normalized.shippingDefaults.province, '');
  normalized.shippingDefaults.estimatedDeliveryDate = sanitizeString(
    normalized.shippingDefaults.estimatedDeliveryDate,
    ''
  );
  normalized.shippingDefaults.trackingNumber = sanitizeString(
    normalized.shippingDefaults.trackingNumber,
    ''
  );
  normalized.shippingDefaults.freeShipping = toBoolean(normalized.shippingDefaults.freeShipping, true);
  normalized.shippingDefaults.dimensions = {
    length: toNumber(normalized.shippingDefaults.dimensions.length, 0),
    width: toNumber(normalized.shippingDefaults.dimensions.width, 0),
    height: toNumber(normalized.shippingDefaults.dimensions.height, 0),
  };

  const validStatuses: OrderStatus[] = [
    'new',
    'confirmed',
    'processing',
    'shipping',
    'delivered',
    'cancelled',
    'returned',
  ];

  normalized.orderDefaults.status = validStatuses.includes(normalized.orderDefaults.status)
    ? normalized.orderDefaults.status
    : 'new';
  normalized.orderDefaults.assignedTo = sanitizeString(normalized.orderDefaults.assignedTo, '');
  normalized.orderDefaults.marketer = sanitizeString(normalized.orderDefaults.marketer, '');
  normalized.orderDefaults.tags = sanitizeTags(normalized.orderDefaults.tags);

  normalized.notesDefaults.internal = sanitizeString(normalized.notesDefaults.internal, '');
  normalized.notesDefaults.easyPrint = sanitizeString(normalized.notesDefaults.easyPrint, '');
  normalized.notesDefaults.discussion = sanitizeString(normalized.notesDefaults.discussion, '');

  return normalized;
};

const readLocalStorage = (key: string): unknown => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return null;
  }
};

const writeLocalStorage = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to localStorage`, error);
  }
};

const formatNumberingDate = (date: Date, format: string): string => {
  const fullYear = date.getFullYear().toString();
  const shortYear = fullYear.slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  switch (format) {
    case 'YYYYMMDD':
      return `${fullYear}${month}${day}`;
    case 'YYMM':
      return `${shortYear}${month}`;
    case 'YYYYMM':
      return `${fullYear}${month}`;
    case 'YYYY':
      return fullYear;
    case 'YYMMDD':
    default:
      return `${shortYear}${month}${day}`;
  }
};

export const formatOrderNumber = (settings: InvoiceSettings, sequence: number, date: Date = new Date()): string => {
  const normalized = normalizeInvoiceSettings(settings);
  const normalizedSequence = Math.max(1, Math.floor(toNumber(sequence, normalized.numbering.nextNumber)));
  const padded = normalizedSequence.toString().padStart(Math.max(2, normalized.numbering.padding), '0');
  const datePart = normalized.numbering.includeDate
    ? formatNumberingDate(date, normalized.numbering.dateFormat)
    : '';

  return `${normalized.numbering.prefix || ''}${datePart}${padded}${normalized.numbering.suffix || ''}`;
};

export const getNextOrderNumberPreview = (): string => {
  const settings = getInvoiceSettings();
  return formatOrderNumber(settings, settings.numbering.nextNumber);
};

export const getDefaultCompanyInfo = (): CompanyInfo => cloneCompanyInfo(BASE_COMPANY_INFO);

export const getDefaultInvoiceSettings = (): InvoiceSettings => cloneInvoiceSettings(BASE_INVOICE_SETTINGS);

export const getCompanyInfo = (): CompanyInfo => {
  const stored = readLocalStorage(COMPANY_INFO_KEY);
  if (!stored) {
    return getDefaultCompanyInfo();
  }

  return cloneCompanyInfo({ ...BASE_COMPANY_INFO, ...(stored as Partial<CompanyInfo>) });
};

export const saveCompanyInfo = (info: CompanyInfo): void => {
  writeLocalStorage(COMPANY_INFO_KEY, cloneCompanyInfo(info));
};

export const resetCompanyInfo = (): CompanyInfo => {
  const defaultInfo = getDefaultCompanyInfo();
  saveCompanyInfo(defaultInfo);
  return defaultInfo;
};

export const getInvoiceSettings = (): InvoiceSettings => {
  const stored = readLocalStorage(INVOICE_SETTINGS_KEY) as Partial<InvoiceSettings> | null;
  const merged = mergeInvoiceSettings(BASE_INVOICE_SETTINGS, stored ?? undefined);
  return normalizeInvoiceSettings(merged);
};

export const saveInvoiceSettings = (settings: InvoiceSettings): void => {
  const normalized = normalizeInvoiceSettings(settings);
  writeLocalStorage(INVOICE_SETTINGS_KEY, normalized);
};

export const updateInvoiceSettings = (updates: Partial<InvoiceSettings>): InvoiceSettings => {
  const current = getInvoiceSettings();
  const merged = mergeInvoiceSettings(current, updates);
  const normalized = normalizeInvoiceSettings(merged);
  saveInvoiceSettings(normalized);
  return normalized;
};

export const resetInvoiceSettings = (): InvoiceSettings => {
  const defaults = getDefaultInvoiceSettings();
  saveInvoiceSettings(defaults);
  return defaults;
};

export const syncOrderCounterWithSettings = (nextNumber: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized = Math.max(1, Math.floor(nextNumber));
  writeLocalStorage(ORDER_COUNTER_KEY, normalized - 1);
};


