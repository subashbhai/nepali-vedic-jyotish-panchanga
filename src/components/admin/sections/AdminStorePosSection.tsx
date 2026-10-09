import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  Package,
  Filter,
  Eye,
  Check,
  XCircle,
  RefreshCw,
  Phone,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { Product, StoreOrder, OrderStatus } from '../../../types/vedicStoreTypes';
import { formatNPRCurrency } from '../../../db/subscriptionStore';
import { updateOrderStatus, getStoredOrders } from '../../../db/vedicStore';
import { InvoiceModal } from '../../vedicPasal/InvoiceModal';

interface AdminStorePosSectionProps {
  products: Product[];
  orders: StoreOrder[];
  onRefresh: () => void;
}

export const AdminStorePosSection: React.FC<AdminStorePosSectionProps> = ({
  products,
  orders: initialOrders,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<StoreOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [liveOrders, setLiveOrders] = useState<StoreOrder[]>(initialOrders);

  // Sync orders with incoming props and real-time events
  useEffect(() => {
    setLiveOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      setLiveOrders(getStoredOrders());
    };
    window.addEventListener('vedic-orders-updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('balananda_store_sync_channel');
      bc.onmessage = () => {
        handleOrdersUpdated();
      };
    } catch {}

    const interval = setInterval(handleOrdersUpdated, 2000);

    return () => {
      window.removeEventListener('vedic-orders-updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setLiveOrders(getStoredOrders());
    onRefresh();
  };

  const filteredOrders = liveOrders.filter(ord => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.customerPhone.includes(q) ||
      (ord.customerAddress && ord.customerAddress.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') {
      return ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled';
    }
    if (statusFilter === 'esewa') {
      return ord.paymentMethod === 'esewa';
    }
    return ord.orderStatus === statusFilter;
  });

  const totalSalesRevenue = liveOrders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrdersCount = liveOrders.filter(
    o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Summary */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-stone-100 flex items-center gap-2.5 font-serif">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>वैदिक पसल तथा POS अर्डर केन्द्र (Vaidik Pasal Orders)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            ग्राहकहरूले अनलाइन तथा काउन्टरबाट दिएका प्रत्यक्ष अर्डरहरू, भुक्तानी र डेलिभरी व्यवस्थापन।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-950/80 border border-stone-800 px-3.5 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">कुल अर्डरहरू</span>
            <span className="text-lg font-mono font-black text-amber-400">{liveOrders.length}</span>
          </div>
          <div className="bg-stone-950/80 border border-stone-800 px-3.5 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">डेलिभरी बाँकी</span>
            <span className="text-lg font-mono font-black text-rose-400">{pendingOrdersCount}</span>
          </div>
          <div className="bg-stone-950/80 border border-stone-800 px-3.5 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">कुल बिक्री रकम</span>
            <span className="text-lg font-mono font-black text-emerald-400">{formatNPRCurrency(totalSalesRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>लाइभ अर्डरहरू ({liveOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'products'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>पूजा सामग्री उत्पाद सूची ({products.length})</span>
          </button>
        </div>

        {activeSubTab === 'orders' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ग्राहकको नाम, फोन, अर्डर नम्बर..."
                className="pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-52 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">सबै अर्डरहरू</option>
              <option value="pending">प्रक्रियामा बाँकी (Pending)</option>
              <option value="esewa">eSewa भुक्तानी</option>
              <option value="Delivered">डेलिभरी भइसकेका (Delivered)</option>
              <option value="Cancelled">रद्द गरिएका (Cancelled)</option>
            </select>
          </div>
        )}
      </div>

      {/* Orders List View */}
      {activeSubTab === 'orders' ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-400 space-y-2">
              <Package className="w-12 h-12 mx-auto text-stone-600 mb-2" />
              <p className="font-bold text-sm">कुनै पनि अर्डर फेला परेन।</p>
              <p className="text-xs text-stone-500">नयाँ ग्राहकहरूले अर्डर प्लेस गर्नासाथ यहाँ तत्काल देखिनेछ।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">अर्डर/बिल नं</th>
                    <th className="p-3.5">मिति र समय</th>
                    <th className="p-3.5">ग्राहक विवरण</th>
                    <th className="p-3.5">सामग्रीहरू</th>
                    <th className="p-3.5">भुक्तानी (Payment)</th>
                    <th className="p-3.5 text-right">रकम</th>
                    <th className="p-3.5">डेलिभरी स्थिति (Status)</th>
                    <th className="p-3.5 text-right">बीजक / कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-stone-850/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        {ord.billNumber || ord.orderNumber}
                        <span className="block text-[10px] text-stone-500 font-normal">
                          {ord.orderType === 'OFFLINE_POS' ? 'काउन्टर POS' : 'अनलाइन अर्डर'}
                        </span>
                      </td>

                      <td className="p-3.5 text-stone-400 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString('ne-NP')}
                        <span className="block text-[10px] text-stone-500">
                          {new Date(ord.createdAt).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-stone-100 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{ord.customerName}</span>
                        </div>
                        <div className="text-[11px] text-amber-500/90 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{ord.customerPhone}</span>
                        </div>
                        {ord.customerAddress && (
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{ord.customerAddress}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1 max-w-xs">
                          {ord.items.slice(0, 2).map((it, idx) => (
                            <div key={idx} className="text-[11px] text-stone-300">
                              • {it.productName} <span className="text-stone-500">x{it.quantity}</span>
                            </div>
                          ))}
                          {ord.items.length > 2 && (
                            <span className="text-[10px] text-amber-400/80">
                              + थप {ord.items.length - 2} सामग्री...
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentMethod === 'esewa'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          }`}
                        >
                          {ord.paymentMethod.toUpperCase()}
                        </span>
                        <span className="block text-[10px] text-stone-400 mt-1">
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                        रु. {ord.totalAmount.toLocaleString('ne-NP')}
                      </td>

                      <td className="p-3.5">
                        <select
                          value={ord.orderStatus}
                          onChange={e => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-950/70 border-rose-800 text-rose-400'
                              : 'bg-stone-950 border-stone-700 text-amber-400'
                          }`}
                        >
                          <option value="Order Placed">Order Placed (अर्डर प्राप्त)</option>
                          <option value="Payment Confirmed">Payment Confirmed (भुक्तानी प्रमाणित)</option>
                          <option value="Order Confirmed">Order Confirmed (पुष्टि भयो)</option>
                          <option value="Preparing">Preparing (प्याकिङ तयारी)</option>
                          <option value="Packed">Packed (प्याक सम्पन्न)</option>
                          <option value="Dispatched">Dispatched (पठाइयो)</option>
                          <option value="Out for Delivery">Out for Delivery (डेलिभरीमा)</option>
                          <option value="Delivered">Delivered (डेलिभरी सम्पन्न)</option>
                          <option value="Cancelled">Cancelled (रद्द)</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceOrder(ord);
                            setIsInvoiceOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>रसिद/बिल</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Products Table View */
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3">सामग्रीको नाम</th>
                <th className="p-3">क्याटेगोरी</th>
                <th className="p-3">मूल्य</th>
                <th className="p-3">मौज्दात स्टक</th>
                <th className="p-3">अवस्था</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-stone-800/40">
                  <td className="p-3 font-bold text-stone-100">{p.nameNepali}</td>
                  <td className="p-3 text-stone-400">{p.category}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{formatNPRCurrency(p.sellingPrice)}</td>
                  <td className="p-3 font-mono">{p.stockQuantity} {p.unit}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full text-[10px] font-bold">
                      सक्रिय
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal for Printable Receipt */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
