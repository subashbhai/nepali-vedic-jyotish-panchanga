import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Filter, 
  Search, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { YajamanPost, YajamanReport, YajamanAuditLog, ServiceProvider } from '../../types/yajamanTypes';
import { 
  getStoredYajamanPosts, 
  saveYajamanPosts, 
  getStoredYajamanReports, 
  saveYajamanReports, 
  getStoredYajamanAuditLogs,
  logYajamanAction,
  getStoredServiceProviders,
  saveServiceProviders
} from '../../db/yajamanStore';

interface YajamanAdminModerationPanelProps {
  currentUserId: string;
  currentUserName: string;
  onRefreshData?: () => void;
}

export const YajamanAdminModerationPanel: React.FC<YajamanAdminModerationPanelProps> = ({
  currentUserId,
  currentUserName,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'POSTS' | 'REPORTS' | 'VERIFICATIONS' | 'AUDIT'>('POSTS');
  const [posts, setPosts] = useState<YajamanPost[]>(() => getStoredYajamanPosts());
  const [reports, setReports] = useState<YajamanReport[]>(() => getStoredYajamanReports());
  const [providers, setProviders] = useState<ServiceProvider[]>(() => getStoredServiceProviders());
  const [auditLogs, setAuditLogs] = useState<YajamanAuditLog[]>(() => getStoredYajamanAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');

  const reloadAll = () => {
    setPosts(getStoredYajamanPosts());
    setReports(getStoredYajamanReports());
    setProviders(getStoredServiceProviders());
    setAuditLogs(getStoredYajamanAuditLogs());
    if (onRefreshData) onRefreshData();
  };

  // Post Actions
  const handleApprovePost = (postId: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, status: 'APPROVED' as const } : p);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction(currentUserId, currentUserName, 'APPROVE_POST', 'POST', postId, 'पोस्ट स्वीकृत गरियो');
    reloadAll();
  };

  const handleRejectPost = (postId: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, status: 'REJECTED' as const } : p);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction(currentUserId, currentUserName, 'REJECT_POST', 'POST', postId, 'पोस्ट अस्वीकृत गरियो');
    reloadAll();
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('के तपाईं यो पोस्ट पूर्ण रूपमा मेटाउन चाहनुहुन्छ?')) return;
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction(currentUserId, currentUserName, 'DELETE_POST', 'POST', postId, 'पोस्ट हटाइयो');
    reloadAll();
  };

  // Report Actions
  const handleResolveReport = (reportId: string, actionNote: string) => {
    const updated = reports.map(r => r.id === reportId ? { 
      ...r, 
      status: 'RESOLVED' as const, 
      resolvedBy: currentUserName, 
      actionTaken: actionNote 
    } : r);
    setReports(updated);
    saveYajamanReports(updated);
    logYajamanAction(currentUserId, currentUserName, 'RESOLVE_REPORT', 'POST', reportId, actionNote);
    reloadAll();
  };

  const handleDismissReport = (reportId: string) => {
    const updated = reports.map(r => r.id === reportId ? { 
      ...r, 
      status: 'DISMISSED' as const, 
      resolvedBy: currentUserName, 
      actionTaken: 'उजुरी खारेज गरियो' 
    } : r);
    setReports(updated);
    saveYajamanReports(updated);
    logYajamanAction(currentUserId, currentUserName, 'DISMISS_REPORT', 'POST', reportId, 'उजुरी खारेज गरियो');
    reloadAll();
  };

  // Verification Actions
  const handleToggleVerification = (providerId: string, currentStatus: boolean) => {
    const updated = providers.map(p => p.id === providerId ? { ...p, isVerified: !currentStatus } : p);
    setProviders(updated);
    saveServiceProviders(updated);
    logYajamanAction(
      currentUserId, 
      currentUserName, 
      !currentStatus ? 'VERIFY_PROVIDER' : 'UNVERIFY_PROVIDER', 
      'VERIFICATION', 
      providerId, 
      !currentStatus ? 'प्रमाणित ब्याज प्रदान गरियो' : 'प्रमाणित ब्याज हटाइयो'
    );
    reloadAll();
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-amber-200 dark:border-stone-700 shadow-xl p-5 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-[#7A1C1C] dark:text-amber-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              यजमान तथा पुरोहित नियन्त्रण केन्द्र (Admin Moderation)
            </h2>
            <p className="text-xs text-stone-500">
              सामुदायिक पोस्टहरू, उजुरी (Reports), प्रमाणिकरण (Verification) र अडिट लग व्यवस्थापन
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reloadAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>रिफ्रेस गर्नुहोस्</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab('POSTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'POSTS'
              ? 'bg-[#7A1C1C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          पोस्टहरू ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'REPORTS'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>उजुरीहरू (Reports)</span>
          {reports.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {reports.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VERIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'VERIFICATIONS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          सेवा प्रदायक प्रमाणिकरण ({providers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-stone-800 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          अडिट लग (Audit Logs)
        </button>
      </div>

      {/* TAB 1: POSTS MODERATION */}
      {activeTab === 'POSTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {post.authorName}
                    </span>
                    <span className="bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {post.categoryNameNepali}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      post.status === 'APPROVED' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : post.status === 'REJECTED' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {post.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    {post.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {post.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprovePost(post.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>स्वीकृत</span>
                    </button>
                  )}
                  {post.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => handleRejectPost(post.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>अस्वीकृत</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs transition-colors cursor-pointer"
                    title="मेटाउनुहोस्"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS MODERATION */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              कुनै पनि उजुरी वा रिपोर्ट दर्ता भएको छैन।
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div 
                  key={rep.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {rep.category}
                      </span>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {rep.targetTitleOrName}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400">वि.सं. {rep.createdAtBS}</span>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    <strong>उजुरीकर्ता:</strong> {rep.reporterName} • <strong>कारण:</strong> {rep.reason}
                  </p>
                  {rep.details && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                      "{rep.details}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-900/40">
                    <span className="text-[11px] text-stone-500">
                      स्थिति: <strong>{rep.status}</strong> {rep.actionTaken && `(${rep.actionTaken})`}
                    </span>
                    {rep.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolveReport(rep.id, 'सामग्री प्रमाणीकरण गरी सम्बोधन गरियो')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          सम्बोधन भयो
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissReport(rep.id)}
                          className="px-3 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          खारेज
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFICATIONS */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-3">
          {providers.map((prov) => (
            <div 
              key={prov.id}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={prov.photoUrl} 
                  alt={prov.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-300" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {prov.fullName}
                    </h4>
                    {prov.isVerified && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        प्रमाणित
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {prov.title} • {prov.district} • फोन: {prov.mobile}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleVerification(prov.id, prov.isVerified)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  prov.isVerified
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {prov.isVerified ? 'प्रमाणिकरण हटाउनुहोस्' : 'प्रमाणित ब्याज दिनुहोस्'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">अडिट लग खाली छ।</p>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-stone-900 dark:text-stone-100">{log.actorName}</strong>
                    <span className="text-stone-500 ml-1">({log.action})</span>
                    <p className="text-stone-600 dark:text-stone-400 text-[11px]">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">वि.सं. {log.timestampBS}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
