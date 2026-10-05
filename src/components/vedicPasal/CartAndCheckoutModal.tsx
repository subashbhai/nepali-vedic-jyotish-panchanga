import React, { useState } from 'react';
import { CartItem, DeliveryMethod, PaymentMethod, StoreCoupon, StoreOrder } from '../../types/vedicStoreTypes';
import { X, Trash2, MapPin, Navigation, Tag, Check, ShieldCheck, CreditCard, ArrowRight, ShoppingBag, Plus, Minus, AlertCircle, Upload, QrCode } from 'lucide-react';
import { getStoredCoupons, createOnlineOrder, submitEsewaPayment, validateTransactionIdUnique } from '../../db/vedicStore';

interface CartAndCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: StoreOrder) => void;
}

export const CartAndCheckoutModal: React.FC<CartAndCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Checkout Form State
  const [customerName, setCustomerName] = useState('रामप्रसाद शर्मा');
  const [customerPhone, setCustomerPhone] = useState('9851023456');
  const [customerAddress, setCustomerAddress] = useState('नयाँ बानेश्वर, काठमाडौँ');
  const [gpsLoc, setGpsLoc] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [deliveryInstruction, setDeliveryInstruction] = useState('घरको २ औँ तला, कालो ढोका');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // eSewa Form State
  const [esewaTxnId, setEsewaTxnId] = useState('');
  const [esewaAmount, setEsewaAmount] = useState<number | ''>('');
  const [esewaDate, setEsewaDate] = useState(new Date().toISOString().split('T')[0]);
  const [esewaTime, setEsewaTime] = useState(new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }));
  const [esewaSlipUrl, setEsewaSlipUrl] = useState<string>('');
  const [esewaError, setEsewaError] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<StoreCoupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  // Delivery charge
  const deliveryCharge =
    deliveryMethod === 'store_pickup' ? 0 : deliveryMethod === 'express' ? 250 : 150;

  // Calculate Coupon Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) return;

    const coupons = getStoredCoupons();
    const match = coupons.find(
      c => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.isActive
    );

    if (!match) {
      setCouponError('अमान्य कुपन कोड। (Invalid coupon code)');
      return;
    }

    if (subtotal < match.minOrderAmount) {
      setCouponError(`यो कुपन प्रयोग गर्न कम्तीमा रु. ${match.minOrderAmount.toLocaleString('ne-NP')} को खरिद हुनुपर्छ।`);
      return;
    }

    setAppliedCoupon(match);
    setCouponError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEsewaSlipUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCustomerAddress(`GPS स्थान: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) - काठमाडौँ`);
        },
        err => {
          alert('GPS स्थान प्राप्त गर्न सकिएन। कृपया म्यानुअल ठेगाना राख्नुहोस्।');
        }
      );
    }
  };

  const handlePlaceOrder = () => {
    setEsewaError('');

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('कृपया नाम, सम्पर्क फोन र डेलिभरी ठेगाना भर्नुहोस्।');
      return;
    }

    // eSewa Specific Validation
    if (paymentMethod === 'esewa') {
      if (!esewaTxnId.trim()) {
        setEsewaError('कृपया eSewa Transaction ID दर्ता गर्नुहोस्।');
        return;
      }

      if (!validateTransactionIdUnique(esewaTxnId)) {
        setEsewaError('यो eSewa Transaction ID पहिले नै प्रयोग भइसकेको छ। कृपया नयाँ ट्रान्सज्याक्सन ID राख्नुहोस्।');
        return;
      }

      const paidAmountNum = Number(esewaAmount) || grandTotal;
      if (paidAmountNum !== grandTotal) {
        if (!confirm(`तपाईंले बुझाएको रकम (रु. ${paidAmountNum}) र अर्डर जम्मा रकम (रु. ${grandTotal}) फरक छ। के तपाईं अगाडि बढ्न चाहनुहुन्छ? (एडमिनले म्यानुअल जाँच गर्नेछ)`)) {
          return;
        }
      }
    }

    const order = createOnlineOrder(
      cart,
      {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        gpsLocation: gpsLoc,
        deliveryInstruction,
      },
      deliveryMethod,
      deliveryCharge,
      paymentMethod,
      appliedCoupon || undefined
    );

    if (paymentMethod === 'esewa') {
      const paidAmountNum = Number(esewaAmount) || grandTotal;
      submitEsewaPayment(order.id, {
        transactionId: esewaTxnId.trim(),
        paidAmount: paidAmountNum,
        paymentDate: esewaDate,
        paymentTime: esewaTime,
        slipUrl: esewaSlipUrl || undefined,
      });
    }

    onOrderCreated(order);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[#2D241E] dark:text-stone-100 relative flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/15 rounded-xl text-[#D97706] dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                {step === 'cart' ? 'तपाईंको सपिङ कार्ट (Shopping Cart)' : 'अर्डर चेकआउट (Order Checkout)'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {step === 'cart' ? `कुल ${cart.length} प्रकारका सामग्री` : 'डेलिभरी र भुक्तानी विवरण भर्नुहोस्'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 space-y-5">
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-500">तपाईंको कार्ट खाली छ।</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#D97706] text-white rounded-xl text-xs font-bold"
              >
                सामग्रीहरू हेर्नुहोस्
              </button>
            </div>
          ) : step === 'cart' ? (
            /* Step 1: Cart Items List */
            <div className="space-y-4">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {cart.map(item => {
                  const price = item.product.discountPrice ?? item.product.sellingPrice;
                  return (
                    <div
                      key={item.product.id}
                      className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.nameNepali}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {item.product.nameNepali}
                        </h4>
                        <p className="text-xs text-[#D97706] dark:text-amber-400 font-mono font-bold mt-0.5">
                          रु. {price.toLocaleString('ne-NP')} × {item.quantity} = रु. {(price * item.quantity).toLocaleString('ne-NP')}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Bar */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-[#D97706]" /> कुपन वा डिस्काउन्ट कोड (Coupon Code):
                  </span>
                  <span className="text-[11px] text-stone-500">उदा: WELCOME10, PUJA20, VEDIC100</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="कुपन कोड प्रविष्ट गर्नुहोस्..."
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-[#D97706] text-white rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> कुपन [{appliedCoupon.code}] सफल प्रयोग भयो। (छूट: रु. {discountAmount.toLocaleString('ne-NP')})
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>उप-जम्मा (Subtotal):</span>
                  <span className="font-mono font-bold">रु. {subtotal.toLocaleString('ne-NP')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>कुपन छूट (Discount):</span>
                    <span className="font-mono">- रु. {discountAmount.toLocaleString('ne-NP')}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-[#D97706] pt-2 border-t border-[#E6E0D5] dark:border-stone-800">
                  <span>कुल जम्मा (Total):</span>
                  <span className="font-mono text-base">रु. {(subtotal - discountAmount).toLocaleString('ne-NP')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 bg-[#D97706] text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#B45309] transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>चेकआउट अगाडि बढाउनुहोस् (Proceed to Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Step 2: Checkout Form */
            <div className="space-y-4">
              {/* Customer Details Form */}
              <div className="space-y-3 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-xs">
                <h4 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D97706]" /> डेलिभरी ग्राहक विवरण (Delivery Information):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 mb-1">ग्राहकको नाम (Full Name):</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-500 mb-1">सम्पर्क फोन / Mobile:</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-stone-500">डेलिभरी ठेगाना (Address):</label>
                    <button
                      type="button"
                      onClick={handleGetGps}
                      className="text-[11px] font-bold text-[#D97706] dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> GPS स्थान लिनुहोस्
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">विशेष निर्देशन (Delivery Instruction):</label>
                  <input
                    type="text"
                    value={deliveryInstruction}
                    onChange={e => setDeliveryInstruction(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-stone-800 dark:text-stone-200">डेलिभरी माध्यम (Delivery Method):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      deliveryMethod === 'standard'
                        ? 'bg-amber-100/80 dark:bg-amber-950/60 border-[#D97706] text-[#D97706] font-bold'
                        : 'bg-white dark:bg-stone-800 border-[#E6E0D5] text-stone-600'
                    }`}
                  >
                    <div className="font-bold">Standard</div>
                    <div className="text-[10px] text-stone-500">रु. १५० (१-२ दिन)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      deliveryMethod === 'express'
                        ? 'bg-amber-100/80 dark:bg-amber-950/60 border-[#D97706] text-[#D97706] font-bold'
                        : 'bg-white dark:bg-stone-800 border-[#E6E0D5] text-stone-600'
                    }`}
                  >
                    <div className="font-bold">Express</div>
                    <div className="text-[10px] text-stone-500">रु. २५० (तुरुन्तै)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('store_pickup')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      deliveryMethod === 'store_pickup'
                        ? 'bg-amber-100/80 dark:bg-amber-950/60 border-[#D97706] text-[#D97706] font-bold'
                        : 'bg-white dark:bg-stone-800 border-[#E6E0D5] text-stone-600'
                    }`}
                  >
                    <div className="font-bold">Store Pickup</div>
                    <div className="text-[10px] text-stone-500">रु. ० (पसलमै आउने)</div>
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 text-xs">
                <label className="font-bold text-stone-800 dark:text-stone-200 block">
                  भुक्तानी माध्यम चयन गर्नुहोस् (Payment Method):
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setEsewaError('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-500/10 dark:bg-amber-950/50 border-[#D97706] text-[#D97706] dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-white dark:bg-stone-800 border-[#E6E0D5] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-[#D97706] dark:text-amber-400 shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">A. Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                        सामग्री घरमा पाएपछि मात्र नगद भुक्तानी (Payment Status: COD / भुक्तानी बाँकी)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('esewa');
                      setEsewaAmount(grandTotal);
                      setEsewaError('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      paymentMethod === 'esewa'
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/50 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm'
                        : 'bg-white dark:bg-stone-800 border-[#E6E0D5] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400">B. eSewa Direct Pay</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                        eSewa ID: <span className="font-mono font-bold text-emerald-700">97674244778</span> मा सोझै भुक्तानी
                      </div>
                    </div>
                  </button>
                </div>

                {/* eSewa Payment Submission Form Box */}
                {paymentMethod === 'esewa' && (
                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300/80 dark:border-emerald-800 space-y-3 animate-in fade-in duration-200">
                    <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-stone-500 block">eSewa भुक्तानी प्रापक ID (Receiver Number):</span>
                        <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
                          97674244778
                        </span>
                        <span className="text-[10px] text-stone-500 block">नाम: बालानन्द ज्योतिष तथा वास्तु सेवा</span>
                      </div>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300">
                        <QrCode className="w-8 h-8" />
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                      कृपया तपाईंको eSewa App बाट रु. <span className="font-bold font-mono text-emerald-700">{grandTotal.toLocaleString('ne-NP')}</span> रकम <span className="font-bold font-mono">97674244778</span> मा पठाउनुहोस् र तलको विवरण भर्नुहोस्:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                          eSewa Transaction ID <span className="text-red-500">*</span>:
                        </label>
                        <input
                          type="text"
                          placeholder="उदा: 000458921"
                          value={esewaTxnId}
                          onChange={e => {
                            setEsewaTxnId(e.target.value);
                            setEsewaError('');
                          }}
                          className="w-full bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                          भुक्तानी गरिएको रकम (Paid Amount):
                        </label>
                        <input
                          type="number"
                          value={esewaAmount === '' ? '' : esewaAmount}
                          onChange={e => setEsewaAmount(e.target.value ? Number(e.target.value) : '')}
                          placeholder={grandTotal.toString()}
                          className="w-full bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">भुक्तानी मिति (Date):</label>
                        <input
                          type="date"
                          value={esewaDate}
                          onChange={e => setEsewaDate(e.target.value)}
                          className="w-full bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">भुक्तानी समय (Time):</label>
                        <input
                          type="text"
                          value={esewaTime}
                          onChange={e => setEsewaTime(e.target.value)}
                          placeholder="10:30 AM"
                          className="w-full bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-600 dark:text-stone-300 mb-1 font-bold">
                        eSewa स्लिप / Screenshot अपलोड (Payment Slip):
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> फोटो / Slip छान्नुहोस्
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                        {esewaSlipUrl ? (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600" /> स्लिप अपलोड भयो
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-500">ऐच्छिक (Optional)</span>
                        )}
                      </div>
                      {esewaSlipUrl && (
                        <div className="mt-2 p-1 bg-white dark:bg-stone-800 rounded-lg border border-emerald-300 inline-block">
                          <img src={esewaSlipUrl} alt="eSewa Slip" className="h-16 rounded object-cover" />
                        </div>
                      )}
                    </div>

                    {esewaError && (
                      <p className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2 rounded-xl border border-red-200">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {esewaError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Final Summary Card */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>उप-जम्मा (Subtotal):</span>
                  <span className="font-mono font-bold">रु. {subtotal.toLocaleString('ne-NP')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>कुपन छूट (Discount):</span>
                    <span className="font-mono">- रु. {discountAmount.toLocaleString('ne-NP')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>डेलिभरी शुल्क (Delivery Charge):</span>
                  <span className="font-mono font-bold">रु. {deliveryCharge.toLocaleString('ne-NP')}</span>
                </div>
                <div className="flex justify-between font-black text-base text-[#D97706] pt-2 border-t border-amber-200/60">
                  <span>अन्तिम भुक्तानी रकम (Grand Total):</span>
                  <span className="font-mono text-lg">रु. {grandTotal.toLocaleString('ne-NP')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-2xl text-xs font-bold"
                >
                  फर्कनुहोस् (Back to Cart)
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3.5 bg-[#D97706] text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#B45309] transition-colors flex items-center justify-center gap-2 shadow-xl"
                >
                  <Check className="w-5 h-5" />
                  <span>अर्डर पक्का गर्नुहोस् (Confirm Order)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
