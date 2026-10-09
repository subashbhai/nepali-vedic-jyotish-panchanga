import React, { useState, useEffect } from 'react';
import {
  Product,
  StoreOrder,
  StoreCoupon,
  OrderStatus,
  StoreCategoryKey,
  AuditLog,
  InventoryLog
} from '../../types/vedicStoreTypes';
import {
  saveProducts,
  saveOrders,
  saveCoupons,
  updateOrderStatus,
  getStoredCoupons,
  getStoredOrders,
  getStoredProducts,
  resetStoreDemoData,
  verifyEsewaPayment,
  getStoredAuditLogs,
  getStoredInventoryLogs
} from '../../db/vedicStore';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Printer,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  BarChart2,
  Layers,
  X,
  RotateCcw,
  Download,
  Upload,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Search,
  Filter,
  Check,
  Ban,
  Image as ImageIcon,
  Camera,
  UploadCloud,
  Link as LinkIcon,
  Loader2,
  Sparkles
} from 'lucide-react';
import { compressAndResizeImage } from '../../utils/imageUtils';
import { handlePhoneticInputKeyDown, handlePhoneticBlur } from '../../utils/nepaliTransliteration';
import {
  PUJA_SAMAGRI_GALLERY_DATABASE,
  PUJA_GALLERY_CATEGORIES,
  PujaGalleryItem,
  getFilteredPujaGalleryItems,
  VEDIC_STORE_OFFICIAL_CONTACT
} from '../../utils/pujaSamagriGalleryEngine';
import { PujaSamagriGalleryModal } from './PujaSamagriGalleryModal';
import { PujaSamagriListModal } from './PujaSamagriListModal';
import { InvoiceModal } from './InvoiceModal';
import { StoreDigitalLibraryAdminTab } from '../admin/StoreDigitalLibraryAdminTab';
import { StoreMediaAdminTab } from '../admin/StoreMediaAdminTab';

interface StoreAdminDashboardProps {
  products: Product[];
  orders: StoreOrder[];
  coupons: StoreCoupon[];
  onRefreshData: () => void;
}

export const StoreAdminDashboard: React.FC<StoreAdminDashboardProps> = ({
  products,
  orders,
  coupons,
  onRefreshData,
}) => {
  const [adminSubTab, setAdminSubTab] = useState<
    'overview' | 'esewa_approval' | 'products' | 'orders' | 'inventory' | 'audit_logs' | 'coupons' | 'gallery' | 'digital_library_admin' | 'media_downloads'
  >('overview');

  // Audit and Inventory logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  // Selected Order for Invoice Print Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<StoreOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Selected Payment Slip Preview
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Product Add/Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCompressingProductImage, setIsCompressingProductImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isPujaGalleryModalOpen, setIsPujaGalleryModalOpen] = useState(false);

  // Gallery Hub Management States
  const [galleryCategory, setGalleryCategory] = useState<StoreCategoryKey | 'all'>('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [customUploadedGallery, setCustomUploadedGallery] = useState<PujaGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('balananda_custom_gallery_items_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCustomGalleryFormOpen, setIsCustomGalleryFormOpen] = useState(false);
  const [newCustomTitleNp, setNewCustomTitleNp] = useState('');
  const [newCustomTitleEn, setNewCustomTitleEn] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<StoreCategoryKey>('puja_package');
  const [newCustomPrice, setNewCustomPrice] = useState<number>(1500);
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomSamagriText, setNewCustomSamagriText] = useState('');
  const [newCustomImageUrl, setNewCustomImageUrl] = useState('');
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);

  // Gallery Preview List Modal State
  const [galleryPreviewProduct, setGalleryPreviewProduct] = useState<Product | null>(null);
  const [isGalleryListModalOpen, setIsGalleryListModalOpen] = useState(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया फोटो फाइल (JPG, PNG, WebP) मात्र छान्नुहोस्।');
      return;
    }

    try {
      setIsCompressingProductImage(true);
      const optimizedDataUrl = await compressAndResizeImage(file, 800, 0.85);
      setEditingProduct(prev => ({
        ...(prev || {}),
        imageUrl: optimizedDataUrl
      }));
    } catch (err) {
      console.error('Image compression failed, fallback to reader:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setEditingProduct(prev => ({
          ...(prev || {}),
          imageUrl: url
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingProductImage(false);
      e.target.value = '';
    }
  };

  // Gallery Custom Image Upload Handler
  const handleCustomGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingGalleryImg(true);
      const optimized = await compressAndResizeImage(file, 1080, 0.9);
      setNewCustomImageUrl(optimized);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = ev => {
        setNewCustomImageUrl(ev.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingGalleryImg(false);
      e.target.value = '';
    }
  };

  // Save new item to Gallery Hub
  const handleSaveCustomGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitleNp.trim() || !newCustomImageUrl) {
      alert('कृपया सामग्रीको नेपाली नाम र फोटो अनिवार्य रूपमा हाल्नुहोस्।');
      return;
    }

    const samagriLines = newCustomSamagriText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newItem: PujaGalleryItem = {
      id: `custom_gal_${Date.now()}`,
      nameNepali: newCustomTitleNp.trim(),
      nameEnglish: newCustomTitleEn.trim() || newCustomTitleNp.trim(),
      category: newCustomCategory,
      categoryNameNepali: PUJA_GALLERY_CATEGORIES.find(c => c.key === newCustomCategory)?.label || 'पूजा प्याकेज',
      description: newCustomDesc.trim() || `${newCustomTitleNp.trim()} सम्पूर्ण शास्त्रीय सामग्री`,
      tags: [newCustomTitleNp.trim(), 'कस्टम', 'ग्यालरी'],
      imageUrl: newCustomImageUrl,
      suggestedPrice: newCustomPrice,
      samagriList: samagriLines.length > 0 ? samagriLines : ['शुद्ध पूजा सामग्री सेट'],
    };

    const updated = [newItem, ...customUploadedGallery];
    setCustomUploadedGallery(updated);
    try {
      localStorage.setItem('balananda_custom_gallery_items_v1', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    // Reset Form
    setNewCustomTitleNp('');
    setNewCustomTitleEn('');
    setNewCustomDesc('');
    setNewCustomSamagriText('');
    setNewCustomImageUrl('');
    setIsCustomGalleryFormOpen(false);
    alert('नयाँ फोटो तथा सामग्री ग्यालरी हबमा सुरक्षित भयो!');
  };

  // High Resolution Image Download Handler
  const handleDownloadHQ = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/[\s/\\:*?"<>|]+/g, '_')}_HQ.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use selected gallery item in Product Add/Edit
  const handleUseInProduct = (item: PujaGalleryItem) => {
    setEditingProduct({
      nameNepali: item.nameNepali,
      nameEnglish: item.nameEnglish,
      category: item.category,
      subCategory: item.categoryNameNepali,
      shortDescription: item.description,
      fullDescription: `${item.nameNepali} सनातन वैदिक परम्परा र शास्त्रोक्त विधि अनुसार सम्पन्न गर्नका लागि आवश्यक सम्पूर्ण शुद्ध एवं प्रमाणित सामग्रीहरूको तयारी प्याकेज हो।\n\nमुख्य सामग्री सूची:\n${item.samagriList.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
      packageItems: item.samagriList,
      imageUrl: item.imageUrl,
      sellingPrice: item.suggestedPrice || 1200,
      discountPrice: Math.round((item.suggestedPrice || 1200) * 0.9),
      purchasePrice: Math.round((item.suggestedPrice || 1200) * 0.7),
      stockQuantity: 20,
      minStockLevel: 4,
      supplier: 'बालानन्द वैदिक सामग्री भण्डार, काठमाडौं',
      unit: item.category === 'religious_books' ? 'पुस्तक' : 'सेट',
      isActive: true,
      isFeatured: true,
      isPopular: true,
    });
    setIsProductModalOpen(true);
  };

  // Preview Shastriya items in Modal
  const handlePreviewGalleryItemSamagri = (item: PujaGalleryItem) => {
    const tempProd: Product = {
      id: `temp_${item.id}`,
      sku: 'GAL-' + item.category.substring(0, 3).toUpperCase(),
      nameNepali: item.nameNepali,
      nameEnglish: item.nameEnglish,
      category: item.category,
      subCategory: item.categoryNameNepali,
      shortDescription: item.description,
      fullDescription: item.description,
      packageItems: item.samagriList,
      purchasePrice: Math.round((item.suggestedPrice || 1200) * 0.7),
      sellingPrice: item.suggestedPrice || 1200,
      discountPrice: Math.round((item.suggestedPrice || 1200) * 0.9),
      stockQuantity: 25,
      minStockLevel: 3,
      unit: 'सेट',
      weightGram: 1200,
      rating: 4.9,
      reviewsCount: 24,
      imageUrl: item.imageUrl,
      isActive: true,
      isFeatured: true,
      isPopular: true,
      isBestSeller: true,
    };
    setGalleryPreviewProduct(tempProd);
    setIsGalleryListModalOpen(true);
  };

  // Coupon Add Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(1000);

  useEffect(() => {
    loadLogs();
  }, [adminSubTab]);

  // Live order update listener across all browser tabs & sessions
  useEffect(() => {
    const handleLiveOrderUpdate = () => {
      onRefreshData();
      loadLogs();
    };
    window.addEventListener('vedic-orders-updated', handleLiveOrderUpdate);
    window.addEventListener('storage', handleLiveOrderUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('balananda_store_sync_channel');
      bc.onmessage = () => {
        handleLiveOrderUpdate();
      };
    } catch {}

    const interval = setInterval(handleLiveOrderUpdate, 2000);

    return () => {
      window.removeEventListener('vedic-orders-updated', handleLiveOrderUpdate);
      window.removeEventListener('storage', handleLiveOrderUpdate);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [onRefreshData]);

  const loadLogs = () => {
    setAuditLogs(getStoredAuditLogs());
    setInventoryLogs(getStoredInventoryLogs());
  };

  // eSewa Submissions requiring verification
  const pendingEsewaOrders = orders.filter(
    o => o.paymentMethod === 'esewa' && o.esewaDetails && o.paymentStatus === 'Verification Pending'
  );

  const handleEsewaAction = (
    orderId: string,
    action: 'Approved' | 'Rejected' | 'Reupload Requested'
  ) => {
    let reason: string | undefined;
    if (action === 'Rejected' || action === 'Reupload Requested') {
      const inputReason = prompt('कारण लेख्नुहोस् (Enter Reason / Admin Note):');
      if (inputReason === null) return;
      reason = inputReason.trim() || 'प्रमाणीकरण असफल भयो';
    }

    let actionCode: 'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD' = 'APPROVE';
    if (action === 'Rejected') actionCode = 'REJECT';
    else if (action === 'Reupload Requested') actionCode = 'REQUEST_REUPLOAD';

    verifyEsewaPayment(orderId, actionCode, 'Super Admin', reason);
    alert('eSewa भुक्तानी स्थिति सफलतापूर्वक अध्यावधिक गरियो।');
    onRefreshData();
    loadLogs();
  };

  // Metrics Calculations
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;

  const totalSalesAmount = orders.reduce((acc, ord) => acc + ord.totalAmount, 0);

  const onlineOrders = orders.filter(o => o.orderType === 'ONLINE');
  const offlineOrders = orders.filter(o => o.orderType === 'OFFLINE_POS');

  const onlineSales = onlineOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const offlineSales = offlineOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');

  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.stockQuantity <= 0);

  // Product CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.nameNepali || !editingProduct?.sellingPrice) {
      alert('कृपया सामग्रीको नाम र बिक्री मूल्य प्रविष्ट गर्नुहोस्।');
      return;
    }

    const currentProducts = getStoredProducts();

    if (editingProduct.id) {
      // Update
      const updated = currentProducts.map(p => (p.id === editingProduct.id ? ({ ...p, ...editingProduct } as Product) : p));
      saveProducts(updated);
    } else {
      // Create New
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        sku: editingProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: editingProduct.barcode || `890100${Math.floor(100000 + Math.random() * 900000)}`,
        nameNepali: editingProduct.nameNepali,
        nameEnglish: editingProduct.nameEnglish || '',
        category: (editingProduct.category as StoreCategoryKey) || 'puja_samagri',
        shortDescription: editingProduct.shortDescription || '',
        fullDescription: editingProduct.fullDescription || '',
        purchasePrice: editingProduct.purchasePrice || 0,
        sellingPrice: editingProduct.sellingPrice,
        discountPrice: editingProduct.discountPrice,
        stockQuantity: editingProduct.stockQuantity || 10,
        minStockLevel: editingProduct.minStockLevel || 3,
        unit: editingProduct.unit || 'थान',
        weightGram: editingProduct.weightGram || 500,
        rating: 5.0,
        reviewsCount: 1,
        imageUrl: editingProduct.imageUrl || 'https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=800&q=80',
        isActive: true,
      };
      saveProducts([newProd, ...currentProducts]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    onRefreshData();
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('के तपाईं निश्चित हुनुहुन्छ यो सामग्री हटाउन चाहनुहुन्छ?')) {
      const currentProducts = getStoredProducts();
      saveProducts(currentProducts.filter(p => p.id !== productId));
      onRefreshData();
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    onRefreshData();
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    const currentCoupons = getStoredCoupons();
    const newCoupon: StoreCoupon = {
      id: `cup_${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: newCouponValue,
      minOrderAmount: newCouponMinOrder,
      expiryDate: '2026-12-31',
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    };
    saveCoupons([newCoupon, ...currentCoupons]);
    setIsCouponModalOpen(false);
    setNewCouponCode('');
    onRefreshData();
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "vedic_pasal_products.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#2D241E] via-[#3D3028] to-[#2D241E] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
            <BarChart2 className="w-4 h-4" />
            <span>स्टोर प्रशासन, eSewa प्रमाणीकरण तथा ERP ड्यासबोर्ड</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif">
            वैदिक पसल स्टोर म्यानेजमेन्ट (Admin Control)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90">
            eSewa भुक्तानी स्वीकृत, स्टक इन्भेन्टरी, बिक्री बीजक र अडिट लग नियन्त्रण गर्नुहोस्।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-2 bg-stone-700/80 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-600"
          >
            <Download className="w-4 h-4" />
            <span>Export Products</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('के तपाईं डेमो डाटा रिसेट गर्न चाहनुहुन्छ?')) {
                resetStoreDemoData();
                onRefreshData();
              }
            }}
            className="px-3.5 py-2 bg-amber-600/80 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Demo Reset</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
        {[
          { id: 'overview', label: '📊 ओभरभ्यु ड्यासबोर्ड' },
          {
            id: 'esewa_approval',
            label: `💳 eSewa प्रमाणीकरण (${pendingEsewaOrders.length})`,
            badge: pendingEsewaOrders.length > 0
          },
          { id: 'products', label: `🛍️ सामग्री म्यानेजर (${totalProductsCount})` },
          { id: 'gallery', label: `🖼️ फोटो ग्यालरी (${PUJA_SAMAGRI_GALLERY_DATABASE.length + customUploadedGallery.length})` },
          { id: 'orders', label: `📦 अर्डर सूची (${totalOrdersCount})` },
          { id: 'inventory', label: `⚠️ इन्भेन्टरी स्टक (${lowStockProducts.length + outOfStockProducts.length})` },
          { id: 'audit_logs', label: `📜 अडिट लगहरू (${auditLogs.length})` },
          { id: 'coupons', label: `🎟️ कुपन (${coupons.length})` },
          { id: 'digital_library_admin', label: '📚 डिजिटल पुस्तकालय एवं PDF अपलोडर' },
          { id: 'media_downloads', label: '🎬 मिडिया, फोटो र भिडियो व्यवस्थापक' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAdminSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shadow-sm border flex items-center gap-2 ${
              adminSubTab === tab.id
                ? 'bg-[#D97706] text-white border-[#B45309]'
                : 'bg-white dark:bg-[#231F1C] border-[#E6E0D5] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-mono font-black rounded-full animate-pulse">
                {pendingEsewaOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* View 1: Overview Metrics */}
      {adminSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">कुल आम्दानी (Sales)</span>
              <span className="text-xl font-black text-[#D97706] font-mono block">
                रु. {totalSalesAmount.toLocaleString('ne-NP')}
              </span>
              <span className="text-[10px] text-stone-400">कुल अर्डर आम्दानी</span>
            </div>

            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">अनलाइन बिक्री</span>
              <span className="text-xl font-black text-emerald-600 font-mono block">
                रु. {onlineSales.toLocaleString('ne-NP')}
              </span>
              <span className="text-[10px] text-stone-400">{onlineOrders.length} अनलाइन अर्डर</span>
            </div>

            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">काउन्टर POS बिक्री</span>
              <span className="text-xl font-black text-indigo-600 font-mono block">
                रु. {offlineSales.toLocaleString('ne-NP')}
              </span>
              <span className="text-[10px] text-stone-400">{offlineOrders.length} POS अर्डर</span>
            </div>

            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">eSewa प्रमाणीकरण बाँकी</span>
              <span className="text-xl font-black text-red-600 font-mono block">
                {pendingEsewaOrders.length} अर्डर
              </span>
              <span className="text-[10px] text-red-500">eSewa Txn Approval Needed</span>
            </div>

            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">कम स्टक (Low Stock)</span>
              <span className="text-xl font-black text-amber-600 font-mono block">
                {lowStockProducts.length} सामग्री
              </span>
              <span className="text-[10px] text-amber-600">पुनः स्टक थप्नुहोस्</span>
            </div>

            <div className="bg-white dark:bg-[#231F1C] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-1">
              <span className="text-stone-500 text-[11px] font-bold block">स्टक सकिएको</span>
              <span className="text-xl font-black text-stone-500 font-mono block">
                {outOfStockProducts.length} सामग्री
              </span>
              <span className="text-[10px] text-stone-400">Out of stock</span>
            </div>
          </div>

          {/* Quick Recent Orders & Pending eSewa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-5 rounded-3xl shadow-sm space-y-3">
              <h3 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100 flex items-center justify-between">
                <span>eSewa प्रमाणीकरणको प्रतीक्षामा (Pending eSewa Payments)</span>
                <button
                  type="button"
                  onClick={() => setAdminSubTab('esewa_approval')}
                  className="text-xs font-bold text-[#D97706] hover:underline"
                >
                  सबै हेर्नुहोस् ({pendingEsewaOrders.length})
                </button>
              </h3>

              <div className="space-y-2 text-xs">
                {pendingEsewaOrders.length === 0 ? (
                  <p className="text-stone-400 text-center py-6">कुनै पनि eSewa प्रमाणीकरण बाँकी छैन।</p>
                ) : (
                  pendingEsewaOrders.slice(0, 4).map(ord => (
                    <div
                      key={ord.id}
                      className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#D97706] font-mono">{ord.orderNumber}</div>
                        <div className="text-stone-700 dark:text-stone-300">
                          {ord.customerName} ({ord.customerPhone})
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Txn ID: <strong>{ord.esewaDetails?.transactionId}</strong> | रु. {ord.esewaDetails?.paidAmount}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEsewaAction(ord.id, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                        >
                          स्वीकृत
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-5 rounded-3xl shadow-sm space-y-3">
              <h3 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100">
                हालैका अर्डर सूची (Recent Orders)
              </h3>

              <div className="space-y-2 text-xs">
                {orders.slice(0, 5).map(ord => (
                  <div
                    key={ord.id}
                    className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#D97706] font-mono">{ord.orderNumber}</div>
                      <div className="text-stone-500">{ord.customerName} | {ord.paymentMethod.toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono">रु. {ord.totalAmount.toLocaleString('ne-NP')}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: eSewa Verification Manager */}
      {adminSubTab === 'esewa_approval' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div>
              <strong>eSewa भुक्तानी प्रमाणीकरण:</strong> प्रापक eSewa ID: <span className="font-mono font-bold text-emerald-700">97674244778</span> मा प्राप्त रकम र ग्राहकको eSewa Transaction ID भिडाएर मात्र स्वीकृत गर्नुहोस्।
            </div>
            <span className="font-mono font-bold px-3 py-1 bg-emerald-600 text-white rounded-full">
              {pendingEsewaOrders.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingEsewaOrders.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
                प्रमाणीकरण गर्नुपर्ने कुनै eSewa भुक्तानी बाँकी छैन।
              </div>
            ) : (
              pendingEsewaOrders.map(ord => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-[#231F1C] border border-amber-300 dark:border-amber-900 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-stone-500">
                          ({new Date(ord.createdAt).toLocaleString('ne-NP')})
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 font-bold">
                        ग्राहक: {ord.customerName} ({ord.customerPhone}) | ठेगाना: {(ord as any).deliveryAddress || (ord as any).address || 'काठमाडौँ'}
                      </p>
                    </div>

                    <div className="font-mono text-base font-black text-[#D97706]">
                      अर्डर रकम: रु. {ord.totalAmount.toLocaleString('ne-NP')}
                    </div>
                  </div>

                  {/* eSewa Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <div>
                      <span className="text-stone-500 block">eSewa Receiver Number:</span>
                      <span className="font-mono font-bold text-emerald-700">97674244778</span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">ग्राहकले हालेको Txn ID:</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {ord.esewaDetails?.transactionId}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">तिरेको रकम र मिति:</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        रु. {ord.esewaDetails?.paidAmount} ({ord.esewaDetails?.paymentDate} {ord.esewaDetails?.paymentTime})
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Payment Slip Photo:</span>
                      {ord.esewaDetails?.slipUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewSlipUrl(ord.esewaDetails?.slipUrl || null)}
                          className="mt-0.5 px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> स्लिप हेर्नुहोस्
                        </button>
                      ) : (
                        <span className="text-stone-400 italic">अपलोड नभएको</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleEsewaAction(ord.id, 'Approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>स्वीकृत गर्नुहोस् (Approve & Confirm Order)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEsewaAction(ord.id, 'Reupload Requested')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Slip पुनः पठाउन अनुरोध गर्नुहोस्</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEsewaAction(ord.id, 'Rejected')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Ban className="w-4 h-4" />
                      <span>अस्वीकृत गर्नुहोस् (Reject)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View 3: Product Management */}
      {adminSubTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
              सबै सामग्री सूची ({products.length})
            </h3>

            <button
              type="button"
              onClick={() => {
                setEditingProduct({
                  category: 'puja_samagri',
                  unit: 'थान',
                  stockQuantity: 20,
                  minStockLevel: 5,
                  sellingPrice: 500,
                  purchasePrice: 350,
                  isActive: true,
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-[#D97706] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:bg-[#B45309]"
            >
              <Plus className="w-4 h-4" />
              <span>नयाँ सामग्री थप्नुहोस् (Add Product)</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 text-stone-500">
                    <th className="p-3">फोटो</th>
                    <th className="p-3">नाम र SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">बिक्री मूल्य</th>
                    <th className="p-3">स्टक</th>
                    <th className="p-3">स्थिति</th>
                    <th className="p-3 text-right">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                      <td className="p-3">
                        <img src={p.imageUrl} alt={p.nameNepali} className="w-10 h-10 rounded-xl object-cover" />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900 dark:text-stone-100">{p.nameNepali}</div>
                        <div className="text-[10px] text-stone-400 font-mono">SKU: {p.sku} | Barcode: {p.barcode}</div>
                      </td>
                      <td className="p-3 text-stone-600 dark:text-stone-300 font-medium">{p.category}</td>
                      <td className="p-3 font-mono font-bold text-[#D97706]">
                        रु. {(p.discountPrice ?? p.sellingPrice).toLocaleString('ne-NP')}
                      </td>
                      <td className="p-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stockQuantity <= 0
                              ? 'bg-red-100 text-red-700'
                              : p.stockQuantity <= p.minStockLevel
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Orders Management */}
      {adminSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
              अर्डर प्रबन्ध (All Orders)
            </h3>
          </div>

          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 text-stone-500">
                    <th className="p-3">अर्डर/बिल नम्बर</th>
                    <th className="p-3">ग्राहक</th>
                    <th className="p-3">माध्यम</th>
                    <th className="p-3">रकम</th>
                    <th className="p-3">भुक्तानी स्थिति</th>
                    <th className="p-3">डेलिभरी स्थिति</th>
                    <th className="p-3 text-right">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
                  {orders.map(ord => (
                    <tr key={ord.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                      <td className="p-3 font-mono font-bold text-[#D97706]">{ord.billNumber || ord.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-bold">{ord.customerName}</div>
                        <div className="text-[10px] text-stone-500">{ord.customerPhone}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ord.paymentMethod === 'esewa' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {ord.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">रु. {ord.totalAmount.toLocaleString('ne-NP')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-stone-700 dark:text-stone-300">{ord.orderStatus}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={ord.orderStatus}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Payment Confirmed">Payment Confirmed</option>
                            <option value="Order Confirmed">Order Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Packed">Packed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceOrder(ord);
                              setIsInvoiceOpen(true);
                            }}
                            className="p-1.5 bg-amber-100 text-[#D97706] rounded-lg font-bold text-[11px]"
                          >
                            बीजक/Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 5: Inventory & Low Stock */}
      {adminSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            <strong>स्टक अलर्ट:</strong> निम्न सामग्रीहरूको स्टक समाप्त भएको वा तोकिएको Minimum Stock Level भन्दा कम रहेको छ।
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockProducts.concat(outOfStockProducts).map(p => (
              <div
                key={p.id}
                className="p-4 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.nameNepali} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">{p.nameNepali}</h4>
                    <p className="text-[11px] text-stone-500 font-mono">SKU: {p.sku}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stockQuantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.stockQuantity <= 0 ? 'Out of Stock (० थान)' : `Low Stock Alert (${p.stockQuantity} ${p.unit})`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const addAmount = prompt('कति स्टक थप्ने? (Add Quantity):', '20');
                    if (addAmount && !isNaN(Number(addAmount))) {
                      const updated = products.map(item =>
                        item.id === p.id
                          ? { ...item, stockQuantity: item.stockQuantity + Number(addAmount) }
                          : item
                      );
                      saveProducts(updated);
                      onRefreshData();
                    }
                  }}
                  className="px-3 py-1.5 bg-[#D97706] text-white rounded-xl text-xs font-bold"
                >
                  + स्टक थप्नुहोस्
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 6: Audit Logs */}
      {adminSubTab === 'audit_logs' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
            सिस्टम क्रियाकलाप लग तथा अडिट ट्रेल (System Audit Logs)
          </h3>

          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-4 shadow-sm space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">कुनै अडिट लग भेटिएन।</p>
            ) : (
              auditLogs.slice(0, 20).map(log => (
                <div key={log.id} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{log.action}</span>
                    <span className="text-stone-500 block">{log.details}</span>
                  </div>
                  <div className="text-right text-[11px] text-stone-400">
                    <div>{(log as any).performedBy || (log as any).adminName || (log as any).userName || 'Admin'}</div>
                    <div>{new Date(log.timestamp).toLocaleString('ne-NP')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View 7: Coupon Manager */}
      {adminSubTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-serif">कुपन कोड व्यवस्थापन ({coupons.length})</h3>
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 bg-[#D97706] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>नयाँ कुपन थप्नुहोस्</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {coupons.map(c => (
              <div
                key={c.id}
                className="p-4 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 font-bold">
                  छूट: {c.type === 'percentage' ? `${c.value}%` : `रु. ${c.value}`}
                </p>
                <p className="text-stone-500">न्यूनतम अर्डर: रु. {c.minOrderAmount}</p>
                <p className="text-stone-400 text-[10px]">प्रयोग संख्या: {c.usedCount} पटक</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 8: Photo Gallery Hub (ग्यालरी व्यवस्थापन) */}
      {adminSubTab === 'gallery' && (
        <div className="space-y-6">
          {/* Gallery Header Card */}
          <div className="bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#7A1C1C] text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-2 border-amber-500/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/20 px-3 py-1 rounded-full text-amber-300 text-xs font-bold border border-amber-300/30">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>५०+ शास्त्रीय पूजा सामग्री तथा संस्कार फोटो ग्यालरी हब</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
                वैदिक पूजा तथा संस्कार फोटो ग्यालरी (Gallery Hub)
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-sans">
                उच्च गुणस्तर (HQ) का फोटोहरू डाउनलोड गर्नुहोस्, नयाँ फोटो अपलोड गर्नुहोस् र सिधै स्टोर सामग्रीमा प्रयोग गर्नुहोस्।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomGalleryFormOpen(!isCustomGalleryFormOpen)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {isCustomGalleryFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isCustomGalleryFormOpen ? 'फर्म बन्द गर्नुहोस्' : 'नयाँ फोटो / सामग्री अपलोड गर्नुहोस्'}</span>
              </button>
            </div>
          </div>

          {/* Custom Upload Form */}
          {isCustomGalleryFormOpen && (
            <form
              onSubmit={handleSaveCustomGalleryItem}
              className="bg-white dark:bg-[#231F1C] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-xs animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b pb-3 border-amber-200 dark:border-stone-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                    ग्यालरी हबमा नयाँ फोटो र सामग्री विवरण थप्नुहोस्
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomGalleryFormOpen(false)}
                  className="p-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-600 dark:text-stone-300 font-bold">
                      सामग्रीको नेपाली नाम (*):
                    </label>
                    <span className="text-[10px] text-amber-600 font-medium">Roman to Nepali (Space)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newCustomTitleNp}
                    onChange={e => setNewCustomTitleNp(e.target.value)}
                    onKeyDown={e => handlePhoneticInputKeyDown(e, newCustomTitleNp, setNewCustomTitleNp)}
                    onBlur={() => handlePhoneticBlur(newCustomTitleNp, setNewCustomTitleNp)}
                    placeholder="उदा: श्री सत्यनारायण महापूजा प्याकेज"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                    English Name:
                  </label>
                  <input
                    type="text"
                    value={newCustomTitleEn}
                    onChange={e => setNewCustomTitleEn(e.target.value)}
                    placeholder="e.g. Satyanarayan Maha Puja Package"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                    वर्ग (Category):
                  </label>
                  <select
                    value={newCustomCategory}
                    onChange={e => setNewCustomCategory(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5"
                  >
                    {PUJA_GALLERY_CATEGORIES.map(cat => (
                      <option key={cat.key} value={cat.key}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                    अनुमानित मूल्य (NRs):
                  </label>
                  <input
                    type="number"
                    value={newCustomPrice}
                    onChange={e => setNewCustomPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                  छोटो विवरण (Description):
                </label>
                <textarea
                  value={newCustomDesc}
                  onChange={e => setNewCustomDesc(e.target.value)}
                  onKeyDown={e => handlePhoneticInputKeyDown(e, newCustomDesc, setNewCustomDesc)}
                  onBlur={() => handlePhoneticBlur(newCustomDesc, setNewCustomDesc)}
                  placeholder="पूजाको संक्षिप्त विधि वा महत्त्व (Roman मा लेखेर Space थिच्नुहोस्)"
                  rows={2}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-600 dark:text-stone-300 font-bold">
                    📦 प्याकेजमा समावेश सामग्रीहरूको सूची (प्रत्येक लाइनमा एक सामग्री):
                  </label>
                  <span className="text-[10px] text-stone-500">प्रति लाइन: १ सामग्री</span>
                </div>
                <textarea
                  value={newCustomSamagriText}
                  onChange={e => setNewCustomSamagriText(e.target.value)}
                  onKeyDown={e => handlePhoneticInputKeyDown(e, newCustomSamagriText, setNewCustomSamagriText)}
                  onBlur={() => handlePhoneticBlur(newCustomSamagriText, setNewCustomSamagriText)}
                  placeholder={`तामाको कलश – १ थान\nशुद्ध गाईको घ्यू – ५०० ग्राम\nहवन सामग्री – १ केजी\nसमिधा काठ – २ केजी\nजौ-तिल र कुश – १ सेट`}
                  rows={4}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 font-sans"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="bg-amber-50/70 dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-3">
                <label className="block text-stone-700 dark:text-stone-300 font-bold">
                  🖼️ फोटो चयन गर्नुहोस् (*):
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-stone-800 border-2 border-dashed border-amber-400 rounded-2xl hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs">
                    {isUploadingGalleryImg ? (
                      <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      कम्प्युटरबाट फोटो छान्नुहोस्
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomGalleryImageUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="w-full sm:flex-1">
                    <input
                      type="text"
                      value={newCustomImageUrl}
                      onChange={e => setNewCustomImageUrl(e.target.value)}
                      placeholder="अथवा फोटोको URL लिङ्क..."
                      className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {newCustomImageUrl && (
                  <div className="relative w-32 h-24 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                    <img
                      src={newCustomImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIsCustomGalleryFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ग्यालरी हबमा सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          )}

          {/* Search and Category Filters */}
          <div className="p-4 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl shadow-sm space-y-3">
            {/* Search Input with Phonetic Engine */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gallerySearch}
                onChange={e => setGallerySearch(e.target.value)}
                onKeyDown={e => handlePhoneticInputKeyDown(e, gallerySearch, setGallerySearch)}
                onBlur={() => handlePhoneticBlur(gallerySearch, setGallerySearch)}
                placeholder="ग्यालरीमा खोज्नुहोस् (उदा: vivah, garbhadhana, bartabandha, rudraksha, kalash, ghee)..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {gallerySearch && (
                <button
                  type="button"
                  onClick={() => setGallerySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setGalleryCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  galleryCategory === 'all'
                    ? 'bg-[#7A1C1C] text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                🌟 सबै ({PUJA_SAMAGRI_GALLERY_DATABASE.length + customUploadedGallery.length})
              </button>

              {PUJA_GALLERY_CATEGORIES.map(cat => {
                const combined = [...customUploadedGallery, ...PUJA_SAMAGRI_GALLERY_DATABASE];
                const count = combined.filter(i => i.category === cat.key).length;
                const isSel = galleryCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setGalleryCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-[#7A1C1C] text-white border-amber-600 shadow-xs font-bold'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSel ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gallery Items Grid */}
          {(() => {
            const combined = [...customUploadedGallery, ...PUJA_SAMAGRI_GALLERY_DATABASE];
            const filtered = getFilteredPujaGalleryItems(combined, galleryCategory, gallerySearch);

            if (filtered.length === 0) {
              return (
                <div className="py-16 text-center bg-white dark:bg-[#231F1C] rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    खोजी गरिएका शब्दसँग मिल्ने सामग्री ग्यालरीमा फेला परेन।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryCategory('all');
                      setGallerySearch('');
                    }}
                    className="text-xs text-[#D97706] underline font-bold cursor-pointer"
                  >
                    सबै सामग्रीहरू हेर्नुहोस्
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#231F1C] border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Top Image Box */}
                    <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.nameNepali}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className="bg-black/75 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                          {item.categoryNameNepali}
                        </span>
                        <span className="bg-amber-500 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          Ultra-HD
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadHQ(item.imageUrl, item.nameNepali)}
                          className="p-2 rounded-xl bg-black/80 hover:bg-[#D97706] text-white transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
                          title="High-Resolution HQ फोटो डाउनलोड गर्नुहोस्"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-[#D97706]">
                            रु. {(item.suggestedPrice || 1200).toLocaleString('ne-NP')}
                          </span>
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                            {item.samagriList.length} सामग्री
                          </span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400 transition-colors">
                          {item.nameNepali}
                        </h4>

                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadHQ(item.imageUrl, item.nameNepali)}
                            className="py-2 px-2.5 rounded-xl text-[11px] font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="HQ डाउनलोड"
                          >
                            <Download className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>HQ डाउनलोड</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePreviewGalleryItemSamagri(item)}
                            className="py-2 px-2.5 rounded-xl text-[11px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="सामग्री सूची हेर्नुहोस्"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>सूची हेर्नुहोस्</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUseInProduct(item)}
                          className="w-full py-2 px-3 rounded-xl text-[11px] font-bold bg-gradient-to-r from-amber-600 to-[#7A1C1C] hover:from-amber-500 hover:to-[#991B1B] text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>सामग्रीमा प्रयोग गर्नुहोस् (Use in Product)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* View 9: Digital Library Admin & PDF Uploader */}
      {adminSubTab === 'digital_library_admin' && (
        <StoreDigitalLibraryAdminTab />
      )}

      {/* View 10: Vedic Media, Photo & Video Manager */}
      {adminSubTab === 'media_downloads' && (
        <StoreMediaAdminTab />
      )}

      {/* Image Preview Modal */}
      {previewSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 max-w-lg w-full space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-xs">eSewa Payment Slip Preview</h4>
              <button
                type="button"
                onClick={() => setPreviewSlipUrl(null)}
                className="p-1 rounded-full bg-stone-100 text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewSlipUrl} alt="Slip" className="w-full max-h-[70vh] object-contain rounded-2xl border" />
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
              <h3 className="font-bold text-sm font-serif">
                {editingProduct?.id ? 'सामग्री सम्पादन (Edit Product)' : 'नयाँ सामग्री थप्नुहोस् (New Product)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full bg-stone-100 text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-500">सामग्रीको नेपाली नाम (*):</label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  ⌨️ Roman मा लेखेर Space थिच्दा नेपाली हुनेछ
                </span>
              </div>
              <input
                type="text"
                value={editingProduct?.nameNepali || ''}
                onChange={e => setEditingProduct({ ...editingProduct, nameNepali: e.target.value })}
                onKeyDown={e => handlePhoneticInputKeyDown(e, editingProduct?.nameNepali || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), nameNepali: val })))}
                onBlur={() => handlePhoneticBlur(editingProduct?.nameNepali || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), nameNepali: val })))}
                placeholder="उदा: अगरबत्ती / agarbatti (space हान्नुहोस्)"
                required
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">Category:</label>
                <select
                  value={editingProduct?.category || 'puja_samagri'}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2"
                >
                  <option value="puja_samagri">पूजा सामग्री</option>
                  <option value="karmakanda">कर्मकाण्ड सामग्री</option>
                  <option value="jyotish">ज्योतिष सामग्री</option>
                  <option value="vastu">वास्तु सामग्री</option>
                  <option value="religious_books">धार्मिक पुस्तक</option>
                  <option value="puja_package">पूजा Package</option>
                  <option value="yantra">यन्त्र</option>
                  <option value="others">अन्य</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">एकाइ (Unit):</label>
                <input
                  type="text"
                  value={editingProduct?.unit || 'थान'}
                  onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  onKeyDown={e => handlePhoneticInputKeyDown(e, editingProduct?.unit || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), unit: val })))}
                  onBlur={() => handlePhoneticBlur(editingProduct?.unit || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), unit: val })))}
                  placeholder="थान / kg / सेट"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">बिक्री मूल्य (NRs *):</label>
                <input
                  type="number"
                  value={editingProduct?.sellingPrice || 0}
                  onChange={e => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                  required
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">छूट मूल्य (Discount NRs):</label>
                <input
                  type="number"
                  value={editingProduct?.discountPrice || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, discountPrice: Number(e.target.value) || undefined })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">स्टक परिमाण (Stock Quantity):</label>
                  <input
                    type="number"
                    value={editingProduct?.stockQuantity || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">न्यूनतम स्टक अलर्ट (Min Stock):</label>
                  <input
                    type="number"
                    value={editingProduct?.minStockLevel || 3}
                    onChange={e => setEditingProduct({ ...editingProduct, minStockLevel: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Product Photo Upload Section */}
              <div className="bg-stone-50 dark:bg-stone-900/80 p-3.5 rounded-2xl border border-amber-200/70 dark:border-stone-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                    <ImageIcon className="w-4 h-4 text-[#D97706]" />
                    <span>सामग्रीको फोटो (Product Photo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPujaGalleryModalOpen(true)}
                      className="text-xs bg-gradient-to-r from-[#7A1C1C] to-amber-700 hover:from-[#991B1B] hover:to-amber-600 text-white font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>५०+ पूजा ग्यालरीबाट छान्नुहोस्</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-[#D97706] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{showUrlInput ? 'अपलोड मोड' : 'वेब लिङ्क'}</span>
                    </button>
                  </div>
                </div>

                {editingProduct?.imageUrl ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xs">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-amber-400/60 shadow-xs">
                      <img
                        src={editingProduct.imageUrl}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-xs font-bold text-green-700 dark:text-green-400 truncate flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> फोटो चयन गरिएको छ ✓
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {editingProduct.imageUrl.startsWith('data:') ? 'प्रमाणित वैदिक फोटो / कम्प्रेस्ड तस्विर' : editingProduct.imageUrl}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setIsPujaGalleryModalOpen(true)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-[#7A1C1C] dark:text-amber-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>ग्यालरीबाट फेर्नुहोस्</span>
                        </button>
                        <label
                          htmlFor="product-photo-file-input"
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>फाइल अपलोड</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                          className="px-2 py-1 bg-red-100 dark:bg-red-950/50 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>हटाउनुहोस्</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Choose from 50+ Puja Gallery */}
                    <button
                      type="button"
                      onClick={() => setIsPujaGalleryModalOpen(true)}
                      className="border-2 border-amber-500/80 hover:border-amber-600 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:to-transparent rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xs group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7A1C1C] to-amber-600 flex items-center justify-center text-amber-200 mb-2 group-hover:rotate-6 transition-transform shadow-md">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-amber-100">
                        ५०+ पूजा सामग्री ग्यालरीबाट छान्नुहोस्
                      </span>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 mt-1 font-medium">
                        कर्मकाण्ड प्याकेज, हवन, शंख, घ्यू, रुद्राक्ष, ग्रन्थ आदि
                      </span>
                    </button>

                    {/* Option 2: Upload from Device / Computer */}
                    <label
                      htmlFor="product-photo-file-input"
                      className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 bg-white dark:bg-stone-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                    >
                      {isCompressingProductImage ? (
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold py-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>फोटो कम्प्रेस तथा लोड हुँदैछ...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                            कम्प्युटर / मोबाइलबाट अपलोड
                          </span>
                          <span className="text-[10px] text-stone-500 mt-1">
                            JPG, PNG, WebP फोटो स्वतः अप्टिमाइज हुनेछ
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Hidden File Input for Image Selection / Camera */}
                <input
                  id="product-photo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />

                {/* Optional Web URL Input fallback */}
                {showUrlInput && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700 animate-fadeIn">
                    <label className="block text-stone-500 mb-1 text-[11px]">अथवा फोटोको वेब URL लिङ्क पेस्ट गर्नुहोस्:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingProduct?.imageUrl || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-500">छोटो विवरण (Short Description):</label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  ⌨️ Roman to Nepali (Space bar)
                </span>
              </div>
              <textarea
                value={editingProduct?.shortDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                onKeyDown={e => handlePhoneticInputKeyDown(e, editingProduct?.shortDescription || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), shortDescription: val })))}
                onBlur={() => handlePhoneticBlur(editingProduct?.shortDescription || '', (val) => setEditingProduct(prev => ({ ...(prev || {}), shortDescription: val })))}
                placeholder="उदा: पूजाको लागि उपयुक्त सामग्री (roman मा लेखेर space थिच्नुहोस्)"
                rows={2}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button type="submit" className="px-5 py-2 bg-[#D97706] text-white rounded-xl font-bold">
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm font-serif">नयाँ कुपन थप्नुहोस्</h3>

            <div>
              <label className="block text-stone-500 mb-1">कुपन कोड (e.g. PUJA20):</label>
              <input
                type="text"
                value={newCouponCode}
                onChange={e => setNewCouponCode(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-stone-500 mb-1">छूट दर (%):</label>
              <input
                type="number"
                value={newCouponValue}
                onChange={e => setNewCouponValue(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-500 mb-1">न्यूनतम अर्डर रकम (NRs):</label>
              <input
                type="number"
                value={newCouponMinOrder}
                onChange={e => setNewCouponMinOrder(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleAddCoupon}
                className="px-4 py-2 bg-[#D97706] text-white rounded-xl font-bold"
              >
                कुपन सिर्जना गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />

      {/* Puja Samagri 50+ Gallery Modal */}
      <PujaSamagriGalleryModal
        isOpen={isPujaGalleryModalOpen}
        onClose={() => setIsPujaGalleryModalOpen(false)}
        onSelectImage={(item) => {
          setEditingProduct(prev => ({
            ...(prev || {}),
            imageUrl: item.imageUrl
          }));
        }}
        currentSelectedImageUrl={editingProduct?.imageUrl}
      />

      {/* Puja Samagri Itemized Checklist Modal from Gallery */}
      <PujaSamagriListModal
        product={galleryPreviewProduct}
        isOpen={isGalleryListModalOpen}
        onClose={() => {
          setIsGalleryListModalOpen(false);
          setGalleryPreviewProduct(null);
        }}
        onAddToCart={(prod) => {
          setIsGalleryListModalOpen(false);
          handleUseInProduct({
            id: prod.id,
            nameNepali: prod.nameNepali,
            nameEnglish: prod.nameEnglish,
            category: prod.category,
            categoryNameNepali: prod.subCategory || 'पूजा प्याकेज',
            description: prod.shortDescription,
            tags: [],
            imageUrl: prod.imageUrl,
            suggestedPrice: prod.sellingPrice,
            samagriList: prod.packageItems || [],
          });
        }}
        onBuyNow={(prod) => {
          setIsGalleryListModalOpen(false);
          handleUseInProduct({
            id: prod.id,
            nameNepali: prod.nameNepali,
            nameEnglish: prod.nameEnglish,
            category: prod.category,
            categoryNameNepali: prod.subCategory || 'पूजा प्याकेज',
            description: prod.shortDescription,
            tags: [],
            imageUrl: prod.imageUrl,
            suggestedPrice: prod.sellingPrice,
            samagriList: prod.packageItems || [],
          });
        }}
      />
    </div>
  );
};

