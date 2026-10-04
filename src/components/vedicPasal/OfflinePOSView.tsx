import React, { useState, useEffect } from 'react';
import { Product, CartItem, StoreOrder, DailyCashRegister, SalesReturn } from '../../types/vedicStoreTypes';
import {
  processPOSSale,
  getStoredOrders,
  getStoredDailyCashRegister,
  saveDailyCashRegister,
  getStoredSalesReturns,
  processSalesReturn
} from '../../db/vedicStore';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  User,
  CreditCard,
  Banknote,
  DollarSign,
  History,
  RotateCcw,
  Receipt,
  Sparkles,
  Calendar
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { handlePhoneticInputKeyDown } from '../../utils/nepaliTransliteration';

interface OfflinePOSViewProps {
  products: Product[];
  onProductsUpdated: () => void;
}

export const OfflinePOSView: React.FC<OfflinePOSViewProps> = ({ products, onProductsUpdated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'history' | 'cash_register'>('pos');

  // Search & Cart
  const [searchQuery, setSearchQuery] = useState('');
  const [posCart, setPosCart] = useState<CartItem[]>([]);

  // Customer Mode: Walk-in vs Registered
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [customerName, setCustomerName] = useState('काउन्टर ग्राहक (Walk-in)');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Billing & Payment State
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'esewa'>('cash');
  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [esewaTxnId, setEsewaTxnId] = useState('');
  const [salespersonName, setSalespersonName] = useState('रामकाजी श्रेष्ठ (काउन्टर Sales)');

  // Invoices & History
  const [lastOrder, setLastOrder] = useState<StoreOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState<StoreOrder[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  // Daily Cash Register
  const [cashRegister, setCashRegister] = useState<DailyCashRegister>(getStoredDailyCashRegister());
  const [actualCashInput, setActualCashInput] = useState<number>(cashRegister.actualClosingCash);

  // Sales Return Modal State
  const [returnOrder, setReturnOrder] = useState<StoreOrder | null>(null);
  const [returnReason, setReturnReason] = useState('ग्राहकले सामान साट्न वा फिर्ता गर्न चाहेको');
  const [returnQtys, setReturnQtys] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = getStoredOrders();
    setOrdersHistory(allOrders.filter(o => o.orderType === 'OFFLINE_POS'));
    const reg = getStoredDailyCashRegister();
    setCashRegister(reg);
    setActualCashInput(reg.actualClosingCash);
  };

  // Filter products by search query
  const searchResults = searchQuery.trim()
    ? products.filter(
        p =>
          p.nameNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery.trim())
      )
    : products.slice(0, 8); // initial 8 items

  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert('यो सामग्रीको स्टक समाप्त भएको छ।');
      return;
    }

    setPosCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert('उपलब्ध स्टक भन्दा बढी थप्न सकिँदैन।');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setPosCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setPosCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const subtotal = posCart.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const receivedNum = Number(amountReceived) || 0;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, receivedNum - grandTotal) : 0;

  const handleCompleteSale = () => {
    if (posCart.length === 0) {
      alert('बिक्री बिलमा कम्तीमा १ वटा सामग्री थप्नुहोस्।');
      return;
    }

    if (paymentMethod === 'cash' && receivedNum < grandTotal) {
      if (!confirm(`प्राप्त रकम (रु. ${receivedNum}) जम्मा बिल रकम (रु. ${grandTotal}) भन्दा कम छ। के तपाईं अगाडि बढ्न चाहनुहुन्छ?`)) {
        return;
      }
    }

    const finalCustomerName = isWalkIn ? 'काउन्टर ग्राहक (Walk-in)' : customerName;

    const order = processPOSSale(
      posCart,
      {
        name: finalCustomerName,
        phone: customerPhone,
        address: customerAddress,
        isWalkIn
      },
      discountAmount,
      paymentMethod,
      receivedNum,
      salespersonName,
      esewaTxnId
    );

    setLastOrder(order);
    setIsInvoiceOpen(true);

    // Reset POS State
    setPosCart([]);
    setDiscountAmount(0);
    setAmountReceived('');
    setEsewaTxnId('');
    setSearchQuery('');
    loadData();
    onProductsUpdated();
  };

  const handleSaveCashRegister = () => {
    const updated: DailyCashRegister = {
      ...cashRegister,
      actualClosingCash: Number(actualCashInput),
      difference: Number(actualCashInput) - cashRegister.expectedClosingCash,
      updatedAt: new Date().toLocaleString('ne-NP')
    };
    saveDailyCashRegister(updated);
    setCashRegister(updated);
    alert('दैनिक काउन्टर क्यास रेजिस्टर अद्यावधिक भयो!');
  };

  const handleOpenSalesReturn = (ord: StoreOrder) => {
    setReturnOrder(ord);
    const initialQtys: { [id: string]: number } = {};
    ord.items.forEach(it => {
      initialQtys[it.productId] = it.quantity;
    });
    setReturnQtys(initialQtys);
  };

  const handleConfirmReturn = () => {
    if (!returnOrder) return;

    const itemsToReturn = Object.entries(returnQtys).map(([productId, quantity]) => ({
      productId,
      quantity: Number(quantity)
    })).filter(i => i.quantity > 0);

    if (itemsToReturn.length === 0) {
      alert('कृपया फिर्ता गर्ने कम्तीमा १ सामग्रीको सङ्ख्या तोक्नुहोस्।');
      return;
    }

    const res = processSalesReturn(returnOrder.id, itemsToReturn, returnReason, salespersonName);
    alert(res.message);
    setReturnOrder(null);
    loadData();
    onProductsUpdated();
  };

  const filteredHistory = historySearch.trim()
    ? ordersHistory.filter(
        o =>
          (o.billNumber && o.billNumber.toLowerCase().includes(historySearch.toLowerCase())) ||
          o.orderNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
          o.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
          o.customerPhone.includes(historySearch.trim())
      )
    : ordersHistory;

  return (
    <div className="space-y-6">
      {/* Top Bar Header & Navigation */}
      <div className="bg-gradient-to-r from-stone-800 via-stone-900 to-[#2D241E] text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
            <Barcode className="w-4 h-4" />
            <span>काउन्टर बिक्री तथा बारकोड POS प्रणाली</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            अफलाइन पसल काउन्टर (Offline Store Billing)
          </h2>
          <p className="text-xs text-stone-300">
            काउन्टर बिक्री, स्वतः स्टक कट्टा, युनिक बिल नं र क्यास रेजिस्टर व्यवस्थापन।
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex bg-stone-900/80 p-1.5 rounded-2xl border border-stone-700/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('pos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'pos'
                ? 'bg-[#D97706] text-white shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>काउन्टर बिल (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'history'
                ? 'bg-[#D97706] text-white shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>बिक्री इतिहास (Sales History)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cash_register')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'cash_register'
                ? 'bg-[#D97706] text-white shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>क्यास रेजिस्टर (Cash Register)</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'pos' ? (
        /* POS Main Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Search & Product Quick Picker */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="सामग्रीको नाम, बारकोड वा SKU (उदा: agarbatti + Space)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {searchResults.map(p => {
                const price = p.discountPrice ?? p.sellingPrice;
                const isOut = p.stockQuantity <= 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    disabled={isOut}
                    className="p-3 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl hover:border-[#D97706] transition-all text-left flex items-center gap-3 disabled:opacity-50"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.nameNepali}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {p.nameNepali}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono">SKU: {p.sku}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-[#D97706] font-mono">
                          रु. {price.toLocaleString('ne-NP')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOut
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          स्टक: {p.stockQuantity}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Billing Box */}
          <div className="lg:col-span-5 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 rounded-3xl shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
                <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200 font-serif flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-[#D97706]" /> काउन्टर बिक्री रसीद (POS Billing)
                </h3>
                <span className="text-xs font-mono font-bold text-stone-500">
                  {posCart.length} आइटम
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                {posCart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    बायाँतर्फ सामग्री छनौट गर्नुहोस्।
                  </div>
                ) : (
                  posCart.map(item => {
                    const price = item.product.discountPrice ?? item.product.sellingPrice;
                    return (
                      <div
                        key={item.product.id}
                        className="p-2.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold truncate">{item.product.nameNepali}</div>
                          <div className="text-stone-500 font-mono">
                            रु. {price} × {item.quantity} = रु. {price * item.quantity}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 bg-stone-200 dark:bg-stone-800 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold font-mono">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 bg-stone-200 dark:bg-stone-800 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Customer Mode Selection */}
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-300">ग्राहक प्रकार:</span>
                  <div className="flex bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWalkIn(true);
                        setCustomerName('काउन्टर ग्राहक (Walk-in)');
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        isWalkIn ? 'bg-[#D97706] text-white shadow' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Walk-in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsWalkIn(false);
                        setCustomerName('');
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        !isWalkIn ? 'bg-[#D97706] text-white shadow' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Registered
                    </button>
                  </div>
                </div>

                {!isWalkIn && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-stone-500 mb-0.5 font-bold">ग्राहकको नाम (Customer Name):</label>
                      <input
                        type="text"
                        placeholder="नाम प्रविष्ट गर्नुहोस् (उदा: ram bahadur + space)..."
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        onKeyDown={e => handlePhoneticInputKeyDown(e, customerName, setCustomerName)}
                        className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-500 mb-0.5">सम्पर्क फोन (Phone):</label>
                      <input
                        type="text"
                        placeholder="98XXXXXXXX"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method & Amount Received Calculation */}
              <div className="space-y-2 text-xs pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-[#D97706] font-bold text-[#D97706]'
                        : 'bg-stone-50 dark:bg-stone-800 border-[#E6E0D5] text-stone-600'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      <Banknote className="w-3.5 h-3.5" /> Cash / नगद
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('esewa')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'esewa'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-600 font-bold text-emerald-700'
                        : 'bg-stone-50 dark:bg-stone-800 border-[#E6E0D5] text-stone-600'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> eSewa QR
                    </div>
                  </button>
                </div>

                {paymentMethod === 'cash' ? (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60">
                    <div>
                      <label className="block text-stone-600 mb-0.5 font-bold">प्राप्त नगद (Received):</label>
                      <input
                        type="number"
                        value={amountReceived === '' ? '' : amountReceived}
                        onChange={e => setAmountReceived(e.target.value ? Number(e.target.value) : '')}
                        placeholder={grandTotal.toString()}
                        className="w-full bg-white dark:bg-stone-800 border border-amber-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-0.5 font-bold">फिर्ता रकम (Change):</label>
                      <div className="px-2 py-1 bg-white dark:bg-stone-800 border border-amber-300 rounded-lg text-xs font-mono font-black text-emerald-600">
                        रु. {changeAmount.toLocaleString('ne-NP')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-stone-500 mb-0.5">eSewa Txn ID (ऐच्छिक):</label>
                    <input
                      type="text"
                      placeholder="उदा: 00045821"
                      value={esewaTxnId}
                      onChange={e => setEsewaTxnId(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-emerald-300 rounded-xl px-2.5 py-1 text-xs font-mono uppercase"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-500 mb-0.5">काउन्टर छूट (Discount NRs):</label>
                  <input
                    type="number"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Total & Action Button */}
            <div className="space-y-3 pt-3 border-t border-[#E6E0D5] dark:border-stone-800 text-xs">
              <div className="flex justify-between font-extrabold text-base text-[#D97706]">
                <span>जम्मा बिल रकम:</span>
                <span className="font-mono text-lg">रु. {grandTotal.toLocaleString('ne-NP')}</span>
              </div>

              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={posCart.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>बिक्री सम्पन्न रसीद प्रिन्ट गर्नुहोस् (Complete & Print)</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'history' ? (
        /* Offline Sales History & Bill Reprint */
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="बिल नं (OFF-2083-...), ग्राहक वा फोन नं..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <span className="text-xs font-bold text-stone-500">
              कुल {filteredHistory.length} वटा अफलाइन बीजकहरू
            </span>
          </div>

          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E6E0D5] text-stone-500 text-xs">
                कुनै अफलाइन बिक्री भेटिएन।
              </div>
            ) : (
              filteredHistory.map(ord => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200">
                        {ord.billNumber || ord.orderNumber}
                      </span>
                      <span className="text-stone-500">
                        ({new Date(ord.createdAt).toLocaleString('ne-NP')})
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                        {ord.paymentMethod.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-stone-800 dark:text-stone-200 font-bold">
                      ग्राहक: {ord.customerName} {ord.customerPhone ? `(${ord.customerPhone})` : ''}
                    </p>

                    <div className="text-stone-500">
                      विक्रेता: <strong>{ord.salespersonName || 'काउन्टर'}</strong> | सामग्रीहरू:{' '}
                      {ord.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-[#D97706]">
                        रु. {ord.totalAmount.toLocaleString('ne-NP')}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {ord.orderStatus === 'Returned' ? (
                          <span className="text-red-600 font-bold">बिक्री फिर्ता भयो</span>
                        ) : (
                          'चुक्ता भयो'
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLastOrder(ord);
                        setIsInvoiceOpen(true);
                      }}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>बिल पुनः प्रिन्ट (Reprint)</span>
                    </button>

                    {ord.orderStatus !== 'Returned' && (
                      <button
                        type="button"
                        onClick={() => handleOpenSalesReturn(ord)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-red-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>बिक्री फिर्ता</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Daily Cash Register Screen */
        <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-6 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#D97706]" /> दैनिक काउन्टर क्यास रेजिस्टर (Daily Cash Register)
              </h3>
              <p className="text-xs text-stone-500">मिती: {cashRegister.date}</p>
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
              काउन्टर म्यानेजर
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-1">
              <span className="text-stone-500 block">सुरुवाती नगद (Opening Float):</span>
              <span className="font-mono text-base font-bold">रु. {cashRegister.openingCash.toLocaleString('ne-NP')}</span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-1">
              <span className="text-emerald-700 dark:text-emerald-300 block font-bold">आजको नगद बिक्री (Cash Sales):</span>
              <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-300">
                रु. {cashRegister.cashSales.toLocaleString('ne-NP')}
              </span>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-1">
              <span className="text-stone-500 block">अपेक्षित बन्द नगद (Expected Closing Cash):</span>
              <span className="font-mono text-base font-bold text-[#D97706]">
                रु. {cashRegister.expectedClosingCash.toLocaleString('ne-NP')}
              </span>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-stone-700 dark:text-stone-300 block font-bold">वास्तविक गनेको नगद (Actual Counted Cash):</span>
              <input
                type="number"
                value={actualCashInput}
                onChange={e => setActualCashInput(Number(e.target.value))}
                className="w-full bg-white dark:bg-stone-800 border border-amber-300 rounded-xl px-3 py-1.5 font-mono text-sm font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold">फरक (Difference / Short-Over):</span>
            <span
              className={`font-mono font-black text-sm ${
                actualCashInput - cashRegister.expectedClosingCash < 0
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}
            >
              रु. {(actualCashInput - cashRegister.expectedClosingCash).toLocaleString('ne-NP')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveCashRegister}
            className="w-full py-3 bg-[#D97706] text-white rounded-2xl text-xs font-bold hover:bg-[#B45309] transition-colors"
          >
            काउन्टर बन्द / क्यास रेजिस्टर सेभ गर्नुहोस्
          </button>
        </div>
      )}

      {/* Sales Return Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              बिक्री फिर्ता तथा स्टक रिस्टोर (Sales Return)
            </h3>
            <p className="text-xs text-stone-500">
              बिल No: <span className="font-mono font-bold">{returnOrder.billNumber || returnOrder.orderNumber}</span>
            </p>

            <div className="space-y-3 text-xs">
              <label className="font-bold block">फिर्ता गरिने सामग्रीहरू छनौट गर्नुहोस्:</label>
              {returnOrder.items.map(it => (
                <div key={it.productId} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800 rounded-xl">
                  <div>
                    <div className="font-bold">{it.productName}</div>
                    <div className="text-[11px] text-stone-500 font-mono">दर: रु. {it.unitPrice} | जम्मा: {it.quantity} थान</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-stone-500">फिर्ता थान:</span>
                    <input
                      type="number"
                      min="0"
                      max={it.quantity}
                      value={returnQtys[it.productId] ?? 0}
                      onChange={e => {
                        const val = Math.min(it.quantity, Math.max(0, Number(e.target.value)));
                        setReturnQtys(prev => ({ ...prev, [it.productId]: val }));
                      }}
                      className="w-16 bg-white dark:bg-stone-900 border rounded-lg px-2 py-1 text-center font-mono font-bold"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="font-bold block mb-1">फिर्ता कारण (Reason):</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnOrder(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                फिर्ता पक्का गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for POS */}
      <InvoiceModal
        order={lastOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

