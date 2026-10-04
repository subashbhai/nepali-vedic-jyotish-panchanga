export type StoreCategoryKey = 
  | 'all' 
  | 'puja_samagri' 
  | 'karmakanda' 
  | 'jyotish' 
  | 'vastu' 
  | 'religious_books' 
  | 'puja_package' 
  | 'yantra' 
  | 'others'
  // 16 Vedic Karma Kanda Categories
  | 'sanskar_16'            // १. संस्कार → १६ संस्कार
  | 'vivah_karma'           // २. विवाह कर्मकाण्ड
  | 'grihapravesh_vastu'     // ३. गृहप्रवेश तथा वास्तु
  | 'nitya_puja'            // ४. नित्य पूजा
  | 'naimittik_puja'        // ५. नैमित्तिक पूजा
  | 'kamya_puja'            // ६. काम्य पूजा
  | 'graha_shanti'          // ७. ग्रहशान्ति
  | 'devadevi_puja'         // ८. देवदेवी पूजा
  | 'hom_havan'             // ९. होम तथा हवन
  | 'vrata_parva'           // १०. व्रत तथा पर्व
  | 'shraddha_pitri'        // ११. श्राद्ध तथा पितृकर्म
  | 'antyeshti_karma'       // १२. अन्त्येष्टि कर्म
  | 'kuldevata_puja'        // १३. कुलदेवता/कुलदेवी पूजा
  | 'tirtha_puja'           // १४. तीर्थ तथा विशेष पूजा
  | 'muhurta_jyotish'       // १५. मुहूर्त तथा ज्योतिषीय कर्म
  | 'vishesh_anushthan';    // १६. विशेष अनुष्ठान

export interface VedicCategoryOption {
  key: StoreCategoryKey;
  label: string;
  icon: string;
  description: string;
}

export const VEDIC_STORE_16_CATEGORIES: VedicCategoryOption[] = [
  { key: 'all', label: 'सबै सामग्री', icon: '✨', description: 'वैदिक पसलका सबै ५०+ सामग्रीहरू' },
  { key: 'sanskar_16', label: '१६ संस्कार', icon: '👶', description: 'गर्भाधानदेखि अन्त्येष्टिसम्मका १६ संस्कार' },
  { key: 'vivah_karma', label: 'विवाह कर्मकाण्ड', icon: '💍', description: 'विवाह, लग्न, स्वयंवर र सप्तपदी सामग्री' },
  { key: 'grihapravesh_vastu', label: 'गृहप्रवेश तथा वास्तु', icon: '🏠', description: 'भूमिपूजन, शिलान्यास, वास्तुशान्ति र नयाँ घर प्रवेश' },
  { key: 'graha_shanti', label: 'ग्रहशान्ति तथा दोषनिवारण', icon: '🪐', description: 'नवग्रह, कालसर्प, मंगलदोष, साढेसाती शान्ति' },
  { key: 'kamya_puja', label: 'काम्य पूजा (मनोकामना)', icon: '🌟', description: 'सन्तान, धन, व्यापार, परीक्षा, कार्यसिद्धि पूजा' },
  { key: 'shraddha_pitri', label: 'श्राद्ध तथा पितृकर्म', icon: '🕊️', description: 'सोह्रश्राद्ध, एकोदिष्ट, पार्वण, तर्पण एवं पिण्डदान' },
  { key: 'hom_havan', label: 'होम तथा हवन सामग्री', icon: '🔥', description: 'हवन कुण्ड, समिधा, गुग्गुल, घ्यू र सर्वौषधि' },
  { key: 'devadevi_puja', label: 'देवदेवी पूजा', icon: '🪔', description: 'गणेश, शिव, विष्णु, दुर्गा, हनुमान, लक्ष्मी पूजा' },
  { key: 'vishesh_anushthan', label: 'विशेष अनुष्ठान', icon: '🔱', description: 'चण्डी पाठ, महारुद्र, महामृत्युञ्जय, पुरश्चरण' },
  { key: 'nitya_puja', label: 'नित्य पूजा सामग्री', icon: '🌸', description: 'दैनिक पूजा, दीप, धूप, चन्दन, अगरबत्ती' },
  { key: 'naimittik_puja', label: 'नैमित्तिक पूजा', icon: '📜', description: 'विशेष अवसर र तिथिमा गरिने अनुष्ठान' },
  { key: 'vrata_parva', label: 'व्रत तथा पर्व सामग्री', icon: '🎉', description: 'दशैं, तिहार, शिवरात्रि, तीज, एकादशी' },
  { key: 'antyeshti_karma', label: 'अन्त्येष्टि कर्म', icon: '🌿', description: 'मृत्यु संस्कार, एकादशाह, द्वादशाह, सपिण्डीकरण' },
  { key: 'kuldevata_puja', label: 'कुलदेवता/कुलदेवी पूजा', icon: '🚩', description: 'कुल पूजा, देवाली, पितृकुल एवं मातृकुल' },
  { key: 'tirtha_puja', label: 'तीर्थ तथा विशेष पूजा', icon: '🌊', description: 'गया, काशी, पशुपति, मुक्तिनाथ तीर्थ संकल्प' },
  { key: 'religious_books', label: 'धार्मिक ग्रन्थ र पञ्चाङ्ग', icon: '📖', description: 'गीता, चण्डी, रुद्री, कर्मकाण्ड र पात्रो' },
  { key: 'jyotish', label: 'रुद्राक्ष, रत्न र यन्त्र', icon: '📿', description: 'नेपाली रुद्राक्ष, स्फटिक, श्रीयन्त्र, औंठी' },
];

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

