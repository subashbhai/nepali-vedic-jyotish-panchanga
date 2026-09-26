import React, { useState, useEffect } from 'react';
import {
  RBACUser,
  RBACAuditLog,
  AccountStatus,
  SystemRole,
  getStoredRBACUsers,
  updateRBACUserStatus,
  getRBACAuditLogs,
  resetRBACUserPassword,
  getRoleLabelNepali,
  logRBACAuditAction,
  saveRBACUsers
} from '../../db/rbacStore';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Hourglass,
  BadgeAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  KeyRound,
  Shield,
  Users,
  Check,
  X,
  Info,
  Phone,
  Mail,
  Building2,
  Calendar
} from 'lucide-react';

interface SuperAdminApprovalCenterProps {
  currentAdminUsername: string;
  onDataChanged?: () => void;
}

export const SuperAdminApprovalCenter: React.FC<SuperAdminApprovalCenterProps> = ({
  currentAdminUsername,
  onDataChanged
}) => {
  const [users, setUsers] = useState<RBACUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<RBACAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all_users' | 'audit_logs'>('pending');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Candidate Details Modal
  const [selectedUser, setSelectedUser] = useState<RBACUser | null>(null);

  // Action Confirmation Modal State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    targetUser: RBACUser | null;
    actionType: 'approve' | 'reject' | 'suspend' | 'activate' | 'reset_pass';
    reasonText: string;
    newPasswordText?: string;
  }>({
    isOpen: false,
    targetUser: null,
    actionType: 'approve',
    reasonText: '',
    newPasswordText: ''
  });

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(getStoredRBACUsers());
    setAuditLogs(getRBACAuditLogs());
    if (onDataChanged) onDataChanged();
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered Users
  const pendingUsers = users.filter(u => u.status === 'pending');

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.customerId && u.customerId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenActionModal = (
    user: RBACUser,
    actionType: 'approve' | 'reject' | 'suspend' | 'activate' | 'reset_pass'
  ) => {
    setActionModal({
      isOpen: true,
      targetUser: user,
      actionType,
      reasonText: '',
      newPasswordText: actionType === 'reset_pass' ? 'Nepal#2081' : ''
    });
  };

  const handleConfirmAction = () => {
    const { targetUser, actionType, reasonText, newPasswordText } = actionModal;
    if (!targetUser) return;

    if ((actionType === 'reject' || actionType === 'suspend') && !reasonText.trim()) {
      alert('कृपया कारण (Reason) लेख्नुहोस्।');
      return;
    }

    if (actionType === 'approve') {
      const res = updateRBACUserStatus(targetUser.id, 'active', currentAdminUsername, reasonText || 'Super Admin Verified');
      showToast(res.message);
    } else if (actionType === 'reject') {
      const res = updateRBACUserStatus(targetUser.id, 'rejected', currentAdminUsername, reasonText);
      showToast(res.message);
    } else if (actionType === 'suspend') {
      const res = updateRBACUserStatus(targetUser.id, 'suspended', currentAdminUsername, reasonText);
      showToast(res.message);
    } else if (actionType === 'activate') {
      const res = updateRBACUserStatus(targetUser.id, 'active', currentAdminUsername, 'Super Admin Reactivated');
      showToast(res.message);
    } else if (actionType === 'reset_pass') {
      if (!newPasswordText || newPasswordText.length < 6) {
        alert('पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।');
        return;
      }
      const res = resetRBACUserPassword(targetUser.phone, newPasswordText, false);
      showToast(res.message);
    }

    setActionModal({ isOpen: false, targetUser: null, actionType: 'approve', reasonText: '' });
    setSelectedUser(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-amber-500 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3.5 py-1 rounded-full text-amber-300 text-xs font-bold border border-amber-500/40 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Governance Center (RBAC Workflow)</span>
          </div>
          <h2 className="text-2xl font-bold font-serif">
            प्रयोगकर्ता प्रमाणीकरण तथा रोल नियन्त्रण केन्द्र
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            POS Staff, Store Admin तथा यजमान प्रयोगकर्ताहरूको Approval, Role-Based Security र Audit Logs नियन्त्रण गर्नुहोस्।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-2xl text-center border border-white/10">
            <span className="text-[10px] text-amber-200 block font-bold">प्रमाणीकरण बाँकी (Pending)</span>
            <span className="text-xl font-black font-mono text-amber-400">{pendingUsers.length} थान</span>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-2xl text-center border border-white/10">
            <span className="text-[10px] text-emerald-200 block font-bold">कुल प्रयोगकर्ता</span>
            <span className="text-xl font-black font-mono text-emerald-400">{users.length} जना</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-2 overflow-x-auto text-xs sm:text-sm font-bold">
        {[
          {
            id: 'pending',
            label: `⏳ प्रमाणीकरणको पर्खाइमा (${pendingUsers.length})`,
            badge: pendingUsers.length > 0
          },
          { id: 'all_users', label: `👥 सम्पूर्ण प्रयोगकर्ता सूची (${users.length})` },
          { id: 'audit_logs', label: `📜 प्रणाली अडिट लग (System Audit Logs)` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#D97706] text-white shadow-md'
                : 'bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-mono font-black rounded-full animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* VIEW 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
              <span>
                <strong>Super Admin Approval Mandate:</strong> POS Staff र Store Admin ले Sign Up गरेपछि यहाँबाट Approve नगरेसम्म उनीहरूले Dashboard access पाउँदैनन्।
              </span>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#231F1C] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm">कुनै पनि प्रमाणीकरण बाँकी छैन</h3>
              <p className="text-xs text-stone-400">सबै प्रयोगकर्ता आवेदनहरूको प्रक्रिया सम्पन्न भइसकेको छ।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(usr => (
                <div
                  key={usr.id}
                  className="bg-white dark:bg-[#231F1C] border-2 border-amber-300 dark:border-amber-800/80 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                          {usr.fullName}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/40">
                          {usr.roleNameNepali}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-500 block mt-0.5">
                        Customer ID: {usr.customerId || 'N/A'}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold rounded-xl animate-pulse">
                      PENDING
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl">
                    <div>
                      <span className="text-stone-400 block text-[10px]">सम्पर्क फोन:</span>
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                        {usr.phone}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px]">इमेल:</span>
                      <span className="font-mono text-stone-800 dark:text-stone-200 truncate block">
                        {usr.email || 'उपलब्ध छैन'}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px]">आवेदन मिति:</span>
                      <span className="text-stone-800 dark:text-stone-200 font-bold">
                        {usr.createdAtBS}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px]">तोकिएको स्टोर:</span>
                      <span className="text-stone-800 dark:text-stone-200 font-bold">
                        {usr.storeAssigned || 'मुख्य स्टोर'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(usr)}
                      className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> विवरण हेर्नुहोस्
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(usr, 'reject')}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> अस्वीकृत (Reject)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(usr, 'approve')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> स्वीकृत (Approve)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: All Users Management Table */}
      {activeTab === 'all_users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#231F1C] p-4 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="नाम, फोन वा Customer ID खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#D97706] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl px-3 py-2 font-bold"
              >
                <option value="all">सबै भूमिका (All Roles)</option>
                <option value="CUSTOMER">यजमान / ग्राहक (Customer)</option>
                <option value="POS_STAFF">POS Staff</option>
                <option value="STORE_ADMIN">Store Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl px-3 py-2 font-bold"
              >
                <option value="all">सबै स्थिति (All Status)</option>
                <option value="active">सक्रिय (Active)</option>
                <option value="pending">प्रमाणीकरण बाँकी (Pending)</option>
                <option value="rejected">अस्वीकृत (Rejected)</option>
                <option value="suspended">निलम्बित (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 text-stone-500 font-bold">
                    <th className="p-3.5">ID / नाम</th>
                    <th className="p-3.5">भूमिका (Role)</th>
                    <th className="p-3.5">सम्पर्क फोन / इमेल</th>
                    <th className="p-3.5">दर्ता मिति</th>
                    <th className="p-3.5">स्थिति (Status)</th>
                    <th className="p-3.5 text-right">कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        कुनै प्रयोगकर्ता भेटिएन।
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            {u.fullName}
                          </div>
                          <div className="font-mono text-[10px] text-[#D97706] font-bold">
                            {u.customerId || u.username}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg text-[11px] font-bold">
                            {u.roleNameNepali}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono">
                          <div>{u.phone}</div>
                          <div className="text-[10px] text-stone-400">{u.email || '-'}</div>
                        </td>

                        <td className="p-3.5 text-stone-600 dark:text-stone-400">
                          {u.createdAtBS}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            u.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            u.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-stone-200 text-stone-800'
                          }`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role !== 'SUPER_ADMIN' && (
                              <>
                                {u.status === 'suspended' || u.status === 'rejected' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenActionModal(u, 'activate')}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700"
                                  >
                                    पुनः सक्रिय
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenActionModal(u, 'suspend')}
                                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700"
                                  >
                                    निलम्बन
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenActionModal(u, 'reset_pass')}
                                  className="px-2.5 py-1 bg-stone-800 text-white rounded-lg text-[11px] font-bold hover:bg-black"
                                >
                                  पासवर्ड
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-[11px] font-bold hover:bg-stone-200"
                            >
                              हेर्नुहोस्
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: System Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100">
              सुरक्षा तथा गतिविधि अडिट लग (Security & Activity Audit Logs)
            </h3>

            <div className="space-y-2 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-stone-400 py-8 text-center">कुनै प्रणाली अडिट लग दर्ता भएको छैन।</p>
              ) : (
                auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#D97706] font-mono">{log.action}</span>
                        <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold rounded">
                          {log.module}
                        </span>
                      </div>
                      <p className="text-stone-800 dark:text-stone-200 mt-1 font-bold">
                        {log.details}
                      </p>
                      <span className="text-[11px] text-stone-500">Target: {log.target}</span>
                    </div>

                    <div className="text-right text-[11px] text-stone-400 shrink-0 font-mono">
                      <div className="font-bold text-stone-700 dark:text-stone-300">{log.username} ({log.role})</div>
                      <div>{log.timestampBS}</div>
                      <div className="text-[10px]">{log.ipDeviceInfo}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Candidate Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl text-stone-800 dark:text-stone-100">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3 border-[#E6E0D5] dark:border-stone-800">
              <div className="p-3 bg-amber-500/20 text-[#D97706] rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">{selectedUser.fullName}</h3>
                <span className="text-xs text-stone-500 font-mono">
                  {selectedUser.roleNameNepali} | ID: {selectedUser.customerId || selectedUser.username}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl space-y-1">
                <div><strong>फोन नम्बर:</strong> {selectedUser.phone}</div>
                <div><strong>इमेल:</strong> {selectedUser.email || 'उपलब्ध छैन'}</div>
                <div><strong>दर्ता मिति:</strong> {selectedUser.createdAtBS}</div>
                <div><strong>वर्तमान स्थिति:</strong> <span className="font-bold text-amber-600">{selectedUser.status.toUpperCase()}</span></div>
                {selectedUser.approvedBy && (
                  <div><strong>स्वीकृतकर्ता (Approved By):</strong> {selectedUser.approvedBy} ({selectedUser.approvedAt})</div>
                )}
                {selectedUser.statusReason && (
                  <div><strong>कैफियत / कारण:</strong> {selectedUser.statusReason}</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl text-xs font-bold"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Action Confirmation */}
      {actionModal.isOpen && actionModal.targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-stone-800 dark:text-stone-100">
            <h3 className="font-bold text-base font-serif flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D97706]" />
              <span>प्रशासकीय निर्णय पुष्टि गर्नुहोस्</span>
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              के तपाईं <strong>{actionModal.targetUser.fullName}</strong> ({actionModal.targetUser.roleNameNepali}) को खातामा निम्न कार्य गर्न निश्चित हुनुहुन्छ?
            </p>

            {(actionModal.actionType === 'reject' || actionModal.actionType === 'suspend') && (
              <div>
                <label className="text-xs font-bold block mb-1">
                  कारण / कैफियत (Reason Mandatory): *
                </label>
                <textarea
                  value={actionModal.reasonText}
                  onChange={e => setActionModal({ ...actionModal, reasonText: e.target.value })}
                  placeholder="यहाँ कारण लेख्नुहोस्..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border rounded-xl outline-none"
                  required
                />
              </div>
            )}

            {actionModal.actionType === 'reset_pass' && (
              <div>
                <label className="text-xs font-bold block mb-1">
                  नयाँ पासवर्ड राख्नुहोस्: *
                </label>
                <input
                  type="text"
                  value={actionModal.newPasswordText}
                  onChange={e => setActionModal({ ...actionModal, newPasswordText: e.target.value })}
                  className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border rounded-xl font-mono"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold shadow"
              >
                पुष्टि गर्नुहोस् (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
