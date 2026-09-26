import React, { useState } from 'react';
import {
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react';
import { Booking, BookingStatus } from '../../../types/yajamanTypes';

interface AdminBookingSectionProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, newStatus: BookingStatus, note?: string) => void;
  onRefresh: () => void;
}

export const AdminBookingSection: React.FC<AdminBookingSectionProps> = ({
  bookings,
  onUpdateBookingStatus,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => {
    const serviceName = b.serviceType || b.categoryName || '';
    const matchesSearch =
      serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.yajamanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.providerName && b.providerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>केन्द्रीय सेवा बुकिङ नियन्त्रण कक्ष (Centralized Booking Control)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            ज्योतिष, पूजा, कर्मकाण्ड, वास्तु र अन्य सबै सेवा अनुरोधहरूको प्रत्यक्ष अनुगमन र ओभरराइड नियन्त्रण।
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 text-xs transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="सेवा, यजमान वा विशेषज्ञको नामबाट खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">सबै बुकिङ अवस्था (All Status)</option>
            <option value="REQUESTED">अनुरोध गरिएको (Requested)</option>
            <option value="MATCHING">म्याचिङ भइरहेको (Matching)</option>
            <option value="ACCEPTED">स्वीकृत (Accepted)</option>
            <option value="CONFIRMED">पुष्टि भएको (Confirmed)</option>
            <option value="IN_PROGRESS">सञ्चालनमा (In Progress)</option>
            <option value="COMPLETED">सम्पन्न (Completed)</option>
            <option value="CANCELLED_BY_YAJAMAN">यजमानद्वारा रद्द</option>
            <option value="CANCELLED_BY_PROVIDER">विशेषज्ञद्वारा रद्द</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">सेवा / कोड</th>
                <th className="p-3.5">यजमान विवरण</th>
                <th className="p-3.5">तोकिएको विशेषज्ञ</th>
                <th className="p-3.5">मिति र समय</th>
                <th className="p-3.5">अवस्था (Status)</th>
                <th className="p-3.5 text-right">कार्यहरू</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500 italic">
                    कुनै सेवा बुकिङ रेकर्ड भेटिएन।
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-stone-100">{b.serviceType || b.categoryName}</p>
                      <p className="text-[10px] text-amber-400 font-mono mt-0.5">{b.bookingCode || b.id}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-stone-200">{b.yajamanName}</p>
                      <p className="text-[11px] text-stone-400">📞 {b.yajamanPhone}</p>
                    </td>

                    <td className="p-3.5">
                      {b.providerName ? (
                        <div>
                          <p className="font-bold text-stone-200">{b.providerName}</p>
                          <p className="text-[10px] text-stone-400">{b.providerTitle}</p>
                        </div>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-bold italic">विशेषज्ञ तोक्न बाँकी</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <p className="text-stone-300">{b.appointmentDateBS}</p>
                      <p className="text-[10px] text-stone-400">{b.appointmentTime}</p>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        b.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        b.status.startsWith('CANCELLED') ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        हेर्नुहोस्
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAIL & OVERRIDE MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100">बुकिङ विवरण र ओभरराइड नियन्त्रण</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-stone-400 hover:text-white text-lg">×</button>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5 text-xs">
              <p><strong className="text-stone-400">सेवा:</strong> <span className="text-stone-100 font-bold">{selectedBooking.serviceType || selectedBooking.categoryName}</span></p>
              <p><strong className="text-stone-400">यजमान:</strong> <span className="text-stone-200">{selectedBooking.yajamanName} ({selectedBooking.yajamanPhone})</span></p>
              <p><strong className="text-stone-400">विशेषज्ञ:</strong> <span className="text-amber-300 font-bold">{selectedBooking.providerName || 'अझै तोकिएको छैन'}</span></p>
              <p><strong className="text-stone-400">मिति/समय:</strong> <span className="text-stone-300 font-mono">{selectedBooking.appointmentDateBS} ({selectedBooking.appointmentTime})</span></p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-stone-300 font-bold">अवस्था परिवर्तन (Status Override)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_YAJAMAN', 'IN_PROGRESS'] as BookingStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateBookingStatus(selectedBooking.id, st);
                      setSelectedBooking(null);
                    }}
                    className="py-2 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 rounded-xl text-stone-200 font-bold text-center cursor-pointer transition-colors"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
