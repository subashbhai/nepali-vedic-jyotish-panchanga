import React, { useState } from 'react';
import { ShoppingBag, CreditCard, PackageX, Plus, Edit2, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { Product, StoreOrder } from '../../../types/vedicStoreTypes';
import { formatNPRCurrency } from '../../../db/subscriptionStore';

interface AdminStorePosSectionProps {
  products: Product[];
  orders: StoreOrder[];
  onRefresh: () => void;
}

export const AdminStorePosSection: React.FC<AdminStorePosSectionProps> = ({
  products,
  orders,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'pos'>('products');

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>वैदिक पसल तथा POS काउन्टर व्यवस्थापन (Vaidik Pasal & POS)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            सामग्री स्टक, अर्डर प्याकिङ, डेलिभरी र POS काउन्टर बिक्री नियन्त्रण।
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${activeSubTab === 'products' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-300'}`}
        >
          पूजा सामग्री उत्पादहरू ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${activeSubTab === 'orders' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-300'}`}
        >
          अर्डरहरू ({orders.length})
        </button>
      </div>

      {activeSubTab === 'products' ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-x-auto">
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
              {products.slice(0, 10).map(p => (
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
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 italic">
          अर्डर सूची अद्यावधिक छ।
        </div>
      )}
    </div>
  );
};
