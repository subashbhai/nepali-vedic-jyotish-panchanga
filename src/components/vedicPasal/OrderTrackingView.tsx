import React, { useState } from 'react';
import { StoreOrder, OrderStatus } from '../../types/vedicStoreTypes';
import { Package, Clock, CheckCircle2, Truck, MapPin, Printer, ShieldCheck, ChevronRight, CreditCard, AlertCircle, Upload, Check } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { submitEsewaPayment } from '../../db/vedicStore';

interface OrderTrackingViewProps {
  orders: StoreOrder[];
}

const ORDER_STEPS: OrderStatus[] = [
  'Order Placed',
  'Payment Confirmed',
  'Order Confirmed',
  'Preparing',
  'Packed',
  'Dispatched',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  // Reupload Modal state
  const [reuploadOrder, setReuploadOrder] = useState<StoreOrder | null>(null);
  const [newTxnId, setNewTxnId] = useState('');
  const [newSlipUrl, setNewSlipUrl] = useState('');

  const handleReuploadSubmit = () => {
    if (!reuploadOrder) return;
    if (!newTxnId.trim()) {
      alert('कृपया eSewa Transaction ID राख्नुहोस्।');
      return;
    }

    const res = submitEsewaPayment(reuploadOrder.id, {
      transactionId: newTxnId.trim(),
      paidAmount: reuploadOrder.totalAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentTime: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
      slipUrl: newSlipUrl || reuploadOrder.esewaDetails?.slipUrl,
    });

    if (res.success) {
      alert(res.message);
      setReuploadOrder(null);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-amber-200 text-xs font-bold border border-amber-400/30">
            <Package className="w-4 h-4" />
            <span>अर्डर ट्र्याकिङ तथा भुक्तानी स्थिति</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif">
            मेरो खरिद अर्डरहरू र भुक्तानी (My Orders & Payments)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90">
            वैदिक पसलबाट गर्नुभएको अर्डर र eSewa/COD भुक्तानी प्रमाणीकरण स्थिति हेर्नुहोस्।
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 mt-6 border-t border-amber-700/50 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-black/30 text-amber-200 hover:bg-black/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>मेरो अर्डरहरू ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-black/30 text-amber-200 hover:bg-black/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>मेरो भुक्तानी स्थिति (My Payments)</span>
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        /* Orders List */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
              तपाईंले अहिलेसम्म कुनै अर्डर गर्नुभएको छैन।
            </div>
          ) : (
            orders.map(order => {
              const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6E0D5] dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#D97706] bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-stone-500">
                          ({new Date(order.createdAt).toLocaleDateString('ne-NP')})
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                        ग्राहक: <strong>{order.customerName}</strong> ({order.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-[#D97706] font-mono">
                        रु. {order.totalAmount.toLocaleString('ne-NP')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsInvoiceOpen(true);
                        }}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>बीजक/बिल</span>
                      </button>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="text-xs space-y-1">
                    <span className="text-stone-500 font-bold">खरिद गरिएका सामग्रीहरू:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="bg-stone-50 dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-[#E6E0D5] dark:border-stone-800 font-medium text-stone-700 dark:text-stone-300"
                        >
                          {it.productName} ({it.quantity} थान)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Order Status Step Timeline */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-stone-500 block mb-2">डेलिभरी प्रगति (Live Tracking):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step}
                            className={`p-2 rounded-xl text-center border text-[10px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-[#D97706] text-white border-[#B45309] shadow-sm ring-2 ring-amber-500/30'
                                : isCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-stone-50 dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'
                            }`}
                          >
                            <div>{step}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Payments Tab */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
              कुनै भुक्तानी रेकर्ड भेटिएन।
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#D97706] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {order.paymentMethod === 'cod'
                          ? 'Cash on Delivery (COD)'
                          : order.paymentMethod === 'esewa'
                          ? 'eSewa Direct Payment'
                          : 'Counter Cash'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      अर्डर मिति: {new Date(order.createdAt).toLocaleString('ne-NP')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {order.paymentStatus === 'Paid' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> भुक्तानी स्वीकृत (Paid)
                      </span>
                    ) : order.paymentStatus === 'Verification Pending' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> प्रमाणीकरण बाँकी (Verification Pending)
                      </span>
                    ) : order.paymentStatus === 'Rejected' ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full text-xs font-bold flex items-center gap-1 border border-red-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" /> अस्वीकृत (Rejected)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-xs font-bold border border-stone-300">
                        भुक्तानी बाँकी (COD)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-800">
                  <div>
                    <span className="text-stone-500 block">जम्मा रकम (Total Amount):</span>
                    <span className="font-mono font-bold text-sm text-[#D97706]">
                      रु. {order.totalAmount.toLocaleString('ne-NP')}
                    </span>
                  </div>

                  {order.esewaDetails && (
                    <>
                      <div>
                        <span className="text-stone-500 block">eSewa Txn ID:</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                          {order.esewaDetails.transactionId}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-500 block">भुक्तानी मिति / समय:</span>
                        <span className="text-stone-800 dark:text-stone-100 font-medium">
                          {order.esewaDetails.paymentDate} ({order.esewaDetails.paymentTime})
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {order.esewaDetails?.rejectionReason && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                    एडमिन नोट: {order.esewaDetails.rejectionReason}
                  </p>
                )}

                {(order.paymentStatus === 'Rejected' || order.esewaDetails?.verificationStatus === 'Reupload Requested') && (
                  <button
                    type="button"
                    onClick={() => {
                      setReuploadOrder(order);
                      setNewTxnId(order.esewaDetails?.transactionId || '');
                    }}
                    className="px-3.5 py-2 bg-[#D97706] text-white rounded-xl text-xs font-bold hover:bg-[#B45309] transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-4 h-4" />
                    <span>eSewa विवरण / Slip पुनः पठाउनुहोस् (Resubmit eSewa Slip)</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reupload Slip Modal */}
      {reuploadOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              eSewa भुक्तानी पुनः सबमिट (Re-submit Payment)
            </h3>
            <p className="text-xs text-stone-500">
              अर्डर No: <span className="font-mono font-bold">{reuploadOrder.orderNumber}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-bold">eSewa Transaction ID:</label>
                <input
                  type="text"
                  value={newTxnId}
                  onChange={e => setNewTxnId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-bold">नयाँ Slip Photo Upload:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onloadend = () => setNewSlipUrl(r.result as string);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="w-full text-xs text-stone-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setReuploadOrder(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleReuploadSubmit}
                className="px-4 py-2 bg-[#D97706] text-white rounded-xl text-xs font-bold"
              >
                सबमिट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        order={selectedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

