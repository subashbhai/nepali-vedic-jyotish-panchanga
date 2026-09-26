import React from 'react';
import { StoreOrder } from '../../types/vedicStoreTypes';
import { X, Printer, Download, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface InvoiceModalProps {
  order: StoreOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto text-[#2D241E] dark:text-stone-100 relative flex flex-col print:p-0 print:border-none print:shadow-none print:max-w-none">
        {/* Top Header Controls (Hidden on Print) */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between print:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">
              {order.orderType === 'OFFLINE_POS' ? 'काउन्टर बिक्री बिल (POS Receipt)' : 'अर्डर बीजक (Official Invoice)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#D97706] text-white rounded-xl text-xs font-bold hover:bg-[#B45309] flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6 print:text-black">
          {/* Store Brand Header */}
          <div className="flex items-start justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#D97706] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  वै
                </div>
                <div>
                  <h1 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 print:text-black">
                    बालानन्द वैदिक पसल
                  </h1>
                  <p className="text-xs text-stone-500 print:text-stone-700">
                    सनातन वैदिक सामग्री तथा धार्मिक पुस्तकहरूको विश्वस्त केन्द्र
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
                ठेगाना: नयाँ बानेश्वर, काठमाडौँ, नेपाल | फोन: +९७७-०१-४४६७००० | PAN No: 609823412
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-[#D97706] font-mono font-bold text-xs">
                {order.orderNumber}
              </span>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                मिति: {new Date(order.createdAt).toLocaleDateString('ne-NP')}
              </p>
            </div>
          </div>

          {/* Customer & Order Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs print:bg-stone-50 print:text-black">
            <div>
              <span className="text-stone-500 block mb-0.5">खरिदकर्ता (Customer):</span>
              <strong className="text-sm font-bold block">{order.customerName}</strong>
              <span className="block text-stone-600">फोन: {order.customerPhone}</span>
              <span className="block text-stone-600">ठेगाना: {order.customerAddress}</span>
            </div>

            <div className="text-right">
              <span className="text-stone-500 block mb-0.5">अर्डर स्थिति (Status):</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                {order.orderStatus}
              </span>
              <p className="text-stone-600">
                भुक्तानी: <strong>{order.paymentMethod.toUpperCase()} ({order.paymentStatus})</strong>
              </p>
              <p className="text-stone-600">
                डेलिभरी: <strong>{order.deliveryMethod}</strong>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-stone-200 dark:border-stone-800 text-stone-500">
                  <th className="py-2.5 px-2">क्र.सं.</th>
                  <th className="py-2.5 px-2">सामग्रीको नाम (Item Name)</th>
                  <th className="py-2.5 px-2 text-right">दर (Price)</th>
                  <th className="py-2.5 px-2 text-center">परिमाण</th>
                  <th className="py-2.5 px-2 text-right">जम्मा (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-2 font-mono text-stone-500">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-medium">{item.productName}</td>
                    <td className="py-2.5 px-2 text-right font-mono">रु. {item.unitPrice.toLocaleString('ne-NP')}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold">रु. {item.subtotal.toLocaleString('ne-NP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation Grid */}
          <div className="flex justify-end pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>उप-जम्मा (Subtotal):</span>
                <span className="font-mono font-bold">रु. {order.subtotal.toLocaleString('ne-NP')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>छूट (Discount):</span>
                  <span className="font-mono">- रु. {order.discountAmount.toLocaleString('ne-NP')}</span>
                </div>
              )}
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>डेलिभरी शुल्क:</span>
                  <span className="font-mono">रु. {order.deliveryCharge.toLocaleString('ne-NP')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#D97706] pt-2 border-t border-stone-300">
                <span>कुल भुक्तानी रकम:</span>
                <span className="font-mono text-base">रु. {order.totalAmount.toLocaleString('ne-NP')}</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              हाम्रो वैदिक पसलबाट खरिद गर्नुभएकोमा धन्यवाद! जय सनातन धर्म।
            </p>
            <p className="text-[11px]">
              यो कम्प्युटर प्रणालीबाट उत्पन्न गरिएको आधिकारिक डिजिटल बीजक हो।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
