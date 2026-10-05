import {
  Product,
  StoreCoupon,
  StoreOrder,
  StoreReview,
  CartItem,
  StoreCategoryKey,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
  EsewaPaymentSubmission,
  DailyCashRegister,
  SalesReturn,
  InventoryLog,
  AuditLog,
  StoreUserRole
} from '../types/vedicStoreTypes';
import { PUJA_SAMAGRI_GALLERY_DATABASE } from '../utils/pujaSamagriGalleryEngine';

const STORAGE_KEYS = {
  PRODUCTS: 'balananda_vedic_products_v7',
  ORDERS: 'balananda_vedic_orders_v1',
  COUPONS: 'balananda_vedic_coupons_v1',
  CART: 'balananda_vedic_cart_v1',
  WISHLIST: 'balananda_vedic_wishlist_v1',
  REVIEWS: 'balananda_vedic_reviews_v1',
  AUDIT_LOGS: 'balananda_vedic_audit_logs_v1',
  INVENTORY_LOGS: 'balananda_vedic_inventory_logs_v1',
  CASH_REGISTER: 'balananda_vedic_cash_register_v1',
  SALES_RETURNS: 'balananda_vedic_sales_returns_v1',
};

const getGalleryImg = (id: string, fallbackIdx = 0): string => {
  const found = PUJA_SAMAGRI_GALLERY_DATABASE.find(i => i.id === id);
  return found?.imageUrl || PUJA_SAMAGRI_GALLERY_DATABASE[fallbackIdx]?.imageUrl || '';
};

// 50+ Comprehensive Demo Products Generated from Puja Samagri & 16 Sanskar Database
export const INITIAL_DEMO_PRODUCTS: Product[] = PUJA_SAMAGRI_GALLERY_DATABASE.map((item, idx) => ({
  id: 'prod_' + item.id,
  sku: 'VDC-' + item.category.substring(0, 3).toUpperCase() + '-' + String(idx + 1).padStart(3, '0'),
  barcode: '890100' + String(idx + 1).padStart(6, '0'),
  nameNepali: item.nameNepali,
  nameEnglish: item.nameEnglish,
  category: item.category,
  subCategory: item.categoryNameNepali,
  shortDescription: item.description,
  fullDescription: item.nameNepali + ' सनातन वैदिक परम्परा र शास्त्रोक्त विधि अनुसार सम्पन्न गर्नका लागि आवश्यक सम्पूर्ण शुद्ध एवं प्रमाणित सामग्रीहरूको तयारी प्याकेज हो। यसमा समावेश सम्पूर्ण सामग्रीहरू उच्च गुणस्तरका र कर्मकाण्ड विधि अनुरूप तयार गरिएका छन्।\n\nमुख्य सामग्री सूची:\n' + item.samagriList.map((s, i) => (i + 1) + '. ' + s).join('\n') + '\n\n(नोट: व्यवस्थापकले आवश्यकता अनुसार एडमिन ड्यासबोर्डबाट सामग्रीहरूको सूची, मूल्य र विवरण सहजै थपघट वा सम्पादन गर्न सक्नुहुन्छ।)',
  packageItems: item.samagriList,
  purchasePrice: Math.round((item.suggestedPrice || 1000) * 0.7),
  sellingPrice: item.suggestedPrice || 1000,
  discountPrice: Math.round((item.suggestedPrice || 1000) * 0.9),
  stockQuantity: idx === 12 ? 0 : idx === 8 ? 2 : 25 + (idx % 15),
  minStockLevel: 4,
  supplier: 'बालानन्द वैदिक सामग्री भण्डार, काठमाडौं',
  unit: item.category === 'religious_books' ? 'पुस्तक' : (item.category === 'puja_samagri' || item.category === 'nitya_puja') ? 'प्याकेट' : 'सेट',
  weightGram: 1200 + (idx * 40),
  rating: Number((4.7 + ((idx % 4) * 0.1)).toFixed(1)),
  reviewsCount: 15 + (idx * 2),
  imageUrl: item.imageUrl,
  isActive: true,
  isFeatured: idx < 6 || idx === 10 || idx === 14 || idx === 20,
  isPopular: idx % 3 === 0,
  isBestSeller: idx < 8,
}));

// Initial Demo Coupons
export const INITIAL_DEMO_COUPONS: StoreCoupon[] = [
  {
    id: 'cup_wel10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1000,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usedCount: 14,
    isActive: true,
  },
  {
    id: 'cup_puja20',
    code: 'PUJA20',
    type: 'percentage',
    value: 15,
    minOrderAmount: 2000,
    expiryDate: '2026-11-30',
    usageLimit: 50,
    usedCount: 8,
    isActive: true,
  },
  {
    id: 'cup_book15',
    code: 'BOOK15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 500,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 32,
    isActive: true,
  },
  {
    id: 'cup_vedic100',
    code: 'VEDIC100',
    type: 'fixed',
    value: 100,
    minOrderAmount: 1500,
    expiryDate: '2026-12-31',
    usageLimit: 50,
    usedCount: 5,
    isActive: true,
  }
];

// Initial Sample Orders for Dashboard Metrics
export const INITIAL_DEMO_ORDERS: StoreOrder[] = [
  {
    id: 'ord_1001',
    orderNumber: 'VP-2026-0801',
    orderType: 'ONLINE',
    customerName: 'रामप्रसाद शर्मा',
    customerPhone: '9851023456',
    customerAddress: 'नयाँ बानेश्वर, काठमाडौँ',
    deliveryMethod: 'standard',
    deliveryCharge: 150,
    items: [
      { productId: 'prod_pkg_grihapravesh', productName: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट (Package)', unitPrice: 2200, quantity: 1, subtotal: 2200 },
      { productId: 'prod_ghee_cow', productName: 'हिमाली शुद्ध गाईको घ्यू', unitPrice: 1200, quantity: 1, subtotal: 1200 },
    ],
    subtotal: 3400,
    discountAmount: 100,
    couponCode: 'VEDIC100',
    totalAmount: 3450,
    paymentMethod: 'cod',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-08 10:15 AM' },
      { status: 'Order Confirmed', timestamp: '2026-08-08 10:30 AM' },
      { status: 'Preparing', timestamp: '2026-08-08 11:00 AM' },
      { status: 'Packed', timestamp: '2026-08-08 01:00 PM' },
      { status: 'Dispatched', timestamp: '2026-08-08 02:30 PM' },
      { status: 'Out for Delivery', timestamp: '2026-08-08 04:00 PM' },
      { status: 'Delivered', timestamp: '2026-08-08 05:15 PM' },
    ],
    createdAt: '2026-08-08T10:15:00Z',
    createdRole: 'Customer',
  },
  {
    id: 'ord_1002',
    orderNumber: 'VP-2026-0802',
    orderType: 'OFFLINE_POS',
    customerName: 'हरिहर ज्ञवाली (काउन्टर बिक्री)',
    customerPhone: '9841234567',
    customerAddress: 'काउन्टर पिकअप - बालानन्द पसल',
    deliveryMethod: 'store_pickup',
    deliveryCharge: 0,
    items: [
      { productId: 'prod_bk_gita', productName: 'श्रीमद्भगवद्गीता (नेपाली अनुवाद)', unitPrice: 550, quantity: 2, subtotal: 1100 },
      { productId: 'prod_rudraksha_5m', productName: '५ मुखी नेपाली रुद्राक्ष माला', unitPrice: 850, quantity: 1, subtotal: 850 },
    ],
    subtotal: 1950,
    discountAmount: 150,
    totalAmount: 1800,
    paymentMethod: 'store_pickup',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-09 09:00 AM' },
      { status: 'Delivered', timestamp: '2026-08-09 09:05 AM' }
    ],
    createdAt: '2026-08-09T09:00:00Z',
    createdRole: 'Staff',
  },
  {
    id: 'ord_1003',
    orderNumber: 'VP-2026-0803',
    orderType: 'ONLINE',
    customerName: 'सरिता केसी',
    customerPhone: '9801987654',
    customerAddress: 'ललितपुर - कुपण्डोल',
    deliveryMethod: 'express',
    deliveryCharge: 250,
    items: [
      { productId: 'prod_pkg_rudra', productName: 'रुद्राभिषेक तथा शिवपूजा सामग्री Package', unitPrice: 1250, quantity: 1, subtotal: 1250 },
      { productId: 'prod_kapoor_bhimseni', productName: 'भीमसेनी शुद्ध प्राकृतिक कपूर', unitPrice: 300, quantity: 2, subtotal: 600 }
    ],
    subtotal: 1850,
    discountAmount: 0,
    totalAmount: 2100,
    paymentMethod: 'online',
    paymentStatus: 'Paid',
    orderStatus: 'Out for Delivery',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-09 10:00 AM' },
      { status: 'Order Confirmed', timestamp: '2026-08-09 10:10 AM' },
      { status: 'Preparing', timestamp: '2026-08-09 10:30 AM' },
      { status: 'Dispatched', timestamp: '2026-08-09 11:15 AM' },
      { status: 'Out for Delivery', timestamp: '2026-08-09 11:30 AM' },
    ],
    createdAt: '2026-08-09T10:00:00Z',
    createdRole: 'Customer',
  }
];

// In-memory Caches
let memoryVedicProducts: Product[] | null = null;
let memoryVedicOrders: StoreOrder[] | null = null;
let memoryVedicCoupons: StoreCoupon[] | null = null;
let memoryVedicCart: CartItem[] | null = null;
let memoryVedicWishlist: string[] | null = null;

// Helper Storage Functions
export const getStoredProducts = (): Product[] => {
  if (memoryVedicProducts) return memoryVedicProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      memoryVedicProducts = INITIAL_DEMO_PRODUCTS;
      return INITIAL_DEMO_PRODUCTS;
    }
    memoryVedicProducts = JSON.parse(raw);
    return memoryVedicProducts!;
  } catch (e) {
    console.error('Failed to load products:', e);
    return INITIAL_DEMO_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  memoryVedicProducts = products;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

export const getStoredOrders = (): StoreOrder[] => {
  if (memoryVedicOrders) return memoryVedicOrders;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
      memoryVedicOrders = INITIAL_DEMO_ORDERS;
      return INITIAL_DEMO_ORDERS;
    }
    memoryVedicOrders = JSON.parse(raw);
    return memoryVedicOrders!;
  } catch (e) {
    console.error('Failed to load orders:', e);
    return INITIAL_DEMO_ORDERS;
  }
};

export const saveOrders = (orders: StoreOrder[]): void => {
  memoryVedicOrders = orders;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

export const getStoredCoupons = (): StoreCoupon[] => {
  if (memoryVedicCoupons) return memoryVedicCoupons;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_DEMO_COUPONS));
      memoryVedicCoupons = INITIAL_DEMO_COUPONS;
      return INITIAL_DEMO_COUPONS;
    }
    memoryVedicCoupons = JSON.parse(raw);
    return memoryVedicCoupons!;
  } catch (e) {
    console.error('Failed to load coupons:', e);
    return INITIAL_DEMO_COUPONS;
  }
};

export const saveCoupons = (coupons: StoreCoupon[]): void => {
  memoryVedicCoupons = coupons;
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons:', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  if (memoryVedicCart) return memoryVedicCart;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    memoryVedicCart = raw ? JSON.parse(raw) : [];
    return memoryVedicCart!;
  } catch (e) {
    console.error('Failed to load cart:', e);
    return [];
  }
};

export const saveCart = (cart: CartItem[]): void => {
  memoryVedicCart = cart;
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
};

export const getStoredWishlist = (): string[] => {
  if (memoryVedicWishlist) return memoryVedicWishlist;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    memoryVedicWishlist = raw ? JSON.parse(raw) : [];
    return memoryVedicWishlist!;
  } catch (e) {
    console.error('Failed to load wishlist:', e);
    return [];
  }
};

export const saveWishlist = (wishlistProductIds: string[]): void => {
  memoryVedicWishlist = wishlistProductIds;
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistProductIds));
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [
      {
        id: 'aud_1',
        user: 'मनिष भट्टराई',
        role: 'SUPER_ADMIN',
        action: 'System Initialized',
        details: 'वैदिक पसल मोड्युल सुचारु भयो',
        timestamp: new Date().toLocaleString('ne-NP')
      }
    ];
  } catch (e) {
    return [];
  }
};

export const saveAuditLogs = (logs: AuditLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 300)));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
};

export const addAuditLog = (
  user: string,
  role: StoreUserRole,
  action: string,
  details: string
): void => {
  const logs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user,
    role,
    action,
    details,
    timestamp: new Date().toLocaleString('ne-NP')
  };
  saveAuditLogs([newLog, ...logs]);
};

export const getStoredInventoryLogs = (): InventoryLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addInventoryLog = (
  productId: string,
  productName: string,
  transactionType: InventoryLog['transactionType'],
  quantityChange: number,
  previousStock: number,
  newStock: number,
  performedBy: string,
  referenceId?: string
): void => {
  try {
    const logs = getStoredInventoryLogs();
    const newLog: InventoryLog = {
      id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId,
      productName,
      transactionType,
      quantityChange,
      previousStock,
      newStock,
      referenceId,
      performedBy,
      timestamp: new Date().toLocaleString('ne-NP')
    };
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify([newLog, ...logs].slice(0, 500)));
  } catch (e) {
    console.error('Failed to log inventory:', e);
  }
};

export const getStoredDailyCashRegister = (): DailyCashRegister => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_REGISTER);
    if (raw) {
      const parsed: DailyCashRegister = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
  } catch (e) {
    console.error('Failed to load cash register:', e);
  }

  // Calculate today's cash sales from existing orders
  const orders = getStoredOrders();
  const todayCashSales = orders
    .filter(o => o.orderType === 'OFFLINE_POS' && (o.paymentMethod === 'cash' || o.paymentMethod === 'store_pickup') && o.createdAt.startsWith(today))
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const newReg: DailyCashRegister = {
    date: today,
    openingCash: 2000, // Default opening float
    cashSales: todayCashSales,
    cashRefunds: 0,
    expectedClosingCash: 2000 + todayCashSales,
    actualClosingCash: 2000 + todayCashSales,
    difference: 0,
    notes: 'दैनिक काउन्टर ओपनिङ क्यास रु. २,००० सेट गरिएको छ।',
    updatedBy: 'काउन्टर म्यानेजर',
    updatedAt: new Date().toLocaleString('ne-NP')
  };
  localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(newReg));
  return newReg;
};

export const saveDailyCashRegister = (reg: DailyCashRegister): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(reg));
  } catch (e) {
    console.error('Failed to save cash register:', e);
  }
};

export const getStoredSalesReturns = (): SalesReturn[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES_RETURNS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveSalesReturns = (returns: SalesReturn[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES_RETURNS, JSON.stringify(returns));
  } catch (e) {
    console.error('Failed to save sales returns:', e);
  }
};

// Check if an eSewa Transaction ID is unique across all orders
export const validateTransactionIdUnique = (transactionId: string, currentOrderId?: string): boolean => {
  if (!transactionId || !transactionId.trim()) return true;
  const cleanTx = transactionId.trim().toLowerCase();
  const orders = getStoredOrders();
  
  const existing = orders.find(o => {
    if (currentOrderId && o.id === currentOrderId) return false;
    return o.esewaDetails?.transactionId?.trim().toLowerCase() === cleanTx;
  });

  return !existing;
};

// Submit eSewa Payment details from Customer
export const submitEsewaPayment = (
  orderId: string,
  submission: {
    transactionId: string;
    paidAmount: number;
    paymentDate: string;
    paymentTime: string;
    slipUrl?: string;
  }
): { success: boolean; message: string; order?: StoreOrder } => {
  if (!validateTransactionIdUnique(submission.transactionId, orderId)) {
    return {
      success: false,
      message: 'यो eSewa Transaction ID पहिले नै प्रयोग भइसकेको छ।'
    };
  }

  const orders = getStoredOrders();
  let updatedOrder: StoreOrder | undefined;

  const updatedOrders = orders.map(ord => {
    if (ord.id === orderId) {
      const esewaDetails: EsewaPaymentSubmission = {
        ...submission,
        verificationStatus: 'Verification Pending',
        submittedAt: new Date().toLocaleString('ne-NP')
      };

      updatedOrder = {
        ...ord,
        paymentMethod: 'esewa',
        paymentStatus: 'Verification Pending',
        esewaDetails,
        statusHistory: [
          ...ord.statusHistory,
          {
            status: 'Verification Pending',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `eSewa भुक्तानी विवरण सबमिट गरियो (Txn ID: ${submission.transactionId})`
          }
        ]
      };
      return updatedOrder;
    }
    return ord;
  });

  if (updatedOrder) {
    saveOrders(updatedOrders);
    addAuditLog(
      updatedOrder.customerName,
      'CUSTOMER',
      'eSewa Payment Submitted',
      `Order ${updatedOrder.orderNumber} को लागि eSewa Txn: ${submission.transactionId} र रकम रु. ${submission.paidAmount} विवरण सबमिट गरियो`
    );
    return { success: true, message: 'eSewa भुक्तानी विवरण सफलतापूर्वक सबमिट भयो। एडमिन प्रमाणीकरण बाँकी छ।', order: updatedOrder };
  }

  return { success: false, message: 'अर्डर भेटिएन।' };
};

// Admin verify eSewa Payment
export const verifyEsewaPayment = (
  orderId: string,
  action: 'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD',
  adminName: string = 'स्टोर एडमिन',
  rejectionReason?: string
): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId && ord.esewaDetails) {
      let newVerificationStatus: EsewaPaymentSubmission['verificationStatus'] = 'Verification Pending';
      let newPaymentStatus = ord.paymentStatus;
      let newOrderStatus = ord.orderStatus;
      let noteStr = '';

      if (action === 'APPROVE') {
        newVerificationStatus = 'Paid';
        newPaymentStatus = 'Paid';
        newOrderStatus = 'Payment Confirmed';
        noteStr = `eSewa भुक्तानी स्वीकृत (Approved by ${adminName})`;
      } else if (action === 'REJECT') {
        newVerificationStatus = 'Rejected';
        newPaymentStatus = 'Rejected';
        noteStr = `eSewa भुक्तानी अस्वीकृत (Rejected: ${rejectionReason || 'अमान्य विवरण'})`;
      } else {
        newVerificationStatus = 'Reupload Requested';
        noteStr = `नयाँ Payment Slip re-upload गर्न अनुरोध गरिएको छ।`;
      }

      const updatedEsewa: EsewaPaymentSubmission = {
        ...ord.esewaDetails,
        verificationStatus: newVerificationStatus,
        verifiedBy: adminName,
        verifiedAt: new Date().toLocaleString('ne-NP'),
        rejectionReason: rejectionReason || ord.esewaDetails.rejectionReason
      };

      const updatedOrder: StoreOrder = {
        ...ord,
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
        esewaDetails: updatedEsewa,
        statusHistory: [
          ...ord.statusHistory,
          {
            status: action === 'APPROVE' ? 'Payment Confirmed' : action === 'REJECT' ? 'Rejected' : 'Reupload Requested',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: noteStr,
            updatedBy: adminName
          }
        ]
      };

      addAuditLog(
        adminName,
        'STORE_ADMIN',
        `eSewa Payment ${action}`,
        `Order ${ord.orderNumber} को eSewa भुक्तानी status: ${newVerificationStatus} गरियो।`
      );

      return updatedOrder;
    }
    return ord;
  });

  saveOrders(updated);
  return updated;
};

// Admin confirm COD Payment Received
export const markCodPaymentReceived = (orderId: string, adminName: string = 'स्टोर एडमिन'): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      const updatedOrder: StoreOrder = {
        ...ord,
        paymentStatus: 'Paid',
        statusHistory: [
          ...ord.statusHistory,
          {
            status: 'Paid',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `Cash on Delivery भुक्तानी प्राप्त भयो (${adminName} द्वारा)`,
            updatedBy: adminName
          }
        ]
      };

      addAuditLog(
        adminName,
        'STORE_ADMIN',
        'COD Payment Confirmed',
        `Order ${ord.orderNumber} को COD रकम रु. ${ord.totalAmount} बुझिलिएको दर्ता भयो।`
      );

      return updatedOrder;
    }
    return ord;
  });

  saveOrders(updated);
  return updated;
};

// Generate Unique POS Offline Bill Number
export const generateOfflineBillNumber = (): string => {
  const orders = getStoredOrders();
  const offlineOrders = orders.filter(o => o.billNumber);
  const nextNum = offlineOrders.length + 1;
  const currentFiscalYear = '2083'; // Nepali Fiscal Year 2082/83
  return `OFF-${currentFiscalYear}-${String(nextNum).padStart(6, '0')}`;
};

// Create / Submit a new Online Order
export const createOnlineOrder = (
  cart: CartItem[],
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    gpsLocation?: { lat: number; lng: number };
    deliveryInstruction?: string;
  },
  deliveryMethod: DeliveryMethod,
  deliveryCharge: number,
  paymentMethod: PaymentMethod,
  appliedCoupon?: StoreCoupon
): StoreOrder => {
  const products = getStoredProducts();
  const orders = getStoredOrders();

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const now = new Date();
  const orderNumStr = `VP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: StoreOrder = {
    id: `ord_${Date.now()}`,
    orderNumber: orderNumStr,
    orderType: 'ONLINE',
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    customerAddress: customerInfo.address,
    gpsLocation: customerInfo.gpsLocation,
    deliveryInstruction: customerInfo.deliveryInstruction,
    deliveryMethod,
    deliveryCharge,
    items: cart.map(item => ({
      productId: item.product.id,
      productName: item.product.nameNepali,
      unitPrice: item.product.discountPrice ?? item.product.sellingPrice,
      quantity: item.quantity,
      subtotal: (item.product.discountPrice ?? item.product.sellingPrice) * item.quantity
    })),
    subtotal,
    discountAmount,
    couponCode: appliedCoupon?.code,
    totalAmount: grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'online' || paymentMethod === 'esewa' ? 'Pending' : 'Pending',
    orderStatus: 'Order Placed',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: new Date().toLocaleString('ne-NP'),
        note: 'ग्राहकद्वारा अनलाइन अर्डर दर्ता भयो'
      }
    ],
    createdAt: new Date().toISOString(),
    createdRole: 'Customer'
  };

  // Decrement Stock & Log Inventory
  const updatedProducts = products.map(p => {
    const cartMatch = cart.find(ci => ci.product.id === p.id);
    if (cartMatch) {
      const newStock = Math.max(0, p.stockQuantity - cartMatch.quantity);
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Online Order',
        -cartMatch.quantity,
        p.stockQuantity,
        newStock,
        customerInfo.name,
        newOrder.id
      );
      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);
  saveOrders([newOrder, ...orders]);

  addAuditLog(
    customerInfo.name,
    'CUSTOMER',
    'Online Order Placed',
    `नयाँ अर्डर ${orderNumStr} (रु. ${grandTotal.toLocaleString('ne-NP')}) दर्ता भयो`
  );

  // If coupon used, update coupon used count
  if (appliedCoupon) {
    const coupons = getStoredCoupons();
    const updatedCoupons = coupons.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c);
    saveCoupons(updatedCoupons);
  }

  // Clear Cart
  saveCart([]);

  return newOrder;
};

// Process Offline POS Counter Sale
export const processPOSSale = (
  items: CartItem[],
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
    isWalkIn?: boolean;
  },
  discountAmount: number = 0,
  paymentMethod: PaymentMethod = 'cash',
  amountReceived: number = 0,
  salespersonName: string = 'काउन्टर प्रतिनिधि',
  esewaTxnId?: string
): StoreOrder => {
  const products = getStoredProducts();
  const orders = getStoredOrders();

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, amountReceived - grandTotal) : 0;

  const now = new Date();
  const orderNumStr = `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const billNumStr = generateOfflineBillNumber();

  let esewaDetails: EsewaPaymentSubmission | undefined = undefined;
  if (paymentMethod === 'esewa' && esewaTxnId) {
    esewaDetails = {
      transactionId: esewaTxnId,
      paidAmount: grandTotal,
      paymentDate: now.toISOString().split('T')[0],
      paymentTime: now.toLocaleTimeString('ne-NP'),
      verificationStatus: 'Paid',
      verifiedBy: salespersonName,
      verifiedAt: new Date().toLocaleString('ne-NP'),
      submittedAt: new Date().toLocaleString('ne-NP')
    };
  }

  const posOrder: StoreOrder = {
    id: `ord_pos_${Date.now()}`,
    orderNumber: orderNumStr,
    billNumber: billNumStr,
    orderType: 'OFFLINE_POS',
    customerName: customerInfo.name.trim() || (customerInfo.isWalkIn ? 'काउन्टर ग्राहक (Walk-in)' : 'अज्ञात ग्राहक'),
    customerPhone: customerInfo.phone || '',
    customerAddress: customerInfo.address || 'बालानन्द स्टोर काउन्टर',
    isWalkIn: customerInfo.isWalkIn ?? true,
    deliveryMethod: 'store_pickup',
    deliveryCharge: 0,
    items: items.map(item => ({
      productId: item.product.id,
      productName: item.product.nameNepali,
      unitPrice: item.product.discountPrice ?? item.product.sellingPrice,
      quantity: item.quantity,
      subtotal: (item.product.discountPrice ?? item.product.sellingPrice) * item.quantity
    })),
    subtotal,
    discountAmount,
    totalAmount: grandTotal,
    amountReceived,
    changeAmount,
    salespersonName,
    paymentMethod,
    paymentStatus: 'Paid',
    esewaDetails,
    orderStatus: 'Delivered',
    statusHistory: [
      {
        status: 'Delivered',
        timestamp: new Date().toLocaleString('ne-NP'),
        note: `पसल काउन्टरमा नगद/eSewa बिक्री बिल No: ${billNumStr} जारी गरियो`,
        updatedBy: salespersonName
      }
    ],
    createdAt: new Date().toISOString(),
    createdRole: 'Staff'
  };

  // Decrement Stock & Log Inventory
  const updatedProducts = products.map(p => {
    const cartMatch = items.find(ci => ci.product.id === p.id);
    if (cartMatch) {
      const newStock = Math.max(0, p.stockQuantity - cartMatch.quantity);
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Offline Sale',
        -cartMatch.quantity,
        p.stockQuantity,
        newStock,
        salespersonName,
        billNumStr
      );
      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);
  saveOrders([posOrder, ...orders]);

  // Update Cash Register if cash sale
  if (paymentMethod === 'cash' || paymentMethod === 'store_pickup') {
    const reg = getStoredDailyCashRegister();
    const updatedReg: DailyCashRegister = {
      ...reg,
      cashSales: reg.cashSales + grandTotal,
      expectedClosingCash: reg.openingCash + reg.cashSales + grandTotal - reg.cashRefunds,
      actualClosingCash: reg.openingCash + reg.cashSales + grandTotal - reg.cashRefunds,
      updatedAt: new Date().toLocaleString('ne-NP')
    };
    saveDailyCashRegister(updatedReg);
  }

  addAuditLog(
    salespersonName,
    'STORE_STAFF',
    'POS Bill Created',
    `काउन्टर बिल ${billNumStr} (रु. ${grandTotal.toLocaleString('ne-NP')}) सफलतापूर्वक जारी भयो`
  );

  return posOrder;
};

// Process Sales Return
export const processSalesReturn = (
  originalOrderId: string,
  returnedItems: { productId: string; quantity: number }[],
  reason: string,
  adminName: string = 'स्टोर एडमिन'
): { success: boolean; message: string; returnRecord?: SalesReturn } => {
  const orders = getStoredOrders();
  const products = getStoredProducts();
  const order = orders.find(o => o.id === originalOrderId || o.billNumber === originalOrderId);

  if (!order) {
    return { success: false, message: 'सम्बन्धित अर्डर/बिल भेटिएन।' };
  }

  let totalRefund = 0;
  const returnItemDetails: SalesReturn['items'] = [];

  const updatedProducts = products.map(p => {
    const retMatch = returnedItems.find(ri => ri.productId === p.id);
    if (retMatch && retMatch.quantity > 0) {
      const orderItem = order.items.find(oi => oi.productId === p.id);
      const unitRate = orderItem ? orderItem.unitPrice : p.sellingPrice;
      const subtotal = unitRate * retMatch.quantity;
      totalRefund += subtotal;

      returnItemDetails.push({
        productId: p.id,
        productName: p.nameNepali,
        quantity: retMatch.quantity,
        unitPrice: unitRate,
        subtotalRefund: subtotal
      });

      const newStock = p.stockQuantity + retMatch.quantity;
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Sales Return',
        retMatch.quantity,
        p.stockQuantity,
        newStock,
        adminName,
        order.billNumber || order.orderNumber
      );

      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);

  const returns = getStoredSalesReturns();
  const returnRecord: SalesReturn = {
    id: `ret_${Date.now()}`,
    returnNumber: `RET-${Date.now().toString().slice(-6)}`,
    originalOrderOrBillId: order.id,
    originalOrderOrBillNumber: order.billNumber || order.orderNumber,
    customerName: order.customerName,
    items: returnItemDetails,
    totalRefundAmount: totalRefund,
    reason,
    createdAt: new Date().toISOString(),
    createdBy: adminName
  };

  saveSalesReturns([returnRecord, ...returns]);

  // Update order status if full return
  const updatedOrders = orders.map(o => {
    if (o.id === order.id) {
      return {
        ...o,
        orderStatus: 'Returned' as OrderStatus,
        paymentStatus: 'Refunded' as const,
        statusHistory: [
          ...o.statusHistory,
          {
            status: 'Returned' as OrderStatus,
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `बिक्री फिर्ता दर्ता भयो (फिर्ता रकम रु. ${totalRefund}) - कारण: ${reason}`,
            updatedBy: adminName
          }
        ]
      };
    }
    return o;
  });

  saveOrders(updatedOrders);

  addAuditLog(
    adminName,
    'STORE_ADMIN',
    'Sales Return Processed',
    `बिल/अर्डर ${order.billNumber || order.orderNumber} बाट रु. ${totalRefund} को बिक्री फिर्ता स्वीकृत भयो`
  );

  return { success: true, message: 'बिक्री फिर्ता प्रक्रिया र स्टक रिस्टोर सम्पन्न भयो।', returnRecord };
};

// Update Status of Order
export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  adminName: string = 'स्टोर एडमिन'
): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      const history = [...ord.statusHistory, { status: newStatus, timestamp: new Date().toLocaleString('ne-NP'), note, updatedBy: adminName }];
      const paymentStatus = newStatus === 'Delivered' ? ('Paid' as const) : ord.paymentStatus;
      
      addAuditLog(
        adminName,
        'STORE_ADMIN',
        'Order Status Change',
        `अर्डर ${ord.orderNumber} को स्थिति [${newStatus}] मा परिवर्तन गरियो।`
      );

      return {
        ...ord,
        orderStatus: newStatus,
        paymentStatus,
        statusHistory: history
      };
    }
    return ord;
  });
  saveOrders(updated);
  return updated;
};

// Reset Demo Data
export const resetStoreDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DEMO_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_DEMO_COUPONS));
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.INVENTORY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.CASH_REGISTER);
  localStorage.removeItem(STORAGE_KEYS.SALES_RETURNS);
};
