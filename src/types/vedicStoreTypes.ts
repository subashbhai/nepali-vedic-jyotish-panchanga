export type StoreCategoryKey = 
  | 'all' 
  | 'puja_samagri' 
  | 'karmakanda' 
  | 'jyotish' 
  | 'vastu' 
  | 'religious_books' 
  | 'puja_package' 
  | 'yantra' 
  | 'others';

export interface BookDetails {
  author: string;
  publisher: string;
  pages: number;
  language: 'नेपाली' | 'संस्कृत' | 'हिन्दी' | 'English';
  subject: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  nameNepali: string;
  nameEnglish: string;
  category: StoreCategoryKey;
  subCategory?: string;
  shortDescription: string;
  fullDescription: string;
  packageItems?: string[]; // Included items list for Puja Packages
  purchasePrice: number;
  sellingPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
  unit: string; // e.g., 'थान', 'प्याकेट', 'केजी', 'सेट', 'पुस्तक'
  weightGram?: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  galleryImages?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  bookDetails?: BookDetails;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryMethod = 'standard' | 'express' | 'store_pickup';
export type PaymentMethod = 'cod' | 'esewa' | 'cash' | 'store_pickup' | 'online' | 'bank_transfer';
export type OrderStatus = 
  | 'Order Placed' 
  | 'Payment Confirmed'
  | 'Order Confirmed' 
  | 'Preparing' 
  | 'Packed' 
  | 'Dispatched' 
  | 'Out for Delivery' 
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type OrderType = 'ONLINE' | 'OFFLINE_POS';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus | string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface EsewaPaymentSubmission {
  transactionId: string;
  paidAmount: number;
  paymentDate: string;
  paymentTime: string;
  slipUrl?: string; // base64 image or preview URL
  verificationStatus: 'Verification Pending' | 'Paid' | 'Rejected' | 'Reupload Requested';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  billNumber?: string; // Unique POS offline bill number e.g., OFF-2083-000001
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  isWalkIn?: boolean;
  gpsLocation?: { lat: number; lng: number };
  deliveryInstruction?: string;
  deliveryMethod: DeliveryMethod;
  deliveryCharge: number;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  amountReceived?: number; // Cash received in POS
  changeAmount?: number;   // Return change in POS
  salespersonName?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Verification Pending' | 'Paid' | 'Failed' | 'Rejected' | 'Refunded';
  esewaDetails?: EsewaPaymentSubmission;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  createdRole: 'Customer' | 'Staff' | 'Admin';
}

export interface StoreCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%, or 200 for Rs.200
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface StoreReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface DailyCashRegister {
  date: string; // YYYY-MM-DD
  openingCash: number;
  cashSales: number;
  cashRefunds: number;
  expectedClosingCash: number;
  actualClosingCash: number;
  difference: number;
  notes?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalOrderOrBillId: string;
  originalOrderOrBillNumber: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotalRefund: number;
  }[];
  totalRefundAmount: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  transactionType: 'Online Order' | 'Offline Sale' | 'Stock Adjustment' | 'Sales Return';
  quantityChange: number; // e.g., -2 or +5
  previousStock: number;
  newStock: number;
  referenceId?: string; // Order ID or Return ID
  performedBy: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: StoreUserRole;
  action: string;
  details: string;
  timestamp: string;
}

export type StoreUserRole = 'SUPER_ADMIN' | 'STORE_ADMIN' | 'STORE_STAFF' | 'CUSTOMER';

