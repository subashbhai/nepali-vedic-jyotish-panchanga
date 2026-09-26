import React, { useState } from 'react';
import { UserCheck, Search, Eye, Calendar, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { RBACUser } from '../../../db/rbacStore';
import { Booking } from '../../../types/yajamanTypes';
import { formatNPRCurrency } from '../../../db/subscriptionStore';

interface AdminYajamanSectionProps {
  users: RBACUser[];
  bookings: Booking[];
  onRefresh: () => void;
}

export const AdminYajamanSection: React.FC<AdminYajamanSectionProps> = ({ users, bookings, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYajaman, setSelectedYajaman] = useState<RBACUser | null>(null);

  const yajamanList = users.filter(u => u.role === 'CUSTOMER' && (
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  ));

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <span>यजमान तथा ग्राहक व्यवस्थापन (Yajaman Management)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">प्रणालीमा दर्ता भएका यजमानहरूको प्रोफाइल, बुकिङ इतिहास र भुक्तानी विवरण।</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
        <input
          type="text"
          placeholder="यजमानको नाम वा मोबाइलबाट खोज्नुहोस्..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
        />
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">यजमानको नाम</th>
                <th className="p-3.5">सम्पर्क नम्बर</th>
                <th className="p-3.5">दर्ता मिति</th>
                <th className="p-3.5">खाता स्थिति</th>
                <th className="p-3.5 text-right">कार्यहरू</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {yajamanList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 italic">कुनै यजमान भेटिएन।</td>
                </tr>
              ) : (
                yajamanList.map(y => (
                  <tr key={y.id} className="hover:bg-stone-800/40">
                    <td className="p-3.5 font-bold text-stone-100">{y.fullName}</td>
                    <td className="p-3.5 font-mono text-stone-300">📞 {y.phone}</td>
                    <td className="p-3.5 font-mono text-stone-400">{y.createdAtBS}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                        {y.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedYajaman(y)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-bold"
                      >
                        इतिहास
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
