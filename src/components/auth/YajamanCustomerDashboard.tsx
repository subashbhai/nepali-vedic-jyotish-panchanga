import React, { useState, useEffect } from 'react';
import {
  RBACUser,
  RBACSession,
  SavedAddress,
  getStoredRBACUsers,
  saveRBACUsers,
  resetRBACUserPassword,
  clearRBACSession
} from '../../db/rbacStore';
import {
  getStoredOrders,
  saveOrders
} from '../../db/vedicStore';
import { StoreOrder } from '../../types/vedicStoreTypes';
import { ReceiptPrintModal } from '../ReceiptPrintModal';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  LogOut,
  Download,
  FileText,
  ShieldCheck,
  Eye,
  Store,
  Truck,
  Package,
  Heart,
  Bell,
  Sparkles,
  Check
} from 'lucide-react';

interface YajamanCustomerDashboardProps {
  session: RBACSession;
  onLogout: () => void;
  onNavigateToStore?: () => void;
}

export const YajamanCustomerDashboard: React.FC<YajamanCustomerDashboardProps> = ({
  session,
  onLogout,
  onNavigateToStore
}) => {
  const [currentUser, setCurrentUser] = useState<RBACUser | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'payments' | 'notifications'>('orders');

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<SavedAddress, 'id'>>({
    title: 'घर',
    fullName: session.fullName,
    phone: session.username,
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    ward: '१०',
    streetAddress: 'बानेश्वर, काठमाडौँ',
    isDefault: false
  });

  // Password Change State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);

  // Selected Order for Invoice/Receipt Print
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<StoreOrder | null>(null);

  useEffect(() => {
    loadUserData();
  }, [session]);

  const loadUserData = () => {
    const allUsers = getStoredRBACUsers();
    const found = allUsers.find(u => u.id === session.userId);
    if (found) {
      setCurrentUser(found);
    }

    const allOrders = getStoredOrders();
    // Filter customer orders matching phone or customer name
    const customerOrders = allOrders.filter(
      o => o.customerPhone === session.username || o.customerName === session.fullName
    );
    setOrders(customerOrders);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const addresses = currentUser.savedAddresses || [];
    const createdAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      ...newAddress
    };

    if (createdAddr.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }

    const updatedAddresses = [...addresses, createdAddr];
    const updatedUser = { ...currentUser, savedAddresses: updatedAddresses };

    const allUsers = getStoredRBACUsers();
    saveRBACUsers(allUsers.map(u => u.id === currentUser.id ? updatedUser : u));

    setCurrentUser(updatedUser);
    setIsAddAddressOpen(false);
  };

  const handleDeleteAddress = (addrId: string) => {
    if (!currentUser) return;
    const updated = (currentUser.savedAddresses || []).filter(a => a.id !== addrId);
    const updatedUser = { ...currentUser, savedAddresses: updated };

    const allUsers = getStoredRBACUsers();
    saveRBACUsers(allUsers.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass !== confirmPass) {
      setPassMsg('नयाँ पासवर्ड र पुनः प्रविष्टि मिलेन।');
      return;
    }

    if (newPass.length < 6) {
      setPassMsg('नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    const res = resetRBACUserPassword(session.username, newPass, true);
    setPassMsg(res.message);
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'current') {
      return ['Order Placed', 'Payment Confirmed', 'Order Confirmed', 'Preparing', 'Packed', 'Dispatched', 'Out for Delivery'].includes(o.orderStatus);
    }
    if (orderStatusFilter === 'delivered') return o.orderStatus === 'Delivered';
    if (orderStatusFilter === 'cancelled') return o.orderStatus === 'Cancelled' || o.orderStatus === 'Returned';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3.5 py-1 rounded-full text-amber-300 text-xs font-bold border border-amber-500/40 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>यजमान / ग्राहक ड्यासबोर्ड (Customer Portal)</span>
          </div>
          <h2 className="text-2xl font-bold font-serif">
            स्वागत छ, {session.fullName}!
          </h2>
          <p className="text-xs text-stone-300 mt-1 font-mono">
            ग्राहक ID: <span className="text-amber-400 font-bold">{session.customerId || 'BAL-YJM-2081-XXXX'}</span> | मोबाइल: {session.username}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToStore && (
            <button
              onClick={onNavigateToStore}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>वैदिक पसल सामान किन्नुहोस्</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-red-600/80 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>लगआउट</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'orders', label: `📦 अर्डर इतिहास (${orders.length})` },
          { id: 'addresses', label: `📍 डेलिभरी ठेगानाहरू (${currentUser?.savedAddresses?.length || 0})` },
          { id: 'payments', label: `💳 eSewa र भुक्तानी स्थिति` },
          { id: 'profile', label: `👤 मेरो प्रोफाइल तथा सुरक्षा` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#D97706] text-white shadow-md'
                : 'bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#231F1C] p-3 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">अर्डर फिल्टर:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'सबै अर्डर' },
                { id: 'current', label: 'प्रक्रियामा रहेका (Active)' },
                { id: 'delivered', label: 'डेलिभर भइसकेका' },
                { id: 'cancelled', label: 'रद्द गरिएका' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    orderStatusFilter === f.id
                      ? 'bg-amber-500/20 text-[#D97706] border border-amber-400'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#231F1C] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-bold text-sm">कुनै अर्डर भेटिएन</h3>
              <p className="text-xs text-stone-400">तपाईंले वैदिक पसलबाट अहिलेसम्म कुनै अर्डर गर्नुभएको छैन।</p>
              {onNavigateToStore && (
                <button
                  onClick={onNavigateToStore}
                  className="px-5 py-2.5 bg-[#D97706] text-white font-bold text-xs rounded-xl shadow"
                >
                  अहिले नै किनमेल गर्नुहोस्
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(ord => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#D97706]">
                        Order #{ord.orderNumber}
                      </span>
                      <span className="text-xs text-stone-400 block">
                        मिति: {ord.createdAt} | डेलिभरी विधि: {ord.deliveryMethod === 'store_pickup' ? 'स्टोर पिकअप' : 'होम डेलिभरी'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>

                      <button
                        onClick={() => setSelectedOrderForReceipt(ord)}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> बिल/रसिद (Invoice)
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {item.productName}
                          </span>
                          <span className="text-stone-400 font-mono text-[11px] block">
                            रु {item.unitPrice} × {item.quantity} थान
                          </span>
                        </div>
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          रु {item.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl flex items-center justify-between text-xs font-bold border border-[#E6E0D5] dark:border-stone-800">
                    <span>भुक्तानी तरिका: {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})</span>
                    <span className="text-base font-mono text-[#D97706]">कुल रकम: रु {ord.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-serif">मेरो डेलिभरी ठेगानाहरू</h3>
            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> नयाँ ठेगाना थप्नुहोस्
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentUser?.savedAddresses || []).map(addr => (
              <div
                key={addr.id}
                className={`p-4 rounded-3xl border ${
                  addr.isDefault
                    ? 'border-[#D97706] bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-[#E6E0D5] dark:border-stone-800 bg-white dark:bg-[#231F1C]'
                } space-y-2 relative shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                    {addr.title}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                      मुख्य ठेगाना (Default)
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100">{addr.fullName}</div>
                  <div className="text-stone-500 font-mono">{addr.phone}</div>
                  <div className="text-stone-700 dark:text-stone-300">{addr.streetAddress}, वडा नं. {addr.ward}</div>
                  <div className="text-stone-500">{addr.localLevel}, {addr.district}</div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E6E0D5] dark:border-stone-800">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-[#231F1C] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 space-y-3">
            <h3 className="font-bold text-sm font-serif">eSewa तथा अनलाइन भुक्तानी विवरण सूची</h3>
            <p className="text-xs text-stone-500">
              अर्डर गर्दा बुझाइएको eSewa Transaction ID र भुक्तानी स्लिपको प्रमाणीकरण स्थिति:
            </p>

            <div className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
              {orders.filter(o => o.esewaDetails).length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">कुनै eSewa भुक्तानी रेकर्ड भेटिएन।</p>
              ) : (
                orders.filter(o => o.esewaDetails).map(ord => (
                  <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        Order #{ord.orderNumber} - रु {ord.totalAmount}
                      </div>
                      <div className="font-mono text-stone-500">
                        Transaction ID: <span className="text-[#D97706] font-bold">{ord.esewaDetails?.transactionId}</span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ord.esewaDetails?.verificationStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      ord.esewaDetails?.verificationStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.esewaDetails?.verificationStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl space-y-3">
            <h3 className="font-bold text-sm font-serif">आफ्नो प्रोफाइल विवरण</h3>
            <div className="space-y-2 text-xs">
              <div><strong>पूरा नाम:</strong> {currentUser?.fullName}</div>
              <div><strong>फोन नम्बर:</strong> {currentUser?.phone}</div>
              <div><strong>इमेल:</strong> {currentUser?.email || 'उपलब्ध छैन'}</div>
              <div><strong>Customer ID:</strong> <span className="font-mono text-[#D97706] font-bold">{currentUser?.customerId}</span></div>
              <div><strong>खाता दर्ता मिति:</strong> {currentUser?.createdAtBS}</div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl space-y-3">
            <h3 className="font-bold text-sm font-serif">पासवर्ड परिवर्तन गर्नुहोस्</h3>

            {passMsg && (
              <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
                {passMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">नयाँ पासवर्ड:</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">नयाँ पासवर्ड पुनः हान्नुहोस्:</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow"
              >
                पासवर्ड अपडेट गर्नुहोस्
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-stone-800 dark:text-stone-100">
            <h3 className="font-bold text-base">नयाँ डेलिभरी ठेगाना थप्नुहोस्</h3>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">ठेगाना शीर्षक (उदा: घर/डेरा/कार्यालय):</label>
                <input
                  type="text"
                  value={newAddress.title}
                  onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">प्राप्तकर्ताको नाम:</label>
                <input
                  type="text"
                  value={newAddress.fullName}
                  onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">सम्पर्क फोन:</label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">टोल / सडक ठेगाना:</label>
                <input
                  type="text"
                  value={newAddress.streetAddress}
                  onChange={e => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkDefault"
                  checked={newAddress.isDefault}
                  onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                />
                <label htmlFor="chkDefault" className="font-bold">यसलाई मुख्य ठेगाना (Default Address) बनाउनुहोस्</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D97706] text-white font-bold rounded-xl shadow"
                >
                  सेभ गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      {selectedOrderForReceipt && (
        <ReceiptPrintModal
          isOpen={true}
          onClose={() => setSelectedOrderForReceipt(null)}
          order={selectedOrderForReceipt}
        />
      )}
    </div>
  );
};
