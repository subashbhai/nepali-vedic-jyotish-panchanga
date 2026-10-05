import React, { useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  StoreCoupon,
  StoreOrder,
  StoreCategoryKey,
  StoreUserRole
} from '../../types/vedicStoreTypes';
import {
  getStoredProducts,
  getStoredOrders,
  getStoredCoupons,
  getStoredCart,
  saveCart,
  getStoredWishlist,
  saveWishlist,
} from '../../db/vedicStore';
import { ProductCard } from './ProductCard';
import { ProductDetailsModal } from './ProductDetailsModal';
import { CartAndCheckoutModal } from './CartAndCheckoutModal';
import { BookSectionView } from './BookSectionView';
import { OfflinePOSView } from './OfflinePOSView';
import { OrderTrackingView } from './OrderTrackingView';
import { StoreAdminDashboard } from './StoreAdminDashboard';
import { InvoiceModal } from './InvoiceModal';
import { YajamanCustomerDashboard } from '../auth/YajamanCustomerDashboard';
import { SuperAdminApprovalCenter } from '../auth/SuperAdminApprovalCenter';
import { RBACAuthModal } from '../auth/RBACAuthModal';
import { getActiveRBACSession, RBACSession, clearRBACSession } from '../../db/rbacStore';
import { handlePhoneticInputKeyDown } from '../../utils/nepaliTransliteration';

import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  Package,
  BookOpen,
  Barcode,
  BarChart2,
  Sparkles,
  SlidersHorizontal,
  X,
  CheckCircle,
  Truck,
  ShieldCheck,
  Star,
  UserCheck,
  Home
} from 'lucide-react';

interface VedicPasalMainViewProps {
  onNavigateHome?: () => void;
  initialTab?: 'home' | 'books' | 'cart' | 'wishlist' | 'my_orders' | 'pos' | 'admin';
  isStandalone?: boolean;
}

export const VedicPasalMainView: React.FC<VedicPasalMainViewProps> = ({ onNavigateHome, initialTab, isStandalone }) => {
  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [coupons, setCoupons] = useState<StoreCoupon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Main Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'home' | 'books' | 'cart' | 'wishlist' | 'my_orders' | 'pos' | 'admin'>(initialTab || 'home');

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoreCategoryKey>('all');

  // Modals & Auth State
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<StoreOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Active RBAC Session
  const [rbacSession, setRbacSession] = useState<RBACSession | null>(getActiveRBACSession());
  const [isRBACAuthModalOpen, setIsRBACAuthModalOpen] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  useEffect(() => {
    setRbacSession(getActiveRBACSession());
  }, [activeTab]);

  const handleTabChange = (targetTab: 'home' | 'books' | 'cart' | 'wishlist' | 'my_orders' | 'pos' | 'admin') => {
    setAccessDeniedMsg(null);

    // Route Protection for Protected Dashboards
    if (targetTab === 'pos') {
      const sess = getActiveRBACSession();
      if (!sess) {
        setIsRBACAuthModalOpen(true);
        return;
      }
      if (sess.role !== 'POS_STAFF' && sess.role !== 'STORE_ADMIN' && sess.role !== 'SUPER_ADMIN') {
        setAccessDeniedMsg('अनधिकृत पहुँच (Access Denied): काउन्टर POS प्रयोग गर्न "POS Staff" वा "Store Admin" को अनुमति चाहिन्छ।');
        return;
      }
    }

    if (targetTab === 'admin') {
      const sess = getActiveRBACSession();
      if (!sess) {
        setIsRBACAuthModalOpen(true);
        return;
      }
      if (sess.role !== 'STORE_ADMIN' && sess.role !== 'SUPER_ADMIN') {
        setAccessDeniedMsg('अनधिकृत पहुँच (Access Denied): स्टोर एडमिन ड्यासबोर्ड खोल्न "Store Admin" वा "Super Admin" को आधिकारिक खाता चाहिन्छ।');
        return;
      }
    }

    setActiveTab(targetTab);
  };

  // Load Initial Data
  const refreshAllData = () => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setCoupons(getStoredCoupons());
    setCart(getStoredCart());
    setWishlist(getStoredWishlist());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Sync Cart Updates
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stockQuantity <= 0) {
      alert('सामग्रीको स्टक समाप्त भएको छ।');
      return;
    }

    const updatedCart = [...cart];
    const index = updatedCart.findIndex(item => item.product.id === product.id);

    if (index > -1) {
      const newQty = updatedCart[index].quantity + quantity;
      if (newQty > product.stockQuantity) {
        alert('स्टकमा उपलब्ध भन्दा बढी परिमाण थप्न सकिँदैन।');
        return;
      }
      updatedCart[index].quantity = newQty;
    } else {
      updatedCart.push({ product, quantity });
    }

    setCart(updatedCart);
    saveCart(updatedCart);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsCartModalOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updated = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(updated);
    saveCart(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([]);
  };

  // Sync Wishlist Updates
  const handleToggleWishlist = (product: Product) => {
    let updated: string[];
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter(id => id !== product.id);
    } else {
      updated = [...wishlist, product.id];
    }
    setWishlist(updated);
    saveWishlist(updated);
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    if (!p.isActive) return false;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'puja_package' && p.category !== 'puja_package') return false;
      if (selectedCategory === 'religious_books' && p.category !== 'religious_books' && !p.bookDetails) return false;
      if (selectedCategory === 'puja_samagri' && p.category !== 'puja_samagri') return false;
      if (selectedCategory === 'karmakanda' && p.category !== 'karmakanda') return false;
      if (selectedCategory === 'jyotish' && p.category !== 'jyotish') return false;
      if (selectedCategory === 'vastu' && p.category !== 'vastu') return false;
      if (selectedCategory === 'yantra' && p.category !== 'yantra') return false;
      if (selectedCategory === 'others' && p.category !== 'others') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.nameNepali.toLowerCase().includes(q) || p.nameEnglish.toLowerCase().includes(q);
      const matchDesc = p.shortDescription.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
      if (!matchName && !matchDesc && !matchSku) return false;
    }

    return true;
  });

  // Category Sections for Homepage
  const featuredProducts = products.filter(p => p.isFeatured);
  const popularProducts = products.filter(p => p.isPopular);
  const newArrivals = products.filter(p => p.isNewArrival);
  const bestSelling = products.filter(p => p.isBestSeller);
  const recommendedForYou = products.filter(p => p.rating >= 4.9);

  const cartTotalBadgeCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Standalone Direct Workstation Mode (POS or Store Admin only)
  if (isStandalone) {
    if (activeTab === 'pos') {
      return (
        <div className="w-full">
          <OfflinePOSView products={products} onProductsUpdated={refreshAllData} />
          <InvoiceModal
            order={lastCreatedOrder}
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        </div>
      );
    }
    if (activeTab === 'admin') {
      return (
        <div className="w-full">
          <StoreAdminDashboard
            products={products}
            orders={orders}
            coupons={coupons}
            onRefreshData={refreshAllData}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-900 via-[#3D2514] to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3.5 py-1 rounded-full text-amber-200 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>सनातन वैदिक स्टोर तथा धार्मिक ई-कमर्स</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-snug">
              वैदिक पसल (Vedic Store)
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
              “सनातन वैदिक सामग्री, पूजा प्याकेज, ज्योतिषीय यन्त्र तथा धार्मिक पुस्तकहरूको विश्वसनीय केन्द्र”
            </p>
          </div>
        </div>
      </div>

      {/* Access Denied Banner */}
      {accessDeniedMsg && (
        <div className="p-4 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow">
          <span>{accessDeniedMsg}</span>
          <button
            onClick={() => setAccessDeniedMsg(null)}
            className="px-3 py-1 bg-red-200 dark:bg-red-900 rounded-lg text-red-900 dark:text-red-100"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      )}

      {/* Main Secondary Navigation Bar inside Vedic Pasal */}
      <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-2.5 rounded-2xl shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs sm:text-sm sticky top-[115px] z-20 backdrop-blur-md">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => handleTabChange('home')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#D97706] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>पसल होम</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('books')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'books'
                ? 'bg-[#D97706] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>धार्मिक पुस्तकालय</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('wishlist')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'bg-[#D97706] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span>इच्छासूची ({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('my_orders')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_orders'
                ? 'bg-[#D97706] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>मेरो ड्यासबोर्ड र अर्डर</span>
          </button>

          {/* POS & Store Admin Tabs: ONLY visible to authorized Staff / Store Admin / SuperAdmin */}
          {rbacSession && (rbacSession.role === 'POS_STAFF' || rbacSession.role === 'STORE_ADMIN' || rbacSession.role === 'SUPER_ADMIN') && (
            <>
              <button
                type="button"
                onClick={() => handleTabChange('pos')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pos'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Barcode className="w-4 h-4" />
                <span>काउन्टर POS</span>
              </button>

              {(rbacSession.role === 'STORE_ADMIN' || rbacSession.role === 'SUPER_ADMIN') && (
                <button
                  type="button"
                  onClick={() => handleTabChange('admin')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  <span>एडमिन ड्यासबोर्ड</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Cart Trigger Button */}
        <button
          type="button"
          onClick={() => setIsCartModalOpen(true)}
          className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">कार्ट</span>
          {cartTotalBadgeCount > 0 && (
            <span className="bg-white text-[#D97706] text-[11px] font-black px-2 py-0.5 rounded-full font-mono">
              {cartTotalBadgeCount}
            </span>
          )}
        </button>
      </div>


      {/* VIEW: Shop Homepage */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Global Search Bar */}
          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-4 rounded-3xl shadow-sm">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="सामग्री, पुस्तक वा पूजा Package खोज्नुहोस् (उदा: pooja, gita, havan)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Result Mode or Main Categorized Homepage */}
          {searchQuery || selectedCategory !== 'all' ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-serif text-stone-800 dark:text-stone-200">
                खोज नतिजा ({filteredProducts.length} वटा सामग्री भेटियो)
              </h3>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
                  कुनै सामग्री भेटिएन। कृपया अर्कै शब्द खोज्नुहोस्।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInWishlist={wishlist.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onViewDetails={p => {
                        setSelectedProductDetails(p);
                        setIsDetailsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Categorized Homepage Sections */
            <div className="space-y-10">
              {/* Featured Section */}
              {featuredProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#D97706]" />
                      <span>विशेष सिफारिस गरिएको (Featured Products)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {featuredProducts.slice(0, 4).map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isInWishlist={wishlist.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onViewDetails={p => {
                          setSelectedProductDetails(p);
                          setIsDetailsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Best Selling Products */}
              {bestSelling.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#D97706]" />
                      <span>लोकप्रिय तथा सर्वाधिक खरिद गरिएको (Best Selling)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {bestSelling.slice(0, 4).map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isInWishlist={wishlist.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onViewDetails={p => {
                          setSelectedProductDetails(p);
                          setIsDetailsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New Arrivals */}
              {newArrivals.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      <span>नयाँ भित्रिएका सामग्री (New Arrivals)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {newArrivals.slice(0, 4).map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isInWishlist={wishlist.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onViewDetails={p => {
                          setSelectedProductDetails(p);
                          setIsDetailsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Products Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  सम्पूर्ण वैदिक सामग्री तथा पुस्तकहरू ({products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInWishlist={wishlist.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onViewDetails={p => {
                        setSelectedProductDetails(p);
                        setIsDetailsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Books Store */}
      {activeTab === 'books' && (
        <BookSectionView
          products={products}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onViewDetails={p => {
            setSelectedProductDetails(p);
            setIsDetailsModalOpen(true);
          }}
        />
      )}

      {/* VIEW: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif">तपाईंको इच्छासूची ({wishlist.length})</h3>
          {wishlist.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
              इच्छासूची खाली छ।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products
                .filter(p => wishlist.includes(p.id))
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInWishlist={true}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onViewDetails={p => {
                      setSelectedProductDetails(p);
                      setIsDetailsModalOpen(true);
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Orders / Customer Portal */}
      {activeTab === 'my_orders' && (
        rbacSession ? (
          <YajamanCustomerDashboard
            session={rbacSession}
            onLogout={() => {
              clearRBACSession();
              setRbacSession(null);
            }}
            onNavigateToStore={() => setActiveTab('home')}
          />
        ) : (
          <OrderTrackingView orders={orders} />
        )
      )}

      {/* VIEW: Counter POS */}
      {activeTab === 'pos' && (
        <OfflinePOSView products={products} onProductsUpdated={refreshAllData} />
      )}

      {/* VIEW: Admin Control Dashboard */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {rbacSession?.role === 'SUPER_ADMIN' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    🛡️ सुपर एडमिन स्वीकृति केन्द्र (Super Admin User Approval Center)
                  </h3>
                  <p className="text-xs text-stone-500">
                    POS Staff तथा Store Admin को खाता स्वीकृति तथा Audit Logs व्यवस्थापन गर्नुहोस्।
                  </p>
                </div>
              </div>
              <SuperAdminApprovalCenter currentAdminUsername="admin" />
            </div>
          )}

          <StoreAdminDashboard
            products={products}
            orders={orders}
            coupons={coupons}
            onRefreshData={refreshAllData}
          />
        </div>
      )}

      {/* RBAC Auth Modal */}
      <RBACAuthModal
        isOpen={isRBACAuthModalOpen}
        onClose={() => setIsRBACAuthModalOpen(false)}
        onLoginSuccess={(sess) => {
          setRbacSession(sess);
          setIsRBACAuthModalOpen(false);
          if (sess.role === 'POS_STAFF') setActiveTab('pos');
          else if (sess.role === 'STORE_ADMIN' || sess.role === 'SUPER_ADMIN') setActiveTab('admin');
          else setActiveTab('my_orders');
        }}
      />


      {/* Modals */}
      <ProductDetailsModal
        product={selectedProductDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        isInWishlist={selectedProductDetails ? wishlist.includes(selectedProductDetails.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartAndCheckoutModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={ord => {
          setLastCreatedOrder(ord);
          setIsInvoiceModalOpen(true);
          refreshAllData();
        }}
      />

      <InvoiceModal
        order={lastCreatedOrder}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
};
