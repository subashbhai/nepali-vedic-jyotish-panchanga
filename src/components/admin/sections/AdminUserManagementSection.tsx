import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  BadgeCheck
} from 'lucide-react';
import { RBACUser, SystemRole, AccountStatus, getRoleLabelNepali } from '../../../db/rbacStore';

interface AdminUserManagementSectionProps {
  users: RBACUser[];
  onUpdateUserStatus: (userId: string, newStatus: AccountStatus, reason?: string) => void;
  onChangeUserRole: (userId: string, newRole: SystemRole) => void;
  onResetUserPassword: (userId: string) => void;
  onAddNewUser: (data: any) => void;
  onRefresh: () => void;
}

export const AdminUserManagementSection: React.FC<AdminUserManagementSectionProps> = ({
  users,
  onUpdateUserStatus,
  onChangeUserRole,
  onResetUserPassword,
  onAddNewUser,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<RBACUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'CUSTOMER' as SystemRole,
    storeAssigned: ''
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.customerId && u.customerId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.phone || !newUserForm.password) {
      alert('कृपया आवश्यक विवरणहरू भरुहोस्।');
      return;
    }
    onAddNewUser(newUserForm);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      fullName: '',
      phone: '',
      email: '',
      password: '',
      role: 'CUSTOMER',
      storeAssigned: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>प्रयोगकर्ता व्यवस्थापन निर्देशिका (User Directory & Account Control)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            प्रणालीका सम्पूर्ण यजमान, विशेषज्ञ, POS कर्मचारी, Store Admin र Admin खाताहरूको नियन्त्रण।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नयाँ प्रयोगकर्ता थप्नुहोस्</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 text-xs transition-all cursor-pointer"
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="नाम, फोन नम्बर वा ID बाट खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-stone-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="all">सबै भूमिकाहरू (All Roles)</option>
            <option value="CUSTOMER">यजमान / ग्राहक (Customer)</option>
            <option value="POS_STAFF">POS Staff / काउन्टर</option>
            <option value="STORE_ADMIN">Store Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="all">सबै खाता अवस्था (All Status)</option>
            <option value="active">सक्रिय (Active)</option>
            <option value="pending">स्वीकृति बाँकी (Pending)</option>
            <option value="suspended">निलम्बित (Suspended)</option>
            <option value="rejected">अस्वीकृत (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">ID / प्रयोगकर्ता</th>
                <th className="p-3.5">सम्पर्क / इमेल</th>
                <th className="p-3.5">भूमिका (Role)</th>
                <th className="p-3.5">दर्ता मिति</th>
                <th className="p-3.5">अवस्था (Status)</th>
                <th className="p-3.5 text-right">कार्यहरू (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500 italic">
                    कुनै प्रयोगकर्ता भेटिएन।
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-100 flex items-center gap-1.5">
                        {u.role === 'SUPER_ADMIN' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                        <span>{u.fullName}</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                        {u.customerId || u.username}
                      </span>
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-300">
                        <Phone className="w-3 h-3 text-stone-500" />
                        <span>{u.phone}</span>
                      </div>
                      {u.email && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-400">
                          <Mail className="w-3 h-3 text-stone-500" />
                          <span>{u.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-800 border border-stone-700 text-amber-300">
                        {u.roleNameNepali || getRoleLabelNepali(u.role)}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-stone-400 font-mono">
                      {u.createdAtBS}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        u.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-400' :
                          u.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {u.status === 'active' ? 'सक्रिय' : u.status === 'pending' ? 'स्वीकृति बाँकी' : 'निलम्बित'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="विवरण हेर्नुहोस्"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        विवरण
                      </button>

                      {u.status === 'pending' && (
                        <button
                          onClick={() => onUpdateUserStatus(u.id, 'active')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          स्वीकृत
                        </button>
                      )}

                      {u.status === 'active' ? (
                        <button
                          onClick={() => onUpdateUserStatus(u.id, 'suspended', 'Admin suspended account')}
                          className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-[11px] font-bold border border-rose-700 transition-colors cursor-pointer"
                        >
                          निलम्बन
                        </button>
                      ) : u.status === 'suspended' ? (
                        <button
                          onClick={() => onUpdateUserStatus(u.id, 'active')}
                          className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-lg text-[11px] font-bold border border-emerald-700 transition-colors cursor-pointer"
                        >
                          पुनःसक्रिय
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100">प्रयोगकर्ता प्रोफाइल विवरण</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1.5">
                <p><strong className="text-stone-400">पुरा नाम:</strong> <span className="text-stone-100 font-bold">{selectedUser.fullName}</span></p>
                <p><strong className="text-stone-400">ID:</strong> <span className="text-amber-400 font-mono">{selectedUser.customerId || selectedUser.id}</span></p>
                <p><strong className="text-stone-400">मोबाइल / प्रयोगकर्ता नाम:</strong> <span className="text-stone-200">{selectedUser.phone}</span></p>
                <p><strong className="text-stone-400">इमेल:</strong> <span className="text-stone-200">{selectedUser.email || 'उपलब्ध छैन'}</span></p>
                <p><strong className="text-stone-400">भूमिका:</strong> <span className="text-amber-300 font-bold">{selectedUser.roleNameNepali}</span></p>
                <p><strong className="text-stone-400">दर्ता मिति:</strong> <span className="text-stone-300 font-mono">{selectedUser.createdAtBS}</span></p>
              </div>

              {/* Password Reset Action */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-200">पासवर्ड रिसेट गर्नुहोस्</p>
                  <p className="text-[11px] text-stone-400">नयाँ सुरक्षित अस्थायी पासकोड पठाउनुहोस्।</p>
                </div>
                <button
                  onClick={() => {
                    onResetUserPassword(selectedUser.id);
                    alert('पासवर्ड सफलतापूर्व रिसेट गरियो!');
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  पासवर्ड रिसेट
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>नयाँ प्रयोगकर्ता/कर्मचारी सिर्जना</span>
              </h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="text-stone-400 hover:text-white text-lg">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">पुरा नाम *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="रामप्रसाद शर्मा"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">मोबाइल नम्बर *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="9841000000"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">इमेल (ऐच्छिक)</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">प्रारम्भिक पासवर्ड *</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">भूमिका (Role)</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as SystemRole })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="CUSTOMER">यजमान / ग्राहक (Customer)</option>
                  <option value="POS_STAFF">POS Staff / काउन्टर</option>
                  <option value="STORE_ADMIN">Store Admin</option>
                  <option value="SUPER_ADMIN">Super Admin (उच्च सुरक्षा अनुमति)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-bold">रद्द गर्नुहोस्</button>
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors">खाता सिर्जना गर्नुहोस्</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
