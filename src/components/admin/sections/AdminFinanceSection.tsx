import React, { useState } from 'react';
import { DollarSign, CheckCircle2, XCircle, Search, Eye, RefreshCw } from 'lucide-react';
import { EsewaPaymentRequest, formatNPRCurrency } from '../../../db/subscriptionStore';

interface AdminFinanceSectionProps {
  esewaRequests: EsewaPaymentRequest[];
  onApprovePayment: (requestId: string) => void;
  onRejectPayment: (requestId: string, reason: string) => void;
  onRefresh: () => void;
}

export const AdminFinanceSection: React.FC<AdminFinanceSectionProps> = ({
  esewaRequests,
  onApprovePayment,
  onRejectPayment,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<EsewaPaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = esewaRequests.filter(r => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transactionCode.includes(searchQuery) ||
      r.userPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>वित्तीय र भुक्तानी प्रमाणीकरण (Payment Verification Center)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">eSewa र बैंक खातामा प्राप्त रकम प्रमाणीकरण तथा रसिद जारी।</p>
        </div>

        <button onClick={onRefresh} className="p-2 bg-stone-800 text-stone-300 rounded-xl border border-stone-700 text-xs">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="नाम, कारोबार कोड (Transaction Code) वा फोनबाट खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">सबै स्थिति (All Status)</option>
            <option value="pending">प्रमाणीकरण बाँकी (Pending)</option>
            <option value="approved">स्वीकृत (Approved)</option>
            <option value="rejected">अस्वीकृत (Rejected)</option>
          </select>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">प्रयोगकर्ता</th>
                <th className="p-3.5">कारोबार कोड (Txn ID)</th>
                <th className="p-3.5">रकम (NPR)</th>
                <th className="p-3.5">भुक्तानी मिति</th>
                <th className="p-3.5">अवस्था</th>
                <th className="p-3.5 text-right">कार्यहरू</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500 italic">कुनै भुक्तानी निवेदन भेटिएन।</td>
                </tr>
              ) : (
                filteredRequests.map(r => (
                  <tr key={r.requestId} className="hover:bg-stone-800/40">
                    <td className="p-3.5 font-bold text-stone-100">{r.userName} ({r.userPhone})</td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{r.transactionCode}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{formatNPRCurrency(r.submittedAmountNPR || r.expectedAmountNPR)}</td>
                    <td className="p-3.5 font-mono text-stone-400">{r.paymentDateBS}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        r.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => onApprovePayment(r.requestId)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]">
                            स्वीकृत
                          </button>
                          <button onClick={() => setSelectedRequest(r)} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]">
                            अस्वीकृत
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-stone-200">
            <h3 className="font-bold text-stone-100">भुक्तानी अस्वीकृत गर्ने कारण</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="कारोबार कोड म्याच नभएको..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onRejectPayment(selectedRequest.requestId, rejectionReason || 'अमान्य कोड');
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                पुष्टि गर्नुहोस्
              </button>
              <button onClick={() => setSelectedRequest(null)} className="py-2 px-4 bg-stone-800 text-stone-300 font-bold text-xs rounded-xl">
                रद्द
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
